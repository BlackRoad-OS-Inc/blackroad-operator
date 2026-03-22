#!/bin/bash
# LIGHTNING STORM

awk 'BEGIN {
  srand()
  w = 78; h = 42
  
  frame = 0
  
  while (1) {
    # Clear with dark sky gradient
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++) {
        if (y < 3) scr[y,x] = "\033[40m \033[0m"
        else if (y < h - 4) scr[y,x] = " "
        else scr[y,x] = "\033[100m \033[0m"
      }
    
    # Clouds
    for (x = 0; x < w; x++) {
      cloudY = int(2 + sin(x * 0.1 + frame * 0.02) * 1.5)
      for (cy = 0; cy <= cloudY; cy++) {
        if (cy < h)
          scr[cy,x] = "\033[100m░\033[0m"
      }
    }
    
    # Random lightning bolt
    if (rand() > 0.85) {
      # Flash background
      flash = 1
      
      # Bolt starting point
      bx = int(rand() * (w - 20) + 10)
      by = 3
      
      # Draw branching bolt
      branches = 1 + int(rand() * 2)
      for (b = 0; b < branches; b++) {
        cx = bx + int((rand() - 0.5) * 10)
        cy = by
        
        while (cy < h - 4) {
          # Main bolt character
          if (cx >= 0 && cx < w) {
            bright = (b == 0) ? 97 : 37
            scr[cy,cx] = "\033[" bright "m█\033[0m"
            
            # Glow
            if (cx > 0) scr[cy,cx-1] = "\033[96m▓\033[0m"
            if (cx < w-1) scr[cy,cx+1] = "\033[96m▓\033[0m"
          }
          
          # Random walk down
          cy++
          cx += int(rand() * 5) - 2
          
          # Branching
          if (rand() > 0.9 && cy < h - 10) {
            # Mini branch
            bcx = cx; bcy = cy
            for (mb = 0; mb < 5 + rand() * 8; mb++) {
              if (bcx >= 0 && bcx < w && bcy < h)
                scr[bcy,bcx] = "\033[37m▒\033[0m"
              bcy++
              bcx += int(rand() * 3) - 1
            }
          }
        }
        
        # Ground strike glow
        for (gx = cx - 3; gx <= cx + 3; gx++) {
          if (gx >= 0 && gx < w) {
            scr[h-4,gx] = "\033[93m▓\033[0m"
            scr[h-5,gx] = "\033[33m░\033[0m"
          }
        }
      }
    }
    
    # Rain
    for (r = 0; r < 80; r++) {
      rx = int(rand() * w)
      ry = int(rand() * (h - 5)) + 3
      if (scr[ry,rx] == " ")
        scr[ry,rx] = "\033[34m│\033[0m"
    }
    
    # Render
    printf "\033[H"
    printf "\033[94m  ⚡ LIGHTNING STORM ⚡\033[0m\n"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++)
        printf "%s", scr[y,x]
      printf "\n"
    }
    
    frame++
    system("sleep 0.06")
  }
}'
