#!/bin/bash
# BlackRoad Collaboration Watchdog — health monitoring, cleanup, digests
# Usage: memory-watchdog.sh <command> [args]
set -e

COLLAB_DB="$HOME/.blackroad/collaboration.db"
HANDOFF_DIR="$HOME/.blackroad/memory/handoffs"
JOURNAL="$HOME/.blackroad/memory/journals/master-journal.jsonl"
SLACK_API="https://blackroad-slack.amundsonalexa.workers.dev"

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

sql() { sqlite3 "$COLLAB_DB" "$@" 2>/dev/null; }

post_to_slack() {
    local text="$1"
    curl -s --max-time 3 --connect-timeout 2 \
        -X POST "$SLACK_API/post" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg t "$text" '{text:$t}')" >/dev/null 2>&1 || true
}

check_db() {
    if [[ ! -f "$COLLAB_DB" ]]; then
        echo -e "${RED}Collaboration DB not found. Run: memory-collaboration.sh init${NC}"
        exit 1
    fi
}

# ── SWEEP — Clean stale data ──
cmd_sweep() {
    check_db
    echo -e "${PINK}[WATCHDOG]${NC} ${BOLD}Sweeping stale data...${NC}"

    # Mark stale sessions as abandoned (>2h, still active)
    local stale
    stale=$(sql "SELECT count(*) FROM sessions WHERE status='active' AND last_seen < datetime('now', '-2 hours');")
    if [[ "$stale" -gt 0 ]]; then
        sql "UPDATE sessions SET status='abandoned' WHERE status='active' AND last_seen < datetime('now', '-2 hours');"
        echo -e "  ${YELLOW}Abandoned $stale stale session(s)${NC}"
    else
        echo -e "  ${GREEN}No stale sessions${NC}"
    fi

    # Archive old messages (>7 days)
    local old_msgs
    old_msgs=$(sql "SELECT count(*) FROM messages WHERE created_at < datetime('now', '-7 days');")
    if [[ "$old_msgs" -gt 0 ]]; then
        sql "DELETE FROM messages WHERE created_at < datetime('now', '-7 days');"
        echo -e "  ${YELLOW}Archived $old_msgs old message(s)${NC}"
    else
        echo -e "  ${GREEN}No old messages to archive${NC}"
    fi

    # Clean picked-up handoff files (>3 days)
    local cleaned=0
    for f in "$HANDOFF_DIR"/handoff-*.json; do
        [[ ! -f "$f" ]] && continue
        local pbu
        pbu=$(jq -r '.picked_up_by // ""' "$f" 2>/dev/null)
        if [[ -n "$pbu" && "$pbu" != "" && "$pbu" != "null" ]]; then
            local created
            created=$(jq -r '.created_at' "$f" 2>/dev/null)
            local file_age
            file_age=$(( $(date +%s) - $(date -jf "%Y-%m-%dT%H:%M:%SZ" "$created" +%s 2>/dev/null || echo $(date +%s)) ))
            if [[ "$file_age" -gt 259200 ]]; then  # 3 days
                rm -f "$f"
                ((cleaned++))
            fi
        fi
    done
    [[ "$cleaned" -gt 0 ]] && echo -e "  ${YELLOW}Cleaned $cleaned old handoff file(s)${NC}"

    # Report orphaned handoffs
    local orphaned
    orphaned=$(sql "SELECT count(*) FROM handoffs WHERE picked_up_by='' AND created_at < datetime('now', '-24 hours');")
    if [[ "$orphaned" -gt 0 ]]; then
        echo -e "  ${RED}$orphaned orphaned handoff(s) — never picked up (>24h)${NC}"
    fi

    # DB size
    local db_size
    db_size=$(du -h "$COLLAB_DB" | cut -f1)
    echo -e "  ${BLUE}DB size: $db_size${NC}"

    # Total counts
    local sessions msgs handoffs
    sessions=$(sql "SELECT count(*) FROM sessions;")
    msgs=$(sql "SELECT count(*) FROM messages;")
    handoffs=$(sql "SELECT count(*) FROM handoffs;")
    echo -e "  ${BLUE}Totals: $sessions sessions, $msgs messages, $handoffs handoffs${NC}"
}

