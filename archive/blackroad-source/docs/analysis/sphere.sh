#!/usr/bin/env awk -f

BEGIN {
    width = 80
    height = 40
    r = 1.0
    distance = 3.0

    for (y = 0; y < height; y++)
        for (x = 0; x < width; x++)
            screen[y, x] = " "

    for (phi = 0; phi <= 3.14159; phi += 0.10) {
        for (theta = 0; theta < 6.28318; theta += 0.10) {

            # --- 3D sphere geometry ---
            x3 = r * sin(phi) * cos(theta)
            y3 = r * sin(phi) * sin(theta)
            z3 = r * cos(phi)

            # --- perspective projection ---
            scale = 1 / (z3 + distance)
            x2 = x3 * scale
            y2 = y3 * scale

            sx = int((x2 + 1) * width / 2)
            sy = int((1 - y2) * height / 2)

            # --- depth shading ---
            if (z3 > 0.6)        ch = "#"
            else if (z3 > 0.2)   ch = "*"
            else if (z3 > -0.2)  ch = "+"
            else if (z3 > -0.6)  ch = "."
            else                 ch = " "

            if (sx >= 0 && sx < width && sy >= 0 && sy < height)
                screen[sy, sx] = ch
        }
    }

    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++)
            printf "%s", screen[y, x]
        printf "\n"
    }
}
