#!/usr/bin/env python3
import pygame, sys

# ---------- CONFIG ----------
TILE_W = 64
TILE_H = 32

SCREEN_W = 600
SCREEN_H = 400

BG = (18, 20, 24)

GRASS_TOP   = (120, 210, 120)
GRASS_LEFT  = (90, 170, 90)
GRASS_RIGHT = (75, 150, 75)

OUTLINE = (25, 35, 25)

CX = SCREEN_W // 2
CY = SCREEN_H // 2 - 40
# ----------------------------

def main():
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_W, SCREEN_H))
    pygame.display.set_caption("Perfect Isometric Grass Block")
    clock = pygame.time.Clock()

    while True:
        for e in pygame.event.get():
            if e.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        screen.fill(BG)

        # ---- TOP FACE ----
        A = (CX, CY)
        B = (CX + TILE_W//2, CY + TILE_H//2)
        C = (CX, CY + TILE_H)
        D = (CX - TILE_W//2, CY + TILE_H//2)

        top = [A, B, C, D]

        # ---- SIDE FACES (drop EXACTLY TILE_H) ----
        A2 = (A[0], A[1] + TILE_H)
        B2 = (B[0], B[1] + TILE_H)
        C2 = (C[0], C[1] + TILE_H)
        D2 = (D[0], D[1] + TILE_H)

        left  = [A, D, D2, A2]
        right = [B, B2, C2, C]

        # ---- DRAW ORDER ----
        pygame.draw.polygon(screen, GRASS_LEFT, left)
        pygame.draw.polygon(screen, GRASS_RIGHT, right)
        pygame.draw.polygon(screen, GRASS_TOP, top)

        # ---- OUTLINES ----
        pygame.draw.polygon(screen, OUTLINE, left, 1)
        pygame.draw.polygon(screen, OUTLINE, right, 1)
        pygame.draw.polygon(screen, OUTLINE, top, 1)

        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()
