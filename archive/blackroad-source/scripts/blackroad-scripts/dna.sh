#!/bin/bash
# ROTATING DNA DOUBLE HELIX

awk 'BEGIN {
  pi = 3.14159265
  w = 60; h = 40
  t = 0
  
  # Base pair colors
  split("A T G C", bases, " ")
  split("\033[91m \033[92m \033[93m \033[94m", bcol, " ")
  
  while (1) {
    printf "\033[H\033[2J"
    printf "\033[95m╔══════ DNA DOUBLE HELIX ══════╗\033[0m\n"
    
    for (y = 0; y < h; y++) {
      line = ""
      
      # Vertical position maps to helix phase
      phase = y * 0.4 + t
      
      # Two strands, 180° apart
      x1 = sin(phase) * 12 + w/2
      x2 = sin(phase + pi) * 12 + w/2
      
      # Z-depth for shading
      z1 = cos(phase)
      z2 = cos(phase + pi)
      
      for (x = 0; x < w; x++) {
        drawn = 0
        
        # Strand 1 backbone
        if (int(x1) == x) {
          if (z1 > 0) line = line "\033[97m●\033[0m"
          else line = line "\033[90m○\033[0m"
          drawn = 1
        }
        # Strand 2 backbone
        else if (int(x2) == x) {
          if (z2 > 0) line = line "\033[97m●\033[0m"
          else line = line "\033[90m○\033[0m"
          drawn = 1
        }
        # Base pairs (rungs) - only when strands are at similar depth
        else if (x > (x1 < x2 ? x1 : x2) && x < (x1 > x2 ? x1 : x2)) {
          # Only draw rungs at certain intervals
          if (y % 2 == 0) {
            mid = (x1 + x2) / 2
            distFromMid = (x - mid) / ((x1 > x2 ? x1 - x2 : x2 - x1) / 2)
            
            # Determine base pair type based on y position
            bp = (int(y / 2) % 4) + 1
            
            # Draw base pair with color
            if (z1 > -0.3 && z2 > -0.3) {
              if (int(x - x1) == int((x2 - x1) / 3)) {
                line = line bcol[bp] bases[bp] "\033[0m"
                drawn = 1
              } else if (int(x - x1) == int(2 * (x2 - x1) / 3)) {
                # Complementary base
                comp = (bp == 1) ? 2 : (bp == 2) ? 1 : (bp == 3) ? 4 : 3
                line = line bcol[comp] bases[comp] "\033[0m"
                drawn = 1
              } else {
                line = line "\033[90m─\033[0m"
                drawn = 1
              }
            } else {
              line = line " "
              drawn = 1
            }
          }
        }
        
        if (!drawn) line = line " "
      }
      
      printf "%s\n", line
    }
    
    printf "\033[92m  A\033[0m=Adenine \033[91mT\033[0m=Thymine "
    printf "\033[93mG\033[0m=Guanine \033[94mC\033[0m=Cytosine\n"
    
    t += 0.15
    system("sleep 0.06")
  }
}'
