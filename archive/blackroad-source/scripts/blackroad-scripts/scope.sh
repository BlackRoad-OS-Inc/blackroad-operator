#!/bin/bash
# OSCILLOSCOPE - LISSAJOUS CURVES

awk 'BEGIN {
  pi = 3.14159265
  w = 76; h = 40
  
  # Trail buffer
  trail_len = 400
  ti = 0
  
  t = 0
  
  # Frequency ratio (creates different patterns)
  fx = 3; fy = 4
  
  while (1) {
    # Clear
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++)
        scr[y,x] = " "
    
    # Draw grid
    for (x = 0; x < w; x++) {
      scr[h/2,x] = "\033[32m─\033[0m"
    }
    for (y = 0; y < h; y++) {
      scr[y,w/2] = "\033[32m│\033[0m"
    }
    scr[h/2,w/2] = "\033[32m┼\033[0m"
    
    # Draw graticule
    for (x = w/4; x < w; x += w/4)
      for (y = h/4; y < h; y += h/4)
        if (scr[y,x] == " ") scr[y,x] = "\033[32m·\033[0m"
    
    # Compute current position (Lissajous)
    px = sin(t * fx) * 0.85
    py = sin(t * fy + pi/4) * 0.85
    
    # Store in trail
    trailX[ti] = px
    trailY[ti] = py
    ti = (ti + 1) % trail_len
    
    # Draw trail (phosphor decay effect)
    for (i = 0; i < trail_len; i++) {
      idx = (ti + i) % trail_len
      age = i / trail_len
      
      sx = int((trailX[idx] + 1) * w / 2)
      sy = int((1 - trailY[idx]) * h / 2)
      
      if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
        if (age > 0.95) { col = "\033[97m"; ch = "█" }
        else if (age > 0.85) { col = "\033[92m"; ch = "▓" }
        else if (age > 0.6) { col = "\033[32m"; ch = "▒" }
        else if (age > 0.3) { col = "\033[32m"; ch = "░" }
        else { col = "\033[90m"; ch = "·" }
        
        scr[sy,sx] = col ch "\033[0m"
      }
    }
    
    # Render
    printf "\033[H"
    printf "\033[92m╔═══════════════════════════════════════════════════════════════════════╗\033[0m\n"
    printf "\033[92m║\033[0m \033[97mOSCILLOSCOPE\033[0m  Freq: %d:%d  Phase: π/4                                \033[92m║\033[0m\n", fx, fy
    printf "\033[92m╠═══════════════════════════════════════════════════════════════════════╣\033[0m\n"
    
    for (y = 0; y < h; y++) {
      printf "\033[92m║\033[0m"
      for (x = 0; x < w; x++)
        printf "%s", scr[y,x]
      printf "\033[92m║\033[0m\n"
    }
    
    printf "\033[92m╚═══════════════════════════════════════════════════════════════════════╝\033[0m\n"
    
    t += 0.04
    
    # Slowly evolve frequency ratio
    if (int(t) % 200 == 0 && int(t) != int(t - 0.04)) {
      fx = 1 + int(rand() * 5)
      fy = 1 + int(rand() * 5)
    }
    
    system("sleep 0.02")
  }
}'
