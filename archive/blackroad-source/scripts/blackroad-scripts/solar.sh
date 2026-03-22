#!/bin/bash
# SOLAR SYSTEM ORRERY

awk 'BEGIN {
  pi = 3.14159265
  w = 78; h = 42
  
  # Planets: distance, speed, size, color, name
  np = 8
  dist[0]=0.12; spd[0]=4.2;  col[0]=90; nm[0]="☿"  # Mercury
  dist[1]=0.18; spd[1]=1.6;  col[1]=93; nm[1]="♀"  # Venus
  dist[2]=0.26; spd[2]=1.0;  col[2]=34; nm[2]="⊕"  # Earth
  dist[3]=0.34; spd[3]=0.53; col[3]=91; nm[3]="♂"  # Mars
  dist[4]=0.50; spd[4]=0.08; col[4]=33; nm[4]="♃"  # Jupiter
  dist[5]=0.65; spd[5]=0.03; col[5]=93; nm[5]="♄"  # Saturn
  dist[6]=0.78; spd[6]=0.01; col[6]=96; nm[6]="⛢"  # Uranus
  dist[7]=0.90; spd[7]=0.006;col[7]=94; nm[7]="♆"  # Neptune
  
  t = 0
  
  while (1) {
    # Clear
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++)
        scr[y,x] = " "
    
    cx = w / 2
    cy = h / 2
    
    # Draw orbit paths
    for (p = 0; p < np; p++) {
      r = dist[p]
      for (a = 0; a < 60; a++) {
        angle = a * pi / 30
        ox = int(cx + cos(angle) * r * w * 0.45)
        oy = int(cy + sin(angle) * r * h * 0.4)
        if (ox >= 0 && ox < w && oy >= 0 && oy < h)
          if (scr[oy,ox] == " ")
            scr[oy,ox] = "\033[90m·\033[0m"
      }
    }
    
    # Draw Sun
    scr[cy,cx] = "\033[93m☀\033[0m"
    scr[cy,cx-1] = "\033[33m◖\033[0m"
    scr[cy,cx+1] = "\033[33m◗\033[0m"
    scr[cy-1,cx] = "\033[93m▴\033[0m"
    scr[cy+1,cx] = "\033[93m▾\033[0m"
    
    # Draw planets
    for (p = 0; p < np; p++) {
      angle = t * spd[p]
      r = dist[p]
      
      px = int(cx + cos(angle) * r * w * 0.45)
      py = int(cy + sin(angle) * r * h * 0.4)
      
      if (px >= 0 && px < w && py >= 0 && py < h)
        scr[py,px] = "\033[" col[p] "m" nm[p] "\033[0m"
      
      # Saturn rings
      if (p == 5) {
        if (px-1 >= 0) scr[py,px-1] = "\033[33m─\033[0m"
        if (px+1 < w) scr[py,px+1] = "\033[33m─\033[0m"
      }
      
      # Jupiter moons (tiny dots)
      if (p == 4) {
        for (m = 0; m < 4; m++) {
          ma = t * (2 + m) + m * pi/2
          mx = int(px + cos(ma) * 2)
          my = int(py + sin(ma) * 1)
          if (mx >= 0 && mx < w && my >= 0 && my < h)
            if (scr[my,mx] == " " || scr[my,mx] == "\033[90m·\033[0m")
              scr[my,mx] = "\033[37m·\033[0m"
        }
      }
    }
    
    # Asteroid belt hint
    for (a = 0; a < 20; a++) {
      aa = t * 0.2 + a * pi / 10
      ar = 0.42 + sin(a * 7) * 0.02
      ax = int(cx + cos(aa) * ar * w * 0.45)
      ay = int(cy + sin(aa) * ar * h * 0.4)
      if (ax >= 0 && ax < w && ay >= 0 && ay < h)
        if (scr[ay,ax] == " ")
          scr[ay,ax] = "\033[90m.\033[0m"
    }
    
    # Render
    printf "\033[H"
    printf "\033[93m  ☉ SOLAR SYSTEM ORRERY ☉\033[0m\n"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++)
        printf "%s", scr[y,x]
      printf "\n"
    }
    
    printf "\033[90m  ☿Mercury ♀Venus ⊕Earth ♂Mars ♃Jupiter ♄Saturn ⛢Uranus ♆Neptune\033[0m\n"
    
    t += 0.05
    system("sleep 0.05")
  }
}'
