#!/usr/bin/env bash
# Spinning DNA double helix!
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        🧬 DNA HELIX ANIMATION 🧬                     ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}  Genetic code spiraling...${NC}"
echo ""

for i in {0..60}; do
  tput cup 6 0
  
  for line in {0..15}; do
    offset=$(( (i + line) % 20 ))
    
    # Calculate helix positions
    if [[ $offset -lt 5 ]]; then
      left=15
      right=35
    elif [[ $offset -lt 10 ]]; then
      left=$((15 + (offset - 5) * 2))
      right=$((35 - (offset - 5) * 2))
    elif [[ $offset -lt 15 ]]; then
      left=$((25 - (offset - 10) * 2))
      right=$((25 + (offset - 10) * 2))
    else
      left=15
      right=35
    fi
    
    # Draw line
    printf "    "
    for col in {0..50}; do
      if [[ $col -eq $left ]]; then
        echo -ne "${CYAN}●${NC}"
      elif [[ $col -eq $right ]]; then
        echo -ne "${MAGENTA}●${NC}"
      elif [[ $col -gt $left && $col -lt $right && $(((line + i) % 4)) -eq 0 ]]; then
        echo -ne "${YELLOW}─${NC}"
      else
        echo -ne " "
      fi
    done
    echo ""
  done
  
  sleep 0.1
done

tput cup 24 0
echo ""
echo -e "${GREEN}  ✓ DNA sequence complete!${NC}"
echo ""
