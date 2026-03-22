#!/usr/bin/env python3
import pygame, sys

# ---------- CONFIG ----------
TILE_W = 64
TILE_H = 32
SCREEN_W = 900
SCREEN_H = 600

BG = (12, 14, 18)

GRASS_TOP  = (95, 185, 95)
GRASS_SIDE = (65, 145, 65)

DIRT_TOP   = (150, 110, 70)
DIRT_SIDE  = (120, 85, 50)

ROAD_TOP   = (90, 90, 90)
ROAD_SIDE  = (70, 70, 70)

TREE_TRUNK = (110, 80, 50)
TREE_LEAF  = (40, 140, 70)

OUTLINE = (25, 25, 25)

CAM_X = SCREEN_W // 2
CAM_Y = 120
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

def draw_tree(surface, x, y):
    cx, cy = iso_to_screen(x, y, 1)
    trunk = pygame.Rect(cx - 4, cy + 18, 8, 18)
    pygame.draw.rect(surface, TREE_TRUNK, trunk)
    pygame.draw.circle(surface, TREE_LEAF, (cx, cy + 10), 14)

def main():
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_W, SCREEN_H))
    pygame.display.set_caption("Isometric Farm Patch")
    clock = pygame.time.Clock()

    # G = grass, D = dirt, R = road, T = tree
    world = [
        ["D","D","D","D","D","D"],
        ["D","G","G","G","G","D"],
        ["D","G","T","R","G","D"],
        ["D","G","G","R","G","D"],
        ["D","G","G","G","G","D"],
        ["D","D","D","D","D","D"],
    ]

    while True:
        for e in pygame.event.get():
            if e.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        screen.fill(BG)

        for y,row in enumerate(world):
            for x,t in enumerate(row):
                if t == "G" or t == "T":
                    draw_cube(screen, x, y, 1, GRASS_TOP, GRASS_SIDE)
                elif t == "R":
                    draw_cube(screen, x, y, 0, ROAD_TOP, ROAD_SIDE)
                else:
                    draw_cube(screen, x, y, 0, DIRT_TOP, DIRT_SIDE)

        for y,row in enumerate(world):
            for x,t in enumerate(row):
                if t == "T":
                    draw_tree(screen, x, y)

        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()
