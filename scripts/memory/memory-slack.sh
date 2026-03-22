#!/bin/bash
# BlackRoad Slack CLI — Direct agent communication bridge
# Usage: memory-slack.sh <command> [args]
set -e

SLACK_API="https://blackroad-slack.amundsonalexa.workers.dev"
SESSION_FILE="$HOME/.blackroad/memory/current-collab-session"

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

get_session() {
    if [[ -f "$SESSION_FILE" ]]; then
        cat "$SESSION_FILE"
    else
        echo "unknown"
    fi
}

# ── SAY ──
cmd_say() {
    local msg="$*"
    [[ -z "$msg" ]] && { echo -e "${RED}Usage: $0 say <message>${NC}"; exit 1; }
    local session
    session=$(get_session)
    local text="[${session}] ${msg}"
    curl -s --max-time 3 --connect-timeout 2 \
        -X POST "$SLACK_API/post" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg t "$text" '{text:$t}')" >/dev/null 2>&1 || true
    echo -e "${GREEN}Sent to Slack:${NC} $msg"
}

# ── ASK ──
cmd_ask() {
    local agent="$1"
    shift || true
    local msg="$*"
    [[ -z "$agent" || -z "$msg" ]] && { echo -e "${RED}Usage: $0 ask <agent> <message>${NC}"; exit 1; }

    echo -e "${BLUE}Asking ${CYAN}${agent}${BLUE}...${NC}"
    local response
    response=$(curl -s --max-time 15 --connect-timeout 3 \
        -X POST "$SLACK_API/ask" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg a "$agent" --arg m "$msg" '{agent:$a, message:$m, slack:true}')" 2>/dev/null)

    if [[ -n "$response" ]]; then
        local name reply
        name=$(echo "$response" | jq -r '.agent // "?"')
        reply=$(echo "$response" | jq -r '.reply // "no response"')
        echo -e "${GREEN}${name}:${NC} ${reply}"
    else
        echo -e "${RED}No response — agent may be offline${NC}"
    fi
}

# ── DEBATE ──
cmd_debate() {
    local topic="$*"
    [[ -z "$topic" ]] && { echo -e "${RED}Usage: $0 debate <topic>${NC}"; exit 1; }

    echo -e "${BLUE}Starting debate: ${CYAN}${topic}${NC}"
    echo -e "${BLUE}Agents: alice, cecilia, octavia, lucidia × 2 rounds${NC}"
    echo ""

    local response
    response=$(curl -s --max-time 60 --connect-timeout 3 \
        -X POST "$SLACK_API/group" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg t "$topic" '{topic:$t, agents:["alice","cecilia","octavia","lucidia"], rounds:2}')" 2>/dev/null)

    if [[ -n "$response" ]]; then
        echo "$response" | jq -r '.transcript[]? | "\(.emoji) \(.agent) (round \(.round + 1)): \(.reply)"' 2>/dev/null
    else
        echo -e "${RED}No response — debate failed${NC}"
    fi
}

# ── COUNCIL ──
cmd_council() {
    local topic="$*"
    [[ -z "$topic" ]] && { echo -e "${RED}Usage: $0 council <topic>${NC}"; exit 1; }

    echo -e "${BLUE}Full council: ${CYAN}${topic}${NC}"
    echo ""

    local response
    response=$(curl -s --max-time 60 --connect-timeout 3 \
        -X POST "$SLACK_API/group" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg t "$topic" '{topic:$t, agents:["alice","cecilia","octavia","lucidia","shellfish","caddy"], rounds:1}')" 2>/dev/null)

    if [[ -n "$response" ]]; then
        echo "$response" | jq -r '.transcript[]? | "\(.emoji) \(.agent): \(.reply)"' 2>/dev/null
    else
        echo -e "${RED}No response — council failed${NC}"
    fi
}

# ── ALERT ──
cmd_alert() {
    local msg="$*"
    [[ -z "$msg" ]] && { echo -e "${RED}Usage: $0 alert <message>${NC}"; exit 1; }

    curl -s --max-time 3 --connect-timeout 2 \
        -X POST "$SLACK_API/alert" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg t "$msg" '{text:$t}')" >/dev/null 2>&1 || true
    echo -e "${RED}🚨 Alert sent:${NC} $msg"
}

# ── DEPLOY ──
cmd_deploy() {
    local msg="$*"
    [[ -z "$msg" ]] && { echo -e "${RED}Usage: $0 deploy <message>${NC}"; exit 1; }

    curl -s --max-time 3 --connect-timeout 2 \
        -X POST "$SLACK_API/deploy" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg t "$msg" '{text:$t}')" >/dev/null 2>&1 || true
    echo -e "${GREEN}🚀 Deploy notification sent:${NC} $msg"
}

# ── HEALTH ──
cmd_health() {
    local response
    response=$(curl -s --max-time 5 --connect-timeout 2 "$SLACK_API/health" 2>/dev/null)
    if [[ -n "$response" ]]; then
        local status agents
        status=$(echo "$response" | jq -r '.status')
        agents=$(echo "$response" | jq -r '.agents')
        echo -e "${GREEN}Slack Worker:${NC} $status — $agents agents"
    else
        echo -e "${RED}Slack Worker: unreachable${NC}"
    fi

    local full_status
    full_status=$(curl -s --max-time 5 --connect-timeout 2 "$SLACK_API/status" 2>/dev/null)
    if [[ -n "$full_status" ]]; then
        local webhook bot
        webhook=$(echo "$full_status" | jq -r '.webhook')
        bot=$(echo "$full_status" | jq -r '.bot_token')
        echo -e "  Webhook: ${GREEN}$webhook${NC}"
        echo -e "  Bot token: ${YELLOW}$bot${NC}"
    fi
}

