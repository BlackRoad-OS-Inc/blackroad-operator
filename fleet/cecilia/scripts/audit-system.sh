#!/bin/bash
# [AUDIT] System - Audit trail for BlackRoad
# Usage: ~/audit-system.sh <command> [args]

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
YELLOW='\033[38;5;226m'
RESET='\033[0m'

AUDIT_DB="$HOME/.blackroad/audit.db"

init_audit() {
    mkdir -p "$HOME/.blackroad"
    sqlite3 "$AUDIT_DB" <<EOF
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,
    result TEXT DEFAULT 'success',
    hash TEXT
);

CREATE TABLE IF NOT EXISTS audit_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    resource_type TEXT,
    actions TEXT,
    retention_days INTEGER DEFAULT 90,
    alert_on_failure INTEGER DEFAULT 0,
    enabled INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS audit_exports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_date TEXT,
    end_date TEXT,
    format TEXT,
    file_path TEXT,
    exported_at TEXT DEFAULT CURRENT_TIMESTAMP,
    record_count INTEGER
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_log(resource_type, resource_id);
EOF
    echo -e "${GREEN}[AUDIT]${RESET} System initialized"
}

# Log an audit event
log_audit() {
    local actor="$1"
    local action="$2"
    local resource_type="${3:-}"
    local resource_id="${4:-}"
    local details="${5:-}"
    local result="${6:-success}"

    # Create hash for integrity
    local hash_input="$actor|$action|$resource_type|$resource_id|$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    local hash=$(echo -n "$hash_input" | shasum -a 256 | cut -d' ' -f1 | head -c 16)

    sqlite3 "$AUDIT_DB" "INSERT INTO audit_log (actor, action, resource_type, resource_id, details, result, hash) VALUES ('$actor', '$action', '$resource_type', '$resource_id', '$(echo "$details" | sed "s/'/''/g")', '$result', '$hash');"
    echo -e "${GREEN}[AUDIT]${RESET} Logged: $actor -> $action ($resource_type)"
}

# Search audit log
search() {
    local query="$1"
    echo -e "${AMBER}[AUDIT]${RESET} Search: $query"
    echo ""
    sqlite3 -column -header "$AUDIT_DB" "SELECT id, timestamp, actor, action, resource_type, result FROM audit_log WHERE actor LIKE '%$query%' OR action LIKE '%$query%' OR resource_type LIKE '%$query%' OR details LIKE '%$query%' ORDER BY timestamp DESC LIMIT 30;"
}

# List recent audit entries
list() {
    local filter="${1:-}"
    echo -e "${AMBER}[AUDIT]${RESET} Recent Audit Log"
    echo ""
    if [[ -n "$filter" ]]; then
        sqlite3 -column -header "$AUDIT_DB" "SELECT id, timestamp, actor, action, resource_type, result FROM audit_log WHERE actor='$filter' OR action='$filter' OR resource_type='$filter' ORDER BY timestamp DESC LIMIT 30;"
    else
        sqlite3 -column -header "$AUDIT_DB" "SELECT id, timestamp, actor, action, resource_type, result FROM audit_log ORDER BY timestamp DESC LIMIT 30;"
    fi
}

# Get specific entry
get() {
    local id="$1"
    sqlite3 -column -header "$AUDIT_DB" "SELECT * FROM audit_log WHERE id=$id;"
}

# Actor history
actor() {
    local actor="$1"
    echo -e "${AMBER}[AUDIT]${RESET} Actor History: $actor"
    echo ""
    sqlite3 -column -header "$AUDIT_DB" "SELECT id, timestamp, action, resource_type, result FROM audit_log WHERE actor='$actor' ORDER BY timestamp DESC LIMIT 30;"
}

# Resource history
resource() {
    local type="$1"
    local id="${2:-}"
    echo -e "${AMBER}[AUDIT]${RESET} Resource History: $type ${id:-'(all)'}"
    echo ""
    if [[ -n "$id" ]]; then
        sqlite3 -column -header "$AUDIT_DB" "SELECT id, timestamp, actor, action, result FROM audit_log WHERE resource_type='$type' AND resource_id='$id' ORDER BY timestamp DESC LIMIT 30;"
    else
        sqlite3 -column -header "$AUDIT_DB" "SELECT id, timestamp, actor, action, resource_id, result FROM audit_log WHERE resource_type='$type' ORDER BY timestamp DESC LIMIT 30;"
    fi
}

# Export audit log
export_log() {
    local start="${1:-$(date -v-30d +%Y-%m-%d 2>/dev/null || date -d '30 days ago' +%Y-%m-%d)}"
    local end="${2:-$(date +%Y-%m-%d)}"
    local format="${3:-csv}"
    local file="$HOME/.blackroad/audit-export-$(date +%Y%m%d-%H%M%S).$format"

    local count=$(sqlite3 "$AUDIT_DB" "SELECT COUNT(*) FROM audit_log WHERE date(timestamp) BETWEEN '$start' AND '$end';")

    if [[ "$format" == "csv" ]]; then
        sqlite3 -header -csv "$AUDIT_DB" "SELECT * FROM audit_log WHERE date(timestamp) BETWEEN '$start' AND '$end' ORDER BY timestamp;" > "$file"
    else
        sqlite3 -json "$AUDIT_DB" "SELECT * FROM audit_log WHERE date(timestamp) BETWEEN '$start' AND '$end' ORDER BY timestamp;" > "$file"
    fi

    sqlite3 "$AUDIT_DB" "INSERT INTO audit_exports (start_date, end_date, format, file_path, record_count) VALUES ('$start', '$end', '$format', '$file', $count);"
    echo -e "${GREEN}[AUDIT]${RESET} Exported $count records to: $file"
}

