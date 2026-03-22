# BlackRoad Terminal OS

## System Overview

BlackRoad OS is a terminal-native operating system with clean architectural separation:

1. **Boot Sequence** - Startup orchestration and splash screen
2. **Core Engine** - State model and live metrics
3. **Renderer** - Pure ANSI view layer
4. **Input Router** - Keyboard → events
5. **Command Executor** - Events → state mutations
6. **Persistence** - Save/load state with snapshots

## Quick Start

### Standard Boot (with splash)
```bash
python3 blackroad-os-boot-integrated.py
```

### Headless Mode (no splash)
```bash
python3 blackroad-os-boot-integrated.py --headless
```

See `BOOT_SEQUENCE_QUICKSTART.md` for more options.

---

## Architecture

### Layout Math
Assumes minimum 80×24 terminal, optimal 120×40+

```
┌─────────────────────────────────────────────────────────────────┬──────────────────────────┐
│ BLACKROAD OS              CHAT                        18:06:24   │ (TOP BAR: 1 line)        │
├─────────────────────────────────────────────────────────────────┼──────────────────────────┤
│                                                                  │ CHAT AGENTS              │
│  $ blackroad-os init                                             │                          │
│                                                                  │ lucidia                  │
│  [2026-02-11 18:06:24] System initialized                       │  ● ACTIVE · Memory sync  │
│  [2026-02-11 18:06:24] Memory system online                     │                          │
│  [2026-02-11 18:06:24] Agent mesh ready                         │ alice                    │
│  [2026-02-11 18:06:25] 7 agents active                          │  ○ IDLE · Standby        │
│                                                                  │                          │
│  SYSTEM STATUS:                                                  │ octavia                  │
│    CPU:     24%                                                  │  ● ACTIVE · Monitoring   │
│    Memory:  8.2 GB / 16 GB                                       │                          │
│    Disk:    420 GB / 1 TB                                        │ ─────────────────────    │
│    Network: ONLINE                                               │                          │
│                                                                  │  ▸ 1 chat                │
│  ACTIVE SERVICES:                                                │    2 github              │
│    - blackroad os-oracle: indexing 578 repositories                    │    3 projects            │
│    - deployment: monitoring 24 services                          │    4 sales               │
│    - security: scanning 0 alerts                                 │    5 web                 │
│                           │                          │    6 ops                 │
│  (MAIN PANEL)                                                    │    7 council             │
│  (Scrollable j/k)                                                │ (RIGHT PANEL: 30 cols)   │
│                                                                  │                          │
├─────────────────────────────────────────────────────────────────┴──────────────────────────┤
│ 1-7:tabs  j/k:scroll  /:cmd  q:quit          ■orange ■pink ■purple ■blue (BOTTOM: 1 line) │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Dimensions
- Top bar: 1 line (status, mode, timestamp)
- Main panel: `width - RIGHT_PANEL_WIDTH - 1` × `height - 2`
- Right panel: 30 columns × `height - 2`
- Bottom bar: 1 line (keybindings, palette)
- Vertical separator: 1 column

### Color Mapping (ANSI 256)

**Base grayscale:**
- Background: default (black)
- Panel background: color 235 (very dark gray)
- Panel text: color 250 (light gray)
- Muted text: color 240 (dark gray)

**Semantic accents:**
- Orange (208): commands, active selections, decisions
- Pink (205): memory state, storage operations
- Purple (141): logic, active agents, orchestration
- Blue (75): system messages, IO operations

### Extension Points

**Add new agent:**
```python
AGENTS.append({
    'name': 'new-agent',
    'status': 'ACTIVE',  # or 'IDLE'
    'task': 'Task description'
})
```

**Add new tab:**
```python
TABS.append('newtab')
# Access via number key (8, 9, 0, etc.)
```

**Modify panel widths:**
```python
RIGHT_PANEL_WIDTH = 40  # Increase right panel
# Main panel auto-adjusts
```

**Add syntax highlighting:**
```python
# In draw_main_panel():
elif line.startswith('ERROR'):
    self.stdscr.attron(curses.color_pair(COLOR_PAIRS['pink']))
    # ... draw line
```

**Hook command execution:**
```python
def execute_command(self, cmd):
    if cmd.startswith('deploy'):
        # Custom deployment logic
        pass
    elif cmd.startswith('search'):
        # Custom search logic
        pass
```

## Usage

```bash
python3 blackroad-terminal-os.py
```

**Controls:**
- `1-7`: Switch between tabs (chat/github/projects/sales/web/ops/council)
- `j/k`: Scroll main panel up/down
- `/`: Enter command mode
- `q`: Quit (from normal mode) or cancel (from command mode)
- `ESC`: Cancel command mode

**Command mode:**
- Press `/` to enter
- Type command and press `Enter`
- Press `ESC` or `q` to cancel

## Requirements

- Python 3.7+
- psutil (for live metrics)
- xterm-256color compatible terminal
- Works over SSH
- tmux-compatible

## Module Files

**Core System:**
- `blackroad-engine.py` - State model + live metrics
- `blackroad-renderer.py` - Pure ANSI view layer
- `blackroad-input-router.py` - Keyboard → events
- `blackroad-command-executor.py` - Events → state
- `blackroad-persistence.py` - Save/load with snapshots
- `blackroad-boot-sequence.py` - Startup orchestration

**Integration:**
- `blackroad-os-boot-integrated.py` - Full system with boot
- `blackroad-os-persistent.py` - System with persistence only
- `blackroad-os-complete.py` - Basic integration example
- `blackroad-terminal-os.py` - Original curses UI (legacy)

**Documentation:**
- `TERMINAL_OS_README.md` - This file
- `BOOT_SEQUENCE_ARCHITECTURE.md` - Boot system design
- `BOOT_SEQUENCE_QUICKSTART.md` - Boot quick reference
- `RENDERER_ARCHITECTURE.md` - View layer design
- `INPUT_ROUTER_ARCHITECTURE.md` - Input system design
- `COMMAND_EXECUTOR_ARCHITECTURE.md` - Logic layer design
- `PERSISTENCE_ARCHITECTURE.md` - State persistence design

## Terminal Compatibility

Tested on:
- macOS Terminal.app
- iTerm2
- Linux terminal emulators
- tmux sessions
- SSH connections

Minimum size: 80×24
Recommended: 120×40 or larger
