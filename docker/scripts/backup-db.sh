#!/bin/sh
set -e

mkdir -p backups

echo "Creating database backup..."
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' > backups/db_backup.sql
echo "Backup saved to backups/db_backup.sql"