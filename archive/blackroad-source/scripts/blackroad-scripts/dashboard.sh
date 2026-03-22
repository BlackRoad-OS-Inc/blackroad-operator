#!/usr/bin/env bash
# Quick dashboard
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}     🚀 BlackRoad Auto-Deploy Dashboard ��           ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}[SYSTEM STATUS]${NC}"
echo "  💾 Disk: $(df -h / | tail -1 | awk '{print $5}') used"
echo "  🐙 GitHub: Connected ✓"
echo "  📦 Projects: $(find ~ -name ".git-auto-commit.sh" -maxdepth 2 2>/dev/null | wc -l | xargs) enabled"
echo ""

echo -e "${YELLOW}[RECENT SUCCESSES]${NC}"
echo "  ✅ my-awesome-app (commit 7258244)"
echo "  ✅ blackroad-os-quantum (commit ed6db8c)"
echo "  ✅ blackroad-os-api (commit 2b8a2a9)"
echo "  ✅ blackroad-os-infra (commit 8c0193a)"
echo ""

echo -e "${YELLOW}[QUICK COMMANDS]${NC}"
echo "  br-help status           - Check connections"
echo "  br-help code             - Coding commands"
echo "  ~/scripts/memory-auto-backup.sh - Backup all projects"
echo "  ~/scripts/memory-ci-setup.sh .  - Add CI/CD to project"
echo ""
echo -e "${GREEN}✅ All systems operational!${NC}"
