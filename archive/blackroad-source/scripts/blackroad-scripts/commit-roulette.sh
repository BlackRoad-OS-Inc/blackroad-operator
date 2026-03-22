#!/usr/bin/env bash
# Fun commit message generator
messages=(
  "🎲 Added some chaos (in a good way)"
  "🎪 Made the code do a backflip"
  "🎨 Painted the code with rainbow logic"
  "🎭 The code is now method acting"
  "🎸 Code jam session complete"
  "🎮 Level up! Boss defeated!"
  "🎯 Bullseye! Feature locked in"
  "🎰 Jackpot! This will work... probably"
  "🎪 Welcome to the code circus"
  "🎢 Wheee! Refactor rollercoaster"
  "🪄 *waves wand* Code is now magic"
  "🦸 Hero mode: ACTIVATED"
  "🚁 Emergency code airlift"
  "🎁 Wrapped this feature like a present"
  "🌮 Taco Tuesday came early (code edition)"
)

CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo ""
echo -e "${CYAN}🎲 COMMIT ROULETTE 🎲${NC}"
echo ""
echo "Spinning the wheel..."
sleep 1

MSG=${messages[$RANDOM % ${#messages[@]}]}

echo ""
echo -e "${YELLOW}Your commit message:${NC}"
echo -e "${GREEN}$MSG${NC}"
echo ""

read -p "Use this message? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git add -A
  git commit -m "$MSG"
  echo -e "${GREEN}✓ Committed with style! 🎉${NC}"
else
  echo "Maybe next time! 😄"
fi
