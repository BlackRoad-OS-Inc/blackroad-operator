#!/usr/bin/env bash
# Conway's Game of Life
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        🧬 CONWAY'S GAME OF LIFE 🧬                   ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

WIDTH=40
HEIGHT=20

declare -a grid
declare -a next_grid

# Initialize random grid
for ((i=0; i<WIDTH*HEIGHT; i++)); do
  grid[$i]=$((RANDOM % 3 > 0 ? 0 : 1))
done

for generation in {1..30}; do
  tput cup 6 0
  
  # Draw grid
  for y in $(seq 0 $((HEIGHT-1))); do
    echo -n "    "
    for x in $(seq 0 $((WIDTH-1))); do
      idx=$((y * WIDTH + x))
      if [[ ${grid[$idx]} -eq 1 ]]; then
        echo -ne "${GREEN}██${NC}"
      else
        echo -n "  "
      fi
    done
    echo ""
  done
  
  # Calculate next generation
  for y in $(seq 0 $((HEIGHT-1))); do
    for x in $(seq 0 $((WIDTH-1))); do
      idx=$((y * WIDTH + x))
      
      # Count neighbors
      neighbors=0
      for dy in -1 0 1; do
        for dx in -1 0 1; do
          if [[ $dy -eq 0 && $dx -eq 0 ]]; then
            continue
          fi
          
          ny=$(( (y + dy + HEIGHT) % HEIGHT ))
          nx=$(( (x + dx + WIDTH) % WIDTH ))
          nidx=$((ny * WIDTH + nx))
          
          if [[ ${grid[$nidx]} -eq 1 ]]; then
            neighbors=$((neighbors + 1))
          fi
        done
      done
      
      # Apply rules
      if [[ ${grid[$idx]} -eq 1 ]]; then
        if [[ $neighbors -lt 2 || $neighbors -gt 3 ]]; then
          next_grid[$idx]=0
        else
          next_grid[$idx]=1
        fi
      else
        if [[ $neighbors -eq 3 ]]; then
          next_grid[$idx]=1
        else
          next_grid[$idx]=0
        fi
      fi
    done
  done
  
  # Copy next to current
  for ((i=0; i<WIDTH*HEIGHT; i++)); do
    grid[$i]=${next_grid[$i]}
  done
  
  # Show generation
  tput cup $((HEIGHT + 7)) 0
  echo -e "    ${YELLOW}Generation: $generation${NC}"
  
  sleep 0.2
done

tput cup $((HEIGHT + 9)) 0
echo ""
echo -e "${GREEN}  ✓ Evolution complete!${NC}"
echo ""
