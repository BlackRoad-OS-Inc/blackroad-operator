#!/bin/bash
# MANDELBROT FRACTAL ZOOM

awk 'BEGIN {
  w = 78; h = 35
  
  cx = -0.745; cy = 0.186  # zoom target
  zoom = 1
  
  chars = " .,:-=+*#%@@@@"
  cols[0]=40; cols[1]=40; cols[2]=34; cols[3]=36
  cols[4]=32; cols[5]=33; cols[6]=31; cols[7]=35
  cols[8]=91; cols[9]=93; cols[10]=92; cols[11]=96; cols[12]=97
  
  for (frame = 0; frame < 200; frame++) {
    printf "\033[H"
    printf "  MANDELBROT  zoom: %.2e\n\n", zoom
    
    for (py = 0; py < h; py++) {
      for (px = 0; px < w; px++) {
        # Map pixel to complex plane
        x0 = cx + (px - w/2) / (w * zoom * 0.5)
        y0 = cy + (py - h/2) / (h * zoom * 0.3)
        
        x = 0; y = 0
        iter = 0
        maxiter = 50
        
        while (x*x + y*y <= 4 && iter < maxiter) {
          xt = x*x - y*y + x0
          y = 2*x*y + y0
          x = xt
          iter++
        }
        
        if (iter == maxiter) {
          printf "\033[40m \033[0m"
        } else {
          ci = iter % 13
          ch = substr(chars, ci+1, 1)
          printf "\033[%dm%s\033[0m", cols[ci], ch
        }
      }
      printf "\n"
    }
    
    zoom = zoom * 1.08
    system("sleep 0.08")
  }
}'
