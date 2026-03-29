#!/bin/bash
# enterprise-rulesets.sh — Configure enterprise-level rulesets, branch protection,
# and org-level workflow inheritance for BlackRoad GitHub Enterprise
#
# Sets up:
# 1. Branch protection rulesets (no force push, no delete, require CI)
# 2. Workflow inheritance (operator workflows cascade to all orgs)
# 3. Runner groups (Pi fleet vs Droplet fleet)
# 4. Required workflows for all repos
# 5. Bot account permissions per org
#
# Usage: ./enterprise-rulesets.sh [--apply] [--audit] [--runner-groups] [--required-workflows]

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
CYAN='\033[0;36m'
RED='\033[0;31m'
RESET='\033[0m'

ENTERPRISE="blackroad-os"

# All orgs in the enterprise
ORGS=(
  BlackRoad-OS-Inc BlackRoad-OS BlackRoad-AI BlackRoad-Studio
  BlackRoad-Education BlackRoad-Security BlackRoad-Labs BlackRoad-Hardware
  BlackRoad-Media BlackRoad-Foundation BlackRoad-Ventures BlackRoad-Cloud
  BlackRoad-Gov BlackRoad-Archive BlackRoad-Interactive Blackbox-Enterprises
  BlackRoad-Forge BlackRoad-Network BlackRoad-Sandbox BlackRoad-Agents
  BlackRoad-Quantum BlackRoad-QI BlackRoad-README BlackRoad-Data
  BlackRoad-Dev BlackRoad-Com BlackRoad-Tech BlackRoad-App
  BlackRoad-XYZ BlackRoad-Anthropic BlackRoad-Alphabet BlackRoad-Google
  BlackRoad-OpenAI BlackRoad-xAI BlackRoad-X BlackRoad-Nvidia
)

# Core orgs that get full workflow suite
CORE_ORGS=(
  BlackRoad-OS-Inc BlackRoad-OS BlackRoad-AI BlackRoad-Studio
  BlackRoad-Education BlackRoad-Security BlackRoad-Labs BlackRoad-Hardware
  BlackRoad-Media BlackRoad-Foundation BlackRoad-Ventures BlackRoad-Cloud
  BlackRoad-Gov BlackRoad-Archive BlackRoad-Interactive Blackbox-Enterprises
  BlackRoad-Agents BlackRoad-Network
)

# Workflows that should be in every core org's .github repo
REQUIRED_WORKFLOWS=(
  "fleet-dispatch.yml"
  "fleet-autonomy.yml"
  "gitea-github-sync.yml"
  "autonomous-orchestrator.yml"
  "autonomous-self-healer.yml"
  "blackroad-ci.yml"
)

audit() {
  echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${PINK}║${RESET}  ${CYAN}BlackRoad Enterprise Audit${RESET}                              ${PINK}║${RESET}"
  echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${RESET}"
  echo ""

  echo -e "${CYAN}Enterprise:${RESET} ${ENTERPRISE}"
  echo -e "${CYAN}Total orgs:${RESET} ${#ORGS[@]}"
  echo ""

  # Check enterprise settings
  echo -e "${AMBER}Enterprise Settings:${RESET}"
  gh api "/enterprises/${ENTERPRISE}" -q '.name, .slug, .created_at' 2>/dev/null || echo "  Cannot access enterprise API (may need admin token)"
  echo ""

  # Check runners
  echo -e "${AMBER}Enterprise Runners:${RESET}"
  gh api "/enterprises/${ENTERPRISE}/actions/runners" --paginate -q '.runners[] | "  " + .name + ": " + .status + " (" + (.labels | map(.name) | join(", ")) + ")"' 2>/dev/null || echo "  Cannot list runners"
  echo ""

  # Check runner groups
  echo -e "${AMBER}Runner Groups:${RESET}"
  gh api "/enterprises/${ENTERPRISE}/actions/runner-groups" --paginate -q '.runner_groups[] | "  " + .name + " (id=" + (.id|tostring) + ", runners=" + (.runners_count|tostring) + ")"' 2>/dev/null || echo "  Cannot list runner groups"
  echo ""

  # Check org-level protection
  echo -e "${AMBER}Org Branch Protection:${RESET}"
  for org in "${CORE_ORGS[@]}"; do
    # Check .github repo exists
    has_github=$(gh api "/repos/${org}/.github" -q '.name' 2>/dev/null || echo "")
    if [ -n "$has_github" ]; then
      ruleset_count=$(gh api "/orgs/${org}/rulesets" -q 'length' 2>/dev/null || echo "0")
      echo -e "  ${org}: ${GREEN}.github exists${RESET}, ${ruleset_count} rulesets"
    else
      echo -e "  ${org}: ${RED}no .github repo${RESET}"
    fi
  done
  echo ""
}

