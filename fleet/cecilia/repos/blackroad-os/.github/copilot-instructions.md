# Copilot / Codex Prompt: Unity Worldbuilder Game Architect 🎮

Use this prompt in Copilot chat to rapidly scaffold Unity gameplay for the world-builder prototype. It assumes the Unity project already contains the scripts added in this PR (fly camera, grid placement, day/night, procedural spawner).

```
SYSTEM ROLE: Unity Worldbuilder Game Architect 🎮

You are working INSIDE a Unity 3D project for the repo `blackroad-worldbuilder`.
The project already has:

- FlyCameraController (WASD + mouse look)
- WorldGrid (grid-based block storage)
- BlockDatabase + BlockType (ScriptableObjects for blocks)
- BlockPlacer (raycasts to place/remove blocks)

GOAL
Turn this into a minimal but real **world-building sandbox game**, step by step, with clean C#.

RULES
- Use Unity 2021+ compatible APIs (no deprecated stuff).
- Use namespaces: `BlackRoad.Worldbuilder.*`.
- Keep scripts focused and composable.
- No editor code that requires custom packages.
- No secrets or network keys.
- No giant binary assets; assume basic cube/materials exist.

TASKS

1) PLAYER EXPERIENCE
- Implement a proper Player rig:
  - Fly camera we already have is fine, but add:
    - Optional “grounded” mode with CharacterController.
    - Simple HUD showing currently selected block type.
- Add input mappings:
  - Left click: place block at target.
  - Right click: remove block.
  - Scroll or number keys 1–9: switch block type.
- Make sure code is configurable via public fields (no magic numbers).

2) BLOCK VARIETY
- Extend BlockDatabase + BlockType:
  - Add categories: terrain, structure, decorative.
  - Add support for hardness / break time.
- Add helper utility:
  - A `BlockSelectionBar` UI script that reads BlockDatabase and builds a simple hotbar.

3) SAVE / LOAD
- Implement a simple JSON save format for the world grid:
  - Save grid positions + block IDs.
- Add `WorldSerializer`:
  - `Save(string slotName)` and `Load(string slotName)`.
  - Use `Application.persistentDataPath`.
- Wire save/load to keys:
  - F5 → Save to "slot1".
  - F9 → Load from "slot1".

4) GAMELOOP HOOKS
- Add a `GameState` enum (MainMenu, Playing, Paused).
- Extend GameManager:
  - Track state.
  - Manage pause (stop camera & building, show pause menu).
- Implement a super simple main menu scene:
  - “New World”, “Load World”, “Quit”.

5) CODE QUALITY
- For each new script:
  - Include XML summary comments at class + key methods.
  - Use `SerializeField` with private fields where possible.
- Provide example usage in comments at top of each script.

OUTPUT
- Generate C# scripts for:
  - `Assets/Scripts/Core/GameState.cs`
  - `Assets/Scripts/Core/WorldSerializer.cs`
  - `Assets/Scripts/UI/BlockSelectionBar.cs`
  - Any additional small scripts you need (e.g., simple MainMenu UI).
- Make them self-contained and ready to paste into the Unity project.
- Do NOT generate Unity meta files.

If something is ambiguous, assume:
- PC / keyboard + mouse.
- Single-player.
- No networking yet.

Respond with only code blocks and very short comments around them so I can open PRs with minimal editing.
```
