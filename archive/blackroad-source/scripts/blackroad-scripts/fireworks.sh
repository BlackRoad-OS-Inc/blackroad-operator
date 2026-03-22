#!/bin/bash
# FIREWORKS DISPLAY

awk 'BEGIN {
  srand()
  w = 78; h = 42
  maxp = 500
  gravity = 0.06
  np = 0
  
  while (1) {
    # Clear
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++)
        scr[y,x] = " "
    
    # Ground
    for (x = 0; x < w; x++)
      scr[h-1,x] = "\033[32m▄\033[0m"
    
    # Launch new rocket randomly
    if (rand() > 0.95 && np < maxp - 100) {
      rx = rand() * (w - 20) + 10
      ry = h - 2
      rvx = (rand() - 0.5) * 0.8
      rvy = -2.5 - rand() * 1
      rtype = int(rand() * 6)
      
      # Rocket trail
      px[np] = rx; py[np] = ry
      vx[np] = rvx; vy[np] = rvy
      life[np] = 30 + rand() * 20
      ptype[np] = -1  # rocket
      pcol[np] = 93   # yellow
      np++
    }
    
    # Update particles
    alive = 0
    for (i = 0; i < np; i++) {
      if (life[i] <= 0) continue
      
      # Physics
      vy[i] += gravity
      px[i] += vx[i]
      py[i] += vy[i]
      life[i]--
      
      # Rocket explosion
      if (ptype[i] == -1 && vy[i] > -0.5) {
        # BOOM - spawn particles
        expX = px[i]; expY = py[i]
        expType = int(rand() * 6)
        
        # Color palette per explosion
        if (expType == 0) cols = "91 93 97"      # red gold white
        else if (expType == 1) cols = "92 96 97" # green cyan white
        else if (expType == 2) cols = "94 95 97" # blue magenta white
        else if (expType == 3) cols = "93 91 95" # gold red magenta
        else if (expType == 4) cols = "96 92 93" # cyan green gold
        else cols = "97 95 94"                    # white magenta blue
        
        split(cols, colArr, " ")
        
        particles = 40 + int(rand() * 30)
        for (p = 0; p < particles && np < maxp; p++) {
          angle = rand() * 3.14159 * 2
          speed = 0.8 + rand() * 1.2
          
          px[np] = expX
          py[np] = expY
          vx[np] = cos(angle) * speed * (0.5 + rand() * 0.5)
          vy[np] = sin(angle) * speed * 0.6
          life[np] = 25 + rand() * 35
          ptype[np] = expType
          pcol[np] = colArr[1 + int(rand() * 3)]
          np++
        }
        
        life[i] = 0
        continue
      }
      
      # Draw
      sx = int(px[i])
      sy = int(py[i])
      
      if (sx >= 0 && sx < w && sy >= 0 && sy < h - 1) {
        age = life[i] / 60
        col = pcol[i]
        
        if (ptype[i] == -1) {
          # Rocket
          ch = "│"
        } else {
          # Sparkle
          if (age > 0.6) ch = "✦"
          else if (age > 0.3) ch = "*"
          else ch = "·"
        }
        
        scr[sy,sx] = "\033[" col "m" ch "\033[0m"
        alive++
      }
    }
    
    # Compact dead particles
    if (np > maxp * 0.8) {
      j = 0
      for (i = 0; i < np; i++) {
        if (life[i] > 0) {
          px[j]=px[i]; py[j]=py[i]; vx[j]=vx[i]; vy[j]=vy[i]
          life[j]=life[i]; ptype[j]=ptype[i]; pcol[j]=pcol[i]
          j++
        }
      }
      np = j
    }
    
    # Render
    printf "\033[H"
    printf "\033[93m  ✧･ﾟ: *✧ FIREWORKS ✧*:･ﾟ✧\033[0m\n"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++)
        printf "%s", scr[y,x]
      printf "\n"
    }
    
    system("sleep 0.04")
  }
}'
