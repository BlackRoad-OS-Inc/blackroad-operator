#!/bin/bash
# BlackRoad Memory System - Distributed Agent Coordination
# Usage: memory-system.sh <command> [args]

MEMORY_DIR="$HOME/.blackroad/memory"
JOURNAL="$MEMORY_DIR/journals/master-journal.jsonl"
mkdir -p "$MEMORY_DIR/journals" "$MEMORY_DIR/sessions" "$MEMORY_DIR/active-agents" "$MEMORY_DIR/tasks" "$MEMORY_DIR/til"

log() {
    local action="$1"
    local entity="$2"
    local details="$3"
    local tags="$4"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local hash=$(echo -n "$timestamp$action$entity" | sha256sum | cut -c1-8)
    local hostname=$(hostname)

    local entry=$(cat << EOF
{"timestamp":"$timestamp","agent":"$hostname","action":"$action","entity":"$entity","details":"$details","tags":"$tags","hash":"$hash"}
EOF
)
    echo "$entry" >> "$JOURNAL"
    echo -e "\033[38;5;135m[MEMORY]\033[0m Logged: $action → $entity (hash: $hash...)"
}

summary() {
    echo -e "\033[38;5;205m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
    echo -e "\033[1;37m  [MEMORY] System Status - $(hostname)\033[0m"
    echo -e "\033[38;5;205m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"

    if [[ -f "$JOURNAL" ]]; then
        local entries=$(wc -l < "$JOURNAL" 2>/dev/null || echo "0")
        local last_entry=$(tail -1 "$JOURNAL" 2>/dev/null | jq -r '.timestamp // "none"' 2>/dev/null || echo "none")
        echo "  Journal entries: $entries"
        echo "  Last entry: $last_entry"
    else
        echo "  Journal: not initialized"
    fi

    local active_agents=$(ls -1 "$MEMORY_DIR/active-agents/" 2>/dev/null | wc -l || echo "0")
    local tasks=$(ls -1 "$MEMORY_DIR/tasks/" 2>/dev/null | wc -l || echo "0")
    local til=$(ls -1 "$MEMORY_DIR/til/" 2>/dev/null | wc -l || echo "0")

    echo "  Active agents: $active_agents"
    echo "  Tasks: $tasks"
    echo "  TIL broadcasts: $til"
}

recent() {
    local n="${1:-10}"
    if [[ -f "$JOURNAL" ]]; then
        tail -n "$n" "$JOURNAL" | jq -r '"\(.timestamp | split("T")[0]) [\(.action)] \(.entity): \(.details | .[0:60])"' 2>/dev/null
    else
        echo "No journal entries"
    fi
}

search() {
    local query="$1"
    if [[ -f "$JOURNAL" ]]; then
        grep -i "$query" "$JOURNAL" | tail -20 | jq -r '"\(.timestamp | split("T")[0]) [\(.action)] \(.entity)"' 2>/dev/null
    fi
}

case "$1" in
    log) log "$2" "$3" "$4" "$5" ;;
    summary) summary ;;
    recent) recent "$2" ;;
    search) search "$2" ;;
    check) summary ;;
    *)
        echo "memory-system.sh - BlackRoad Memory"
        echo ""
        echo "Commands:"
        echo "  log <action> <entity> <details> <tags>"
        echo "  summary    - Show memory status"
        echo "  recent [n] - Show recent entries"
        echo "  search <q> - Search journal"
        ;;
esac
