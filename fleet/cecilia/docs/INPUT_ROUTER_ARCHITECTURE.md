# BlackRoad OS - Input Router Architecture

## Layer Separation

```
┌─────────────────┐
│  Keyboard       │  Raw keystrokes
│  (Hardware)     │
└────────┬────────┘
         │ char
         ↓
┌─────────────────┐
│  Input Router   │  Keystrokes → Events
│  (This Layer)   │  blackroad-input-router.py
└────────┬────────┘
         │ Event
         ↓
┌─────────────────┐
│  Engine         │  Events → State
│  (Core Logic)   │  blackroad-engine.py
└────────┬────────┘
         │ State
         ↓
┌─────────────────┐
│  Renderer       │  State → ANSI
│  (View)         │  blackroad-renderer.py
└────────┬────────┘
         │ ANSI string
         ↓
┌─────────────────┐
│  Terminal       │  Display
│  (Output)       │
└─────────────────┘
```

## Responsibilities

### Input Router (This Module)
**ONLY does:**
- Read keystrokes
- Map to events
- Parse commands
- Return structured data

**NEVER does:**
- Mutate state
- Render output
- Execute commands
- Call business logic

### Event Types

```python
KEY_PRESS       # Raw character input
MODE_SWITCH     # Tab switching (1-7)
INPUT_SUBMIT    # Command/text submitted
SCROLL          # Navigation (j/k)
QUIT            # Exit requested
CLEAR           # Clear buffer (ESC)
COMMAND_MODE    # Enter command mode (/)
```

## Key Bindings

```
Global:
  q         → QUIT
  ESC       → CLEAR buffer
  ENTER     → INPUT_SUBMIT
  BACKSPACE → delete char

Mode switching:
  1 → chat
  2 → github
  3 → projects
  4 → sales
  5 → web
  6 → ops
  7 → council

Navigation:
  j → scroll down
  k → scroll up

Command:
  / → enter command mode
```

## Command Format

```
/command [arg1] [arg2] ...

Examples:
  /help
  /mode ops
  /agent lucidia
  /clear
```

### Available Commands

```python
/help          # Show help
/agents        # List agents
/mode <name>   # Switch mode
/clear         # Clear log
/agent <name>  # Show agent
/quit          # Exit
/status        # System status
```

## Event Structure

```python
Event {
    type: EventType
    payload: {
        # Type-specific data
    }
}

# Examples:
Event(MODE_SWITCH, {'mode': 'chat'})
Event(KEY_PRESS, {'char': 'a'})
Event(INPUT_SUBMIT, {})
Event(SCROLL, {'direction': 'down'})
```

## Integration Pattern

```python
from blackroad_input_router import create_input_router, poll_input
from blackroad_engine import create_initial_state, handle_event
from blackroad_renderer import render

# Setup
router = create_input_router()
state = create_initial_state()

# Main loop
while state['running']:
    # Poll input (non-blocking)
    event = poll_input(router)
    
    if event:
        # Engine handles event
        state = handle_event(state, event)
    
    # Render if changed
    if state['dirty']:
        output = render(state, width, height)
        print(output)
        state['dirty'] = False

# Cleanup
router.cleanup()
```

## Non-Blocking I/O

Input router uses non-blocking mode:
- Returns `None` if no input
- Returns `Event` if input received
- Never blocks main loop
- Allows rendering during idle

## Terminal Mode

Router sets terminal to raw mode:
- Character-by-character input
- No buffering
- No echo
- Restores on cleanup

## Error Handling

```python
# Unknown key → KEY_PRESS event with code
Event(KEY_PRESS, {'char': '?', 'code': 254})

# Invalid command → Still emits INPUT_SUBMIT
# Engine/command handler decides what to do

# No crashes on unexpected input
```

## Testing

### Unit Test
```python
from blackroad_input_router import parse_command

cmd = parse_command("/mode ops")
assert cmd.name == "mode"
assert cmd.args == ["ops"]
```

### Integration Test
```python
router = create_input_router()

# Simulate key press
# (Would need mock stdin)

router.cleanup()
```

## Extension Points

### Add New Keybinding
```python
KEY_BINDINGS['g'] = ('go_to_top', {})
```

### Add New Command
```python
AVAILABLE_COMMANDS['deploy'] = {
    'description': 'Deploy service',
    'args': ['service_name'],
}
```

### Add New Event Type
```python
class EventType(Enum):
    # ... existing
    DEPLOY = "deploy"
```

## Performance

- Keystroke → Event: < 0.1ms
- Command parsing: < 0.5ms
- Non-blocking: No CPU spin
- Memory: ~1KB per event

## Files

- `blackroad-input-router.py` (12KB) — Input layer
- `blackroad-engine.py` (14KB) — Core state
- `blackroad-renderer.py` (14KB) — View layer

Total: ~40KB pure Python, zero dependencies (except termios/tty)

## Usage

```bash
# Test standalone
python3 blackroad-input-router.py

# Press keys, see events
# Ctrl+C to exit
```

## Architecture Benefits

✅ **Clear separation**: Input → Engine → Renderer  
✅ **Testable**: Each layer independent  
✅ **Inspectable**: Events are pure data  
✅ **Deterministic**: Same input = same event  
✅ **Extensible**: Add keys/commands without touching engine
