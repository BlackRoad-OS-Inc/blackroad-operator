#!/usr/bin/env python3
import pygame, sys

# ---------- CONFIG ----------
TILE_W = 64
TILE_H = 32
ROOM_W = 6
ROOM_D = 6
WALL_H = 4

SCREEN_W = 900
SCREEN_H = 600

BG = (10, 12, 16)

FLOOR = (190, 180, 120)
WALL  = (220, 220, 160)
SIDE  = (200, 200, 140)

BED_TOP  = (70, 150, 120)
BED_SIDE = (55, 120, 95)

TABLE_TOP  = (160, 120, 80)
TABLE_SIDE = (130, 95, 60)

OUTLINE = (40, 40, 40)

CAM_X = SCREEN_W // 2
CAM_Y = 160
# ----------------------------

def iso_to_screen(x, y, z):
    sx = (x - y) * (TILE_W // 2) + CAM_X
    sy = (x + y) * (TILE_H // 2) + CAM_Y - z * TILE_H
    return sx, sy

def diamond(cx, cy):
    return [
        (cx, cy),
        (cx + TILE_W//2, cy + TILE_H//2),
        (cx, cy + TILE_H),
        (cx - TILE_W//2, cy + TILE_H//2),
    ]

def draw_tile(surface, x, y, z, color):
    cx, cy = iso_to_screen(x, y, z)
    pts = diamond(cx, cy)
    pygame.draw.polygon(surface, color, pts)
    pygame.draw.polygon(surface, OUTLINE, pts, 1)

def draw_cube(surface, x, y, z, h, top_color, side_color):
    # draw sides from bottom to top
    for i in range(h):
        cx, cy = iso_to_screen(x, y, z + i)
        top = diamond(cx, cy)

        left = [
            top[0],
            top[3],
            (top[3][0], top[3][1] + TILE_H),
            (top[0][0], top[0][1] + TILE_H),
        ]

        right = [
            top[1],
            (top[1][0], top[1][1] + TILE_H),
            (top[2][0], top[2][1] + TILE_H),
            top[2],
        ]

        pygame.draw.polygon(surface, side_color, left)
        pygame.draw.polygon(surface, side_color, right)
        pygame.draw.polygon(surface, OUTLINE, left, 1)
        pygame.draw.polygon(surface, OUTLINE, right, 1)

    # draw top
    cx, cy = iso_to_screen(x, y, z + h)
    top = diamond(cx, cy)
    pygame.draw.polygon(surface, top_color, top)
    pygame.draw.polygon(surface, OUTLINE, top, 1)

def main():
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_W, SCREEN_H))
    pygame.display.set_caption("Isometric Room + Furniture")
    clock = pygame.time.Clock()

    while True:
        for e in pygame.event.get():
            if e.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        screen.fill(BG)

        # 1️⃣ BACK WALL
        for z in range(WALL_H):
            for x in range(ROOM_W):
                draw_tile(screen, x, 0, z, WALL)

        # 2️⃣ SIDE WALL
        for z in range(WALL_H):
            for y in range(ROOM_D):
                draw_tile(screen, 0, y, z, SIDE)

        # 3️⃣ FLOOR
        for y in range(ROOM_D):
            for x in range(ROOM_W):
                draw_tile(screen, x, y, 0, FLOOR)

        # 4️⃣ FURNITURE
        draw_cube(screen, 2, 2, 0, 1, BED_TOP, BED_SIDE)    # bed
        draw_cube(screen, 4, 3, 0, 1, TABLE_TOP, TABLE_SIDE) # table

        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()
