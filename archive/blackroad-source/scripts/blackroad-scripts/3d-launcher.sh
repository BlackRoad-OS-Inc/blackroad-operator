#!/usr/bin/env bash
# 3D Graphics Launcher
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
echo -e "${MAGENTA}║${NC}     ${CYAN}███████╗██████╗      ██████╗ ██████╗  █████╗ ██████╗ ██╗  ██╗${NC}  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}     ${CYAN}╚════██║██╔══██╗    ██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██║  ██║${NC}  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}     ${CYAN}  ███╔╝ ██║  ██║    ██║  ███╗██████╔╝███████║██████╔╝███████║${NC}  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}     ${CYAN} ██╔══╝ ██║  ██║    ██║   ██║██╔══██╗██╔══██║██╔═══╝ ██╔══██║${NC}  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}     ${CYAN}███████╗██████╔╝    ╚██████╔╝██║  ██║██║  ██║██║     ██║  ██║${NC}  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}     ${CYAN}╚══════╝╚═════╝      ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝${NC}  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}                                                                  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}                  ${YELLOW}⚡ TERMINAL GRAPHICS ENGINE ⚡${NC}                 ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}                                                                  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}══════════════════════════════ 3D DEMOS ═══════════════════════════════${NC}"
echo ""
echo "  ${YELLOW}1)${NC} 🎲 Spinning Cube        - Watch a 3D cube rotate"
echo "  ${YELLOW}2)${NC} 🌀 Tunnel Effect        - Fly through hyperspace"
echo "  ${YELLOW}3)${NC} 💚 Matrix Rain          - Digital rain effect"
echo "  ${YELLOW}4)${NC} ⭐ Star Field           - Warp through space"
echo "  ${YELLOW}5)${NC} 🔺 Rotating Pyramid     - Ancient geometry"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  ${RED}Q)${NC} Back to Main Menu"
echo ""

read -p "  Select demo (1-5 or Q): " choice

case $choice in
  1) ~/scripts/3d-cube-spin.sh;;
  2) ~/scripts/3d-tunnel.sh;;
  3) ~/scripts/3d-matrix-rain.sh;;
  4) ~/scripts/3d-star-field.sh;;
  5) ~/scripts/3d-pyramid.sh;;
  q|Q) exit 0;;
  *) echo "Invalid choice!"; sleep 1; exec ~/scripts/3d-launcher.sh;;
esac

echo ""
read -p "Run another demo? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  exec ~/scripts/3d-launcher.sh
fi
