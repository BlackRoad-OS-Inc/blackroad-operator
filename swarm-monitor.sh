#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# swarm-monitor.sh — Live Swarm Dashboard
# Real-time view of all active agent PR swarms
#
# Usage:
#   ./swarm-monitor.sh              # One-shot dashboard
#   ./swarm-monitor.sh --live       # Auto-refresh every 30s
#   ./swarm-monitor.sh --json       # JSON output
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BLUE='\033[0;34m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

REPO="${SWARM_REPO:-BlackRoad-OS-Inc/blackroad-operator}"

# Agent colors
color_for() {
  case "$1" in
    lucidia)  echo "${MAGENTA}" ;;
    octavia)  echo "${GREEN}" ;;
    alice)    echo "${CYAN}" ;;
    cipher)   echo "${RED}" ;;
    aria)     echo "${BLUE}" ;;
    prism)    echo "${YELLOW}" ;;
    echo)     echo "${MAGENTA}" ;;
    cecilia)  echo "${YELLOW}" ;;
    coordinator) echo "\033[1;35m" ;;
    *)        echo "${NC}" ;;
  esac
}

icon_for() {
  case "$1" in
    OPEN)       echo "${GREEN}O${NC}" ;;
    CLOSED)     echo "${RED}X${NC}" ;;
    MERGED)     echo "${MAGENTA}M${NC}" ;;
    MERGEABLE)  echo "${GREEN}+${NC}" ;;
    SUCCESS)    echo "${GREEN}*${NC}" ;;
    FAILURE)    echo "${RED}!${NC}" ;;
    PENDING)    echo "${YELLOW}~${NC}" ;;
    *)          echo "${DIM}?${NC}" ;;
  esac
}

