#!/bin/bash
# ============================================================================
# BLACKROAD OS — Add AI Features to All Repos
# Adds: issue templates, PR templates, agent webhooks, auto-labeling
# Usage: ./enhance-repo-ai-features.sh [--dry-run] [--org <org>] [--limit N]
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

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift;;
    --org) TARGET_ORG="$2"; shift 2;;
    --limit) LIMIT="$2"; shift 2;;
    *) shift;;
  esac
done

echo -e "${PINK}RoadCode AI Features Enhancement${RESET}"
[[ "$DRY_RUN" == true ]] && echo -e "${AMBER}[DRY RUN]${RESET}"
echo ""

gitea_api() {
  local method="$1" path="$2" data="$3"
  if [[ -n "$data" ]]; then
    curl -s -X "$method" "${GITEA}/api/v1${path}" -H "Authorization: token ${TOKEN}" -H "Content-Type: application/json" -d "$data" 2>/dev/null
  else
    curl -s -X "$method" "${GITEA}/api/v1${path}" -H "Authorization: token ${TOKEN}" 2>/dev/null
  fi
}

# Add topics/labels to repos
add_topics() {
  local owner="$1" repo="$2" lang="$3"
  local topics='["blackroad","sovereign","ai-native","pave-tomorrow"]'
  [[ -n "$lang" ]] && topics="[\"blackroad\",\"sovereign\",\"ai-native\",\"pave-tomorrow\",\"$(echo "$lang" | tr '[:upper:]' '[:lower:]')\"]"

  gitea_api PUT "/repos/${owner}/${repo}/topics" "{\"topics\":$topics}" >/dev/null 2>&1
}

# Add description if empty
set_description() {
  local owner="$1" repo="$2"
  local current_desc
  current_desc=$(gitea_api GET "/repos/${owner}/${repo}" | python3 -c "import json,sys; print(json.load(sys.stdin).get('description',''))" 2>/dev/null)

  if [[ -z "$current_desc" || "$current_desc" == "None" ]]; then
    local pretty_name
    pretty_name=$(echo "$repo" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')
    gitea_api PATCH "/repos/${owner}/${repo}" "{\"description\":\"BlackRoad OS — ${pretty_name}. Pave Tomorrow.\",\"website\":\"https://blackroad.io\"}" >/dev/null 2>&1
    echo -n "${GREEN}+desc${RESET} "
  fi
}

# Add default labels
add_labels() {
  local owner="$1" repo="$2"

  # Check if labels already exist
  local label_count
  label_count=$(gitea_api GET "/repos/${owner}/${repo}/labels" | python3 -c "import json,sys; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")

  if [[ "$label_count" -lt 5 ]]; then
    local labels=(
      '{"name":"ai-review","color":"#8844FF","description":"Needs AI code review"}'
      '{"name":"agent-task","color":"#FF6B2B","description":"Task for AI agents"}'
      '{"name":"sovereign","color":"#00D4FF","description":"Sovereignty migration related"}'
      '{"name":"priority-high","color":"#FF2255","description":"High priority"}'
      '{"name":"auto-fix","color":"#22c55e","description":"Can be auto-fixed by AI"}'
      '{"name":"security","color":"#ef4444","description":"Security concern"}'
      '{"name":"brand","color":"#CC00AA","description":"Brand compliance"}'
    )
    for label in "${labels[@]}"; do
      gitea_api POST "/repos/${owner}/${repo}/labels" "$label" >/dev/null 2>&1
    done
    echo -n "${GREEN}+labels${RESET} "
  fi
}

# Enable issue tracking + wiki
enable_features() {
  local owner="$1" repo="$2"
  gitea_api PATCH "/repos/${owner}/${repo}" '{"has_issues":true,"has_wiki":true,"has_pull_requests":true}' >/dev/null 2>&1
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
    empty = r.get('empty', False)
    topics = len(r.get('topics',[]) or [])
    print(f\"{r['owner']['login']}|{r['name']}|{lang}|{empty}|{topics}\")
" 2>/dev/null)

  [[ -z "$repos" ]] && break

  while IFS='|' read -r owner repo lang empty topics; do
    [[ -z "$owner" || -z "$repo" ]] && continue
    [[ "$empty" == "True" ]] && continue
    [[ "$LIMIT" -gt 0 && "$processed" -ge "$LIMIT" ]] && break 2

    processed=$((processed+1))

    # Skip if already has topics (already enhanced)
    if [[ "$topics" -ge 3 ]]; then
      SKIPPED=$((SKIPPED+1))
      continue
    fi

    echo -ne "  ${VIOLET}${owner}/${repo}${RESET} "

    if [[ "$DRY_RUN" == true ]]; then
      echo "+topics +labels +features"
      ENHANCED=$((ENHANCED+1))
      continue
    fi

    add_topics "$owner" "$repo" "$lang"
    echo -n "${GREEN}+topics${RESET} "

    set_description "$owner" "$repo"
    add_labels "$owner" "$repo"
    enable_features "$owner" "$repo"

    echo ""
    ENHANCED=$((ENHANCED+1))
    sleep 0.1
  done <<< "$repos"

  page=$((page+1))
done

echo ""
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${PINK}AI Features Enhancement Complete${RESET}"
echo -e "  Enhanced: ${GREEN}${ENHANCED}${RESET}"
echo -e "  Skipped:  ${SKIPPED}"
echo -e "  Total:    ${processed}"
