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
# BlackRoad 30K Memory Bridge
# Connects 30K agent infrastructure to the shared memory system
# Enables persistent state, coordination, and knowledge sharing

set -e

# Colors
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
WHITE='\033[1;37m'
RESET='\033[0m'

# Paths
MEMORY_DIR="${HOME}/.blackroad/memory"
ORCHESTRATOR_DB="${HOME}/.blackroad-30k-orchestrator.db"
PROTOCOL_DB="${HOME}/.blackroad-agent-protocol.db"
JOURNAL_FILE="${MEMORY_DIR}/journals/master-journal.jsonl"

# Ensure memory structure exists
init() {
    mkdir -p "$MEMORY_DIR/30k-agents"
    mkdir -p "$MEMORY_DIR/30k-agents/state"
    mkdir -p "$MEMORY_DIR/30k-agents/tasks"
    mkdir -p "$MEMORY_DIR/30k-agents/metrics"
    echo -e "${GREEN}✓${RESET} 30K memory bridge initialized"
}

# Sync agent state to memory
sync_state() {
    local output_file="$MEMORY_DIR/30k-agents/state/hierarchy-$(date +%Y%m%d-%H%M%S).json"

    # Export hierarchy state
    sqlite3 "$ORCHESTRATOR_DB" "
        SELECT json_group_array(json_object(
            'agent_id', agent_id,
            'name', agent_name,
            'level', level,
            'division', division,
            'status', status,
            'tasks_completed', tasks_completed,
            'last_heartbeat', last_heartbeat
        ))
        FROM agent_hierarchy;
    " > "$output_file"

    # Create latest symlink
    ln -sf "$output_file" "$MEMORY_DIR/30k-agents/state/latest.json"

    echo -e "${GREEN}✓${RESET} State synced: $output_file"

    # Log to master journal
    log_to_journal "state-sync" "30k-agents" "Synced $(sqlite3 "$ORCHESTRATOR_DB" "SELECT COUNT(*) FROM agent_hierarchy;") agents"
}

# Sync tasks to memory
sync_tasks() {
    local output_file="$MEMORY_DIR/30k-agents/tasks/queue-$(date +%Y%m%d-%H%M%S).json"

    sqlite3 "$ORCHESTRATOR_DB" "
        SELECT json_group_array(json_object(
            'task_id', task_id,
            'title', title,
            'priority', priority,
            'status', status,
            'assigned_agent', assigned_agent,
            'created_at', created_at,
            'completed_at', completed_at
        ))
        FROM task_queue
        ORDER BY created_at DESC
        LIMIT 1000;
    " > "$output_file"

    ln -sf "$output_file" "$MEMORY_DIR/30k-agents/tasks/latest.json"

    echo -e "${GREEN}✓${RESET} Tasks synced: $output_file"

    log_to_journal "task-sync" "30k-agents" "Synced task queue"
}

# Export metrics to memory
export_metrics() {
    local output_file="$MEMORY_DIR/30k-agents/metrics/snapshot-$(date +%Y%m%d-%H%M%S).json"

    local l1=$(sqlite3 "$ORCHESTRATOR_DB" "SELECT COUNT(*) FROM agent_hierarchy WHERE level=1;")
    local l2=$(sqlite3 "$ORCHESTRATOR_DB" "SELECT COUNT(*) FROM agent_hierarchy WHERE level=2;")
    local l3=$(sqlite3 "$ORCHESTRATOR_DB" "SELECT COUNT(*) FROM agent_hierarchy WHERE level=3;")
    local l4=$(sqlite3 "$ORCHESTRATOR_DB" "SELECT COUNT(*) FROM agent_hierarchy WHERE level=4;")
    local active=$(sqlite3 "$ORCHESTRATOR_DB" "SELECT COUNT(*) FROM agent_hierarchy WHERE status='active';")
    local pending=$(sqlite3 "$ORCHESTRATOR_DB" "SELECT COUNT(*) FROM task_queue WHERE status='pending';")
    local completed=$(sqlite3 "$ORCHESTRATOR_DB" "SELECT COUNT(*) FROM task_queue WHERE status='completed';")

    cat > "$output_file" <<EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "hierarchy": {
        "level_1_operator": $l1,
        "level_2_commanders": $l2,
        "level_3_managers": $l3,
        "level_4_workers": $l4,
        "total_capacity": 30000
    },
    "agents": {
        "active": $active,
        "total_registered": $((l1 + l2 + l3 + l4))
    },
    "tasks": {
        "pending": $pending,
        "completed": $completed
    },
    "divisions": $(sqlite3 "$ORCHESTRATOR_DB" "
        SELECT json_group_array(json_object(
            'name', division,
            'count', COUNT(*)
        ))
        FROM agent_hierarchy
        WHERE division IS NOT NULL
        GROUP BY division;
    ")
}
EOF

    ln -sf "$output_file" "$MEMORY_DIR/30k-agents/metrics/latest.json"

    echo -e "${GREEN}✓${RESET} Metrics exported: $output_file"

    log_to_journal "metrics-export" "30k-agents" "L1:$l1 L2:$l2 L3:$l3 L4:$l4 active:$active"
}

