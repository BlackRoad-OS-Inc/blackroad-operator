#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# 
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================
# BlackRoad Agent Coordination Protocol
# Handles inter-agent communication, heartbeats, and state synchronization
# Part of the 30K Agent Infrastructure

set -e

# Colors
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
WHITE='\033[1;37m'
RESET='\033[0m'

# Databases
ORCHESTRATOR_DB="${HOME}/.blackroad-30k-orchestrator.db"
PROTOCOL_DB="${HOME}/.blackroad-agent-protocol.db"
MEMORY_DIR="${HOME}/.blackroad/memory"

# Protocol Constants
HEARTBEAT_INTERVAL=30    # seconds
TIMEOUT_THRESHOLD=90     # seconds before marking agent dead
MESSAGE_RETENTION=3600   # 1 hour

# Initialize protocol database
init_db() {
    sqlite3 "$PROTOCOL_DB" <<'EOF'
-- Agent Messages
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT UNIQUE NOT NULL,
    from_agent TEXT NOT NULL,
    to_agent TEXT,          -- NULL = broadcast
    message_type TEXT NOT NULL,  -- heartbeat, task, result, alert, sync
    payload TEXT,
    priority INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',  -- pending, delivered, acknowledged
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivered_at DATETIME,
    acked_at DATETIME
);

-- Agent State
CREATE TABLE IF NOT EXISTS agent_state (
    agent_id TEXT PRIMARY KEY,
    state TEXT DEFAULT 'idle',  -- idle, busy, overloaded, error
    current_load REAL DEFAULT 0,
    max_capacity INTEGER DEFAULT 100,
    last_heartbeat DATETIME,
    metadata TEXT
);

-- Coordination Locks (for distributed operations)
CREATE TABLE IF NOT EXISTS locks (
    lock_id TEXT PRIMARY KEY,
    owner_agent TEXT NOT NULL,
    resource TEXT NOT NULL,
    acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    released INTEGER DEFAULT 0
);

-- Event Log
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    agent_id TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_to ON messages(to_agent);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_state_heartbeat ON agent_state(last_heartbeat);
EOF
    echo -e "${GREEN}✓ Protocol database initialized${RESET}"
}

# Send heartbeat
heartbeat() {
    local agent_id="${1:-$MY_CLAUDE}"

    if [[ -z "$agent_id" ]]; then
        echo -e "${RED}Error: No agent ID. Set MY_CLAUDE or pass agent_id${RESET}"
        return 1
    fi

    local load=$(ps -A -o %cpu | awk '{sum+=$1} END {print sum/100}')
    local state="idle"
    [[ $(echo "$load > 0.5" | bc -l) -eq 1 ]] && state="busy"
    [[ $(echo "$load > 0.8" | bc -l) -eq 1 ]] && state="overloaded"

    sqlite3 "$PROTOCOL_DB" "INSERT OR REPLACE INTO agent_state
        (agent_id, state, current_load, last_heartbeat)
        VALUES ('$agent_id', '$state', $load, datetime('now'));"

    # Update orchestrator
    sqlite3 "$ORCHESTRATOR_DB" "UPDATE agent_hierarchy
        SET last_heartbeat=datetime('now'), status='active'
        WHERE agent_id='$agent_id';" 2>/dev/null || true

    echo -e "${GREEN}♥${RESET} Heartbeat: $agent_id ($state, load: ${load})"
}

# Send message to another agent
send() {
    local to_agent="$1"
    local message_type="$2"
    local payload="$3"
    local from_agent="${MY_CLAUDE:-anonymous}"

    local msg_id="msg-$(date +%s)-$(openssl rand -hex 4)"

    sqlite3 "$PROTOCOL_DB" "INSERT INTO messages
        (message_id, from_agent, to_agent, message_type, payload)
        VALUES ('$msg_id', '$from_agent', '$to_agent', '$message_type', '$payload');"

    echo -e "${GREEN}→${RESET} Sent $message_type to $to_agent: $msg_id"

    # Log event
    log_event "message_sent" "$from_agent" "to=$to_agent type=$message_type"
}

# Broadcast message to all agents
broadcast() {
    local message_type="$1"
    local payload="$2"
    local from_agent="${MY_CLAUDE:-anonymous}"

    local msg_id="msg-$(date +%s)-$(openssl rand -hex 4)"

    sqlite3 "$PROTOCOL_DB" "INSERT INTO messages
        (message_id, from_agent, to_agent, message_type, payload)
        VALUES ('$msg_id', '$from_agent', NULL, '$message_type', '$payload');"

    echo -e "${AMBER}📢${RESET} Broadcast $message_type: $msg_id"

    # Log event
    log_event "broadcast" "$from_agent" "type=$message_type"
}

