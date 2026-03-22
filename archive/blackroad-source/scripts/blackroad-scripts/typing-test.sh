#!/usr/bin/env bash
# Coding typing speed test
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

phrases=(
  "const awesome = true;"
  "function magic() { return 'amazing'; }"
  "git commit -m 'legendary code'"
  "npm install happiness"
  "while(true) { beAwesome(); }"
)

clear
echo ""
echo -e "${CYAN}⌨️  CODING TYPING TEST ⌨️${NC}"
echo ""

phrase=${phrases[$RANDOM % ${#phrases[@]}]}

echo -e "Type this: ${YELLOW}$phrase${NC}"
echo ""

START=$(date +%s)
read -p "> " typed
END=$(date +%s)

DURATION=$((END - START))

echo ""
if [[ "$typed" == "$phrase" ]]; then
  echo -e "${GREEN}🎯 PERFECT!${NC}"
  echo "⏱️  Time: ${DURATION}s"
  
  if [[ $DURATION -lt 5 ]]; then
    echo "🔥 BLAZING FAST! You're a typing LEGEND!"
  elif [[ $DURATION -lt 10 ]]; then
    echo "⚡ Super quick! Great job!"
  else
    echo "👍 Nice work! Keep practicing!"
  fi
else
  echo -e "${YELLOW}Almost! Try again!${NC}"
fi
echo ""
