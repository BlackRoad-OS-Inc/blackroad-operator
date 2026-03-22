#!/usr/bin/env bash
# Live monitoring of all systems
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}      🔴 LIVE MONITORING - PRESS CTRL+C TO STOP      ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

ROUND=1
while true; do
  clear
  echo -e "${BLUE}[Round $ROUND - $(date '+%H:%M:%S')]${NC}"
  echo ""
  
  # Watch mode status
  echo -e "${YELLOW}[WATCH MODE - 4 PROJECTS ACTIVE]${NC}"
  WATCH_COUNT=$(ps aux | grep "memory-watch-mode" | grep -v grep | wc -l | xargs)
  echo "  Active processes: $WATCH_COUNT"
  echo ""
  
  # Recent webhook logs
  echo -e "${YELLOW}[RECENT DEPLOYMENTS]${NC}"
  if [[ -f ~/.codex/memory/webhook-logs/deployments.log ]]; then
    tail -8 ~/.codex/memory/webhook-logs/deployments.log
  else
    echo "  No logs yet"
  fi
  echo ""
  
  # Disk usage
  echo -e "${YELLOW}[SYSTEM]${NC}"
  echo "  Disk: $(df -h / | tail -1 | awk '{print $5}') used"
  echo ""
  
  echo -e "${GREEN}Press Ctrl+C to exit${NC}"
  
  ((ROUND++))
  sleep 10
done