# ── HEARTBEAT — Quick health pulse ──
cmd_heartbeat() {
    local slack_flag="${1:-}"
    local issues=()

    # Check DB
    if [[ -f "$COLLAB_DB" ]]; then
        local integrity
        integrity=$(sql "PRAGMA integrity_check;" 2>/dev/null)
        if [[ "$integrity" != "ok" ]]; then
            issues+=("DB integrity: $integrity")
        fi
    else
        issues+=("Collaboration DB missing")
    fi

    # Check Slack
    local slack_status
    slack_status=$(curl -s --max-time 2 --connect-timeout 1 "$SLACK_API/health" 2>/dev/null | jq -r '.status' 2>/dev/null || echo "unreachable")
    if [[ "$slack_status" != "alive" ]]; then
        issues+=("Slack Worker: $slack_status")
    fi

    # Check journal
    if [[ -f "$JOURNAL" ]]; then
        local last_entry
        last_entry=$(tail -1 "$JOURNAL" 2>/dev/null)
        echo "$last_entry" | jq . >/dev/null 2>&1 || issues+=("Journal: last entry not valid JSON")
    else
        issues+=("Journal file missing")
    fi

    # Check disk space
    local disk_used
    disk_used=$(du -sm "$HOME/.blackroad/" 2>/dev/null | cut -f1)
    if [[ "${disk_used:-0}" -gt 500 ]]; then
        issues+=("Disk: ~/.blackroad/ is ${disk_used}MB")
    fi

    # Active sessions
    local active=0
    if [[ -f "$COLLAB_DB" ]]; then
        active=$(sql "SELECT count(*) FROM sessions WHERE status='active';" 2>/dev/null || echo 0)
    fi

    if [[ ${#issues[@]} -eq 0 ]]; then
        echo -e "${GREEN}✅ All systems nominal${NC} — $active active session(s), Slack connected, DB healthy"
        if [[ "$slack_flag" == "--slack" ]]; then
            post_to_slack "💚 Watchdog heartbeat: all systems nominal — $active active session(s)"
        fi
    else
        echo -e "${RED}⚠️  Issues detected:${NC}"
        for issue in "${issues[@]}"; do
            echo -e "  ${RED}• $issue${NC}"
        done
        if [[ "$slack_flag" == "--slack" ]]; then
            local msg="⚠️ Watchdog heartbeat: ${#issues[@]} issue(s)"
            for issue in "${issues[@]}"; do
                msg="$msg\n  • $issue"
            done
            post_to_slack "$msg"
        fi
    fi
}

# ── DIGEST — Collaboration digest ──
cmd_digest() {
    check_db
    local slack_flag="${1:-}"

    local sessions_24h msgs_24h handoffs_24h handoffs_picked
    sessions_24h=$(sql "SELECT count(*) FROM sessions WHERE started_at > datetime('now', '-24 hours');")
    msgs_24h=$(sql "SELECT count(*) FROM messages WHERE created_at > datetime('now', '-24 hours');")
    handoffs_24h=$(sql "SELECT count(*) FROM handoffs WHERE created_at > datetime('now', '-24 hours');")
    handoffs_picked=$(sql "SELECT count(*) FROM handoffs WHERE picked_up_at > datetime('now', '-24 hours') AND picked_up_by != '';")

    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}Collaboration Digest (24h)${NC}                              ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  Sessions: ${GREEN}${sessions_24h}${NC}"
    echo -e "  Messages: ${BLUE}${msgs_24h}${NC}"
    echo -e "  Handoffs: ${CYAN}${handoffs_24h} created${NC}, ${GREEN}${handoffs_picked} picked up${NC}"
    echo ""

    # Recent sessions
    echo -e "  ${BOLD}Sessions:${NC}"
    sql "SELECT session_id, status, focus FROM sessions WHERE started_at > datetime('now', '-24 hours') ORDER BY started_at DESC LIMIT 10;" | while IFS='|' read -r sid status focus; do
        local icon="●"
        case "$status" in
            active) icon="${GREEN}●${NC}" ;;
            completed) icon="${BLUE}✓${NC}" ;;
            abandoned) icon="${YELLOW}⊘${NC}" ;;
        esac
        echo -e "    $icon ${CYAN}${sid}${NC}${focus:+ — $focus}"
    done
    echo ""

    # Top message types
    echo -e "  ${BOLD}Message Types:${NC}"
    sql "SELECT type, count(*) as cnt FROM messages WHERE created_at > datetime('now', '-24 hours') GROUP BY type ORDER BY cnt DESC;" | while IFS='|' read -r type cnt; do
        echo -e "    ${type}: ${GREEN}${cnt}${NC}"
    done

    if [[ "$slack_flag" == "--slack" ]]; then
        local msg="📊 *Collaboration Digest (24h)*\n"
        msg="${msg}Sessions: ${sessions_24h} | Messages: ${msgs_24h} | Handoffs: ${handoffs_24h} created, ${handoffs_picked} picked up"
        post_to_slack "$msg"
        echo ""
        echo -e "  ${GREEN}Posted to Slack${NC}"
    fi
}

