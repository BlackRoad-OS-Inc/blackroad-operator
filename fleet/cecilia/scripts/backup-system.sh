#!/bin/bash
# [BACKUP] System - Backup tracking for BlackRoad
# Usage: ~/backup-system.sh <command> [args]

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
YELLOW='\033[38;5;226m'
RESET='\033[0m'

BACKUP_DB="$HOME/.blackroad/backup.db"

init_backup() {
    mkdir -p "$HOME/.blackroad"
    sqlite3 "$BACKUP_DB" <<EOF
CREATE TABLE IF NOT EXISTS backup_targets (
    name TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    source_path TEXT,
    destination TEXT,
    schedule TEXT DEFAULT 'daily',
    retention_days INTEGER DEFAULT 30,
    compression TEXT DEFAULT 'gzip',
    last_backup TEXT,
    last_size_bytes INTEGER,
    enabled INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    size_bytes INTEGER,
    duration_seconds INTEGER,
    checksum TEXT,
    location TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT
);

CREATE TABLE IF NOT EXISTS restores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    backup_id INTEGER,
    target TEXT,
    status TEXT,
    restored_at TEXT DEFAULT CURRENT_TIMESTAMP
);
EOF
    echo -e "${GREEN}[BACKUP]${RESET} System initialized"
}

# Add backup target
add() {
    local name="$1"
    local type="$2"
    local source="$3"
    local dest="$4"
    local schedule="${5:-daily}"

    sqlite3 "$BACKUP_DB" "INSERT OR REPLACE INTO backup_targets (name, type, source_path, destination, schedule) VALUES ('$name', '$type', '$source', '$dest', '$schedule');"
    echo -e "${GREEN}[BACKUP]${RESET} Added target: $name ($type, $schedule)"
}

# Record a backup
record() {
    local target="$1"
    local size="$2"
    local duration="$3"
    local location="$4"
    local checksum="${5:-}"

    local retention=$(sqlite3 "$BACKUP_DB" "SELECT retention_days FROM backup_targets WHERE name='$target';")
    retention=${retention:-30}

    sqlite3 "$BACKUP_DB" "INSERT INTO backups (target, status, size_bytes, duration_seconds, location, checksum, expires_at) VALUES ('$target', 'completed', $size, $duration, '$location', '$checksum', datetime('now', '+$retention days'));"
    sqlite3 "$BACKUP_DB" "UPDATE backup_targets SET last_backup=datetime('now'), last_size_bytes=$size WHERE name='$target';"

    local id=$(sqlite3 "$BACKUP_DB" "SELECT last_insert_rowid();")
    echo -e "${GREEN}[BACKUP]${RESET} Recorded: $target #$id ($(numfmt --to=iec $size 2>/dev/null || echo "${size}B"))"
}

# List targets
targets() {
    echo -e "${AMBER}[BACKUP]${RESET} Backup Targets"
    echo ""
    sqlite3 -column -header "$BACKUP_DB" "SELECT name, type, schedule, last_backup, enabled FROM backup_targets ORDER BY name;"
}

# List backups
list() {
    local target="${1:-}"
    echo -e "${AMBER}[BACKUP]${RESET} Backups"
    echo ""
    if [[ -n "$target" ]]; then
        sqlite3 -column -header "$BACKUP_DB" "SELECT id, status, size_bytes, duration_seconds, created_at FROM backups WHERE target='$target' ORDER BY created_at DESC LIMIT 20;"
    else
        sqlite3 -column -header "$BACKUP_DB" "SELECT id, target, status, size_bytes, created_at FROM backups ORDER BY created_at DESC LIMIT 30;"
    fi
}

# Get latest backup
latest() {
    local target="$1"
    sqlite3 -column -header "$BACKUP_DB" "SELECT * FROM backups WHERE target='$target' ORDER BY created_at DESC LIMIT 1;"
}

# Record restore
restore() {
    local backup_id="$1"
    local status="${2:-completed}"

    local target=$(sqlite3 "$BACKUP_DB" "SELECT target FROM backups WHERE id=$backup_id;")
    sqlite3 "$BACKUP_DB" "INSERT INTO restores (backup_id, target, status) VALUES ($backup_id, '$target', '$status');"
    echo -e "${GREEN}[BACKUP]${RESET} Restore recorded: backup #$backup_id"
}

