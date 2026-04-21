#!/bin/sh
set -e

if [ ! -f backups/db_backup.sql ]; then
	echo "Error: backups/db_backup.sql not found."
	exit 1
fi

echo "Restoring database backup..."
cat backups/db_backup.sql | docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
echo "Restore complete."