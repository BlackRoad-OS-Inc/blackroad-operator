#!/bin/bash
# SPINNING VORTEX TUNNEL

awk 'BEGIN {
  pi = 3.14159265
  w = 78; h = 42
  t = 0
  
  while (1) {
    printf "\033[H"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        # Center coordinates
        cx = (x - w/2) / (w/4)
        cy = (y - h/2) / (h/4) * 1.8
        
        # Polar coordinates
        r = sqrt(cx*cx + cy*cy)
        angle = atan2(cy, cx)
        
        if (r < 0.1) {
          printf "\033[97m@\033[0m"
        } else {
          # Spiral twist increases toward center
          twist = t * 2 + 8 / (r + 0.5)
          spiralAngle = angle + twist
          
          # Tunnel depth rings
          depth = 1 / (r + 0.1) + t * 3
          
          # Pattern
          pattern = sin(spiralAngle * 4) * cos(depth)
          
          # Color based on depth and pattern
          brightness = (pattern + 1) / 2
          depthShade = 1 / (r * 2 + 1)
          
          val = brightness * depthShade
          
          if (val > 0.7) printf "\033[97m█\033[0m"
          else if (val > 0.5) printf "\033[95m▓\033[0m"
          else if (val > 0.35) printf "\033[35m▒\033[0m"
          else if (val > 0.2) printf "\033[34m░\033[0m"
          else if (val > 0.1) printf "\033[90m·\033[0m"
          else printf " "
        }
      }
      printf "\n"
    }
    
    printf "\033[95m  ◎ HYPNOTIC VORTEX TUNNEL ◎\033[0m\n"
    
    t += 0.08
    system("sleep 0.03")
  }
}'
