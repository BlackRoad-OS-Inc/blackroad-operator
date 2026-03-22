#!/usr/bin/env awk -f
BEGIN {
    width = 60; height = 30
    size = 6
    ox = 30; oy = 8  # top vertex position

    # init screen
    for (y = 0; y < height; y++)
        for (x = 0; x < width; x++)
            screen[y, x] = " "

    # TOP FACE - flat rhombus
    for (i = 0; i < size; i++) {
        for (j = 0; j < size; j++) {
            px = ox + (i - j) * 2
            py = oy + i + j
            if (py >= 0 && py < height && px >= 0 && px < width)
                screen[py, px] = "#"
        }
    }

    # LEFT FACE - drops down from left edge of top
    for (i = 0; i < size; i++) {
        for (j = 0; j < size; j++) {
            px = ox - (size - i) * 2 - j * 2 + 2
            py = oy + (size - 1) + i + j + 1
            if (py >= 0 && py < height && px >= 0 && px < width)
                screen[py, px] = "/"
        }
    }

    # RIGHT FACE - drops down from right edge of top
    for (i = 0; i < size; i++) {
        for (j = 0; j < size; j++) {
            px = ox + (size - i) * 2 + j * 2 - 2
            py = oy + (size - 1) + i + j + 1
            if (py >= 0 && py < height && px >= 0 && px < width)
                screen[py, px] = "\\"
        }
    }

    # draw
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++)
            printf "%s", screen[y, x]
        printf "\n"
    }
}
