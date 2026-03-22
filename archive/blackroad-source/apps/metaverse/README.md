<div align="center">
<img src="https://images.blackroad.io/brand/br-square-192.png" alt="BlackRoad" width="80" />

# BlackRoad Metaverse

**The unified world. Office, city, space, battle, colony — all connected.**

Built from 858 parts extracted across 26 game engines.

[![BlackRoad OS](https://img.shields.io/badge/BlackRoad_OS-Pave_Tomorrow-FF2255?style=for-the-badge&labelColor=000000)](https://blackroad.io)
</div>

---

## Architecture

```
metaverse/
├── src/
│   ├── engine/          ← Core: game loop, renderer, pathfinding, FSM, colorizer
│   ├── world/           ← World gen: procgen, open world streaming, isometric
│   ├── agents/          ← AI: assistant, memory, skills framework
│   ├── ui/              ← Layouts, speech bubbles, editor
│   ├── assets/
│   │   ├── sprites/     ← 6 character sheets + 8 avatars
│   │   ├── tilesets/    ← 9 floors, wall autotile, furniture
│   │   ├── models/      ← 3D cars, buildings
│   │   └── audio/       ← Sound effects, music
│   └── games/
│       ├── office/      ← Pixel office simulation (Godot scripts)
│       ├── city/        ← 3D city builder (traffic, multiplayer, voxel, collab)
│       ├── space/       ← Space exploration (orbital mechanics)
│       ├── battle/      ← Turn-based RPG battles
│       ├── colony/      ← Colony builder (ECS, 65 Go modules)
│       └── quest/       ← Pokemon-style overworld RPG
```

## Parts Sources (26 engines)

| Engine | Source | What It Does |
|--------|--------|-------------|
| Game Loop | pixel-agents | requestAnimationFrame with delta time |
| Z-Sort Renderer | pixel-agents | Canvas 2D depth-sorted rendering |
| Character FSM | pixel-agents | Idle/walk/type/read state machine |
| BFS Pathfinding | pixel-agents | Grid-based BFS navigation |
| A* Pathfinding | pixel-office | A* with doors and chairs |
| HSL Colorizer | pixel-agents | Dual-mode sprite recoloring |
| Matrix Effect | pixel-agents | Digital rain spawn/despawn |
| Wall Autotile | pixel-agents | 16-bitmask auto-tiling |
| Traffic Sim | 3d.city | Car, Road, Lane, Intersection |
| Multiplayer | NotBlox | WebSocket + Three.js + Rapier |
| Open World | SanAndreasUnity | World streaming, vehicles, PedAI |
| ProcGen City | MapGenerator | Tensor field city generation |
| Space Engine | Cosmosium | Orbital mechanics, asteroids |
| Voxel Editor | WorldEdit | 57 editing commands |
| ECS | tiny-world | Entity-Component-System (Go) |
| Battle Engine | lfz-battle | Pokemon-style turn-based |
| RPG Overworld | pokevue | Tile-based exploration (Phaser) |
| Sims Engine | FreeSO | Isometric DGRP sprites, z-buffer |
| AI Assistant | openclaw | Personal AI, any platform |
| Agent Memory | hindsight | Memory that learns |
| Agent Context | OpenViking | Hierarchical context delivery |
| Agent Skills | skills | Agentic capabilities framework |
| AI Sandbox | OpenSandbox | Docker/K8s sandbox for AI apps |
| 1-bit LLMs | BitNet | 1-bit inference framework |
| Claude Agent | learn-claude-code | Nano Claude-like agent |
| AI Coworker | rowboat | AI with memory |

## Design System

```css
--gradient: linear-gradient(90deg, #FF6B2B, #FF2255, #CC00AA, #8844FF, #4488FF, #00D4FF);
--bg: #000;
--card: #0a0a0a;
--border: #1a1a1a;
--text: #f5f5f5;
```

Fonts: Space Grotesk + JetBrains Mono

## Live

- [games.blackroad.io](https://games.blackroad.io) — Game portal
- [office.blackroad.io](https://office.blackroad.io) — Pixel office
- [world.blackroad.io](https://world.blackroad.io) — Minnesota map
- [prism.blackroad.io](https://prism.blackroad.io) — Operations console

---

*Copyright (c) 2024-2026 BlackRoad OS, Inc. All rights reserved.*
