#!/bin/bash
# FIRE EFFECT - heat rises

awk 'BEGIN {
  srand()
  w = 80; h = 30
  
  # Init buffer
  for (y = 0; y < h+2; y++)
    for (x = 0; x < w; x++)
      buf[y,x] = 0
  
  # Fire palette (ANSI approximation)
  pal[0] = "40"   # black
  pal[1] = "40"   # black  
  pal[2] = "41"   # red
  pal[3] = "41"   # red
  pal[4] = "101"  # bright red
  pal[5] = "43"   # yellow
  pal[6] = "103"  # bright yellow
  pal[7] = "47"   # white
  
  chr[0] = " "; chr[1] = "."; chr[2] = ":"
  chr[3] = "*"; chr[4] = "o"; chr[5] = "#"
  chr[6] = "@"; chr[7] = "@"
  
  while (1) {
    # Random heat at bottom
    for (x = 0; x < w; x++)
      buf[h+1,x] = int(rand() * 5) + 3
    
    # Propagate heat up with cooling
    for (y = 0; y < h+1; y++) {
      for (x = 0; x < w; x++) {
        # Average of neighbors below + random cooling
        x1 = (x - 1 + w) % w
        x2 = (x + 1) % w
        
        heat = (buf[y+1,x1] + buf[y+1,x] + buf[y+1,x2] + buf[y+2,x]) / 4
        heat = heat - rand() * 0.5
        if (heat < 0) heat = 0
        buf[y,x] = heat
      }
    }
    
    # Render
    printf "\033[H"
    printf "\033[40m\033[97m%*s\033[0m\n", int((w+10)/2), "🔥 FIRE 🔥"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        v = int(buf[y,x])
        if (v > 7) v = 7
        if (v < 0) v = 0
        printf "\033[%sm%s\033[0m", pal[v], chr[v]
      }
      printf "\n"
    }
    
    system("sleep 0.04")
  }
}'
