#!/usr/bin/env bash
# 3D tunnel effect!
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear

frames=(
'
        ████████
      ██        ██
    ██            ██
    ██            ██
      ██        ██
        ████████
'
'
       ██████████
     ██          ██
   ██              ██
   ██              ██
     ██          ██
       ██████████
'
'
      ████████████
    ██            ██
  ██                ██
  ██                ██
    ██            ██
      ████████████
'
'
     ██████████████
   ██              ██
 ██                  ██
 ██                  ██
   ██              ██
     ██████████████
'
)

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        �� 3D TUNNEL EFFECT 🌀                        ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}  Flying through hyperspace...${NC}"
echo ""

for i in {1..10}; do
  for frame in "${frames[@]}"; do
    tput cup 6 10
    colors=(GREEN CYAN MAGENTA YELLOW)
    color=${colors[$RANDOM % ${#colors[@]}]}
    
    case $color in
      GREEN) echo -e "${GREEN}$frame${NC}";;
      CYAN) echo -e "${CYAN}$frame${NC}";;
      MAGENTA) echo -e "${MAGENTA}$frame${NC}";;
      YELLOW) echo -e "${YELLOW}$frame${NC}";;
    esac
    
    sleep 0.15
  done
done

clear
tput cup 10 20
echo -e "${GREEN}✓ Hyperspace jump complete!${NC}"
echo ""
sleep 2
