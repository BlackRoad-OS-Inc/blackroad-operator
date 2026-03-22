#!/usr/bin/env bash
# Epic quest tracking system
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m'

QUEST_FILE=~/.codex/quests.json

# Initialize if needed
if [[ ! -f $QUEST_FILE ]]; then
  mkdir -p ~/.codex
  cat > $QUEST_FILE <<JSON
{
  "active": [
    {"id": 1, "name": "First Steps", "desc": "Make your first commit", "progress": 0, "goal": 1, "reward": 50, "type": "tutorial"},
    {"id": 2, "name": "Code Warrior", "desc": "Make 10 commits", "progress": 0, "goal": 10, "reward": 200, "type": "main"},
    {"id": 3, "name": "Bug Hunter", "desc": "Fix 5 bugs", "progress": 0, "goal": 5, "reward": 150, "type": "side"}
  ],
  "completed": []
}
JSON
fi

clear
echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        📜 QUEST LOG 📜                                ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}                  ACTIVE QUESTS                      ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Parse and show quests
cat $QUEST_FILE | grep -A6 '"active"' | grep -E '"name"|"desc"|"progress"|"goal"|"reward"|"type"' | while read line; do
  if [[ $line =~ \"name\" ]]; then
    NAME=$(echo $line | sed 's/.*"name": "\([^"]*\).*/\1/')
    echo -e "  ${YELLOW}⚔️  $NAME${NC}"
  elif [[ $line =~ \"desc\" ]]; then
    DESC=$(echo $line | sed 's/.*"desc": "\([^"]*\).*/\1/')
    echo "     $DESC"
  elif [[ $line =~ \"progress\" ]]; then
    PROGRESS=$(echo $line | sed 's/.*"progress": \([0-9]*\).*/\1/')
  elif [[ $line =~ \"goal\" ]]; then
    GOAL=$(echo $line | sed 's/.*"goal": \([0-9]*\).*/\1/')
    PERCENT=$((PROGRESS * 100 / GOAL))
    echo -e "     Progress: ${GREEN}$PROGRESS${NC}/${YELLOW}$GOAL${NC} (${PERCENT}%)"
  elif [[ $line =~ \"reward\" ]]; then
    REWARD=$(echo $line | sed 's/.*"reward": \([0-9]*\).*/\1/')
    echo -e "     Reward: ${YELLOW}⭐ $REWARD XP${NC}"
    echo ""
  fi
done

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${GREEN}Press any key to continue...${NC}"
read -n 1 -s
