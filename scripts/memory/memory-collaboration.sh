#!/bin/bash
# BlackRoad Collaboration System — Claude-to-Claude messaging via Slack + SQLite
# Real cross-session communication: register, announce, handoff, inbox, post to Slack
# Usage: memory-collaboration.sh <command> [args]

set -e

COLLAB_DB="$HOME/.blackroad/collaboration.db"
HANDOFF_DIR="$HOME/.blackroad/memory/handoffs"
SESSION_FILE="$HOME/.blackroad/memory/current-collab-session"
SLACK_API="https://blackroad-slack.amundsonalexa.workers.dev"
JOURNAL="$HOME/.blackroad/memory/journals/master-journal.jsonl"

# Colors
PINK='\033[38;5;205m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

# SQLite helper
sql() { sqlite3 "$COLLAB_DB" "$@"; }

# Post to Slack (non-blocking, 3s timeout, never fails)
post_to_slack() {
    local text="$1"
    curl -s --max-time 3 --connect-timeout 2 \
        -X POST "$SLACK_API/post" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg t "$text" '{text:$t}')" >/dev/null 2>&1 || true
}

# Post structured collab message to Slack
post_collab() {
    local type="$1" msg="$2" session="$3"
    curl -s --max-time 3 --connect-timeout 2 \
        -X POST "$SLACK_API/collab" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg t "$type" --arg m "$msg" --arg s "$session" \
            '{type:$t, message:$m, session_id:$s}')" >/dev/null 2>&1 || true
}

# Log to journal
log_journal() {
    local action="$1" entity="$2" details="$3"
    local ts
    ts=$(date -u +"%Y-%m-%dT%H:%M:%S.3NZ")
    local hash
    hash=$(echo -n "$ts$action$entity$details" | shasum -a 256 | cut -c1-16)
    mkdir -p "$(dirname "$JOURNAL")"
    printf '{"timestamp":"%s","action":"%s","entity":"%s","details":"%s","hash":"%s"}\n' \
        "$ts" "$action" "$entity" "$details" "$hash" >> "$JOURNAL"
}

# Get current session ID
get_session() {
    if [[ -f "$SESSION_FILE" ]]; then
        cat "$SESSION_FILE"
    else
        echo ""
    fi
}

# ── INIT ──
cmd_init() {
    mkdir -p "$(dirname "$COLLAB_DB")" "$HANDOFF_DIR"

    if [[ -f "$COLLAB_DB" ]]; then
        local has_sessions
        has_sessions=$(sqlite3 "$COLLAB_DB" "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='sessions';" 2>/dev/null || echo "0")
        if [[ "$has_sessions" == "1" ]]; then
            echo -e "${GREEN}Collaboration DB already initialized${NC}"
            return
        fi
    fi

    rm -f "$COLLAB_DB"

    sqlite3 "$COLLAB_DB" <<'SQL'
PRAGMA journal_mode=WAL;

CREATE TABLE sessions (
    session_id TEXT PRIMARY KEY,
    started_at TEXT NOT NULL,
    last_seen TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    focus TEXT DEFAULT '',
    agent_id TEXT DEFAULT '',
    pid INTEGER DEFAULT 0
);

CREATE TABLE messages (
    msg_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    created_at TEXT NOT NULL,
    read_by TEXT DEFAULT ''
);
CREATE INDEX idx_messages_type ON messages(type);
CREATE INDEX idx_messages_created ON messages(created_at);

CREATE TABLE handoffs (
    handoff_id TEXT PRIMARY KEY,
    from_session TEXT NOT NULL,
    message TEXT NOT NULL,
    context TEXT DEFAULT '{}',
    created_at TEXT NOT NULL,
    picked_up_by TEXT DEFAULT '',
    picked_up_at TEXT DEFAULT ''
);
CREATE INDEX idx_handoffs_pending ON handoffs(picked_up_by);

CREATE TABLE claims (
    claim_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    task TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    claimed_at TEXT NOT NULL,
    completed_at TEXT DEFAULT ''
);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_session ON claims(session_id);
SQL

    echo -e "${GREEN}Collaboration DB initialized at $COLLAB_DB${NC}"
}

