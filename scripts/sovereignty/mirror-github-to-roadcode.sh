#!/bin/bash
# Mirror ALL GitHub repos to RoadCode (Gitea) — Sovereignty Migration
# Gitea pulls from public GitHub repos (no GH auth needed for public repos)
# Usage: ./mirror-github-to-roadcode.sh [--dry-run] [--org <github-org>]
set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
RED='\033[38;5;196m'
RESET='\033[0m'

GITEA_URL="http://192.168.4.101:3100"
GITEA_USER="blackroad"
GITEA_TOKEN="" # Will try to read from file
DRY_RUN=false
SINGLE_ORG=""

# GitHub org → Gitea org mapping
declare -A ORG_MAP=(
  ["blackboxprogramming"]="blackroad-os"
  ["BlackRoad-OS-Inc"]="blackroad-os"
  ["BlackRoad-AI"]="lucidia"
  ["BlackRoad-Labs"]="labs"
  ["BlackRoad-Gov"]="gov"
  ["BlackRoad-Education"]="education"
  ["BlackRoad-Studio"]="studio"
  ["BlackRoad-Ventures"]="ventures"
  ["BlackRoad-Archive"]="archive"
  ["BlackRoad-Infrastructure"]="infrastructure"
  ["BlackRoad-Agents"]="agents"
  ["BlackRoad-Services"]="services"
  ["BlackRoad-Platform"]="platform"
  ["BlackRoad-Tools"]="tools"
)

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift;;
    --org) SINGLE_ORG="$2"; shift 2;;
    --token) GITEA_TOKEN="$2"; shift 2;;
    -h|--help)
      echo -e "${PINK}Mirror GitHub → RoadCode${RESET}"
      echo "Usage: ./mirror-github-to-roadcode.sh [--dry-run] [--org <github-org>] [--token <gitea-token>]"
      exit 0
      ;;
    *) echo -e "${RED}Unknown: $1${RESET}"; exit 1;;
  esac
done

# Try to get Gitea token
if [[ -z "$GITEA_TOKEN" ]]; then
  GITEA_TOKEN=$(cat ~/.blackroad/gitea-token 2>/dev/null || true)
fi
if [[ -z "$GITEA_TOKEN" ]]; then
  echo -e "${AMBER}No Gitea API token found.${RESET}"
  echo "Generate one at ${GITEA_URL}/user/settings/applications"
  echo "Then save to ~/.blackroad/gitea-token or pass --token <token>"
  echo ""
  echo "Creating token via API..."
  # Try default admin credentials
  GITEA_TOKEN=$(curl -s -X POST "${GITEA_URL}/api/v1/users/blackroad/tokens" \
    -H "Content-Type: application/json" \
    -u "blackroad:blackroad" \
    -d '{"name":"mirror-script-'$(date +%s)'","scopes":["write:repository","write:organization"]}' 2>/dev/null | python3 -c "import json,sys; print(json.load(sys.stdin).get('sha1',''))" 2>/dev/null)
  if [[ -n "$GITEA_TOKEN" ]]; then
    echo "$GITEA_TOKEN" > ~/.blackroad/gitea-token
    chmod 600 ~/.blackroad/gitea-token
    echo -e "${GREEN}Token created and saved to ~/.blackroad/gitea-token${RESET}"
  else
    echo -e "${RED}Could not create token. Set up manually.${RESET}"
    exit 1
  fi
fi

echo -e "${PINK}Mirror GitHub → RoadCode${RESET}"
echo -e "${BLUE}Source: GitHub (public API, no auth needed)${RESET}"
echo -e "${BLUE}Target: ${GITEA_URL}${RESET}"
[[ "$DRY_RUN" == true ]] && echo -e "${AMBER}[DRY RUN]${RESET}"
echo ""

TOTAL_MIRRORED=0
TOTAL_SKIPPED=0
TOTAL_FAILED=0

# Get GitHub orgs to process
if [[ -n "$SINGLE_ORG" ]]; then
  GH_ORGS="$SINGLE_ORG"
