#!/bin/bash
# FLUID RIPPLE SIMULATION

awk 'BEGIN {
  w = 76; h = 38
  damp = 0.98
  
  # Initialize buffers
  for (y = 0; y < h; y++)
    for (x = 0; x < w; x++) {
      buf1[y,x] = 0
      buf2[y,x] = 0
    }
  
  frame = 0
  
  while (1) {
    # Random drops
    if (rand() > 0.9) {
      dx = int(rand() * (w - 4)) + 2
      dy = int(rand() * (h - 4)) + 2
      buf1[dy,dx] = 255
    }
    
    # Propagate waves
    for (y = 1; y < h - 1; y++) {
      for (x = 1; x < w - 1; x++) {
        # Wave equation (average of neighbors - current)
        val = (buf1[y-1,x] + buf1[y+1,x] + buf1[y,x-1] + buf1[y,x+1]) / 2 - buf2[y,x]
        val *= damp
        buf2[y,x] = val
      }
    }
    
    # Render
    printf "\033[H"
    printf "\033[96m  ≋ FLUID RIPPLE SIMULATION ≋\033[0m\n"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        v = buf2[y,x]
        
        if (v > 100) printf "\033[97m█\033[0m"
        else if (v > 60) printf "\033[96m▓\033[0m"
        else if (v > 30) printf "\033[36m▒\033[0m"
        else if (v > 10) printf "\033[34m░\033[0m"
        else if (v > 0) printf "\033[34m·\033[0m"
        else if (v < -60) printf "\033[90m▓\033[0m"
        else if (v < -30) printf "\033[90m▒\033[0m"
        else if (v < -10) printf "\033[90m░\033[0m"
        else printf " "
      }
      printf "\n"
    }
    
    # Swap buffers
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++) {
        tmp = buf1[y,x]
        buf1[y,x] = buf2[y,x]
        buf2[y,x] = tmp
      }
    
    frame++
    system("sleep 0.03")
  }
}'
