#!/usr/bin/env python3
import pygame, sys

# ---------- CONFIG ----------
TILE_W = 64
TILE_H = 32
GRID_W = 12
GRID_H = 12
BG = (8, 8, 10)
GRID_COLOR = (120, 220, 180)
BLOCK_COLOR = (255, 180, 60)
EDGE_COLOR = (30, 30, 30)

CAM_X = 400
CAM_Y = 100
# ----------------------------

def iso_to_screen(x, y, z=0):
    sx = (x - y) * (TILE_W // 2) + CAM_X
    sy = (x + y) * (TILE_H // 2) + CAM_Y - z * TILE_H
    return sx, sy

def screen_to_iso(mx, my):
    mx -= CAM_X
    my -= CAM_Y
    gx = (mx / (TILE_W/2) + my / (TILE_H/2)) / 2
    gy = (my / (TILE_H/2) - mx / (TILE_W/2)) / 2
    return int(gx), int(gy)

def draw_tile(surf, x, y, z=0, fill=None):
    cx, cy = iso_to_screen(x, y, z)
    pts = [
        (cx, cy),
        (cx + TILE_W//2, cy + TILE_H//2),
        (cx, cy + TILE_H),
        (cx - TILE_W//2, cy + TILE_H//2),
    ]
    if fill:
        pygame.draw.polygon(surf, fill, pts)
    pygame.draw.polygon(surf, EDGE_COLOR, pts, 1)

def main():
    pygame.init()
    screen = pygame.display.set_mode((900, 700))
    pygame.display.set_caption("Isometric Engine")
    clock = pygame.time.Clock()

    heights = [[0 for _ in range(GRID_W)] for _ in range(GRID_H)]

    global CAM_X, CAM_Y

    while True:
        for e in pygame.event.get():
            if e.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

            if e.type == pygame.MOUSEBUTTONDOWN:
                mx, my = pygame.mouse.get_pos()
                gx, gy = screen_to_iso(mx, my)
                if 0 <= gx < GRID_W and 0 <= gy < GRID_H:
                    if e.button == 1:
                        heights[gy][gx] += 1
                    if e.button == 3 and heights[gy][gx] > 0:
                        heights[gy][gx] -= 1

            if e.type == pygame.KEYDOWN:
                if e.key == pygame.K_w: CAM_Y += 20
                if e.key == pygame.K_s: CAM_Y -= 20
                if e.key == pygame.K_a: CAM_X += 20
                if e.key == pygame.K_d: CAM_X -= 20

        screen.fill(BG)

        for y in range(GRID_H):
            for x in range(GRID_W):
                draw_tile(screen, x, y)

        for y in range(GRID_H):
            for x in range(GRID_W):
                for z in range(heights[y][x]):
                    draw_tile(screen, x, y, z+1, BLOCK_COLOR)

        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()
