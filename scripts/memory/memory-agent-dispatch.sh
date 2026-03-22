#!/bin/bash
# BlackRoad Agent Dispatch — Task dispatch, sprint board, work queue
# Usage: memory-agent-dispatch.sh <command> [args]
set -e

COLLAB_DB="$HOME/.blackroad/collaboration.db"
TASKS_DB="$HOME/.blackroad/memory/tasks.db"
PROJECTS_DIR="$HOME/.blackroad/memory/infinite-todos/projects"
SESSION_FILE="$HOME/.blackroad/memory/current-collab-session"
JOURNAL="$HOME/.blackroad/memory/journals/master-journal.jsonl"
SLACK_API="https://blackroad-slack.amundsonalexa.workers.dev"
TODOS="$HOME/blackroad-operator/scripts/memory/memory-infinite-todos.sh"
COLLAB="$HOME/blackroad-operator/scripts/memory/memory-collaboration.sh"

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

sql_collab() { sqlite3 "$COLLAB_DB" "$@" 2>/dev/null; }
sql_tasks() { sqlite3 "$TASKS_DB" "$@" 2>/dev/null; }

get_session() {
    [[ -f "$SESSION_FILE" ]] && cat "$SESSION_FILE" || echo "unknown"
}

post_to_slack() {
    curl -s --max-time 3 --connect-timeout 2 \
        -X POST "$SLACK_API/post" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg t "$1" '{text:$t}')" >/dev/null 2>&1 || true
}

log_journal() {
    local action="$1" entity="$2" details="$3"
    local ts
    ts=$(date -u +"%Y-%m-%dT%H:%M:%S.3NZ")
    local hash
    hash=$(echo -n "$ts$action$entity$details" | shasum -a 256 | cut -c1-16)
    printf '{"timestamp":"%s","action":"%s","entity":"%s","details":"%s","hash":"%s"}\n' \
        "$ts" "$action" "$entity" "$details" "$hash" >> "$JOURNAL" 2>/dev/null || true
}

# ── DISPATCH ──
cmd_dispatch() {
    local project_id="$1"
    [[ -z "$project_id" ]] && { echo -e "${RED}Usage: $0 dispatch <project-id>${NC}"; exit 1; }

    local pf="$PROJECTS_DIR/${project_id}.json"
    if [[ ! -f "$pf" ]]; then
        echo -e "${RED}Project not found: $project_id${NC}"
        exit 1
    fi

    local next_todo next_id
    next_todo=$(jq -r '[.todos[] | select(.status == "pending")][0].text // empty' "$pf")
    next_id=$(jq -r '[.todos[] | select(.status == "pending")][0].todo_id // empty' "$pf")

    if [[ -z "$next_todo" ]]; then
        echo -e "${GREEN}Project $project_id has no pending todos!${NC}"
        return
    fi

    local title
    title=$(jq -r '.title' "$pf")
    local session
    session=$(get_session)

    echo -e "${PINK}[DISPATCH]${NC} ${BOLD}$title${NC}"
    echo -e "  ${YELLOW}→${NC} [$next_id] $next_todo"
    echo ""

    # Post to Slack
    post_to_slack "🎯 *Task Dispatched* [$session]\nProject: *$title*\nTodo: $next_todo\nID: $next_id" &

    # Log
    log_journal "dispatch" "$project_id" "Dispatched: $next_todo ($next_id)"
    echo -e "  ${GREEN}Dispatched and announced${NC}"
}

