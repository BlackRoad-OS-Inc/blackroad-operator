#!/usr/bin/env awk -f
BEGIN {
    print "=== MINECRAFT BASE-16 BIT MATH ==="
    print ""
    
    # Test coordinates
    x = 47; y = 73; z = -12
    
    printf "World position: (%d, %d, %d)\n\n", x, y, z
    
    # Block position (floor for negative)
    bx = (x >= 0) ? int(x) : int(x) - 1
    by = (y >= 0) ? int(y) : int(y) - 1
    bz = (z >= 0) ? int(z) : int(z) - 1
    
    printf "Block: (%d, %d, %d)\n", bx, by, bz
    
    # Chunk position: >> 4 (divide by 16, floor)
    cx = (bx >= 0) ? int(bx / 16) : int((bx + 1) / 16) - 1
    cy = (by >= 0) ? int(by / 16) : int((by + 1) / 16) - 1
    cz = (bz >= 0) ? int(bz / 16) : int((bz + 1) / 16) - 1
    
    printf "Chunk: (%d, %d, %d)\n", cx, cy, cz
    
    # Local position within chunk: & 0xF (mod 16)
    lx = ((bx % 16) + 16) % 16
    ly = ((by % 16) + 16) % 16
    lz = ((bz % 16) + 16) % 16
    
    printf "Local: (%d, %d, %d)\n\n", lx, ly, lz
    
    # Block index in chunk array
    # index = y << 8 | z << 4 | x  (for 16x16x16 section)
    idx = ly * 256 + lz * 16 + lx
    
    printf "Section index: %d\n", idx
    printf "  = %d×256 + %d×16 + %d\n", ly, lz, lx
    printf "  = (y<<8) | (z<<4) | x\n\n"
    
    # Point-in-block test
    print "=== POINT-IN-BLOCK TEST ==="
    for (tx = -1; tx <= 16; tx += 17) {
        for (ty = 0; ty <= 15; ty += 15) {
            for (tz = 0; tz <= 16; tz += 16) {
                # The bit trick: (x|y|z) >> 4 == 0 means all in [0,15]
                # But awk lacks bitwise, so:
                inside = (tx >= 0 && tx < 16 && ty >= 0 && ty < 16 && tz >= 0 && tz < 16)
                printf "  (%2d,%2d,%2d) → %s\n", tx, ty, tz, inside ? "INSIDE" : "outside"
            }
        }
    }
}
