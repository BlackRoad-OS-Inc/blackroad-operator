#!/bin/bash
# PostgreSQL Database Backup Script
# Usage: ./backup-database.sh [database_name]

set -euo pipefail

# Configuration from environment or defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${1:-${DB_NAME:-prism_console}}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/postgresql}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "Starting backup of database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"

# Perform backup with compression
PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=plain \
  --no-owner \
  --no-privileges \
  | gzip > "$BACKUP_FILE"

# Verify backup was created
if [ -f "$BACKUP_FILE" ]; then
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "Backup completed successfully: $BACKUP_FILE ($BACKUP_SIZE)"
else
  echo "ERROR: Backup failed - file not created"
  exit 1
fi

# Clean up old backups (older than RETENTION_DAYS)
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -type f -mtime +"$RETENTION_DAYS" -delete

# List current backups
echo "Current backups:"
ls -lh "$BACKUP_DIR/${DB_NAME}_"*.sql.gz 2>/dev/null || echo "No backups found"

echo "Backup process completed"
