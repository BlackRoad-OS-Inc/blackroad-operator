#!/usr/bin/env bash
# 3D star field flying through space
clear

WIDTH=60
HEIGHT=20

declare -a stars_x
declare -a stars_y
declare -a stars_z

# Initialize stars
for i in {0..50}; do
  stars_x[$i]=$((RANDOM % WIDTH))
  stars_y[$i]=$((RANDOM % HEIGHT))
  stars_z[$i]=$((RANDOM % 20 + 1))
done

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║            🌟 3D STAR FIELD 🌟                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "  Flying through space..."
echo ""

for frame in {1..30}; do
  # Clear screen
  tput cup 6 0
  
  # Draw frame border
  for ((y=0; y<HEIGHT; y++)); do
    echo -n "  "
    for ((x=0; x<WIDTH; x++)); do
      echo -n " "
    done
    echo ""
  done
  
  # Update and draw stars
  for i in {0..50}; do
    # Move star closer (decrease z)
    stars_z[$i]=$((stars_z[$i] - 1))
    
    # Reset if too close
    if [[ ${stars_z[$i]} -le 0 ]]; then
      stars_x[$i]=$((RANDOM % WIDTH))
      stars_y[$i]=$((RANDOM % HEIGHT))
      stars_z[$i]=20
    fi
    
    # Calculate perspective
    z=${stars_z[$i]}
    if [[ $z -gt 0 ]]; then
      scale=$((20 / z))
      x=$(( (stars_x[$i] - WIDTH/2) * scale / 10 + WIDTH/2 ))
      y=$(( (stars_y[$i] - HEIGHT/2) * scale / 10 + HEIGHT/2 ))
      
      # Draw star if in bounds
      if [[ $x -ge 0 && $x -lt $WIDTH && $y -ge 0 && $y -lt $HEIGHT ]]; then
        tput cup $((y + 6)) $((x + 2))
        
        if [[ $z -lt 5 ]]; then
          echo -ne "✦"
        elif [[ $z -lt 10 ]]; then
          echo -ne "⋆"
        else
          echo -ne "·"
        fi
      fi
    fi
  done
  
  sleep 0.1
done

tput cup $((HEIGHT + 8)) 0
echo ""
echo "  ✓ Warp speed complete!"
echo ""
