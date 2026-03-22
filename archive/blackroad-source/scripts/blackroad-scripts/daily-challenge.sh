#!/usr/bin/env bash
# Daily coding challenge
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

challenges=(
  "Make 5 commits today|5|commits"
  "Refactor one function|1|refactor"
  "Write 3 tests|3|tests"
  "Update documentation|1|docs"
  "Fix a bug|1|bugfix"
  "Code for 2 hours|2|time"
  "Help a teammate|1|social"
  "Learn something new|1|learn"
  "Clean up code|1|cleanup"
  "Deploy a feature|1|deploy"
)

CHALLENGE_FILE=~/.codex/daily-challenge.txt
PROGRESS_FILE=~/.codex/challenge-progress.txt

# Get today's date
TODAY=$(date +%Y-%m-%d)

# Check if we need new challenge
if [[ ! -f $CHALLENGE_FILE ]] || ! grep -q "$TODAY" $CHALLENGE_FILE 2>/dev/null; then
  # New day, new challenge!
  CHALLENGE=${challenges[$RANDOM % ${#challenges[@]}]}
  echo "$TODAY|$CHALLENGE" > $CHALLENGE_FILE
  echo "0" > $PROGRESS_FILE
fi

# Read challenge
IFS='|' read -r DATE TASK GOAL TYPE <<< "$(cat $CHALLENGE_FILE)"
PROGRESS=$(cat $PROGRESS_FILE 2>/dev/null || echo "0")

clear
echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        ${CYAN}🎯 DAILY CHALLENGE 🎯${NC}                        ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${YELLOW}Today's Challenge:${NC}"
echo -e "  ${CYAN}$TASK${NC}"
echo ""
echo -e "  Progress: ${GREEN}$PROGRESS${NC} / ${YELLOW}$GOAL${NC}"
echo ""

# Show progress bar
PERCENT=$((PROGRESS * 100 / GOAL))
BARS=$((PERCENT / 5))
printf "  ["
for ((i=0; i<20; i++)); do
  if [[ $i -lt $BARS ]]; then
    printf "${GREEN}█${NC}"
  else
    printf "░"
  fi
done
printf "] ${PERCENT}%%\n"

if [[ $PROGRESS -ge $GOAL ]]; then
  echo ""
  echo -e "  ${GREEN}🎉 CHALLENGE COMPLETE! 🎉${NC}"
  echo -e "  ${YELLOW}⭐ +100 XP${NC}"
  echo -e "  ${YELLOW}🏆 +1 Achievement${NC}"
else
  echo ""
  echo "  Keep going! You can do it! 💪"
fi

echo ""
read -p "Update progress? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  read -p "New progress value: " NEW_PROGRESS
  echo "$NEW_PROGRESS" > $PROGRESS_FILE
  echo -e "${GREEN}✓ Updated!${NC}"
fi

echo ""
