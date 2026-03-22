#!/bin/bash
# SPIRAL GALAXY SIMULATION

awk 'BEGIN {
  pi = 3.14159265
  srand()
  w = 76; h = 38
  
  # Generate star positions in spiral arms
  nstars = 400
  for (i = 0; i < nstars; i++) {
    arm = int(rand() * 2) * pi  # 2 arms
    dist = rand()^0.5 * 0.9
    angle = dist * 4 * pi + arm
    spread = (rand() - 0.5) * 0.3 * (1 - dist * 0.5)
    
    sx[i] = cos(angle + spread) * dist
    sy[i] = sin(angle + spread) * dist * 0.5  # flatten
    sb[i] = 1 - dist * 0.7 + rand() * 0.2  # brightness
    sc[i] = int(rand() * 3)  # color type
  }
  
  # Central bulge stars
  for (i = nstars; i < nstars + 80; i++) {
    r = rand()^2 * 0.15
    a = rand() * 2 * pi
    sx[i] = cos(a) * r
    sy[i] = sin(a) * r * 0.5
    sb[i] = 0.9 + rand() * 0.1
    sc[i] = 3  # yellow/white core
  }
  nstars += 80
  
  rot = 0
  
  while (1) {
    # Clear screen buffer
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++)
        scr[y,x] = " "
    
    # Rotate and project stars
    cr = cos(rot); sr = sin(rot)
    
    for (i = 0; i < nstars; i++) {
      # Rotate
      rx = sx[i] * cr - sy[i] * sr
      ry = sx[i] * sr + sy[i] * cr
      
      # Project to screen
      px = int((rx + 1) * w / 2)
      py = int((0.5 - ry) * h)
      
      if (px >= 0 && px < w && py >= 0 && py < h) {
        b = sb[i]
        t = sc[i]
        
        if (t == 0) col = (b > 0.7) ? "\033[96m" : "\033[34m"
        else if (t == 1) col = (b > 0.7) ? "\033[97m" : "\033[37m"
        else if (t == 2) col = (b > 0.7) ? "\033[95m" : "\033[35m"
        else col = (b > 0.8) ? "\033[93m" : "\033[33m"
        
        ch = (b > 0.85) ? "*" : (b > 0.6) ? "+" : (b > 0.35) ? "·" : "."
        
        scr[py,px] = col ch "\033[0m"
      }
    }
    
    # Render
    printf "\033[H"
    printf "\033[35m  ✦ SPIRAL GALAXY M31 ✦\033[0m\n"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++)
        printf "%s", scr[y,x]
      printf "\n"
    }
    
    rot += 0.02
    system("sleep 0.05")
  }
}'
