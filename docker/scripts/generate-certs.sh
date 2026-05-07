#!/bin/sh
set -e

CERTS_DIR="docker/nginx/certs"
KEY="$CERTS_DIR/dev.key"
CRT="$CERTS_DIR/dev.crt"

mkdir -p "$CERTS_DIR"

if [ ! -f "$KEY" ] || [ ! -f "$CRT" ]; then
	echo "Generating self-signed certificate..."
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout "$KEY" \
		-out "$CRT" \
		-subj "/CN=localhost"
	echo "Certificate generated in $CERTS_DIR"
else
	echo "Certificate already exists."
fi