# Ensure DB exists
check_db() {
    if [[ ! -f "$COLLAB_DB" ]]; then
        cmd_init
    fi
    local has_table
    has_table=$(sqlite3 "$COLLAB_DB" "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='sessions';" 2>/dev/null || echo "0")
    if [[ "$has_table" != "1" ]]; then
        cmd_init
    fi
}

# ── REGISTER ──
cmd_register() {
    check_db
    local focus="${*:-}"
    local session_id="collab-$(date +%Y%m%d-%H%M%S)-$$"
    local now
    now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Mark stale sessions as abandoned (>2 hours old, still active)
    sql "UPDATE sessions SET status='abandoned' WHERE status='active' AND last_seen < datetime('now', '-2 hours');"

    # Register this session
    sql "INSERT OR REPLACE INTO sessions (session_id, started_at, last_seen, status, focus, pid) VALUES ('$session_id', '$now', '$now', 'active', '$(echo "$focus" | sed "s/'/''/g")', $$);"

    # Save session ID for other commands
    echo "$session_id" > "$SESSION_FILE"

    # Count pending handoffs and unread messages
    local pending_handoffs unread_msgs active_sessions
    pending_handoffs=$(sql "SELECT count(*) FROM handoffs WHERE picked_up_by='';" 2>/dev/null || echo 0)
    unread_msgs=$(sql "SELECT count(*) FROM messages WHERE read_by NOT LIKE '%${session_id}%' AND created_at > datetime('now', '-24 hours');" 2>/dev/null || echo 0)
    active_sessions=$(sql "SELECT count(*) FROM sessions WHERE status='active';" 2>/dev/null || echo 0)

    # Compact output for SessionStart
    echo -e "${PINK}[COLLAB]${NC} Session ${CYAN}${session_id}${NC} registered"
    if [[ "$pending_handoffs" -gt 0 ]]; then
        echo -e "${PINK}[COLLAB]${NC} ${YELLOW}${pending_handoffs} pending handoff(s)${NC} — run: ${CYAN}memory-collaboration.sh inbox${NC}"
    fi
    if [[ "$unread_msgs" -gt 0 ]]; then
        echo -e "${PINK}[COLLAB]${NC} ${BLUE}${unread_msgs} unread message(s)${NC}"
    fi
    echo -e "${PINK}[COLLAB]${NC} Active sessions: ${GREEN}${active_sessions}${NC}"

    # Post to Slack (async, non-blocking)
    post_collab "announce" "Session online${focus:+ — focus: $focus}" "$session_id" &

    # Log to journal
    log_journal "collab-register" "$session_id" "Session registered${focus:+, focus: $focus}"
}

# ── ANNOUNCE ──
cmd_announce() {
    check_db
    local msg="$*"
    if [[ -z "$msg" ]]; then
        echo -e "${RED}Usage: $0 announce <message>${NC}"
        exit 1
    fi

    local session
    session=$(get_session)
    if [[ -z "$session" ]]; then
        echo -e "${RED}No active session. Run: $0 register${NC}"
        exit 1
    fi

    local msg_id="msg-$(date +%s)-$$"
    local now
    now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    sql "INSERT INTO messages (msg_id, session_id, type, message, created_at) VALUES ('$msg_id', '$session', 'announce', '$(echo "$msg" | sed "s/'/''/g")', '$now');"

    # Update last_seen
    sql "UPDATE sessions SET last_seen='$now' WHERE session_id='$session';"

    echo -e "${GREEN}Announced:${NC} $msg"

    post_collab "announce" "$msg" "$session" &
    log_journal "collab-announce" "$session" "$msg"
}

