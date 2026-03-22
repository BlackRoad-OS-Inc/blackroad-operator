#!/bin/bash
# ============================================================================
# BLACKROAD OS — Mass Repository Enhancement Pipeline
# Enhances ALL repos across all orgs via GitHub API (no cloning needed)
# Usage: ./enhance-all-repos.sh [org] [--dry-run]
# ============================================================================

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
RED='\033[38;5;196m'
RESET='\033[0m'

DRY_RUN=false
TARGET_ORG="${1:-all}"
[[ "$2" == "--dry-run" || "$1" == "--dry-run" ]] && DRY_RUN=true

ORGS=(
  blackboxprogramming
  BlackRoad-OS-Inc
  BlackRoad-OS
  BlackRoad-AI
  BlackRoad-Labs
  BlackRoad-Cloud
  BlackRoad-Ventures
  BlackRoad-Foundation
  BlackRoad-Media
  BlackRoad-Hardware
  BlackRoad-Education
  BlackRoad-Gov
  BlackRoad-Security
  BlackRoad-Interactive
  BlackRoad-Archive
  BlackRoad-Studio
  Blackbox-Enterprises
)

ENHANCED=0
SKIPPED=0
FAILED=0
TOTAL=0

# ── Enhancement checks ──
check_repo() {
  local org="$1" repo="$2"
  local needs_work=()

  # Check if repo has content (not empty)
  local default_branch
  default_branch=$(gh api "repos/$org/$repo" --jq '.default_branch' 2>/dev/null)
  if [ -z "$default_branch" ]; then
    echo "  ${RED}SKIP${RESET} $org/$repo — no default branch"
    ((SKIPPED++))
    return
  fi

  # Check for README
  local has_readme
  has_readme=$(gh api "repos/$org/$repo/contents/README.md" --jq '.name' 2>/dev/null || echo "")
  [ -z "$has_readme" ] && needs_work+=("README.md")

  # Check for LICENSE
  local has_license
  has_license=$(gh api "repos/$org/$repo/contents/LICENSE" --jq '.name' 2>/dev/null || echo "")
  [ -z "$has_license" ] && needs_work+=("LICENSE")

  # Check for .gitignore
  local has_gitignore
  has_gitignore=$(gh api "repos/$org/$repo/contents/.gitignore" --jq '.name' 2>/dev/null || echo "")
  [ -z "$has_gitignore" ] && needs_work+=(".gitignore")

  # Check description
  local desc
  desc=$(gh api "repos/$org/$repo" --jq '.description // ""' 2>/dev/null)
  [ -z "$desc" ] && needs_work+=("description")

  # Check topics
  local topics
  topics=$(gh api "repos/$org/$repo/topics" --jq '.names | length' 2>/dev/null || echo "0")
  [ "$topics" -eq 0 ] 2>/dev/null && needs_work+=("topics")

  if [ ${#needs_work[@]} -eq 0 ]; then
    ((SKIPPED++))
    return
  fi

  echo -e "  ${AMBER}ENHANCE${RESET} $org/$repo — missing: ${needs_work[*]}"

  if [ "$DRY_RUN" = true ]; then
    ((ENHANCED++))
    return
  fi

  # Apply enhancements
  for item in "${needs_work[@]}"; do
    case "$item" in
      "description")
        # Auto-generate description from repo name
        local auto_desc="BlackRoad OS — ${repo//-/ }"
        gh api -X PATCH "repos/$org/$repo" -f description="$auto_desc" >/dev/null 2>&1 && \
          echo -e "    ${GREEN}✓${RESET} Set description" || \
          echo -e "    ${RED}✗${RESET} Failed to set description"
        ;;
      "topics")
        gh api -X PUT "repos/$org/$repo/topics" \
          --input - <<< '{"names":["blackroad-os","edge-ai","local-ai"]}' >/dev/null 2>&1 && \
          echo -e "    ${GREEN}✓${RESET} Added topics" || \
          echo -e "    ${RED}✗${RESET} Failed to add topics"
        ;;
      "LICENSE")
        local license_content
        license_content=$(printf 'Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.\n\nThis software is proprietary and confidential.\nUnauthorized copying, distribution, or use is strictly prohibited.\n')
        echo "$license_content" | gh api -X PUT "repos/$org/$repo/contents/LICENSE" \
          -f message="Add proprietary license" \
          -f content="$(echo "$license_content" | base64)" \
          --input /dev/stdin >/dev/null 2>&1 && \
          echo -e "    ${GREEN}✓${RESET} Added LICENSE" || \
          echo -e "    ${RED}✗${RESET} Failed to add LICENSE"
        ;;
    esac
    # Rate limit protection
    sleep 0.5
  done

  ((ENHANCED++))
}

# ── Main ──
echo -e "${PINK}╔════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║  BLACKROAD REPO ENHANCEMENT PIPELINE  ║${RESET}"
echo -e "${PINK}╚════════════════════════════════════════╝${RESET}"
echo ""
[ "$DRY_RUN" = true ] && echo -e "${AMBER}DRY RUN MODE — no changes will be made${RESET}"
echo ""

for org in "${ORGS[@]}"; do
  [ "$TARGET_ORG" != "all" ] && [ "$TARGET_ORG" != "$org" ] && continue

  echo -e "${BLUE}━━━ $org ━━━${RESET}"

  # Get all repos for this org
  repos=$(gh repo list "$org" --limit 500 --json name,isFork,isArchived --jq '.[] | select(.isArchived == false and .isFork == false) | .name' 2>/dev/null)

  while IFS= read -r repo; do
    [ -z "$repo" ] && continue
    ((TOTAL++))
    check_repo "$org" "$repo"
  done <<< "$repos"

  echo ""
done

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "Total: $TOTAL | Enhanced: ${GREEN}$ENHANCED${RESET} | Skipped: $SKIPPED | Failed: ${RED}$FAILED${RESET}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
