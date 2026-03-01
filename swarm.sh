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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SWARM_DIR="${SCRIPT_DIR}/.swarm"
REPO="${SWARM_REPO:-BlackRoad-OS-Inc/blackroad-operator}"
DEFAULT_AGENTS="lucidia,octavia,alice,cipher"

# ── Helpers ──────────────────────────────────────────────────

log()    { echo -e "${GREEN}*${NC} $1"; }
error()  { echo -e "${RED}x${NC} $1" >&2; }
warn()   { echo -e "${YELLOW}!${NC} $1"; }
info()   { echo -e "${CYAN}i${NC} $1"; }
header() { echo -e "\n${BOLD}${MAGENTA}$1${NC}\n"; }

# Check if gh is available AND authenticated
has_gh() {
  command -v gh &>/dev/null && gh auth status &>/dev/null 2>&1
}

# Require gh or fail with helpful message
require_gh() {
  if ! command -v gh &>/dev/null; then
    error "This command requires GitHub CLI (gh). Install: https://cli.github.com"
    exit 1
  fi
  if ! gh auth status &>/dev/null 2>&1; then
    error "This command requires GitHub auth. Run: gh auth login"
    info "Local commands (launch, status, list) work without auth."
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

agent_role() {
  case "$1" in
    lucidia)  echo "Philosopher" ;;
    octavia)  echo "Architect" ;;
    alice)    echo "Operator" ;;
    cipher)   echo "Guardian" ;;
    aria)     echo "Dreamer" ;;
    prism)    echo "Analyst" ;;
    echo)     echo "Memory" ;;
    cecilia)  echo "CECE" ;;
    *)        echo "Agent" ;;
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

  # Try remote workflow first, fall back to local
  if has_gh && gh workflow list --repo "$REPO" 2>/dev/null | grep -q "Agent PR Swarm"; then
    log "Triggering workflow via GitHub Actions..."
    gh workflow run "Agent PR Swarm" \
      --repo "$REPO" \
      -f task="$task" \
      -f agents="$agents" \
      -f strategy="$strategy"
    log "Swarm workflow dispatched!"
    info "Monitor with: ./swarm.sh status"
  else
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
  mkdir -p "${SWARM_DIR}/${swarm_id}"

  # Build agents JSON array (handle jq absence)
  local agents_json="["
  local first=true
  IFS=',' read -ra AGENT_LIST <<< "$agents"
  for agent in "${AGENT_LIST[@]}"; do
    agent=$(echo "$agent" | tr -d ' ')
    if [ "$first" = true ]; then
      agents_json="${agents_json}\"${agent}\""
      first=false
    else
      agents_json="${agents_json},\"${agent}\""
    fi
  done
  agents_json="${agents_json}]"

  cat > "${SWARM_DIR}/${swarm_id}/manifest.json" << EOF
{
  "swarm_id": "${swarm_id}",
  "task": "${task}",
  "strategy": "${strategy}",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "base_branch": "${base_branch}",
  "agents": ${agents_json},
  "status": "active"
}
EOF
  log "Swarm manifest created"

  # Spawn agent branches
  for agent in "${AGENT_LIST[@]}"; do
    agent=$(echo "$agent" | tr -d ' ')
    local color
    color=$(agent_color "$agent")
    local role
    role=$(agent_role "$agent")
    local branch="swarm/${swarm_id}/agent/${agent}"

    echo -e "  ${color}[${agent^^}]${NC} ${role} -> ${DIM}${branch}${NC}"

    # Create branch from current HEAD
    git branch "$branch" HEAD 2>/dev/null || warn "  Branch ${branch} already exists"

    # Create agent workspace marker
    cat > "${SWARM_DIR}/${swarm_id}/${agent}.json" << AGENT_EOF
{
  "agent": "${agent}",
  "swarm_id": "${swarm_id}",
  "task": "${task}",
  "branch": "${branch}",
  "role": "${role}",
  "status": "ready",
  "spawned_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
AGENT_EOF
  done

  # Broadcast to coordination mesh
  if [ -x "${SCRIPT_DIR}/coordination/swarm-broadcast.sh" ]; then
    bash "${SCRIPT_DIR}/coordination/swarm-broadcast.sh" launch "$swarm_id" "$task" "$agents" 2>/dev/null || true
  fi

  echo ""
  log "Created ${#AGENT_LIST[@]} agent branches"
  echo ""

  # Show swarm summary
  echo -e "${BOLD}  Swarm ID:${NC}  ${swarm_id}"
  echo -e "${BOLD}  Task:${NC}     ${task}"
  echo -e "${BOLD}  Strategy:${NC} ${strategy}"
  echo -e "${BOLD}  Branches:${NC} ${#AGENT_LIST[@]}"
  echo ""

  # Show next steps
  echo -e "${BOLD}Next steps:${NC}"
  echo -e "  1. Agents checkout their branches and push work:"
  for agent in "${AGENT_LIST[@]}"; do
    agent=$(echo "$agent" | tr -d ' ')
    echo -e "     ${DIM}git checkout swarm/${swarm_id}/agent/${agent}${NC}"
  done
  echo -e "  2. When ready, create PRs:"
  echo -e "     ${DIM}./swarm.sh open-prs ${swarm_id}${NC}"
  echo -e "  3. Monitor progress:"
  echo -e "     ${DIM}./swarm.sh status ${swarm_id}${NC}"
}

