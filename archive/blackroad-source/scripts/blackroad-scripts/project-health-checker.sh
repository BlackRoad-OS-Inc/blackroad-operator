#!/usr/bin/env bash
# Check health of all projects
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}        🏥 PROJECT HEALTH CHECK 🏥                    ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

HEALTHY=0
ISSUES=0

find ~ -name ".git-auto-commit.sh" -maxdepth 2 2>/dev/null | head -20 | while read script; do
  PROJECT_DIR=$(dirname "$script")
  PROJECT_NAME=$(basename "$PROJECT_DIR")
  
  cd "$PROJECT_DIR" 2>/dev/null || continue
  
  # Check git status
  HAS_REMOTE=$(git remote get-url origin 2>/dev/null && echo "yes" || echo "no")
  UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l | xargs)
  HAS_README=$(test -f README.md && echo "yes" || echo "no")
  HAS_CI=$(test -d .github/workflows && echo "yes" || echo "no")
  
  # Health score
  HEALTH=0
  [[ "$HAS_REMOTE" == "yes" ]] && ((HEALTH++))
  [[ "$UNCOMMITTED" == "0" ]] && ((HEALTH++))
  [[ "$HAS_README" == "yes" ]] && ((HEALTH++))
  [[ "$HAS_CI" == "yes" ]] && ((HEALTH++))
  
  if [[ $HEALTH -ge 3 ]]; then
    echo -e "  ${GREEN}✓${NC} $PROJECT_NAME (Score: $HEALTH/4)"
    ((HEALTHY++))
  else
    echo -e "  ${YELLOW}⚠${NC} $PROJECT_NAME (Score: $HEALTH/4)"
    [[ "$HAS_REMOTE" == "no" ]] && echo "    - No remote configured"
    [[ "$UNCOMMITTED" != "0" ]] && echo "    - $UNCOMMITTED uncommitted files"
    [[ "$HAS_README" == "no" ]] && echo "    - No README.md"
    [[ "$HAS_CI" == "no" ]] && echo "    - No CI/CD"
    ((ISSUES++))
  fi
done

echo ""
echo -e "${GREEN}Healthy: $HEALTHY${NC} | ${YELLOW}Issues: $ISSUES${NC}"
