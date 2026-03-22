#!/usr/bin/env bash
# Comprehensive project insights
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"
PROJECT_NAME=$(basename "$PROJECT_DIR")

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}     📊 PROJECT INSIGHTS: $PROJECT_NAME"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Quick Stats
echo -e "${CYAN}[QUICK STATS]${NC}"
echo "  📦 Project: $PROJECT_NAME"
echo "  📍 Path: $PROJECT_DIR"
echo "  ⏰ Time: $(date '+%Y-%m-%d %H:%M')"
echo ""

# Activity
COMMITS=$(git rev-list --count HEAD 2>/dev/null || echo "0")
RECENT=$(git log --since="7 days ago" --oneline 2>/dev/null | wc -l | xargs)
echo -e "${CYAN}[ACTIVITY]${NC}"
echo "  📊 Total commits: $COMMITS"
echo "  🔥 Last 7 days: $RECENT commits"
echo ""

# Contributors
echo -e "${CYAN}[CONTRIBUTORS]${NC}"
git shortlog -sn HEAD 2>/dev/null | head -5 | while read count author; do
  echo "  👤 $author: $count commits"
done
echo ""

# Recent Activity
echo -e "${CYAN}[RECENT COMMITS]${NC}"
git log --oneline --decorate -5 2>/dev/null | while read line; do
  echo "  📝 $line"
done
echo ""

# File Stats
FILES=$(find . -type f -not -path "*/.git/*" -not -path "*/node_modules/*" 2>/dev/null | wc -l | xargs)
SIZE=$(du -sh . 2>/dev/null | awk '{print $1}')
echo -e "${CYAN}[FILE STATS]${NC}"
echo "  📄 Files: $FILES"
echo "  💾 Size: $SIZE"
echo ""

# Health Indicators
echo -e "${CYAN}[HEALTH INDICATORS]${NC}"
[[ -f README.md ]] && echo "  ✓ Documentation" || echo "  ✗ No README"
[[ -d .github/workflows ]] && echo "  ✓ CI/CD" || echo "  ✗ No CI/CD"
[[ -f .gitignore ]] && echo "  ✓ Git configured" || echo "  ✗ No .gitignore"
[[ $RECENT -gt 0 ]] && echo "  ✓ Recently active" || echo "  ⚠ Inactive"

echo ""
echo -e "${MAGENTA}═══════════════════════════════════════════════════════${NC}"
