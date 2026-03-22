#!/bin/bash
# [ALERTS] System - Alert management for BlackRoad
# Usage: ~/alerts-system.sh <command> [args]

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
YELLOW='\033[38;5;226m'
RESET='\033[0m'

ALERTS_DB="$HOME/.blackroad/alerts.db"

init_alerts() {
    mkdir -p "$HOME/.blackroad"
    sqlite3 "$ALERTS_DB" <<EOF
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    severity TEXT NOT NULL,
    source TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'active',
    acknowledged INTEGER DEFAULT 0,
    acknowledged_by TEXT,
    acknowledged_at TEXT,
    resolved INTEGER DEFAULT 0,
    resolved_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alert_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    condition TEXT NOT NULL,
    severity TEXT DEFAULT 'warning',
    cooldown_minutes INTEGER DEFAULT 5,
    enabled INTEGER DEFAULT 1,
    last_triggered TEXT
);

CREATE TABLE IF NOT EXISTS alert_channels (
    name TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    config TEXT,
    enabled INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS alert_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_id INTEGER,
    action TEXT,
    actor TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);
EOF

    sqlite3 "$ALERTS_DB" "INSERT OR IGNORE INTO alert_channels (name, type) VALUES ('console', 'stdout'), ('log', 'file');"
    echo -e "${GREEN}[ALERTS]${RESET} System initialized"
}

# Fire an alert
fire() {
    local severity="$1"
    local source="$2"
    local title="$3"
    local message="${4:-}"

    sqlite3 "$ALERTS_DB" "INSERT INTO alerts (severity, source, title, message) VALUES ('$severity', '$source', '$(echo "$title" | sed "s/'/''/g")', '$(echo "$message" | sed "s/'/''/g")');"
    local id=$(sqlite3 "$ALERTS_DB" "SELECT last_insert_rowid();")

    case "$severity" in
        critical) echo -e "${RED}[ALERTS]${RESET} ${RED}CRITICAL${RESET} #$id: $title" ;;
        error)    echo -e "${RED}[ALERTS]${RESET} ${RED}ERROR${RESET} #$id: $title" ;;
        warning)  echo -e "${YELLOW}[ALERTS]${RESET} ${YELLOW}WARNING${RESET} #$id: $title" ;;
        info)     echo -e "${BLUE}[ALERTS]${RESET} ${BLUE}INFO${RESET} #$id: $title" ;;
        *)        echo -e "[ALERTS] $severity #$id: $title" ;;
    esac
}

# Shorthand
critical() { fire "critical" "$1" "$2" "$3"; }
error()    { fire "error" "$1" "$2" "$3"; }
warning()  { fire "warning" "$1" "$2" "$3"; }
info()     { fire "info" "$1" "$2" "$3"; }

# Acknowledge alert
ack() {
    local id="$1"
    local by="${2:-$USER}"
    sqlite3 "$ALERTS_DB" "UPDATE alerts SET acknowledged=1, acknowledged_by='$by', acknowledged_at=datetime('now') WHERE id=$id;"
    sqlite3 "$ALERTS_DB" "INSERT INTO alert_history (alert_id, action, actor) VALUES ($id, 'acknowledged', '$by');"
    echo -e "${GREEN}[ALERTS]${RESET} Acknowledged: #$id"
}

# Resolve alert
resolve() {
    local id="$1"
    sqlite3 "$ALERTS_DB" "UPDATE alerts SET status='resolved', resolved=1, resolved_at=datetime('now') WHERE id=$id;"
    sqlite3 "$ALERTS_DB" "INSERT INTO alert_history (alert_id, action, actor) VALUES ($id, 'resolved', '$USER');"
    echo -e "${GREEN}[ALERTS]${RESET} Resolved: #$id"
}

# List active alerts
active() {
    echo -e "${RED}[ALERTS]${RESET} Active Alerts"
    echo ""
    sqlite3 -column -header "$ALERTS_DB" "SELECT id, severity, source, title, created_at FROM alerts WHERE status='active' ORDER BY CASE severity WHEN 'critical' THEN 0 WHEN 'error' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END, created_at DESC;"
}

