#!/usr/bin/env bash
# Fortune cookie for coders
fortunes=(
  "🥠 A bug-free day awaits you tomorrow"
  "🥠 Your next PR will be approved instantly"
  "🥠 Stack Overflow will have your answer today"
  "🥠 Your code will compile on the first try"
  "🥠 A senior developer will praise your work"
  "🥠 Zero merge conflicts in your future"
  "🥠 Coffee will taste extra good today"
  "🥠 Your algorithm will be O(1) efficient"
  "🥠 Tests will pass without debugging"
  "🥠 You will solve that bug in 5 minutes"
  "�� Your commit will get 100 stars"
  "🥠 Documentation writes itself today"
  "🥠 Your keyboard types perfect code"
  "🥠 Rubber duck debugging works first time"
  "🥠 You are about to have a breakthrough"
)

YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        ${YELLOW}🥠 CODE FORTUNE COOKIE 🥠${NC}                    ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Opening your fortune..."
sleep 1
echo ""

fortune=${fortunes[$RANDOM % ${#fortunes[@]}]}
echo -e "  ${YELLOW}$fortune${NC}"

echo ""
echo "  Lucky numbers: $((RANDOM % 100)) $((RANDOM % 100)) $((RANDOM % 100))"
echo ""
