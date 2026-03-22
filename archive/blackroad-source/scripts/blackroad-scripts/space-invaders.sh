#!/usr/bin/env bash
# Space Invaders!
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        👾 SPACE INVADERS 👾                         ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Game state
player_x=25
bullet_x=-1
bullet_y=-1
invaders=()
score=0

# Initialize invaders
for row in {0..2}; do
  for col in {0..5}; do
    invaders+=("$((10 + col * 5)),$((2 + row * 2)),1")
  done
done

for frame in {1..40}; do
  tput cup 6 0
  
  # Clear field
  for line in {1..20}; do
    echo "                                                            "
  done
  
  tput cup 6 0
  
  # Draw invaders
  for invader in "${invaders[@]}"; do
    IFS=',' read -ra inv <<< "$invader"
    if [[ ${inv[2]} -eq 1 ]]; then
      tput cup $((6 + inv[1])) ${inv[0]}
      echo -ne "${RED}👾${NC}"
    fi
  done
  
  # Draw player
  tput cup 20 $player_x
  echo -ne "${GREEN}▲${NC}"
  
  # Draw bullet
  if [[ $bullet_y -ge 0 ]]; then
    tput cup $((6 + bullet_y)) $bullet_x
    echo -ne "${YELLOW}|${NC}"
    
    # Update bullet
    bullet_y=$((bullet_y - 1))
    
    # Check collisions
    for i in "${!invaders[@]}"; do
      IFS=',' read -ra inv <<< "${invaders[$i]}"
      if [[ ${inv[2]} -eq 1 && $bullet_x -ge ${inv[0]} && $bullet_x -le $((inv[0] + 2)) && $bullet_y -eq ${inv[1]} ]]; then
        invaders[$i]="${inv[0]},${inv[1]},0"
        bullet_y=-1
        score=$((score + 10))
      fi
    done
    
    if [[ $bullet_y -lt 0 ]]; then
      bullet_y=-1
    fi
  fi
  
  # Move player (auto)
  player_x=$(( 15 + (frame % 20) ))
  
  # Fire bullet
  if [[ $((frame % 5)) -eq 0 && $bullet_y -lt 0 ]]; then
    bullet_x=$player_x
    bullet_y=19
  fi
  
  # Move invaders
  if [[ $((frame % 3)) -eq 0 ]]; then
    for i in "${!invaders[@]}"; do
      IFS=',' read -ra inv <<< "${invaders[$i]}"
      if [[ ${inv[2]} -eq 1 ]]; then
        invaders[$i]="${inv[0]},$((inv[1] + 1)),${inv[2]}"
      fi
    done
  fi
  
  # Show score
  tput cup 27 0
  echo -e "    ${GREEN}Score: $score | Aliens Destroyed: $((score / 10))${NC}"
  
  sleep 0.15
done

tput cup 29 0
echo ""
echo -e "${GREEN}  ✓ Mission complete! Score: $score${NC}"
echo ""
