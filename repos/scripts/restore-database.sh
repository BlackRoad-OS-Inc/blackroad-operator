#!/bin/bash
# PostgreSQL Database Restore Script
# Usage: ./restore-database.sh <backup_file> [database_name]

set -euo pipefail

# Check arguments
if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup_file> [database_name]"
  echo "Example: $0 /var/backups/postgresql/prism_console_20250112_120000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"
DB_NAME="${2:-${DB_NAME:-prism_console}}"

# Configuration from environment or defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "WARNING: This will OVERWRITE the database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled"
  exit 0
fi

echo "Starting restore of database: $DB_NAME"

# Drop and recreate database (optional, comment out if not needed)
# PGPASSWORD="${DB_PASSWORD}" dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" || true
# PGPASSWORD="${DB_PASSWORD}" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"

# Restore from backup
gunzip -c "$BACKUP_FILE" | PGPASSWORD="${DB_PASSWORD}" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -q

echo "Restore completed successfully"
