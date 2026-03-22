#!/bin/bash
# PENDULUM WAVE - MESMERIZING PHYSICS

awk 'BEGIN {
  pi = 3.14159265
  w = 78; h = 40
  
  # 15 pendulums with different periods
  np = 15
  for (i = 0; i < np; i++) {
    # Each pendulum completes a different number of cycles
    freq[i] = 0.02 + i * 0.003
    amp[i] = h * 0.35
  }
  
  t = 0
  
  while (1) {
    # Clear
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++)
        scr[y,x] = " "
    
    # Draw pivot bar
    for (x = 5; x < w - 5; x++)
      scr[2,x] = "\033[90m─\033[0m"
    
    # Draw each pendulum
    for (i = 0; i < np; i++) {
      px = int(8 + i * (w - 16) / (np - 1))
      
      # Pendulum position (damped sine)
      angle = sin(t * freq[i] * 2 * pi) * 0.8
      
      bobY = int(3 + amp[i] * cos(angle) * 0.3 + amp[i] * 0.7)
      bobX = int(px + amp[i] * sin(angle) * 0.5)
      
      # Draw string
      steps = bobY - 2
      for (s = 1; s < steps; s++) {
        lx = int(px + (bobX - px) * s / steps)
        ly = 2 + s
        if (lx >= 0 && lx < w && ly >= 0 && ly < h)
          scr[ly,lx] = "\033[90m│\033[0m"
      }
      
      # Draw bob with color gradient
      col = 31 + (i % 7)
      if (bobX >= 0 && bobX < w && bobY >= 0 && bobY < h) {
        scr[bobY,bobX] = "\033[" col "m●\033[0m"
        if (bobX+1 < w) scr[bobY,bobX+1] = "\033[" col "m●\033[0m"
      }
      
      # Trail effect
      for (tr = 1; tr <= 3; tr++) {
        oldAngle = sin((t - tr * 0.5) * freq[i] * 2 * pi) * 0.8
        oldY = int(3 + amp[i] * cos(oldAngle) * 0.3 + amp[i] * 0.7)
        oldX = int(px + amp[i] * sin(oldAngle) * 0.5)
        if (oldX >= 0 && oldX < w && oldY >= 0 && oldY < h) {
          if (scr[oldY,oldX] == " ")
            scr[oldY,oldX] = "\033[90m·\033[0m"
        }
      }
    }
    
    # Render
    printf "\033[H"
    printf "\033[95m  ∿ PENDULUM WAVE ∿\033[0m\n"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++)
        printf "%s", scr[y,x]
      printf "\n"
    }
    
    t += 0.15
    system("sleep 0.04")
  }
}'
