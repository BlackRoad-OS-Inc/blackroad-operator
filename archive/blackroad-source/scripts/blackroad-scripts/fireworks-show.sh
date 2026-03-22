#!/usr/bin/env bash
# Fireworks celebration!
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        🎆 FIREWORKS SHOW 🎆                         ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

colors=(RED GREEN YELLOW CYAN MAGENTA)
symbols=('*' '✦' '✧' '⋆' '★')

for show in {1..15}; do
  # Random position
  cx=$((RANDOM % 40 + 10))
  cy=$((RANDOM % 10 + 8))
  
  # Random color
  color=${colors[$RANDOM % ${#colors[@]}]}
  symbol=${symbols[$RANDOM % ${#symbols[@]}]}
  
  # Explosion animation
  for radius in {1..5}; do
    tput cup 6 0
    
    # Clear previous
    for y in {6..20}; do
      echo "                                                            "
    done
    
    # Draw explosion
    for angle in {0..360..30}; do
      rad=$(echo "$angle * 3.14159 / 180" | bc -l)
      x=$(echo "$cx + $radius * c($rad)" | bc -l | cut -d. -f1)
      y=$(echo "$cy + $radius * s($rad) / 2" | bc -l | cut -d. -f1)
      
      if [[ $y -ge 6 && $y -le 20 && $x -ge 0 && $x -lt 60 ]]; then
        tput cup $y $x
        case $color in
          RED) echo -ne "${RED}${symbol}${NC}";;
          GREEN) echo -ne "${GREEN}${symbol}${NC}";;
          YELLOW) echo -ne "${YELLOW}${symbol}${NC}";;
          CYAN) echo -ne "${CYAN}${symbol}${NC}";;
          MAGENTA) echo -ne "${MAGENTA}${symbol}${NC}";;
        esac
      fi
    done
    
    sleep 0.1
  done
  
  sleep 0.2
done

tput cup 22 0
echo ""
echo -e "${GREEN}  ✓ Grand finale complete!${NC}"
echo ""
