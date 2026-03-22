#!/usr/bin/env bash
# Breakout brick breaker game!
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo ""
echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║${NC}        🧱 BREAKOUT GAME 🧱                           ${YELLOW}║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

WIDTH=40
HEIGHT=20

# Game state
paddle_x=15
paddle_width=8
ball_x=20
ball_y=15
ball_dx=1
ball_dy=-1
score=0

# Create bricks
declare -a bricks
for row in {0..4}; do
  for col in {0..7}; do
    bricks+=("$((col * 5 + 2)),$((row + 2)),1")
  done
done

for frame in {1..50}; do
  tput cup 6 0
  
  # Draw border and bricks
  echo "    ╔$(printf '═%.0s' $(seq 1 $WIDTH))╗"
  
  for y in $(seq 0 $((HEIGHT-1))); do
    echo -n "    ║"
    
    for x in $(seq 0 $((WIDTH-1))); do
      # Draw bricks
      brick_here=0
      for brick in "${bricks[@]}"; do
        IFS=',' read -ra b <<< "$brick"
        if [[ ${b[2]} -eq 1 && $x -ge ${b[0]} && $x -lt $((b[0] + 4)) && $y -eq ${b[1]} ]]; then
          brick_here=1
          break
        fi
      done
      
      if [[ $brick_here -eq 1 ]]; then
        if [[ ${b[1]} -eq 2 ]]; then
          echo -ne "${RED}▓${NC}"
        elif [[ ${b[1]} -eq 3 ]]; then
          echo -ne "${YELLOW}▓${NC}"
        else
          echo -ne "${GREEN}▓${NC}"
        fi
      # Draw ball
      elif [[ $x -eq $ball_x && $y -eq $ball_y ]]; then
        echo -ne "${CYAN}●${NC}"
      # Draw paddle
      elif [[ $y -eq $((HEIGHT-2)) && $x -ge $paddle_x && $x -lt $((paddle_x + paddle_width)) ]]; then
        echo -ne "${MAGENTA}█${NC}"
      else
        echo -n " "
      fi
    done
    
    echo "║"
  done
  
  echo "    ╚$(printf '═%.0s' $(seq 1 $WIDTH))╝"
  
  # Update ball
  ball_x=$((ball_x + ball_dx))
  ball_y=$((ball_y + ball_dy))
  
  # Wall collisions
  if [[ $ball_x -le 0 || $ball_x -ge $((WIDTH-1)) ]]; then
    ball_dx=$((-ball_dx))
  fi
  
  if [[ $ball_y -le 0 ]]; then
    ball_dy=$((-ball_dy))
  fi
  
  # Paddle collision
  if [[ $ball_y -eq $((HEIGHT-3)) && $ball_x -ge $paddle_x && $ball_x -lt $((paddle_x + paddle_width)) ]]; then
    ball_dy=$((-ball_dy))
  fi
  
  # Brick collision
  for i in "${!bricks[@]}"; do
    IFS=',' read -ra b <<< "${bricks[$i]}"
    if [[ ${b[2]} -eq 1 && $ball_x -ge ${b[0]} && $ball_x -lt $((b[0] + 4)) && $ball_y -eq ${b[1]} ]]; then
      bricks[$i]="${b[0]},${b[1]},0"
      ball_dy=$((-ball_dy))
      score=$((score + 10))
    fi
  done
  
  # Auto-move paddle
  if [[ $ball_x -gt $((paddle_x + paddle_width/2)) ]]; then
    paddle_x=$((paddle_x + 1))
  else
    paddle_x=$((paddle_x - 1))
  fi
  
  # Keep paddle in bounds
  if [[ $paddle_x -lt 0 ]]; then
    paddle_x=0
  elif [[ $paddle_x -gt $((WIDTH - paddle_width)) ]]; then
    paddle_x=$((WIDTH - paddle_width))
  fi
  
  # Show score
  tput cup $((HEIGHT + 8)) 0
  echo -e "    ${GREEN}Score: $score | Bricks: $((400 - score/10))${NC}"
  
  sleep 0.1
done

tput cup $((HEIGHT + 10)) 0
echo ""
echo -e "${GREEN}  ✓ Game Over! Score: $score${NC}"
echo ""
