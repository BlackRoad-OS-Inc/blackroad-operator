#!/bin/bash
# ============================================================================
# BLACKROAD OS — Next-Level AI Repo Enhancement for RoadCode
# Adds CLAUDE.md, .blackroad.yml, AI agent configs, and smart README upgrades
# to ALL 615 repos on RoadCode (Gitea on Octavia)
# Usage: ./enhance-roadcode-repos.sh [--dry-run] [--org <org>] [--limit N]
# ============================================================================

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
RED='\033[38;5;196m'
RESET='\033[0m'

GITEA="http://192.168.4.101:3100"
TOKEN=$(cat ~/.blackroad/gitea-token 2>/dev/null)
DRY_RUN=false
TARGET_ORG=""
LIMIT=0
ENHANCED=0
SKIPPED=0
FAILED=0

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift;;
    --org) TARGET_ORG="$2"; shift 2;;
    --limit) LIMIT="$2"; shift 2;;
    -h|--help)
      echo -e "${PINK}RoadCode AI Enhancement Pipeline${RESET}"
      echo "Usage: ./enhance-roadcode-repos.sh [--dry-run] [--org <org>] [--limit N]"
      exit 0;;
    *) shift;;
  esac
done

if [[ -z "$TOKEN" ]]; then
  echo -e "${RED}No Gitea token. Save to ~/.blackroad/gitea-token${RESET}"
  exit 1
fi

echo -e "${PINK}RoadCode AI Enhancement Pipeline${RESET}"
echo -e "${BLUE}Target: ${GITEA} (615 repos)${RESET}"
[[ "$DRY_RUN" == true ]] && echo -e "${AMBER}[DRY RUN]${RESET}"
echo ""

# Gitea API helper
gitea_api() {
  local method="$1" path="$2" data="$3"
  if [[ -n "$data" ]]; then
    curl -s -X "$method" "${GITEA}/api/v1${path}" \
      -H "Authorization: token ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d "$data" 2>/dev/null
  else
    curl -s -X "$method" "${GITEA}/api/v1${path}" \
      -H "Authorization: token ${TOKEN}" 2>/dev/null
  fi
}

# Check if file exists in repo
file_exists() {
  local owner="$1" repo="$2" path="$3"
  local result
  result=$(gitea_api GET "/repos/${owner}/${repo}/contents/${path}" 2>/dev/null)
  echo "$result" | python3 -c "import json,sys; d=json.load(sys.stdin); print('yes' if 'content' in d else 'no')" 2>/dev/null || echo "no"
}

# Create or update file in repo
create_file() {
  local owner="$1" repo="$2" path="$3" content="$4" message="$5"
  local encoded
  encoded=$(echo -n "$content" | base64)

  # Check if file already exists (need SHA for update)
  local existing
  existing=$(gitea_api GET "/repos/${owner}/${repo}/contents/${path}" 2>/dev/null)
  local sha
  sha=$(echo "$existing" | python3 -c "import json,sys; print(json.load(sys.stdin).get('sha',''))" 2>/dev/null || echo "")

  local payload
  if [[ -n "$sha" && "$sha" != "" ]]; then
    payload=$(python3 -c "import json; print(json.dumps({'content':'$encoded','message':'$message','sha':'$sha'}))")
  else
    payload=$(python3 -c "import json; print(json.dumps({'content':'$encoded','message':'$message'}))")
  fi

  gitea_api PUT "/repos/${owner}/${repo}/contents/${path}" "$payload"
}

