#!/bin/bash
# AUTO-PLAYING SNAKE AI

awk 'BEGIN {
  srand()
  w = 60; h = 30
  
  # Snake starting position
  len = 5
  for (i = 0; i < len; i++) {
    snakeX[i] = 30 - i
    snakeY[i] = 15
  }
  dir = 0  # 0=right, 1=down, 2=left, 3=up
  
  # Spawn food
  foodX = int(rand() * (w-4)) + 2
  foodY = int(rand() * (h-4)) + 2
  
  score = 0
  
  while (1) {
    # Clear
    for (y = 0; y < h; y++)
      for (x = 0; x < w; x++)
        scr[y,x] = " "
    
    # Draw border
    for (x = 0; x < w; x++) {
      scr[0,x] = "\033[90m─\033[0m"
      scr[h-1,x] = "\033[90m─\033[0m"
    }
    for (y = 0; y < h; y++) {
      scr[y,0] = "\033[90m│\033[0m"
      scr[y,w-1] = "\033[90m│\033[0m"
    }
    scr[0,0] = "\033[90m┌\033[0m"
    scr[0,w-1] = "\033[90m┐\033[0m"
    scr[h-1,0] = "\033[90m└\033[0m"
    scr[h-1,w-1] = "\033[90m┘\033[0m"
    
    # AI: Simple pathfinding toward food
    headX = snakeX[0]; headY = snakeY[0]
    
    # Calculate direction to food
    dx = foodX - headX
    dy = foodY - headY
    
    # Choose best direction (avoiding self)
    bestDir = dir
    
    # Try to move toward food
    if (dx > 0 && dir != 2) newDir = 0
    else if (dx < 0 && dir != 0) newDir = 2
    else if (dy > 0 && dir != 3) newDir = 1
    else if (dy < 0 && dir != 1) newDir = 3
    else newDir = dir
    
    # Check if new direction hits wall or self
    if (newDir == 0) { nx = headX + 1; ny = headY }
    else if (newDir == 1) { nx = headX; ny = headY + 1 }
    else if (newDir == 2) { nx = headX - 1; ny = headY }
    else { nx = headX; ny = headY - 1 }
    
    # Check collision with self
    hitSelf = 0
    for (i = 0; i < len; i++)
      if (snakeX[i] == nx && snakeY[i] == ny) hitSelf = 1
    
    # If would hit self, try other directions
    if (hitSelf || nx <= 0 || nx >= w-1 || ny <= 0 || ny >= h-1) {
      for (tryDir = 0; tryDir < 4; tryDir++) {
        if (tryDir == 0) { nx = headX + 1; ny = headY }
        else if (tryDir == 1) { nx = headX; ny = headY + 1 }
        else if (tryDir == 2) { nx = headX - 1; ny = headY }
        else { nx = headX; ny = headY - 1 }
        
        hitSelf = 0
        for (i = 0; i < len; i++)
          if (snakeX[i] == nx && snakeY[i] == ny) hitSelf = 1
        
        if (!hitSelf && nx > 0 && nx < w-1 && ny > 0 && ny < h-1) {
          newDir = tryDir
          break
        }
      }
    }
    
    dir = newDir
    
    # Move snake
    if (dir == 0) { nx = headX + 1; ny = headY }
    else if (dir == 1) { nx = headX; ny = headY + 1 }
    else if (dir == 2) { nx = headX - 1; ny = headY }
    else { nx = headX; ny = headY - 1 }
    
    # Check food
    ate = 0
    if (nx == foodX && ny == foodY) {
      ate = 1
      score += 10
      foodX = int(rand() * (w-4)) + 2
      foodY = int(rand() * (h-4)) + 2
    }
    
    # Shift body
    if (!ate) {
      for (i = len - 1; i > 0; i--) {
        snakeX[i] = snakeX[i-1]
        snakeY[i] = snakeY[i-1]
      }
    } else {
      # Grow
      for (i = len; i > 0; i--) {
        snakeX[i] = snakeX[i-1]
        snakeY[i] = snakeY[i-1]
      }
      len++
    }
    
    snakeX[0] = nx
    snakeY[0] = ny
    
    # Draw food
    scr[foodY, foodX] = "\033[91m●\033[0m"
    
    # Draw snake
    for (i = 0; i < len; i++) {
      sx = snakeX[i]; sy = snakeY[i]
      if (sx > 0 && sx < w-1 && sy > 0 && sy < h-1) {
        if (i == 0)
          scr[sy,sx] = "\033[92m◆\033[0m"  # Head
        else
          scr[sy,sx] = "\033[32m■\033[0m"  # Body
      }
    }
    
    # Render
    printf "\033[H"
    printf "\033[92m  🐍 SNAKE AI  Score: %d  Length: %d\033[0m\n", score, len
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++)
        printf "%s", scr[y,x]
      printf "\n"
    }
    
    system("sleep 0.08")
  }
}'
