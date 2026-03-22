#!/usr/bin/env bash
# Analyze code statistics for projects
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"
PROJECT_NAME=$(basename "$PROJECT_DIR")

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}        📊 CODE STATS: $PROJECT_NAME"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Lines of code
echo -e "${YELLOW}[CODE METRICS]${NC}"
TOTAL_FILES=$(find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | wc -l | xargs)
JS_FILES=$(find . -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | xargs)
PY_FILES=$(find . -name "*.py" 2>/dev/null | wc -l | xargs)

echo "  📄 Total files: $TOTAL_FILES"
echo "  🟨 JS/TS files: $JS_FILES"
echo "  🐍 Python files: $PY_FILES"

if command -v cloc >/dev/null 2>&1; then
  echo ""
  cloc . --quiet 2>/dev/null | tail -10
else
  TOTAL_LINES=$(find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')
  echo "  📝 Total lines: ~$TOTAL_LINES"
fi

# Git stats
echo ""
echo -e "${YELLOW}[GIT STATS]${NC}"
COMMITS=$(git rev-list --count HEAD 2>/dev/null || echo "0")
CONTRIBUTORS=$(git shortlog -sn --all 2>/dev/null | wc -l | xargs)
BRANCHES=$(git branch -a 2>/dev/null | wc -l | xargs)

echo "  📦 Commits: $COMMITS"
echo "  👥 Contributors: $CONTRIBUTORS"
echo "  �� Branches: $BRANCHES"

# Recent activity
echo ""
echo -e "${YELLOW}[RECENT ACTIVITY]${NC}"
git log -5 --format="  %Cgreen✓%Creset %h - %s (%ar)" 2>/dev/null || echo "  No commits yet"

# Dependencies
echo ""
echo -e "${YELLOW}[DEPENDENCIES]${NC}"
if [[ -f package.json ]]; then
  DEPS=$(jq -r '.dependencies | length' package.json 2>/dev/null || echo "0")
  DEV_DEPS=$(jq -r '.devDependencies | length' package.json 2>/dev/null || echo "0")
  echo "  📦 Dependencies: $DEPS"
  echo "  🔧 Dev Dependencies: $DEV_DEPS"
fi

if [[ -f requirements.txt ]]; then
  PY_DEPS=$(cat requirements.txt | grep -v "^#" | grep -v "^$" | wc -l | xargs)
  echo "  🐍 Python packages: $PY_DEPS"
fi

echo ""
echo -e "${GREEN}✅ Analysis complete!${NC}"
