#!/usr/bin/env bash
# Supreme master launcher
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

clear
echo ""
echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}                                                                  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}  ${CYAN}███████╗██╗   ██╗██████╗ ██████╗ ███████╗███╗   ███╗███████╗${NC}  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}  ${CYAN}██╔════╝██║   ██║██╔══██╗██╔══██╗██╔════╝████╗ ████║██╔════╝${NC}  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}  ${CYAN}███████╗██║   ██║██████╔╝██████╔╝█████╗  ██╔████╔██║█████╗${NC}    ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}  ${CYAN}╚════██║██║   ██║██╔═══╝ ██╔══██╗██╔══╝  ██║╚██╔╝██║██╔══╝${NC}    ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}  ${CYAN}███████║╚██████╔╝██║     ██║  ██║███████╗██║ ╚═╝ ██║███████╗${NC}  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}  ${CYAN}╚══════╝ ╚═════╝ ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝${NC}  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}                                                                  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}              ${YELLOW}⚡ 100+ FEATURES SUPREME LAUNCHER ⚡${NC}              ${MAGENTA}║${NC}"
echo -e "${MAGENTA}║${NC}                                                                  ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}══════════════════════ ARCADE GAMES ═══════════════════════${NC}"
echo ""
echo "  ${YELLOW} 1)${NC} �� Tetris              - Block stacking classic"
echo "  ${YELLOW} 2)${NC} 👾 Space Invaders      - Defend Earth!"
echo "  ${YELLOW} 3)${NC} 🏓 Pong                - Classic arcade"
echo "  ${YELLOW} 4)${NC} 🏎️  Racing              - High speed action"
echo ""
echo -e "${CYAN}═════════════════ SIMULATIONS & SCIENCE ═══════════════════${NC}"
echo ""
echo "  ${YELLOW} 5)${NC} 🧬 Conway's Life       - Cellular automata"
echo "  ${YELLOW} 6)${NC} 🌊 Wave Simulator      - Physics waves"
echo "  ${YELLOW} 7)${NC} 🌐 Network Graph       - Topology visualizer"
echo "  ${YELLOW} 8)${NC} 🎨 Mandelbrot Set      - Fractal zoom"
echo ""
echo -e "${CYAN}══════════════════ VISUAL & AUDIO ═════════════════════════${NC}"
echo ""
echo "  ${YELLOW} 9)${NC} 🎵 Audio Visualizer    - Spectrum analyzer"
echo "  ${YELLOW}10)${NC} 💫 Screensaver         - Bouncing logo"
echo ""
echo -e "${CYAN}══════════════════ MORE LAUNCHERS ═════════════════════════${NC}"
echo ""
echo "  ${GREEN}11)${NC} 🎮 3D Graphics Menu"
echo "  ${GREEN}12)${NC} ⚡ Advanced Features"
echo "  ${GREEN}13)${NC} 🎲 Gaming Universe"
echo "  ${GREEN}14)${NC} 📊 Ultimate Dashboard"
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "  ${RED}Q)${NC} Exit"
echo ""

read -p "  Select option (1-14 or Q): " choice

case $choice in
  1) ~/scripts/tetris-game.sh;;
  2) ~/scripts/space-invaders.sh;;
  3) ~/scripts/mini-game-pong.sh;;
  4) ~/scripts/racing-game.sh;;
  5) ~/scripts/conway-life.sh;;
  6) ~/scripts/wave-simulator.sh;;
  7) ~/scripts/network-visualizer.sh;;
  8) ~/scripts/mandelbrot-zoom.sh;;
  9) ~/scripts/audio-visualizer.sh;;
  10) ~/scripts/screensaver-mode.sh;;
  11) ~/scripts/3d-launcher.sh;;
  12) ~/scripts/advanced-launcher.sh;;
  13) ~/scripts/game-launcher.sh;;
  14) ~/scripts/ultimate-dashboard.sh;;
  q|Q) exit 0;;
  *) echo "Invalid choice!"; sleep 1; exec ~/scripts/supreme-launcher.sh;;
esac

echo ""
read -p "Return to menu? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  exec ~/scripts/supreme-launcher.sh
fi
