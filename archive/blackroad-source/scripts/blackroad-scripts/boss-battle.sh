#!/usr/bin/env bash
# Epic boss battles!
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

bosses=(
  "The Infinite Loop Dragon|300|50"
  "Memory Leak Monster|250|40"
  "Race Condition Demon|200|35"
  "Stack Overflow Giant|400|60"
  "Null Pointer Beast|150|25"
)

BOSS=${bosses[$RANDOM % ${#bosses[@]}]}
IFS='|' read -r NAME HP ATTACK <<< "$BOSS"

PLAYER_HP=100
PLAYER_ATTACK=30

clear
echo ""
echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║${NC}        ⚔️  BOSS BATTLE! ⚔️                           ${RED}║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${RED}A wild boss appears!${NC}"
echo -e "  ${YELLOW}$NAME${NC}"
echo ""
sleep 1

while [[ $HP -gt 0 ]] && [[ $PLAYER_HP -gt 0 ]]; do
  echo -e "  ${YELLOW}Boss HP:${NC} $HP"
  echo -e "  ${GREEN}Your HP:${NC} $PLAYER_HP"
  echo ""
  echo "  Choose your move:"
  echo "  1) ⚔️  Attack"
  echo "  2) 🛡️  Defend"
  echo "  3) 🧪 Use Potion (+50 HP)"
  echo ""
  
  read -p "  Your move (1-3): " move
  
  case $move in
    1)
      DAMAGE=$((RANDOM % PLAYER_ATTACK + 20))
      HP=$((HP - DAMAGE))
      echo ""
      echo -e "  ${GREEN}💥 You deal $DAMAGE damage!${NC}"
      ;;
    2)
      DAMAGE=$((RANDOM % 10))
      PLAYER_HP=$((PLAYER_HP - DAMAGE))
      echo ""
      echo -e "  ${CYAN}🛡️ You defend! Only $DAMAGE damage taken!${NC}"
      ;;
    3)
      PLAYER_HP=$((PLAYER_HP + 50))
      [[ $PLAYER_HP -gt 100 ]] && PLAYER_HP=100
      echo ""
      echo -e "  ${GREEN}🧪 Healed 50 HP!${NC}"
      ;;
  esac
  
  sleep 1
  
  if [[ $HP -gt 0 ]]; then
    BOSS_DAMAGE=$((RANDOM % ATTACK + 10))
    PLAYER_HP=$((PLAYER_HP - BOSS_DAMAGE))
    echo -e "  ${RED}⚡ Boss attacks for $BOSS_DAMAGE damage!${NC}"
    echo ""
    sleep 1
  fi
done

echo ""
if [[ $PLAYER_HP -gt 0 ]]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║${NC}        🏆 VICTORY! 🏆                                ${GREEN}║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  ${YELLOW}You defeated $NAME!${NC}"
  echo -e "  ${YELLOW}⭐ +500 XP${NC}"
  echo -e "  ${YELLOW}💎 +1 Legendary Item${NC}"
else
  echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║${NC}        💀 DEFEAT 💀                                  ${RED}║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "  Try again! You'll get stronger! 💪"
fi

echo ""
