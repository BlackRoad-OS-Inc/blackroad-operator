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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SWARM_DIR="${SCRIPT_DIR}/.swarm"
REPO="${SWARM_REPO:-BlackRoad-OS-Inc/blackroad-operator}"

has_gh() {
  command -v gh &>/dev/null && gh auth status &>/dev/null 2>&1
}

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

render_dashboard() {
  local cols
  cols=$(tput cols 2>/dev/null || echo 80)
  local line
  line=$(printf '%0.s-' $(seq 1 "$cols"))

  echo -e "${BOLD}${MAGENTA}"
  echo "   ___ _      ___   ___ __  __"
  echo "  / __| | /| / / | / / '  \\"
  echo "  \\__ \\ |/ |/ /| |/ /| | | |"
  echo "  |___/__/|__/ |___/ |_|_|_|"
  echo -e "${NC}"
  echo -e "${BOLD}  SWARM MONITOR${NC}              $(date '+%Y-%m-%d %H:%M:%S')"
  echo -e "${DIM}${line}${NC}"

  # ── Local Swarms ──
  local swarm_count=0
  local total_agents=0

  if [ -d "$SWARM_DIR" ]; then
    for manifest in "${SWARM_DIR}"/*/manifest.json; do
      [ -f "$manifest" ] || continue
      swarm_count=$((swarm_count + 1))

      local sid task strategy status agents created
      sid=$(jq -r '.swarm_id' "$manifest" 2>/dev/null)
      task=$(jq -r '.task' "$manifest" 2>/dev/null)
      strategy=$(jq -r '.strategy' "$manifest" 2>/dev/null)
      status=$(jq -r '.status // "active"' "$manifest" 2>/dev/null)
      created=$(jq -r '.created_at // "?"' "$manifest" 2>/dev/null)

      # Status color
      local status_color="${GREEN}"
      case "$status" in
        active)  status_color="${GREEN}" ;;
        merged)  status_color="${MAGENTA}" ;;
        closed)  status_color="${RED}" ;;
        *)       status_color="${YELLOW}" ;;
      esac

      echo ""
      echo -e "  ${BOLD}${MAGENTA}SWARM: ${sid}${NC}"
      echo -e "  ${DIM}Task:${NC}     ${task}"
      echo -e "  ${DIM}Strategy:${NC} ${strategy}"
      echo -e "  ${DIM}Status:${NC}   ${status_color}${status}${NC}"
      echo -e "  ${DIM}Created:${NC}  ${created}"
      echo ""

      # Show agents
      for agent_file in "${SWARM_DIR}/${sid}"/*.json; do
        [ -f "$agent_file" ] || continue
        local basename
        basename=$(basename "$agent_file" .json)
        [ "$basename" = "manifest" ] && continue

        total_agents=$((total_agents + 1))
        local agent_status branch role
        agent_status=$(jq -r '.status // "?"' "$agent_file" 2>/dev/null)
        branch=$(jq -r '.branch // "?"' "$agent_file" 2>/dev/null)
        role=$(jq -r '.role // "Agent"' "$agent_file" 2>/dev/null)
        local color
        color=$(color_for "$basename")

        # Check branch for work
        local indicator="${YELLOW}~${NC}"  # pending
        if git rev-parse --verify "$branch" &>/dev/null 2>&1; then
          local base
          base=$(jq -r '.base_branch // "HEAD"' "$manifest" 2>/dev/null)
          local ahead
          ahead=$(git log --oneline "${base}..${branch}" 2>/dev/null | wc -l | tr -d ' ')
          if [ "$ahead" -gt 0 ] 2>/dev/null; then
            indicator="${GREEN}* +${ahead}${NC}"
          else
            indicator="${DIM}- ready${NC}"
          fi
        else
          indicator="${RED}x no branch${NC}"
        fi

        echo -e "    ${color}[${basename^^}]${NC} ${role}  ${indicator}"
        echo -e "      ${DIM}${branch}${NC}"
      done

      echo -e "  ${DIM}${line}${NC}"
    done
  fi

  # Summary
  echo ""
  if [ "$swarm_count" -eq 0 ]; then
    echo -e "  ${DIM}No active swarms.${NC}"
    echo ""
    echo -e "  ${BOLD}Launch one:${NC}"
    echo -e "  ${CYAN}./swarm.sh launch \"your task\" lucidia,octavia,cipher${NC}"
  else
    echo -e "  ${BOLD}Summary:${NC} ${swarm_count} swarm(s) | ${total_agents} agent(s)"
  fi

  # Show swarm branches
  local swarm_branches
  swarm_branches=$(git branch --list 'swarm/*' 2>/dev/null | wc -l | tr -d ' ')
  if [ "$swarm_branches" -gt 0 ] 2>/dev/null; then
    echo -e "  ${BOLD}Branches:${NC} ${swarm_branches} swarm branch(es)"
  fi

  # Show GitHub PR count if available
  if has_gh; then
    local pr_count
    pr_count=$(gh pr list --repo "$REPO" --label "swarm" --json number --jq length 2>/dev/null || echo "0")
    if [ "$pr_count" -gt 0 ] 2>/dev/null; then
      echo -e "  ${BOLD}GitHub:${NC}   ${pr_count} swarm PR(s) open"
    fi
  fi

  echo ""
  echo -e "  ${DIM}Commands: ./swarm.sh status | launch | merge | close${NC}"
}

render_json() {
  local result='{"swarms":['
  local first=true

  if [ -d "$SWARM_DIR" ]; then
    for manifest in "${SWARM_DIR}"/*/manifest.json; do
      [ -f "$manifest" ] || continue

      if [ "$first" = true ]; then
        first=false
      else
        result="${result},"
      fi

      local sid
      sid=$(jq -r '.swarm_id' "$manifest" 2>/dev/null)

      # Build agents array
      local agents_arr='['
      local agent_first=true
      for agent_file in "${SWARM_DIR}/${sid}"/*.json; do
        [ -f "$agent_file" ] || continue
        local bn
        bn=$(basename "$agent_file" .json)
        [ "$bn" = "manifest" ] && continue

        if [ "$agent_first" = true ]; then
          agent_first=false
        else
          agents_arr="${agents_arr},"
        fi
        agents_arr="${agents_arr}$(cat "$agent_file")"
      done
      agents_arr="${agents_arr}]"

      local swarm_json
      swarm_json=$(jq --argjson agents "$agents_arr" '. + {"agent_details": $agents}' "$manifest" 2>/dev/null || cat "$manifest")
      result="${result}${swarm_json}"
    done
  fi

  result="${result}]}"
  echo "$result" | jq '.' 2>/dev/null || echo "$result"
}

# ── Main ─────────────────────────────────────────────────────

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
