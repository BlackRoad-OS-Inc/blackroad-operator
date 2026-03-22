#!/bin/bash
# ATOMIC ORBITAL ELECTRON CLOUD

awk 'BEGIN {
  pi = 3.14159265
  srand()
  w = 70; h = 38
  
  # Electrons in different orbitals
  ne = 12
  for (i = 0; i < ne; i++) {
    orbital[i] = int(i / 4)  # 0=s, 1=p, 2=d
    phase[i] = rand() * 2 * pi
    speed[i] = 0.1 + rand() * 0.05
    tilt[i] = (i % 3) * pi / 3 + rand() * 0.2
  }
  
  t = 0
  
  while (1) {
    # Clear
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++)
        scr[y,x] = " "
    
    # Draw orbital paths (ghosted)
    for (orb = 0; orb < 3; orb++) {
      r = 0.25 + orb * 0.22
      for (a = 0; a < 60; a++) {
        angle = a * pi / 30
        for (tiltIdx = 0; tiltIdx < 3; tiltIdx++) {
          ti = tiltIdx * pi / 3
          
          ox = cos(angle) * r
          oy = sin(angle) * r * cos(ti)
          oz = sin(angle) * r * sin(ti)
          
          # Rotate whole atom
          rx = ox * cos(t*0.3) - oz * sin(t*0.3)
          rz = ox * sin(t*0.3) + oz * cos(t*0.3)
          
          sx = int((rx + 1) * w / 2)
          sy = int((1 - oy) * h / 2)
          
          if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
            if (scr[sy,sx] == " ")
              scr[sy,sx] = "\033[34m·\033[0m"
          }
        }
      }
    }
    
    # Draw electrons
    for (i = 0; i < ne; i++) {
      orb = orbital[i]
      r = 0.25 + orb * 0.22
      
      angle = phase[i] + t * speed[i] * (3 - orb)
      ti = tilt[i]
      
      ox = cos(angle) * r
      oy = sin(angle) * r * cos(ti)
      oz = sin(angle) * r * sin(ti)
      
      # Rotate
      rx = ox * cos(t*0.3) - oz * sin(t*0.3)
      rz = ox * sin(t*0.3) + oz * cos(t*0.3)
      
      sx = int((rx + 1) * w / 2)
      sy = int((1 - oy) * h / 2)
      
      if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
        # Depth shading
        if (rz > 0) scr[sy,sx] = "\033[96m●\033[0m"
        else scr[sy,sx] = "\033[36m○\033[0m"
      }
      
      # Probability cloud (quantum fuzz)
      for (f = 0; f < 3; f++) {
        fx = sx + int((rand()-0.5) * 6)
        fy = sy + int((rand()-0.5) * 3)
        if (fx >= 0 && fx < w && fy >= 0 && fy < h) {
          if (scr[fy,fx] == " " || scr[fy,fx] == "\033[34m·\033[0m")
            scr[fy,fx] = "\033[94m∙\033[0m"
        }
      }
    }
    
    # Draw nucleus
    cx = int(w/2); cy = int(h/2)
    scr[cy,cx] = "\033[91m◉\033[0m"
    scr[cy,cx-1] = "\033[93m◉\033[0m"
    scr[cy,cx+1] = "\033[93m◉\033[0m"
    scr[cy-1,cx] = "\033[91m◉\033[0m"
    
    # Render
    printf "\033[H"
    printf "\033[93m  ⚛ ATOMIC ORBITAL MODEL ⚛\033[0m\n"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++)
        printf "%s", scr[y,x]
      printf "\n"
    }
    
    printf "\033[90m  electrons: %d | orbitals: s p d\033[0m\n", ne
    
    t += 0.12
    system("sleep 0.04")
  }
}'
