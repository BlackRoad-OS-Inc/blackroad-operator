#!/usr/bin/env awk -f
BEGIN {
    # 64x32 display, 16-unit block
    for (i = 0; i < 32; i++)
        for (j = 0; j < 64; j++)
            s[i, j] = 32  # space
    
    # 3 faces × 16² points each = 768 total
    # TOP: z=16, x∈[0,16), y∈[0,16)
    for (a = 0; a < 16; a++) {
        for (b = 0; b < 16; b++) {
            # projection: px = 32 + (a - b), py = 2 + (a + b) / 2
            p = 32 + a - b
            q = 2 + int((a + b) / 2)
            if (p >= 0 && p < 64 && q >= 0 && q < 32) s[q, p] = 64  # @
        }
    }
    
    # LEFT: y=0, x∈[0,16), z∈[0,16)
    for (a = 0; a < 16; a++) {
        for (c = 0; c < 16; c++) {
            p = 32 + a - 16 + 1
            q = 2 + 8 + int(a / 2) + (16 - 1 - c)
            if (p >= 0 && p < 64 && q >= 0 && q < 32) s[q, p] = 35  # #
        }
    }
    
    # RIGHT: x=16, y∈[0,16), z∈[0,16)
    for (b = 0; b < 16; b++) {
        for (c = 0; c < 16; c++) {
            p = 32 + 16 - b - 1
            q = 2 + 8 + int(b / 2) + (16 - 1 - c)
            if (p >= 0 && p < 64 && q >= 0 && q < 32) s[q, p] = 43  # +
        }
    }
    
    for (i = 0; i < 32; i++) {
        for (j = 0; j < 64; j++)
            printf "%c", s[i, j]
        printf "\n"
    }
}
