#!/usr/bin/env bash
# Your coding companion that grows!
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

PET_FILE=~/.codex/pet-stats.json

# Initialize pet if doesn't exist
if [[ ! -f $PET_FILE ]]; then
  mkdir -p ~/.codex
  cat > $PET_FILE <<JSON
{
  "name": "CodeBuddy",
  "level": 1,
  "xp": 0,
  "happiness": 100,
  "age_days": 0,
  "last_fed": "$(date +%s)"
}
JSON
fi

# Read pet stats
NAME=$(grep -o '"name": "[^"]*' $PET_FILE | grep -o '[^"]*$')
LEVEL=$(grep -o '"level": [0-9]*' $PET_FILE | grep -o '[0-9]*$')
XP=$(grep -o '"xp": [0-9]*' $PET_FILE | grep -o '[0-9]*$')
HAPPINESS=$(grep -o '"happiness": [0-9]*' $PET_FILE | grep -o '[0-9]*$')

clear
echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        🐾 YOUR CODE PET: $NAME 🐾                ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Show pet based on level
if [[ $LEVEL -lt 5 ]]; then
  echo -e "${CYAN}"
  cat << 'PET'
       (\___/)
       (='.'=)
       (")_(")
PET
  echo -e "       Baby $NAME${NC}"
elif [[ $LEVEL -lt 10 ]]; then
  echo -e "${GREEN}"
  cat << 'PET'
      /\_/\
     ( o.o )
      > ^ <
PET
  echo -e "      Teen $NAME${NC}"
else
  echo -e "${YELLOW}"
  cat << 'PET'
      /\_/\  
     ( ^.^ )
      /   \
     m  m  m
PET
  echo -e "      Adult $NAME${NC}"
fi

echo ""
echo -e "  ${CYAN}Level:${NC} $LEVEL"
echo -e "  ${CYAN}XP:${NC} $XP/100"
echo -e "  ${CYAN}Happiness:${NC} $HAPPINESS%"
echo ""

# Actions
echo "  What do you want to do?"
echo "  1) 🍕 Feed (costs 1 commit)"
echo "  2) 🎮 Play"
echo "  3) 📚 Teach"
echo "  4) 💤 Let rest"
echo ""

read -p "  Choice (1-4): " action

case $action in
  1)
    echo ""
    echo "  🍕 Yum! $NAME is happy!"
    HAPPINESS=$((HAPPINESS + 20))
    XP=$((XP + 10))
    ;;
  2)
    echo ""
    echo "  🎮 Playing fetch with code snippets!"
    HAPPINESS=$((HAPPINESS + 15))
    XP=$((XP + 5))
    ;;
  3)
    echo ""
    echo "  📚 Teaching $NAME about algorithms!"
    XP=$((XP + 20))
    ;;
  4)
    echo ""
    echo "  💤 $NAME is resting peacefully..."
    HAPPINESS=$((HAPPINESS + 10))
    ;;
esac

# Cap happiness
[[ $HAPPINESS -gt 100 ]] && HAPPINESS=100

# Level up check
if [[ $XP -ge 100 ]]; then
  LEVEL=$((LEVEL + 1))
  XP=0
  echo ""
  echo -e "  ${YELLOW}🎉 LEVEL UP! $NAME is now level $LEVEL!${NC}"
fi

# Save stats
cat > $PET_FILE <<JSON
{
  "name": "$NAME",
  "level": $LEVEL,
  "xp": $XP,
  "happiness": $HAPPINESS,
  "age_days": 0,
  "last_fed": "$(date +%s)"
}
JSON

echo ""
echo -e "  ${GREEN}✓ Pet updated!${NC}"
echo ""
