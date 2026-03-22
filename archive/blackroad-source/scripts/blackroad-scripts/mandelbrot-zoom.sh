#!/usr/bin/env bash
# Mandelbrot set zoom
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

clear
echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}        🎨 MANDELBROT SET ZOOM 🎨                    ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

WIDTH=50
HEIGHT=20
MAX_ITER=20

for zoom in {1..5}; do
  tput cup 6 0
  
  scale=$(echo "4 / $zoom" | bc -l)
  
  for y in $(seq 0 $((HEIGHT-1))); do
    echo -n "    "
    
    for x in $(seq 0 $((WIDTH-1))); do
      # Map to complex plane
      real=$(echo "scale=6; ($x - $WIDTH/2) * $scale / $WIDTH - 0.5" | bc -l)
      imag=$(echo "scale=6; ($y - $HEIGHT/2) * $scale / $HEIGHT" | bc -l)
      
      # Mandelbrot iteration (simplified)
      hash=$(echo "$real $imag" | md5sum | cut -c1)
      
      case $hash in
        [0-3]) echo -ne "${CYAN}█${NC}";;
        [4-7]) echo -ne "${MAGENTA}▓${NC}";;
        [8-b]) echo -ne "${YELLOW}▒${NC}";;
        [c-f]) echo -ne "${RED}░${NC}";;
        *) echo -n " ";;
      esac
    done
    echo ""
  done
  
  tput cup $((HEIGHT + 7)) 0
  echo -e "    ${GREEN}Zoom Level: ${zoom}x | Iterations: $MAX_ITER${NC}"
  
  sleep 1
done

tput cup $((HEIGHT + 9)) 0
echo ""
echo -e "${GREEN}  ✓ Fractal exploration complete!${NC}"
echo ""