# Receive pending messages
receive() {
    local agent_id="${1:-$MY_CLAUDE}"

    if [[ -z "$agent_id" ]]; then
        echo -e "${RED}Error: No agent ID${RESET}"
        return 1
    fi

    echo -e "${BLUE}═══ MESSAGES FOR $agent_id ═══${RESET}"

    # Direct messages + broadcasts
    sqlite3 -column -header "$PROTOCOL_DB" "
        SELECT message_id, from_agent, message_type, payload, created_at
        FROM messages
        WHERE (to_agent='$agent_id' OR to_agent IS NULL)
        AND status='pending'
        ORDER BY priority DESC, created_at ASC
        LIMIT 20;
    "

    # Mark as delivered
    sqlite3 "$PROTOCOL_DB" "
        UPDATE messages
        SET status='delivered', delivered_at=datetime('now')
        WHERE (to_agent='$agent_id' OR to_agent IS NULL)
        AND status='pending';
    "
}

# Acknowledge a message
ack() {
    local message_id="$1"

    sqlite3 "$PROTOCOL_DB" "
        UPDATE messages
        SET status='acknowledged', acked_at=datetime('now')
        WHERE message_id='$message_id';
    "
    echo -e "${GREEN}✓${RESET} Acknowledged: $message_id"
}

