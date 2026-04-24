#!/bin/sh
set -e

mkdir -p backups
mkdir -p uploads

echo "Creating database backup..."
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' > backups/db_backup.sql
echo "Backup saved to backups/db_backup.sql"

echo "Creating uploads backup..."
tar -czf backups/uploads_backup.tar.gz uploads
echo "Uploads backup saved to backups/uploads_backup.tar.gz"