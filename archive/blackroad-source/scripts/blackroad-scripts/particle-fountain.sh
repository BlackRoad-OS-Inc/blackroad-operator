#!/usr/bin/env bash
# Particle fountain simulation
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        ⛲ PARTICLE FOUNTAIN ⛲                       ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Particle arrays
declare -a particles_x
declare -a particles_y
declare -a particles_vx
declare -a particles_vy

for frame in {1..60}; do
  # Spawn new particles
  if [[ $((frame % 2)) -eq 0 ]]; then
    particles_x+=(25)
    particles_y+=(20)
    particles_vx+=($((RANDOM % 5 - 2)))
    particles_vy+=($((-3 - RANDOM % 3)))
  fi
  
  # Clear screen
  tput cup 6 0
  for line in {1..20}; do
    echo "                                                            "
  done
  
  # Update and draw particles
  for i in "${!particles_x[@]}"; do
    # Apply gravity
    particles_vy[$i]=$((particles_vy[$i] + 1))
    
    # Update position
    particles_x[$i]=$((particles_x[$i] + particles_vx[$i]))
    particles_y[$i]=$((particles_y[$i] + particles_vy[$i]))
    
    # Draw if in bounds
    y=${particles_y[$i]}
    x=${particles_x[$i]}
    
    if [[ $y -ge 6 && $y -le 25 && $x -ge 0 && $x -lt 50 ]]; then
      tput cup $y $x
      
      # Color based on height
      if [[ $y -lt 12 ]]; then
        echo -ne "${YELLOW}•${NC}"
      elif [[ $y -lt 18 ]]; then
        echo -ne "${CYAN}•${NC}"
      else
        echo -ne "${MAGENTA}•${NC}"
      fi
    fi
    
    # Remove if off screen
    if [[ $y -gt 25 ]]; then
      unset 'particles_x[i]'
      unset 'particles_y[i]'
      unset 'particles_vx[i]'
      unset 'particles_vy[i]'
    fi
  done
  
  sleep 0.05
done

tput cup 27 0
echo ""
echo -e "${CYAN}  ✓ Fountain show complete!${NC}"
echo ""
