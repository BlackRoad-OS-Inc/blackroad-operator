#!/usr/bin/env zsh
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
#
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================
# br-swarm.sh — Claude Code Swarm Orchestrator
#
# Launch parallel Claude Code agents on separate branches, each tackling
# a slice of a larger task. Coordinate via GitHub PRs/issues. The agents
# communicate in real time through PR comments and issue threads — like a
# group call but async and fully auditable.
#
# Usage:
#   br swarm launch "Add health check endpoints" --agents 4
#   br swarm status [swarm-id]
#   br swarm monitor [swarm-id]
#   br swarm list
#   br swarm cancel <swarm-id>
#   br swarm dry-run "Task description" --agents 3
# ============================================================================

set -euo pipefail

# Brand palette
AMBER='\033[38;5;214m'
PINK='\033[38;5;205m'
VIOLET='\033[38;5;135m'
BBLUE='\033[38;5;69m'
GREEN='\033[0;32m'
RED='\033[0;31m'
WHITE='\033[1;37m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'
CYAN="$AMBER"

# Directories
SWARM_DIR="${HOME}/.blackroad/swarm"
SWARM_REGISTRY="${SWARM_DIR}/registry"
SWARM_LOGS="${SWARM_DIR}/logs"
SWARM_PLANS="${SWARM_DIR}/plans"

# Defaults
DEFAULT_AGENTS=4
DEFAULT_ORG="BlackRoad-OS-Inc"
DEFAULT_REPO="blackroad-operator"
MAX_AGENTS=8

# ─── Init ────────────────────────────────────────────────────────────────────

init_swarm_dir() {
    mkdir -p "${SWARM_DIR}" "${SWARM_REGISTRY}" "${SWARM_LOGS}" "${SWARM_PLANS}"
}

# ─── JSON Flat-File Store ────────────────────────────────────────────────────
# Each swarm is a JSON file: ${SWARM_REGISTRY}/<swarm-id>.json