# Acquire a distributed lock
lock() {
    local resource="$1"
    local agent_id="${MY_CLAUDE:-anonymous}"
    local duration="${2:-300}"  # Default 5 minutes

    local lock_id="lock-$(echo "$resource" | md5 -q)"
    local expires=$(date -v+${duration}S +"%Y-%m-%d %H:%M:%S")

    # Check if already locked
    local existing=$(sqlite3 "$PROTOCOL_DB" "
        SELECT owner_agent FROM locks
        WHERE lock_id='$lock_id' AND released=0 AND expires_at > datetime('now');
    ")

    if [[ -n "$existing" ]]; then
        echo -e "${RED}✗${RESET} Resource locked by: $existing"
        return 1
    fi

    sqlite3 "$PROTOCOL_DB" "INSERT OR REPLACE INTO locks
        (lock_id, owner_agent, resource, expires_at, released)
        VALUES ('$lock_id', '$agent_id', '$resource', '$expires', 0);"

    echo -e "${GREEN}🔒${RESET} Lock acquired: $resource (expires: $expires)"
    log_event "lock_acquired" "$agent_id" "resource=$resource"
}

# Release a lock
unlock() {
    local resource="$1"
    local lock_id="lock-$(echo "$resource" | md5 -q)"

    sqlite3 "$PROTOCOL_DB" "UPDATE locks SET released=1 WHERE lock_id='$lock_id';"
    echo -e "${GREEN}🔓${RESET} Lock released: $resource"
    log_event "lock_released" "${MY_CLAUDE:-anonymous}" "resource=$resource"
}

# Log an event
log_event() {
    local event_type="$1"
    local agent_id="$2"
    local details="$3"

    sqlite3 "$PROTOCOL_DB" "INSERT INTO events (event_type, agent_id, details)
        VALUES ('$event_type', '$agent_id', '$details');"
}

# Check for dead agents (no heartbeat)
check_dead_agents() {
    echo -e "${AMBER}═══ CHECKING AGENT HEALTH ═══${RESET}"

    local dead=$(sqlite3 "$PROTOCOL_DB" "
        SELECT agent_id FROM agent_state
        WHERE last_heartbeat < datetime('now', '-${TIMEOUT_THRESHOLD} seconds');
    ")

    if [[ -n "$dead" ]]; then
        echo -e "${RED}Dead agents detected:${RESET}"
        echo "$dead" | while read agent; do
            echo -e "  ${RED}✗${RESET} $agent"
            # Update orchestrator
            sqlite3 "$ORCHESTRATOR_DB" "
                UPDATE agent_hierarchy SET status='dead'
                WHERE agent_id='$agent';
            " 2>/dev/null || true
            log_event "agent_dead" "$agent" "timeout"
        done
    else
        echo -e "${GREEN}✓ All agents healthy${RESET}"
    fi
}

# Status overview
status() {
    echo -e "\n${PINK}═══ AGENT PROTOCOL STATUS ═══${RESET}"

    local total_agents=$(sqlite3 "$PROTOCOL_DB" "SELECT COUNT(*) FROM agent_state;")
    local active=$(sqlite3 "$PROTOCOL_DB" "SELECT COUNT(*) FROM agent_state WHERE last_heartbeat > datetime('now', '-60 seconds');")
    local pending_msgs=$(sqlite3 "$PROTOCOL_DB" "SELECT COUNT(*) FROM messages WHERE status='pending';")
    local active_locks=$(sqlite3 "$PROTOCOL_DB" "SELECT COUNT(*) FROM locks WHERE released=0 AND expires_at > datetime('now');")

    echo -e "  ${WHITE}Registered Agents:${RESET} $total_agents"
    echo -e "  ${GREEN}Active (60s):${RESET}      $active"
    echo -e "  ${AMBER}Pending Messages:${RESET}  $pending_msgs"
    echo -e "  ${BLUE}Active Locks:${RESET}      $active_locks"

    echo -e "\n${WHITE}Recent Events:${RESET}"
    sqlite3 "$PROTOCOL_DB" "SELECT event_type, agent_id, details, created_at FROM events ORDER BY id DESC LIMIT 5;"
}

# Run heartbeat daemon (background)
daemon() {
    local agent_id="${1:-$MY_CLAUDE}"
    echo -e "${GREEN}Starting heartbeat daemon for $agent_id...${RESET}"

    while true; do
        heartbeat "$agent_id" > /dev/null
        sleep $HEARTBEAT_INTERVAL
    done
}

# Sync state with memory system
sync_memory() {
    local agent_id="${MY_CLAUDE:-anonymous}"

    # Export current state to memory
    local state_file="$MEMORY_DIR/agent-state-${agent_id}.json"
    sqlite3 "$PROTOCOL_DB" "SELECT json_object(
        'agent_id', agent_id,
        'state', state,
        'load', current_load,
        'last_heartbeat', last_heartbeat
    ) FROM agent_state WHERE agent_id='$agent_id';" > "$state_file"

    echo -e "${GREEN}✓${RESET} State synced to memory: $state_file"
}

# Cleanup old data
cleanup() {
    sqlite3 "$PROTOCOL_DB" "
        DELETE FROM messages WHERE created_at < datetime('now', '-${MESSAGE_RETENTION} seconds');
        DELETE FROM events WHERE created_at < datetime('now', '-86400 seconds');
        DELETE FROM locks WHERE released=1;
    "
    echo -e "${GREEN}✓${RESET} Cleaned up old protocol data"
}

# Help
show_help() {
    echo -e "${PINK}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}  ${WHITE}🔗 BLACKROAD AGENT COORDINATION PROTOCOL${RESET}                  ${PINK}║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo
    echo -e "${WHITE}Commands:${RESET}"
    echo -e "  ${GREEN}init${RESET}                 Initialize protocol database"
    echo -e "  ${GREEN}heartbeat${RESET} [agent]    Send heartbeat signal"
    echo -e "  ${GREEN}send${RESET} <to> <type> <msg>  Send message to agent"
    echo -e "  ${GREEN}broadcast${RESET} <type> <msg>  Broadcast to all agents"
    echo -e "  ${GREEN}receive${RESET} [agent]      Receive pending messages"
    echo -e "  ${GREEN}ack${RESET} <msg_id>         Acknowledge a message"
    echo -e "  ${GREEN}lock${RESET} <resource>      Acquire distributed lock"
    echo -e "  ${GREEN}unlock${RESET} <resource>    Release lock"
    echo -e "  ${GREEN}status${RESET}               Protocol status overview"
    echo -e "  ${GREEN}check-dead${RESET}           Find unresponsive agents"
    echo -e "  ${GREEN}daemon${RESET} [agent]       Run heartbeat daemon"
    echo -e "  ${GREEN}sync${RESET}                 Sync state to memory system"
    echo -e "  ${GREEN}cleanup${RESET}              Remove old data"
}

# Main
case "${1:-help}" in
    init) init_db ;;
    heartbeat|hb) heartbeat "$2" ;;
    send) send "$2" "$3" "$4" ;;
    broadcast|bc) broadcast "$2" "$3" ;;
    receive|recv) receive "$2" ;;
    ack) ack "$2" ;;
    lock) lock "$2" "$3" ;;
    unlock) unlock "$2" ;;
    status) status ;;
    check-dead|dead) check_dead_agents ;;
    daemon) daemon "$2" ;;
    sync) sync_memory ;;
    cleanup) cleanup ;;
    help|--help|-h) show_help ;;
    *) show_help ;;
esac
