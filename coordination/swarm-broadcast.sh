#!/bin/bash
# coordination/swarm-broadcast.sh — Broadcast swarm events to all 30K agents
# Integrates the PR swarm system with the existing agent coordination mesh
#
# Usage:
#   ./coordination/swarm-broadcast.sh launch <swarm-id> <task> <agents>
#   ./coordination/swarm-broadcast.sh update <swarm-id> <status>
#   ./coordination/swarm-broadcast.sh complete <swarm-id>

set -euo pipefail

GREEN='\033[0;32m'; RED='\033[0;31m'; CYAN='\033[0;36m'
YELLOW='\033[1;33m'; MAGENTA='\033[0;35m'; NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BROADCAST_FILE="${SCRIPT_DIR}/broadcast-message.json"
QUEUE_DIR="${ROOT_DIR}/shared/mesh/queue"
INBOX_ROOT="${ROOT_DIR}/shared/inbox"

log()  { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${CYAN}i${NC} $1"; }

cmd_launch() {
  local swarm_id="${1:?swarm_id required}"
  local task="${2:?task required}"
  local agents="${3:-lucidia,octavia,alice,cipher}"

  echo -e "${MAGENTA}SWARM BROADCAST: LAUNCH${NC}"
  echo ""

  # Write broadcast message
  cat > "$BROADCAST_FILE" << EOF
{
  "from": "SWARM_COORDINATOR",
  "to": "ALL_AGENTS",
  "priority": "HIGH",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "subject": "SWARM LAUNCHED: ${swarm_id}",
  "type": "swarm_event",
  "message": {
    "event": "swarm_launch",
    "swarm_id": "${swarm_id}",
    "task": "${task}",
    "agents": "$(echo "$agents" | tr ',' '", "')",
    "coordination": {
      "type": "github-prs",
      "branch_pattern": "swarm/${swarm_id}/agent/*",
      "status": "ACTIVE"
    },
    "call_to_action": "Assigned agents: create your branches and push work. All agents: monitor swarm progress via PR comments."
  }
}
EOF

  log "Broadcast message written"

  # Queue to mesh
  mkdir -p "$QUEUE_DIR"
  local ts
  ts=$(date +%s)
  cp "$BROADCAST_FILE" "${QUEUE_DIR}/${ts}_swarm_launch.json"
  log "Queued to mesh: ${ts}_swarm_launch.json"

  # Deliver to assigned agent inboxes
  IFS=',' read -ra AGENT_LIST <<< "$agents"
  for agent in "${AGENT_LIST[@]}"; do
    agent=$(echo "$agent" | tr -d ' ')
    local inbox="${INBOX_ROOT}/${agent}"
    mkdir -p "$inbox"
    cat > "${inbox}/swarm-${swarm_id}.json" << AGENT_EOF
{
  "from": "SWARM_COORDINATOR",
  "to": "${agent}",
  "type": "swarm_assignment",
  "swarm_id": "${swarm_id}",
  "task": "${task}",
  "branch": "swarm/${swarm_id}/agent/${agent}",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "instructions": "Create your branch, implement your portion, push, and open a PR."
}
AGENT_EOF
    info "  -> ${agent} inbox"
  done

  echo ""
  log "Swarm ${swarm_id} broadcast to ${#AGENT_LIST[@]} agents + mesh"
}

cmd_update() {
  local swarm_id="${1:?swarm_id required}"
  local status="${2:?status required}"

  cat > "$BROADCAST_FILE" << EOF
{
  "from": "SWARM_COORDINATOR",
  "to": "ALL_AGENTS",
  "priority": "MEDIUM",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "subject": "SWARM UPDATE: ${swarm_id} — ${status}",
  "type": "swarm_event",
  "message": {
    "event": "swarm_update",
    "swarm_id": "${swarm_id}",
    "status": "${status}"
  }
}
EOF

  mkdir -p "$QUEUE_DIR"
  cp "$BROADCAST_FILE" "${QUEUE_DIR}/$(date +%s)_swarm_update.json"
  log "Swarm ${swarm_id} status update broadcast: ${status}"
}

cmd_complete() {
  local swarm_id="${1:?swarm_id required}"

  cat > "$BROADCAST_FILE" << EOF
{
  "from": "SWARM_COORDINATOR",
  "to": "ALL_AGENTS",
  "priority": "HIGH",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "subject": "SWARM COMPLETE: ${swarm_id}",
  "type": "swarm_event",
  "message": {
    "event": "swarm_complete",
    "swarm_id": "${swarm_id}",
    "status": "MERGED",
    "call_to_action": "Swarm work merged to main. All agents: update your local context."
  }
}
EOF

  mkdir -p "$QUEUE_DIR"
  cp "$BROADCAST_FILE" "${QUEUE_DIR}/$(date +%s)_swarm_complete.json"
  log "Swarm ${swarm_id} completion broadcast sent"
}

case "${1:-help}" in
  launch)   cmd_launch "${@:2}" ;;
  update)   cmd_update "${@:2}" ;;
  complete) cmd_complete "${@:2}" ;;
  *)
    echo "Usage: $0 <command> [args]"
    echo ""
    echo "Commands:"
    echo "  launch <swarm-id> <task> <agents>   Broadcast swarm launch"
    echo "  update <swarm-id> <status>          Broadcast status update"
    echo "  complete <swarm-id>                 Broadcast swarm completion"
    ;;
esac