# ── HANDOFF ──
cmd_handoff() {
    check_db
    local msg="$*"
    if [[ -z "$msg" ]]; then
        echo -e "${RED}Usage: $0 handoff <message>${NC}"
        exit 1
    fi

    local session
    session=$(get_session)
    if [[ -z "$session" ]]; then
        echo -e "${RED}No active session. Run: $0 register${NC}"
        exit 1
    fi

    local handoff_id="handoff-$(date +%s)-$$"
    local now
    now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Write to SQLite
    sql "INSERT INTO handoffs (handoff_id, from_session, message, created_at) VALUES ('$handoff_id', '$session', '$(echo "$msg" | sed "s/'/''/g")', '$now');"

    # Write JSON file for fast SessionStart reading
    cat > "$HANDOFF_DIR/${handoff_id}.json" <<EOF
{
  "handoff_id": "$handoff_id",
  "from_session": "$session",
  "message": $(echo "$msg" | jq -Rs .),
  "created_at": "$now",
  "picked_up_by": "",
  "picked_up_at": ""
}
EOF

    echo -e "${GREEN}Handoff saved:${NC} $msg"

    post_collab "handoff" "$msg" "$session" &
    log_journal "collab-handoff" "$session" "Handoff: $msg"
}

# ── INBOX ──
cmd_inbox() {
    check_db
    local session
    session=$(get_session)

    # Show pending handoffs
    local handoffs
    handoffs=$(sql "SELECT handoff_id, from_session, message, created_at FROM handoffs WHERE picked_up_by='' ORDER BY created_at DESC LIMIT 10;" 2>/dev/null)

    if [[ -n "$handoffs" ]]; then
        echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${PINK}║${NC}  ${BOLD}Pending Handoffs${NC}                                       ${PINK}║${NC}"
        echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""

        while IFS='|' read -r hid from_sess msg created; do
            local time_part="${created:11:8}"
            echo -e "  ${YELLOW}🤝${NC} ${CYAN}${from_sess}${NC} (${BLUE}${time_part}${NC})"
            echo -e "     ${msg}"
            echo ""
        done <<< "$handoffs"

        # Mark handoffs as picked up by this session
        if [[ -n "$session" ]]; then
            local now
            now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
            sql "UPDATE handoffs SET picked_up_by='$session', picked_up_at='$now' WHERE picked_up_by='';"
            # Also update JSON files
            for f in "$HANDOFF_DIR"/handoff-*.json; do
                [[ ! -f "$f" ]] && continue
                local pbu
                pbu=$(jq -r '.picked_up_by' "$f" 2>/dev/null)
                if [[ "$pbu" == "" || "$pbu" == "null" ]]; then
                    local tmp
                    tmp=$(jq --arg s "$session" --arg t "$now" '.picked_up_by=$s | .picked_up_at=$t' "$f")
                    echo "$tmp" > "$f"
                fi
            done
        fi
    fi

    # Show recent messages (last 24h)
    local messages
    messages=$(sql "SELECT msg_id, session_id, type, message, created_at FROM messages WHERE created_at > datetime('now', '-24 hours') ORDER BY created_at DESC LIMIT 10;" 2>/dev/null)

    if [[ -n "$messages" ]]; then
        echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${PINK}║${NC}  ${BOLD}Recent Messages (24h)${NC}                                  ${PINK}║${NC}"
        echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""

        while IFS='|' read -r mid sess type msg created; do
            local time_part="${created:11:8}"
            local icon="📨"
            case "$type" in
                announce) icon="📢" ;;
                handoff)  icon="🤝" ;;
                question) icon="❓" ;;
                answer)   icon="💬" ;;
            esac
            echo -e "  ${icon} ${CYAN}${sess}${NC} [${BLUE}${time_part}${NC}] ${msg}"
        done <<< "$messages"
        echo ""
    fi

    if [[ -z "$handoffs" && -z "$messages" ]]; then
        echo -e "${PINK}[COLLAB]${NC} Inbox empty — no pending handoffs or recent messages"
    fi

    # Mark messages as read
    if [[ -n "$session" && -n "$messages" ]]; then
        sql "UPDATE messages SET read_by = CASE WHEN read_by='' THEN '$session' ELSE read_by || ',$session' END WHERE created_at > datetime('now', '-24 hours') AND read_by NOT LIKE '%${session}%';" 2>/dev/null || true
    fi
}

