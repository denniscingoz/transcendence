COMPOSE = docker compose

.PHONY: all up down build clean fclean re env certs backup-db restore-db db-up app-up restore-up

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
	$(COMPOSE) down -v --remove-orphans --rmi all
#	docker system prune -a -v -f
	docker network prune -f
	rm -f docker/nginx/certs/dev.crt docker/nginx/certs/dev.key
	rm -rf uploads/*
	mkdir -p uploads

re: clean up #not fclean to keep db

env:
	sh docker/scripts/check-env.sh

certs:
	sh docker/scripts/generate-certs.sh

backup-db:
	sh docker/scripts/backup-db.sh

restore-db:
	sh docker/scripts/restore-db.sh

db-up: env
	$(COMPOSE) up -d db

app-up: env certs
	$(COMPOSE) up --build -d api nginx

restore-up: env certs db-up restore-db
	$(COMPOSE) up --build -d api nginx
