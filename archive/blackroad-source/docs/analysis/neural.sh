#!/bin/bash
# NEURAL NETWORK ACTIVITY VISUALIZATION

awk 'BEGIN {
  srand()
  w = 76; h = 38
  
  # Network structure: 4 layers
  layers = 4
  nodes[0] = 6; nodes[1] = 10; nodes[2] = 10; nodes[3] = 4
  
  # Position nodes
  for (l = 0; l < layers; l++) {
    xpos[l] = int((l + 0.5) * w / layers)
    for (n = 0; n < nodes[l]; n++) {
      ypos[l,n] = int((n + 0.5) * h / nodes[l])
      activation[l,n] = rand()
    }
  }
  
  # Initialize weights
  for (l = 0; l < layers-1; l++) {
    for (i = 0; i < nodes[l]; i++) {
      for (j = 0; j < nodes[l+1]; j++) {
        weight[l,i,j] = rand() * 2 - 1
      }
    }
  }
  
  t = 0
  
  while (1) {
    # Clear
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++)
        scr[y,x] = " "
    
    # Pulse input layer
    for (n = 0; n < nodes[0]; n++) {
      activation[0,n] = 0.5 + 0.5 * sin(t * 0.2 + n * 1.5)
    }
    
    # Forward propagation
    for (l = 0; l < layers-1; l++) {
      for (j = 0; j < nodes[l+1]; j++) {
        sum = 0
        for (i = 0; i < nodes[l]; i++) {
          sum += activation[l,i] * weight[l,i,j]
        }
        # Sigmoid with temporal smoothing
        target = 1 / (1 + exp(-sum))
        activation[l+1,j] = activation[l+1,j] * 0.7 + target * 0.3
      }
    }
    
    # Draw connections
    for (l = 0; l < layers-1; l++) {
      for (i = 0; i < nodes[l]; i++) {
        for (j = 0; j < nodes[l+1]; j++) {
          # Signal strength
          sig = activation[l,i] * weight[l,i,j]
          if (sig < -0.3 || sig > 0.3) {
            x1 = xpos[l]; y1 = ypos[l,i]
            x2 = xpos[l+1]; y2 = ypos[l+1,j]
            
            # Draw line
            steps = int(sqrt((x2-x1)^2 + (y2-y1)^2))
            for (s = 1; s < steps; s++) {
              px = int(x1 + (x2-x1) * s / steps)
              py = int(y1 + (y2-y1) * s / steps)
              
              if (px >= 0 && px < w && py >= 0 && py < h) {
                if (sig > 0.5) scr[py,px] = "\033[92m─\033[0m"
                else if (sig > 0.3) scr[py,px] = "\033[32m─\033[0m"
                else if (sig < -0.5) scr[py,px] = "\033[91m─\033[0m"
                else scr[py,px] = "\033[31m─\033[0m"
              }
            }
          }
        }
      }
    }
    
    # Draw nodes
    for (l = 0; l < layers; l++) {
      for (n = 0; n < nodes[l]; n++) {
        x = xpos[l]; y = ypos[l,n]
        a = activation[l,n]
        
        if (a > 0.8) { col = "\033[97m"; ch = "◉" }
        else if (a > 0.6) { col = "\033[93m"; ch = "●" }
        else if (a > 0.4) { col = "\033[33m"; ch = "◎" }
        else if (a > 0.2) { col = "\033[90m"; ch = "○" }
        else { col = "\033[34m"; ch = "◌" }
        
        scr[y,x] = col ch "\033[0m"
      }
    }
    
    # Render
    printf "\033[H"
    printf "\033[95m  🧠 NEURAL NETWORK PROPAGATION 🧠\033[0m\n"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++)
        printf "%s", scr[y,x]
      printf "\n"
    }
    
    printf "\033[36m  INPUT → HIDDEN → HIDDEN → OUTPUT\033[0m\n"
    
    t++
    system("sleep 0.06")
  }
}'
