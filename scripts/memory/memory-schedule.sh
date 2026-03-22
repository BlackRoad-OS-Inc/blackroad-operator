#!/bin/bash
# BlackRoad Schedule Agent — Reads Google Calendar, posts to Slack, agents work on blocks
# Uses MCP calendar tools via the Slack Worker API
# Usage: memory-schedule.sh <command> [args]
set -e

COLLAB_DB="$HOME/.blackroad/collaboration.db"
SESSION_FILE="$HOME/.blackroad/memory/current-collab-session"
SLACK_API="https://blackroad-slack.amundsonalexa.workers.dev"
SCHEDULE_DB="$HOME/.blackroad/schedule.db"

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

sql() { sqlite3 "$SCHEDULE_DB" "$@" 2>/dev/null; }

post_to_slack() {
    curl -s --max-time 3 --connect-timeout 2 \
        -X POST "$SLACK_API/post" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg t "$1" '{text:$t}')" >/dev/null 2>&1 || true
}

get_session() {
    [[ -f "$SESSION_FILE" ]] && cat "$SESSION_FILE" || echo "unknown"
}

# ── INIT ──
cmd_init() {
    mkdir -p "$(dirname "$SCHEDULE_DB")"
    sqlite3 "$SCHEDULE_DB" <<'SQL'
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS schedule_blocks (
    block_id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT DEFAULT '',
    copilot_prompt TEXT DEFAULT '',
    claimed_by TEXT DEFAULT '',
    status TEXT DEFAULT 'open',
    gcal_event_id TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_blocks_date ON schedule_blocks(date);
CREATE TABLE IF NOT EXISTS block_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    block_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT DEFAULT '',
    created_at TEXT NOT NULL
);
SQL
    echo -e "${GREEN}Schedule DB initialized${NC}"
}

# ── TODAY ──
cmd_today() {
    local today
    today=$(date +%Y-%m-%d)

    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}Schedule — $today${NC}                                    ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Check if we have today's blocks cached
    local count
    count=$(sql "SELECT count(*) FROM schedule_blocks WHERE date='$today';" 2>/dev/null || echo "0")

    if [[ "$count" -eq 0 || "$count" == "0" ]]; then
        echo -e "  ${YELLOW}No blocks cached for today. Run: $0 sync${NC}"
        echo ""
        return
    fi

    sql "SELECT start_time, end_time, summary, claimed_by, status, copilot_prompt FROM schedule_blocks WHERE date='$today' ORDER BY start_time;" | while IFS='|' read -r start end summary claimed status prompt; do
        local icon="⬜"
        local extra=""
        case "$status" in
            claimed) icon="🔵"; extra=" ${DIM}(${claimed})${NC}" ;;
            done)    icon="✅" ;;
            active)  icon="🟢"; extra=" ${GREEN}ACTIVE${NC}" ;;
        esac
        echo -e "  $icon ${BOLD}${start}-${end}${NC}  $summary$extra"
        if [[ -n "$prompt" && "$1" == "--prompts" ]]; then
            echo -e "     ${DIM}Prompt: ${prompt:0:120}${NC}"
        fi
    done
    echo ""

    local open claimed done
    open=$(sql "SELECT count(*) FROM schedule_blocks WHERE date='$today' AND status='open';")
    claimed=$(sql "SELECT count(*) FROM schedule_blocks WHERE date='$today' AND status='claimed';")
    done=$(sql "SELECT count(*) FROM schedule_blocks WHERE date='$today' AND status='done';")
    echo -e "  ${GREEN}$done done${NC} | ${BLUE}$claimed claimed${NC} | ${YELLOW}$open open${NC}"
}

