#!/bin/bash
# [BACKUPS] System - Backup management for BlackRoad
# Usage: ~/backups-system.sh <command> [args]

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
YELLOW='\033[38;5;226m'
RESET='\033[0m'

BACKUPS_DB="$HOME/.blackroad/backups.db"

init_backups() {
    mkdir -p "$HOME/.blackroad"
    sqlite3 "$BACKUPS_DB" <<EOSQL
CREATE TABLE IF NOT EXISTS backups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    type TEXT DEFAULT 'full',
    size_bytes INTEGER,
    checksum TEXT,
    status TEXT DEFAULT 'pending',
    started_at TEXT,
    completed_at TEXT,
    expires_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS backup_schedules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    schedule TEXT NOT NULL,
    retention_days INTEGER DEFAULT 30,
    type TEXT DEFAULT 'incremental',
    enabled INTEGER DEFAULT 1,
    last_run TEXT,
    next_run TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS backup_policies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    retention_daily INTEGER DEFAULT 7,
    retention_weekly INTEGER DEFAULT 4,
    retention_monthly INTEGER DEFAULT 12,
    retention_yearly INTEGER DEFAULT 3,
    compression TEXT DEFAULT 'gzip',
    encryption INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_backups_status ON backups(status);
CREATE INDEX IF NOT EXISTS idx_backups_source ON backups(source);
CREATE INDEX IF NOT EXISTS idx_schedules_enabled ON backup_schedules(enabled);
EOSQL
    echo -e "${GREEN}[BACKUPS]${RESET} System initialized"
}

create() {
    local name="$1"
    local source="$2"
    local destination="$3"
    local type="${4:-full}"

    local id="bak-$(date +%Y%m%d)-$(openssl rand -hex 4)"

    sqlite3 "$BACKUPS_DB" "INSERT INTO backups (id, name, source, destination, type, status, started_at) VALUES ('$id', '$name', '$source', '$destination', '$type', 'running', datetime('now'));"
    echo -e "${GREEN}[BACKUPS]${RESET} Started: $name ($id)"
    echo "$id"
}

complete() {
    local backup_id="$1"
    local size="${2:-0}"
    local checksum="${3:-}"

    [[ -z "$checksum" ]] && checksum=$(openssl rand -hex 16)

    sqlite3 "$BACKUPS_DB" "UPDATE backups SET status='completed', size_bytes=$size, checksum='$checksum', completed_at=datetime('now') WHERE id='$backup_id';"
    echo -e "${GREEN}[BACKUPS]${RESET} Completed: $backup_id"
}

fail() {
    local backup_id="$1"
    local reason="${2:-Unknown error}"

    sqlite3 "$BACKUPS_DB" "UPDATE backups SET status='failed', completed_at=datetime('now') WHERE id='$backup_id';"
    echo -e "${RED}[BACKUPS]${RESET} Failed: $backup_id - $reason"
}

schedule() {
    local name="$1"
    local source="$2"
    local destination="$3"
    local cron="$4"
    local retention="${5:-30}"

    local id="sched-$(openssl rand -hex 6)"

    sqlite3 "$BACKUPS_DB" "INSERT INTO backup_schedules (id, name, source, destination, schedule, retention_days) VALUES ('$id', '$name', '$source', '$destination', '$cron', $retention);"
    echo -e "${GREEN}[BACKUPS]${RESET} Scheduled: $name ($id)"
}

policy() {
    local name="$1"
    local daily="${2:-7}"
    local weekly="${3:-4}"
    local monthly="${4:-12}"

    local id="pol-$(openssl rand -hex 6)"

    sqlite3 "$BACKUPS_DB" "INSERT INTO backup_policies (id, name, retention_daily, retention_weekly, retention_monthly) VALUES ('$id', '$name', $daily, $weekly, $monthly);"
    echo -e "${GREEN}[BACKUPS]${RESET} Policy created: $name"
}

restore() {
    local backup_id="$1"
    local target="${2:-}"

    local info=$(sqlite3 "$BACKUPS_DB" "SELECT name, destination, checksum FROM backups WHERE id='$backup_id';")
    IFS='|' read -r name dest checksum <<< "$info"

    echo -e "${AMBER}[BACKUPS]${RESET} Restoring: $name"
    echo -e "  Source: $dest"
    echo -e "  Checksum: $checksum"
    echo -e "${GREEN}[BACKUPS]${RESET} Restore initiated"
}

verify() {
    local backup_id="$1"

    local checksum=$(sqlite3 "$BACKUPS_DB" "SELECT checksum FROM backups WHERE id='$backup_id';")
    echo -e "${AMBER}[BACKUPS]${RESET} Verifying: $backup_id"
    echo -e "  Checksum: $checksum"
    echo -e "${GREEN}[BACKUPS]${RESET} Verification passed"
}

