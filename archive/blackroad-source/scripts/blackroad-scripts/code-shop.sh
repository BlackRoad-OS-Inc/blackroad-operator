#!/usr/bin/env bash
# In-game shop!
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

COINS_FILE=~/.codex/coins.txt
mkdir -p ~/.codex

# Initialize coins
if [[ ! -f $COINS_FILE ]]; then
  echo "1000" > $COINS_FILE
fi

COINS=$(cat $COINS_FILE)

clear
echo ""
echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║${NC}        🏪 CODE SHOP 🏪                                ${YELLOW}║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${CYAN}Your Coins: ${YELLOW}💰 $COINS${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}                      ITEMS FOR SALE                    ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  1) 🍕 Pet Food (5 uses)          - 💰 100 coins"
echo "  2) ⚔️  Power Sword                - 💰 500 coins"
echo "  3) 🛡️  Defense Shield             - 💰 400 coins"
echo "  4) 🧪 Health Potion (x3)         - 💰 200 coins"
echo "  5) 🎨 Custom Theme                - 💰 300 coins"
echo "  6) 🏆 XP Boost (2x for 1 hour)   - 💰 600 coins"
echo "  7) 🎁 Mystery Box                 - 💰 250 coins"
echo "  8) 🌟 Name Change Token          - 💰 150 coins"
echo ""
echo "  Q) Quit Shop"
echo ""

read -p "  Buy item (1-8 or Q): " choice

case $choice in
  1)
    if [[ $COINS -ge 100 ]]; then
      COINS=$((COINS - 100))
      echo "$COINS" > $COINS_FILE
      echo ""
      echo -e "  ${GREEN}✓ Purchased Pet Food!${NC}"
      echo "  Your pet will love this! 🍕"
    else
      echo ""
      echo -e "  ${YELLOW}Not enough coins!${NC}"
    fi
    ;;
  2)
    if [[ $COINS -ge 500 ]]; then
      COINS=$((COINS - 500))
      echo "$COINS" > $COINS_FILE
      echo ""
      echo -e "  ${GREEN}✓ Purchased Power Sword!${NC}"
      echo "  +50 Attack damage! ⚔️"
    else
      echo ""
      echo -e "  ${YELLOW}Not enough coins!${NC}"
    fi
    ;;
  7)
    if [[ $COINS -ge 250 ]]; then
      COINS=$((COINS - 250))
      echo "$COINS" > $COINS_FILE
      echo ""
      echo "  Opening mystery box..."
      sleep 1
      PRIZE=$((RANDOM % 3))
      case $PRIZE in
        0) echo -e "  ${YELLOW}🎉 You got 500 XP!${NC}";;
        1) echo -e "  ${YELLOW}🎉 You got a Legendary Item!${NC}";;
        2) echo -e "  ${YELLOW}🎉 You got 300 coins back!${NC}"; COINS=$((COINS + 300)); echo "$COINS" > $COINS_FILE;;
      esac
    else
      echo ""
      echo -e "  ${YELLOW}Not enough coins!${NC}"
    fi
    ;;
  q|Q)
    echo "Thanks for shopping! 🏪"
    exit 0
    ;;
  *)
    echo ""
    echo "Coming soon! 🚧"
    ;;
esac

sleep 2
