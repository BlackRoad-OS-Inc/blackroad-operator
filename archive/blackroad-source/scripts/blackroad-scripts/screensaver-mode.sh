#!/usr/bin/env bash
# Screensaver collection
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        💫 SCREENSAVER MODE 💫                       ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Bouncing DVD logo style
x=10
y=5
dx=1
dy=1

colors=(GREEN CYAN YELLOW MAGENTA)
color_idx=0

for frame in {1..60}; do
  tput cup 6 0
  
  # Clear screen
  for line in {1..20}; do
    echo "                                                            "
  done
  
  # Update position
  x=$((x + dx))
  y=$((y + dy))
  
  # Bounce off edges
  if [[ $x -le 0 || $x -ge 50 ]]; then
    dx=$((-dx))
    color_idx=$(( (color_idx + 1) % ${#colors[@]} ))
  fi
  
  if [[ $y -le 0 || $y -ge 18 ]]; then
    dy=$((-dy))
    color_idx=$(( (color_idx + 1) % ${#colors[@]} ))
  fi
  
  # Draw logo
  tput cup $((6 + y)) $x
  
  case ${colors[$color_idx]} in
    GREEN) echo -ne "${GREEN}[DVD]${NC}";;
    CYAN) echo -ne "${CYAN}[DVD]${NC}";;
    YELLOW) echo -ne "${YELLOW}[DVD]${NC}";;
    MAGENTA) echo -ne "${MAGENTA}[DVD]${NC}";;
  esac
  
  sleep 0.1
done

tput cup 28 0
echo ""
echo -e "${GREEN}  ✓ Screensaver demo complete!${NC}"
echo ""
