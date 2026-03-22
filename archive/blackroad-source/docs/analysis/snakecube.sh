#!/bin/bash
# 3D ROTATING CUBE WITH SNAKE GAME ON EACH FACE

awk 'BEGIN {
  pi = 3.14159265
  srand()
  sw = 78; sh = 44
  
  # Grid size per face
  gw = 12; gh = 12
  
  # Initialize 6 snakes (one per face)
  for (f = 0; f < 6; f++) {
    snakeLen[f] = 4
    for (i = 0; i < snakeLen[f]; i++) {
      snakeX[f,i] = int(gw/2) - i
      snakeY[f,i] = int(gh/2)
    }
    snakeDir[f] = 0  # 0=right,1=down,2=left,3=up
    
    # Spawn food
    foodX[f] = int(rand() * (gw-2)) + 1
    foodY[f] = int(rand() * (gh-2)) + 1
    score[f] = 0
  }
  
  # Face colors
  faceCol[0] = 91  # Red
  faceCol[1] = 92  # Green
  faceCol[2] = 94  # Blue
  faceCol[3] = 93  # Yellow
  faceCol[4] = 95  # Magenta
  faceCol[5] = 96  # Cyan
  
  # Face names
  faceName[0] = "FRONT"
  faceName[1] = "BACK"
  faceName[2] = "LEFT"
  faceName[3] = "RIGHT"
  faceName[4] = "TOP"
  faceName[5] = "BOTTOM"
  
  t = 0
  
  while (1) {
    # Clear screen buffer
    for (y = 0; y < sh; y++)
      for (x = 0; x < sw; x++) {
        scr[y,x] = " "
        depth[y,x] = -9999
      }
    
    # Rotation angles
    ax = t * 0.4
    ay = t * 0.6
    az = t * 0.2
    
    # Precompute rotation matrix
    cax = cos(ax); sax = sin(ax)
    cay = cos(ay); say = sin(ay)
    caz = cos(az); saz = sin(az)
    
    # Update each snake AI
    for (f = 0; f < 6; f++) {
      headX = snakeX[f,0]; headY = snakeY[f,0]
      fx = foodX[f]; fy = foodY[f]
      dir = snakeDir[f]
      
      # Simple AI: move toward food
      dx = fx - headX
      dy = fy - headY
      
      if (dx > 0 && dir != 2) newDir = 0
      else if (dx < 0 && dir != 0) newDir = 2
      else if (dy > 0 && dir != 3) newDir = 1
      else if (dy < 0 && dir != 1) newDir = 3
      else newDir = dir
      
      # Calculate new position
      if (newDir == 0) { nx = headX + 1; ny = headY }
      else if (newDir == 1) { nx = headX; ny = headY + 1 }
      else if (newDir == 2) { nx = headX - 1; ny = headY }
      else { nx = headX; ny = headY - 1 }
      
      # Check self collision
      hitSelf = 0
      for (i = 0; i < snakeLen[f]; i++)
        if (snakeX[f,i] == nx && snakeY[f,i] == ny) hitSelf = 1
      
      # Try other directions if needed
      if (hitSelf || nx < 0 || nx >= gw || ny < 0 || ny >= gh) {
        for (tryDir = 0; tryDir < 4; tryDir++) {
          if (tryDir == 0) { nx = headX + 1; ny = headY }
          else if (tryDir == 1) { nx = headX; ny = headY + 1 }
          else if (tryDir == 2) { nx = headX - 1; ny = headY }
          else { nx = headX; ny = headY - 1 }
          
          hitSelf = 0
          for (i = 0; i < snakeLen[f]; i++)
            if (snakeX[f,i] == nx && snakeY[f,i] == ny) hitSelf = 1
          
          if (!hitSelf && nx >= 0 && nx < gw && ny >= 0 && ny < gh) {
            newDir = tryDir
            break
          }
        }
      }
      
      snakeDir[f] = newDir
      
      # Recalculate position
      if (newDir == 0) { nx = headX + 1; ny = headY }
      else if (newDir == 1) { nx = headX; ny = headY + 1 }
      else if (newDir == 2) { nx = headX - 1; ny = headY }
      else { nx = headX; ny = headY - 1 }
      
      # Wrap around edges
      if (nx < 0) nx = gw - 1
      if (nx >= gw) nx = 0
      if (ny < 0) ny = gh - 1
      if (ny >= gh) ny = 0
      
      # Check food
      ate = 0
      if (nx == fx && ny == fy) {
        ate = 1
        score[f] += 10
        foodX[f] = int(rand() * gw)
        foodY[f] = int(rand() * gh)
      }
      
      # Move snake
      if (!ate) {
        for (i = snakeLen[f] - 1; i > 0; i--) {
          snakeX[f,i] = snakeX[f,i-1]
          snakeY[f,i] = snakeY[f,i-1]
        }
      } else {
        for (i = snakeLen[f]; i > 0; i--) {
          snakeX[f,i] = snakeX[f,i-1]
          snakeY[f,i] = snakeY[f,i-1]
        }
        snakeLen[f]++
        if (snakeLen[f] > 30) snakeLen[f] = 30
      }
      snakeX[f,0] = nx
      snakeY[f,0] = ny
    }
    
    # Define 6 faces with their corners and normals
    # Face 0: Front (z=1)
    # Face 1: Back (z=-1)
    # Face 2: Left (x=-1)
    # Face 3: Right (x=1)
    # Face 4: Top (y=1)
    # Face 5: Bottom (y=-1)
    
    # Draw each face
    for (f = 0; f < 6; f++) {
      # Face normal (before rotation)
      if (f == 0) { fnx=0; fny=0; fnz=1 }
      else if (f == 1) { fnx=0; fny=0; fnz=-1 }
      else if (f == 2) { fnx=-1; fny=0; fnz=0 }
      else if (f == 3) { fnx=1; fny=0; fnz=0 }
      else if (f == 4) { fnx=0; fny=1; fnz=0 }
      else { fnx=0; fny=-1; fnz=0 }
      
      # Rotate normal
      # Y rotation
      tnx = fnx * cay + fnz * say
      tnz = -fnx * say + fnz * cay
      fnx = tnx; fnz = tnz
      # X rotation
      tny = fny * cax - fnz * sax
      tnz = fny * sax + fnz * cax
      fny = tny; fnz = tnz
      
      # Back-face culling (skip if facing away)
      if (fnz < 0.1) continue
      
      # Draw grid on this face
      for (gy = 0; gy < gh; gy++) {
        for (gx = 0; gx < gw; gx++) {
          # Map grid coord to 3D face coord (-1 to 1)
          u = (gx / (gw-1)) * 2 - 1
          v = (gy / (gh-1)) * 2 - 1
          
          # 3D position based on face
          if (f == 0) { px=u; py=-v; pz=1 }
          else if (f == 1) { px=-u; py=-v; pz=-1 }
          else if (f == 2) { px=-1; py=-v; pz=-u }
          else if (f == 3) { px=1; py=-v; pz=u }
          else if (f == 4) { px=u; py=1; pz=v }
          else { px=u; py=-1; pz=-v }
          
          # Apply rotation (Y then X then Z)
          # Y rotation
          tx = px * cay + pz * say
          tz = -px * say + pz * cay
          px = tx; pz = tz
          # X rotation
          ty = py * cax - pz * sax
          tz = py * sax + pz * cax
          py = ty; pz = tz
          # Z rotation
          tx = px * caz - py * saz
          ty = px * saz + py * caz
          px = tx; py = ty
          
          # Project to screen
          scale = 14
          dist = 4
          persp = dist / (dist - pz)
          screenX = int(sw/2 + px * scale * persp)
          screenY = int(sh/2 - py * scale * persp * 0.6)
          
          if (screenX >= 0 && screenX < sw && screenY >= 0 && screenY < sh) {
            # Z-buffer check
            if (pz > depth[screenY, screenX]) {
              depth[screenY, screenX] = pz
              
              # Determine what to draw
              isSnake = 0
              isHead = 0
              isFood = 0
              
              # Check if food
              if (gx == foodX[f] && gy == foodY[f]) isFood = 1
              
              # Check if snake
              for (i = 0; i < snakeLen[f]; i++) {
                if (snakeX[f,i] == gx && snakeY[f,i] == gy) {
                  isSnake = 1
                  if (i == 0) isHead = 1
                }
              }
              
              col = faceCol[f]
              
              if (isHead) {
                scr[screenY, screenX] = "\033[97m◆\033[0m"
              } else if (isSnake) {
                scr[screenY, screenX] = "\033[" col "m█\033[0m"
              } else if (isFood) {
                scr[screenY, screenX] = "\033[91m●\033[0m"
              } else if (gx == 0 || gx == gw-1 || gy == 0 || gy == gh-1) {
                # Border
                scr[screenY, screenX] = "\033[" col "m░\033[0m"
              } else {
                # Empty cell
                scr[screenY, screenX] = "\033[90m·\033[0m"
              }
            }
          }
        }
      }
    }
    
    # Render
    printf "\033[H"
    printf "\033[97m  🐍 SNAKE CUBE - 6 Games on a Rotating Cube 🎲\033[0m\n"
    
    for (y = 0; y < sh; y++) {
      for (x = 0; x < sw; x++)
        printf "%s", scr[y,x]
      printf "\n"
    }
    
    # Scores
    printf " \033[91m■F:%d\033[0m \033[92m■B:%d\033[0m \033[94m■L:%d\033[0m \033[93m■R:%d\033[0m \033[95m■T:%d\033[0m \033[96m■Bo:%d\033[0m\n", score[0], score[1], score[2], score[3], score[4], score[5]
    
    t += 0.03
    system("sleep 0.07")
  }
}'
