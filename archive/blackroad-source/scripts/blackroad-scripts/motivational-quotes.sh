#!/usr/bin/env bash
# Random motivational quotes
quotes=(
  "🌟 You're coding MAGIC today!"
  "🚀 Keep pushing! You're AMAZING!"
  "💎 Every commit makes you stronger!"
  "🔥 You're on FIRE! Keep going!"
  "⚡ Your code is ELECTRIC!"
  "🌈 You bring color to the codebase!"
  "💪 You got this! LEGEND!"
  "🎯 Bullseye! Another win!"
  "🏆 Champion mindset! Keep it up!"
  "✨ Your code SPARKLES today!"
  "🦄 Unicorn-level coding!"
  "🎨 You're painting masterpieces!"
  "🌠 Reach for the stars!"
  "💖 Code with LOVE, it shows!"
  "🎪 The show must go on! You're starring!"
)

CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        ${CYAN}💫 DAILY MOTIVATION 💫${NC}                      ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Pick 3 random quotes
for i in {1..3}; do
  quote=${quotes[$RANDOM % ${#quotes[@]}]}
  echo -e "  ${YELLOW}$quote${NC}"
  sleep 0.5
done

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "  ${YELLOW}Now go make something AMAZING! 🚀${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""
