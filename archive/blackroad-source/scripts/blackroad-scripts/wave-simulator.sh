#!/usr/bin/env bash
# Wave physics simulation
CYAN='\033[0;36m'
BLUE='\033[0;34m'
LIGHTBLUE='\033[1;34m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        🌊 WAVE SIMULATOR 🌊                         ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

WIDTH=60

for frame in {0..50}; do
  tput cup 6 0
  
  # Draw multiple waves
  for wave_num in {1..5}; do
    echo -n "    "
    
    for x in $(seq 0 $WIDTH); do
      # Calculate wave height using sine
      angle=$(echo "scale=4; ($x + $frame * 2) * 0.3 + $wave_num" | bc -l)
      height=$(echo "scale=2; s($angle) * 3 + $wave_num * 2" | bc -l)
      h_int=$(echo "$height" | cut -d. -f1)
      
      if [[ $h_int -eq $wave_num ]]; then
        case $wave_num in
          1) echo -ne "${LIGHTBLUE}~${NC}";;
          2) echo -ne "${CYAN}≈${NC}";;
          3) echo -ne "${BLUE}~${NC}";;
          4) echo -ne "${CYAN}≈${NC}";;
          5) echo -ne "${LIGHTBLUE}~${NC}";;
        esac
      else
        echo -n " "
      fi
    done
    echo ""
  done
  
  # Add spacing
  for i in {1..10}; do
    echo ""
  done
  
  tput cup 22 0
  echo -e "    ${CYAN}Frame: $frame | Frequency: 0.3 Hz${NC}"
  
  sleep 0.1
done

tput cup 24 0
echo ""
echo -e "${CYAN}  ✓ Wave simulation complete!${NC}"
echo ""