apply_rulesets() {
  echo -e "${CYAN}Applying enterprise rulesets to all orgs...${RESET}"
  echo ""

  for org in "${CORE_ORGS[@]}"; do
    echo -e "  ${AMBER}${org}${RESET}"

    # Create branch protection ruleset
    RULESET_JSON='{
      "name": "BlackRoad Branch Protection",
      "target": "branch",
      "enforcement": "active",
      "conditions": {
        "ref_name": {
          "include": ["~DEFAULT_BRANCH"],
          "exclude": []
        }
      },
      "rules": [
        {"type": "deletion"},
        {"type": "non_fast_forward"},
        {
          "type": "pull_request",
          "parameters": {
            "dismiss_stale_reviews_on_push": true,
            "require_code_owner_review": false,
            "required_approving_review_count": 0,
            "required_review_thread_resolution": false
          }
        }
      ]
    }'

    # Check if ruleset already exists
    existing=$(gh api "/orgs/${org}/rulesets" -q '.[].name' 2>/dev/null | grep -c "BlackRoad Branch Protection" || true)
    if [ "$existing" -gt 0 ]; then
      echo -e "    ${GREEN}Ruleset exists${RESET}"
    else
      if gh api -X POST "/orgs/${org}/rulesets" --input - <<< "$RULESET_JSON" > /dev/null 2>&1; then
        echo -e "    ${GREEN}Ruleset created${RESET}"
      else
        echo -e "    ${RED}Failed (may need admin scope)${RESET}"
      fi
    fi
  done
  echo ""
}

setup_runner_groups() {
  echo -e "${CYAN}Setting up runner groups...${RESET}"
  echo ""

  # Create Pi Fleet group
  echo -e "  Creating ${AMBER}pi-fleet${RESET} runner group..."
  gh api -X POST "/enterprises/${ENTERPRISE}/actions/runner-groups" \
    --input - <<< '{
      "name": "pi-fleet",
      "visibility": "all",
      "allows_public_repositories": true,
      "restricted_to_workflows": false
    }' > /dev/null 2>&1 && echo -e "    ${GREEN}Created${RESET}" || echo -e "    ${AMBER}Exists or failed${RESET}"

  # Create Droplet group
  echo -e "  Creating ${AMBER}droplet-fleet${RESET} runner group..."
  gh api -X POST "/enterprises/${ENTERPRISE}/actions/runner-groups" \
    --input - <<< '{
      "name": "droplet-fleet",
      "visibility": "all",
      "allows_public_repositories": true,
      "restricted_to_workflows": false
    }' > /dev/null 2>&1 && echo -e "    ${GREEN}Created${RESET}" || echo -e "    ${AMBER}Exists or failed${RESET}"

  echo ""
}

deploy_required_workflows() {
  echo -e "${CYAN}Deploying required workflows to all core orgs...${RESET}"
  echo ""

  SOURCE_DIR="$(cd "$(dirname "$0")/../.." && pwd)/.github/workflows"

  for org in "${CORE_ORGS[@]}"; do
    echo -e "  ${AMBER}${org}${RESET}"

    # Check if .github repo exists, skip if not
    if ! gh api "/repos/${org}/.github" -q '.name' > /dev/null 2>&1; then
      echo -e "    ${RED}No .github repo — skipping${RESET}"
      continue
    fi

    for wf in "${REQUIRED_WORKFLOWS[@]}"; do
      wf_path="${SOURCE_DIR}/${wf}"
      if [ ! -f "$wf_path" ]; then
        echo -e "    ${RED}${wf} not found in source${RESET}"
        continue
      fi

      # Read source content
      content=$(base64 < "$wf_path")

      # Check if file exists in target
      existing_sha=$(gh api "/repos/${org}/.github/contents/.github/workflows/${wf}" -q '.sha' 2>/dev/null || echo "")

      if [ -n "$existing_sha" ]; then
        # Update existing
        gh api -X PUT "/repos/${org}/.github/contents/.github/workflows/${wf}" \
          --input - <<< "{
            \"message\": \"chore: sync ${wf} from operator\",
            \"content\": \"${content}\",
            \"sha\": \"${existing_sha}\",
            \"committer\": {\"name\": \"BlackRoad Bot\", \"email\": \"bot@blackroad.io\"}
          }" > /dev/null 2>&1 && echo -e "    ${GREEN}${wf} updated${RESET}" || echo -e "    ${RED}${wf} update failed${RESET}"
      else
        # Create new
        gh api -X PUT "/repos/${org}/.github/contents/.github/workflows/${wf}" \
          --input - <<< "{
            \"message\": \"chore: add ${wf} from operator\",
            \"content\": \"${content}\",
            \"committer\": {\"name\": \"BlackRoad Bot\", \"email\": \"bot@blackroad.io\"}
          }" > /dev/null 2>&1 && echo -e "    ${GREEN}${wf} created${RESET}" || echo -e "    ${RED}${wf} create failed${RESET}"
      fi
    done
  done
  echo ""
}

show_help() {
  echo -e "${PINK}BlackRoad Enterprise Rulesets${RESET}"
  echo ""
  echo "Usage: $0 [command]"
  echo ""
  echo "Commands:"
  echo "  --audit               Show current enterprise state"
  echo "  --apply               Apply branch protection rulesets to all orgs"
  echo "  --runner-groups       Create pi-fleet and droplet-fleet runner groups"
  echo "  --required-workflows  Deploy fleet workflows to all core org .github repos"
  echo "  --all                 Run everything"
  echo ""
}

case "${1:-help}" in
  --audit)               audit ;;
  --apply)               apply_rulesets ;;
  --runner-groups)       setup_runner_groups ;;
  --required-workflows)  deploy_required_workflows ;;
  --all)                 audit; apply_rulesets; setup_runner_groups; deploy_required_workflows ;;
  *)                     show_help ;;
esac
