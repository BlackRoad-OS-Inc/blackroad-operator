# BlackRoad OS - Renderer Layer

## Architecture

```
┌─────────────┐
│   Engine    │  State management, events, logic
│  (core)     │  blackroad-engine.py
└──────┬──────┘
       │ state (dict)
       ↓
┌─────────────┐
│  Renderer   │  Pure ANSI transformation
│  (view)     │  blackroad-renderer.py
└──────┬──────┘
       │ ANSI string
       ↓
┌─────────────┐
│  Terminal   │  Output to screen
│    (IO)     │  blackroad-terminal-os.py
└─────────────┘
```

## Separation of Concerns

### Engine (`blackroad-engine.py`)
- **Owns:** State, events, logic
- **Does:** Mutation, validation, business rules
- **Returns:** New state dict

### Renderer (`blackroad-renderer.py`)
- **Owns:** Layout math, ANSI codes, color system
- **Does:** Read-only transformation of state → text
- **Returns:** ANSI string ready for terminal

### Terminal UI (`blackroad-terminal-os.py`)
- **Owns:** Keyboard input, curses integration
- **Does:** Orchestrate engine + renderer, handle I/O
- **Returns:** Nothing (displays to screen)

## Color System (Semantic)

```python
ORANGE  (208)  → Actions, active mode, decisions
PINK    (205)  → Memory, state, persistence
PURPLE  (141)  → Logic, orchestration, agents
BLUE    (75)   → System, I/O, network
```

**Rules:**
- Color encodes meaning, not decoration
- No gradients
- No blinking
- Grayscale is default

## Layout Math

### Assumptions
- Minimum: 80×24
- Optimal: 120×40
- Adapts to terminal size

### Regions
```
┌────────────────────────────────────────┬─────────────┐
│ TOP BAR (1 line)                       │             │
├────────────────────────────────────────┤             │
│                                        │             │
│  MAIN PANEL                            │   RIGHT     │
│  (width - 31) × (height - 2)           │   PANEL     │
│                                        │   30 cols   │
│  - Shows log entries                   │             │
│  - Syntax highlighted                  │   - Agents  │
│  - Scrollable                          │   - Status  │
│                                        │   - Modes   │
│                                        │             │
├────────────────────────────────────────┴─────────────┤
│ BOTTOM BAR (1 line)                                  │
└──────────────────────────────────────────────────────┘
```

### Calculations
```python
top_bar_height = 1
bottom_bar_height = 1
right_panel_width = 30

content_height = height - 2
main_panel_width = width - 31  # -30 for panel, -1 for separator
```

## Render Function Signature

```python
def render(state: Dict, width: int, height: int) -> str:
    """
    Pure function: state → ANSI string
    
    NO mutation
    NO side effects
    NO I/O
    """
```

## Integration Example

```python
from blackroad_engine import create_initial_state, handle_key_press
from blackroad_renderer import render

# Initialize
state = create_initial_state()

# Main loop
while state["running"]:
    # Get input
    key = get_key()
    
    # Update state
    state = handle_key_press(state, key)
    
    # Render if dirty
    if state["dirty"]:
        output = render(state, width=120, height=40)
        print(output)
        state["dirty"] = False
```

## Extending the Renderer

### Add new panel
```python
def render_my_panel(state: Dict, layout: Layout) -> List[str]:
    """New panel renderer"""
    lines = []
    # Build lines
    return lines

# In render():
my_lines = render_my_panel(state, layout)
# Composite into screen
```

### Add syntax highlighting
```python
# In render_main_panel():
elif entry['level'] == 'error':
    line = ANSI.color_text(msg, ANSI.PINK)
```

### Add ANSI color
```python
class ANSI:
    RED = '\033[38;5;196m'  # Error messages
    GREEN = '\033[38;5;46m'  # Success messages
```

## Testing

```python
# Unit test example
from blackroad_renderer import render_to_lines

mock_state = {
    'mode': ...,
    'agents': ...,
    'log': ...,
}

lines = render_to_lines(mock_state, width=80, height=24)
assert len(lines) == 24
assert lines[0].startswith('BLACKROAD')
```

## Performance Notes

- Render is O(n) where n = visible log entries
- ANSI string building is fast (< 1ms typical)
- Main cost: terminal I/O, not rendering
- State is immutable (cheap to pass around)

## Files

- `blackroad-engine.py` — Core state engine (14KB)
- `blackroad-renderer.py` — ANSI view layer (14KB)
- `blackroad-terminal-os.py` — Terminal UI integration (15KB)

Total: ~43KB of pure Python, no dependencies except psutil
