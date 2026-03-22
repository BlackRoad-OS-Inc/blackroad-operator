#!/bin/bash
# SPINNING DONUT - rainbow edition

awk 'BEGIN {
  PI = 3.14159
  R1 = 1; R2 = 2  # torus radii
  K2 = 5; K1 = 15
  w = 80; h = 40
  
  A = 0; B = 0  # rotation angles
  
  while (1) {
    # Clear buffers
    for (i = 0; i < h; i++)
      for (j = 0; j < w; j++) {
        out[i,j] = " "
        zbuf[i,j] = -999
      }
    
    # Render torus
    for (th = 0; th < 6.28; th += 0.07) {
      for (ph = 0; ph < 6.28; ph += 0.02) {
        # Torus parametric
        cx = cos(th); sx = sin(th)
        cp = cos(ph); sp = sin(ph)
        cA = cos(A); sA = sin(A)
        cB = cos(B); sB = sin(B)
        
        # Circle point
        circx = R2 + R1*cx
        circy = R1*sx
        
        # 3D rotation
        x = circx*(cB*cp + sA*sB*sp) - circy*cA*sB
        y = circx*(sB*cp - sA*cB*sp) + circy*cA*cB
        z = K2 + cA*circx*sp + circy*sA
        ooz = 1/z
        
        # Project
        xp = int(w/2 + K1*ooz*x)
        yp = int(h/2 - K1*ooz*y*0.5)
        
        # Luminance
        L = cp*cx*sB - cA*cx*sp - sA*sx + cB*(cA*sx - cx*sA*sp)
        
        if (L > 0 && xp >= 0 && xp < w && yp >= 0 && yp < h) {
          if (ooz > zbuf[yp,xp]) {
            zbuf[yp,xp] = ooz
            # Rainbow based on angle
            col = 31 + int((th + ph) * 1.2) % 7
            li = int(L * 8)
            if (li > 11) li = 11
            chars = ".,-~:;=!*#$@"
            out[yp,xp] = substr(chars, li+1, 1)
            clr[yp,xp] = col
          }
        }
      }
    }
    
    # Output
    printf "\033[H"
    for (i = 0; i < h; i++) {
      for (j = 0; j < w; j++) {
        if (out[i,j] != " ")
          printf "\033[1;%dm%s\033[0m", clr[i,j], out[i,j]
        else
          printf " "
      }
      printf "\n"
    }
    
    A += 0.07
    B += 0.03
    system("sleep 0.02")
  }
}'