# Add policy
policy() {
    local name="$1"
    local resource_type="$2"
    local actions="$3"
    local retention="${4:-90}"

    sqlite3 "$AUDIT_DB" "INSERT OR REPLACE INTO audit_policies (name, resource_type, actions, retention_days) VALUES ('$name', '$resource_type', '$actions', $retention);"
    echo -e "${GREEN}[AUDIT]${RESET} Policy added: $name"
}

# List policies
policies() {
    echo -e "${AMBER}[AUDIT]${RESET} Audit Policies"
    echo ""
    sqlite3 -column -header "$AUDIT_DB" "SELECT name, resource_type, actions, retention_days, enabled FROM audit_policies ORDER BY name;"
}

# Prune old entries
prune() {
    local days="${1:-90}"
    local count=$(sqlite3 "$AUDIT_DB" "SELECT COUNT(*) FROM audit_log WHERE timestamp < datetime('now', '-$days days');")
    sqlite3 "$AUDIT_DB" "DELETE FROM audit_log WHERE timestamp < datetime('now', '-$days days');"
    echo -e "${GREEN}[AUDIT]${RESET} Pruned $count entries older than $days days"
}

# Verify integrity
verify() {
    echo -e "${BLUE}[AUDIT]${RESET} Verifying audit log integrity..."
    local total=$(sqlite3 "$AUDIT_DB" "SELECT COUNT(*) FROM audit_log;")
    local with_hash=$(sqlite3 "$AUDIT_DB" "SELECT COUNT(*) FROM audit_log WHERE hash IS NOT NULL AND hash != '';")
    echo -e "  ${GREEN}Total Records:${RESET} $total"
    echo -e "  ${GREEN}With Hash:${RESET}     $with_hash"
    if [[ "$total" == "$with_hash" ]]; then
        echo -e "  ${GREEN}Status:${RESET}        All records have integrity hashes"
    else
        echo -e "  ${YELLOW}Status:${RESET}        $((total - with_hash)) records missing hashes"
    fi
}

# Stats
stats() {
    echo -e "${PINK}╔══════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}        ${AMBER}[AUDIT] System Stats${RESET}        ${PINK}║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════╝${RESET}"
    echo ""

    local total=$(sqlite3 "$AUDIT_DB" "SELECT COUNT(*) FROM audit_log;")
    local today=$(sqlite3 "$AUDIT_DB" "SELECT COUNT(*) FROM audit_log WHERE date(timestamp)=date('now');")
    local actors=$(sqlite3 "$AUDIT_DB" "SELECT COUNT(DISTINCT actor) FROM audit_log;")
    local failures=$(sqlite3 "$AUDIT_DB" "SELECT COUNT(*) FROM audit_log WHERE result='failure';")
    local policies=$(sqlite3 "$AUDIT_DB" "SELECT COUNT(*) FROM audit_policies WHERE enabled=1;")

    echo -e "  ${GREEN}Total Records:${RESET}  $total"
    echo -e "  ${GREEN}Today:${RESET}          $today"
    echo -e "  ${GREEN}Unique Actors:${RESET}  $actors"
    echo -e "  ${RED}Failures:${RESET}       $failures"
    echo -e "  ${GREEN}Active Policies:${RESET} $policies"
    echo ""
    echo -e "${BLUE}Top Actors:${RESET}"
    sqlite3 -column "$AUDIT_DB" "SELECT actor, COUNT(*) as count FROM audit_log GROUP BY actor ORDER BY count DESC LIMIT 5;"
    echo ""
    echo -e "${BLUE}Top Actions:${RESET}"
    sqlite3 -column "$AUDIT_DB" "SELECT action, COUNT(*) as count FROM audit_log GROUP BY action ORDER BY count DESC LIMIT 5;"
}

show_help() {
    echo -e "${PINK}[AUDIT]${RESET} - BlackRoad Audit System"
    echo ""
    echo "Usage: ~/audit-system.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  init                                    Initialize system"
    echo "  log <actor> <action> [type] [id] [det]  Log audit event"
    echo "  search <query>                          Search audit log"
    echo "  list [filter]                           List recent entries"
    echo "  get <id>                                Get specific entry"
    echo "  actor <name>                            Actor history"
    echo "  resource <type> [id]                    Resource history"
    echo "  export [start] [end] [format]           Export log"
    echo "  policy <name> <type> <actions>          Add policy"
    echo "  policies                                List policies"
    echo "  prune [days]                            Delete old entries"
    echo "  verify                                  Verify integrity"
    echo "  stats                                   Show statistics"
}

case "${1:-help}" in
    init)     init_audit ;;
    log)      log_audit "$2" "$3" "$4" "$5" "$6" "$7" ;;
    search)   search "$2" ;;
    list)     list "$2" ;;
    get)      get "$2" ;;
    actor)    actor "$2" ;;
    resource) resource "$2" "$3" ;;
    export)   export_log "$2" "$3" "$4" ;;
    policy)   policy "$2" "$3" "$4" "$5" ;;
    policies) policies ;;
    prune)    prune "$2" ;;
    verify)   verify ;;
    stats)    stats ;;
    help|*)   show_help ;;
esac
