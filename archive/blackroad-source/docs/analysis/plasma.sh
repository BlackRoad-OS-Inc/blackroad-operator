#!/bin/bash
# PLASMA FIRE - psychedelic waves

awk 'BEGIN {
  w = 80; h = 35
  t = 0
  
  while (1) {
    printf "\033[H"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        # Plasma function - sum of sines
        v = sin(x*0.1 + t)
        v += sin((y*0.1 + t) * 0.5)
        v += sin((x*0.1 + y*0.1 + t) * 0.5)
        v += sin(sqrt(x*x + y*y) * 0.1 + t)
        v = v / 4  # normalize to [-1, 1]
        
        # Map to color (rainbow gradient)
        c = int((v + 1) * 3.5)  # 0-7
        if (c < 0) c = 0
        if (c > 7) c = 7
        
        # RGB approximation
        if (c == 0) col = "40"      # black
        else if (c == 1) col = "44" # blue
        else if (c == 2) col = "45" # magenta
        else if (c == 3) col = "41" # red
        else if (c == 4) col = "43" # yellow
        else if (c == 5) col = "42" # green
        else if (c == 6) col = "46" # cyan
        else col = "47"             # white
        
        # Character based on intensity
        chars = " .:-=+*#%@@"
        ci = int((v + 1) * 5)
        if (ci < 0) ci = 0
        if (ci > 9) ci = 9
        ch = substr(chars, ci+1, 1)
        
        printf "\033[%sm%s\033[0m", col, ch
      }
      printf "\n"
    }
    
    t += 0.15
    system("sleep 0.03")
  }
}'
