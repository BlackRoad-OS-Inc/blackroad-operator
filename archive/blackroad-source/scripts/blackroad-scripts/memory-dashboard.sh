#!/usr/bin/env bash
# Live dashboard for all auto-deploy projects
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}     🚀 BlackRoad Auto-Deploy Dashboard 🚀           ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# System Status
echo -e "${YELLOW}[SYSTEM STATUS]${NC}"
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}')
echo "  💾 Disk: $DISK_USAGE used"
echo "  🐙 GitHub: $(gh auth status 2>&1 | grep -o 'Logged in.*' | head -1)"
echo "  🌐 Connections: $(cat ~/.codex/memory/connections.json 2>/dev/null | grep -o '"status":"connected"' | wc -l | xargs) active"
echo ""

# Project Stats
echo -e "${YELLOW}[AUTO-DEPLOY PROJECTS]${NC}"
TOTAL_PROJECTS=$(find ~ -name ".git-auto-commit.sh" -maxdepth 2 2>/dev/null | wc -l | xargs)
echo "  📦 Total enabled: $TOTAL_PROJECTS projects"
echo ""

# Recent Activity
echo -e "${YELLOW}[RECENT COMMITS]${NC}"
COUNT=0
while IFS= read -r script && [[ $COUNT -lt 10 ]]; do
  PROJECT_DIR=$(dirname "$script")
  PROJECT_NAME=$(basename "$PROJECT_DIR")
  
  cd "$PROJECT_DIR" 2>/dev/null || continue
  
  # Get last commit
  if LAST_COMMIT=$(git log -1 --format="%h %s" 2>/dev/null); then
    TIME_AGO=$(git log -1 --format="%ar" 2>/dev/null)
    echo -e "  ${GREEN}✓${NC} $PROJECT_NAME"
    echo "    └─ $LAST_COMMIT ($TIME_AGO)"
    ((COUNT++))
  fi
done < <(find ~ -name ".git-auto-commit.sh" -maxdepth 2 2>/dev/null)

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo "  Run: br-help           - Show commands"
echo "  Run: br-help status    - Check connections"
echo "  Run: ~/scripts/memory-auto-backup.sh - Backup all"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
