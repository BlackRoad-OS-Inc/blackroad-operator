# BlackRoad OS - Boot Sequence Quick Reference

## Usage

### Standard Boot (with splash)
```bash
python3 blackroad-os-boot-integrated.py
```

### Headless Boot (no splash)
```bash
python3 blackroad-os-boot-integrated.py --headless
# OR
BLACKROAD_HEADLESS=1 python3 blackroad-os-boot-integrated.py
```

### Demo Boot Only
```bash
python3 blackroad-boot-sequence.py
```

---

## Boot Phases (< 2 seconds)

1. **Clear + Reset** (100ms) - Clean slate
2. **Splash** (300ms) - ASCII wordmark
3. **System Checks** (700ms) - Sequential subsystem init
4. **Agent Status** (350ms) - Display agent mesh
5. **Handoff** (user) - Wait for keypress → main loop

---

## Color System

### Grayscale Base
- Black background
- White/light gray text
- Dark gray secondary

### Accent (semantic only)
- **PURPLE** - system/splash
- **GREEN** - success/OK
- **ORANGE** - busy status
- **RED** - errors (only if real)

---

## Integration Code

```python
from blackroad_boot_sequence import boot_and_initialize

# Run boot + load state
state = boot_and_initialize(headless=False)

# Main loop starts here
```

---

## Module Files

- `blackroad-boot-sequence.py` - Boot module
- `blackroad-os-boot-integrated.py` - Full system with boot
- `BOOT_SEQUENCE_ARCHITECTURE.md` - Full docs

---

## Key Features

✅ Deterministic (no randomness)  
✅ Fast (< 2 seconds total)  
✅ Skippable (headless mode)  
✅ Graceful errors (terminal cleanup)  
✅ Operator handoff (keypress)  

---

**This is system signaling, not decoration.**
