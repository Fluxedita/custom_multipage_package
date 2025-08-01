#!/bin/bash

# Configuration
DB_NAME="your_database_name"
DB_USER="your_database_user"
DB_HOST="your_database_host"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Run pg_dump to create the backup
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -F p -f "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully: $BACKUP_FILE"
else
  echo "Backup failed!"
  exit 1
fi 