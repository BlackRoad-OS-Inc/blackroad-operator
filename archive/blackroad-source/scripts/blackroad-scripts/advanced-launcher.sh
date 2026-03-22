#!/usr/bin/env bash
# Advanced features launcher
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m'

clear
echo ""
echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}                                                                  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}     ${CYAN}███╗   ██╗███████╗██╗    ██╗    ███████╗███████╗███████╗${NC}    ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}     ${CYAN}████╗  ██║██╔════╝██║    ██║    ██╔════╝██╔════╝██╔════╝${NC}    ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}     ${CYAN}██╔██╗ ██║█████╗  ██║ █╗ ██║    ███████╗█████╗  ███████╗${NC}    ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}     ${CYAN}██║╚██╗██║██╔══╝  ██║███╗██║    ╚════██║██╔══╝  ╚════██║${NC}    ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}     ${CYAN}██║ ╚████║███████╗╚███╔███╔╝    ███████║██║     ███████║${NC}    ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}     ${CYAN}╚═╝  ╚═══╝╚══════╝ ╚══╝╚══╝     ╚══════╝╚═╝     ╚══════╝${NC}    ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}                                                                  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}                ${YELLOW}⚡ ADVANCED FEATURES UNLOCKED! ⚡${NC}               ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}                                                                  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}════════════════════ MORE 3D GRAPHICS ═════════════════════${NC}"
echo ""
echo "  ${YELLOW} 1)${NC} 🧬 DNA Helix           - Double helix animation"
echo "  ${YELLOW} 2)${NC} 🌍 Rotating Sphere     - 3D planet with shading"
echo ""
echo -e "${CYAN}═══════════════════ PHYSICS SIMULATIONS ═══════════════════${NC}"
echo ""
echo "  ${YELLOW} 3)${NC} ⚽ Bouncing Ball       - Gravity & physics"
echo "  ${YELLOW} 4)${NC} ⛲ Particle Fountain   - Particle system"
echo ""
echo -e "${CYAN}═════════════════════ MORE GAMES ══════════════════════════${NC}"
echo ""
echo "  ${YELLOW} 5)${NC} 🏓 Pong                - Classic arcade game"
echo "  ${YELLOW} 6)${NC} 🏎️  Racing Game         - Dodge obstacles!"
echo ""
echo -e "${CYAN}════════════════════ VISUAL EFFECTS ═══════════════════════${NC}"
echo ""
echo "  ${YELLOW} 7)${NC} 🎆 Fireworks Show      - Celebration mode"
echo "  ${YELLOW} 8)${NC} 🔊 Sound Effects       - Audio system"
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "  ${GREEN}A)${NC} Run All Demos"
echo "  ${RED}Q)${NC} Back to Main Menu"
echo ""

read -p "  Select feature (1-8, A, or Q): " choice

case $choice in
  1) ~/scripts/3d-dna-helix.sh;;
  2) ~/scripts/3d-sphere-rotate.sh;;
  3) ~/scripts/physics-bouncing-ball.sh;;
  4) ~/scripts/particle-fountain.sh;;
  5) ~/scripts/mini-game-pong.sh;;
  6) ~/scripts/racing-game.sh;;
  7) ~/scripts/fireworks-show.sh;;
  8) ~/scripts/sound-effects.sh;;
  a|A)
    echo ""
    echo -e "${YELLOW}Running all demos...${NC}"
    sleep 1
    timeout 3 ~/scripts/3d-dna-helix.sh 2>/dev/null
    timeout 3 ~/scripts/3d-sphere-rotate.sh 2>/dev/null
    timeout 3 ~/scripts/physics-bouncing-ball.sh 2>/dev/null
    timeout 3 ~/scripts/fireworks-show.sh 2>/dev/null
    echo ""
    echo -e "${GREEN}All demos complete!${NC}"
    sleep 2
    ;;
  q|Q) exit 0;;
  *) echo "Invalid choice!"; sleep 1; exec ~/scripts/advanced-launcher.sh;;
esac

echo ""
read -p "Run another demo? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  exec ~/scripts/advanced-launcher.sh
fi