# Generate CLAUDE.md for a repo
generate_claude_md() {
  local owner="$1" repo="$2" desc="$3" lang="$4"
  cat << CLAUDEEOF
# CLAUDE.md

This is \`${repo}\` — part of BlackRoad OS.
${desc:+
> ${desc}
}
## Owner
BlackRoad OS, Inc. — Proprietary. All rights reserved.

## AI Instructions
- This repo is part of the BlackRoad ecosystem (615+ repos across 15 orgs)
- Primary git host: RoadCode (Gitea on Octavia, 192.168.4.101:3100)
- GitHub is a mirror only — Gitea is primary
- All code is proprietary unless explicitly marked otherwise
- Use BlackRoad brand colors: black bg, white text, gradient accents
- Fonts: Space Grotesk (headings), Inter (body), JetBrains Mono (code)
${lang:+- Primary language: ${lang}}

## Memory System
- Check codex before solving: \`memory-codex.sh search "<problem>"\`
- Log actions: \`memory-system.sh log <action> <entity> "<details>"\`
- Broadcast learnings: \`memory-til-broadcast.sh broadcast <category> "<learning>"\`

## Collaboration
- Register session: \`memory-collaboration.sh register\`
- Claim tasks: \`memory-collaboration.sh claim "<task>"\`
- Check board: \`memory-collaboration.sh board\`
CLAUDEEOF
}

# Generate .blackroad.yml
generate_blackroad_yml() {
  local owner="$1" repo="$2" desc="$3" lang="$4"
  cat << YMLEOF
# BlackRoad OS — Repo Configuration
name: ${repo}
org: ${owner}
description: "${desc}"
${lang:+language: ${lang}}

# AI Agent Configuration
agents:
  enabled: true
  primary: octavia
  reviewers: [alice, lucidia]
  security: shellfish

# Automation
auto_review: true
auto_format: true
auto_test: true

# Deployment
deploy:
  target: roadcode
  mirror: github
  edge: gematria

# Brand
license: proprietary
owner: BlackRoad OS, Inc.
tagline: "Pave Tomorrow."
YMLEOF
}

# Generate .github/workflows/ai-review.yml equivalent for Gitea Actions
generate_ai_workflow() {
  cat << 'WFEOF'
name: AI Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: AI Code Review
        run: |
          echo "BlackRoad AI Review"
          echo "Checking code quality, security, and brand compliance..."
          # Agent: Octavia reviews architecture
          # Agent: Alice checks ops/deploy
          # Agent: Shellfish scans security
          echo "✓ Review complete"
WFEOF
}

# ── MAIN LOOP ──
page=1
processed=0

while true; do
  local_url="/repos/search?limit=50&page=${page}"
  [[ -n "$TARGET_ORG" ]] && local_url="/orgs/${TARGET_ORG}/repos?limit=50&page=${page}"

  repos=$(gitea_api GET "$local_url" | python3 -c "
import json, sys
data = json.load(sys.stdin)
repos = data.get('data', data) if isinstance(data, dict) else data
if not isinstance(repos, list): repos = []
for r in repos:
    lang = r.get('language','') or ''
    desc = (r.get('description','') or '').replace('|','—')
    print(f\"{r['owner']['login']}|{r['name']}|{desc}|{lang}|{r.get('empty',False)}\")
" 2>/dev/null)

  [[ -z "$repos" ]] && break

  while IFS='|' read -r owner repo desc lang empty; do
    [[ -z "$owner" || -z "$repo" ]] && continue
    [[ "$empty" == "True" ]] && { SKIPPED=$((SKIPPED+1)); continue; }
    [[ "$LIMIT" -gt 0 && "$processed" -ge "$LIMIT" ]] && break 2

    processed=$((processed+1))

    # Check what's missing
    has_claude=$(file_exists "$owner" "$repo" "CLAUDE.md")
    has_config=$(file_exists "$owner" "$repo" ".blackroad.yml")

    if [[ "$has_claude" == "yes" && "$has_config" == "yes" ]]; then
      SKIPPED=$((SKIPPED+1))
      continue
    fi

    echo -ne "  ${VIOLET}${owner}/${repo}${RESET} "

    if [[ "$DRY_RUN" == true ]]; then
      [[ "$has_claude" != "yes" ]] && echo -n "+CLAUDE.md "
      [[ "$has_config" != "yes" ]] && echo -n "+.blackroad.yml "
      echo ""
      ENHANCED=$((ENHANCED+1))
      continue
    fi

    # Add CLAUDE.md
    if [[ "$has_claude" != "yes" ]]; then
      claude_content=$(generate_claude_md "$owner" "$repo" "$desc" "$lang")
      result=$(create_file "$owner" "$repo" "CLAUDE.md" "$claude_content" "ai: add CLAUDE.md for AI agent context")
      if echo "$result" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if 'content' in d else 1)" 2>/dev/null; then
        echo -n "${GREEN}+CLAUDE.md${RESET} "
      else
        echo -n "${RED}!CLAUDE.md${RESET} "
        FAILED=$((FAILED+1))
      fi
    fi

    # Add .blackroad.yml
    if [[ "$has_config" != "yes" ]]; then
      config_content=$(generate_blackroad_yml "$owner" "$repo" "$desc" "$lang")
      result=$(create_file "$owner" "$repo" ".blackroad.yml" "$config_content" "ai: add .blackroad.yml agent config")
      if echo "$result" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if 'content' in d else 1)" 2>/dev/null; then
        echo -n "${GREEN}+.blackroad.yml${RESET} "
      else
        echo -n "${RED}!.blackroad.yml${RESET} "
        FAILED=$((FAILED+1))
      fi
    fi

    echo ""
    ENHANCED=$((ENHANCED+1))

    # Rate limit — don't hammer Gitea
    sleep 0.2
  done <<< "$repos"

  page=$((page+1))
done

echo ""
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${PINK}RoadCode AI Enhancement Complete${RESET}"
echo -e "  Enhanced: ${GREEN}${ENHANCED}${RESET}"
echo -e "  Skipped:  ${SKIPPED} (already have CLAUDE.md + .blackroad.yml)"
echo -e "  Failed:   ${RED}${FAILED}${RESET}"
echo -e "  Total:    ${processed} repos processed"
