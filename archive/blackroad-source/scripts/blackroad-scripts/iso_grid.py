#!/usr/bin/env python3
import pygame
import sys

# -------- CONFIG --------
TILE_W = 64
TILE_H = 32
GRID_W = 10
GRID_H = 10
BG = (10, 10, 10)
GRID_COLOR = (80, 200, 120)
ORIGIN_X = 400
ORIGIN_Y = 120
# ------------------------

def iso_to_screen(x, y):
    sx = (x - y) * (TILE_W // 2) + ORIGIN_X
    sy = (x + y) * (TILE_H // 2) + ORIGIN_Y
    return sx, sy

def draw_tile(surface, x, y, color):
    cx, cy = iso_to_screen(x, y)
    points = [
        (cx, cy),
        (cx + TILE_W//2, cy + TILE_H//2),
        (cx, cy + TILE_H),
        (cx - TILE_W//2, cy + TILE_H//2),
    ]
    pygame.draw.polygon(surface, color, points, 1)

def main():
    pygame.init()
    screen = pygame.display.set_mode((800, 600))
    pygame.display.set_caption("Isometric Grid")
    clock = pygame.time.Clock()

    while True:
        for e in pygame.event.get():
            if e.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        screen.fill(BG)

        for y in range(GRID_H):
            for x in range(GRID_W):
                draw_tile(screen, x, y, GRID_COLOR)

        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()
