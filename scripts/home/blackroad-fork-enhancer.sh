#!/bin/bash
# BlackRoad Fork Enhancer v2
# Adds BlackRoad integration layer to forked repos WITHOUT breaking upstream
# Uses GitHub API (no cloning needed)
#
# Usage: ./blackroad-fork-enhancer.sh [org/user] [--dry-run]

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
YELLOW='\033[1;33m'
CYAN='\033[38;5;69m'
RED='\033[0;31m'
NC='\033[0m'

ORG="${1:-blackboxprogramming}"
DRY_RUN="${2:---execute}"
ENHANCED=0
SKIPPED=0
FAILED=0

echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PINK}║${NC}  ${CYAN}BlackRoad Fork Enhancer v2${NC}                              ${PINK}║${NC}"
echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
echo -e "  ${CYAN}Target:${NC} $ORG"
echo -e "  ${CYAN}Mode:${NC}   $DRY_RUN"
echo ""

# Get all forked repos
FORKS=$(gh repo list "$ORG" --fork --limit 100 --json name -q '.[].name' 2>/dev/null)
TOTAL=$(echo "$FORKS" | wc -l | tr -d ' ')
echo -e "${GREEN}Found $TOTAL forks${NC}"
echo ""

# Content templates
INTEGRATION_README='# BlackRoad Integration

This is a fork maintained by [BlackRoad OS, Inc.](https://blackroad.io) for integration with the BlackRoad ecosystem.

## What We Added

- `.blackroad/` directory with integration configs
- BlackRoad CI/CD workflow
- Integration documentation

## Upstream

This repo tracks the upstream project. BlackRoad additions live exclusively in `.blackroad/` and `.github/workflows/blackroad-ci.yml` to avoid merge conflicts.

## Links

- [BlackRoad OS](https://blackroad.io)
- [Documentation](https://docs.blackroad.io)
- [GitHub](https://github.com/blackboxprogramming)

---
© 2025-2026 BlackRoad OS, Inc. All rights reserved.
BlackRoad OS — Pave Tomorrow.
'

INTEGRATION_CONFIG='{
  "name": "REPO_NAME",
  "type": "fork",
  "org": "ORG_NAME",
  "integration": {
    "status": "active",
    "added": "DATE_NOW",
    "version": "1.0.0"
  },
  "upstream": {
    "synced": true,
    "branch": "main"
  },
  "blackroad": {
    "category": "CATEGORY",
    "tags": [],
    "fleet_node": null,
    "docs": "https://docs.blackroad.io"
  }
}'

CI_WORKFLOW='name: BlackRoad CI
on:
  push:
    branches: [main, master]
    paths:
      - ".blackroad/**"
  pull_request:
    branches: [main, master]
    paths:
      - ".blackroad/**"

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate integration config
        run: |
          if [ -f .blackroad/config.json ]; then
            python3 -c "import json; json.load(open('"'"'.blackroad/config.json'"'"'))" && echo "Config valid" || echo "Config invalid"
          fi
      - name: Check integration README
        run: test -f .blackroad/README.md && echo "README present" || echo "README missing"
'

# Categorize repo
categorize() {
  local name="$1"
  case "$name" in
    pixel-*|isometric-*|tiny-world|SanAndreasUnity|GameBoyWorlds|OpenViking|OpenSandbox|NotBlox|bit-office|superpowers|openclaw)
      echo "game" ;;
    *agent*|*claude*|*squad*|BitNet|sgpt|rowboat|hindsight|skills|lucidia-*)
      echo "ai" ;;
    pi-*|awesome-sysadmin|awesome-selfhosted*|awesome-raspberry*|hailo*|nginx*|ish|git|git.*)
      echo "infrastructure" ;;
    algorithm*|the-book-*|PDF4QT|A2UI|system-prompts*|htmldocs|clerk-docs|alfred-*|alexa-*)
      echo "reference" ;;
    *)
      echo "general" ;;
  esac
}

