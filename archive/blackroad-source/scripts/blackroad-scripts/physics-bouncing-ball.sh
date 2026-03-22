#!/usr/bin/env bash
# Physics simulation - bouncing ball with gravity
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        ⚽ PHYSICS SIMULATOR ⚽                       ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}  Simulating gravity and bounce...${NC}"
echo ""

# Physics constants
GRAVITY=1
DAMPING=0.85
FLOOR=20

# Initial conditions
y=2
velocity=0

for frame in {1..100}; do
  # Apply gravity
  velocity=$((velocity + GRAVITY))
  
  # Update position
  y=$((y + velocity))
  
  # Check floor collision
  if [[ $y -ge $FLOOR ]]; then
    y=$FLOOR
    velocity=$(echo "$velocity * -$DAMPING" | bc -l | cut -d. -f1)
    
    # Stop if velocity too low
    if [[ $velocity -gt -2 && $velocity -lt 2 ]]; then
      velocity=0
    fi
  fi
  
  # Clear and draw
  tput cup 6 0
  for line in {1..22}; do
    echo "                                                            "
  done
  
  # Draw floor
  tput cup $((FLOOR + 6)) 0
  echo -e "    ${GREEN}═════════════════════════════════════════════${NC}"
  
  # Draw ball
  tput cup $((y + 6)) 20
  echo -e "${RED}    ●${NC}"
  
  # Show stats
  tput cup 28 0
  echo -e "    ${CYAN}Position: $y | Velocity: $velocity${NC}"
  
  sleep 0.05
done

tput cup 30 0
echo ""
echo -e "${GREEN}  ✓ Physics simulation complete!${NC}"
echo ""
