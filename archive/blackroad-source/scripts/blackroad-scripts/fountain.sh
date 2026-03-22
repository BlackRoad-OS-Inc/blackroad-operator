#!/bin/bash
# PARTICLE FOUNTAIN WITH PHYSICS

awk 'BEGIN {
  srand()
  w = 76; h = 40
  maxp = 300
  gravity = 0.15
  
  np = 0
  
  while (1) {
    # Spawn new particles
    for (s = 0; s < 8; s++) {
      if (np < maxp) {
        px[np] = w/2 + (rand() - 0.5) * 4
        py[np] = h - 3
        vx[np] = (rand() - 0.5) * 3
        vy[np] = -rand() * 4 - 2.5
        life[np] = 60 + rand() * 40
        ptype[np] = int(rand() * 4)
        np++
      }
    }
    
    # Clear
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++)
        scr[y,x] = " "
    
    # Draw pool
    for (x = w/2 - 15; x < w/2 + 15; x++) {
      if (x >= 0 && x < w)
        scr[h-1,x] = "\033[44m \033[0m"
    }
    
    # Update and draw particles
    alive = 0
    for (i = 0; i < np; i++) {
      if (life[i] > 0) {
        # Physics
        vy[i] += gravity
        px[i] += vx[i]
        py[i] += vy[i]
        life[i]--
        
        # Bounce off floor
        if (py[i] >= h - 2) {
          py[i] = h - 2
          vy[i] = -vy[i] * 0.3
          vx[i] *= 0.8
          if (vy[i] > -0.5) life[i] = 0
        }
        
        # Draw
        sx = int(px[i])
        sy = int(py[i])
        
        if (sx >= 0 && sx < w && sy >= 0 && sy < h && life[i] > 0) {
          age = life[i] / 100
          t = ptype[i]
          
          if (t == 0) {  # Water blue
            if (age > 0.6) { col = "\033[97m"; ch = "●" }
            else if (age > 0.3) { col = "\033[96m"; ch = "○" }
            else { col = "\033[34m"; ch = "·" }
          } else if (t == 1) {  # Cyan
            if (age > 0.6) { col = "\033[96m"; ch = "◆" }
            else if (age > 0.3) { col = "\033[36m"; ch = "◇" }
            else { col = "\033[34m"; ch = "·" }
          } else if (t == 2) {  # White sparkle
            if (age > 0.7) { col = "\033[97m"; ch = "✦" }
            else if (age > 0.4) { col = "\033[37m"; ch = "*" }
            else { col = "\033[90m"; ch = "." }
          } else {  # Blue
            if (age > 0.5) { col = "\033[94m"; ch = "█" }
            else if (age > 0.2) { col = "\033[34m"; ch = "▒" }
            else { col = "\033[90m"; ch = "░" }
          }
          
          scr[sy,sx] = col ch "\033[0m"
          alive++
        }
      }
    }
    
    # Compact dead particles periodically
    if (np > maxp * 0.8) {
      j = 0
      for (i = 0; i < np; i++) {
        if (life[i] > 0) {
          px[j]=px[i]; py[j]=py[i]; vx[j]=vx[i]; vy[j]=vy[i]
          life[j]=life[i]; ptype[j]=ptype[i]
          j++
        }
      }
      np = j
    }
    
    # Render
    printf "\033[H"
    printf "\033[94m  ≋≋≋ PARTICLE FOUNTAIN ≋≋≋\033[0m\n"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++)
        printf "%s", scr[y,x]
      printf "\n"
    }
    
    printf "\033[90m  particles: %d\033[0m\n", alive
    
    system("sleep 0.035")
  }
}'
