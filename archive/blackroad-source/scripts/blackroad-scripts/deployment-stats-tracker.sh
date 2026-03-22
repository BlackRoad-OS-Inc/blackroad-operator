#!/usr/bin/env bash
# Track deployment statistics
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}       📈 DEPLOYMENT STATISTICS 📈                    ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

if [[ ! -f ~/.codex/memory/webhook-logs/deployments.log ]]; then
  echo "No deployment logs found yet!"
  exit 0
fi

TOTAL_DEPLOYS=$(grep -c "🚀" ~/.codex/memory/webhook-logs/deployments.log)
UNIQUE_PROJECTS=$(grep "🚀" ~/.codex/memory/webhook-logs/deployments.log | awk '{print $3}' | sort -u | wc -l | xargs)

echo -e "${YELLOW}[OVERALL STATS]${NC}"
echo "  🚀 Total Deployments: $TOTAL_DEPLOYS"
echo "  📦 Unique Projects: $UNIQUE_PROJECTS"
echo ""

echo -e "${YELLOW}[TOP PROJECTS]${NC}"
grep "🚀" ~/.codex/memory/webhook-logs/deployments.log | awk '{print $3}' | sort | uniq -c | sort -rn | head -10 | while read count name; do
  echo "  $name: $count deployments"
done
echo ""

echo -e "${YELLOW}[RECENT DEPLOYMENTS]${NC}"
tail -20 ~/.codex/memory/webhook-logs/deployments.log | grep -A 3 "🚀" | head -12
echo ""

echo -e "${YELLOW}[TODAY'S ACTIVITY]${NC}"
TODAY=$(date '+%Y-%m-%d')
TODAY_DEPLOYS=$(grep "$TODAY" ~/.codex/memory/webhook-logs/deployments.log | grep -c "🚀" || echo "0")
echo "  📅 Deployments today: $TODAY_DEPLOYS"
