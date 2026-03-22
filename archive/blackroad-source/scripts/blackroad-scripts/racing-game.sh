#!/usr/bin/env bash
# ASCII racing game
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear
echo ""
echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║${NC}        🏎️  RACING GAME 🏎️                          ${YELLOW}║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Game state
car_x=20
road_pos=0
obstacles=()
score=0

for frame in {1..50}; do
  tput cup 6 0
  
  # Generate obstacles
  if [[ $((frame % 5)) -eq 0 ]]; then
    obstacles+=($((RANDOM % 30 + 5)))
  fi
  
  # Draw road
  echo -e "    ${GREEN}╔═══════════════════════════════════════════╗${NC}"
  
  for y in {1..15}; do
    echo -n "    ${GREEN}║${NC}"
    
    # Road lines
    for x in {1..43}; do
      # Player car
      if [[ $y -eq 12 && $x -eq $car_x ]]; then
        echo -ne "${CYAN}▄▀▄${NC}"
        x=$((x + 2))
      # Obstacles
      elif [[ $y -eq 3 ]]; then
        obstacle_drawn=0
        for obs in "${obstacles[@]}"; do
          if [[ $x -eq $obs ]]; then
            echo -ne "${RED}╳${NC}"
            obstacle_drawn=1
            break
          fi
        done
        if [[ $obstacle_drawn -eq 0 ]]; then
          echo -n " "
        fi
      # Road markers
      elif [[ $x -eq 21 && $(((y + road_pos) % 3)) -eq 0 ]]; then
        echo -ne "${YELLOW}|${NC}"
      else
        echo -n " "
      fi
    done
    
    echo -e "${GREEN}║${NC}"
  done
  
  echo -e "    ${GREEN}╚═══════════════════════════════════════════╝${NC}"
  
  # Update obstacles
  for i in "${!obstacles[@]}"; do
    obstacles[$i]=$((obstacles[$i] + 1))
    
    # Check collision
    if [[ ${obstacles[$i]} -ge $car_x && ${obstacles[$i]} -le $((car_x + 2)) ]]; then
      tput cup 24 0
      echo -e "    ${RED}💥 CRASH! Game Over!${NC}"
      echo ""
      exit 0
    fi
    
    # Remove off-screen obstacles
    if [[ ${obstacles[$i]} -gt 43 ]]; then
      unset 'obstacles[i]'
      score=$((score + 1))
    fi
  done
  
  # Simple AI movement
  car_x=$((15 + (frame % 10)))
  
  # Keep car on road
  if [[ $car_x -lt 5 ]]; then
    car_x=5
  elif [[ $car_x -gt 35 ]]; then
    car_x=35
  fi
  
  road_pos=$((road_pos + 1))
  
  # Show score
  tput cup 24 0
  echo -e "    ${GREEN}Distance: $score | Speed: FAST!${NC}"
  
  sleep 0.15
done

tput cup 26 0
echo ""
echo -e "${GREEN}  ✓ Race complete! Distance: $score${NC}"
echo ""
