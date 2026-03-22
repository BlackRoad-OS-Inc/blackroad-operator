#!/usr/bin/env bash
# Audio spectrum visualizer
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        🎵 AUDIO VISUALIZER 🎵                       ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}  Now playing: Epic Terminal Music${NC}"
echo ""

BARS=30
MAX_HEIGHT=15

for beat in {1..40}; do
  tput cup 8 0
  
  # Clear previous
  for line in {1..18}; do
    echo "                                                            "
  done
  
  tput cup 8 0
  
  # Draw spectrum
  echo -n "    "
  for bar in $(seq 1 $BARS); do
    # Generate random height (simulating audio levels)
    height=$((RANDOM % MAX_HEIGHT + 1))
    
    # Draw vertical bar
    for h in $(seq 1 $MAX_HEIGHT); do
      tput cup $((8 + MAX_HEIGHT - h)) $((4 + bar * 2))
      
      if [[ $h -le $height ]]; then
        if [[ $h -gt $((MAX_HEIGHT * 3 / 4)) ]]; then
          echo -ne "${RED}█${NC}"
        elif [[ $h -gt $((MAX_HEIGHT / 2)) ]]; then
          echo -ne "${YELLOW}█${NC}"
        else
          echo -ne "${GREEN}█${NC}"
        fi
      else
        echo -n " "
      fi
    done
  done
  
  # Show beat
  tput cup 26 0
  echo -e "    ${MAGENTA}♪ Beat: $beat | BPM: 128 | Volume: $((RANDOM % 100))%${NC}"
  
  sleep 0.1
done

tput cup 28 0
echo ""
echo -e "${GREEN}  ✓ Track finished!${NC}"
echo ""