save_swarm() {
    local swarm_id="$1" task="$2" status="$3" agent_count="$4" repo="$5" base_branch="$6"
    local issue_url="${7:-}"
    local created_at
    created_at=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

    cat > "${SWARM_REGISTRY}/${swarm_id}.json" <<JSON_EOF
{
  "id": "${swarm_id}",
  "task": $(printf '%s' "$task" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' 2>/dev/null || echo "\"${task}\""),
  "status": "${status}",
  "agent_count": ${agent_count},
  "repo": "${repo}",
  "base_branch": "${base_branch}",
  "issue_url": "${issue_url}",
  "created_at": "${created_at}",
  "updated_at": "${created_at}",
  "agents": []
}
JSON_EOF
}

update_swarm_status() {
    local swarm_id="$1" new_status="$2"
    local file="${SWARM_REGISTRY}/${swarm_id}.json"
    [[ -f "$file" ]] || return 1
    local updated_at
    updated_at=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    python3 -c "
import json, sys
with open('${file}', 'r') as f:
    d = json.load(f)
d['status'] = '${new_status}'
d['updated_at'] = '${updated_at}'
with open('${file}', 'w') as f:
    json.dump(d, f, indent=2)
" 2>/dev/null
}

update_swarm_issue() {
    local swarm_id="$1" issue_url="$2"
    local file="${SWARM_REGISTRY}/${swarm_id}.json"
    [[ -f "$file" ]] || return 1
    python3 -c "
import json
with open('${file}', 'r') as f:
    d = json.load(f)
d['issue_url'] = '${issue_url}'
with open('${file}', 'w') as f:
    json.dump(d, f, indent=2)
" 2>/dev/null
}

add_agent_to_swarm() {
    local swarm_id="$1" agent_name="$2" branch="$3" subtask="$4" pr_url="${5:-}" status="${6:-active}"
    local file="${SWARM_REGISTRY}/${swarm_id}.json"
    [[ -f "$file" ]] || return 1
    python3 -c "
import json, sys
with open('${file}', 'r') as f:
    d = json.load(f)
d['agents'].append({
    'name': '${agent_name}',
    'branch': '${branch}',
    'subtask': $(printf '%s' "$subtask" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' 2>/dev/null || echo "\"${subtask}\""),
    'pr_url': '${pr_url}',
    'status': '${status}'
})
with open('${file}', 'w') as f:
    json.dump(d, f, indent=2)
" 2>/dev/null
}

read_swarm() {
    local swarm_id="$1"
    local file="${SWARM_REGISTRY}/${swarm_id}.json"
    [[ -f "$file" ]] && cat "$file"
}

list_swarms() {
    for f in "${SWARM_REGISTRY}"/*.json; do
        [[ -f "$f" ]] && cat "$f"
    done 2>/dev/null
}

# ─── Helpers ─────────────────────────────────────────────────────────────────

generate_id() {
    head -c 4 /dev/urandom | od -An -tx1 | tr -d ' \n' | head -c 8
}

log_swarm() {
    local swarm_id="$1" msg="$2"
    local ts
    ts=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${ts}] ${msg}" >> "${SWARM_LOGS}/${swarm_id}.log"
}

get_repo_info() {
    local remote
    remote=$(git remote get-url origin 2>/dev/null || echo "")
    if [[ -n "$remote" ]]; then
        echo "$remote" | sed -E 's|.*[:/]([^/]+)/([^/.]+)(\.git)?$|\1/\2|'
    else
        echo "${DEFAULT_ORG}/${DEFAULT_REPO}"
    fi
}

agent_names() {
    local count="$1"
    local names=("LUCIDIA" "ALICE" "OCTAVIA" "PRISM" "ECHO" "CIPHER" "ARIA" "SILAS")
    for ((i=0; i<count && i<${#names[@]}; i++)); do
        echo "${names[$i]}"
    done
}

agent_color() {
    case "$1" in
        LUCIDIA) echo "$PINK" ;;
        ALICE)   echo "$GREEN" ;;
        OCTAVIA) echo "$VIOLET" ;;
        PRISM)   echo "$AMBER" ;;
        ECHO)    echo "$BBLUE" ;;
        CIPHER)  echo "$WHITE" ;;
        ARIA)    echo "$BBLUE" ;;
        SILAS)   echo "$GREEN" ;;
        *)       echo "$NC" ;;
    esac
}

agent_specialty() {
    case "$1" in
        LUCIDIA) echo "architecture and reasoning" ;;
        ALICE)   echo "routing and API design" ;;
        OCTAVIA) echo "compute and infrastructure" ;;
        PRISM)   echo "analysis and testing" ;;
        ECHO)    echo "documentation and memory" ;;
        CIPHER)  echo "security and hardening" ;;
        ARIA)    echo "frontend and UX" ;;
        SILAS)   echo "engineering and implementation" ;;
        *)       echo "general development" ;;
    esac
}

agent_subtask() {
    local agent="$1" task="$2"
    case "$agent" in
        LUCIDIA) echo "Design the architecture and define interfaces for: ${task}" ;;
        ALICE)   echo "Implement routing, API endpoints, and integration for: ${task}" ;;
        OCTAVIA) echo "Build core logic, services, and infrastructure for: ${task}" ;;
        PRISM)   echo "Write tests, validation, and monitoring for: ${task}" ;;
        ECHO)    echo "Write documentation, update CLAUDE.md, and add examples for: ${task}" ;;
        CIPHER)  echo "Add security checks, input validation, and hardening for: ${task}" ;;
        ARIA)    echo "Build UI components and user-facing interfaces for: ${task}" ;;
        SILAS)   echo "Implement CLI commands and developer tooling for: ${task}" ;;
        *)       echo "Work on assigned portion of: ${task}" ;;
    esac
}

agent_task_short() {
    case "$1" in
        LUCIDIA) echo "Design architecture and define interfaces" ;;
        ALICE)   echo "Implement routing and API endpoints" ;;
        OCTAVIA) echo "Build core logic and infrastructure" ;;
        PRISM)   echo "Write tests and validation" ;;
        ECHO)    echo "Write documentation and examples" ;;
        CIPHER)  echo "Add security checks and hardening" ;;
        ARIA)    echo "Build UI components" ;;
        SILAS)   echo "Implement CLI commands" ;;
        *)       echo "General development" ;;
    esac
}

# ─── Plan Generation ─────────────────────────────────────────────────────────

generate_plan() {
    local task="$1"
    local agent_count="$2"
    local swarm_id="$3"
    local plan_file="${SWARM_PLANS}/${swarm_id}.json"

    echo -e "${CYAN}${BOLD}Generating swarm plan...${NC}" >&2
    echo "" >&2

    local agents
    agents=$(agent_names "$agent_count")

    # Build plan JSON via python — pass dynamic values via env to prevent injection
    SWARM_TASK="$task" SWARM_ID="$swarm_id" SWARM_AGENTS="$agents" SWARM_PLAN_FILE="$plan_file" \
    python3 -c '
import json, os, sys

task_text = os.environ["SWARM_TASK"]
swarm_id = os.environ["SWARM_ID"]
agents_raw = os.environ["SWARM_AGENTS"]
plan_file = os.environ["SWARM_PLAN_FILE"]

agents_list = []
for line in agents_raw.strip().split("\n"):
    name = line.strip()
    if not name:
        continue
    specialty_map = {
        "LUCIDIA": "architecture and reasoning",
        "ALICE": "routing and API design",
        "OCTAVIA": "compute and infrastructure",
        "PRISM": "analysis and testing",
        "ECHO": "documentation and memory",
        "CIPHER": "security and hardening",
        "ARIA": "frontend and UX",
        "SILAS": "engineering and implementation",
    }
    subtask_map = {
        "LUCIDIA": "Design the architecture and define interfaces for: ",
        "ALICE": "Implement routing, API endpoints, and integration for: ",
        "OCTAVIA": "Build core logic, services, and infrastructure for: ",
        "PRISM": "Write tests, validation, and monitoring for: ",
        "ECHO": "Write documentation, update CLAUDE.md, and add examples for: ",
        "CIPHER": "Add security checks, input validation, and hardening for: ",
        "ARIA": "Build UI components and user-facing interfaces for: ",
        "SILAS": "Implement CLI commands and developer tooling for: ",
    }
    agents_list.append({
        "name": name,
        "branch": f"swarm/{swarm_id}/{name.lower()}",
        "specialty": specialty_map.get(name, "general development"),
        "subtask": subtask_map.get(name, "Work on: ") + task_text,
    })

plan = {
    "swarm_id": swarm_id,
    "task": task_text,
    "agents": agents_list,
}

with open(plan_file, "w") as f:
    json.dump(plan, f, indent=2)
' 2>/dev/null

    # Display the plan (to stderr so it doesn't pollute the return value)
    echo -e "  ${BOLD}Swarm ID:${NC}  ${AMBER}${swarm_id}${NC}" >&2
    echo -e "  ${BOLD}Task:${NC}      ${task}" >&2
    echo -e "  ${BOLD}Agents:${NC}    ${agent_count}" >&2
    echo "" >&2
    echo -e "  ${BOLD}${PINK}--- Agent Assignments ---${NC}" >&2
    echo "" >&2

    while IFS= read -r agent; do
        local color
        color=$(agent_color "$agent")
        local specialty
        specialty=$(agent_specialty "$agent")
        local branch="swarm/${swarm_id}/$(echo "$agent" | tr '[:upper:]' '[:lower:]')"
        local short_task
        short_task=$(agent_task_short "$agent")

        echo -e "  ${color}${BOLD}${agent}${NC} ${DIM}(${specialty})${NC}" >&2
        echo -e "    Branch: ${CYAN}${branch}${NC}" >&2
        echo -e "    Task:   ${short_task}" >&2
        echo "" >&2
    done <<< "$agents"

    # Only the file path goes to stdout
    echo "$plan_file"
}

# ─── Launch ──────────────────────────────────────────────────────────────────

cmd_launch() {
    local task=""
    local agent_count=$DEFAULT_AGENTS
    local base_branch="main"
    local dry_run=false
    local repo_slug=""

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --agents|-n)  agent_count="$2"; shift 2 ;;
            --base|-b)    base_branch="$2"; shift 2 ;;
            --dry-run)    dry_run=true; shift ;;
            --repo|-r)    repo_slug="$2"; shift 2 ;;
            --help|-h)    cmd_launch_help; return 0 ;;
            *)
                if [[ -z "$task" ]]; then
                    task="$1"
                fi
                shift
                ;;
        esac
    done

    if [[ -z "$task" ]]; then
        echo -e "${RED}Error: Task description required${NC}"
        echo "Usage: br swarm launch \"task description\" [--agents N]"
        return 1
    fi

    if (( agent_count > MAX_AGENTS )); then
        echo -e "${RED}Error: Max ${MAX_AGENTS} agents per swarm${NC}"
        return 1
    fi

    if (( agent_count < 2 )); then
        echo -e "${RED}Error: Need at least 2 agents for a swarm${NC}"
        return 1
    fi

    if [[ -z "$repo_slug" ]]; then
        repo_slug=$(get_repo_info)
    fi

    local swarm_id
    swarm_id=$(generate_id)

    echo ""
    echo -e "${PINK}${BOLD}+==============================================================+${NC}"
    echo -e "${PINK}${BOLD}|${NC}  ${AMBER}*${NC} ${BOLD}CLAUDE CODE SWARM${NC}                                        ${PINK}${BOLD}|${NC}"
    echo -e "${PINK}${BOLD}+==============================================================+${NC}"
    echo ""

    # Generate plan
    local plan_file
    plan_file=$(generate_plan "$task" "$agent_count" "$swarm_id")

    if [[ "$dry_run" == "true" ]]; then
        echo -e "  ${AMBER}${BOLD}DRY RUN${NC} -- No branches or PRs will be created"
        echo ""
        echo -e "  ${DIM}Plan saved to: ${plan_file}${NC}"
        echo ""

        save_swarm "$swarm_id" "$task" "dry-run" "$agent_count" "$repo_slug" "$base_branch"
        log_swarm "$swarm_id" "Dry run: ${task} (${agent_count} agents)"
        return 0
    fi

    # Check prerequisites
    if ! command -v gh &>/dev/null; then
        echo -e "${RED}Error: 'gh' (GitHub CLI) is required but not installed${NC}"
        return 1
    fi

    if ! gh auth status &>/dev/null 2>&1; then
        echo -e "${RED}Error: Not authenticated with GitHub. Run 'gh auth login' first${NC}"
        return 1
    fi

    echo -e "  ${GREEN}${BOLD}Launching swarm...${NC}"
    echo ""

    # Save swarm
    save_swarm "$swarm_id" "$task" "launching" "$agent_count" "$repo_slug" "$base_branch"
    log_swarm "$swarm_id" "Swarm created: ${task} (${agent_count} agents)"

    # Step 1: Create tracking issue
    echo -e "  ${DIM}Creating tracking issue...${NC}"

    local agent_checklist=""
    local agents
    agents=$(agent_names "$agent_count")
    while IFS= read -r agent; do
        agent_checklist+="- [ ] **${agent}** -> \`swarm/${swarm_id}/$(echo "$agent" | tr '[:upper:]' '[:lower:]')\`
"
    done <<< "$agents"

    local issue_body
    issue_body="## Swarm Task: ${task}

**Swarm ID:** \`${swarm_id}\`
**Agents:** ${agent_count}
**Base Branch:** \`${base_branch}\`
**Created:** $(date -u '+%Y-%m-%dT%H:%M:%SZ')

### Agent Branches
${agent_checklist}
### Status
- [ ] All agent branches created
- [ ] All agent PRs opened
- [ ] All agent work completed
- [ ] Merged to ${base_branch}

---
*Generated by BlackRoad Swarm Orchestrator*"

    local issue_url=""
    issue_url=$(gh issue create \
        --repo "$repo_slug" \
        --title "swarm(${swarm_id}): ${task}" \
        --body "$issue_body" 2>/dev/null || echo "")

    if [[ -n "$issue_url" ]]; then
        echo -e "  ${GREEN}+${NC} Issue created: ${issue_url}"
        update_swarm_issue "$swarm_id" "$issue_url"
        log_swarm "$swarm_id" "Tracking issue: ${issue_url}"
    else
        echo -e "  ${AMBER}!${NC} Issue creation skipped (may lack permissions)"
        log_swarm "$swarm_id" "Issue creation skipped"
    fi

    # Step 2: Create branches and PRs for each agent
    agents=$(agent_names "$agent_count")

    while IFS= read -r agent; do
        local color
        color=$(agent_color "$agent")
        local branch="swarm/${swarm_id}/$(echo "$agent" | tr '[:upper:]' '[:lower:]')"
        local specialty
        specialty=$(agent_specialty "$agent")

        echo ""
        echo -e "  ${color}${BOLD}${agent}${NC} ${DIM}(${specialty})${NC}"

        # Create branch
        echo -e "    ${DIM}Creating branch ${branch}...${NC}"
        if git branch "$branch" "$base_branch" 2>/dev/null; then
            if git push -u origin "$branch" 2>/dev/null; then
                echo -e "    ${GREEN}+${NC} Branch created and pushed"
                log_swarm "$swarm_id" "${agent}: Branch ${branch} created"
            else
                echo -e "    ${AMBER}!${NC} Failed to push branch to remote; skipping PR creation"
                log_swarm "$swarm_id" "${agent}: Branch push failed"
                continue
            fi
        else
            echo -e "    ${AMBER}!${NC} Branch may already exist"
        fi

        local subtask
        subtask=$(agent_subtask "$agent" "$task")

        # Create PR
        echo -e "    ${DIM}Creating PR...${NC}"
        local pr_body="## Agent: ${agent}
**Swarm ID:** \`${swarm_id}\`
**Specialty:** ${specialty}

### Subtask
${subtask}

### Coordination
- Parent task: ${task}
- Tracking issue: ${issue_url:-N/A}
- Other agents are working on parallel branches

### Checklist
- [ ] Implementation complete
- [ ] Tests passing
- [ ] Ready for merge

---
*Part of swarm \`${swarm_id}\` -- ${agent_count} agents working in parallel*"

        local pr_url=""
        pr_url=$(gh pr create \
            --repo "$repo_slug" \
            --base "$base_branch" \
            --head "$branch" \
            --title "swarm(${swarm_id}/$(echo "$agent" | tr '[:upper:]' '[:lower:]')): ${task}" \
            --body "$pr_body" \
            --draft 2>/dev/null || echo "")

        if [[ -n "$pr_url" ]]; then
            echo -e "    ${GREEN}+${NC} PR created: ${pr_url}"
            log_swarm "$swarm_id" "${agent}: PR ${pr_url}"
        else
            echo -e "    ${AMBER}!${NC} PR creation skipped (branch may need commits first)"
            log_swarm "$swarm_id" "${agent}: PR skipped"
        fi

        # Save agent to registry
        add_agent_to_swarm "$swarm_id" "$agent" "$branch" "$subtask" "$pr_url" "active"

    done <<< "$agents"

    # Update status
    update_swarm_status "$swarm_id" "active"

    echo ""
    echo -e "  ${GREEN}${BOLD}+==================================================+${NC}"
    echo -e "  ${GREEN}${BOLD}|${NC}  ${GREEN}+${NC} Swarm ${AMBER}${swarm_id}${NC} launched with ${BOLD}${agent_count}${NC} agents       ${GREEN}${BOLD}|${NC}"
    echo -e "  ${GREEN}${BOLD}+==================================================+${NC}"
    echo ""
    echo -e "  ${DIM}Monitor:  ${NC}br swarm monitor ${swarm_id}"
    echo -e "  ${DIM}Status:   ${NC}br swarm status ${swarm_id}"
    echo -e "  ${DIM}Cancel:   ${NC}br swarm cancel ${swarm_id}"
    echo ""

    log_swarm "$swarm_id" "Swarm launched successfully"
}

cmd_launch_help() {
    echo "Usage: br swarm launch <task> [options]"
    echo ""
    echo "Options:"
    echo "  --agents, -n N    Number of agents (2-${MAX_AGENTS}, default: ${DEFAULT_AGENTS})"
    echo "  --base, -b BRANCH Base branch (default: main)"
    echo "  --repo, -r SLUG   Repo slug org/repo (auto-detected)"
    echo "  --dry-run          Plan only, don't create branches/PRs"
    echo ""
    echo "Examples:"
    echo "  br swarm launch \"Add health check endpoints\" --agents 4"
    echo "  br swarm launch \"Refactor auth module\" --agents 3 --dry-run"
}

# ─── Status ──────────────────────────────────────────────────────────────────

cmd_status() {
    local swarm_id="${1:-}"

    if [[ -z "$swarm_id" ]]; then
        # Show all swarms
        echo ""
        echo -e "${PINK}${BOLD} ACTIVE SWARMS${NC}"
        echo -e "${DIM}-------------------------------------------------------------${NC}"

        local found=false
        for f in "${SWARM_REGISTRY}"/*.json; do
            [[ -f "$f" ]] || continue
            found=true

            local info
            info=$(python3 -c "
import json
with open('${f}') as fh:
    d = json.load(fh)
print(f\"{d['id']}|{d['task']}|{d['status']}|{d['agent_count']}|{d['created_at']}\")
" 2>/dev/null || continue)

            IFS='|' read -r sid stask sstatus scount screated <<< "$info"
            local status_color="$GREEN"
            case "$sstatus" in
                active)    status_color="$GREEN" ;;
                planning)  status_color="$AMBER" ;;
                completed) status_color="$BBLUE" ;;
                cancelled) status_color="$RED" ;;
                dry-run)   status_color="$DIM" ;;
                launching) status_color="$AMBER" ;;
            esac
            echo ""
            echo -e "  ${AMBER}${sid}${NC}  ${status_color}${sstatus}${NC}  ${BOLD}${scount}${NC} agents  ${DIM}${screated}${NC}"
            echo -e "  ${DIM}|--${NC} ${stask}"
        done

        if [[ "$found" == "false" ]]; then
            echo -e "  ${DIM}No swarms found. Launch one with: br swarm launch \"task\"${NC}"
        fi
        echo ""
        return 0
    fi

    # Show specific swarm
    local file="${SWARM_REGISTRY}/${swarm_id}.json"
    if [[ ! -f "$file" ]]; then
        echo -e "  ${RED}Swarm ${swarm_id} not found${NC}"
        return 1
    fi

    echo ""
    echo -e "${PINK}${BOLD} SWARM STATUS: ${AMBER}${swarm_id}${NC}"
    echo -e "${DIM}-------------------------------------------------------------${NC}"
    echo ""

    python3 -c "
import json
with open('${file}') as f:
    d = json.load(f)
print(f\"  Task:      {d['task']}\")
print(f\"  Status:    {d['status']}\")
print(f\"  Agents:    {d['agent_count']}\")
print(f\"  Repo:      {d['repo']}\")
print(f\"  Base:      {d['base_branch']}\")
print(f\"  Issue:     {d.get('issue_url') or 'N/A'}\")
print(f\"  Created:   {d['created_at']}\")
" 2>/dev/null

    echo ""
    echo -e "  ${BOLD}${PINK}--- Agents ---${NC}"
    echo ""

    python3 -c "
import json
with open('${file}') as f:
    d = json.load(f)
for a in d.get('agents', []):
    status_icons = {'active': '*', 'pending': 'o', 'completed': '+', 'failed': 'x', 'cancelled': '-'}
    icon = status_icons.get(a['status'], '?')
    print(f\"  {icon} {a['name']}\")
    print(f\"    Branch: {a['branch']}\")
    if a.get('pr_url'):
        print(f\"    PR:     {a['pr_url']}\")
    print()
" 2>/dev/null

    # Show log tail
    local logfile="${SWARM_LOGS}/${swarm_id}.log"
    if [[ -f "$logfile" ]]; then
        echo -e "  ${BOLD}${PINK}--- Recent Log ---${NC}"
        echo ""
        tail -5 "$logfile" | while IFS= read -r line; do
            echo -e "  ${DIM}${line}${NC}"
        done
        echo ""
    fi
}

# ─── Monitor ─────────────────────────────────────────────────────────────────

cmd_monitor() {
    local swarm_id="${1:-}"

    if [[ -z "$swarm_id" ]]; then
        # Find most recent active swarm
        swarm_id=$(python3 -c "
import json, os, glob
registry = '${SWARM_REGISTRY}'
latest = None
latest_time = ''
for f in glob.glob(os.path.join(registry, '*.json')):
    with open(f) as fh:
        d = json.load(fh)
    if d['status'] == 'active' and d['created_at'] > latest_time:
        latest = d['id']
        latest_time = d['created_at']
if latest:
    print(latest)
" 2>/dev/null || echo "")

        if [[ -z "$swarm_id" ]]; then
            echo -e "${AMBER}No active swarms to monitor${NC}"
            echo "Launch one: br swarm launch \"task\""
            return 1
        fi
    fi

    local file="${SWARM_REGISTRY}/${swarm_id}.json"
    if [[ ! -f "$file" ]]; then
        echo -e "${RED}Swarm ${swarm_id} not found${NC}"
        return 1
    fi

    echo -e "${PINK}${BOLD}Monitoring swarm ${AMBER}${swarm_id}${NC} ${DIM}(Ctrl+C to stop)${NC}"
    echo ""

    local repo_slug
    repo_slug=$(python3 -c "
import json
with open('${file}') as f:
    print(json.load(f)['repo'])
" 2>/dev/null || echo "")

    while true; do
        clear
        echo ""
        echo -e "${PINK}${BOLD}+==============================================================+${NC}"
        echo -e "${PINK}${BOLD}|${NC}  ${AMBER}>>>${NC} ${BOLD}SWARM MONITOR${NC}  ${DIM}${swarm_id}${NC}                            ${PINK}${BOLD}|${NC}"
        echo -e "${PINK}${BOLD}+==============================================================+${NC}"
        echo ""

        local task status acount
        read -r task status acount < <(python3 -c "
import json
with open('${file}') as f:
    d = json.load(f)
print(d['task'], d['status'], d['agent_count'])
" 2>/dev/null || echo "unknown unknown 0")

        echo -e "  ${BOLD}Task:${NC}   ${task}"
        echo -e "  ${BOLD}Status:${NC} ${status}  ${DIM}|${NC}  ${BOLD}Agents:${NC} ${acount}"
        echo ""

        # Check each agent's PR status
        python3 -c "
import json, subprocess
with open('${file}') as f:
    d = json.load(f)
repo = d['repo']
for a in d.get('agents', []):
    name = a['name']
    branch = a['branch']
    pr_url = a.get('pr_url', '')
    status = a['status']

    pr_state = status
    checks = ''
    if pr_url and repo:
        import re
        m = re.search(r'(\d+)$', pr_url)
        if m:
            pr_num = m.group(1)
            try:
                result = subprocess.run(
                    ['gh', 'pr', 'view', pr_num, '--repo', repo, '--json', 'state', '-q', '.state'],
                    capture_output=True, text=True, timeout=10
                )
                if result.returncode == 0 and result.stdout.strip():
                    pr_state = result.stdout.strip()
            except Exception:
                pass

    icons = {'OPEN': '*', 'active': '*', 'MERGED': '#', 'CLOSED': 'x', 'pending': 'o'}
    icon = icons.get(pr_state, '?')
    print(f'  {icon} {name}  {branch}')
" 2>/dev/null

        echo ""

        # Show recent log
        local logfile="${SWARM_LOGS}/${swarm_id}.log"
        if [[ -f "$logfile" ]]; then
            echo -e "  ${DIM}--- Log ---${NC}"
            tail -3 "$logfile" | while IFS= read -r line; do
                echo -e "  ${DIM}${line}${NC}"
            done
        fi

        echo ""
        echo -e "  ${DIM}Refreshing every 10s... (Ctrl+C to stop)${NC}"
        sleep 10
    done
}

# ─── List ────────────────────────────────────────────────────────────────────

cmd_list() {
    cmd_status ""
}

# ─── Cancel ──────────────────────────────────────────────────────────────────

cmd_cancel() {
    local swarm_id="${1:-}"

    if [[ -z "$swarm_id" ]]; then
        echo -e "${RED}Error: Swarm ID required${NC}"
        echo "Usage: br swarm cancel <swarm-id>"
        return 1
    fi

    local file="${SWARM_REGISTRY}/${swarm_id}.json"
    if [[ ! -f "$file" ]]; then
        echo -e "${RED}Swarm ${swarm_id} not found${NC}"
        return 1
    fi

    echo -e "${AMBER}Cancelling swarm ${swarm_id}...${NC}"

    python3 -c "
import json
with open('${file}', 'r') as f:
    d = json.load(f)
d['status'] = 'cancelled'
for a in d.get('agents', []):
    a['status'] = 'cancelled'
with open('${file}', 'w') as f:
    json.dump(d, f, indent=2)
" 2>/dev/null

    log_swarm "$swarm_id" "Swarm cancelled"

    echo -e "${GREEN}+${NC} Swarm ${swarm_id} cancelled"
    echo -e "${DIM}Note: Branches and PRs were not deleted. Clean up manually if needed.${NC}"
}

# ─── Dry Run ─────────────────────────────────────────────────────────────────

cmd_dry_run() {
    local task=""
    local agent_count=$DEFAULT_AGENTS

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --agents|-n) agent_count="$2"; shift 2 ;;
            *)
                if [[ -z "$task" ]]; then task="$1"; fi
                shift
                ;;
        esac
    done

    if [[ -z "$task" ]]; then
        echo -e "${RED}Error: Task description required${NC}"
        echo "Usage: br swarm dry-run \"task description\" [--agents N]"
        return 1
    fi

    cmd_launch "$task" --agents "$agent_count" --dry-run
}

# ─── Help ────────────────────────────────────────────────────────────────────

show_help() {
    echo ""
    echo -e "${PINK}${BOLD}+==============================================================+${NC}"
    echo -e "${PINK}${BOLD}|${NC}  ${AMBER}*${NC} ${BOLD}CLAUDE CODE SWARM${NC}                                        ${PINK}${BOLD}|${NC}"
    echo -e "${PINK}${BOLD}+==============================================================+${NC}"
    echo ""
    echo -e "  Launch parallel Claude Code agents, each on its own branch,"
    echo -e "  coordinated through GitHub issues and PRs. Agents communicate"
    echo -e "  via PR comments -- real-time group calls, fully auditable."
    echo ""
    echo -e "  ${BOLD}Commands:${NC}"
    echo ""
    echo -e "    ${GREEN}launch${NC}  <task> [--agents N]   Launch a new swarm"
    echo -e "    ${GREEN}dry-run${NC} <task> [--agents N]   Plan without creating branches/PRs"
    echo -e "    ${GREEN}status${NC}  [swarm-id]            Show swarm status"
    echo -e "    ${GREEN}monitor${NC} [swarm-id]            Live monitoring dashboard"
    echo -e "    ${GREEN}list${NC}                          List all swarms"
    echo -e "    ${GREEN}cancel${NC}  <swarm-id>            Cancel a swarm"
    echo ""
    echo -e "  ${BOLD}Examples:${NC}"
    echo ""
    echo -e "    ${DIM}# Launch 4 agents to add health checks${NC}"
    echo -e "    br swarm launch \"Add health check endpoints\" --agents 4"
    echo ""
    echo -e "    ${DIM}# Dry run with 3 agents${NC}"
    echo -e "    br swarm dry-run \"Refactor auth module\" --agents 3"
    echo ""
    echo -e "    ${DIM}# Monitor the latest active swarm${NC}"
    echo -e "    br swarm monitor"
    echo ""
    echo -e "  ${BOLD}Agents:${NC} ${PINK}LUCIDIA${NC} ${GREEN}ALICE${NC} ${VIOLET}OCTAVIA${NC} ${AMBER}PRISM${NC} ${BBLUE}ECHO${NC} ${WHITE}CIPHER${NC} ${BBLUE}ARIA${NC} ${GREEN}SILAS${NC}"
    echo ""
}

# ─── Main ────────────────────────────────────────────────────────────────────

init_swarm_dir

case "${1:-help}" in
    launch)   shift; cmd_launch "$@" ;;
    status)   shift; cmd_status "$@" ;;
    monitor)  shift; cmd_monitor "$@" ;;
    list)     shift; cmd_list "$@" ;;
    cancel)   shift; cmd_cancel "$@" ;;
    dry-run)  shift; cmd_dry_run "$@" ;;
    help|-h|--help) show_help ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
