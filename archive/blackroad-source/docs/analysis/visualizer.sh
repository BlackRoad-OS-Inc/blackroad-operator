#!/bin/bash
# AUDIO SPECTRUM VISUALIZER

awk 'BEGIN {
  srand()
  w = 76; h = 35
  bars = 38
  
  # Initialize bar heights
  for (i = 0; i < bars; i++) {
    barH[i] = rand() * h * 0.3
    targetH[i] = barH[i]
    barCol[i] = 0
  }
  
  t = 0
  beat = 0
  
  while (1) {
    # Simulate music - bass pulse + mid + high frequencies
    beat = (sin(t * 2) + 1) / 2
    
    for (i = 0; i < bars; i++) {
      # Different frequency bands
      freq = i / bars
      
      # Bass (left), mids (center), highs (right)
      if (freq < 0.3) {
        # Bass - strong pulse
        energy = beat * 0.9 + sin(t * 1.5 + i * 0.2) * 0.3
      } else if (freq < 0.7) {
        # Mids - melodic
        energy = sin(t * 4 + i * 0.5) * 0.5 + 0.4
        energy += sin(t * 3 + i * 0.3) * 0.2
      } else {
        # Highs - sparkly
        energy = sin(t * 8 + i * 0.8) * 0.3 + 0.2
        energy += (rand() - 0.5) * 0.3
      }
      
      # Random variation
      energy += (rand() - 0.5) * 0.15
      if (energy < 0) energy = 0
      if (energy > 1) energy = 1
      
      targetH[i] = energy * h * 0.85
      
      # Smooth interpolation (fast rise, slow fall)
      if (targetH[i] > barH[i])
        barH[i] += (targetH[i] - barH[i]) * 0.5
      else
        barH[i] += (targetH[i] - barH[i]) * 0.15
    }
    
    # Clear
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++)
        scr[y,x] = " "
    
    # Draw bars
    for (i = 0; i < bars; i++) {
      bx = int(i * w / bars)
      bw = int(w / bars) - 1
      if (bw < 1) bw = 1
      
      bh = int(barH[i])
      
      for (y = 0; y < bh; y++) {
        screenY = h - 1 - y
        
        # Color gradient based on height
        heightRatio = y / h
        
        if (heightRatio > 0.8) col = "\033[91m"       # Red (peak)
        else if (heightRatio > 0.6) col = "\033[93m"  # Yellow
        else if (heightRatio > 0.4) col = "\033[92m"  # Green
        else if (heightRatio > 0.2) col = "\033[96m"  # Cyan
        else col = "\033[94m"                          # Blue
        
        for (bxi = 0; bxi < bw; bxi++) {
          px = bx + bxi
          if (px < w)
            scr[screenY, px] = col "█\033[0m"
        }
      }
      
      # Peak dot
      peakY = h - 1 - bh - 1
      if (peakY >= 0 && peakY < h) {
        for (bxi = 0; bxi < bw; bxi++) {
          px = bx + bxi
          if (px < w)
            scr[peakY, px] = "\033[97m▀\033[0m"
        }
      }
    }
    
    # Reflection (dimmed)
    for (i = 0; i < bars; i++) {
      bx = int(i * w / bars)
      bw = int(w / bars) - 1
      if (bw < 1) bw = 1
      bh = int(barH[i] * 0.3)
      
      for (y = 0; y < bh && y < 5; y++) {
        screenY = h - 1 + y + 1
        if (screenY < h) {
          for (bxi = 0; bxi < bw; bxi++) {
            px = bx + bxi
            if (px < w)
              scr[screenY, px] = "\033[90m▄\033[0m"
          }
        }
      }
    }
    
    # Render
    printf "\033[H"
    printf "\033[95m  ♪♫ AUDIO VISUALIZER ♫♪\033[0m\n"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++)
        printf "%s", scr[y,x]
      printf "\n"
    }
    
    # Fake track info
    printf "\033[90m  ▶ Now Playing: Synthwave Dreams  \033[0m"
    printf "\033[90m━━━━━━━━━━●━━━━━━━━━━ 2:34 / 4:12\033[0m\n"
    
    t += 0.12
    system("sleep 0.04")
  }
}'
