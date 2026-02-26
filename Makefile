.DEFAULT_GOAL := up

COMPOSE = docker compose
CERT_DIR = docker/nginx/certs
ENV_FILE = .env

.PHONY: up down logs ps reset env cert

env:
	@if [ ! -f $(ENV_FILE) ]; then cp .env.example .env; echo "Created .env from .env.example (edit secrets in .env)"; fi

cert:
	@mkdir -p $(CERT_DIR)
	@if [ ! -f $(CERT_DIR)/dev.crt ] || [ ! -f $(CERT_DIR)/dev.key ]; then \
		echo "Generating self-signed TLS cert for localhost..."; \
		openssl req -x509 -nodes -newkey rsa:2048 \
			-keyout $(CERT_DIR)/dev.key \
			-out $(CERT_DIR)/dev.crt \
			-days 365 \
			-subj "/CN=localhost" >/dev/null 2>&1; \
		echo "Cert generated in $(CERT_DIR)/"; \
	fi

up: env cert
	@$(COMPOSE) up --build

down:
	@$(COMPOSE) down

logs:
	@$(COMPOSE) logs -f --tail=200

ps:
	@$(COMPOSE) ps

reset:
	@$(COMPOSE) down -v
