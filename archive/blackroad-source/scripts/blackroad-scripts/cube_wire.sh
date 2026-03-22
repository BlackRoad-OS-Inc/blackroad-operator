#!/usr/bin/env awk -f
BEGIN {
    # 8 vertices of a cube, isometric projected
    s = 5  # size
    ox = 25; oy = 10
    
    # Project 3D→2D isometric: px = x - y, py = (x + y)/2 - z
    # Vertices: (0,0,0), (s,0,0), (0,s,0), (s,s,0), (0,0,s), (s,0,s), (0,s,s), (s,s,s)
    
    for (y = 0; y < 25; y++)
        for (x = 0; x < 50; x++)
            scr[y,x] = " "
    
    # Draw 12 edges using Bresenham would be complex...
    # Instead: parametric fill of 3 visible faces
    
    # Top (z=s plane)
    for (i = 0; i <= s*2; i++) {
        for (j = 0; j <= s*2; j++) {
            x3 = i/2.0; y3 = j/2.0; z3 = s
            px = int(ox + (x3 - y3) * 2)
            py = int(oy + (x3 + y3) - z3)
            if (x3 <= s && y3 <= s && px >= 0 && px < 50 && py >= 0 && py < 25)
                scr[py, px] = "@"
        }
    }
    # Left (y=0 plane)
    for (i = 0; i <= s*2; i++) {
        for (k = 0; k <= s*2; k++) {
            x3 = i/2.0; y3 = 0; z3 = k/2.0
            px = int(ox + (x3 - y3) * 2)
            py = int(oy + (x3 + y3) - z3)
            if (x3 <= s && z3 <= s && px >= 0 && px < 50 && py >= 0 && py < 25)
                scr[py, px] = "/"
        }
    }
    # Right (x=s plane)
    for (j = 0; j <= s*2; j++) {
        for (k = 0; k <= s*2; k++) {
            x3 = s; y3 = j/2.0; z3 = k/2.0
            px = int(ox + (x3 - y3) * 2)
            py = int(oy + (x3 + y3) - z3)
            if (y3 <= s && z3 <= s && px >= 0 && px < 50 && py >= 0 && py < 25)
                scr[py, px] = "\\"
        }
    }
    
    for (y = 0; y < 25; y++) {
        for (x = 0; x < 50; x++)
            printf "%s", scr[y, x]
        printf "\n"
    }
}
