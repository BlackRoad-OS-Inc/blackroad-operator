#!/usr/bin/env bash
# Analyze project performance
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}        ⚡ PERFORMANCE ANALYSIS ⚡                    ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Repository size
echo -e "${YELLOW}[REPOSITORY SIZE]${NC}"
REPO_SIZE=$(du -sh . 2>/dev/null | awk '{print $1}')
GIT_SIZE=$(du -sh .git 2>/dev/null | awk '{print $1}')
echo "  📦 Total size: $REPO_SIZE"
echo "  🗄️  Git history: $GIT_SIZE"

# File analysis
echo ""
echo -e "${YELLOW}[FILE ANALYSIS]${NC}"
TOTAL_FILES=$(find . -type f -not -path "*/.git/*" -not -path "*/node_modules/*" 2>/dev/null | wc -l | xargs)
LARGE_FILES=$(find . -type f -size +1M -not -path "*/.git/*" -not -path "*/node_modules/*" 2>/dev/null | wc -l | xargs)
echo "  📄 Total files: $TOTAL_FILES"
echo "  📊 Large files (>1MB): $LARGE_FILES"

if [[ $LARGE_FILES -gt 0 ]]; then
  echo ""
  echo "  Largest files:"
  find . -type f -not -path "*/.git/*" -not -path "*/node_modules/*" -exec ls -lh {} + 2>/dev/null | sort -k5 -hr | head -5 | awk '{print "    " $9 " (" $5 ")"}'
fi

# Git performance
echo ""
echo -e "${YELLOW}[GIT PERFORMANCE]${NC}"
COMMIT_COUNT=$(git rev-list --count HEAD 2>/dev/null || echo "0")
BRANCH_COUNT=$(git branch -a 2>/dev/null | wc -l | xargs)
echo "  📦 Commits: $COMMIT_COUNT"
echo "  🌿 Branches: $BRANCH_COUNT"

# Dependencies size (if node_modules exists)
if [[ -d node_modules ]]; then
  echo ""
  echo -e "${YELLOW}[DEPENDENCIES]${NC}"
  NODE_SIZE=$(du -sh node_modules 2>/dev/null | awk '{print $1}')
  echo "  📦 node_modules size: $NODE_SIZE"
fi

echo ""
echo -e "${GREEN}✅ Performance analysis complete!${NC}"

# Recommendations
echo ""
echo -e "${YELLOW}[RECOMMENDATIONS]${NC}"
if [[ $LARGE_FILES -gt 5 ]]; then
  echo "  ⚠ Consider using Git LFS for large files"
fi
if [[ $BRANCH_COUNT -gt 20 ]]; then
  echo "  ⚠ Consider cleaning up old branches"
fi
