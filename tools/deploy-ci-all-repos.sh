#!/bin/bash
# Deploy BlackRoad CI workflow to all repos across all 16 orgs
# Uses GitHub App token for auth (no PAT needed)
# Usage: ./deploy-ci-all-repos.sh [--dry-run] [--org ORG_NAME] [--max N]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OPERATOR_DIR="$(dirname "$SCRIPT_DIR")"
CI_WORKFLOW="${OPERATOR_DIR}/.github/workflows/blackroad-ci.yml"
APP_CREDS_DIR="${HOME}/.blackroad-github-app"

ORGS=(
  "BlackRoad-OS-Inc" "BlackRoad-OS" "BlackRoad-AI" "BlackRoad-Labs"
  "BlackRoad-Cloud" "BlackRoad-Ventures" "BlackRoad-Foundation" "BlackRoad-Media"
  "BlackRoad-Hardware" "BlackRoad-Education" "BlackRoad-Gov" "BlackRoad-Security"
  "BlackRoad-Interactive" "BlackRoad-Archive" "BlackRoad-Studio" "Blackbox-Enterprises"
)

DRY_RUN=false
FILTER_ORG=""
MAX_REPOS=0
PARALLEL=10
DEPLOYED=0
SKIPPED=0
FAILED=0

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift ;;
    --org) FILTER_ORG="$2"; shift 2 ;;
    --max) MAX_REPOS="$2"; shift 2 ;;
    --parallel) PARALLEL="$2"; shift 2 ;;
    *) echo "Unknown: $1"; exit 1 ;;
  esac
done

echo "╔════════════════════════════════════════════╗"
echo "║  BlackRoad CI — Deploy to All Repos        ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check if CI workflow exists
if [ ! -f "$CI_WORKFLOW" ]; then
  echo "ERROR: CI workflow not found at $CI_WORKFLOW"
  exit 1
fi

