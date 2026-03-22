#!/usr/bin/env bash
# Code quality scoring system
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"
PROJECT_NAME=$(basename "$PROJECT_DIR")

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        📊 CODE QUALITY SCORE: $PROJECT_NAME"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

SCORE=0
MAX_SCORE=100

# Documentation (20 points)
echo -e "${YELLOW}[DOCUMENTATION] (20 points)${NC}"
DOCS=0
[[ -f README.md ]] && ((DOCS+=10)) && echo "  ✓ README.md (+10)"
[[ -f LICENSE ]] && ((DOCS+=5)) && echo "  ✓ LICENSE (+5)"
[[ -f CONTRIBUTING.md ]] && ((DOCS+=5)) && echo "  ✓ CONTRIBUTING.md (+5)"
echo "  Score: $DOCS/20"
SCORE=$((SCORE + DOCS))

# Git Health (20 points)
echo ""
echo -e "${YELLOW}[GIT HEALTH] (20 points)${NC}"
GIT=0
[[ -f .gitignore ]] && ((GIT+=5)) && echo "  ✓ .gitignore (+5)"
RECENT=$(git log --since="30 days ago" --oneline 2>/dev/null | wc -l | xargs)
[[ $RECENT -gt 0 ]] && ((GIT+=10)) && echo "  ✓ Active development (+10)"
BRANCHES=$(git branch -r 2>/dev/null | wc -l | xargs)
[[ $BRANCHES -gt 1 ]] && ((GIT+=5)) && echo "  ✓ Multiple branches (+5)"
echo "  Score: $GIT/20"
SCORE=$((SCORE + GIT))

# Testing (20 points)
echo ""
echo -e "${YELLOW}[TESTING] (20 points)${NC}"
TEST=0
if [[ -f package.json ]]; then
  grep -q "\"test\":" package.json && ((TEST+=10)) && echo "  ✓ Test script defined (+10)"
  [[ -d __tests__ || -d test || -d tests ]] && ((TEST+=10)) && echo "  ✓ Test directory exists (+10)"
fi
echo "  Score: $TEST/20"
SCORE=$((SCORE + TEST))

# CI/CD (20 points)
echo ""
echo -e "${YELLOW}[CI/CD] (20 points)${NC}"
CI=0
[[ -d .github/workflows ]] && ((CI+=20)) && echo "  ✓ GitHub Actions (+20)"
[[ -f .gitlab-ci.yml ]] && ((CI+=20)) && echo "  ✓ GitLab CI (+20)"
[[ -f .travis.yml ]] && ((CI+=20)) && echo "  ✓ Travis CI (+20)"
[[ $CI -gt 20 ]] && CI=20
echo "  Score: $CI/20"
SCORE=$((SCORE + CI))

# Code Organization (20 points)
echo ""
echo -e "${YELLOW}[CODE ORGANIZATION] (20 points)${NC}"
ORG=0
[[ -f package.json || -f requirements.txt || -f go.mod ]] && ((ORG+=10)) && echo "  ✓ Dependency management (+10)"
[[ -d src || -d lib ]] && ((ORG+=5)) && echo "  ✓ Organized structure (+5)"
[[ -f .editorconfig || -f .prettierrc ]] && ((ORG+=5)) && echo "  ✓ Code formatting (+5)"
echo "  Score: $ORG/20"
SCORE=$((SCORE + ORG))

# Final Score
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"

if [[ $SCORE -ge 80 ]]; then
  echo -e "  ${GREEN}🏆 FINAL SCORE: $SCORE/$MAX_SCORE${NC} - EXCELLENT!"
elif [[ $SCORE -ge 60 ]]; then
  echo -e "  ${YELLOW}⭐ FINAL SCORE: $SCORE/$MAX_SCORE${NC} - GOOD"
elif [[ $SCORE -ge 40 ]]; then
  echo -e "  ${YELLOW}📊 FINAL SCORE: $SCORE/$MAX_SCORE${NC} - NEEDS WORK"
else
  echo -e "  ${RED}⚠️  FINAL SCORE: $SCORE/$MAX_SCORE${NC} - CRITICAL"
fi

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"

# Save score
mkdir -p ~/.codex/memory/quality-scores
echo "$SCORE" > ~/.codex/memory/quality-scores/$(basename $PROJECT_DIR).txt
