#!/usr/bin/env awk -f
BEGIN {
    w = 64; h = 32
    b = 16          # block size (Minecraft base unit)
    ox = 32; oy = 2 # top vertex
    
    for (y = 0; y < h; y++)
        for (x = 0; x < w; x++)
            scr[y, x] = " "
    
    # Minecraft lighting: top=1.0, north/south=0.8, east/west=0.6, bottom=0.5
    # We see: TOP, WEST (-Y), EAST (+X)
    
    # TOP FACE - light level 1.0 → @
    for (i = 0; i < b; i++) {
        for (j = 0; j < b; j++) {
            px = ox + (i - j)
            py = oy + int((i + j) / 2)
            if (px >= 0 && px < w && py >= 0 && py < h)
                scr[py, px] = "@"
        }
    }
    
    # WEST FACE (-Y direction) - light level 0.8 → #
    for (i = 0; i < b; i++) {
        for (k = 0; k < b; k++) {
            px = ox - b + i + 1
            py = oy + int(b / 2) + int(i / 2) + k
            if (px >= 0 && px < w && py >= 0 && py < h)
                scr[py, px] = "#"
        }
    }
    
    # EAST FACE (+X direction) - light level 0.6 → +
    for (j = 0; j < b; j++) {
        for (k = 0; k < b; k++) {
            px = ox + b - j - 1
            py = oy + int(b / 2) + int(j / 2) + k
            if (px >= 0 && px < w && py >= 0 && py < h)
                scr[py, px] = "+"
        }
    }
    
    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++)
            printf "%s", scr[y, x]
        printf "\n"
    }
}
