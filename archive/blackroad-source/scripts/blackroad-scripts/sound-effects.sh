#!/usr/bin/env bash
# Sound effects system using terminal beeps
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        🔊 SOUND EFFECTS SYSTEM 🔊                   ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

play_victory() {
  echo -e "${GREEN}  🎵 Victory fanfare!${NC}"
  for i in {1..3}; do
    printf '\a'
    sleep 0.2
  done
}

play_level_up() {
  echo -e "${YELLOW}  ⭐ Level up sound!${NC}"
  printf '\a'
  sleep 0.1
  printf '\a'
}

play_coin() {
  echo -e "${CYAN}  💰 Coin collected!${NC}"
  printf '\a'
}

play_error() {
  echo -e "${RED}  ❌ Error beep!${NC}"
  printf '\a'
  sleep 0.5
  printf '\a'
}

play_powerup() {
  echo -e "${MAGENTA}  ✨ Power-up!${NC}"
  for i in {1..5}; do
    printf '\a'
    sleep 0.08
  done
}

echo "  ${CYAN}Available sounds:${NC}"
echo ""
echo "  1) Victory"
echo "  2) Level Up"
echo "  3) Coin"
echo "  4) Error"
echo "  5) Power-up"
echo "  6) Play All"
echo ""

read -p "  Select sound (1-6): " choice

case $choice in
  1) play_victory;;
  2) play_level_up;;
  3) play_coin;;
  4) play_error;;
  5) play_powerup;;
  6)
    echo ""
    play_victory
    sleep 1
    play_level_up
    sleep 1
    play_coin
    sleep 1
    play_powerup
    ;;
  *) echo "Invalid choice!";;
esac

echo ""
echo -e "${GREEN}  ✓ Sound test complete!${NC}"
echo ""
