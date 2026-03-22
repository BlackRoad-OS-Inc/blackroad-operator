#!/bin/bash
# BLACK HOLE WITH ACCRETION DISK

awk 'BEGIN {
  pi = 3.14159265
  w = 76; h = 40
  t = 0
  
  while (1) {
    printf "\033[H\033[2J"
    
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        # Normalize
        nx = (x - w/2) / (w/4)
        ny = (y - h/2) / (h/4) * 1.8
        
        r = sqrt(nx*nx + ny*ny)
        angle = atan2(ny, nx)
        
        # Event horizon
        if (r < 0.4) {
          printf "\033[40m \033[0m"
        }
        # Photon sphere glow
        else if (r < 0.55) {
          printf "\033[91m░\033[0m"
        }
        # Accretion disk
        else if (r < 2.2 && r > 0.5) {
          # Doppler shift + rotation
          diskAngle = angle + t * 2 + r * 0.5
          
          # Spiral density waves
          density = sin(diskAngle * 3) * 0.5 + 0.5
          density *= (1 - (r - 0.5) / 1.7)^0.5
          
          # Doppler beaming (approaching side brighter)
          doppler = 1 + 0.5 * cos(angle + t)
          density *= doppler
          
          # Temperature gradient (inner = hotter)
          temp = 1 - (r - 0.5) / 1.7
          
          if (density > 0.8) {
            if (temp > 0.7) printf "\033[97m█\033[0m"
            else if (temp > 0.4) printf "\033[93m▓\033[0m"
            else printf "\033[91m▒\033[0m"
          } else if (density > 0.5) {
            if (temp > 0.5) printf "\033[33m▒\033[0m"
            else printf "\033[31m░\033[0m"
          } else if (density > 0.2) {
            printf "\033[31m·\033[0m"
          } else {
            printf " "
          }
        }
        # Gravitational lensing arcs
        else if (r < 2.8 && r > 2.4) {
          lensAngle = angle * 2 + sin(r * 5 + t) * 0.3
          if (sin(lensAngle * 4 + t) > 0.7) {
            printf "\033[34m·\033[0m"
          } else {
            printf " "
          }
        }
        else {
          # Background stars (distorted near hole)
          warp = 1 + 0.5 / (r + 0.1)
          sx = nx * warp
          sy = ny * warp
          
          starfield = sin(sx * 47) * sin(sy * 31)
          if (starfield > 0.97) printf "\033[37m·\033[0m"
          else if (starfield > 0.95) printf "\033[34m.\033[0m"
          else printf " "
        }
      }
      printf "\n"
    }
    
    printf "\033[96m  ⬤ SAGITTARIUS A* - SUPERMASSIVE BLACK HOLE\033[0m\n"
    
    t += 0.08
    system("sleep 0.05")
  }
}'
