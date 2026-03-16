#!/bin/bash
# Memory Collaboration Reminder
# Reminds Claude agents to check memory and coordinate

set -e

MEMORY_DIR="$HOME/.blackroad/memory"
PROTOCOL_FILE="$HOME/CLAUDE_COLLABORATION_PROTOCOL.md"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Script paths
SCRIPTS="$HOME/blackroad-operator/scripts/memory"
MEM_SYS="$SCRIPTS/memory-system.sh"
CODEX="$SCRIPTS/memory-codex.sh"
TODOS="$SCRIPTS/memory-infinite-todos.sh"
TASKS="$SCRIPTS/memory-task-marketplace.sh"
TIL="$SCRIPTS/memory-til-broadcast.sh"
INDEXER="$SCRIPTS/memory-indexer.sh"

# Show reminder banner
show_reminder() {
    # Get live counts
    local journal_count codex_solutions codex_patterns todo_active todo_count task_available til_count
    journal_count=$(wc -l < "$MEMORY_DIR/journals/master-journal.jsonl" 2>/dev/null | tr -d ' ' || echo 0)
    codex_solutions=$(sqlite3 "$HOME/.blackroad/memory/codex/codex.db" "SELECT COUNT(*) FROM solutions" 2>/dev/null || echo 0)
    codex_patterns=$(sqlite3 "$HOME/.blackroad/memory/codex/codex.db" "SELECT COUNT(*) FROM patterns" 2>/dev/null || echo 0)
    codex_practices=$(sqlite3 "$HOME/.blackroad/memory/codex/codex.db" "SELECT COUNT(*) FROM best_practices" 2>/dev/null || echo 0)
    codex_anti=$(sqlite3 "$HOME/.blackroad/memory/codex/codex.db" "SELECT COUNT(*) FROM anti_patterns" 2>/dev/null || echo 0)
    codex_lessons=$(sqlite3 "$HOME/.blackroad/memory/codex/codex.db" "SELECT COUNT(*) FROM lessons_learned" 2>/dev/null || echo 0)
    todo_count=$(find "$MEMORY_DIR/infinite-todos/projects" -name "*.json" -type f 2>/dev/null | wc -l | tr -d ' ' || echo 0)
    til_count=$(find "$MEMORY_DIR/til" -name "til-*.json" -type f 2>/dev/null | wc -l | tr -d ' ' || echo 0)

    if [[ -f "$HOME/.blackroad/memory/tasks.db" ]]; then
        task_available=$(sqlite3 "$HOME/.blackroad/memory/tasks.db" "SELECT COUNT(*) FROM tasks WHERE status='available'" 2>/dev/null || echo 0)
    else
        task_available="N/A"
    fi

    # Show active project todos that aren't 100%
    local active_projects=""
    if [[ -d "$MEMORY_DIR/infinite-todos/projects" ]]; then
        active_projects=$(find "$MEMORY_DIR/infinite-todos/projects" -name "*.json" -type f -exec \
            jq -r 'select(.status == "active" and .progress < 100) | "   - \(.project_id): \(.title) [\(.progress)%] (\(.todos | map(select(.status == "pending")) | length) pending)"' {} \; 2>/dev/null || true)
    fi

    cat <<BANNER

╔══════════════════════════════════════════════════════════════╗
║  BLACKROAD MEMORY SYSTEM — AGENT BRIEFING                   ║
╚══════════════════════════════════════════════════════════════╝

SYSTEM STATUS:
  Journal entries: $journal_count | TILs: $til_count
  Codex: $codex_solutions solutions, $codex_patterns patterns, $codex_practices practices, $codex_anti anti-patterns, $codex_lessons lessons
  Projects: $todo_count | Marketplace tasks: $task_available available

ACTIVE PROJECTS (pick one and help):
$active_projects

HOW TO HELP:
  1. Check codex before solving anything:
     $CODEX search "<your-problem>"

  2. Claim a project or marketplace task:
     $TODOS show <project-id>
     $TASKS claim <task-id>

  3. Log your work:
     $MEM_SYS log <action> <entity> "<details>"

  4. When you learn something new, broadcast it:
     $TIL broadcast <category> "<learning>"
     Categories: discovery, pattern, gotcha, tip, tool, performance, security

  5. When you solve something, add to codex:
     $CODEX add-solution "<name>" "<category>" "<problem>" "<solution>"

  6. When done with a todo, mark it:
     $TODOS complete-todo <project-id> <todo-id>

RULES:
  - Check [MEMORY] and [CODEX] before starting work
  - Don't rebuild what's already solved — search codex first
  - Log progress so other sessions can pick up where you left off
  - Broadcast learnings so the whole fleet benefits

BANNER
}

