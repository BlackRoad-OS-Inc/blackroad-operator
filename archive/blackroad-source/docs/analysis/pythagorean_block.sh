#!/usr/bin/env awk -f

BEGIN {
    r = 10
    size = 2 * r + 1

    for (y = -r; y <= r; y++) {
        for (x = -r; x <= r; x++) {

            if (x*x + y*y <= r*r)
                printf "%c", 35   # #
            else
                printf "%c", 32   # space
        }
        printf "\n"
    }
}