# ── AGENTS ──
cmd_agents() {
    local response
    response=$(curl -s --max-time 5 --connect-timeout 2 "$SLACK_API/agents" 2>/dev/null)

    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}BlackRoad Slack Agents${NC}                                  ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    if [[ -n "$response" ]]; then
        echo "$response" | jq -r '.agents[]? | "  \(.emoji) \(.name|@text) — \(.role)"' 2>/dev/null
    else
        echo -e "  ${RED}Could not fetch agents${NC}"
    fi
    echo ""
}

# ── BROADCAST ──
cmd_broadcast() {
    local msg="$*"
    [[ -z "$msg" ]] && { echo -e "${RED}Usage: $0 broadcast <message>${NC}"; exit 1; }

    local session
    session=$(get_session)

    # Post to Slack
    curl -s --max-time 3 --connect-timeout 2 \
        -X POST "$SLACK_API/collab" \
        -H "Content-Type: application/json" \
        -d "$(jq -n --arg t "announce" --arg m "$msg" --arg s "$session" \
            '{type:$t, message:$m, session_id:$s}')" >/dev/null 2>&1 || true

    # Also log to collab DB if available
    if [[ -f "$HOME/.blackroad/collaboration.db" ]]; then
        local msg_id="msg-$(date +%s)-$$"
        local now
        now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        sqlite3 "$HOME/.blackroad/collaboration.db" "INSERT INTO messages (msg_id, session_id, type, message, created_at) VALUES ('$msg_id', '$session', 'announce', '$(echo "$msg" | sed "s/'/''/g")', '$now');" 2>/dev/null || true
    fi

    echo -e "${GREEN}📢 Broadcast:${NC} $msg"
}

# ── THREAD ──
cmd_thread() {
    local agent="$1"
    shift || true
    local initial="$*"
    [[ -z "$agent" || -z "$initial" ]] && { echo -e "${RED}Usage: $0 thread <agent> <message>${NC}"; exit 1; }

    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}Thread with ${agent}${NC}                                        ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    local context=""
    local prompts=("$initial" "Can you elaborate on that?" "What should we do about it?")

    for i in 0 1 2; do
        local prompt="${prompts[$i]}"
        if [[ "$i" -gt 0 ]]; then
            prompt="Previous context: ${context}. Follow-up: ${prompts[$i]}"
        fi

        echo -e "${BLUE}You:${NC} ${prompts[$i]}"
        local response
        response=$(curl -s --max-time 15 --connect-timeout 3 \
            -X POST "$SLACK_API/ask" \
            -H "Content-Type: application/json" \
            -d "$(jq -n --arg a "$agent" --arg m "$prompt" '{agent:$a, message:$m}')" 2>/dev/null)

        if [[ -n "$response" ]]; then
            local reply
            reply=$(echo "$response" | jq -r '.reply // "..."')
            echo -e "${GREEN}${agent}:${NC} ${reply}"
            context="${context} ${reply}"
        else
            echo -e "${RED}(no response)${NC}"
        fi
        echo ""
    done
}

# ── HELP ──
cmd_help() {
    cat <<EOF
${PINK}╔════════════════════════════════════════════════════════════╗${NC}
${PINK}║${NC}  ${BOLD}BlackRoad Slack CLI${NC}                                     ${PINK}║${NC}
${PINK}╚════════════════════════════════════════════════════════════╝${NC}

${BOLD}Messaging:${NC}
  ${CYAN}say <message>${NC}           Post to Slack with session prefix
  ${CYAN}broadcast <message>${NC}     Broadcast via /collab + log to DB
  ${CYAN}alert <message>${NC}         Send alert to Slack
  ${CYAN}deploy <message>${NC}        Send deploy notification

${BOLD}Agents:${NC}
  ${CYAN}ask <agent> <msg>${NC}       Ask an AI agent
  ${CYAN}debate <topic>${NC}          4-agent debate (2 rounds)
  ${CYAN}council <topic>${NC}         6-agent council (1 round)
  ${CYAN}thread <agent> <msg>${NC}    3-exchange conversation with agent
  ${CYAN}agents${NC}                  List all available agents

${BOLD}System:${NC}
  ${CYAN}health${NC}                  Check Slack Worker health

${BOLD}Agents:${NC} alice, cecilia, octavia, aria, lucidia, shellfish, caddy, alexa, road
EOF
}

case "${1:-help}" in
    say|s)              shift; cmd_say "$@" ;;
    ask|a)              shift; cmd_ask "$@" ;;
    debate|d)           shift; cmd_debate "$@" ;;
    council|c)          shift; cmd_council "$@" ;;
    alert)              shift; cmd_alert "$@" ;;
    deploy)             shift; cmd_deploy "$@" ;;
    health|h)           cmd_health ;;
    agents|list)        cmd_agents ;;
    broadcast|bc)       shift; cmd_broadcast "$@" ;;
    thread|t)           shift; cmd_thread "$@" ;;
    help|--help|-h)     cmd_help ;;
    *)
        echo -e "${RED}Unknown: $1${NC}"
        cmd_help
        exit 1
        ;;
esac
