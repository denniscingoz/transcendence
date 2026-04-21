COMPOSE = docker compose

.PHONY: all up down build clean fclean re env certs backup-db restore-db

all: up

up: env certs
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

build: env certs
	$(COMPOSE) build

clean:
	$(COMPOSE) down --remove-orphans

fclean:
	$(COMPOSE) down -v --remove-orphans
	rm -f docker/nginx/certs/dev.crt docker/nginx/certs/dev.key

re: clean up #not fclean to keep db

env:
	sh docker/scripts/check-env.sh

certs:
	sh docker/scripts/generate-certs.sh

backup-db:
	sh docker/scripts/backup-db.sh

restore-db:
	sh docker/scripts/restore-db.sh
