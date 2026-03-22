#!/bin/bash
# PARTICLE TORNADO

awk 'BEGIN {
  pi = 3.14159265
  srand()
  w = 76; h = 42
  
  # Particles
  np = 300
  for (i = 0; i < np; i++) {
    # Cylindrical coords
    ph[i] = rand() * h          # height
    pa[i] = rand() * 2 * pi     # angle
    pr[i] = 0.5 + rand() * 0.5  # radius factor
    ps[i] = 0.8 + rand() * 0.4  # speed factor
  }
  
  t = 0
  
  while (1) {
    # Clear
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++)
        scr[y,x] = " "
    
    # Ground debris
    for (x = 0; x < w; x++) {
      if (rand() > 0.7)
        scr[h-1,x] = "\033[33m░\033[0m"
    }
    
    # Update and draw particles
    for (i = 0; i < np; i++) {
      # Height oscillation
      ph[i] += 0.3 * ps[i]
      if (ph[i] > h) {
        ph[i] = 0
        pa[i] = rand() * 2 * pi
      }
      
      # Radius narrows toward top (funnel shape)
      heightRatio = ph[i] / h
      radius = (1 - heightRatio * 0.7) * 15 * pr[i]
      
      # Spin faster at top
      spinSpeed = 0.15 * (1 + heightRatio * 2) * ps[i]
      pa[i] += spinSpeed
      
      # 3D position
      px3d = cos(pa[i]) * radius
      pz3d = sin(pa[i]) * radius
      py3d = h - 1 - ph[i]
      
      # Simple 3D to 2D (slight perspective)
      depth = (pz3d + 20) / 40
      screenX = int(w/2 + px3d * depth)
      screenY = int(py3d)
      
      if (screenX >= 0 && screenX < w && screenY >= 0 && screenY < h) {
        # Color by depth and height
        if (pz3d > 5) {
          # Front
          if (heightRatio > 0.7) { col = "\033[97m"; ch = "█" }
          else if (heightRatio > 0.4) { col = "\033[37m"; ch = "▓" }
          else { col = "\033[33m"; ch = "▒" }
        } else if (pz3d > -5) {
          # Middle
          if (heightRatio > 0.5) { col = "\033[90m"; ch = "▒" }
          else { col = "\033[33m"; ch = "░" }
        } else {
          # Back
          col = "\033[90m"; ch = "·"
        }
        
        scr[screenY,screenX] = col ch "\033[0m"
      }
    }
    
    # Flying debris
    for (d = 0; d < 15; d++) {
      da = t * 0.5 + d * 0.7
      dh = (t * 3 + d * 5) % h
      dr = (1 - dh/h * 0.7) * 18
      
      dx = int(w/2 + cos(da) * dr)
      dy = int(h - 1 - dh)
      
      if (dx >= 0 && dx < w && dy >= 0 && dy < h)
        scr[dy,dx] = "\033[91m✦\033[0m"
    }
    
    # Render
    printf "\033[H"
    printf "\033[33m  🌪 TORNADO SIMULATION 🌪\033[0m\n"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++)
        printf "%s", scr[y,x]
      printf "\n"
    }
    
    t += 0.1
    system("sleep 0.04")
  }
}'
