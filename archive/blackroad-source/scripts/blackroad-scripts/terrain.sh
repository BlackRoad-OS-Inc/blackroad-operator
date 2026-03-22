#!/bin/bash
# 3D TERRAIN FLY-THROUGH

awk 'BEGIN {
  srand()
  w = 78; h = 40
  
  # Generate heightmap with Perlin-ish noise
  for (z = 0; z < 200; z++) {
    for (x = 0; x < w; x++) {
      # Layered noise
      h1 = sin(x * 0.1) * sin(z * 0.1) * 8
      h2 = sin(x * 0.05 + 1) * sin(z * 0.07) * 4
      h3 = sin(x * 0.2) * sin(z * 0.15) * 2
      terrain[z,x] = h1 + h2 + h3 + 10
    }
  }
  
  camZ = 0
  
  while (1) {
    # Clear
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++)
        scr[y,x] = " "
    
    # Sky gradient
    for (y = 0; y < h/3; y++) {
      for (x = 0; x < w; x++) {
        if (y < 3) scr[y,x] = "\033[94m░\033[0m"
        else if (y < 6) scr[y,x] = "\033[34m░\033[0m"
        else scr[y,x] = "\033[36m·\033[0m"
      }
    }
    
    # Render terrain with ray marching
    for (sx = 0; sx < w; sx++) {
      for (sz = 1; sz < 60; sz++) {
        tz = int(camZ + sz) % 200
        tx = sx
        
        terrainH = terrain[tz, tx]
        
        # Project to screen
        perspective = 30 / (sz + 5)
        screenY = int(h/2 + (15 - terrainH) * perspective)
        
        if (screenY >= 0 && screenY < h) {
          # Height-based coloring
          if (terrainH > 16) {
            col = "\033[97m"; ch = "▲"  # Snow peaks
          } else if (terrainH > 13) {
            col = "\033[90m"; ch = "▓"  # Rock
          } else if (terrainH > 10) {
            col = "\033[32m"; ch = "▒"  # Forest
          } else if (terrainH > 7) {
            col = "\033[92m"; ch = "░"  # Grass
          } else {
            col = "\033[34m"; ch = "~"  # Water
          }
          
          # Distance fog
          if (sz > 40) col = "\033[90m"
          else if (sz > 25) col = "\033[37m"
          
          # Fill from screenY down to horizon
          for (fillY = screenY; fillY < h; fillY++) {
            if (scr[fillY,sx] == " " || scr[fillY,sx] == "\033[36m·\033[0m")
              scr[fillY,sx] = col ch "\033[0m"
          }
          break
        }
      }
    }
    
    # Render
    printf "\033[H"
    printf "\033[92m  ▲ TERRAIN FLY-THROUGH ▲\033[0m\n"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++)
        printf "%s", scr[y,x]
      printf "\n"
    }
    
    camZ += 0.8
    system("sleep 0.05")
  }
}'