# ── STATUS ──
cmd_status() {
    check_db

    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}BlackRoad Collaboration Status${NC}                          ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Current session
    local session
    session=$(get_session)
    if [[ -n "$session" ]]; then
        echo -e "  ${GREEN}Current session:${NC} ${CYAN}${session}${NC}"
    else
        echo -e "  ${YELLOW}No active session${NC} — run: ${CYAN}$0 register${NC}"
    fi
    echo ""

    # Active sessions
    echo -e "  ${BOLD}Active Sessions:${NC}"
    local active
    active=$(sql "SELECT session_id, started_at, focus FROM sessions WHERE status='active' ORDER BY started_at DESC LIMIT 10;" 2>/dev/null)
    if [[ -n "$active" ]]; then
        while IFS='|' read -r sid started focus; do
            local time_part="${started:11:8}"
            echo -e "    ${GREEN}●${NC} ${CYAN}${sid}${NC} (since ${BLUE}${time_part}${NC})${focus:+ — $focus}"
        done <<< "$active"
    else
        echo -e "    ${YELLOW}No active sessions${NC}"
    fi
    echo ""

    # Stats
    local total_sessions total_msgs total_handoffs pending_handoffs
    total_sessions=$(sql "SELECT count(*) FROM sessions;" 2>/dev/null || echo 0)
    total_msgs=$(sql "SELECT count(*) FROM messages;" 2>/dev/null || echo 0)
    total_handoffs=$(sql "SELECT count(*) FROM handoffs;" 2>/dev/null || echo 0)
    pending_handoffs=$(sql "SELECT count(*) FROM handoffs WHERE picked_up_by='';" 2>/dev/null || echo 0)

    echo -e "  ${BOLD}Stats:${NC}"
    echo -e "    Sessions: ${GREEN}${total_sessions}${NC} | Messages: ${BLUE}${total_msgs}${NC} | Handoffs: ${PURPLE}${total_handoffs}${NC} (${YELLOW}${pending_handoffs} pending${NC})"
    echo ""

    # Last 5 messages
    local recent
    recent=$(sql "SELECT type, session_id, message, created_at FROM messages ORDER BY created_at DESC LIMIT 5;" 2>/dev/null)
    if [[ -n "$recent" ]]; then
        echo -e "  ${BOLD}Recent Activity:${NC}"
        while IFS='|' read -r type sess msg created; do
            local time_part="${created:11:8}"
            echo -e "    [${BLUE}${time_part}${NC}] ${CYAN}${type}${NC} from ${sess}: ${msg:0:60}"
        done <<< "$recent"
    fi

    # Slack health check
    echo ""
    local slack_status
    slack_status=$(curl -s --max-time 2 --connect-timeout 1 "$SLACK_API/health" 2>/dev/null | jq -r '.status' 2>/dev/null || echo "unreachable")
    if [[ "$slack_status" == "alive" ]]; then
        echo -e "  ${GREEN}Slack:${NC} connected"
    else
        echo -e "  ${YELLOW}Slack:${NC} ${slack_status} (local-only mode)"
    fi
}

# ── POST ──
cmd_post() {
    local msg="$*"
    if [[ -z "$msg" ]]; then
        echo -e "${RED}Usage: $0 post <message>${NC}"
        exit 1
    fi

    local session
    session=$(get_session)
    local prefix="${session:+[$session] }"

    post_to_slack "${prefix}${msg}"
    echo -e "${GREEN}Posted to Slack:${NC} ${msg}"
}

# ── ASK ──
cmd_ask() {
    local agent="$1"
    shift || true
    local msg="$*"

    if [[ -z "$agent" || -z "$msg" ]]; then
        echo -e "${RED}Usage: $0 ask <agent> <message>${NC}"
        echo -e "${CYAN}Agents: alice, cecilia, octavia, aria, lucidia, shellfish, caddy, alexa, road${NC}"
        exit 1
    fi

    echo -e "${BLUE}Asking ${CYAN}${agent}${BLUE}...${NC}"

    local response
    response=$(curl -s --max-time 15 --connect-timeout 3 \
        -X POST "$SLACK_API/ask" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg a "$agent" --arg m "$msg" '{agent:$a, message:$m, slack:true}')" 2>/dev/null)

    if [[ -n "$response" ]]; then
        local agent_name reply
        agent_name=$(echo "$response" | jq -r '.agent // "?"')
        reply=$(echo "$response" | jq -r '.reply // "no response"')
        echo -e "${GREEN}${agent_name}:${NC} ${reply}"
    else
        echo -e "${RED}No response — Slack Worker may be unreachable${NC}"
    fi
}

