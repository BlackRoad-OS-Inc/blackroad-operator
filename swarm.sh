#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# swarm.sh — Parallel Agent PR Swarm Dispatcher
# Launch, monitor, and manage agent swarms via GitHub PRs
#
# Usage:
#   ./swarm.sh launch "Build auth module" lucidia,octavia,cipher
#   ./swarm.sh status [swarm-id]
#   ./swarm.sh list
#   ./swarm.sh merge <swarm-id>
#   ./swarm.sh close <swarm-id>
#   ./swarm.sh comment <pr-number> "message"
#   ./swarm.sh review <swarm-id>
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

REPO="${SWARM_REPO:-BlackRoad-OS-Inc/blackroad-operator}"
DEFAULT_AGENTS="lucidia,octavia,alice,cipher"

# ── Helpers ──────────────────────────────────────────────────

log()   { echo -e "${GREEN}✓${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1" >&2; }
warn()  { echo -e "${YELLOW}!${NC} $1"; }
info()  { echo -e "${CYAN}i${NC} $1"; }
header() { echo -e "\n${BOLD}${MAGENTA}$1${NC}\n"; }

check_gh() {
  if ! command -v gh &>/dev/null; then
    error "GitHub CLI (gh) is required. Install: https://cli.github.com"
    exit 1
  fi
  if ! gh auth status &>/dev/null 2>&1; then
    error "Not authenticated. Run: gh auth login"
    exit 1
  fi
}

# Agent color mapping
agent_color() {
  case "$1" in
    lucidia)  echo "${MAGENTA}" ;;
    octavia)  echo "${GREEN}" ;;
    alice)    echo "${CYAN}" ;;
    cipher)   echo "${RED}" ;;
    aria)     echo "\033[0;34m" ;;
    prism)    echo "${YELLOW}" ;;
    echo)     echo "${MAGENTA}" ;;
    cecilia)  echo "${YELLOW}" ;;
    *)        echo "${NC}" ;;
  esac
}

agent_icon() {
  case "$1" in
    lucidia)  echo "~" ;;
    octavia)  echo ">" ;;
    alice)    echo "@" ;;
    cipher)   echo "#" ;;
    aria)     echo "*" ;;
    prism)    echo "%" ;;
    echo)     echo "&" ;;
    cecilia)  echo "+" ;;
    *)        echo "-" ;;
  esac
}

# ── Commands ─────────────────────────────────────────────────

cmd_launch() {
  local task="${1:?Usage: swarm.sh launch \"task description\" [agents] [strategy]}"
  local agents="${2:-$DEFAULT_AGENTS}"
  local strategy="${3:-parallel}"

  header "LAUNCHING AGENT PR SWARM"
  info "Task: ${task}"
  info "Agents: ${agents}"
  info "Strategy: ${strategy}"
  echo ""

  # Check if we can trigger the workflow
  if gh workflow list --repo "$REPO" 2>/dev/null | grep -q "Agent PR Swarm"; then
    log "Triggering workflow via GitHub Actions..."
    gh workflow run "Agent PR Swarm" \
      --repo "$REPO" \
      -f task="$task" \
      -f agents="$agents" \
      -f strategy="$strategy"
    log "Swarm workflow dispatched!"
    info "Monitor with: ./swarm.sh status"
  else
    # Local mode — create branches and PRs directly
    warn "Workflow not available remotely, launching locally..."
    cmd_launch_local "$task" "$agents" "$strategy"
  fi
}

