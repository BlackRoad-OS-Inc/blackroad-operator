#!/bin/bash
# ============================================================================
# BLACKROAD OS — Wire All RoadCode Repos to AI Agent Webhooks
# Every push/PR/issue triggers AI review via RoundTrip agents
# Usage: ./enhance-roadcode-webhooks.sh [--dry-run] [--org <org>]
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
# RoundTrip webhook endpoint on Octavia
WEBHOOK_URL="http://192.168.4.101:9016/webhook/gitea"
DRY_RUN=false
TARGET_ORG=""
ADDED=0
SKIPPED=0

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift;;
    --org) TARGET_ORG="$2"; shift 2;;
    *) shift;;
  esac
done

echo -e "${PINK}RoadCode → AI Agent Webhook Wiring${RESET}"
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

page=1
while true; do
  local_url="/repos/search?limit=50&page=${page}"
  [[ -n "$TARGET_ORG" ]] && local_url="/orgs/${TARGET_ORG}/repos?limit=50&page=${page}"

  repos=$(gitea_api GET "$local_url" | python3 -c "
import json, sys
data = json.load(sys.stdin)
repos = data.get('data', data) if isinstance(data, dict) else data
if not isinstance(repos, list): repos = []
for r in repos:
    if not r.get('empty', False):
        print(f\"{r['owner']['login']}|{r['name']}\")
" 2>/dev/null)

  [[ -z "$repos" ]] && break

  while IFS='|' read -r owner repo; do
    [[ -z "$owner" || -z "$repo" ]] && continue

    # Check if webhook already exists
    existing=$(gitea_api GET "/repos/${owner}/${repo}/hooks" | python3 -c "
import json, sys
hooks = json.load(sys.stdin)
for h in hooks:
    if '${WEBHOOK_URL}' in h.get('config',{}).get('url',''):
        print('yes')
        break
" 2>/dev/null)

    if [[ "$existing" == "yes" ]]; then
      SKIPPED=$((SKIPPED+1))
      continue
    fi

    if [[ "$DRY_RUN" == true ]]; then
      echo -e "  ${BLUE}WOULD WIRE${RESET} ${owner}/${repo}"
      ADDED=$((ADDED+1))
      continue
    fi

    result=$(gitea_api POST "/repos/${owner}/${repo}/hooks" "{
      \"type\": \"gitea\",
      \"active\": true,
      \"events\": [\"push\", \"pull_request\", \"issues\", \"issue_comment\"],
      \"config\": {
        \"url\": \"${WEBHOOK_URL}\",
        \"content_type\": \"json\"
      }
    }")

    if echo "$result" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if 'id' in d else 1)" 2>/dev/null; then
      echo -e "  ${GREEN}✓${RESET} ${owner}/${repo}"
      ADDED=$((ADDED+1))
    else
      echo -e "  ${RED}✗${RESET} ${owner}/${repo}"
    fi

    sleep 0.1
  done <<< "$repos"

  page=$((page+1))
done

echo ""
echo -e "${PINK}Webhook Wiring Complete${RESET}"
echo -e "  Wired: ${GREEN}${ADDED}${RESET}"
echo -e "  Skipped: ${SKIPPED} (already wired)"
