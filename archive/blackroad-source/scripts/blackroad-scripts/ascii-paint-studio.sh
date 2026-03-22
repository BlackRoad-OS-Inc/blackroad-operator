#!/usr/bin/env bash
# Full ASCII art paint program!
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m'

clear
echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        🎨 ASCII PAINT STUDIO 🎨                      ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}  Creating your masterpiece...${NC}"
echo ""

WIDTH=40
HEIGHT=15

declare -a canvas

# Initialize blank canvas
for ((i=0; i<WIDTH*HEIGHT; i++)); do
  canvas[$i]=" "
done

# Draw some demo art
shapes=("█" "▓" "▒" "░" "●" "○" "◆" "◇" "♥" "♦" "♣" "♠" "☺" "☻" "★" "✦")

for demo in {1..30}; do
  tput cup 6 0
  
  # Add random shapes
  x=$((RANDOM % WIDTH))
  y=$((RANDOM % HEIGHT))
  shape=${shapes[$RANDOM % ${#shapes[@]}]}
  canvas[$((y * WIDTH + x))]="$shape"
  
  # Draw canvas
  echo "    ╔$(printf '═%.0s' $(seq 1 $WIDTH))╗"
  
  for y in $(seq 0 $((HEIGHT-1))); do
    echo -n "    ║"
    for x in $(seq 0 $((WIDTH-1))); do
      idx=$((y * WIDTH + x))
      
      # Color based on position
      if [[ $((x % 3)) -eq 0 ]]; then
        echo -ne "${CYAN}${canvas[$idx]}${NC}"
      elif [[ $((x % 3)) -eq 1 ]]; then
        echo -ne "${MAGENTA}${canvas[$idx]}${NC}"
      else
        echo -ne "${YELLOW}${canvas[$idx]}${NC}"
      fi
    done
    echo "║"
  done
  
  echo "    ╚$(printf '═%.0s' $(seq 1 $WIDTH))╝"
  
  tput cup $((HEIGHT + 8)) 0
  echo -e "    ${GREEN}Tools: Brush ● Fill █ Shapes ◆ | Colors: 🌈${NC}"
  
  sleep 0.15
done

tput cup $((HEIGHT + 10)) 0
echo ""
echo -e "${GREEN}  ✓ Masterpiece created!${NC}"
echo ""
