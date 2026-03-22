#!/usr/bin/env bash
# Hidden easter eggs!
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

EGGS_FILE=~/.codex/found-eggs.txt
mkdir -p ~/.codex
touch $EGGS_FILE

show_egg() {
  local egg_id=$1
  local egg_name=$2
  
  if grep -q "$egg_id" $EGGS_FILE 2>/dev/null; then
    echo -e "  ${YELLOW}Already found!${NC}"
  else
    echo "$egg_id" >> $EGGS_FILE
    echo -e "  ${GREEN}🥚 NEW EASTER EGG DISCOVERED!${NC}"
    echo -e "  ${CYAN}$egg_name${NC}"
    echo ""
    echo -e "  ${YELLOW}⭐ +50 Secret XP${NC}"
  fi
}

clear
echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        🥚 EASTER EGG HUNTER 🥚                      ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

TOTAL_EGGS=10
FOUND=$(wc -l < $EGGS_FILE 2>/dev/null || echo "0")

echo -e "  ${CYAN}Easter Eggs Found: $FOUND / $TOTAL_EGGS${NC}"
echo ""

if [[ $FOUND -ge $TOTAL_EGGS ]]; then
  echo -e "  ${GREEN}🏆 YOU FOUND THEM ALL! LEGENDARY! 🏆${NC}"
  echo ""
fi

echo "  Known Easter Eggs:"
echo ""

grep -q "konami" $EGGS_FILE && echo -e "  ${GREEN}✓${NC} The Konami Code"
[[ ! $(grep -q "konami" $EGGS_FILE) ]] && echo "  ${YELLOW}?${NC} ??? (Try the Konami code)"

grep -q "matrix" $EGGS_FILE && echo -e "  ${GREEN}✓${NC} Follow the White Rabbit"
grep -q "hitchhiker" $EGGS_FILE && echo -e "  ${GREEN}✓${NC} Answer to Everything"
grep -q "cake" $EGGS_FILE && echo -e "  ${GREEN}✓${NC} The Cake Is A Lie"
grep -q "coffee" $EGGS_FILE && echo -e "  ${GREEN}✓${NC} Coffee Powered"

echo ""
echo "  Try these secret commands:"
echo "  • konami"
echo "  • coffee"
echo "  • 42"
echo ""

read -p "Enter secret code: " code

case $code in
  konami|KONAMI)
    show_egg "konami" "The Konami Code - Classic!"
    ;;
  coffee|COFFEE)
    show_egg "coffee" "Coffee Powered - Programmer Fuel!"
    ;;
  42)
    show_egg "hitchhiker" "Answer to Everything - 42!"
    ;;
  cake|CAKE)
    show_egg "cake" "The Cake Is A Lie - Portal Reference!"
    ;;
  matrix|MATRIX)
    show_egg "matrix" "Follow the White Rabbit - Matrix!"
    ;;
  *)
    echo ""
    echo "  Not a valid code! Keep searching! 🔍"
    ;;
esac

echo ""