else
  GH_ORGS="blackboxprogramming BlackRoad-OS-Inc BlackRoad-AI BlackRoad-Labs BlackRoad-Gov BlackRoad-Education BlackRoad-Studio BlackRoad-Ventures BlackRoad-Archive"
fi

for gh_org in $GH_ORGS; do
  gitea_org="${ORG_MAP[$gh_org]:-$gh_org}"

  echo -e "${VIOLET}[${gh_org}]${RESET} → gitea:${gitea_org}"

  # Get repos from GitHub (paginated, public API)
  page=1
  all_repos=""
  while true; do
    if [[ "$gh_org" == "blackboxprogramming" ]]; then
      url="https://api.github.com/users/${gh_org}/repos?per_page=100&page=${page}&type=public"
    else
      url="https://api.github.com/orgs/${gh_org}/repos?per_page=100&page=${page}&type=public"
    fi

    repos=$(curl -s "$url" 2>/dev/null | python3 -c "
import json, sys
data = json.load(sys.stdin)
if isinstance(data, list):
    for r in data:
        print(r['name'] + '|' + r['clone_url'] + '|' + str(r.get('description','') or ''))
" 2>/dev/null)

    [[ -z "$repos" ]] && break
    all_repos+="$repos"$'\n'
    count=$(echo "$repos" | grep -c '|' 2>/dev/null || echo 0)
    [[ "$count" -lt 100 ]] && break
    page=$((page + 1))
  done

  repo_count=$(echo "$all_repos" | grep -c '|' 2>/dev/null || echo 0)
  echo -e "  Found ${repo_count} GitHub repos"

  # Get existing Gitea repos for this org
  existing=$(curl -s "${GITEA_URL}/api/v1/orgs/${gitea_org}/repos?limit=200&token=${GITEA_TOKEN}" 2>/dev/null | python3 -c "
import json, sys
data = json.load(sys.stdin)
if isinstance(data, list):
    for r in data:
        print(r['name'])
" 2>/dev/null)

  while IFS='|' read -r name clone_url desc; do
    [[ -z "$name" ]] && continue

    # Check if already exists
    if echo "$existing" | grep -q "^${name}$"; then
      TOTAL_SKIPPED=$((TOTAL_SKIPPED + 1))
      continue
    fi

    if [[ "$DRY_RUN" == true ]]; then
      echo -e "    ${BLUE}WOULD MIRROR${RESET} ${name}"
      TOTAL_MIRRORED=$((TOTAL_MIRRORED + 1))
    else
      # Create mirror repo in Gitea
      result=$(curl -s -X POST "${GITEA_URL}/api/v1/repos/migrate" \
        -H "Authorization: token ${GITEA_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{
          \"clone_addr\": \"${clone_url}\",
          \"repo_name\": \"${name}\",
          \"repo_owner\": \"${gitea_org}\",
          \"mirror\": true,
          \"description\": \"${desc}\",
          \"service\": \"github\"
        }" 2>/dev/null)

      if echo "$result" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if 'id' in d else 1)" 2>/dev/null; then
        echo -e "    ${GREEN}✓${RESET} ${name}"
        TOTAL_MIRRORED=$((TOTAL_MIRRORED + 1))
      else
        error=$(echo "$result" | python3 -c "import json,sys; print(json.load(sys.stdin).get('message','unknown'))" 2>/dev/null)
        echo -e "    ${RED}✗${RESET} ${name}: ${error}"
        TOTAL_FAILED=$((TOTAL_FAILED + 1))
      fi
    fi
  done <<< "$all_repos"

  echo ""
done

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${PINK}GitHub → RoadCode Mirror Complete${RESET}"
echo -e "  Mirrored: ${GREEN}${TOTAL_MIRRORED}${RESET}"
echo -e "  Skipped:  ${TOTAL_SKIPPED} (already exist)"
echo -e "  Failed:   ${RED}${TOTAL_FAILED}${RESET}"
