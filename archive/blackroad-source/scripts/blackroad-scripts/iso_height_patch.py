#!/usr/bin/env python3
import pygame, sys

# ---------- CONFIG ----------
TILE_W = 64
TILE_H = 32
SCREEN_W = 700
SCREEN_H = 500

BG = (10, 12, 16)

GRASS_TOP  = (90, 180, 90)
GRASS_SIDE = (60, 140, 60)

DIRT_TOP   = (150, 110, 70)
DIRT_SIDE  = (120, 85, 50)

OUTLINE = (25, 25, 25)

CAM_X = SCREEN_W // 2
CAM_Y = 140
# ----------------------------

def iso_to_screen(x, y, z):
    sx = (x - y) * (TILE_W // 2) + CAM_X
    sy = (x + y) * (TILE_H // 2) + CAM_Y - z * TILE_H
    return sx, sy

def draw_cube(surface, x, y, z, top_color, side_color):
    cx, cy = iso_to_screen(x, y, z)

    top = [
        (cx, cy),
        (cx + TILE_W//2, cy + TILE_H//2),
        (cx, cy + TILE_H),
        (cx - TILE_W//2, cy + TILE_H//2),
    ]

    right = [
        top[1],
        (top[1][0], top[1][1] + TILE_H),
        (top[2][0], top[2][1] + TILE_H),
        top[2],
    ]

    left = [
        top[0],
        top[3],
        (top[3][0], top[3][1] + TILE_H),
        (top[0][0], top[0][1] + TILE_H),
    ]

    pygame.draw.polygon(surface, side_color, left)
    pygame.draw.polygon(surface, side_color, right)
    pygame.draw.polygon(surface, top_color, top)

    pygame.draw.polygon(surface, OUTLINE, left, 1)
    pygame.draw.polygon(surface, OUTLINE, right, 1)
    pygame.draw.polygon(surface, OUTLINE, top, 1)

def main():
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_W, SCREEN_H))
    pygame.display.set_caption("Raised Grass Patch")
    clock = pygame.time.Clock()

    # D = dirt (height 0), G = grass (height 1)
    world = [
        ["D","D","D","D"],
        ["D","G","G","D"],
        ["D","G","G","D"],
        ["D","D","D","D"],
    ]

    while True:
        for e in pygame.event.get():
            if e.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        screen.fill(BG)

        for y,row in enumerate(world):
            for x,t in enumerate(row):
                if t == "G":
                    draw_cube(screen, x, y, 1, GRASS_TOP, GRASS_SIDE)
                else:
                    draw_cube(screen, x, y, 0, DIRT_TOP, DIRT_SIDE)

        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()
