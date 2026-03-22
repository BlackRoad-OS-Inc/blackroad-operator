#!/usr/bin/env bash
# Rotating 3D sphere with shading
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}        🌍 3D ROTATING SPHERE 🌍                      ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

radius=10

for frame in {0..40}; do
  tput cup 6 15
  
  for y in $(seq -$radius $radius); do
    echo -n "    "
    for x in $(seq -$radius $radius); do
      # Calculate if point is on sphere
      dist_sq=$((x*x + y*y))
      sphere_sq=$((radius*radius))
      
      if [[ $dist_sq -le $sphere_sq ]]; then
        # Calculate z coordinate
        z_sq=$((sphere_sq - dist_sq))
        
        # Shade based on distance from center
        if [[ $dist_sq -lt $((sphere_sq / 3)) ]]; then
          echo -ne "${YELLOW}██${NC}"
        elif [[ $dist_sq -lt $((sphere_sq * 2 / 3)) ]]; then
          echo -ne "${GREEN}▓▓${NC}"
        else
          echo -ne "${CYAN}░░${NC}"
        fi
      else
        echo -n "  "
      fi
    done
    echo ""
  done
  
  sleep 0.1
  radius=$(( 8 + (frame % 4) ))
done

tput cup 30 0
echo -e "${GREEN}  ✓ Planet rendered!${NC}"
echo ""