cmd_open_prs() {
  local swarm_id="${1:?Usage: swarm.sh open-prs <swarm-id>}"
  local manifest="${SWARM_DIR}/${swarm_id}/manifest.json"

  require_gh

  if [ ! -f "$manifest" ]; then
    error "Swarm not found: ${swarm_id}"
    exit 1
  fi

  header "OPENING AGENT PRs: ${swarm_id}"

  local task strategy base
  task=$(jq -r '.task' "$manifest")
  strategy=$(jq -r '.strategy' "$manifest")
  base=$(jq -r '.base_branch // "main"' "$manifest")

  local pr_numbers=()

  jq -r '.agents[]' "$manifest" | while IFS= read -r agent; do
    local branch="swarm/${swarm_id}/agent/${agent}"
    local color
    color=$(agent_color "$agent")
    local role
    role=$(agent_role "$agent")

    echo -e "  ${color}Creating PR for ${agent^^} (${role})...${NC}"

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
      --body "## Agent: ${agent^^} (${role})
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
      echo -e "    ${GREEN}${pr_url}${NC}"
    else
      warn "  Could not create PR for ${agent} (branch may already have a PR)"
    fi
  done

  echo ""
  log "PRs created for swarm ${swarm_id}"
}

cmd_status() {
  local swarm_id="${1:-}"

  header "SWARM STATUS"

  # Always show local swarms first
  local found_local=false
  if [ -d "$SWARM_DIR" ]; then
    if [ -n "$swarm_id" ]; then
      # Show specific swarm
      if [ -f "${SWARM_DIR}/${swarm_id}/manifest.json" ]; then
        found_local=true
        local manifest="${SWARM_DIR}/${swarm_id}/manifest.json"
        local task strategy status agent_count
        task=$(jq -r '.task' "$manifest" 2>/dev/null || echo "unknown")
        strategy=$(jq -r '.strategy' "$manifest" 2>/dev/null || echo "unknown")
        status=$(jq -r '.status // "active"' "$manifest" 2>/dev/null || echo "unknown")
        agent_count=$(jq -r '.agents | length' "$manifest" 2>/dev/null || echo "?")

        echo -e "${BOLD}  Swarm:${NC}    ${swarm_id}"
        echo -e "${BOLD}  Task:${NC}     ${task}"
        echo -e "${BOLD}  Strategy:${NC} ${strategy}"
        echo -e "${BOLD}  Status:${NC}   ${status}"
        echo -e "${BOLD}  Agents:${NC}   ${agent_count}"
        echo ""

        # Show each agent's status
        echo -e "${BOLD}  Agent Branches:${NC}"
        for agent_file in "${SWARM_DIR}/${swarm_id}"/*.json; do
          [ -f "$agent_file" ] || continue
          local basename
          basename=$(basename "$agent_file" .json)
          [ "$basename" = "manifest" ] && continue

          local agent_status branch
          agent_status=$(jq -r '.status // "unknown"' "$agent_file" 2>/dev/null || echo "?")
          branch=$(jq -r '.branch // "?"' "$agent_file" 2>/dev/null || echo "?")
          local color
          color=$(agent_color "$basename")

          # Check if branch has commits ahead
          local ahead=""
          local branch_commits
          branch_commits=$(git log --oneline "HEAD..${branch}" 2>/dev/null | wc -l | tr -d ' ')
          if [ "$branch_commits" -gt 0 ] 2>/dev/null; then
            ahead=" (+${branch_commits} commits)"
          fi

          echo -e "    ${color}[${basename^^}]${NC} ${agent_status}${ahead}"
          echo -e "      ${DIM}${branch}${NC}"
        done
      fi
    else
      # Show all local swarms
      for manifest in "${SWARM_DIR}"/*/manifest.json; do
        [ -f "$manifest" ] || continue
        found_local=true
        local sid task status agents strategy
        sid=$(jq -r '.swarm_id' "$manifest" 2>/dev/null)
        task=$(jq -r '.task' "$manifest" 2>/dev/null)
        status=$(jq -r '.status // "active"' "$manifest" 2>/dev/null)
        agents=$(jq -r '.agents | join(", ")' "$manifest" 2>/dev/null)
        strategy=$(jq -r '.strategy' "$manifest" 2>/dev/null)

        echo -e "  ${CYAN}${sid}${NC}  [${status}]  ${strategy}"
        echo -e "    ${BOLD}Task:${NC}   ${task}"
        echo -e "    ${BOLD}Agents:${NC} ${agents}"
        echo ""
      done
    fi
  fi

  if [ "$found_local" = false ]; then
    echo -e "  ${DIM}No local swarms found.${NC}"
    echo -e "  ${DIM}Launch one: ./swarm.sh launch \"your task\" lucidia,octavia,cipher${NC}"
  fi

  # Show GitHub PRs if gh is available
  if has_gh; then
    echo ""
    echo -e "${BOLD}GitHub PRs:${NC}"
    local pr_output
    pr_output=$(gh pr list --repo "$REPO" --label "swarm" \
      --json number,title,state,headRefName \
      --template '{{range .}}  {{.state}} #{{.number}} {{.title}}
{{end}}' 2>/dev/null || echo "")
    if [ -n "$pr_output" ]; then
      echo "$pr_output"
    else
      echo -e "  ${DIM}(none)${NC}"
    fi
  fi
}

cmd_list() {
  header "ALL SWARMS"

  # Local swarms
  echo -e "${BOLD}Local Swarms:${NC}"
  local count=0
  if [ -d "$SWARM_DIR" ]; then
    for manifest in "${SWARM_DIR}"/*/manifest.json; do
      [ -f "$manifest" ] || continue
      count=$((count + 1))
      local sid task status agents
      sid=$(jq -r '.swarm_id' "$manifest" 2>/dev/null)
      task=$(jq -r '.task' "$manifest" 2>/dev/null)
      status=$(jq -r '.status // "unknown"' "$manifest" 2>/dev/null)
      agents=$(jq -r '.agents | length' "$manifest" 2>/dev/null)
      echo -e "  [${status}]  ${CYAN}${sid}${NC}  ${task} (${agents} agents)"
    done
  fi
  if [ "$count" -eq 0 ]; then
    echo -e "  ${DIM}(none)${NC}"
  fi

  # Git branches
  echo ""
  echo -e "${BOLD}Swarm Branches:${NC}"
  local branches
  branches=$(git branch --list 'swarm/*' 2>/dev/null || echo "")
  if [ -n "$branches" ]; then
    echo "$branches" | while IFS= read -r branch; do
      branch=$(echo "$branch" | tr -d ' *')
      echo -e "  ${DIM}${branch}${NC}"
    done
  else
    echo -e "  ${DIM}(none)${NC}"
  fi

  # GitHub PRs if available
  if has_gh; then
    echo ""
    echo -e "${BOLD}GitHub PRs:${NC}"
    gh pr list --repo "$REPO" --label "swarm" \
      --json number,title,state \
      --template '{{range .}}  {{.state}} #{{.number}} {{.title}}
{{end}}' 2>/dev/null || echo "  (none)"
  fi
}

cmd_merge() {
  local swarm_id="${1:?Usage: swarm.sh merge <swarm-id>}"
  require_gh

  header "MERGING SWARM: ${swarm_id}"

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
      log "  #${pr_num} auto-merge enabled (will merge after required checks pass)" || \
      warn "  #${pr_num} could not be merged (check status)"
  done

  # Update local manifest
  if [ -f "${SWARM_DIR}/${swarm_id}/manifest.json" ]; then
    jq '.status = "merged"' "${SWARM_DIR}/${swarm_id}/manifest.json" > "${SWARM_DIR}/${swarm_id}/manifest.tmp" && \
      mv "${SWARM_DIR}/${swarm_id}/manifest.tmp" "${SWARM_DIR}/${swarm_id}/manifest.json"
  fi

  # Broadcast completion
  if [ -x "${SCRIPT_DIR}/coordination/swarm-broadcast.sh" ]; then
    bash "${SCRIPT_DIR}/coordination/swarm-broadcast.sh" complete "$swarm_id" 2>/dev/null || true
  fi

  log "Swarm ${swarm_id} merge initiated"
}

cmd_close() {
  local swarm_id="${1:?Usage: swarm.sh close <swarm-id>}"

  header "CLOSING SWARM: ${swarm_id}"

  # Close GitHub PRs if gh available
  if has_gh; then
    gh pr list --repo "$REPO" --label "swarm" --state open \
      --json number,headRefName \
      --jq ".[] | select(.headRefName | startswith(\"swarm/${swarm_id}/\")) | .number" 2>/dev/null | \
    while read -r pr_num; do
      gh pr close "$pr_num" --repo "$REPO" --comment "Swarm ${swarm_id} closed." 2>/dev/null
      log "Closed PR #${pr_num}"
    done
  fi

  # Clean up local branches
  git branch --list "swarm/${swarm_id}/*" 2>/dev/null | while IFS= read -r branch; do
    branch=$(echo "$branch" | tr -d ' *')
    git branch -D "$branch" 2>/dev/null && log "Deleted branch: ${branch}" || true
  done

  # Update local manifest
  if [ -f "${SWARM_DIR}/${swarm_id}/manifest.json" ]; then
    jq '.status = "closed"' "${SWARM_DIR}/${swarm_id}/manifest.json" > "${SWARM_DIR}/${swarm_id}/manifest.tmp" && \
      mv "${SWARM_DIR}/${swarm_id}/manifest.tmp" "${SWARM_DIR}/${swarm_id}/manifest.json"
    log "Local manifest updated"
  fi

  log "Swarm ${swarm_id} closed"
}

cmd_comment() {
  local pr="${1:?Usage: swarm.sh comment <pr-number> \"message\"}"
  local message="${2:?Message required}"
  require_gh

  gh pr comment "$pr" --repo "$REPO" --body "$message"
  log "Comment posted to #${pr}"
}

cmd_review() {
  local swarm_id="${1:?Usage: swarm.sh review <swarm-id>}"

  header "SWARM REVIEW: ${swarm_id}"

  # Local review: show diff for each agent branch
  local manifest="${SWARM_DIR}/${swarm_id}/manifest.json"
  if [ -f "$manifest" ]; then
    local base
    base=$(jq -r '.base_branch // "main"' "$manifest" 2>/dev/null || echo "main")

    jq -r '.agents[]' "$manifest" 2>/dev/null | while IFS= read -r agent; do
      local branch="swarm/${swarm_id}/agent/${agent}"
      local color
      color=$(agent_color "$agent")

      echo -e "  ${color}[${agent^^}]${NC} ${branch}"

      # Show diff stat if branch exists
      local stat
      stat=$(git diff --stat "${base}...${branch}" 2>/dev/null || echo "  (no changes yet)")
      echo "$stat" | head -10 | sed 's/^/    /'
      echo ""
    done
  fi

  # Also show GitHub PR info if available
  if has_gh; then
    echo -e "${BOLD}GitHub PR Details:${NC}"
    gh pr list --repo "$REPO" --label "swarm" --state open \
      --json number,title,headRefName,additions,deletions,changedFiles \
      --jq ".[] | select(.headRefName | startswith(\"swarm/${swarm_id}/agent/\"))" \
      --template '{{range .}}  #{{.number}} {{.title}}
    +{{.additions}} -{{.deletions}} ({{.changedFiles}} files)
{{end}}' 2>/dev/null || echo "  (no GitHub PRs)"
  fi
}

cmd_checkout() {
  local swarm_id="${1:?Usage: swarm.sh checkout <swarm-id> <agent>}"
  local agent="${2:?Agent name required}"
  local branch="swarm/${swarm_id}/agent/${agent}"

  if git rev-parse --verify "$branch" &>/dev/null; then
    git checkout "$branch"
    log "Switched to ${agent}'s branch: ${branch}"
  else
    error "Branch not found: ${branch}"
    info "Available branches:"
    git branch --list "swarm/${swarm_id}/*" 2>/dev/null | sed 's/^/  /'
  fi
}

# ── Help ─────────────────────────────────────────────────────

show_help() {
  header "SWARM - Parallel Agent PR System"

  echo -e "${BOLD}Usage:${NC}"
  echo "  ./swarm.sh <command> [args]"
  echo ""
  echo -e "${BOLD}Local Commands (no GitHub auth needed):${NC}"
  echo -e "  ${CYAN}launch${NC} <task> [agents] [strategy]  Launch a new swarm"
  echo -e "  ${CYAN}status${NC} [swarm-id]                  Show swarm status"
  echo -e "  ${CYAN}list${NC}                               List all swarms"
  echo -e "  ${CYAN}review${NC} <swarm-id>                  Review agent changes"
  echo -e "  ${CYAN}checkout${NC} <swarm-id> <agent>        Switch to agent branch"
  echo -e "  ${CYAN}close${NC} <swarm-id>                   Close swarm + delete branches"
  echo ""
  echo -e "${BOLD}GitHub Commands (requires gh auth):${NC}"
  echo -e "  ${CYAN}open-prs${NC} <swarm-id>                Create PRs for all agents"
  echo -e "  ${CYAN}merge${NC} <swarm-id>                   Merge all agent PRs"
  echo -e "  ${CYAN}comment${NC} <pr> <message>             Post comment to agent PR"
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
  echo "  ./swarm.sh checkout swarm-1234567890 lucidia"
  echo "  ./swarm.sh merge swarm-1234567890"
  echo ""
  echo -e "${BOLD}Agents:${NC}"
  echo -e "  lucidia   - Philosopher (reasoning, architecture)"
  echo -e "  octavia   - Architect (systems, infrastructure)"
  echo -e "  alice     - Operator (execution, automation)"
  echo -e "  cipher    - Guardian (security, access control)"
  echo -e "  aria      - Dreamer (creative, UX, vision)"
  echo -e "  prism     - Analyst (data, patterns)"
  echo -e "  echo      - Memory (context, knowledge)"
  echo -e "  cecilia   - CECE (meta-cognition, coordination)"
}

# ── Router ───────────────────────────────────────────────────

case "${1:-help}" in
  launch)    cmd_launch "${@:2}" ;;
  open-prs)  cmd_open_prs "${@:2}" ;;
  status)    cmd_status "${@:2}" ;;
  list)      cmd_list ;;
  merge)     cmd_merge "${@:2}" ;;
  close)     cmd_close "${@:2}" ;;
  comment)   cmd_comment "${@:2}" ;;
  review)    cmd_review "${@:2}" ;;
  checkout)  cmd_checkout "${@:2}" ;;
  help|*)    show_help ;;
esac
