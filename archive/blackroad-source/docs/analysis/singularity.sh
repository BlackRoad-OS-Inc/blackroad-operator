#!/bin/bash
# GRAVITATIONAL SINGULARITY COLLAPSE

awk 'BEGIN {
  pi = 3.14159265
  srand()
  w = 78; h = 42
  
  # Generate particles
  np = 500
  for (i = 0; i < np; i++) {
    angle = rand() * 2 * pi
    dist = 0.3 + rand()^0.5 * 0.7
    px[i] = cos(angle) * dist
    py[i] = sin(angle) * dist * 0.6
    vx[i] = -sin(angle) * 0.02 + (rand()-0.5)*0.01
    vy[i] = cos(angle) * 0.02 * 0.6 + (rand()-0.5)*0.01
    mass[i] = 0.5 + rand() * 0.5
    alive[i] = 1
  }
  
  t = 0
  consumed = 0
  
  while (1) {
    # Clear
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++)
        scr[y,x] = " "
    
    # Singularity gravity strength increases over time
    G = 0.00008 * (1 + t * 0.01)
    
    # Update particles
    living = 0
    for (i = 0; i < np; i++) {
      if (!alive[i]) continue
      
      # Distance to center
      r = sqrt(px[i]^2 + py[i]^2)
      
      # Consumed by singularity
      if (r < 0.05) {
        alive[i] = 0
        consumed++
        continue
      }
      
      # Gravitational acceleration
      ax = -G * px[i] / (r^3 + 0.001)
      ay = -G * py[i] / (r^3 + 0.001)
      
      # Spaghettification (tidal forces)
      if (r < 0.2) {
        stretch = 0.2 / r
        tang_x = -py[i] / r
        tang_y = px[i] / r
        vx[i] += tang_x * 0.001 * stretch
        vy[i] += tang_y * 0.001 * stretch
      }
      
      vx[i] += ax
      vy[i] += ay
      px[i] += vx[i]
      py[i] += vy[i]
      
      # Project to screen
      sx = int((px[i] + 1) * w / 2)
      sy = int((1 - py[i]) * h / 2)
      
      if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
        # Color based on velocity/temperature
        v = sqrt(vx[i]^2 + vy[i]^2)
        
        if (v > 0.05) { col = "\033[97m"; ch = "█" }
        else if (v > 0.03) { col = "\033[93m"; ch = "▓" }
        else if (v > 0.02) { col = "\033[91m"; ch = "▒" }
        else if (v > 0.01) { col = "\033[31m"; ch = "░" }
        else { col = "\033[90m"; ch = "·" }
        
        scr[sy,sx] = col ch "\033[0m"
        living++
      }
    }
    
    # Draw singularity
    cx = int(w/2); cy = int(h/2)
    for (dy = -2; dy <= 2; dy++) {
      for (dx = -3; dx <= 3; dx++) {
        if (dx*dx/9 + dy*dy/4 <= 1) {
          scr[cy+dy, cx+dx] = "\033[40m \033[0m"
        }
      }
    }
    
    # Hawking radiation (random flickers at edge)
    if (rand() > 0.7) {
      ra = rand() * 2 * pi
      scr[int(cy + sin(ra)*3), int(cx + cos(ra)*4)] = "\033[95m✦\033[0m"
    }
    
    # Render
    printf "\033[H"
    printf "\033[91m  ◉ GRAVITATIONAL SINGULARITY ◉\033[0m\n"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++)
        printf "%s", scr[y,x]
      printf "\n"
    }
    
    printf "\033[90m  particles: %d | consumed: %d | mass: %.1f\033[0m\n", living, consumed, consumed * 0.5
    
    t++
    system("sleep 0.04")
  }
}'