# ── SYNC — Import from calendar JSON cache ──
cmd_sync() {
    cmd_init 2>/dev/null
    local today
    today=$(date +%Y-%m-%d)

    echo -e "${BLUE}Syncing calendar for $today...${NC}"

    # Find the latest calendar JSON from MCP tool results
    local json_file
    json_file=$(find "$HOME/.claude/projects" -name "*.json" -path "*/tool-results/*" -newer /tmp/.schedule-sync-marker 2>/dev/null | head -1)

    if [[ -z "$json_file" ]]; then
        # Try to find any recent calendar result
        json_file=$(find "$HOME/.claude/projects" -name "*.json" -path "*/tool-results/*" -exec grep -l "calendar" {} \; 2>/dev/null | head -1)
    fi

    if [[ -n "$json_file" ]]; then
        # Parse events from JSON
        python3 -c "
import json, sys
with open('$json_file') as f:
    data = json.load(f)
text = data[0]['text'] if isinstance(data, list) else data
events_data = json.loads(text) if isinstance(text, str) else text
events = events_data.get('events', [])
today = '$today'
for e in events:
    start = e.get('start', {})
    dt = start.get('dateTime', start.get('date', ''))
    if not dt.startswith(today):
        continue
    start_time = dt[11:16] if len(dt) > 10 else '00:00'
    end_dt = e.get('end', {}).get('dateTime', '')
    end_time = end_dt[11:16] if len(end_dt) > 10 else '23:59'
    summary = e.get('summary', '?').replace(\"'\", \"''\")
    desc = (e.get('description', '') or '').replace(\"'\", \"''\")
    # Extract Copilot prompt if present
    prompt = ''
    if 'Copilot Prompt:' in desc:
        prompt = desc.split('Copilot Prompt:')[1].strip().strip(\"'\").replace(\"'\", \"''\")
    event_id = e.get('id', '')
    block_id = f'{today}-{start_time}'
    print(f\"INSERT OR REPLACE INTO schedule_blocks (block_id, date, start_time, end_time, summary, description, copilot_prompt, gcal_event_id) VALUES ('{block_id}', '{today}', '{start_time}', '{end_time}', '{summary}', '{desc[:500]}', '{prompt[:500]}', '{event_id}');\")
" 2>/dev/null | sqlite3 "$SCHEDULE_DB" 2>/dev/null

        local synced
        synced=$(sql "SELECT count(*) FROM schedule_blocks WHERE date='$today';")
        echo -e "${GREEN}Synced $synced blocks for $today${NC}"
        touch /tmp/.schedule-sync-marker
    else
        echo -e "${YELLOW}No calendar data found. Use MCP calendar tools first, then re-run sync.${NC}"
    fi
}

# ── CLAIM ──
cmd_claim() {
    local time_or_id="$1"
    [[ -z "$time_or_id" ]] && { echo -e "${RED}Usage: $0 claim <start-time or block-id>${NC}"; exit 1; }

    local session
    session=$(get_session)
    local today
    today=$(date +%Y-%m-%d)
    local now
    now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Try matching by start_time first
    local block_id
    block_id=$(sql "SELECT block_id FROM schedule_blocks WHERE (start_time='$time_or_id' OR block_id='$time_or_id') AND date='$today' LIMIT 1;")

    if [[ -z "$block_id" ]]; then
        echo -e "${RED}No block found matching '$time_or_id' for today${NC}"
        return 1
    fi

    sql "UPDATE schedule_blocks SET claimed_by='$session', status='claimed' WHERE block_id='$block_id';"

    local summary
    summary=$(sql "SELECT summary FROM schedule_blocks WHERE block_id='$block_id';")
    echo -e "${GREEN}Claimed:${NC} $summary"

    # Show the Copilot prompt
    local prompt
    prompt=$(sql "SELECT copilot_prompt FROM schedule_blocks WHERE block_id='$block_id';")
    if [[ -n "$prompt" ]]; then
        echo -e "${CYAN}Copilot Prompt:${NC} $prompt"
    fi

    post_to_slack "🔵 *Block Claimed* [$session]: $summary" &
    sql "INSERT INTO block_logs (block_id, session_id, action, details, created_at) VALUES ('$block_id', '$session', 'claimed', '$summary', '$now');"
}

# ── COMPLETE ──
cmd_complete() {
    local time_or_id="$1"
    [[ -z "$time_or_id" ]] && { echo -e "${RED}Usage: $0 complete <start-time or block-id>${NC}"; exit 1; }

    local today
    today=$(date +%Y-%m-%d)
    local now
    now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local session
    session=$(get_session)

    local block_id
    block_id=$(sql "SELECT block_id FROM schedule_blocks WHERE (start_time='$time_or_id' OR block_id='$time_or_id') AND date='$today' LIMIT 1;")

    if [[ -z "$block_id" ]]; then
        echo -e "${RED}No block found matching '$time_or_id'${NC}"
        return 1
    fi

    sql "UPDATE schedule_blocks SET status='done' WHERE block_id='$block_id';"
    local summary
    summary=$(sql "SELECT summary FROM schedule_blocks WHERE block_id='$block_id';")
    echo -e "${GREEN}✅ Completed:${NC} $summary"
    post_to_slack "✅ *Block Done*: $summary" &
    sql "INSERT INTO block_logs (block_id, session_id, action, details, created_at) VALUES ('$block_id', '$session', 'completed', '$summary', '$now');"
}

# ── PROMPT — Show the Copilot prompt for a block ──
cmd_prompt() {
    local time_or_id="$1"
    [[ -z "$time_or_id" ]] && { echo -e "${RED}Usage: $0 prompt <start-time>${NC}"; exit 1; }

    local today
    today=$(date +%Y-%m-%d)

    local result
    result=$(sql "SELECT summary, copilot_prompt, description FROM schedule_blocks WHERE (start_time='$time_or_id' OR block_id='$time_or_id') AND date='$today' LIMIT 1;")

    if [[ -z "$result" ]]; then
        echo -e "${RED}No block found${NC}"
        return 1
    fi

    IFS='|' read -r summary prompt desc <<< "$result"
    echo -e "${BOLD}$summary${NC}"
    echo ""
    if [[ -n "$prompt" ]]; then
        echo -e "${CYAN}Copilot Prompt:${NC}"
        echo "$prompt"
    else
        echo -e "${DIM}No Copilot prompt — full description:${NC}"
        echo "$desc"
    fi
}

# ── POST — Post today's schedule to Slack ──
cmd_post() {
    local today
    today=$(date +%Y-%m-%d)

    local msg="📅 *Schedule — $today*\n"
    sql "SELECT start_time, end_time, summary, status FROM schedule_blocks WHERE date='$today' ORDER BY start_time;" | while IFS='|' read -r start end summary status; do
        local icon="⬜"
        case "$status" in
            claimed) icon="🔵" ;;
            done) icon="✅" ;;
            active) icon="🟢" ;;
        esac
        msg="${msg}\n${icon} ${start}-${end}  ${summary}"
    done

    post_to_slack "$msg"
    echo -e "${GREEN}Schedule posted to Slack${NC}"
}

# ── NEXT — What block is coming up? ──
cmd_next() {
    local today
    today=$(date +%Y-%m-%d)
    local now_time
    now_time=$(date +%H:%M)

    local result
    result=$(sql "SELECT start_time, end_time, summary, copilot_prompt FROM schedule_blocks WHERE date='$today' AND start_time >= '$now_time' AND status='open' ORDER BY start_time LIMIT 1;")

    if [[ -z "$result" ]]; then
        echo -e "${GREEN}No more open blocks today!${NC}"
        return
    fi

    IFS='|' read -r start end summary prompt <<< "$result"
    echo -e "${BOLD}Next:${NC} ${start}-${end} ${CYAN}$summary${NC}"
    if [[ -n "$prompt" ]]; then
        echo -e "${DIM}Prompt: ${prompt:0:150}${NC}"
    fi
}

# ── HELP ──
cmd_help() {
    cat <<EOF
${PINK}╔════════════════════════════════════════════════════════════╗${NC}
${PINK}║${NC}  ${BOLD}BlackRoad Schedule Agent${NC}                                 ${PINK}║${NC}
${PINK}╚════════════════════════════════════════════════════════════╝${NC}

${BOLD}Commands:${NC}
  ${CYAN}today [--prompts]${NC}     Show today's schedule (add --prompts for Copilot prompts)
  ${CYAN}sync${NC}                  Import today's events from calendar cache
  ${CYAN}next${NC}                  Show next upcoming open block
  ${CYAN}claim <time>${NC}          Claim a block (e.g. claim 13:00)
  ${CYAN}complete <time>${NC}       Mark a block as done
  ${CYAN}prompt <time>${NC}         Show Copilot prompt for a block
  ${CYAN}post${NC}                  Post schedule to Slack

${BOLD}Examples:${NC}
  $0 sync                 # Import from Google Calendar
  $0 today --prompts      # Show schedule with AI prompts
  $0 claim 13:00          # Claim the 1pm block
  $0 prompt 16:00         # Show the Copilot prompt for 4pm
  $0 complete 13:00       # Mark 1pm block done
EOF
}

case "${1:-help}" in
    init)                   cmd_init ;;
    today|t)                shift 2>/dev/null || true; cmd_today "$@" ;;
    sync|s)                 cmd_sync ;;
    claim|c)                shift; cmd_claim "$@" ;;
    complete|done|d)        shift; cmd_complete "$@" ;;
    prompt|p)               shift; cmd_prompt "$@" ;;
    post)                   cmd_post ;;
    next|n)                 cmd_next ;;
    help|--help|-h)         cmd_help ;;
    *)
        echo -e "${RED}Unknown: $1${NC}"
        cmd_help
        exit 1
        ;;
esac
