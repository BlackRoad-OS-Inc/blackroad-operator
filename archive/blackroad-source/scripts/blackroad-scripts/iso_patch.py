#!/usr/bin/env python3
import pygame, sys

# -------- CONFIG --------
TILE_W = 64
TILE_H = 32
SCREEN_W = 700
SCREEN_H = 500

BG = (10, 12, 16)

GRASS = (90, 180, 90)
DIRT  = (150, 110, 70)
OUTLINE = (25, 25, 25)

CAM_X = SCREEN_W // 2
CAM_Y = 140
# ------------------------

def iso_to_screen(x, y):
    sx = (x - y) * (TILE_W // 2) + CAM_X
    sy = (x + y) * (TILE_H // 2) + CAM_Y
    return sx, sy

def draw_tile(surface, x, y, color):
    cx, cy = iso_to_screen(x, y)
    pts = [
        (cx, cy),
        (cx + TILE_W//2, cy + TILE_H//2),
        (cx, cy + TILE_H),
        (cx - TILE_W//2, cy + TILE_H//2),
    ]
    pygame.draw.polygon(surface, color, pts)
    pygame.draw.polygon(surface, OUTLINE, pts, 1)

def main():
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_W, SCREEN_H))
    pygame.display.set_caption("Grass Patch")
    clock = pygame.time.Clock()

    # map definition
    # D = dirt, G = grass
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
            for x,tile in enumerate(row):
                if tile == "G":
                    draw_tile(screen, x, y, GRASS)
                else:
                    draw_tile(screen, x, y, DIRT)

        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()