# ── QUEUE ──
cmd_queue() {
    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}Available Work Queue${NC}                                    ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Project todos
    echo -e "  ${BOLD}📋 Project Todos:${NC}"
    local found=0
    for f in "$PROJECTS_DIR"/*.json; do
        [[ ! -f "$f" ]] && continue
        local status
        status=$(jq -r '.status' "$f")
        [[ "$status" != "active" ]] && continue

        local pending
        pending=$(jq '[.todos[] | select(.status == "pending")] | length' "$f")
        [[ "$pending" -eq 0 ]] && continue

        local pid title progress
        pid=$(jq -r '.project_id' "$f")
        title=$(jq -r '.title' "$f")
        progress=$(jq -r '.progress' "$f")

        echo -e "    ${CYAN}$pid${NC} — $title (${progress}%, $pending pending)"
        jq -r '[.todos[] | select(.status == "pending")][0:3][] | "      ⬜ [\(.todo_id)] \(.text)"' "$f"
        found=1
    done
    [[ "$found" -eq 0 ]] && echo -e "    ${GREEN}No pending project todos${NC}"
    echo ""

    # Marketplace tasks
    if [[ -f "$TASKS_DB" ]]; then
        echo -e "  ${BOLD}🏪 Marketplace Tasks:${NC}"
        local available
        available=$(sql_tasks "SELECT count(*) FROM tasks WHERE status='available';")
        echo -e "    $available available task(s)"

        sql_tasks "SELECT task_id, title FROM tasks WHERE status='available' ORDER BY created_at DESC LIMIT 5;" 2>/dev/null | while IFS='|' read -r tid title; do
            echo -e "    ${BLUE}$tid${NC}: $title"
        done
    fi
    echo ""
}

# ── CLAIM ──
cmd_claim() {
    local task_id="$1"
    [[ -z "$task_id" ]] && { echo -e "${RED}Usage: $0 claim <task-id>${NC}"; exit 1; }

    if [[ ! -f "$TASKS_DB" ]]; then
        echo -e "${RED}Task marketplace DB not found${NC}"
        exit 1
    fi

    local session
    session=$(get_session)
    local now
    now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    sql_tasks "UPDATE tasks SET status='claimed', claimed_by='$session', claimed_at='$now' WHERE task_id='$task_id' AND status='available';"

    local affected
    affected=$(sql_tasks "SELECT changes();")
    if [[ "$affected" -gt 0 ]]; then
        local title
        title=$(sql_tasks "SELECT title FROM tasks WHERE task_id='$task_id';")
        echo -e "${GREEN}Claimed:${NC} $title"
        post_to_slack "📌 *Task Claimed* [$session]: $title" &
        log_journal "task-claim" "$task_id" "Claimed by $session: $title"
    else
        echo -e "${YELLOW}Could not claim $task_id (may not exist or already claimed)${NC}"
    fi
}

# ── PROGRESS ──
cmd_progress() {
    local msg="$*"
    [[ -z "$msg" ]] && { echo -e "${RED}Usage: $0 progress <message>${NC}"; exit 1; }

    local session
    session=$(get_session)
    local now
    now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Log to collab DB
    if [[ -f "$COLLAB_DB" ]]; then
        local msg_id="prog-$(date +%s)-$$"
        sql_collab "INSERT INTO messages (msg_id, session_id, type, message, created_at) VALUES ('$msg_id', '$session', 'progress', '$(echo "$msg" | sed "s/'/''/g")', '$now');"
        sql_collab "UPDATE sessions SET last_seen='$now' WHERE session_id='$session';"
    fi

    echo -e "${GREEN}Progress:${NC} $msg"
    post_to_slack "⚡ *Progress* [$session]: $msg" &
    log_journal "progress" "$session" "$msg"
}

# ── DONE ──
cmd_done() {
    local todo_id="$1"
    local project_id="$2"

    if [[ -z "$todo_id" ]]; then
        echo -e "${RED}Usage: $0 done <todo-id> [project-id]${NC}"
        exit 1
    fi

    # If project not specified, search for it
    if [[ -z "$project_id" ]]; then
        for f in "$PROJECTS_DIR"/*.json; do
            [[ ! -f "$f" ]] && continue
            if jq -e ".todos[] | select(.todo_id == \"$todo_id\")" "$f" >/dev/null 2>&1; then
                project_id=$(jq -r '.project_id' "$f")
                break
            fi
        done
    fi

    if [[ -z "$project_id" ]]; then
        echo -e "${RED}Could not find todo $todo_id in any project${NC}"
        exit 1
    fi

    # Complete via infinite todos
    "$TODOS" complete-todo "$project_id" "$todo_id" 2>/dev/null || true

    local session
    session=$(get_session)
    echo -e "${GREEN}Completed:${NC} $todo_id in $project_id"
    post_to_slack "✅ *Todo Done* [$session]: $todo_id in $project_id" &
    log_journal "todo-complete" "$project_id" "Completed $todo_id"

    # Show next todo
    local pf="$PROJECTS_DIR/${project_id}.json"
    if [[ -f "$pf" ]]; then
        local next
        next=$(jq -r '[.todos[] | select(.status == "pending")][0].text // empty' "$pf")
        if [[ -n "$next" ]]; then
            echo -e "${YELLOW}Next:${NC} $next"
        else
            echo -e "${GREEN}All todos complete for $project_id!${NC}"
        fi
    fi
}

# ── SPRINT ──
cmd_sprint() {
    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}Sprint Board${NC}                                             ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # In Progress — active sessions with focus
    echo -e "  ${BOLD}🔄 In Progress:${NC}"
    if [[ -f "$COLLAB_DB" ]]; then
        sql_collab "SELECT session_id, focus FROM sessions WHERE status='active' AND focus != '' ORDER BY last_seen DESC LIMIT 10;" | while IFS='|' read -r sid focus; do
            echo -e "    ${GREEN}●${NC} ${CYAN}${sid}${NC} → $focus"
        done
        local no_focus
        no_focus=$(sql_collab "SELECT count(*) FROM sessions WHERE status='active' AND (focus='' OR focus IS NULL);")
        [[ "$no_focus" -gt 0 ]] && echo -e "    ${DIM}+ $no_focus session(s) without focus${NC}"
    fi
    echo ""

    # Claimed marketplace tasks
    if [[ -f "$TASKS_DB" ]]; then
        local claimed
        claimed=$(sql_tasks "SELECT count(*) FROM tasks WHERE status='claimed';")
        if [[ "$claimed" -gt 0 ]]; then
            echo -e "  ${BOLD}📌 Claimed Tasks:${NC}"
            sql_tasks "SELECT task_id, title, claimed_by FROM tasks WHERE status='claimed' ORDER BY claimed_at DESC LIMIT 5;" | while IFS='|' read -r tid title by; do
                echo -e "    ${BLUE}$tid${NC}: $title ${DIM}(${by})${NC}"
            done
            echo ""
        fi
    fi

    # Up Next — pending todos from top priority projects
    echo -e "  ${BOLD}📋 Up Next:${NC}"
    local count=0
    for f in "$PROJECTS_DIR"/*.json; do
        [[ ! -f "$f" ]] && continue
        [[ "$count" -ge 5 ]] && break
        local status
        status=$(jq -r '.status' "$f")
        [[ "$status" != "active" ]] && continue
        local pending
        pending=$(jq '[.todos[] | select(.status == "pending")] | length' "$f")
        [[ "$pending" -eq 0 ]] && continue

        local pid next_todo
        pid=$(jq -r '.project_id' "$f")
        next_todo=$(jq -r '[.todos[] | select(.status == "pending")][0].text' "$f")
        echo -e "    ⬜ ${CYAN}$pid${NC}: $next_todo"
        ((count++))
    done
    echo ""

    # Done today
    if [[ -f "$COLLAB_DB" ]]; then
        local done_today
        done_today=$(sql_collab "SELECT count(*) FROM messages WHERE type='progress' AND created_at > datetime('now', '-24 hours');")
        echo -e "  ${BOLD}✅ Done today:${NC} $done_today progress updates"
        sql_collab "SELECT message FROM messages WHERE type='progress' AND created_at > datetime('now', '-24 hours') ORDER BY created_at DESC LIMIT 5;" | while read -r msg; do
            echo -e "    ✓ $msg"
        done
    fi
}

# ── AUTOQUEUE ──
cmd_autoqueue() {
    echo -e "${PINK}[DISPATCH]${NC} ${BOLD}Auto-generating tasks from projects...${NC}"
    echo ""

    if [[ ! -f "$TASKS_DB" ]]; then
        echo -e "${RED}Task marketplace DB not found${NC}"
        exit 1
    fi

    local added=0
    for f in "$PROJECTS_DIR"/*.json; do
        [[ ! -f "$f" ]] && continue
        local status
        status=$(jq -r '.status' "$f")
        [[ "$status" != "active" ]] && continue

        local pid title
        pid=$(jq -r '.project_id' "$f")
        title=$(jq -r '.title' "$f")

        # Get pending todos not already in marketplace
        jq -r '.todos[] | select(.status == "pending") | "\(.todo_id)|\(.text)"' "$f" | while IFS='|' read -r tid text; do
            local existing
            existing=$(sql_tasks "SELECT count(*) FROM tasks WHERE task_id='${pid}-${tid}';")
            if [[ "$existing" -eq 0 ]]; then
                local now
                now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
                sql_tasks "INSERT INTO tasks (task_id, title, description, status, priority, category, created_at) VALUES ('${pid}-${tid}', '$(echo "$text" | sed "s/'/''/g")', 'From project: $title', 'available', 'medium', '$pid', '$now');" 2>/dev/null || true
                echo -e "  ${GREEN}+${NC} ${CYAN}${pid}-${tid}${NC}: $text"
                ((added++)) || true
            fi
        done
    done

    echo ""
    echo -e "${GREEN}Added $added task(s) to marketplace${NC}"
}

# ── HELP ──
cmd_help() {
    cat <<EOF
${PINK}╔════════════════════════════════════════════════════════════╗${NC}
${PINK}║${NC}  ${BOLD}BlackRoad Agent Dispatch${NC}                                 ${PINK}║${NC}
${PINK}╚════════════════════════════════════════════════════════════╝${NC}

${BOLD}Task Management:${NC}
  ${CYAN}dispatch <project>${NC}    Dispatch next todo for a project
  ${CYAN}queue${NC}                  Show all available work
  ${CYAN}claim <task-id>${NC}       Claim a marketplace task
  ${CYAN}done <todo-id>${NC}        Mark a todo as complete

${BOLD}Progress:${NC}
  ${CYAN}progress <msg>${NC}        Post progress update (DB + Slack)
  ${CYAN}sprint${NC}                Sprint board: in-progress, next, done

${BOLD}Automation:${NC}
  ${CYAN}autoqueue${NC}             Auto-generate marketplace tasks from projects
EOF
}

case "${1:-help}" in
    dispatch|dis)       shift; cmd_dispatch "$@" ;;
    queue|q)            cmd_queue ;;
    claim|c)            shift; cmd_claim "$@" ;;
    progress|prog)      shift; cmd_progress "$@" ;;
    done|complete)      shift; cmd_done "$@" ;;
    sprint|sp)          cmd_sprint ;;
    autoqueue|auto)     cmd_autoqueue ;;
    help|--help|-h)     cmd_help ;;
    *)
        echo -e "${RED}Unknown: $1${NC}"
        cmd_help
        exit 1
        ;;
esac
