#!/usr/bin/env bash
# Matrix-style 3D rain
GREEN='\033[0;32m'
LIGHTGREEN='\033[1;32m'
NC='\033[0m'

clear
echo -e "${GREEN}"

cols=$(tput cols)
lines=$(tput lines)

# Create falling columns
declare -a columns
for ((i=0; i<cols; i++)); do
  columns[$i]=$((RANDOM % lines))
done

chars="01アイウエオカキクケコサシスセソタチツテト"

for iteration in {1..50}; do
  for ((col=0; col<cols; col+=2)); do
    row=${columns[$col]}
    
    # Move down
    columns[$col]=$(( (row + 1) % lines ))
    
    # Draw character
    tput cup $row $col
    char_index=$((RANDOM % ${#chars}))
    echo -ne "${LIGHTGREEN}${chars:$char_index:1}${NC}"
    
    # Fade trail
    if [[ $row -gt 0 ]]; then
      tput cup $((row - 1)) $col
      echo -ne "${GREEN}${chars:$char_index:1}${NC}"
    fi
  done
  
  sleep 0.05
done

tput cup $lines 0
echo -e "${NC}"
