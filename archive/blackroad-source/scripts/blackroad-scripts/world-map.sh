#!/usr/bin/env bash
# Explore the code world!
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        🗺️  CODE WORLD MAP 🗺️                        ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

cat << 'MAP'
                    ⛰️  Mountains of
                       Debugging
                    
        🏰               |
     Castle of      🌲🌲🌲|🌲🌲
     Deployment        |
                      |
   🌊🌊🌊      🏘️      |      🏛️
   Sea of     Coding  |   Temple of
   Errors     Village |   Testing
   🌊🌊🌊       🏠    |      🏛️
              🏡🏠    |
                      |🌲
        🌳     YOU    |🌲    🏭
       🌲🌳    [🧙]   |   Factory of
       🌳🌲           |   Features
                🌲🌲🌲|
                      |
        🗻            |        🏝️
     Mountain     🔥🔥🔥    Island of
     of Stack     Volcano    Innovation
     Overflow     of Bugs    🏝️
MAP

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Current Location: ${GREEN}🏘️  Coding Village${NC}"
echo ""
echo "  Available Destinations:"
echo ""
echo "  1) 🏰 Castle of Deployment    (Travel: 30 min)"
echo "  2) 🏛️  Temple of Testing       (Travel: 20 min)"
echo "  3) 🌊 Sea of Errors            (Travel: 40 min) ⚠️  Dangerous!"
echo "  4) 🔥 Volcano of Bugs          (Travel: 50 min) ⚠️  Boss Area!"
echo "  5) 🏭 Factory of Features      (Travel: 25 min)"
echo "  6) 🏝️  Island of Innovation    (Travel: 60 min) 🎁 Treasure!"
echo ""
echo "  B) Back to Menu"
echo ""

read -p "  Where do you want to go? " dest

case $dest in
  1)
    echo ""
    echo "  🏰 Traveling to Castle of Deployment..."
    echo "  Learn advanced deployment techniques!"
    ;;
  2)
    echo ""
    echo "  🏛️ Traveling to Temple of Testing..."
    echo "  Master the art of unit tests!"
    ;;
  4)
    echo ""
    echo -e "  ${RED}🔥 WARNING: Boss area ahead!${NC}"
    echo "  The Volcano of Bugs contains the toughest bosses!"
    ;;
  6)
    echo ""
    echo "  🏝️ Setting sail for Island of Innovation..."
    echo "  Legendary treasures await! 💎"
    ;;
  *)
    echo ""
    echo "  Maybe another time! 🗺️"
    ;;
esac

echo ""
sleep 2