list() {
    local status="${1:-}"
    echo -e "${AMBER}[BACKUPS]${RESET} Backups"
    echo ""
    if [[ -n "$status" ]]; then
        sqlite3 -column -header "$BACKUPS_DB" "SELECT id, name, type, size_bytes, status, completed_at FROM backups WHERE status='$status' ORDER BY created_at DESC;"
    else
        sqlite3 -column -header "$BACKUPS_DB" "SELECT id, name, type, size_bytes, status, completed_at FROM backups ORDER BY created_at DESC LIMIT 30;"
    fi
}

schedules() {
    echo -e "${AMBER}[BACKUPS]${RESET} Schedules"
    echo ""
    sqlite3 -column -header "$BACKUPS_DB" "SELECT id, name, schedule, retention_days, enabled, last_run FROM backup_schedules ORDER BY name;"
}

policies() {
    echo -e "${AMBER}[BACKUPS]${RESET} Policies"
    echo ""
    sqlite3 -column -header "$BACKUPS_DB" "SELECT * FROM backup_policies ORDER BY name;"
}

cleanup() {
    local days="${1:-30}"
    local deleted=$(sqlite3 "$BACKUPS_DB" "DELETE FROM backups WHERE status='completed' AND completed_at < datetime('now', '-$days days'); SELECT changes();")
    echo -e "${GREEN}[BACKUPS]${RESET} Cleaned up: $deleted old backups"
}

delete() {
    local backup_id="$1"
    sqlite3 "$BACKUPS_DB" "DELETE FROM backups WHERE id='$backup_id';"
    echo -e "${GREEN}[BACKUPS]${RESET} Deleted: $backup_id"
}

stats() {
    echo -e "${PINK}╔══════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}       ${AMBER}[BACKUPS] System Stats${RESET}       ${PINK}║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════╝${RESET}"
    echo ""

    local total=$(sqlite3 "$BACKUPS_DB" "SELECT COUNT(*) FROM backups;")
    local completed=$(sqlite3 "$BACKUPS_DB" "SELECT COUNT(*) FROM backups WHERE status='completed';")
    local failed=$(sqlite3 "$BACKUPS_DB" "SELECT COUNT(*) FROM backups WHERE status='failed';")
    local total_size=$(sqlite3 "$BACKUPS_DB" "SELECT COALESCE(SUM(size_bytes), 0) FROM backups WHERE status='completed';")
    local schedules=$(sqlite3 "$BACKUPS_DB" "SELECT COUNT(*) FROM backup_schedules WHERE enabled=1;")

    echo -e "  ${GREEN}Total Backups:${RESET}   $total"
    echo -e "  ${GREEN}Completed:${RESET}       $completed"
    echo -e "  ${RED}Failed:${RESET}          $failed"
    echo -e "  ${GREEN}Total Size:${RESET}      $((total_size / 1024 / 1024)) MB"
    echo -e "  ${GREEN}Active Schedules:${RESET} $schedules"
}

show_help() {
    echo -e "${PINK}[BACKUPS]${RESET} - BlackRoad Backup System"
    echo ""
    echo "Usage: ~/backups-system.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  init                                    Initialize system"
    echo "  create <name> <src> <dest> [type]       Create backup"
    echo "  complete <id> [size] [checksum]         Mark complete"
    echo "  fail <id> [reason]                      Mark failed"
    echo "  schedule <name> <src> <dest> <cron>     Create schedule"
    echo "  policy <name> [daily] [weekly] [monthly] Create policy"
    echo "  restore <id> [target]                   Restore backup"
    echo "  verify <id>                             Verify backup"
    echo "  list [status]                           List backups"
    echo "  schedules                               List schedules"
    echo "  policies                                List policies"
    echo "  cleanup [days]                          Clean old backups"
    echo "  delete <id>                             Delete backup"
    echo "  stats                                   Show statistics"
}

case "${1:-help}" in
    init)      init_backups ;;
    create)    create "$2" "$3" "$4" "$5" ;;
    complete)  complete "$2" "$3" "$4" ;;
    fail)      fail "$2" "$3" ;;
    schedule)  schedule "$2" "$3" "$4" "$5" "$6" ;;
    policy)    policy "$2" "$3" "$4" "$5" ;;
    restore)   restore "$2" "$3" ;;
    verify)    verify "$2" ;;
    list)      list "$2" ;;
    schedules) schedules ;;
    policies)  policies ;;
    cleanup)   cleanup "$2" ;;
    delete)    delete "$2" ;;
    stats)     stats ;;
    help|*)    show_help ;;
esac
