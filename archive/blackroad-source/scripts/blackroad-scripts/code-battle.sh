#!/usr/bin/env bash
# Epic code battle game!
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        ⚔️  CODE BATTLE ARENA ⚔️                      ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "  Choose your weapon:"
echo "  1) ⚔️  JavaScript"
echo "  2) 🐍 Python"
echo "  3) ⚡ Go"
echo "  4) 💎 Ruby"
echo ""

read -p "  Your choice (1-4): " weapon

case $weapon in
  1) WEAPON="JavaScript"; EMOJI="⚔️";;
  2) WEAPON="Python"; EMOJI="🐍";;
  3) WEAPON="Go"; EMOJI="⚡";;
  4) WEAPON="Ruby"; EMOJI="💎";;
  *) WEAPON="JavaScript"; EMOJI="⚔️";;
esac

echo ""
echo -e "  You chose: ${YELLOW}$EMOJI $WEAPON${NC}"
echo ""
sleep 1

echo "  🐛 A wild BUG appears!"
sleep 1
echo ""
echo "  What do you do?"
echo "  1) 🔍 Debug it"
echo "  2) 📚 Read the docs"
echo "  3) 💬 Ask Stack Overflow"
echo ""

read -p "  Your move (1-3): " move

OUTCOME=$((RANDOM % 100))

echo ""
sleep 1

if [[ $OUTCOME -gt 30 ]]; then
  echo -e "  ${GREEN}💥 CRITICAL HIT!${NC}"
  echo "  🎉 Bug defeated!"
  echo "  ⭐ +100 XP"
  echo "  🏆 Victory is yours!"
else
  echo -e "  ${YELLOW}⚠️  Bug escaped!${NC}"
  echo "  📖 But you learned something!"
  echo "  ⭐ +50 XP"
  echo "  💪 Keep fighting!"
fi

echo ""
echo -e "  ${CYAN}Battle complete!${NC}"
echo ""
