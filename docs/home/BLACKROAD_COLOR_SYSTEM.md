# BlackRoad OS - Canonical Color System

**Infrastructure Identity**

This is the single source of truth for all BlackRoad colors across:
- Terminal UI
- Web applications
- Documentation
- ASCII art
- Brand materials

## Official Palette (xterm-256)

```
ORANGE  = 208  →  #ff8700
AMBER   = 202  →  #ff5f00
PINK    = 198  →  #ff0087
MAGENTA = 163  →  #d700af
BLUE    = 33   →  #0087ff
WHITE   = 255  →  #eeeeee
BLACK   = 0    →  #000000
```

## Gradient Flow

```
ORANGE → AMBER → PINK → MAGENTA → BLUE → WHITE
```

This creates the signature BlackRoad gradient.

## Python Usage

```python
from blackroad_colors import br_text, br_status, br_header, br_block

# Colored text
print(br_text("BlackRoad OS", "ORANGE", bold=True))

# Status indicators
print(br_status("System", "ONLINE", "success"))
print(br_status("Network", "DEGRADED", "warning"))
print(br_status("Database", "ERROR", "error"))

# Headers
print(br_header("DEPLOYMENT STATUS", "Live production metrics"))

# Color blocks
print(br_block("BLUE", width=20))
```

## Bash Usage

```bash
source blackroad_colors.sh

# Colored text
br_text "BlackRoad OS" "ORANGE" bold

# Status indicators
br_status "System" "ONLINE" "success"
br_status "Network" "DEGRADED" "warning"

# Headers
br_header "DEPLOYMENT STATUS" "Live production metrics"

# Separators
br_separator 60 "ORANGE"
```

## CSS Variables

```css
:root {
    /* BlackRoad Canonical Colors */
    --br-orange: #ff8700;
    --br-amber: #ff5f00;
    --br-pink: #ff0087;
    --br-magenta: #d700af;
    --br-blue: #0087ff;
    --br-white: #eeeeee;
    --br-black: #000000;
    
    /* Gradient */
    --br-gradient: linear-gradient(
        90deg,
        var(--br-orange),
        var(--br-amber),
        var(--br-pink),
        var(--br-magenta),
        var(--br-blue)
    );
}
```

## Status Colors

```
SUCCESS = BLUE     (✔)
WARNING = AMBER    (▲)
ERROR   = PINK     (✖)
INFO    = WHITE    (●)
```

## Claude Code Prompt Template

When requesting terminal UI code from Claude, use this **exact** prompt:

```
Use the BlackRoad terminal color system ONLY.

Palette (xterm-256):
- ORANGE = 208
- AMBER = 202
- PINK = 198
- MAGENTA = 163
- BLUE = 33
- WHITE = 255
- BLACK = 0

Rules:
- Use ANSI escape codes (\033[38;5;<n>m)
- No RGB or hex
- Reset with \033[0m
- Bold only when explicitly stated
- Background blocks allowed
- SSH and tmux safe output
- Do NOT introduce new colors

Generate Python code that renders UI elements using this palette.
```

## tmux Theme

```tmux
# BlackRoad tmux theme
# Add to ~/.tmux.conf

# Status bar colors
set -g status-style "bg=colour0,fg=colour208"

# Window status
setw -g window-status-style "fg=colour163"
setw -g window-status-current-style "fg=colour33,bold"

# Pane borders
set -g pane-border-style "fg=colour198"
set -g pane-active-border-style "fg=colour208,bold"

# Message text
set -g message-style "bg=colour0,fg=colour208,bold"

# Clock
setw -g clock-mode-colour colour33
```

## Key Principles

1. **No RGB Drift**: Always use xterm-256 codes
2. **SSH-Safe**: Works over any terminal connection
3. **tmux-Safe**: Renders correctly in multiplexers
4. **No Dependencies**: Pure ANSI escape codes
5. **Consistent**: Same colors everywhere

## Files

- `blackroad_colors.py` - Python implementation
- `blackroad_colors.sh` - Bash implementation
- `BLACKROAD_COLOR_SYSTEM.md` - This documentation

## Examples

### Terminal Banner

```bash
br_banner
br_header "BLACKROAD OS" "operator-controlled • local-first • sovereign"
```

### Status Dashboard

```python
print(br_header("SYSTEM STATUS"))
print(br_status("API", "ONLINE", "success"))
print(br_status("Database", "Connected", "success"))
print(br_status("Cache", "75% full", "warning"))
print(br_status("Worker 3", "FAILED", "error"))
```

### Progress Indicator

```python
for i in range(100):
    color = "ORANGE" if i < 33 else "AMBER" if i < 66 else "BLUE"
    print(br_text("█", color), end="")
print()
```

## Why This Matters

This is **infrastructure identity**, not styling.

Every terminal, dashboard, log, and UI element speaks the same visual language.

**No guessing. No drift. No dependencies.**

---

**BlackRoad OS** • Operator-Controlled • Local-First • Sovereign
