#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. — Deploy Autonomous Orchestrator to All Repos
# Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
# ============================================================================
# Usage: ./deploy-autonomous-to-all-repos.sh [--dry-run]
set -euo pipefail

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
DIM='\033[38;5;240m'
RESET='\033[0m'

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

ORG="blackboxprogramming"
TEMPLATE="$HOME/autonomous-orchestrator-template.yml"
DEPLOYED=0; EXISTED=0; FAILED=0

log() { printf "${PINK}[PRISM]${RESET} %s\n" "$*"; }
ok()  { printf "  ${GREEN}✓${RESET} %s\n" "$*"; }
skip(){ printf "  ${AMBER}—${RESET} %s\n" "$*"; }
fail(){ printf "  ${RED}✗${RESET} %s\n" "$*"; }

if [ ! -f "$TEMPLATE" ]; then
  fail "Template not found: $TEMPLATE"
  exit 1
fi

CONTENT=$(base64 -i "$TEMPLATE")

log "BlackRoad Autonomous Orchestrator Deployment"
printf "${DIM}Target: all repos under %s${RESET}\n" "$ORG"
$DRY_RUN && printf "${AMBER}DRY RUN MODE${RESET}\n"
echo ""

REPOS=$(gh repo list "$ORG" --limit 200 --json name,isArchived --jq '.[] | select(.isArchived == false) | .name' 2>/dev/null)

for repo in $REPOS; do
  EXISTS=$(gh api "/repos/${ORG}/${repo}/contents/.github/workflows/autonomous-orchestrator.yml" --jq '.name' 2>/dev/null || echo "")

  if [ -n "$EXISTS" ]; then
    skip "$repo (already has orchestrator)"
    EXISTED=$((EXISTED + 1))
    continue
  fi

  if $DRY_RUN; then
    ok "$repo (would deploy)"
    DEPLOYED=$((DEPLOYED + 1))
    continue
  fi

  RESULT=$(gh api --method PUT "/repos/${ORG}/${repo}/contents/.github/workflows/autonomous-orchestrator.yml" \
    -f message="Add BlackRoad Autonomous Orchestrator" \
    -f content="$CONTENT" \
    --jq '.commit.sha' 2>/dev/null) || RESULT=""

  if [ -n "$RESULT" ]; then
    ok "$repo → ${RESULT:0:7}"
    DEPLOYED=$((DEPLOYED + 1))
  else
    fail "$repo"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
log "Deployment complete"
printf "  ${GREEN}Deployed${RESET}: %d\n" "$DEPLOYED"
printf "  ${AMBER}Existed${RESET}:  %d\n" "$EXISTED"
printf "  ${RED}Failed${RESET}:   %d\n" "$FAILED"