# Check if Claude is following protocol
check_compliance() {
    local instance_id="$1"

    if [ -z "$instance_id" ]; then
        echo -e "${RED}❌ No instance ID provided${NC}"
        echo -e "${YELLOW}Run: MY_CLAUDE=\$(~/memory-sync-daemon.sh register \"claude-[name]\")${NC}"
        return 1
    fi

    # Check if instance is registered
    local instance_file="$MEMORY_DIR/sync/instances/${instance_id}.json"
    if [ ! -f "$instance_file" ]; then
        echo -e "${RED}❌ Instance not registered${NC}"
        echo -e "${YELLOW}Run: ~/memory-sync-daemon.sh register \"${instance_id}\"${NC}"
        return 1
    fi

    # Check if announcement was made
    local announcements=$(grep -c "\"action\":\"announce\"" "$MEMORY_DIR/journals/master-journal.jsonl" 2>/dev/null || echo "0")
    if [ "$announcements" -eq 0 ]; then
        echo -e "${YELLOW}⚠️  No announcement found${NC}"
        echo -e "${YELLOW}Did you announce your work? (See protocol)${NC}"
        return 1
    fi

    # Check last seen time
    local last_seen=$(jq -r '.last_seen' "$instance_file")
    echo -e "${GREEN}✅ Instance registered and active${NC}"
    echo -e "${GREEN}   Last seen: $last_seen${NC}"

    # Check for progress updates
    local progress_count=$(grep -c "\"action\":\"progress\"" "$MEMORY_DIR/journals/master-journal.jsonl" 2>/dev/null || echo "0")
    echo -e "${GREEN}   Progress updates: $progress_count${NC}"

    # Check for coordination
    local coord_count=$(grep -c "\"action\":\"coordinate\"" "$MEMORY_DIR/journals/master-journal.jsonl" 2>/dev/null || echo "0")
    echo -e "${GREEN}   Coordination messages: $coord_count${NC}"

    return 0
}

# Watch mode - remind every 60 seconds
watch_mode() {
    local instance_id="$1"

    echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  🔄 Collaboration Watch Mode (60s intervals)      ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Instance: $instance_id${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""

    while true; do
        clear
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${CYAN}  🔍 [MEMORY] CHECK ($(date +%H:%M:%S))${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        # Show live context
        ~/memory-realtime-context.sh live "$instance_id" compact 2>/dev/null

        echo ""
        echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${PURPLE}  📜 [CODEX] STATUS${NC}"
        echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        # Show Codex stats
        local total_components=$(sqlite3 ~/blackroad-codex/index/components.db "SELECT COUNT(*) FROM components" 2>/dev/null || echo "0")
        echo -e "  📦 Total Components: ${GREEN}$total_components${NC}"
        echo -e "  🔍 Search: ${YELLOW}python3 ~/blackroad-codex-search.py \"your-query\"${NC}"
        echo -e "  📐 Verify: ${YELLOW}~/blackroad-codex-verification-suite.sh verify <id> <file>${NC}"

        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}⏰ Next check in 60 seconds...${NC}"
        echo -e "${YELLOW}💡 [MEMORY] Update progress | [CODEX] Search before building!${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

        sleep 60
    done
}

# Show active Claudes
show_active_claudes() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  👥 Active Claude Agents                          ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
    echo ""

    ~/memory-sync-daemon.sh instances

    echo ""
    echo -e "${CYAN}Recent Announcements:${NC}"
    grep "\"action\":\"announce\"" "$MEMORY_DIR/journals/master-journal.jsonl" 2>/dev/null | \
        tail -5 | \
        jq -r '"  [" + .timestamp[11:19] + "] " + .entity' || echo "  No announcements yet"

    echo ""
    echo -e "${CYAN}Recent Progress Updates:${NC}"
    grep "\"action\":\"progress\"" "$MEMORY_DIR/journals/master-journal.jsonl" 2>/dev/null | \
        tail -5 | \
        jq -r '"  [" + .timestamp[11:19] + "] " + .details' || echo "  No progress updates yet"

    echo ""
    echo -e "${CYAN}Coordination Messages:${NC}"
    grep "\"action\":\"coordinate\"" "$MEMORY_DIR/journals/master-journal.jsonl" 2>/dev/null | \
        tail -5 | \
        jq -r '"  [" + .timestamp[11:19] + "] " + .details' || echo "  No coordination yet"
}

# Show help
show_help() {
    cat <<EOF
Memory Collaboration Reminder v1.0.0

USAGE:
    memory-collaboration-reminder.sh <command> [options]

COMMANDS:
    reminder                    Show collaboration reminder
    check <instance-id>         Check if Claude is following protocol
    watch <instance-id>         Watch mode (remind every 60s)
    active                      Show all active Claudes
    protocol                    Open protocol document
    help                        Show this help

EXAMPLES:
    # Show reminder
    ~/memory-collaboration-reminder.sh reminder

    # Check compliance
    ~/memory-collaboration-reminder.sh check claude-api

    # Watch mode (auto-check every 60s)
    ~/memory-collaboration-reminder.sh watch claude-api

    # See all active Claudes
    ~/memory-collaboration-reminder.sh active

    # Read full protocol
    ~/memory-collaboration-reminder.sh protocol

INTEGRATION:
    Add to Claude Code startup:
    ~/memory-collaboration-reminder.sh reminder

    Or use watch mode while working:
    ~/memory-collaboration-reminder.sh watch \$MY_CLAUDE

EOF
}

# Main command handler
case "${1:-reminder}" in
    reminder)
        show_reminder
        ;;
    check)
        if [ -z "$2" ]; then
            echo "Usage: $0 check <instance-id>"
            exit 1
        fi
        check_compliance "$2"
        ;;
    watch)
        if [ -z "$2" ]; then
            echo "Usage: $0 watch <instance-id>"
            exit 1
        fi
        watch_mode "$2"
        ;;
    active)
        show_active_claudes
        ;;
    protocol)
        if [ -f "$PROTOCOL_FILE" ]; then
            cat "$PROTOCOL_FILE"
        else
            echo "Protocol file not found: $PROTOCOL_FILE"
            exit 1
        fi
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
