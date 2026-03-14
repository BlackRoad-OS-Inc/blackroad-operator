#!/bin/bash
# BlackRoad Org Sync — push from BlackRoad-OS-Inc downstream to all orgs
# Usage: org-sync.sh [--dry-run] [--archive-dead] [--update-descriptions]

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
CYAN='\033[38;5;69m'
DIM='\033[2m'
NC='\033[0m'

DRY_RUN=false
ARCHIVE_DEAD=false
UPDATE_DESC=false

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --archive-dead) ARCHIVE_DEAD=true ;;
    --update-descriptions) UPDATE_DESC=true ;;
  esac
done

echo -e "${PINK}BlackRoad Org Sync${NC}"
echo -e "${DIM}Source: BlackRoad-OS-Inc → downstream orgs${NC}"
echo ""

# Org → vertical mapping
declare -A ORG_VERTICAL
ORG_VERTICAL=(
  ["BlackRoad-AI"]="AI models, inference, Lucidia"
  ["BlackRoad-Studio"]="Creator tools: canvas, video, writing"
  ["BlackRoad-Hardware"]="Edge devices, Pi fleet, IoT"
  ["BlackRoad-Security"]="Auth, encryption, compliance"
  ["BlackRoad-Education"]="Learning, tutoring, courses"
  ["BlackRoad-Cloud"]="Cloud infra, K8s, Terraform"
  ["BlackRoad-Labs"]="Research, experiments"
  ["BlackRoad-Media"]="Content, social, streaming"
  ["BlackRoad-Gov"]="Governance, compliance, policy"
  ["BlackRoad-Foundation"]="Public good, community"
  ["BlackRoad-Interactive"]="Gaming, metaverse, 3D"
  ["BlackRoad-Archive"]="Legacy preservation"
  ["BlackRoad-Ventures"]="Business, partnerships"
)

# Count repos per org
echo -e "${CYAN}Org Census${NC}"
for org in "${!ORG_VERTICAL[@]}"; do
  total=$(gh repo list "$org" --limit 300 --json name --jq 'length' 2>/dev/null || echo "?")
  archived=$(gh repo list "$org" --limit 300 --json isArchived --jq '[.[] | select(.isArchived)] | length' 2>/dev/null || echo "?")
  active=$((total - archived))
  echo -e "  ${org}:  ${active} active / ${total} total  — ${ORG_VERTICAL[$org]}"
done

echo ""

# Archive dead repos (mostly .github.io pages and placeholders)
if $ARCHIVE_DEAD; then
  echo -e "${AMBER}Archiving dead repos...${NC}"
  for org in "${!ORG_VERTICAL[@]}"; do
    # Find repos with no commits in 60+ days and < 5 files
    while IFS=$'\t' read -r name pushed; do
      if [ -n "$name" ] && [ "$name" != ".github" ]; then
        if $DRY_RUN; then
          echo -e "  ${DIM}Would archive: $org/$name (last push: $pushed)${NC}"
        else
          gh repo archive "$org/$name" --yes 2>/dev/null && \
            echo -e "  ${GREEN}Archived: $org/$name${NC}" || true
        fi
      fi
    done < <(gh repo list "$org" --limit 100 --json name,pushedAt,isArchived --jq '.[] | select(.isArchived == false) | select(.name | endswith(".github.io") or startswith("blackroad-") and (. != ".github")) | "\(.name)\t\(.pushedAt)"' 2>/dev/null)
  done
fi

# Update descriptions
if $UPDATE_DESC; then
  echo -e "${CYAN}Updating org descriptions...${NC}"
  for org in "${!ORG_VERTICAL[@]}"; do
    # Update .github repo description
    gh repo edit "$org/.github" --description "${ORG_VERTICAL[$org]} — BlackRoad OS, Inc." 2>/dev/null && \
      echo -e "  ${GREEN}Updated: $org/.github${NC}" || true
  done
fi

echo ""
echo -e "${DIM}BlackRoad OS — Pave Tomorrow.${NC}"