# ── AUDIT — Full system audit ──
cmd_audit() {
    check_db

    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}Collaboration System Audit${NC}                              ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # DB integrity
    local integrity
    integrity=$(sql "PRAGMA integrity_check;")
    echo -e "  ${BOLD}DB Integrity:${NC} ${integrity}"

    # All sessions
    echo ""
    echo -e "  ${BOLD}All Sessions:${NC}"
    sql "SELECT session_id, status, started_at, last_seen, focus FROM sessions ORDER BY started_at DESC;" | while IFS='|' read -r sid status started last focus; do
        local icon
        case "$status" in
            active) icon="${GREEN}●${NC}" ;;
            completed) icon="${BLUE}✓${NC}" ;;
            abandoned) icon="${YELLOW}⊘${NC}" ;;
            *) icon="?" ;;
        esac
        echo -e "    $icon ${CYAN}${sid}${NC} [${status}] ${started:0:19}${focus:+ — $focus}"
    done

    # Orphaned handoffs
    echo ""
    local orphaned
    orphaned=$(sql "SELECT count(*) FROM handoffs WHERE picked_up_by='' AND created_at < datetime('now', '-24 hours');")
    echo -e "  ${BOLD}Orphaned Handoffs (>24h, never picked up):${NC} ${orphaned}"
    if [[ "$orphaned" -gt 0 ]]; then
        sql "SELECT handoff_id, from_session, message FROM handoffs WHERE picked_up_by='' AND created_at < datetime('now', '-24 hours') LIMIT 5;" | while IFS='|' read -r hid from msg; do
            echo -e "    ${RED}⚠${NC}  ${hid} from ${CYAN}${from}${NC}: ${msg:0:60}"
        done
    fi

    # Duplicate session check
    echo ""
    local dupes
    dupes=$(sql "SELECT session_id, count(*) as cnt FROM sessions GROUP BY session_id HAVING cnt > 1;" 2>/dev/null)
    if [[ -n "$dupes" ]]; then
        echo -e "  ${RED}Duplicate sessions found:${NC}"
        echo "$dupes" | while IFS='|' read -r sid cnt; do
            echo -e "    ${RED}$sid: $cnt entries${NC}"
        done
    else
        echo -e "  ${GREEN}No duplicate sessions${NC}"
    fi

    # DB stats
    echo ""
    local db_size pages
    db_size=$(du -h "$COLLAB_DB" | cut -f1)
    pages=$(sql "PRAGMA page_count;")
    local page_size
    page_size=$(sql "PRAGMA page_size;")
    echo -e "  ${BOLD}DB Stats:${NC} $db_size, $pages pages × ${page_size}B"
    echo -e "  ${BOLD}Journal mode:${NC} $(sql 'PRAGMA journal_mode;')"
}

# ── HELP ──
cmd_help() {
    cat <<EOF
${PINK}╔════════════════════════════════════════════════════════════╗${NC}
${PINK}║${NC}  ${BOLD}BlackRoad Collaboration Watchdog${NC}                        ${PINK}║${NC}
${PINK}╚════════════════════════════════════════════════════════════╝${NC}

${BOLD}Commands:${NC}
  ${CYAN}heartbeat [--slack]${NC}    Quick health check (post to Slack with --slack)
  ${CYAN}sweep${NC}                  Clean stale sessions, old messages, orphaned handoffs
  ${CYAN}digest [--slack]${NC}       24h collaboration digest (post to Slack with --slack)
  ${CYAN}audit${NC}                  Full system audit: integrity, sessions, orphans

${BOLD}Cron schedule:${NC}
  */30  heartbeat
  3am   sweep
  9am   digest --slack
EOF
}

case "${1:-help}" in
    heartbeat|hb)   shift 2>/dev/null || true; cmd_heartbeat "$@" ;;
    sweep|clean)    cmd_sweep ;;
    digest|report)  shift 2>/dev/null || true; cmd_digest "$@" ;;
    audit)          cmd_audit ;;
    help|--help|-h) cmd_help ;;
    *)
        echo -e "${RED}Unknown: $1${NC}"
        cmd_help
        exit 1
        ;;
esac
