#!/bin/bash
# [APPROVALS] System - Approval workflows for BlackRoad
# Usage: ~/approvals-system.sh <command> [args]

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
YELLOW='\033[38;5;226m'
RESET='\033[0m'

APPROVALS_DB="$HOME/.blackroad/approvals.db"

init_approvals() {
    mkdir -p "$HOME/.blackroad"
    sqlite3 "$APPROVALS_DB" <<EOF
CREATE TABLE IF NOT EXISTS approval_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    required_approvers INTEGER DEFAULT 1,
    auto_approve_after_hours INTEGER,
    escalation_hours INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approval_requests (
    id TEXT PRIMARY KEY,
    type_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    entity_type TEXT,
    entity_id TEXT,
    requester TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS approvers (
    request_id TEXT NOT NULL,
    approver TEXT NOT NULL,
    decision TEXT,
    comment TEXT,
    decided_at TEXT,
    PRIMARY KEY (request_id, approver)
);

CREATE TABLE IF NOT EXISTS approval_rules (
    type_id TEXT NOT NULL,
    approver TEXT NOT NULL,
    is_required INTEGER DEFAULT 0,
    PRIMARY KEY (type_id, approver)
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_requester ON approval_requests(requester);
EOF
    echo -e "${GREEN}[APPROVALS]${RESET} System initialized"
}

# Create approval type
type_create() {
    local id="$1"
    local name="$2"
    local required="${3:-1}"
    local auto_approve="${4:-}"
    local escalation="${5:-}"

    sqlite3 "$APPROVALS_DB" "INSERT OR REPLACE INTO approval_types (id, name, required_approvers, auto_approve_after_hours, escalation_hours) VALUES ('$id', '$name', $required, ${auto_approve:-NULL}, ${escalation:-NULL});"
    echo -e "${GREEN}[APPROVALS]${RESET} Type created: $name (requires $required approvers)"
}

# Add approver to type
add_approver() {
    local type_id="$1"
    local approver="$2"
    local required="${3:-0}"

    sqlite3 "$APPROVALS_DB" "INSERT OR REPLACE INTO approval_rules (type_id, approver, is_required) VALUES ('$type_id', '$approver', $required);"
    echo -e "${GREEN}[APPROVALS]${RESET} Added approver: $approver to $type_id"
}

# Request approval
request() {
    local type_id="$1"
    local title="$2"
    local description="${3:-}"
    local entity_type="${4:-}"
    local entity_id="${5:-}"

    local request_id="apr-$(openssl rand -hex 8)"

    sqlite3 "$APPROVALS_DB" "INSERT INTO approval_requests (id, type_id, title, description, entity_type, entity_id, requester) VALUES ('$request_id', '$type_id', '$title', '$description', '$entity_type', '$entity_id', '$USER');"

    # Add approvers from rules
    sqlite3 "$APPROVALS_DB" "INSERT INTO approvers (request_id, approver) SELECT '$request_id', approver FROM approval_rules WHERE type_id='$type_id';"

    echo -e "${GREEN}[APPROVALS]${RESET} Request created: $request_id"
    echo "$request_id"
}

# Approve
approve() {
    local request_id="$1"
    local comment="${2:-}"

    sqlite3 "$APPROVALS_DB" "UPDATE approvers SET decision='approved', comment='$comment', decided_at=datetime('now') WHERE request_id='$request_id' AND approver='$USER';"

    # Check if enough approvals
    local required=$(sqlite3 "$APPROVALS_DB" "SELECT t.required_approvers FROM approval_requests r JOIN approval_types t ON r.type_id=t.id WHERE r.id='$request_id';")
    local approved=$(sqlite3 "$APPROVALS_DB" "SELECT COUNT(*) FROM approvers WHERE request_id='$request_id' AND decision='approved';")

    if [[ $approved -ge $required ]]; then
        sqlite3 "$APPROVALS_DB" "UPDATE approval_requests SET status='approved', resolved_at=datetime('now') WHERE id='$request_id';"
        echo -e "${GREEN}[APPROVALS]${RESET} APPROVED: $request_id"
    else
        echo -e "${GREEN}[APPROVALS]${RESET} Approved by $USER ($approved/$required)"
    fi
}

# Reject
reject() {
    local request_id="$1"
    local comment="${2:-}"

    sqlite3 "$APPROVALS_DB" "UPDATE approvers SET decision='rejected', comment='$comment', decided_at=datetime('now') WHERE request_id='$request_id' AND approver='$USER';"
    sqlite3 "$APPROVALS_DB" "UPDATE approval_requests SET status='rejected', resolved_at=datetime('now') WHERE id='$request_id';"

    echo -e "${RED}[APPROVALS]${RESET} REJECTED: $request_id"
}

# List pending
pending() {
    local approver="${1:-$USER}"
    echo -e "${AMBER}[APPROVALS]${RESET} Pending for $approver"
    echo ""
    sqlite3 -column -header "$APPROVALS_DB" "SELECT r.id, r.title, r.requester, r.created_at FROM approval_requests r JOIN approvers a ON r.id=a.request_id WHERE a.approver='$approver' AND a.decision IS NULL AND r.status='pending' ORDER BY r.created_at;"
}

# My requests
my_requests() {
    echo -e "${AMBER}[APPROVALS]${RESET} My Requests"
    echo ""
    sqlite3 -column -header "$APPROVALS_DB" "SELECT id, title, status, created_at FROM approval_requests WHERE requester='$USER' ORDER BY created_at DESC LIMIT 20;"
}

# Get request details
get() {
    local request_id="$1"
    sqlite3 -column -header "$APPROVALS_DB" "SELECT * FROM approval_requests WHERE id='$request_id';"
    echo ""
    echo -e "${BLUE}Approvers:${RESET}"
    sqlite3 -column -header "$APPROVALS_DB" "SELECT approver, decision, comment, decided_at FROM approvers WHERE request_id='$request_id';"
}

# Cancel request
cancel() {
    local request_id="$1"

    sqlite3 "$APPROVALS_DB" "UPDATE approval_requests SET status='cancelled', resolved_at=datetime('now') WHERE id='$request_id' AND requester='$USER';"
    echo -e "${GREEN}[APPROVALS]${RESET} Cancelled: $request_id"
}

# List types
types() {
    echo -e "${AMBER}[APPROVALS]${RESET} Approval Types"
    echo ""
    sqlite3 -column -header "$APPROVALS_DB" "SELECT id, name, required_approvers, auto_approve_after_hours FROM approval_types ORDER BY name;"
}

# Stats
stats() {
    echo -e "${PINK}╔══════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}      ${AMBER}[APPROVALS] System Stats${RESET}      ${PINK}║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════╝${RESET}"
    echo ""

    local total=$(sqlite3 "$APPROVALS_DB" "SELECT COUNT(*) FROM approval_requests;")
    local pending=$(sqlite3 "$APPROVALS_DB" "SELECT COUNT(*) FROM approval_requests WHERE status='pending';")
    local approved=$(sqlite3 "$APPROVALS_DB" "SELECT COUNT(*) FROM approval_requests WHERE status='approved';")
    local rejected=$(sqlite3 "$APPROVALS_DB" "SELECT COUNT(*) FROM approval_requests WHERE status='rejected';")
    local types=$(sqlite3 "$APPROVALS_DB" "SELECT COUNT(*) FROM approval_types;")

    echo -e "  ${GREEN}Total Requests:${RESET} $total"
    echo -e "  ${YELLOW}Pending:${RESET}        $pending"
    echo -e "  ${GREEN}Approved:${RESET}       $approved"
    echo -e "  ${RED}Rejected:${RESET}       $rejected"
    echo -e "  ${GREEN}Types:${RESET}          $types"
}

show_help() {
    echo -e "${PINK}[APPROVALS]${RESET} - BlackRoad Approval Workflows"
    echo ""
    echo "Usage: ~/approvals-system.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  init                                    Initialize system"
    echo "  type-create <id> <name> [required]      Create approval type"
    echo "  add-approver <type> <user> [required]   Add approver to type"
    echo "  request <type> <title> [desc]           Request approval"
    echo "  approve <request_id> [comment]          Approve request"
    echo "  reject <request_id> [comment]           Reject request"
    echo "  pending [approver]                      List pending"
    echo "  my-requests                             My requests"
    echo "  get <request_id>                        Get request details"
    echo "  cancel <request_id>                     Cancel request"
    echo "  types                                   List approval types"
    echo "  stats                                   Show statistics"
}

case "${1:-help}" in
    init)         init_approvals ;;
    type-create)  type_create "$2" "$3" "$4" "$5" "$6" ;;
    add-approver) add_approver "$2" "$3" "$4" ;;
    request)      request "$2" "$3" "$4" "$5" "$6" ;;
    approve)      approve "$2" "$3" ;;
    reject)       reject "$2" "$3" ;;
    pending)      pending "$2" ;;
    my-requests)  my_requests ;;
    get)          get "$2" ;;
    cancel)       cancel "$2" ;;
    types)        types ;;
    stats)        stats ;;
    help|*)       show_help ;;
esac
