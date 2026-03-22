#!/bin/bash
# Spinning 3D cube with ANSI colors

awk 'BEGIN {
  PI = 3.14159265
  w = 60; h = 30
  size = 8
  
  # 8 vertices of a cube centered at origin
  v[0,0]=-1; v[0,1]=-1; v[0,2]=-1
  v[1,0]= 1; v[1,1]=-1; v[1,2]=-1
  v[2,0]= 1; v[2,1]= 1; v[2,2]=-1
  v[3,0]=-1; v[3,1]= 1; v[3,2]=-1
  v[4,0]=-1; v[4,1]=-1; v[4,2]= 1
  v[5,0]= 1; v[5,1]=-1; v[5,2]= 1
  v[6,0]= 1; v[6,1]= 1; v[6,2]= 1
  v[7,0]=-1; v[7,1]= 1; v[7,2]= 1
  
  for (frame = 0; frame < 120; frame++) {
    # Clear screen buffer
    for (i = 0; i < h; i++)
      for (j = 0; j < w; j++) {
        scr[i,j] = " "
        dep[i,j] = -999
      }
    
    # Rotation angles
    ax = frame * 0.05
    ay = frame * 0.03
    az = frame * 0.02
    
    # Trig
    sa = sin(ax); ca = cos(ax)
    sb = sin(ay); cb = cos(ay)
    sc = sin(az); cc = cos(az)
    
    # Draw filled faces (3 visible at a time)
    # Iterate through the 3 visible faces based on rotation
    
    # For each face, sample points and project
    for (fi = 0; fi < 6; fi++) {
      # Face normals to determine visibility
      if (fi == 0) { nx=0; ny=0; nz=-1; c="@"; col=41 }  # front - red
      if (fi == 1) { nx=0; ny=0; nz= 1; c="@"; col=44 }  # back - blue
      if (fi == 2) { nx=-1;ny=0; nz= 0; c="#"; col=42 }  # left - green
      if (fi == 3) { nx= 1;ny=0; nz= 0; c="#"; col=43 }  # right - yellow
      if (fi == 4) { nx=0; ny=-1;nz= 0; c="+"; col=45 }  # bottom - magenta
      if (fi == 5) { nx=0; ny= 1;nz= 0; c="+"; col=46 }  # top - cyan
      
      # Rotate normal
      ty = ny*ca - nz*sa; tz = ny*sa + nz*ca; ny=ty; nz=tz
      tx = nx*cb + nz*sb; tz = -nx*sb + nz*cb; nx=tx; nz=tz
      tx = nx*cc - ny*sc; ty = nx*sc + ny*cc; nx=tx; ny=ty
      
      # Back-face culling
      if (nz >= 0) continue
      
      # Sample face
      for (u = -1; u <= 1; u += 0.1) {
        for (vv = -1; vv <= 1; vv += 0.1) {
          # Get 3D point on face
          if (fi == 0) { x=u; y=vv; z=-1 }
          if (fi == 1) { x=u; y=vv; z= 1 }
          if (fi == 2) { x=-1; y=u; z=vv }
          if (fi == 3) { x= 1; y=u; z=vv }
          if (fi == 4) { x=u; y=-1; z=vv }
          if (fi == 5) { x=u; y= 1; z=vv }
          
          # Rotate X
          ty = y*ca - z*sa; tz = y*sa + z*ca; y=ty; z=tz
          # Rotate Y
          tx = x*cb + z*sb; tz = -x*sb + z*cb; x=tx; z=tz
          # Rotate Z
          tx = x*cc - y*sc; ty = x*sc + y*cc; x=tx; y=ty
          
          # Project
          pz = z + 4
          px = int(w/2 + x * size * 2 / pz * 2)
          py = int(h/2 - y * size / pz)
          
          if (px >= 0 && px < w && py >= 0 && py < h) {
            if (z > dep[py,px]) {
              dep[py,px] = z
              scr[py,px] = c
              clr[py,px] = col
            }
          }
        }
      }
    }
    
    # Output frame
    printf "\033[H\033[2J"  # clear
    printf "\n  SPINNING CUBE - frame %d\n\n", frame
    for (i = 0; i < h; i++) {
      for (j = 0; j < w; j++) {
        if (scr[i,j] != " ")
          printf "\033[%dm%s\033[0m", clr[i,j], scr[i,j]
        else
          printf " "
      }
      printf "\n"
    }
    
    # Delay
    system("sleep 0.05")
  }
}'
