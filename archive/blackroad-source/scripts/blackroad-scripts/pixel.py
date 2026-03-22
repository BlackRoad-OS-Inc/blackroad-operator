import pygame, sys

pygame.init()
screen = pygame.display.set_mode((600, 400))
pygame.display.set_caption("One Pixel")

while True:
    for e in pygame.event.get():
        if e.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    screen.fill((20, 20, 20))

    # draw ONE pixel
    screen.set_at((300, 200), (0, 255, 0))

    pygame.display.flip()
