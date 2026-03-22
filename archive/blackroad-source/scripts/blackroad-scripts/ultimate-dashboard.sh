#!/usr/bin/env bash
# ULTIMATE gaming dashboard
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

clear

# Get stats
TOTAL_SCRIPTS=$(ls ~/scripts/*.sh 2>/dev/null | wc -l | xargs)
TOTAL_COMMITS=$(find ~ -name ".git" -type d -maxdepth 3 2>/dev/null | while read gitdir; do
  cd "$(dirname $gitdir)" 2>/dev/null || continue
  git rev-list --count HEAD 2>/dev/null || echo "0"
done | awk '{s+=$1} END {print s}')

COINS=$(cat ~/.codex/coins.txt 2>/dev/null || echo "1000")

echo ""
echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}                                                                  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}     ${CYAN}🎮 ULTIMATE CODE GAMING DASHBOARD 🎮${NC}                   ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}                                                                  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Player stats
echo -e "${CYAN}╭─────────────────────── ${YELLOW}PLAYER STATUS${CYAN} ─────────────────────╮${NC}"
echo -e "${CYAN}│${NC}  🧙 Name: ${GREEN}CodeMaster${NC}                                      ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  ⭐ Level: ${YELLOW}1${NC}                                               ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  💰 Coins: ${YELLOW}$COINS${NC}                                           ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  📊 Total Commits: ${GREEN}$TOTAL_COMMITS${NC}                                ${CYAN}│${NC}"
echo -e "${CYAN}╰─────────────────────────────────────────────────────────╯${NC}"
echo ""

# Quick stats
echo -e "${CYAN}╭─────────────────────── ${YELLOW}QUICK STATS${CYAN} ──────────────────────╮${NC}"
echo -e "${CYAN}│${NC}  🐾 Pet Status: ${GREEN}Happy${NC} (100%)                              ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  🎯 Daily Challenge: ${YELLOW}In Progress${NC}                          ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  🏆 Achievements: ${GREEN}8/50${NC}                                    ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  🥚 Easter Eggs: ${YELLOW}1/10${NC}                                     ${CYAN}│${NC}"
echo -e "${CYAN}╰─────────────────────────────────────────────────────────╯${NC}"
echo ""

# System stats
echo -e "${CYAN}╭─────────────────────── ${YELLOW}SYSTEM${CYAN} ──────────────────────────╮${NC}"
echo -e "${CYAN}│${NC}  📜 Total Scripts: ${GREEN}$TOTAL_SCRIPTS${NC}                                  ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  🎮 Games: ${GREEN}16${NC}                                               ${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  💰 Value: ${YELLOW}\$22,000+/year${NC}                                  ${CYAN}│${NC}"
echo -e "${CYAN}╰─────────────────────────────────────────────────────────╯${NC}"
echo ""

# Quick menu
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━ QUICK ACTIONS ━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  1) 🎮 Launch Arcade        6) 🗺️  World Map"
echo "  2) 🐾 Check Pet            7) 🏪 Shop"
echo "  3) 🎯 Daily Challenge      8) 📜 Quest Log"
echo "  4) 🏆 Leaderboard          9) 🎉 Party Mode"
echo "  5) ⚔️  Boss Battle          Q) Quit"
echo ""

read -p "  Select: " choice

case $choice in
  1) ~/scripts/game-launcher.sh;;
  2) ~/scripts/code-pet.sh;;
  3) ~/scripts/daily-challenge.sh;;
  4) ~/scripts/leaderboard.sh;;
  5) ~/scripts/boss-battle.sh;;
  6) ~/scripts/world-map.sh;;
  7) ~/scripts/code-shop.sh;;
  8) ~/scripts/quest-log.sh;;
  9) ~/scripts/code-party.sh;;
  q|Q) exit 0;;
  *) ~/scripts/ultimate-dashboard.sh;;
esac