# ── GROUP ──
cmd_group() {
    local topic="$*"
    if [[ -z "$topic" ]]; then
        echo -e "${RED}Usage: $0 group <topic>${NC}"
        exit 1
    fi

    echo -e "${BLUE}Starting group discussion: ${CYAN}${topic}${NC}"

    local response
    response=$(curl -s --max-time 30 --connect-timeout 3 \
        -X POST "$SLACK_API/group" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg t "$topic" '{topic:$t}')" 2>/dev/null)

    if [[ -n "$response" ]]; then
        echo ""
        echo "$response" | jq -r '.transcript[]? | "\(.emoji) \(.agent): \(.reply)"' 2>/dev/null
    else
        echo -e "${RED}No response — Slack Worker may be unreachable${NC}"
    fi
}

# ── CLAIM ──
cmd_claim() {
    check_db
    local task="$*"
    if [[ -z "$task" ]]; then
        echo -e "${RED}Usage: $0 claim <task-description>${NC}"
        exit 1
    fi

    local session
    session=$(get_session)
    if [[ -z "$session" ]]; then
        echo -e "${RED}No active session${NC}"
        exit 1
    fi

    # Check if already claimed by another session
    local existing
    existing=$(sql "SELECT session_id FROM claims WHERE task='$(echo "$task" | sed "s/'/''/g")' AND status='active' LIMIT 1;" 2>/dev/null)
    if [[ -n "$existing" ]]; then
        echo -e "${RED}Already claimed by ${CYAN}${existing}${NC}"
        return 1
    fi

    local now
    now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    sql "INSERT INTO claims (claim_id, session_id, task, status, claimed_at) VALUES ('claim-$(date +%s)-$$', '$session', '$(echo "$task" | sed "s/'/''/g")', 'active', '$now');"

    echo -e "${GREEN}Claimed:${NC} $task"
    log_journal "collab-claim" "$session" "Claimed: $task"

    # Announce claim to all
    local msg_id="msg-$(date +%s)-$$"
    sql "INSERT INTO messages (msg_id, session_id, type, message, created_at) VALUES ('$msg_id', '$session', 'claim', 'CLAIMED: $(echo "$task" | sed "s/'/''/g")', '$now');"
}

# ── RELEASE ──
cmd_release() {
    check_db
    local task="$*"
    local session
    session=$(get_session)

    if [[ -z "$task" ]]; then
        # Release all claims for this session
        sql "UPDATE claims SET status='released' WHERE session_id='$session' AND status='active';"
        echo -e "${GREEN}Released all claims${NC}"
    else
        sql "UPDATE claims SET status='released' WHERE task LIKE '%$(echo "$task" | sed "s/'/''/g")%' AND session_id='$session' AND status='active';"
        echo -e "${GREEN}Released:${NC} $task"
    fi
}

# ── CLAIMS ──
cmd_claims() {
    check_db
    local claims
    claims=$(sql "SELECT session_id, task, claimed_at FROM claims WHERE status='active' ORDER BY claimed_at DESC;" 2>/dev/null)

    if [[ -z "$claims" ]]; then
        echo -e "${PINK}[COLLAB]${NC} No active claims"
        return
    fi

    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}Active Claims${NC}                                           ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    while IFS='|' read -r sess task claimed; do
        local time_part="${claimed:11:8}"
        echo -e "  ${GREEN}●${NC} ${CYAN}${sess}${NC} [${BLUE}${time_part}${NC}]"
        echo -e "    ${task}"
        echo ""
    done <<< "$claims"
}

# ── DM (Direct Message) ──
cmd_dm() {
    check_db
    local target="$1"
    shift || true
    local msg="$*"

    if [[ -z "$target" || -z "$msg" ]]; then
        echo -e "${RED}Usage: $0 dm <session-id-suffix> <message>${NC}"
        echo -e "${CYAN}Tip: Use last 5 digits of session ID (e.g., 66770)${NC}"
        exit 1
    fi

    local session
    session=$(get_session)
    local now
    now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Find target session by suffix match
    local target_session
    target_session=$(sql "SELECT session_id FROM sessions WHERE session_id LIKE '%${target}%' AND status='active' ORDER BY last_seen DESC LIMIT 1;" 2>/dev/null)

    if [[ -z "$target_session" ]]; then
        echo -e "${RED}No active session matching '${target}'${NC}"
        return 1
    fi

    local msg_id="dm-$(date +%s)-$$"
    sql "INSERT INTO messages (msg_id, session_id, type, message, metadata, created_at) VALUES ('$msg_id', '$session', 'dm', '$(echo "$msg" | sed "s/'/''/g")', '{\"to\":\"$target_session\"}', '$now');"

    echo -e "${GREEN}DM → ${CYAN}${target_session}${NC}: ${msg}"
    log_journal "collab-dm" "$session" "DM to ${target_session}: $msg"
}

