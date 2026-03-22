#!/bin/bash
# 3D WAVE INTERFERENCE PATTERN

awk 'BEGIN {
  pi = 3.14159265
  w = 70; h = 35
  t = 0
  
  while (1) {
    printf "\033[H\033[2J"
    printf "\033[96m╭─ 3D WAVE INTERFERENCE ─╮\033[0m\n"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        # Normalize coordinates
        nx = (x - w/2) / 12
        ny = (y - h/2) / 6
        
        # Two interfering wave sources
        d1 = sqrt((nx - 1.5)^2 + ny^2)
        d2 = sqrt((nx + 1.5)^2 + ny^2)
        
        # Superposition
        z = sin(d1 * 3 - t) + sin(d2 * 3 - t * 1.3)
        z = z + 0.5 * sin(sqrt(nx^2 + ny^2) * 2 + t * 0.7)
        
        # Brightness mapping
        bright = (z + 3) / 6
        
        if (bright < 0.15) { c = "\033[34m░" }
        else if (bright < 0.3) { c = "\033[36m▒" }
        else if (bright < 0.45) { c = "\033[96m▓" }
        else if (bright < 0.6) { c = "\033[97m█" }
        else if (bright < 0.75) { c = "\033[93m▓" }
        else if (bright < 0.9) { c = "\033[91m▒" }
        else { c = "\033[95m░" }
        
        printf "%s\033[0m", c
      }
      printf "\n"
    }
    
    t += 0.15
    system("sleep 0.04")
  }
}'
