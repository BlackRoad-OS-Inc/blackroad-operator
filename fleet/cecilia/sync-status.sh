#!/bin/bash
# Check memory sync daemon status

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

echo -e "${PINK}════════════════════════════════════════════════════════════════${RESET}"
echo -e "${PINK}    📡 MEMORY SYNC DAEMON STATUS 📡${RESET}"
echo -e "${PINK}════════════════════════════════════════════════════════════════${RESET}"
echo ""

# Check LaunchAgent
if launchctl list | grep -q com.blackroad.memory-sync; then
  echo -e "${GREEN}✅ Daemon Status: RUNNING${RESET}"
  PID=$(launchctl list | grep com.blackroad.memory-sync | awk '{print $1}')
  echo "   PID: $PID"
else
  echo -e "${AMBER}⚠️  Daemon Status: NOT RUNNING${RESET}"
fi

echo ""

# Check sync counts
SOURCE_DIR="/Users/alexa/BlackRoad-Private/memory-index"
current_count=$(cat ~/.blackroad/memory/journals/*.jsonl 2>/dev/null | wc -l | tr -d ' ')
last_sync=$(cat "$SOURCE_DIR/.last_sync_count" 2>/dev/null || echo "0")

echo -e "${BLUE}📊 Memory Statistics:${RESET}"
echo "   Current entries:  $current_count"
echo "   Last sync count:  $last_sync"
echo "   Pending sync:     $((current_count - last_sync))"

echo ""
echo -e "${BLUE}📋 Recent Logs (last 10 lines):${RESET}"
if [ -f "$SOURCE_DIR/sync.log" ]; then
  tail -10 "$SOURCE_DIR/sync.log" | sed 's/^/   /'
else
  echo "   No logs found"
fi

echo ""
echo -e "${BLUE}🎮 Management Commands:${RESET}"
echo "   launchctl list | grep blackroad"
echo "   launchctl stop com.blackroad.memory-sync"
echo "   launchctl start com.blackroad.memory-sync"
echo "   tail -f $SOURCE_DIR/sync.log"
