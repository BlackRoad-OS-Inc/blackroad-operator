# BlackRoad Parts Library

Extracted components from 15+ gaming forks. Mix and match to build original games.

## Sprites (18 files)
- `char_0-5.png` — 6 character spritesheets (16x32 frames, 3 rows: down/up/right, 7 cols: idle/walk1-4/type/sit)
- `avatar_0-7.webp` — 8 avatar sheets (48x64 frames, 8 directions, walk/sit/type/dance/alert)
- `idle/walk/run/jump.png` — animation sheets from opencode

## Tilesets (80 files)
- `floors/floor_0-8.png` — 9 grayscale floor patterns (16x16, colorizable via HSL)
- `walls/wall_0.png` — 16-direction autotile wall (64x128, 4x4 grid of 16x32)
- `furniture/` — 25 categories (DESK, PC, CHAIR, SOFA, BOOKSHELF, PLANT, WHITEBOARD, etc.)
- `tileset_office.png` — comprehensive office tileset (461KB)
- `office.png` / `office_floor.png` — full office background layers
- `office_bg_32.webp` / `office_fg_32.webp` — bg/fg layers with collision maps

## Engines (11 files)
- `pathfinding-bfs.ts` — BFS grid pathfinding
- `pathfinding-astar.js` — A* with door handling
- `character-fsm.ts` — Character state machine (idle/walk/type/read + wander AI)
- `game-loop.ts` — requestAnimationFrame loop with delta time
- `renderer-zsort.ts` — Canvas 2D z-sorted rendering
- `matrix-effect.ts` — Matrix-style digital rain spawn/despawn
- `colorize.ts` — Dual-mode HSL colorization (Colorize + Adjust)
- `office-state.ts` — Complete game state management
- `furniture-catalog.ts` — Dynamic catalog with rotation/state groups
- `layout-serializer.ts` — Save/load office layouts (JSON)
- `wall-autotile.ts` — 16-bitmask wall auto-tiling

## Mechanics (5 files)
- `procedural-characters.ts` — Generate characters from hex color data (no PNGs needed)
- `editor-actions.ts` — Paint/place/remove/move/rotate with undo/redo
- `editor-state.ts` — Full editor state machine (50-level undo)
- `isometric-helpers.js` — 2D↔isometric coordinate conversion
- `speech-bubbles.js` — Speech bubble rendering system

## Shaders (1 file)
- `water-shader.ts` — WebGL fragment shader with wave animation, ripples, foam

## UI (4 files)
- `default-office-layout.json` — 21x22 office with 36 furniture items
- `bubble-permission.json` / `bubble-waiting.json` — Sprite data for speech bubbles
- `FSPixelSansUnicode-Regular.ttf` — Pixel art font

## Maps (1 file)
- `collision-office.js` — 20x25 collision grid (0=floor, 1=wall, 2=door, 3=chair)

## Source Repos
| Part | Source | License |
|------|--------|---------|
| Character sprites | pixel-agents (pablodelucca) | MIT |
| Avatar sheets | pixel-agent-desk (mgpixelart) | MIT + Custom Art |
| Office tileset | squad-pod/Donarg | Paid ($2 itch.io) |
| Furniture | pixel-agents (pablodelucca) | MIT |
| Water shader | isometric-nyc (cannoneyed) | MIT |
| Engines/mechanics | pixel-agents | MIT |
| Procedural chars | squad-pod | MIT |

---

*BlackRoad Parts Library — extracted for BlackRoad Games at games.blackroad.io*
