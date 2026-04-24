#!/bin/sh
set -e

if [ ! -f backups/db_backup.sql ]; then
	echo "Error: backups/db_backup.sql not found."
	exit 1
fi

if [ ! -f backups/uploads_backup.tar.gz ]; then
	echo "Error: backups/uploads_backup.tar.gz not found."
	exit 1
fi

mkdir -p uploads

echo "Starting database service..."
docker compose up -d db

echo "Waiting for database to become ready..."
attempt=0
max_attempts=60
until docker compose exec -T db sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' >/dev/null 2>&1
do
	attempt=$((attempt + 1))
	if [ "$attempt" -ge "$max_attempts" ]; then
		echo "Error: database is not ready after ${max_attempts} seconds."
		exit 1
	fi
	sleep 1
done

echo "Resetting database schema before restore..."
docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP SCHEMA IF EXISTS app CASCADE; CREATE SCHEMA app;"'

echo "Restoring database backup..."
cat backups/db_backup.sql | docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'

echo "Restoring uploads backup..."
rm -rf uploads/*
tar -xzf backups/uploads_backup.tar.gz

echo "Restore complete (database + uploads)."