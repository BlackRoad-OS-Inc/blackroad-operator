#!/usr/bin/env bash
# Pong game!
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        🏓 PONG GAME 🏓                               ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}  Use 'w' and 's' to move paddle (demo mode)${NC}"
echo ""

# Game constants
WIDTH=50
HEIGHT=20

# Ball position and velocity
ball_x=25
ball_y=10
ball_dx=1
ball_dy=1

# Paddle
paddle_y=8
paddle_height=4

# Score
score=0

for frame in {1..50}; do
  # Clear field
  tput cup 6 0
  
  # Draw border
  echo "    ╔$(printf '═%.0s' $(seq 1 $WIDTH))╗"
  
  for y in $(seq 1 $HEIGHT); do
    echo -n "    ║"
    
    for x in $(seq 1 $WIDTH); do
      # Draw ball
      if [[ $x -eq $ball_x && $y -eq $ball_y ]]; then
        echo -ne "${YELLOW}●${NC}"
      # Draw paddle
      elif [[ $x -eq 3 && $y -ge $paddle_y && $y -lt $((paddle_y + paddle_height)) ]]; then
        echo -ne "${CYAN}█${NC}"
      else
        echo -n " "
      fi
    done
    
    echo "║"
  done
  
  echo "    ╚$(printf '═%.0s' $(seq 1 $WIDTH))╝"
  
  # Update ball position
  ball_x=$((ball_x + ball_dx))
  ball_y=$((ball_y + ball_dy))
  
  # Bounce off walls
  if [[ $ball_y -le 1 || $ball_y -ge $HEIGHT ]]; then
    ball_dy=$((-ball_dy))
  fi
  
  if [[ $ball_x -ge $WIDTH ]]; then
    ball_dx=$((-ball_dx))
  fi
  
  # Paddle collision
  if [[ $ball_x -le 4 && $ball_y -ge $paddle_y && $ball_y -lt $((paddle_y + paddle_height)) ]]; then
    ball_dx=$((-ball_dx))
    score=$((score + 1))
  fi
  
  # Game over
  if [[ $ball_x -le 1 ]]; then
    break
  fi
  
  # Auto-move paddle (AI)
  if [[ $ball_y -gt $((paddle_y + 2)) ]]; then
    paddle_y=$((paddle_y + 1))
  elif [[ $ball_y -lt $paddle_y ]]; then
    paddle_y=$((paddle_y - 1))
  fi
  
  # Keep paddle in bounds
  if [[ $paddle_y -lt 1 ]]; then
    paddle_y=1
  elif [[ $paddle_y -gt $((HEIGHT - paddle_height)) ]]; then
    paddle_y=$((HEIGHT - paddle_height))
  fi
  
  # Show score
  tput cup $((HEIGHT + 8)) 0
  echo -e "    ${GREEN}Score: $score${NC}"
  
  sleep 0.1
done

tput cup $((HEIGHT + 10)) 0
echo ""
echo -e "${GREEN}  ✓ Game Over! Final Score: $score${NC}"
echo ""
