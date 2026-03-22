#!/bin/bash
# [AGENTS] System - Agent coordination and management for BlackRoad
# Usage: ~/agents-system.sh <command> [args]

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
VIOLET='\033[38;5;135m'
RESET='\033[0m'

AGENTS_DB="$HOME/.blackroad/agents.db"

init_agents() {
    mkdir -p "$HOME/.blackroad"
    sqlite3 "$AGENTS_DB" <<EOF
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'ai',
    status TEXT DEFAULT 'idle',
    capabilities TEXT,
    ip_address TEXT,
    last_seen TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    task TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    started_at TEXT,
    completed_at TEXT,
    result TEXT
);

CREATE TABLE IF NOT EXISTS agent_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_agent TEXT NOT NULL,
    to_agent TEXT,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'normal',
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    skill TEXT NOT NULL,
    proficiency INTEGER DEFAULT 50,
    UNIQUE(agent_id, skill)
);
EOF
    echo -e "${GREEN}[AGENTS]${RESET} System initialized"
}

# Register an agent
register() {
    local id="$1"
    local name="${2:-$1}"
    local type="${3:-ai}"
    local capabilities="${4:-general}"
    local ip="${5:-}"

    sqlite3 "$AGENTS_DB" "INSERT OR REPLACE INTO agents (id, name, type, capabilities, ip_address, last_seen) VALUES ('$id', '$name', '$type', '$capabilities', '$ip', datetime('now'));"
    echo -e "${GREEN}[AGENTS]${RESET} Registered: $name ($type)"
}

# List all agents
list() {
    local filter="${1:-}"
    echo -e "${AMBER}[AGENTS]${RESET} Active Agents"
    echo ""
    if [[ -n "$filter" ]]; then
        sqlite3 -column -header "$AGENTS_DB" "SELECT id, name, type, status, capabilities FROM agents WHERE type='$filter' OR status='$filter' ORDER BY last_seen DESC;"
    else
        sqlite3 -column -header "$AGENTS_DB" "SELECT id, name, type, status, capabilities FROM agents ORDER BY last_seen DESC;"
    fi
}

# Update agent status
status() {
    local id="$1"
    local new_status="$2"
    sqlite3 "$AGENTS_DB" "UPDATE agents SET status='$new_status', last_seen=datetime('now') WHERE id='$id';"
    echo -e "${GREEN}[AGENTS]${RESET} $id -> $new_status"
}

# Send message to agent
send() {
    local from="$1"
    local to="$2"
    local message="$3"
    local priority="${4:-normal}"
    sqlite3 "$AGENTS_DB" "INSERT INTO agent_messages (from_agent, to_agent, message, priority) VALUES ('$from', '$to', '$(echo "$message" | sed "s/'/''/g")', '$priority');"
    echo -e "${GREEN}[AGENTS]${RESET} Message sent: $from -> $to"
}

# Check inbox
inbox() {
    local agent_id="$1"
    echo -e "${AMBER}[AGENTS]${RESET} Inbox for $agent_id"
    echo ""
    sqlite3 -column -header "$AGENTS_DB" "SELECT id, from_agent, message, priority, created_at FROM agent_messages WHERE to_agent='$agent_id' OR to_agent IS NULL ORDER BY created_at DESC LIMIT 20;"
}

# Broadcast to all
broadcast() {
    local from="$1"
    local message="$2"
    sqlite3 "$AGENTS_DB" "INSERT INTO agent_messages (from_agent, to_agent, message, priority) VALUES ('$from', NULL, '$(echo "$message" | sed "s/'/''/g")', 'broadcast');"
    echo -e "${GREEN}[AGENTS]${RESET} Broadcast sent from $from"
}

# Add skill to agent
add_skill() {
    local agent_id="$1"
    local skill="$2"
    local proficiency="${3:-50}"
    sqlite3 "$AGENTS_DB" "INSERT OR REPLACE INTO agent_skills (agent_id, skill, proficiency) VALUES ('$agent_id', '$skill', $proficiency);"
    echo -e "${GREEN}[AGENTS]${RESET} Added skill: $skill ($proficiency%) to $agent_id"
}

# Find agents by skill
find_skill() {
    local skill="$1"
    echo -e "${AMBER}[AGENTS]${RESET} Agents with skill: $skill"
    sqlite3 -column -header "$AGENTS_DB" "SELECT a.id, a.name, s.skill, s.proficiency FROM agents a JOIN agent_skills s ON a.id = s.agent_id WHERE s.skill LIKE '%$skill%' ORDER BY s.proficiency DESC;"
}

# Stats
stats() {
    echo -e "${PINK}╔══════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}       ${AMBER}[AGENTS] System Stats${RESET}        ${PINK}║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════╝${RESET}"
    echo ""

    local total=$(sqlite3 "$AGENTS_DB" "SELECT COUNT(*) FROM agents;")
    local active=$(sqlite3 "$AGENTS_DB" "SELECT COUNT(*) FROM agents WHERE status='active';")
    local idle=$(sqlite3 "$AGENTS_DB" "SELECT COUNT(*) FROM agents WHERE status='idle';")
    local messages=$(sqlite3 "$AGENTS_DB" "SELECT COUNT(*) FROM agent_messages;")
    local skills=$(sqlite3 "$AGENTS_DB" "SELECT COUNT(DISTINCT skill) FROM agent_skills;")

    echo -e "  ${GREEN}Total Agents:${RESET}   $total"
    echo -e "  ${GREEN}Active:${RESET}         $active"
    echo -e "  ${GREEN}Idle:${RESET}           $idle"
    echo -e "  ${GREEN}Messages:${RESET}       $messages"
    echo -e "  ${GREEN}Unique Skills:${RESET}  $skills"
    echo ""
    echo -e "${BLUE}By Type:${RESET}"
    sqlite3 -column "$AGENTS_DB" "SELECT type, COUNT(*) as count FROM agents GROUP BY type ORDER BY count DESC;"
}

# Heartbeat - update last_seen
heartbeat() {
    local id="$1"
    sqlite3 "$AGENTS_DB" "UPDATE agents SET last_seen=datetime('now') WHERE id='$id';"
}

show_help() {
    echo -e "${PINK}[AGENTS]${RESET} - BlackRoad Agent Coordination"
    echo ""
    echo "Usage: ~/agents-system.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  init                          Initialize system"
    echo "  register <id> [name] [type]   Register new agent"
    echo "  list [filter]                 List agents"
    echo "  status <id> <status>          Update status (active/idle/busy)"
    echo "  send <from> <to> <msg>        Send message"
    echo "  broadcast <from> <msg>        Broadcast to all"
    echo "  inbox <agent_id>              Check messages"
    echo "  add-skill <id> <skill> [%]    Add skill"
    echo "  find-skill <skill>            Find agents by skill"
    echo "  heartbeat <id>                Update last_seen"
    echo "  stats                         Show statistics"
}

case "${1:-help}" in
    init)       init_agents ;;
    register)   register "$2" "$3" "$4" "$5" "$6" ;;
    list)       list "$2" ;;
    status)     status "$2" "$3" ;;
    send)       send "$2" "$3" "$4" "$5" ;;
    broadcast)  broadcast "$2" "$3" ;;
    inbox)      inbox "$2" ;;
    add-skill)  add_skill "$2" "$3" "$4" ;;
    find-skill) find_skill "$2" ;;
    heartbeat)  heartbeat "$2" ;;
    stats)      stats ;;
    help|*)     show_help ;;
esac
