#!/usr/bin/env bash
# Tetris clone!
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        🎮 TETRIS GAME 🎮                             ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}  Blocks falling... (Demo mode)${NC}"
echo ""

# Game constants
WIDTH=10
HEIGHT=20

# Board
declare -a board

# Initialize board
for ((i=0; i<HEIGHT*WIDTH; i++)); do
  board[$i]=0
done

# Tetromino shapes
shapes=(
  "0,0,1,0,2,0,3,0"  # I
  "0,0,0,1,1,0,1,1"  # O
  "0,1,1,0,1,1,2,1"  # T
  "0,0,1,0,1,1,2,1"  # L
)

score=0

for move in {1..30}; do
  # Clear screen
  tput cup 6 0
  
  # Draw border
  echo "    ╔$(printf '═%.0s' $(seq 1 $((WIDTH*2))))╗"
  
  # Spawn new piece
  shape=${shapes[$((RANDOM % ${#shapes[@]}))]}
  piece_y=$((move % (HEIGHT - 4)))
  
  for y in $(seq 0 $((HEIGHT-1))); do
    echo -n "    ║"
    
    for x in $(seq 0 $((WIDTH-1))); do
      idx=$((y * WIDTH + x))
      
      # Check if piece at this position
      piece_here=0
      IFS=',' read -ra coords <<< "$shape"
      for ((i=0; i<${#coords[@]}; i+=2)); do
        px=${coords[$i]}
        py=${coords[$((i+1))]}
        if [[ $((px + 3)) -eq $x && $((py + piece_y)) -eq $y ]]; then
          piece_here=1
          break
        fi
      done
      
      if [[ $piece_here -eq 1 ]]; then
        echo -ne "${CYAN}██${NC}"
      elif [[ ${board[$idx]} -eq 1 ]]; then
        echo -ne "${GREEN}██${NC}"
      else
        echo -n "  "
      fi
    done
    
    echo "║"
  done
  
  echo "    ╚$(printf '═%.0s' $(seq 1 $((WIDTH*2))))╝"
  
  # "Land" the piece
  if [[ $((move % 5)) -eq 0 ]]; then
    IFS=',' read -ra coords <<< "$shape"
    for ((i=0; i<${#coords[@]}; i+=2)); do
      px=${coords[$i]}
      py=${coords[$((i+1))]}
      idx=$(( (py + piece_y) * WIDTH + (px + 3) ))
      if [[ $idx -ge 0 && $idx -lt $((HEIGHT*WIDTH)) ]]; then
        board[$idx]=1
      fi
    done
    score=$((score + 10))
  fi
  
  # Show score
  tput cup $((HEIGHT + 8)) 0
  echo -e "    ${GREEN}Score: $score | Lines: $((score / 100))${NC}"
  
  sleep 0.2
done

tput cup $((HEIGHT + 10)) 0
echo ""
echo -e "${GREEN}  ✓ Demo complete! Score: $score${NC}"
echo ""
