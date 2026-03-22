#!/bin/bash
# BlackRoad Planner — Project planning, focus tracking, standups, wrap-ups
# Usage: memory-planner.sh <command> [args]
set -e

COLLAB_DB="$HOME/.blackroad/collaboration.db"
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

sql() { sqlite3 "$COLLAB_DB" "$@" 2>/dev/null; }

get_session() {
    [[ -f "$SESSION_FILE" ]] && cat "$SESSION_FILE" || echo ""
}

post_to_slack() {
    curl -s --max-time 3 --connect-timeout 2 \
        -X POST "$SLACK_API/post" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg t "$1" '{text:$t}')" >/dev/null 2>&1 || true
}

# ── PLAN ──
cmd_plan() {
    local project_id="$1"
    [[ -z "$project_id" ]] && { echo -e "${RED}Usage: $0 plan <project-id>${NC}"; exit 1; }

    local project_file="$PROJECTS_DIR/${project_id}.json"
    if [[ ! -f "$project_file" ]]; then
        echo -e "${RED}Project not found: $project_id${NC}"
        echo -e "${YELLOW}Available:${NC}"
        ls "$PROJECTS_DIR"/*.json 2>/dev/null | while read -r f; do
            local pid
            pid=$(jq -r '.project_id' "$f")
            local title
            title=$(jq -r '.title' "$f")
            local prog
            prog=$(jq -r '.progress' "$f")
            echo -e "  ${CYAN}$pid${NC} — $title (${prog}%)"
        done
        exit 1
    fi

    local title cadence status progress
    title=$(jq -r '.title' "$project_file")
    cadence=$(jq -r '.timescale' "$project_file")
    status=$(jq -r '.status' "$project_file")
    progress=$(jq -r '.progress' "$project_file")

    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}$title${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${BOLD}ID:${NC} ${CYAN}${project_id}${NC} | ${BOLD}Cadence:${NC} ${cadence} | ${BOLD}Status:${NC} ${status}"

    # Progress bar
    local bar_len=40
    local filled=$(( progress * bar_len / 100 ))
    local empty=$(( bar_len - filled ))
    local bar="${GREEN}"
    for ((i=0; i<filled; i++)); do bar+="█"; done
    bar+="${DIM}"
    for ((i=0; i<empty; i++)); do bar+="░"; done
    bar+="${NC}"
    echo -e "  ${BOLD}Progress:${NC} $bar ${progress}%"
    echo ""

    # Todos
    local total_todos done_todos pending_todos
    total_todos=$(jq '.todos | length' "$project_file")
    done_todos=$(jq '[.todos[] | select(.status == "completed")] | length' "$project_file")
    pending_todos=$(jq '[.todos[] | select(.status == "pending")] | length' "$project_file")

    echo -e "  ${BOLD}Todos:${NC} $done_todos/$total_todos done, $pending_todos pending"
    echo ""

    # Show completed
    if [[ "$done_todos" -gt 0 ]]; then
        echo -e "  ${GREEN}Completed:${NC}"
        jq -r '.todos[] | select(.status == "completed") | "    ✅ \(.text)"' "$project_file"
        echo ""
    fi

    # Show pending
    if [[ "$pending_todos" -gt 0 ]]; then
        echo -e "  ${YELLOW}Pending:${NC}"
        jq -r '.todos[] | select(.status == "pending") | "    ⬜ [\(.todo_id)] \(.text)"' "$project_file"
        echo ""
    fi
}

# ── NEXT ──
cmd_next() {
    echo -e "${PINK}[PLANNER]${NC} ${BOLD}Finding next action...${NC}"
    echo ""

    local best_project="" best_todo="" best_priority=999 best_progress=999

    for f in "$PROJECTS_DIR"/*.json; do
        [[ ! -f "$f" ]] && continue
        local status
        status=$(jq -r '.status' "$f")
        [[ "$status" != "active" ]] && continue

        local progress pending_count cadence pid title
        progress=$(jq -r '.progress' "$f")
        pending_count=$(jq '[.todos[] | select(.status == "pending")] | length' "$f")
        [[ "$pending_count" -eq 0 ]] && continue

        cadence=$(jq -r '.timescale' "$f")
        pid=$(jq -r '.project_id' "$f")
        title=$(jq -r '.title' "$f")

        # Priority: weekly=1, monthly=2, forever=3
        local priority=3
        case "$cadence" in
            weekly)  priority=1 ;;
            monthly) priority=2 ;;
        esac

        if [[ "$priority" -lt "$best_priority" ]] || \
           [[ "$priority" -eq "$best_priority" && "$progress" -lt "$best_progress" ]]; then
            best_priority=$priority
            best_progress=$progress
            best_project="$pid"
            best_todo=$(jq -r '[.todos[] | select(.status == "pending")][0].text' "$f")
        fi
    done

    if [[ -n "$best_project" ]]; then
        echo -e "  ${BOLD}Next up:${NC} ${CYAN}$best_project${NC} (${best_progress}%)"
        echo -e "  ${YELLOW}→${NC} $best_todo"
        echo ""
        echo -e "  ${DIM}Set focus: $0 focus $best_project${NC}"
    else
        echo -e "  ${GREEN}All projects complete or no pending todos!${NC}"
    fi
}

# ── FOCUS ──
cmd_focus() {
    local project_id="$1"
    [[ -z "$project_id" ]] && { echo -e "${RED}Usage: $0 focus <project-id>${NC}"; exit 1; }

    local session
    session=$(get_session)
    if [[ -z "$session" ]]; then
        echo -e "${RED}No active session. Run: memory-collaboration.sh register${NC}"
        exit 1
    fi

    # Update session focus
    if [[ -f "$COLLAB_DB" ]]; then
        sql "UPDATE sessions SET focus='$project_id' WHERE session_id='$session';"
    fi

    # Get project title
    local title=""
    local pf="$PROJECTS_DIR/${project_id}.json"
    [[ -f "$pf" ]] && title=$(jq -r '.title' "$pf")

    echo -e "${GREEN}Focus set:${NC} ${CYAN}${project_id}${NC}${title:+ — $title}"

    # Announce to Slack
    "$COLLAB" announce "Focus: $project_id${title:+ — $title}" 2>/dev/null || true
}

# ── STANDUP ──
cmd_standup() {
    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}Standup Report${NC}                                          ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # What was done (last handoff picked up by this session)
    echo -e "  ${BOLD}✅ What was done (last handoff):${NC}"
    if [[ -f "$COLLAB_DB" ]]; then
        local last_handoff
        last_handoff=$(sql "SELECT message FROM handoffs WHERE picked_up_by != '' ORDER BY picked_up_at DESC LIMIT 1;")
        if [[ -n "$last_handoff" ]]; then
            echo -e "    $last_handoff"
        else
            echo -e "    ${DIM}No handoff found${NC}"
        fi
    fi
    echo ""

    # What's planned (next action)
    echo -e "  ${BOLD}🎯 What's planned:${NC}"
    for f in "$PROJECTS_DIR"/*.json; do
        [[ ! -f "$f" ]] && continue
        local status
        status=$(jq -r '.status' "$f")
        [[ "$status" != "active" ]] && continue
        local pending
        pending=$(jq '[.todos[] | select(.status == "pending")] | length' "$f")
        [[ "$pending" -eq 0 ]] && continue
        local pid next_todo
        pid=$(jq -r '.project_id' "$f")
        next_todo=$(jq -r '[.todos[] | select(.status == "pending")][0].text' "$f")
        echo -e "    ${CYAN}$pid${NC}: $next_todo"
    done
    echo ""

    # Blockers
    echo -e "  ${BOLD}🚧 Blockers:${NC}"
    echo -e "    ${DIM}(add manually or check memory for known issues)${NC}"
    echo ""

    # Post to Slack
    echo -e "  ${DIM}Post to Slack: $0 standup --slack${NC}"
    if [[ "$1" == "--slack" ]]; then
        local msg="📋 *Standup Report*\n"
        msg="${msg}✅ Done: $(sql "SELECT message FROM handoffs WHERE picked_up_by != '' ORDER BY picked_up_at DESC LIMIT 1;" 2>/dev/null || echo 'N/A')\n"
        msg="${msg}🎯 Next: $(cmd_next 2>/dev/null | grep "→" | head -1 || echo 'checking...')"
        post_to_slack "$msg"
        echo -e "  ${GREEN}Posted to Slack${NC}"
    fi
}

# ── ROADMAP ──
cmd_roadmap() {
    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}BlackRoad Project Roadmap${NC}                                ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    for cadence in weekly monthly forever; do
        local label icon
        case "$cadence" in
            weekly)  label="WEEKLY"; icon="📆" ;;
            monthly) label="MONTHLY"; icon="📊" ;;
            forever) label="FOREVER"; icon="♾️" ;;
        esac

        local found=0
        for f in "$PROJECTS_DIR"/*.json; do
            [[ ! -f "$f" ]] && continue
            local fc
            fc=$(jq -r '.timescale' "$f")
            [[ "$fc" != "$cadence" ]] && continue

            if [[ "$found" -eq 0 ]]; then
                echo -e "  ${BOLD}$icon $label${NC}"
                found=1
            fi

            local pid title progress status pending
            pid=$(jq -r '.project_id' "$f")
            title=$(jq -r '.title' "$f")
            progress=$(jq -r '.progress' "$f")
            status=$(jq -r '.status' "$f")
            pending=$(jq '[.todos[] | select(.status == "pending")] | length' "$f")

            local color="$GREEN"
            [[ "$progress" -lt 50 ]] && color="$YELLOW"
            [[ "$progress" -lt 20 ]] && color="$RED"
            [[ "$progress" -eq 100 ]] && color="$GREEN"

            local bar=""
            local filled=$(( progress / 10 ))
            for ((i=0; i<filled; i++)); do bar+="█"; done
            for ((i=filled; i<10; i++)); do bar+="░"; done

            echo -e "    ${color}${bar}${NC} ${progress}%  ${CYAN}${pid}${NC} — $title ($pending pending)"
        done
        [[ "$found" -gt 0 ]] && echo ""
    done
}

# ── REVIEW ──
cmd_review() {
    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}Session Review${NC}                                           ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    local session
    session=$(get_session)
    echo -e "  ${BOLD}Session:${NC} ${CYAN}${session:-unknown}${NC}"
    echo ""

    if [[ -f "$COLLAB_DB" && -n "$session" ]]; then
        # Messages sent this session
        echo -e "  ${BOLD}Messages sent:${NC}"
        sql "SELECT type, message, created_at FROM messages WHERE session_id='$session' ORDER BY created_at;" | while IFS='|' read -r type msg created; do
            echo -e "    [${created:11:8}] ${CYAN}${type}${NC}: ${msg:0:70}"
        done

        # Handoffs created
        echo ""
        echo -e "  ${BOLD}Handoffs left:${NC}"
        sql "SELECT message FROM handoffs WHERE from_session='$session';" | while read -r msg; do
            echo -e "    🤝 $msg"
        done
    fi

    # Recent journal entries
    if [[ -f "$JOURNAL" ]]; then
        echo ""
        echo -e "  ${BOLD}Recent journal activity:${NC}"
        tail -10 "$JOURNAL" | while read -r line; do
            local action entity ts
            action=$(echo "$line" | jq -r '.action')
            entity=$(echo "$line" | jq -r '.entity')
            ts=$(echo "$line" | jq -r '.timestamp' | cut -dT -f2 | cut -d. -f1)
            echo -e "    [${ts}] ${action} → ${entity}"
        done
    fi
}

# ── SUGGEST ──
cmd_suggest() {
    echo -e "${PINK}[PLANNER]${NC} ${BOLD}Analyzing projects...${NC}"
    echo ""

    local suggestions=()

    for f in "$PROJECTS_DIR"/*.json; do
        [[ ! -f "$f" ]] && continue
        local status
        status=$(jq -r '.status' "$f")
        [[ "$status" != "active" ]] && continue

        local pid progress pending cadence title
        pid=$(jq -r '.project_id' "$f")
        progress=$(jq -r '.progress' "$f")
        pending=$(jq '[.todos[] | select(.status == "pending")] | length' "$f")
        cadence=$(jq -r '.timescale' "$f")
        title=$(jq -r '.title' "$f")

        [[ "$pending" -eq 0 ]] && continue

        local reason=""
        if [[ "$cadence" == "weekly" && "$progress" -lt 100 ]]; then
            reason="⚡ Weekly deadline — ${progress}% done"
        elif [[ "$progress" -lt 20 ]]; then
            reason="🔴 Barely started — needs attention"
        elif [[ "$progress" -lt 50 ]]; then
            reason="🟡 Under halfway — good opportunity"
        fi

        if [[ -n "$reason" ]]; then
            echo -e "  ${CYAN}$pid${NC} — $title"
            echo -e "    $reason ($pending pending todos)"
            echo ""
        fi
    done
}

# ── WRAP ──
cmd_wrap() {
    local session
    session=$(get_session)
    if [[ -z "$session" ]]; then
        echo -e "${RED}No active session to wrap${NC}"
        exit 1
    fi

    echo -e "${PINK}[PLANNER]${NC} ${BOLD}Wrapping up session...${NC}"

    # Gather session activity
    local msgs=""
    if [[ -f "$COLLAB_DB" ]]; then
        msgs=$(sql "SELECT type, message FROM messages WHERE session_id='$session' ORDER BY created_at;" 2>/dev/null)
    fi

    # Auto-generate handoff
    local handoff_msg="Session $session wrap-up:"
    if [[ -n "$msgs" ]]; then
        handoff_msg="$handoff_msg | Activity: $(echo "$msgs" | wc -l | tr -d ' ') messages"
        local last_announce
        last_announce=$(sql "SELECT message FROM messages WHERE session_id='$session' AND type='announce' ORDER BY created_at DESC LIMIT 1;" 2>/dev/null)
        [[ -n "$last_announce" ]] && handoff_msg="$handoff_msg | Last: $last_announce"
    fi

    # Get current focus
    local focus
    focus=$(sql "SELECT focus FROM sessions WHERE session_id='$session';" 2>/dev/null)
    [[ -n "$focus" ]] && handoff_msg="$handoff_msg | Focus was: $focus"

    echo -e "  ${BOLD}Handoff:${NC} $handoff_msg"
    echo ""

    # Create handoff
    "$COLLAB" handoff "$handoff_msg" 2>/dev/null || true

    # Mark session complete
    "$COLLAB" complete 2>/dev/null || true

    echo -e "${GREEN}Session wrapped up and handed off!${NC}"
}

# ── HELP ──
cmd_help() {
    cat <<EOF
${PINK}╔════════════════════════════════════════════════════════════╗${NC}
${PINK}║${NC}  ${BOLD}BlackRoad Planner${NC}                                       ${PINK}║${NC}
${PINK}╚════════════════════════════════════════════════════════════╝${NC}

${BOLD}Planning:${NC}
  ${CYAN}plan <project-id>${NC}     Show full project plan with todos
  ${CYAN}next${NC}                   What to work on next (auto-prioritized)
  ${CYAN}roadmap${NC}                All projects grouped by cadence
  ${CYAN}suggest${NC}                AI-suggested priorities

${BOLD}Session:${NC}
  ${CYAN}focus <project-id>${NC}    Set session focus + announce
  ${CYAN}standup [--slack]${NC}     Generate standup report
  ${CYAN}review${NC}                Review this session's activity
  ${CYAN}wrap${NC}                  End session: auto-handoff + complete
EOF
}

case "${1:-help}" in
    plan)               shift; cmd_plan "$@" ;;
    next)               cmd_next ;;
    focus)              shift; cmd_focus "$@" ;;
    standup)            shift 2>/dev/null || true; cmd_standup "$@" ;;
    roadmap|map)        cmd_roadmap ;;
    review|rev)         cmd_review ;;
    suggest|sug)        cmd_suggest ;;
    wrap|end)           cmd_wrap ;;
    help|--help|-h)     cmd_help ;;
    *)
        echo -e "${RED}Unknown: $1${NC}"
        cmd_help
        exit 1
        ;;
esac
