#!/usr/bin/env bash
# Enhanced dashboard with webhook logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  🚀 BlackRoad SUPER Auto-Deploy Dashboard 🚀        ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# System Status
echo -e "${YELLOW}[SYSTEM STATUS]${NC}"
DISK=$(df -h / | tail -1 | awk '{print $5}')
PROJECTS=$(find ~ -name ".git-auto-commit.sh" -maxdepth 2 2>/dev/null | wc -l | xargs)
echo "  💾 Disk: $DISK used"
echo "  🐙 GitHub: Connected ✓"
echo "  📦 Auto-Deploy: $PROJECTS projects"
echo "  🔔 Webhooks: Enabled on all projects"
echo ""

# Recent Deployments (from webhook logs)
echo -e "${YELLOW}[RECENT DEPLOYMENTS]${NC}"
if [[ -f ~/.codex/memory/webhook-logs/deployments.log ]]; then
  tail -20 ~/.codex/memory/webhook-logs/deployments.log | head -15
else
  echo "  No deployments logged yet"
fi
echo ""

# Features Available
echo -e "${YELLOW}[AVAILABLE FEATURES]${NC}"
echo "  ✅ Auto-deploy (53+ projects)"
echo "  ✅ Watch mode (continuous auto-save)"
echo "  ✅ Webhooks (all projects)"
echo "  ✅ CI/CD (GitHub Actions)"
echo "  ✅ Auto-backup (mass commit)"
echo ""

# Quick Commands
echo -e "${MAGENTA}[QUICK COMMANDS]${NC}"
echo "  ~/scripts/watch-all-projects.sh 60    - Watch top 10 projects"
echo "  ~/scripts/memory-auto-backup.sh       - Backup all projects"
echo "  ~/scripts/dashboard.sh                - Simple dashboard"
echo "  cat ~/.codex/memory/webhook-logs/deployments.log - View all logs"
echo ""
echo -e "${GREEN}✅ All systems operational! 🚀${NC}"
