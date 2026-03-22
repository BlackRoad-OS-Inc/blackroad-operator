#!/usr/bin/env python3
import pygame, sys

# -------- CONFIG --------
TILE_W = 64
TILE_H = 32
SCREEN_W = 600
SCREEN_H = 400

BG = (10, 12, 16)
GRASS_TOP = (90, 180, 90)
GRASS_EDGE = (40, 120, 40)
OUTLINE = (20, 30, 20)
# ------------------------

def draw_grass_tile(surface, cx, cy):
    top = [
        (cx, cy),
        (cx + TILE_W//2, cy + TILE_H//2),
        (cx, cy + TILE_H),
        (cx - TILE_W//2, cy + TILE_H//2),
    ]

    pygame.draw.polygon(surface, GRASS_TOP, top)
    pygame.draw.polygon(surface, OUTLINE, top, 1)

def main():
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_W, SCREEN_H))
    pygame.display.set_caption("Single Grass Tile")
    clock = pygame.time.Clock()

    cx = SCREEN_W // 2
    cy = SCREEN_H // 2 - TILE_H // 2

    while True:
        for e in pygame.event.get():
            if e.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        screen.fill(BG)
        draw_grass_tile(screen, cx, cy)
        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()
