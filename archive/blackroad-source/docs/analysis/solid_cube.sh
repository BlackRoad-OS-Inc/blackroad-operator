#!/usr/bin/env awk -f
BEGIN {
    w = 50; h = 25
    s = 5           # cube size
    ox = 25; oy = 5 # origin (top corner)
    
    for (y = 0; y < h; y++)
        for (x = 0; x < w; x++)
            scr[y, x] = " "
    
    # TOP FACE - iterate in 3D, project to 2D
    for (a = 0; a <= s * 4; a++) {
        for (b = 0; b <= s * 4; b++) {
            x3 = a / 4.0; y3 = b / 4.0; z3 = s
            if (x3 > s || y3 > s) continue
            px = int(ox + (x3 - y3) * 2)
            py = int(oy + (x3 + y3) - z3)
            if (px >= 0 && px < w && py >= 0 && py < h)
                scr[py, px] = "@"
        }
    }
    
    # LEFT FACE (y=0 plane, x and z vary)
    for (a = 0; a <= s * 4; a++) {
        for (c = 0; c <= s * 4; c++) {
            x3 = a / 4.0; y3 = 0; z3 = c / 4.0
            if (x3 > s || z3 > s) continue
            px = int(ox + (x3 - y3) * 2)
            py = int(oy + (x3 + y3) - z3)
            if (px >= 0 && px < w && py >= 0 && py < h)
                scr[py, px] = "/"
        }
    }
    
    # RIGHT FACE (x=s plane, y and z vary)
    for (b = 0; b <= s * 4; b++) {
        for (c = 0; c <= s * 4; c++) {
            x3 = s; y3 = b / 4.0; z3 = c / 4.0
            if (y3 > s || z3 > s) continue
            px = int(ox + (x3 - y3) * 2)
            py = int(oy + (x3 + y3) - z3)
            if (px >= 0 && px < w && py >= 0 && py < h)
                scr[py, px] = "\\"
        }
    }
    
    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++)
            printf "%s", scr[y, x]
        printf "\n"
    }
}