cmd_launch_local() {
  local task="$1"
  local agents="$2"
  local strategy="$3"
  local swarm_id="swarm-$(date +%s)"
  local base_branch
  base_branch=$(git symbolic-ref --short HEAD 2>/dev/null || echo "main")

  header "LOCAL SWARM: ${swarm_id}"

  # Create swarm directory
  mkdir -p ".swarm/${swarm_id}"
  cat > ".swarm/${swarm_id}/manifest.json" << EOF
{
  "swarm_id": "${swarm_id}",
  "task": "${task}",
  "strategy": "${strategy}",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "base_branch": "${base_branch}",
  "agents": $(echo "$agents" | tr ',' '\n' | jq -R . | jq -s .),
  "status": "active"
}
EOF
  log "Swarm manifest created"

  # Spawn agent branches
  IFS=',' read -ra AGENT_LIST <<< "$agents"
  for agent in "${AGENT_LIST[@]}"; do
    agent=$(echo "$agent" | tr -d ' ')
    local color
    color=$(agent_color "$agent")
    local icon
    icon=$(agent_icon "$agent")
    local branch="swarm/${swarm_id}/agent/${agent}"

    echo -e "  ${color}${icon} ${agent^^}${NC} -> ${DIM}${branch}${NC}"

    # Create branch from current HEAD
    git branch "$branch" HEAD 2>/dev/null || true

    # Create agent workspace marker
    cat > ".swarm/${swarm_id}/${agent}.json" << AGENT_EOF
{
  "agent": "${agent}",
  "swarm_id": "${swarm_id}",
  "task": "${task}",
  "branch": "${branch}",
  "status": "ready",
  "spawned_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
AGENT_EOF
  done

  log "Created ${#AGENT_LIST[@]} agent branches"
  echo ""
  info "Swarm ID: ${swarm_id}"
  info "Next: Agents push work to their branches, then create PRs"
  echo ""
  echo -e "${DIM}  To create PRs for all agents:${NC}"
  echo -e "${DIM}  ./swarm.sh open-prs ${swarm_id}${NC}"
}

cmd_open_prs() {
  local swarm_id="${1:?Usage: swarm.sh open-prs <swarm-id>}"
  local manifest=".swarm/${swarm_id}/manifest.json"

  if [ ! -f "$manifest" ]; then
    error "Swarm not found: ${swarm_id}"
    exit 1
  fi

  header "OPENING AGENT PRs: ${swarm_id}"

  local task
  task=$(jq -r '.task' "$manifest")
  local strategy
  strategy=$(jq -r '.strategy' "$manifest")
  local agents
  agents=$(jq -r '.agents[]' "$manifest")
  local base
  base=$(jq -r '.base_branch // "main"' "$manifest")

  local pr_numbers=()

  while IFS= read -r agent; do
    local branch="swarm/${swarm_id}/agent/${agent}"
    local color
    color=$(agent_color "$agent")

    echo -e "  ${color}Creating PR for ${agent^^}...${NC}"

    # Push branch
    git push -u origin "$branch" 2>/dev/null || true

    # Create PR
    local pr_url
    pr_url=$(gh pr create \
      --repo "$REPO" \
      --base "$base" \
      --head "$branch" \
      --title "[${swarm_id}] ${agent^^}: ${task}" \
      --label "swarm,agent:${agent}" \
      --body "## Agent: ${agent^^}
**Swarm:** \`${swarm_id}\` | **Strategy:** \`${strategy}\`

### Task
${task}

### Checklist
- [ ] Implement changes
- [ ] Self-review
- [ ] Ready for merge

---
_Part of swarm \`${swarm_id}\`_" 2>/dev/null || echo "")

    if [ -n "$pr_url" ]; then
      local pr_num
      pr_num=$(echo "$pr_url" | grep -oP '\d+$' || echo "?")
      pr_numbers+=("$pr_num")
      echo -e "    ${GREEN}#${pr_num}${NC} ${pr_url}"
    else
      warn "  Could not create PR for ${agent} (branch may already have a PR)"
    fi
  done <<< "$agents"

  echo ""
  log "Created ${#pr_numbers[@]} PRs"

  # Create coordinator PR if multiple agents
  if [ ${#pr_numbers[@]} -gt 1 ]; then
    local coord_branch="swarm/${swarm_id}/coordinator"
    git branch "$coord_branch" HEAD 2>/dev/null || true
    git push -u origin "$coord_branch" 2>/dev/null || true

    local pr_list=""
    for num in "${pr_numbers[@]}"; do
      pr_list="${pr_list}- #${num}
"
    done

    gh pr create \
      --repo "$REPO" \
      --base "$base" \
      --head "$coord_branch" \
      --title "[${swarm_id}] COORDINATOR: ${task}" \
      --label "swarm,swarm-coordinator" \
      --body "## Swarm Coordinator
**Swarm:** \`${swarm_id}\` | **Strategy:** \`${strategy}\`

### Agent PRs
${pr_list}
### Status
- [ ] All agent PRs complete
- [ ] All checks passing
- [ ] Ready for merge" 2>/dev/null || warn "Could not create coordinator PR"

    log "Coordinator PR created"
  fi
}

cmd_status() {
  local swarm_id="${1:-}"

  header "SWARM STATUS"

  if [ -n "$swarm_id" ]; then
    # Show specific swarm
    local prs
    prs=$(gh pr list --repo "$REPO" --label "swarm" --json number,title,state,headRefName,mergeable,statusCheckRollup \
      --jq ".[] | select(.headRefName | startswith(\"swarm/${swarm_id}/\"))" 2>/dev/null || echo "")

    if [ -z "$prs" ]; then
      # Check local swarm
      if [ -f ".swarm/${swarm_id}/manifest.json" ]; then
        info "Local swarm (no PRs yet)"
        jq '.' ".swarm/${swarm_id}/manifest.json"
        echo ""
        info "Create PRs with: ./swarm.sh open-prs ${swarm_id}"
      else
        error "No swarm found: ${swarm_id}"
      fi
      return
    fi

    gh pr list --repo "$REPO" --label "swarm" --json number,title,state,headRefName \
      --jq ".[] | select(.headRefName | startswith(\"swarm/${swarm_id}/\"))" \
      --template '{{range .}}#{{.number}} {{.state}} {{.title}}
{{end}}' 2>/dev/null
  else
    # Show all active swarms
    echo -e "${BOLD}Active Swarm PRs:${NC}"
    echo ""
    gh pr list --repo "$REPO" --label "swarm" \
      --json number,title,state,headRefName,createdAt \
      --template '{{range .}}  {{.state}} #{{.number}} {{.title}}
    {{.headRefName}} ({{timeago .createdAt}})
{{end}}' 2>/dev/null || warn "No active swarm PRs"

    # Show local swarms
    if [ -d ".swarm" ]; then
      echo ""
      echo -e "${BOLD}Local Swarms:${NC}"
      for manifest in .swarm/*/manifest.json; do
        if [ -f "$manifest" ]; then
          local sid
          sid=$(jq -r '.swarm_id' "$manifest")
          local task
          task=$(jq -r '.task' "$manifest")
          local agents
          agents=$(jq -r '.agents | join(", ")' "$manifest")
          echo -e "  ${CYAN}${sid}${NC} — ${task}"
          echo -e "  ${DIM}agents: ${agents}${NC}"
        fi
      done
    fi
  fi
}

cmd_list() {
  header "ALL SWARMS"

  # Remote PRs
  echo -e "${BOLD}GitHub PRs:${NC}"
  gh pr list --repo "$REPO" --label "swarm" \
    --json number,title,state,headRefName,createdAt,labels \
    --template '{{range .}}  {{if eq .state "OPEN"}}OPEN{{else}}{{.state}}{{end}}  #{{.number}}  {{.title}}
{{end}}' 2>/dev/null || echo "  (none)"

  # Local swarms
  echo ""
  echo -e "${BOLD}Local Swarms:${NC}"
  if [ -d ".swarm" ]; then
    for manifest in .swarm/*/manifest.json; do
      [ -f "$manifest" ] || continue
      local sid task status agents
      sid=$(jq -r '.swarm_id' "$manifest")
      task=$(jq -r '.task' "$manifest")
      status=$(jq -r '.status // "unknown"' "$manifest")
      agents=$(jq -r '.agents | length' "$manifest")
      echo -e "  ${status}  ${sid}  ${task} (${agents} agents)"
    done
  else
    echo "  (none)"
  fi
}

cmd_merge() {
  local swarm_id="${1:?Usage: swarm.sh merge <swarm-id>}"

  header "MERGING SWARM: ${swarm_id}"

  # Get all agent PRs for this swarm (not the coordinator)
  local prs
  prs=$(gh pr list --repo "$REPO" --label "swarm" --state open \
    --json number,headRefName \
    --jq "[.[] | select(.headRefName | startswith(\"swarm/${swarm_id}/agent/\")) | .number]" 2>/dev/null || echo "[]")

  local count
  count=$(echo "$prs" | jq length)

  if [ "$count" -eq 0 ]; then
    error "No open agent PRs found for swarm ${swarm_id}"
    return 1
  fi

  info "Found ${count} agent PRs to merge"

  echo "$prs" | jq -r '.[]' | while read -r pr_num; do
    echo -e "  Merging #${pr_num}..."
    gh pr merge "$pr_num" --repo "$REPO" --squash --auto 2>/dev/null && \
      log "  #${pr_num} merged" || \
      warn "  #${pr_num} could not be merged (check status)"
  done

  # Close coordinator PR
  local coord_pr
  coord_pr=$(gh pr list --repo "$REPO" --label "swarm-coordinator" --state open \
    --json number,headRefName \
    --jq ".[] | select(.headRefName | startswith(\"swarm/${swarm_id}/coordinator\")) | .number" 2>/dev/null || echo "")

  if [ -n "$coord_pr" ]; then
    gh pr close "$coord_pr" --repo "$REPO" --comment "Swarm ${swarm_id} merge complete. All agent PRs processed." 2>/dev/null
    log "Coordinator PR #${coord_pr} closed"
  fi

  log "Swarm ${swarm_id} merge initiated"
}

cmd_close() {
  local swarm_id="${1:?Usage: swarm.sh close <swarm-id>}"

  header "CLOSING SWARM: ${swarm_id}"

  gh pr list --repo "$REPO" --label "swarm" --state open \
    --json number,headRefName \
    --jq ".[] | select(.headRefName | startswith(\"swarm/${swarm_id}/\")) | .number" 2>/dev/null | \
  while read -r pr_num; do
    gh pr close "$pr_num" --repo "$REPO" --comment "Swarm ${swarm_id} closed." 2>/dev/null
    log "Closed #${pr_num}"
  done

  # Update local manifest
  if [ -f ".swarm/${swarm_id}/manifest.json" ]; then
    jq '.status = "closed"' ".swarm/${swarm_id}/manifest.json" > ".swarm/${swarm_id}/manifest.tmp" && \
      mv ".swarm/${swarm_id}/manifest.tmp" ".swarm/${swarm_id}/manifest.json"
    log "Local manifest updated"
  fi
}

cmd_comment() {
  local pr="${1:?Usage: swarm.sh comment <pr-number> \"message\"}"
  local message="${2:?Message required}"

  gh pr comment "$pr" --repo "$REPO" --body "$message"
  log "Comment posted to #${pr}"
}

cmd_review() {
  local swarm_id="${1:?Usage: swarm.sh review <swarm-id>}"

  header "SWARM REVIEW: ${swarm_id}"

  gh pr list --repo "$REPO" --label "swarm" --state open \
    --json number,title,headRefName,additions,deletions,changedFiles \
    --jq ".[] | select(.headRefName | startswith(\"swarm/${swarm_id}/agent/\"))" \
    --template '{{range .}}
PR #{{.number}}: {{.title}}
  Branch: {{.headRefName}}
  Changes: +{{.additions}} -{{.deletions}} ({{.changedFiles}} files)
{{end}}' 2>/dev/null || warn "No PRs found"
}

# ── Help ─────────────────────────────────────────────────────

show_help() {
  header "SWARM — Parallel Agent PR System"

  echo -e "${BOLD}Usage:${NC}"
  echo "  ./swarm.sh <command> [args]"
  echo ""
  echo -e "${BOLD}Commands:${NC}"
  echo -e "  ${CYAN}launch${NC} <task> [agents] [strategy]  Launch a new swarm"
  echo -e "  ${CYAN}open-prs${NC} <swarm-id>                Create PRs for local swarm"
  echo -e "  ${CYAN}status${NC} [swarm-id]                  Show swarm status"
  echo -e "  ${CYAN}list${NC}                               List all swarms"
  echo -e "  ${CYAN}merge${NC} <swarm-id>                   Merge all agent PRs"
  echo -e "  ${CYAN}close${NC} <swarm-id>                   Close all swarm PRs"
  echo -e "  ${CYAN}comment${NC} <pr> <message>             Post comment to agent PR"
  echo -e "  ${CYAN}review${NC} <swarm-id>                  Review all agent changes"
  echo ""
  echo -e "${BOLD}Strategies:${NC}"
  echo -e "  ${GREEN}parallel${NC}      All agents work simultaneously"
  echo -e "  ${GREEN}pipeline${NC}      Sequential agent handoff"
  echo -e "  ${GREEN}review-ring${NC}   Each agent reviews the next"
  echo -e "  ${GREEN}consensus${NC}     All agents must approve all PRs"
  echo ""
  echo -e "${BOLD}Examples:${NC}"
  echo "  ./swarm.sh launch \"Build auth module\" lucidia,octavia,cipher"
  echo "  ./swarm.sh launch \"Refactor API\" all consensus"
  echo "  ./swarm.sh status swarm-1234567890"
  echo "  ./swarm.sh merge swarm-1234567890"
  echo ""
  echo -e "${BOLD}Agents:${NC}"
  echo -e "  lucidia   — Philosopher (reasoning, architecture)"
  echo -e "  octavia   — Architect (systems, infrastructure)"
  echo -e "  alice     — Operator (execution, automation)"
  echo -e "  cipher    — Guardian (security, access control)"
  echo -e "  aria      — Dreamer (creative, UX, vision)"
  echo -e "  prism     — Analyst (data, patterns)"
  echo -e "  echo      — Memory (context, knowledge)"
  echo -e "  cecilia   — CECE (meta-cognition, coordination)"
}

# ── Router ───────────────────────────────────────────────────

check_gh

case "${1:-help}" in
  launch)    cmd_launch "${@:2}" ;;
  open-prs)  cmd_open_prs "${@:2}" ;;
  status)    cmd_status "${@:2}" ;;
  list)      cmd_list ;;
  merge)     cmd_merge "${@:2}" ;;
  close)     cmd_close "${@:2}" ;;
  comment)   cmd_comment "${@:2}" ;;
  review)    cmd_review "${@:2}" ;;
  help|*)    show_help ;;
esac
