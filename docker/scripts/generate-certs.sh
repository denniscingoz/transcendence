#!/bin/sh
set -e

CERTS_DIR="docker/nginx/certs"

CA_KEY="$CERTS_DIR/dev-ca.key"
CA_CRT="$CERTS_DIR/dev-ca.crt"

KEY="$CERTS_DIR/dev.key"
CRT="$CERTS_DIR/dev.crt"
CSR="$CERTS_DIR/dev.csr"
EXT="$CERTS_DIR/localhost.ext"

CERT_C="${CERT_C:-AT}"
CERT_ST="${CERT_ST:-Vienna}"
CERT_L="${CERT_L:-Vienna}"
CERT_O="${CERT_O:-42Vienna}"
CERT_OU="${CERT_OU:-Transcendence Dev}"
CERT_CN="${CERT_CN:-localhost}"

mkdir -p "$CERTS_DIR"

if [ ! -f "$CA_KEY" ] || [ ! -f "$CA_CRT" ]; then
	echo "Generating local development CA..."

	openssl genrsa -out "$CA_KEY" 4096

	openssl req -x509 -new -nodes \
		-key "$CA_KEY" \
		-sha256 \
		-days 3650 \
		-out "$CA_CRT" \
		-subj "/C=$CERT_C/ST=$CERT_ST/L=$CERT_L/O=$CERT_O/OU=$CERT_OU/CN=Transcendence Local Dev CA" \
		-addext "basicConstraints=critical,CA:TRUE,pathlen:0" \
		-addext "keyUsage=critical,keyCertSign,cRLSign" \
		-addext "subjectKeyIdentifier=hash"
else
	echo "Local development CA already exists."
fi

if [ ! -f "$KEY" ] || [ ! -f "$CRT" ]; then
	echo "Generating localhost server certificate..."

	openssl genrsa -out "$KEY" 2048

	openssl req -new \
		-key "$KEY" \
		-out "$CSR" \
		-subj "/C=$CERT_C/ST=$CERT_ST/L=$CERT_L/O=$CERT_O/OU=$CERT_OU/CN=$CERT_CN"

	cat > "$EXT" <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=@alt_names

[alt_names]
DNS.1=localhost
IP.1=127.0.0.1
EOF

	openssl x509 -req \
		-in "$CSR" \
		-CA "$CA_CRT" \
		-CAkey "$CA_KEY" \
		-CAcreateserial \
		-out "$CRT" \
		-days 825 \
		-sha256 \
		-extfile "$EXT"

	rm -f "$CSR" "$EXT"

	echo "Server certificate generated in $CERTS_DIR"
else
	echo "Server certificate already exists."
fi

echo "Import this certificate into the browser/Windows trust store:"
echo "$CA_CRT"