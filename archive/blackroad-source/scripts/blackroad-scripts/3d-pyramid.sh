#!/usr/bin/env bash
# Rotating 3D pyramid
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        🔺 3D PYRAMID ROTATION 🔺                    ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

frames=(
"
       /\\
      /  \\
     / /\\ \\
    / /  \\ \\
   /________\\
"
"
        △
       /|\\
      / | \\
     /  |  \\
    /   |   \\
   /____|____\\
"
"
       /\\
      /||\\
     / || \\
    /  ||  \\
   /_________\\
"
"
        /\\
       /  \\
      / /\\ \\
     / /  \\ \\
    /_/____\\_\\
"
)

echo -e "${YELLOW}  Ancient pyramid rotating...${NC}"
echo ""

for rotation in {1..3}; do
  for frame in "${frames[@]}"; do
    tput cup 8 15
    colors=(CYAN YELLOW MAGENTA GREEN)
    idx=$((RANDOM % ${#colors[@]}))
    color=${colors[$idx]}
    
    case $color in
      CYAN) echo -e "${CYAN}$frame${NC}";;
      YELLOW) echo -e "${YELLOW}$frame${NC}";;
      MAGENTA) echo -e "${MAGENTA}$frame${NC}";;
      GREEN) echo -e "${GREEN}$frame${NC}";;
    esac
    
    sleep 0.3
  done
done

tput cup 18 0
echo ""
echo -e "${GREEN}  ✓ Pyramid aligned!${NC}"
echo ""
sleep 1
