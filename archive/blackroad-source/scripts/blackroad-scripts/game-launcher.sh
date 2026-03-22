#!/usr/bin/env bash
# Ultimate game launcher
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m'

clear
echo -e "${MAGENTA}"
cat << 'ARCADE'
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║     ███╗   ██╗███████╗ ██████╗ ███╗   ██╗                      ║
║     ████╗  ██║██╔════╝██╔═══██╗████╗  ██║                      ║
║     ██╔██╗ ██║█████╗  ██║   ██║██╔██╗ ██║                      ║
║     ██║╚██╗██║██╔══╝  ██║   ██║██║╚██╗██║                      ║
║     ██║ ╚████║███████╗╚██████╔╝██║ ╚████║                      ║
║     ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝                      ║
║                                                                  ║
║              🎮 NEON CODE ARCADE 🎮                             ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
ARCADE
echo -e "${NC}"

echo ""
echo -e "${CYAN}         ═══════════════════════════════════${NC}"
echo -e "${CYAN}                  GAME MENU                  ${NC}"
echo -e "${CYAN}         ═══════════════════════════════════${NC}"
echo ""
echo -e "  ${YELLOW}1)${NC} 🐾 Code Pet - Your coding companion"
echo -e "  ${YELLOW}2)${NC} 🎯 Daily Challenge - Today's mission"
echo -e "  ${YELLOW}3)${NC} ⚔️  Boss Battle - Epic fights"
echo -e "  ${YELLOW}4)${NC} 🥚 Easter Eggs - Hidden secrets"
echo -e "  ${YELLOW}5)${NC} 🎲 Code Battle - Quick battle"
echo -e "  ${YELLOW}6)${NC} 🎪 Code Party - Celebration!"
echo -e "  ${YELLOW}7)${NC} 🏆 Achievements - Your progress"
echo -e "  ${YELLOW}8)${NC} 🥠 Fortune - Daily wisdom"
echo -e "  ${YELLOW}9)${NC} 💻 Hacker Mode - Matrix vibes"
echo -e "  ${YELLOW}0)${NC} 🚀 Victory Screen - Celebrate!"
echo ""
echo -e "  ${RED}Q)${NC} Quit"
echo ""

read -p "  Select game: " choice

case $choice in
  1) ~/scripts/code-pet.sh;;
  2) ~/scripts/daily-challenge.sh;;
  3) ~/scripts/boss-battle.sh;;
  4) ~/scripts/easter-eggs.sh;;
  5) ~/scripts/code-battle.sh;;
  6) ~/scripts/code-party.sh;;
  7) ~/scripts/achievement-system.sh;;
  8) ~/scripts/code-fortune.sh;;
  9) ~/scripts/hacker-mode.sh;;
  0) ~/scripts/victory-screen.sh;;
  q|Q) echo "Thanks for playing! 🎮"; exit 0;;
  *) echo "Invalid choice!"; sleep 1; exec ~/scripts/game-launcher.sh;;
esac

echo ""
read -p "Play again? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  exec ~/scripts/game-launcher.sh
fi
