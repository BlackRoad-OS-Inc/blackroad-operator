#!/bin/bash
# CONWAY'S GAME OF LIFE

awk 'BEGIN {
  srand()
  w = 78; h = 40
  
  # Random initial state
  for (y = 0; y < h; y++)
    for (x = 0; x < w; x++)
      grid[y,x] = (rand() > 0.7) ? 1 : 0
  
  gen = 0
  
  while (1) {
    # Count and render
    pop = 0
    printf "\033[H"
    printf "\033[92m  ◆ GAME OF LIFE - Gen %d ◆\033[0m\n", gen
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        if (grid[y,x]) {
          n = 0
          for (dy = -1; dy <= 1; dy++)
            for (dx = -1; dx <= 1; dx++)
              if (!(dy == 0 && dx == 0))
                n += grid[(y+dy+h)%h, (x+dx+w)%w]
          
          if (n == 2) printf "\033[92m█\033[0m"
          else if (n == 3) printf "\033[96m█\033[0m"
          else printf "\033[32m▓\033[0m"
          pop++
        } else {
          printf " "
        }
      }
      printf "\n"
    }
    
    printf "\033[90m  population: %d\033[0m\n", pop
    
    # Compute next generation
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        n = 0
        for (dy = -1; dy <= 1; dy++)
          for (dx = -1; dx <= 1; dx++)
            if (!(dy == 0 && dx == 0))
              n += grid[(y+dy+h)%h, (x+dx+w)%w]
        
        if (grid[y,x])
          buf[y,x] = (n == 2 || n == 3) ? 1 : 0
        else
          buf[y,x] = (n == 3) ? 1 : 0
      }
    }
    
    # Swap buffers
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++)
        grid[y,x] = buf[y,x]
    
    gen++
    system("sleep 0.08")
  }
}'
