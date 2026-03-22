#!/bin/bash
# LORENZ STRANGE ATTRACTOR - CHAOS THEORY

awk 'BEGIN {
  w = 78; h = 42
  
  # Lorenz parameters
  sigma = 10
  rho = 28
  beta = 8/3
  dt = 0.005
  
  # Initial conditions
  x = 0.1; y = 0; z = 0
  
  # Trail buffer
  trail_len = 800
  for (i = 0; i < trail_len; i++) {
    tx[i] = 0; ty[i] = 0; tz[i] = 0
  }
  trail_idx = 0
  
  rot = 0
  
  while (1) {
    # Clear screen buffer
    for (j = 0; j < h; j++)
      for (i = 0; i < w; i++)
        scr[j,i] = " "
    
    # Evolve Lorenz system (multiple steps per frame)
    for (step = 0; step < 20; step++) {
      dx = sigma * (y - x)
      dy = x * (rho - z) - y
      dz = x * y - beta * z
      
      x += dx * dt
      y += dy * dt
      z += dz * dt
      
      # Store in trail
      tx[trail_idx] = x
      ty[trail_idx] = y
      tz[trail_idx] = z
      trail_idx = (trail_idx + 1) % trail_len
    }
    
    # Rotation matrix
    cr = cos(rot); sr = sin(rot)
    
    # Draw trail
    for (i = 0; i < trail_len; i++) {
      idx = (trail_idx + i) % trail_len
      
      # Rotate around Y axis
      px = tx[idx] * cr + tz[idx] * sr
      pz = -tx[idx] * sr + tz[idx] * cr
      py = ty[idx]
      
      # Project to 2D
      scale = 1.8
      sx = int(px * scale + w/2)
      sy = int(h - (pz - 10) * scale * 0.6 - 5)
      
      if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
        # Age-based coloring (newer = brighter)
        age = i / trail_len
        
        if (age > 0.9) { col = "\033[97m"; ch = "█" }
        else if (age > 0.75) { col = "\033[96m"; ch = "▓" }
        else if (age > 0.5) { col = "\033[95m"; ch = "▒" }
        else if (age > 0.25) { col = "\033[35m"; ch = "░" }
        else { col = "\033[34m"; ch = "·" }
        
        scr[sy,sx] = col ch "\033[0m"
      }
    }
    
    # Render
    printf "\033[H"
    printf "\033[93m ∞ LORENZ ATTRACTOR - DETERMINISTIC CHAOS ∞\033[0m\n"
    
    for (j = 0; j < h; j++) {
      for (i = 0; i < w; i++)
        printf "%s", scr[j,i]
      printf "\n"
    }
    
    printf "\033[90m σ=%.0f ρ=%.0f β=%.2f | x=%.2f y=%.2f z=%.2f\033[0m\n", sigma, rho, beta, x, y, z
    
    rot += 0.015
    system("sleep 0.03")
  }
}'