# List all alerts
list() {
    local filter="${1:-}"
    echo -e "${AMBER}[ALERTS]${RESET} All Alerts"
    echo ""
    if [[ -n "$filter" ]]; then
        sqlite3 -column -header "$ALERTS_DB" "SELECT id, severity, source, title, status, created_at FROM alerts WHERE severity='$filter' OR source='$filter' OR status='$filter' ORDER BY created_at DESC LIMIT 30;"
    else
        sqlite3 -column -header "$ALERTS_DB" "SELECT id, severity, source, title, status, created_at FROM alerts ORDER BY created_at DESC LIMIT 30;"
    fi
}

# Get alert details
get() {
    local id="$1"
    sqlite3 -column -header "$ALERTS_DB" "SELECT * FROM alerts WHERE id=$id;"
}

# Add alert rule
rule() {
    local name="$1"
    local condition="$2"
    local severity="${3:-warning}"
    local cooldown="${4:-5}"

    sqlite3 "$ALERTS_DB" "INSERT OR REPLACE INTO alert_rules (name, condition, severity, cooldown_minutes) VALUES ('$name', '$condition', '$severity', $cooldown);"
    echo -e "${GREEN}[ALERTS]${RESET} Rule added: $name"
}

# List rules
rules() {
    echo -e "${AMBER}[ALERTS]${RESET} Alert Rules"
    echo ""
    sqlite3 -column -header "$ALERTS_DB" "SELECT name, severity, cooldown_minutes, enabled, last_triggered FROM alert_rules ORDER BY name;"
}

# Stats
stats() {
    echo -e "${PINK}╔══════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}       ${AMBER}[ALERTS] System Stats${RESET}        ${PINK}║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════╝${RESET}"
    echo ""

    local total=$(sqlite3 "$ALERTS_DB" "SELECT COUNT(*) FROM alerts;")
    local active=$(sqlite3 "$ALERTS_DB" "SELECT COUNT(*) FROM alerts WHERE status='active';")
    local critical=$(sqlite3 "$ALERTS_DB" "SELECT COUNT(*) FROM alerts WHERE severity='critical' AND status='active';")
    local rules=$(sqlite3 "$ALERTS_DB" "SELECT COUNT(*) FROM alert_rules WHERE enabled=1;")
    local today=$(sqlite3 "$ALERTS_DB" "SELECT COUNT(*) FROM alerts WHERE date(created_at)=date('now');")

    echo -e "  ${GREEN}Total Alerts:${RESET}   $total"
    echo -e "  ${RED}Active:${RESET}         $active"
    echo -e "  ${RED}Critical:${RESET}       $critical"
    echo -e "  ${GREEN}Active Rules:${RESET}   $rules"
    echo -e "  ${GREEN}Today:${RESET}          $today"
    echo ""
    echo -e "${BLUE}By Severity:${RESET}"
    sqlite3 -column "$ALERTS_DB" "SELECT severity, COUNT(*) as count FROM alerts GROUP BY severity ORDER BY CASE severity WHEN 'critical' THEN 0 WHEN 'error' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END;"
}

show_help() {
    echo -e "${PINK}[ALERTS]${RESET} - BlackRoad Alert System"
    echo ""
    echo "Usage: ~/alerts-system.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  init                                Initialize system"
    echo "  fire <sev> <src> <title> [msg]      Fire alert"
    echo "  critical <src> <title> [msg]        Fire critical"
    echo "  error <src> <title> [msg]           Fire error"
    echo "  warning <src> <title> [msg]         Fire warning"
    echo "  info <src> <title> [msg]            Fire info"
    echo "  ack <id> [by]                       Acknowledge"
    echo "  resolve <id>                        Resolve"
    echo "  active                              List active"
    echo "  list [filter]                       List all"
    echo "  get <id>                            Get details"
    echo "  rule <name> <cond> [sev]            Add rule"
    echo "  rules                               List rules"
    echo "  stats                               Show statistics"
}

case "${1:-help}" in
    init)     init_alerts ;;
    fire)     fire "$2" "$3" "$4" "$5" ;;
    critical) critical "$2" "$3" "$4" ;;
    error)    error "$2" "$3" "$4" ;;
    warning)  warning "$2" "$3" "$4" ;;
    info)     info "$2" "$3" "$4" ;;
    ack)      ack "$2" "$3" ;;
    resolve)  resolve "$2" ;;
    active)   active ;;
    list)     list "$2" ;;
    get)      get "$2" ;;
    rule)     rule "$2" "$3" "$4" "$5" ;;
    rules)    rules ;;
    stats)    stats ;;
    help|*)   show_help ;;
esac