# Check expired
expired() {
    echo -e "${YELLOW}[BACKUP]${RESET} Expired Backups"
    echo ""
    sqlite3 -column -header "$BACKUP_DB" "SELECT id, target, created_at, expires_at FROM backups WHERE expires_at < datetime('now') ORDER BY expires_at;"
}

# Prune expired
prune() {
    local count=$(sqlite3 "$BACKUP_DB" "SELECT COUNT(*) FROM backups WHERE expires_at < datetime('now');")
    sqlite3 "$BACKUP_DB" "DELETE FROM backups WHERE expires_at < datetime('now');"
    echo -e "${GREEN}[BACKUP]${RESET} Pruned $count expired backups"
}

# Check overdue
overdue() {
    echo -e "${YELLOW}[BACKUP]${RESET} Overdue Backups"
    echo ""
    sqlite3 -column -header "$BACKUP_DB" "SELECT name, schedule, last_backup FROM backup_targets WHERE enabled=1 AND (last_backup IS NULL OR (schedule='daily' AND last_backup < datetime('now', '-1 day')) OR (schedule='hourly' AND last_backup < datetime('now', '-1 hour')) OR (schedule='weekly' AND last_backup < datetime('now', '-7 days')));"
}

# Stats
stats() {
    echo -e "${PINK}╔══════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}       ${AMBER}[BACKUP] System Stats${RESET}        ${PINK}║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════╝${RESET}"
    echo ""

    local targets=$(sqlite3 "$BACKUP_DB" "SELECT COUNT(*) FROM backup_targets;")
    local total=$(sqlite3 "$BACKUP_DB" "SELECT COUNT(*) FROM backups;")
    local completed=$(sqlite3 "$BACKUP_DB" "SELECT COUNT(*) FROM backups WHERE status='completed';")
    local total_size=$(sqlite3 "$BACKUP_DB" "SELECT SUM(size_bytes) FROM backups WHERE status='completed';")
    local restores=$(sqlite3 "$BACKUP_DB" "SELECT COUNT(*) FROM restores;")

    echo -e "  ${GREEN}Targets:${RESET}      $targets"
    echo -e "  ${GREEN}Total Backups:${RESET} $total"
    echo -e "  ${GREEN}Completed:${RESET}    $completed"
    echo -e "  ${GREEN}Total Size:${RESET}   $(numfmt --to=iec ${total_size:-0} 2>/dev/null || echo "${total_size:-0}B")"
    echo -e "  ${GREEN}Restores:${RESET}     $restores"
    echo ""
    echo -e "${BLUE}By Schedule:${RESET}"
    sqlite3 -column "$BACKUP_DB" "SELECT schedule, COUNT(*) as count FROM backup_targets GROUP BY schedule ORDER BY count DESC;"
}

show_help() {
    echo -e "${PINK}[BACKUP]${RESET} - BlackRoad Backup System"
    echo ""
    echo "Usage: ~/backup-system.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  init                                     Initialize system"
    echo "  add <name> <type> <src> <dest> [sched]   Add target"
    echo "  record <target> <size> <dur> <loc>       Record backup"
    echo "  targets                                  List targets"
    echo "  list [target]                            List backups"
    echo "  latest <target>                          Get latest"
    echo "  restore <id> [status]                    Record restore"
    echo "  expired                                  List expired"
    echo "  prune                                    Delete expired"
    echo "  overdue                                  Check overdue"
    echo "  stats                                    Show statistics"
}

case "${1:-help}" in
    init)    init_backup ;;
    add)     add "$2" "$3" "$4" "$5" "$6" ;;
    record)  record "$2" "$3" "$4" "$5" "$6" ;;
    targets) targets ;;
    list)    list "$2" ;;
    latest)  latest "$2" ;;
    restore) restore "$2" "$3" ;;
    expired) expired ;;
    prune)   prune ;;
    overdue) overdue ;;
    stats)   stats ;;
    help|*)  show_help ;;
esac