# Process each fork
COUNT=0
for REPO in $FORKS; do
  COUNT=$((COUNT + 1))
  echo -e "${CYAN}[$COUNT/$TOTAL]${NC} $REPO"

  # Check if already enhanced
  EXISTS=$(gh api "repos/$ORG/$REPO/contents/.blackroad/config.json" 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print('yes' if 'name' in d else 'no')" 2>/dev/null || echo "no")

  if [ "$EXISTS" = "yes" ]; then
    echo -e "  ${YELLOW}Already enhanced — skipping${NC}"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  # Get default branch
  DEFAULT_BRANCH=$(gh repo view "$ORG/$REPO" --json defaultBranchRef -q '.defaultBranchRef.name' 2>/dev/null || echo "main")
  CATEGORY=$(categorize "$REPO")
  NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  # Build config
  CONFIG=$(echo "$INTEGRATION_CONFIG" | sed "s/REPO_NAME/$REPO/g; s/ORG_NAME/$ORG/g; s/DATE_NOW/$NOW/g; s/CATEGORY/$CATEGORY/g")

  if [ "$DRY_RUN" = "--dry-run" ]; then
    echo -e "  ${YELLOW}[DRY RUN] Would add .blackroad/ to $ORG/$REPO ($CATEGORY)${NC}"
    continue
  fi

  # Add files via GitHub API (no clone needed)
  # 1. .blackroad/README.md
  README_B64=$(echo "$INTEGRATION_README" | base64 | tr -d '\n')
  gh api -X PUT "repos/$ORG/$REPO/contents/.blackroad/README.md" \
    -f message="chore: add BlackRoad integration layer" \
    -f content="$README_B64" \
    -f branch="$DEFAULT_BRANCH" \
    --silent 2>/dev/null

  if [ $? -ne 0 ]; then
    echo -e "  ${RED}Failed to add README${NC}"
    FAILED=$((FAILED + 1))
    continue
  fi

  # 2. .blackroad/config.json
  CONFIG_B64=$(echo "$CONFIG" | base64 | tr -d '\n')
  gh api -X PUT "repos/$ORG/$REPO/contents/.blackroad/config.json" \
    -f message="chore: add BlackRoad integration config" \
    -f content="$CONFIG_B64" \
    -f branch="$DEFAULT_BRANCH" \
    --silent 2>/dev/null

  # 3. .github/workflows/blackroad-ci.yml
  CI_B64=$(echo "$CI_WORKFLOW" | base64 | tr -d '\n')
  gh api -X PUT "repos/$ORG/$REPO/contents/.github/workflows/blackroad-ci.yml" \
    -f message="ci: add BlackRoad CI workflow" \
    -f content="$CI_B64" \
    -f branch="$DEFAULT_BRANCH" \
    --silent 2>/dev/null

  # 4. Update description to include BlackRoad
  CURRENT_DESC=$(gh repo view "$ORG/$REPO" --json description -q '.description' 2>/dev/null)
  if [[ ! "$CURRENT_DESC" == *"BlackRoad"* ]] && [[ ! "$CURRENT_DESC" == *"fork"* ]]; then
    NEW_DESC="${CURRENT_DESC} (BlackRoad integration)"
    gh repo edit "$ORG/$REPO" --description "$NEW_DESC" 2>/dev/null || true
  fi

  # 5. Add topics
  gh repo edit "$ORG/$REPO" --add-topic "blackroad" --add-topic "blackroad-fork" --add-topic "$CATEGORY" 2>/dev/null || true

  echo -e "  ${GREEN}Enhanced ($CATEGORY)${NC}"
  ENHANCED=$((ENHANCED + 1))

  # Rate limit: 1 per 2 seconds to avoid GitHub abuse
  sleep 2
done

echo ""
echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PINK}║${NC}  ${GREEN}Done!${NC}                                                    ${PINK}║${NC}"
echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
echo -e "  ${GREEN}Enhanced:${NC} $ENHANCED"
echo -e "  ${YELLOW}Skipped:${NC}  $SKIPPED"
echo -e "  ${RED}Failed:${NC}   $FAILED"
echo -e "  ${CYAN}Total:${NC}    $TOTAL"