# Log to master journal (PS-SHA-infinity format)
log_to_journal() {
    local action="$1"
    local entity="$2"
    local details="$3"

    if [[ -f "$JOURNAL_FILE" ]]; then
        # Get last hash
        local prev_hash=$(tail -1 "$JOURNAL_FILE" 2>/dev/null | jq -r '.hash // "genesis"')
        local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
        local data="${timestamp}|${action}|${entity}|${details}|${prev_hash}"
        local new_hash=$(echo -n "$data" | shasum -a 256 | cut -c1-16)

        # Append to journal
        echo "{\"timestamp\":\"$timestamp\",\"action\":\"$action\",\"entity\":\"$entity\",\"details\":\"$details\",\"prev_hash\":\"$prev_hash\",\"hash\":\"$new_hash\"}" >> "$JOURNAL_FILE"
    fi
}

# Full sync
sync_all() {
    echo -e "${PINK}═══ 30K MEMORY BRIDGE SYNC ═══${RESET}"
    init
    sync_state
    sync_tasks
    export_metrics
    echo -e "\n${GREEN}✓ Full sync complete${RESET}"
}

# Watch mode - continuous sync
watch() {
    local interval="${1:-60}"
    echo -e "${AMBER}Starting watch mode (interval: ${interval}s)...${RESET}"

    while true; do
        sync_all
        echo -e "${BLUE}Next sync in ${interval}s...${RESET}"
        sleep "$interval"
    done
}

# Status report
status() {
    echo -e "${PINK}═══ 30K MEMORY BRIDGE STATUS ═══${RESET}"

    echo -e "\n${WHITE}Memory Directory:${RESET} $MEMORY_DIR/30k-agents"

    if [[ -f "$MEMORY_DIR/30k-agents/state/latest.json" ]]; then
        local state_time=$(stat -f %Sm "$MEMORY_DIR/30k-agents/state/latest.json")
        echo -e "${GREEN}✓${RESET} State: last sync $state_time"
    else
        echo -e "${AMBER}○${RESET} State: not synced"
    fi

    if [[ -f "$MEMORY_DIR/30k-agents/tasks/latest.json" ]]; then
        local tasks_time=$(stat -f %Sm "$MEMORY_DIR/30k-agents/tasks/latest.json")
        echo -e "${GREEN}✓${RESET} Tasks: last sync $tasks_time"
    else
        echo -e "${AMBER}○${RESET} Tasks: not synced"
    fi

    if [[ -f "$MEMORY_DIR/30k-agents/metrics/latest.json" ]]; then
        local metrics_time=$(stat -f %Sm "$MEMORY_DIR/30k-agents/metrics/latest.json")
        echo -e "${GREEN}✓${RESET} Metrics: last sync $metrics_time"

        echo -e "\n${WHITE}Latest Metrics:${RESET}"
        cat "$MEMORY_DIR/30k-agents/metrics/latest.json" | jq -r '
            "  Hierarchy: L1=\(.hierarchy.level_1_operator) L2=\(.hierarchy.level_2_commanders) L3=\(.hierarchy.level_3_managers) L4=\(.hierarchy.level_4_workers)",
            "  Active Agents: \(.agents.active) / \(.agents.total_registered)",
            "  Tasks: \(.tasks.pending) pending, \(.tasks.completed) completed"
        '
    else
        echo -e "${AMBER}○${RESET} Metrics: not synced"
    fi
}

# Help
show_help() {
    echo -e "${PINK}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}  ${WHITE}🧠 BLACKROAD 30K MEMORY BRIDGE${RESET}                             ${PINK}║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo
    echo -e "${WHITE}Commands:${RESET}"
    echo -e "  ${GREEN}init${RESET}          Initialize memory bridge directories"
    echo -e "  ${GREEN}sync-state${RESET}    Sync agent hierarchy to memory"
    echo -e "  ${GREEN}sync-tasks${RESET}    Sync task queue to memory"
    echo -e "  ${GREEN}metrics${RESET}       Export metrics snapshot"
    echo -e "  ${GREEN}sync${RESET}          Full sync (state + tasks + metrics)"
    echo -e "  ${GREEN}watch${RESET} [sec]   Continuous sync mode"
    echo -e "  ${GREEN}status${RESET}        Show bridge status"
}

# Main
case "${1:-help}" in
    init) init ;;
    sync-state) sync_state ;;
    sync-tasks) sync_tasks ;;
    metrics) export_metrics ;;
    sync|sync-all) sync_all ;;
    watch) watch "$2" ;;
    status) status ;;
    help|--help|-h) show_help ;;
    *) show_help ;;
esac
