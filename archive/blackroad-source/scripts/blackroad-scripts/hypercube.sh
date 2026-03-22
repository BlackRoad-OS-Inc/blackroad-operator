#!/bin/bash
# 4D TESSERACT ROTATION

awk 'BEGIN {
  pi = 3.14159265
  w = 60; h = 30
  
  # 16 vertices of tesseract (±1, ±1, ±1, ±1)
  n = 0
  for (a = -1; a <= 1; a += 2)
    for (b = -1; b <= 1; b += 2)
      for (c = -1; c <= 1; c += 2)
        for (d = -1; d <= 1; d += 2) {
          vx[n] = a; vy[n] = b; vz[n] = c; vw[n] = d
          n++
        }
  
  # Edges: connect vertices differing by 1 coord
  ne = 0
  for (i = 0; i < 16; i++) {
    for (j = i + 1; j < 16; j++) {
      diff = 0
      if (vx[i] != vx[j]) diff++
      if (vy[i] != vy[j]) diff++
      if (vz[i] != vz[j]) diff++
      if (vw[i] != vw[j]) diff++
      if (diff == 1) {
        e1[ne] = i; e2[ne] = j
        ne++
      }
    }
  }
  
  t = 0
  
  while (1) {
    # Clear
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++)
        scr[y,x] = " "
    
    # Rotation angles
    a1 = t * 0.7
    a2 = t * 0.5
    a3 = t * 0.3
    
    # Transform vertices
    for (i = 0; i < 16; i++) {
      x = vx[i]; y = vy[i]; z = vz[i]; w4 = vw[i]
      
      # XW rotation
      nx = x * cos(a1) - w4 * sin(a1)
      nw = x * sin(a1) + w4 * cos(a1)
      x = nx; w4 = nw
      
      # YZ rotation
      ny = y * cos(a2) - z * sin(a2)
      nz = y * sin(a2) + z * cos(a2)
      y = ny; z = nz
      
      # XY rotation  
      nx = x * cos(a3) - y * sin(a3)
      ny = x * sin(a3) + y * cos(a3)
      x = nx; y = ny
      
      # 4D to 3D projection
      d4 = 2.5
      scale4 = d4 / (d4 - w4)
      x *= scale4; y *= scale4; z *= scale4
      
      # 3D to 2D projection
      d3 = 4
      scale3 = d3 / (d3 - z)
      
      px[i] = int((x * scale3 + 1) * w / 2)
      py[i] = int((1 - y * scale3 * 0.5) * h / 2 + h/4)
      pd[i] = z + w4  # depth for coloring
    }
    
    # Draw edges
    for (e = 0; e < ne; e++) {
      i = e1[e]; j = e2[e]
      x1 = px[i]; y1 = py[i]
      x2 = px[j]; y2 = py[j]
      
      # Bresenham line
      dx = (x2 > x1) ? x2 - x1 : x1 - x2
      dy = (y2 > y1) ? y2 - y1 : y1 - y2
      sx = (x1 < x2) ? 1 : -1
      sy = (y1 < y2) ? 1 : -1
      err = dx - dy
      
      depth = (pd[i] + pd[j]) / 2
      if (depth > 1) { col = "\033[97m"; ch = "█" }
      else if (depth > 0) { col = "\033[96m"; ch = "▓" }
      else if (depth > -1) { col = "\033[36m"; ch = "▒" }
      else { col = "\033[34m"; ch = "░" }
      
      while (1) {
        if (x1 >= 0 && x1 < w && y1 >= 0 && y1 < h)
          scr[y1,x1] = col ch "\033[0m"
        if (x1 == x2 && y1 == y2) break
        e2_tmp = 2 * err
        if (e2_tmp > -dy) { err -= dy; x1 += sx }
        if (e2_tmp < dx) { err += dx; y1 += sy }
      }
    }
    
    # Render
    printf "\033[H"
    printf "\033[95m◈ TESSERACT (4D HYPERCUBE) ◈\033[0m\n"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++)
        printf "%s", scr[y,x]
      printf "\n"
    }
    
    t += 0.04
    system("sleep 0.04")
  }
}'