# ── PING ──
cmd_ping() {
    check_db
    local session
    session=$(get_session)
    local now
    now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Update heartbeat
    sql "UPDATE sessions SET last_seen='$now' WHERE session_id='$session';"

    # Mark stale sessions
    sql "UPDATE sessions SET status='stale' WHERE status='active' AND last_seen < datetime('now', '-30 minutes');"

    # Count active
    local active
    active=$(sql "SELECT count(*) FROM sessions WHERE status='active';" 2>/dev/null || echo 0)

    # Check for DMs to me
    local dms
    dms=$(sql "SELECT session_id, message FROM messages WHERE type='dm' AND metadata LIKE '%${session}%' AND read_by NOT LIKE '%${session}%' ORDER BY created_at DESC LIMIT 5;" 2>/dev/null)

    if [[ -n "$dms" ]]; then
        echo -e "${PINK}[COLLAB]${NC} ${YELLOW}You have DMs:${NC}"
        while IFS='|' read -r from msg; do
            echo -e "  ${CYAN}${from}${NC}: ${msg}"
        done <<< "$dms"
        sql "UPDATE messages SET read_by = CASE WHEN read_by='' THEN '$session' ELSE read_by || ',$session' END WHERE type='dm' AND metadata LIKE '%${session}%' AND read_by NOT LIKE '%${session}%';" 2>/dev/null || true
    fi

    echo -e "${PINK}[COLLAB]${NC} Ping OK — ${GREEN}${active}${NC} active sessions"
}

# ── BOARD (shared task board) ──
cmd_board() {
    check_db

    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}Shared Task Board${NC}                                      ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Active claims
    echo -e "  ${BOLD}${GREEN}In Progress:${NC}"
    local active_claims
    active_claims=$(sql "SELECT session_id, task, claimed_at FROM claims WHERE status='active' ORDER BY claimed_at DESC;" 2>/dev/null)
    if [[ -n "$active_claims" ]]; then
        while IFS='|' read -r sess task claimed; do
            echo -e "    ${GREEN}●${NC} ${task:0:60}"
            echo -e "      ${CYAN}${sess}${NC}"
        done <<< "$active_claims"
    else
        echo -e "    ${YELLOW}(none)${NC}"
    fi

    echo ""

    # Recent completions (from announces with "DONE" or "COMPLETE")
    echo -e "  ${BOLD}${BLUE}Recently Done:${NC}"
    local done_msgs
    done_msgs=$(sql "SELECT session_id, message, created_at FROM messages WHERE (message LIKE '%DONE%' OR message LIKE '%COMPLETE%' OR message LIKE '%DEPLOYED%' OR message LIKE '%SHIPPED%' OR message LIKE '%BUILT%') AND created_at > datetime('now', '-12 hours') ORDER BY created_at DESC LIMIT 10;" 2>/dev/null)
    if [[ -n "$done_msgs" ]]; then
        while IFS='|' read -r sess msg created; do
            local time_part="${created:11:8}"
            echo -e "    ${BLUE}✓${NC} [${time_part}] ${msg:0:70}"
        done <<< "$done_msgs"
    else
        echo -e "    ${YELLOW}(none in last 12h)${NC}"
    fi

    echo ""

    # Sessions + what they're working on
    echo -e "  ${BOLD}${PURPLE}Sessions:${NC}"
    local sessions
    sessions=$(sql "SELECT s.session_id, s.last_seen, s.focus, COALESCE(c.task,'') FROM sessions s LEFT JOIN claims c ON s.session_id = c.session_id AND c.status='active' WHERE s.status='active' ORDER BY s.last_seen DESC;" 2>/dev/null)
    if [[ -n "$sessions" ]]; then
        while IFS='|' read -r sid seen focus task; do
            local time_part="${seen:11:8}"
            local label="${focus:-${task:-idle}}"
            echo -e "    ${GREEN}●${NC} ${CYAN}${sid:(-5)}${NC} [${time_part}] ${label:0:50}"
        done <<< "$sessions"
    fi
}