render_dashboard() {
  local cols
  cols=$(tput cols 2>/dev/null || echo 80)
  local line
  line=$(printf '%.0s-' $(seq 1 "$cols"))

  echo -e "${BOLD}${MAGENTA}"
  echo "  ____  _      _    ____ _  ______   ___    _    ____  "
  echo " | __ )| |    / \  / ___| |/ /  _ \ / _ \  / \  |  _ \ "
  echo " |  _ \| |   / _ \| |   | ' /| |_) | | | |/ _ \ | | | |"
  echo " | |_) | |__/ ___ \ |___| . \|  _ <| |_| / ___ \| |_| |"
  echo " |____/|____/_/   \_\____|_|\_\_| \_\\___/_/   \_\____/ "
  echo -e "${NC}"
  echo -e "${BOLD}  SWARM MONITOR${NC}              $(date '+%Y-%m-%d %H:%M:%S')"
  echo -e "${DIM}${line}${NC}"

  # Fetch all swarm PRs
  local prs
  prs=$(gh pr list --repo "$REPO" --label "swarm" --state all --limit 50 \
    --json number,title,state,headRefName,createdAt,labels,additions,deletions,changedFiles \
    2>/dev/null || echo "[]")

  local total
  total=$(echo "$prs" | jq length)
  local open
  open=$(echo "$prs" | jq '[.[] | select(.state == "OPEN")] | length')
  local merged
  merged=$(echo "$prs" | jq '[.[] | select(.state == "MERGED")] | length')
  local closed
  closed=$(echo "$prs" | jq '[.[] | select(.state == "CLOSED")] | length')

  echo ""
  echo -e "  ${BOLD}PRs:${NC} ${open} open | ${merged} merged | ${closed} closed | ${total} total"
  echo ""

  # Group by swarm ID
  local swarm_ids
  swarm_ids=$(echo "$prs" | jq -r '.[].headRefName' | grep -oP 'swarm/\K[^/]+' | sort -u)

  if [ -z "$swarm_ids" ]; then
    echo -e "  ${DIM}No active swarms. Launch one with:${NC}"
    echo -e "  ${CYAN}./swarm.sh launch \"your task\" lucidia,octavia,cipher${NC}"
    echo ""

    # Check for local swarms
    if [ -d ".swarm" ]; then
      echo -e "  ${BOLD}Local Swarms (not yet pushed):${NC}"
      for manifest in .swarm/*/manifest.json; do
        [ -f "$manifest" ] || continue
        local sid task agents status
        sid=$(jq -r '.swarm_id' "$manifest")
        task=$(jq -r '.task' "$manifest")
        agents=$(jq -r '.agents | join(", ")' "$manifest")
        status=$(jq -r '.status // "ready"' "$manifest")
        echo -e "    ${CYAN}${sid}${NC}"
        echo -e "    ${DIM}Task:${NC}    ${task}"
        echo -e "    ${DIM}Agents:${NC}  ${agents}"
        echo -e "    ${DIM}Status:${NC}  ${status}"
        echo ""
      done
    fi
    return
  fi

  while IFS= read -r swarm_id; do
    [ -z "$swarm_id" ] && continue

    echo -e "  ${BOLD}${MAGENTA}SWARM: ${swarm_id}${NC}"

    # Get coordinator PR
    local coord
    coord=$(echo "$prs" | jq -r ".[] | select(.headRefName | startswith(\"swarm/${swarm_id}/coordinator\")) | .title" | head -1)
    if [ -n "$coord" ]; then
      local task
      task=$(echo "$coord" | sed 's/\[.*\] COORDINATOR: //')
      echo -e "  ${DIM}Task:${NC} ${task}"
    fi

    echo ""

    # List agent PRs
    echo "$prs" | jq -c ".[] | select(.headRefName | startswith(\"swarm/${swarm_id}/agent/\"))" | while read -r pr; do
      local num title state branch adds dels files
      num=$(echo "$pr" | jq -r '.number')
      title=$(echo "$pr" | jq -r '.title')
      state=$(echo "$pr" | jq -r '.state')
      branch=$(echo "$pr" | jq -r '.headRefName')
      adds=$(echo "$pr" | jq -r '.additions // 0')
      dels=$(echo "$pr" | jq -r '.deletions // 0')
      files=$(echo "$pr" | jq -r '.changedFiles // 0')

      # Extract agent name from branch
      local agent
      agent=$(echo "$branch" | grep -oP 'agent/\K.*$')
      local color
      color=$(color_for "$agent")
      local state_icon
      state_icon=$(icon_for "$state")

      echo -e "    ${state_icon} ${color}${agent^^}${NC}  #${num}  ${DIM}+${adds} -${dels} (${files} files)${NC}"
    done

    # Coordinator PR
    echo "$prs" | jq -c ".[] | select(.headRefName | startswith(\"swarm/${swarm_id}/coordinator\"))" | while read -r pr; do
      local num state
      num=$(echo "$pr" | jq -r '.number')
      state=$(echo "$pr" | jq -r '.state')
      local state_icon
      state_icon=$(icon_for "$state")
      echo -e "    ${state_icon} ${BOLD}COORDINATOR${NC}  #${num}"
    done

    echo -e "  ${DIM}${line}${NC}"
  done <<< "$swarm_ids"

  echo ""
  echo -e "  ${DIM}Commands: ./swarm.sh status | merge | close | launch${NC}"
}

render_json() {
  local prs
  prs=$(gh pr list --repo "$REPO" --label "swarm" --state all --limit 50 \
    --json number,title,state,headRefName,createdAt,labels,additions,deletions,changedFiles \
    2>/dev/null || echo "[]")

  # Group by swarm
  echo "$prs" | jq '
    group_by(.headRefName | split("/")[1]) |
    map({
      swarm_id: .[0].headRefName | split("/")[1],
      prs: map({
        number: .number,
        title: .title,
        state: .state,
        branch: .headRefName,
        type: (if (.headRefName | contains("coordinator")) then "coordinator"
               elif (.headRefName | contains("agent/")) then "agent"
               else "unknown" end),
        agent: (.headRefName | split("agent/")[1] // "coordinator"),
        changes: { additions: .additions, deletions: .deletions, files: .changedFiles }
      })
    })'
}

# ── Main ─────────────────────────────────────────────────────

if ! command -v gh &>/dev/null; then
  echo -e "${RED}GitHub CLI (gh) required${NC}"
  exit 1
fi

case "${1:-}" in
  --json)
    render_json
    ;;
  --live)
    while true; do
      clear
      render_dashboard
      echo -e "\n  ${DIM}Refreshing in 30s... (Ctrl+C to stop)${NC}"
      sleep 30
    done
    ;;
  *)
    render_dashboard
    ;;
esac