# Check auth — try GitHub App first, fall back to gh auth
generate_app_token() {
  local org=$1
  if [ -f "${APP_CREDS_DIR}/app-id.txt" ] && [ -f "${APP_CREDS_DIR}/private-key.pem" ]; then
    local APP_ID=$(cat "${APP_CREDS_DIR}/app-id.txt")
    local PEM=$(cat "${APP_CREDS_DIR}/private-key.pem")

    # Generate JWT
    local NOW=$(date +%s)
    local IAT=$((NOW - 60))
    local EXP=$((NOW + 600))
    local HEADER=$(echo -n '{"alg":"RS256","typ":"JWT"}' | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')
    local PAYLOAD=$(echo -n "{\"iat\":${IAT},\"exp\":${EXP},\"iss\":\"${APP_ID}\"}" | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')
    local SIGNATURE=$(echo -n "${HEADER}.${PAYLOAD}" | openssl dgst -sha256 -sign "${APP_CREDS_DIR}/private-key.pem" | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')
    local JWT="${HEADER}.${PAYLOAD}.${SIGNATURE}"

    # Get installation ID for this org
    local INSTALL_ID=$(curl -s -H "Authorization: Bearer ${JWT}" -H "Accept: application/vnd.github+json" \
      "https://api.github.com/app/installations" 2>/dev/null | \
      python3 -c "import sys,json;d=json.load(sys.stdin);print(next((i['id'] for i in d if i.get('account',{}).get('login')=='${org}'),''))" 2>/dev/null)

    if [ -n "$INSTALL_ID" ] && [ "$INSTALL_ID" != "" ]; then
      # Get installation access token
      local TOKEN=$(curl -s -X POST -H "Authorization: Bearer ${JWT}" -H "Accept: application/vnd.github+json" \
        "https://api.github.com/app/installations/${INSTALL_ID}/access_tokens" 2>/dev/null | \
        python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))" 2>/dev/null)

      if [ -n "$TOKEN" ] && [ "$TOKEN" != "" ]; then
        echo "$TOKEN"
        return 0
      fi
    fi
  fi
  return 1
}

# Deploy to a single repo
deploy_to_repo() {
  local repo=$1
  local token=$2
  local tmpdir=$(mktemp -d)

  # Check if repo has a default branch
  local default_branch
  if [ -n "$token" ]; then
    default_branch=$(curl -s -H "Authorization: token ${token}" \
      "https://api.github.com/repos/${repo}" 2>/dev/null | \
      python3 -c "import sys,json;print(json.load(sys.stdin).get('default_branch','main'))" 2>/dev/null)
  else
    default_branch=$(gh api "repos/${repo}" -q '.default_branch' 2>/dev/null || echo "main")
  fi
  [ -z "$default_branch" ] && default_branch="main"

  if [ "$DRY_RUN" = true ]; then
    echo "  [DRY RUN] Would deploy to ${repo} (branch: ${default_branch})"
    DEPLOYED=$((DEPLOYED+1))
    return 0
  fi

  # Clone (shallow)
  local clone_url
  if [ -n "$token" ]; then
    clone_url="https://x-access-token:${token}@github.com/${repo}.git"
  else
    clone_url="https://github.com/${repo}.git"
  fi

  if ! git clone --depth 1 --branch "$default_branch" "$clone_url" "${tmpdir}/repo" 2>/dev/null; then
    echo "  SKIP: Cannot clone ${repo}"
    SKIPPED=$((SKIPPED+1))
    rm -rf "$tmpdir"
    return 0
  fi

  cd "${tmpdir}/repo"
  mkdir -p .github/workflows

  # Copy CI workflow
  cp "$CI_WORKFLOW" .github/workflows/blackroad-ci.yml

  # Check if there are changes
  git add .github/workflows/blackroad-ci.yml
  if git diff --cached --quiet 2>/dev/null; then
    echo "  OK: ${repo} (already up to date)"
    SKIPPED=$((SKIPPED+1))
  else
    git config user.name "blackroad-ci[bot]"
    git config user.email "bot@blackroad.io"
    git commit -m "ci: add BlackRoad CI workflow

Auto-detect stack, syntax check, job summary.
Deployed by BlackRoad CI App." 2>/dev/null

    if git push 2>/dev/null; then
      echo "  DEPLOYED: ${repo}"
      DEPLOYED=$((DEPLOYED+1))
    else
      echo "  FAILED: ${repo} (push rejected)"
      FAILED=$((FAILED+1))
    fi
  fi

  cd /
  rm -rf "$tmpdir"
}

# Main loop
TOTAL_REPOS=0
for org in "${ORGS[@]}"; do
  if [ -n "$FILTER_ORG" ] && [ "$org" != "$FILTER_ORG" ]; then
    continue
  fi

  echo ""
  echo "── ${org} ──"

  # Generate token for this org
  TOKEN=""
  TOKEN=$(generate_app_token "$org" 2>/dev/null) || true

  if [ -z "$TOKEN" ]; then
    echo "  (using gh CLI auth)"
  else
    echo "  (using GitHub App token)"
  fi

  # List repos
  REPOS=""
  if [ -n "$TOKEN" ]; then
    REPOS=$(curl -s -H "Authorization: token ${TOKEN}" -H "Accept: application/vnd.github+json" \
      "https://api.github.com/orgs/${org}/repos?per_page=100&type=all" 2>/dev/null | \
      python3 -c "
import sys, json
repos = json.load(sys.stdin)
if isinstance(repos, list):
    for r in repos:
        if not r.get('archived'):
            print(r['full_name'])
" 2>/dev/null)

    # Handle pagination
    PAGE=2
    while true; do
      MORE=$(curl -s -H "Authorization: token ${TOKEN}" -H "Accept: application/vnd.github+json" \
        "https://api.github.com/orgs/${org}/repos?per_page=100&page=${PAGE}&type=all" 2>/dev/null | \
        python3 -c "
import sys, json
repos = json.load(sys.stdin)
if isinstance(repos, list) and len(repos) > 0:
    for r in repos:
        if not r.get('archived'):
            print(r['full_name'])
else:
    pass
" 2>/dev/null)
      [ -z "$MORE" ] && break
      REPOS="${REPOS}
${MORE}"
      PAGE=$((PAGE+1))
      [ $PAGE -gt 20 ] && break
    done
  else
    REPOS=$(gh api --paginate "orgs/${org}/repos?per_page=100" -q '.[] | select(.archived != true) | .full_name' 2>/dev/null)
  fi

  REPO_COUNT=$(echo "$REPOS" | grep -c . 2>/dev/null || echo 0)
  echo "  Found ${REPO_COUNT} repos"

  # Deploy to each repo
  while IFS= read -r repo; do
    [ -z "$repo" ] && continue
    TOTAL_REPOS=$((TOTAL_REPOS+1))

    if [ "$MAX_REPOS" -gt 0 ] && [ "$TOTAL_REPOS" -gt "$MAX_REPOS" ]; then
      echo "  Reached --max ${MAX_REPOS}, stopping"
      break 2
    fi

    deploy_to_repo "$repo" "$TOKEN"
  done <<< "$REPOS"
done

echo ""
echo "════════════════════════════════════════════"
echo "  Deployed: ${DEPLOYED}  Skipped: ${SKIPPED}  Failed: ${FAILED}"
echo "  Total repos processed: ${TOTAL_REPOS}"
[ "$DRY_RUN" = true ] && echo "  (DRY RUN — no actual changes made)"
echo "════════════════════════════════════════════"