# ── COMPLETE ──
cmd_complete() {
    check_db
    local session
    session=$(get_session)
    if [[ -z "$session" ]]; then
        echo -e "${YELLOW}No active session to complete${NC}"
        return
    fi

    local now
    now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    sql "UPDATE sessions SET status='completed', last_seen='$now' WHERE session_id='$session';"

    echo -e "${GREEN}Session ${CYAN}${session}${GREEN} marked complete${NC}"
    rm -f "$SESSION_FILE"

    post_collab "complete" "Session complete" "$session" &
    log_journal "collab-complete" "$session" "Session completed"
}

# ── HELP ──
cmd_help() {
    cat <<EOF
${PINK}╔════════════════════════════════════════════════════════════╗${NC}
${PINK}║${NC}  ${BOLD}BlackRoad Collaboration System${NC}                          ${PINK}║${NC}
${PINK}╚════════════════════════════════════════════════════════════╝${NC}

${BOLD}Session Management:${NC}
  ${CYAN}register [focus]${NC}     Register this Claude session
  ${CYAN}complete${NC}             Mark session as done
  ${CYAN}status${NC}               Show collaboration status
  ${CYAN}ping${NC}                 Heartbeat + check for DMs

${BOLD}Messaging:${NC}
  ${CYAN}announce <msg>${NC}       Broadcast to all sessions
  ${CYAN}handoff <msg>${NC}        Leave a note for the next session
  ${CYAN}inbox${NC}                Read pending handoffs + messages
  ${CYAN}dm <session> <msg>${NC}   Direct message to a specific session
  ${CYAN}post <msg>${NC}           Post to Slack channel
  ${CYAN}ask <agent> <msg>${NC}    Ask an AI agent via Slack
  ${CYAN}group <topic>${NC}        Start multi-agent discussion

${BOLD}Task Coordination:${NC}
  ${CYAN}claim <task>${NC}         Claim a task (prevents duplicates)
  ${CYAN}release [task]${NC}       Release a claim (or all claims)
  ${CYAN}claims${NC}               List all active claims
  ${CYAN}board${NC}                Shared task board (claims + done + sessions)

${BOLD}System:${NC}
  ${CYAN}init${NC}                 Initialize the database
  ${CYAN}help${NC}                 Show this help

${BOLD}Agents:${NC} alice, cecilia, octavia, aria, lucidia, shellfish, caddy, alexa, road

${BOLD}Examples:${NC}
  $0 register "working on mesh network"
  $0 announce "deployed auth fix to production"
  $0 handoff "left off at mesh-network-poc todo #5, DNS still needs CNAME"
  $0 ask alice "what's your disk usage?"
  $0 group "should we migrate to Bookworm this week?"
EOF
}

# ── COMMAND ROUTER ──
case "${1:-help}" in
    init)                     cmd_init ;;
    register|reg)             shift; cmd_register "$@" ;;
    announce|ann)             shift; cmd_announce "$@" ;;
    handoff|ho)               shift; cmd_handoff "$@" ;;
    inbox|in)                 cmd_inbox ;;
    status|st)                cmd_status ;;
    post|p)                   shift; cmd_post "$@" ;;
    ask|a)                    shift; cmd_ask "$@" ;;
    group|g)                  shift; cmd_group "$@" ;;
    complete|done)            cmd_complete ;;
    claim|cl)                 shift; cmd_claim "$@" ;;
    release|rl)               shift; cmd_release "$@" ;;
    claims|ls)                cmd_claims ;;
    dm|msg)                   shift; cmd_dm "$@" ;;
    ping)                     cmd_ping ;;
    board|b)                  cmd_board ;;
    help|--help|-h)           cmd_help ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        cmd_help
        exit 1
        ;;
esac
