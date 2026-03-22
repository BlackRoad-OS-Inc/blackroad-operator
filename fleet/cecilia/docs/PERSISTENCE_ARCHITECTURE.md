# BlackRoad OS - Persistence Layer Architecture

## Overview

Persistence layer saves and loads system state between runs.

**Design principles:**
- Boring and trustworthy
- Human-readable JSON
- Atomic writes (no corruption)
- Version stamping
- Graceful degradation

## File Structure

```
~/.blackroad-os/
├── state.json           # Current state
├── state.bak.json       # Previous backup
└── snapshots/
    ├── state_20260211_182640.json
    ├── state_20260211_182641_manual.json
    └── ...
```

## What Gets Persisted

```python
{
  "version": 1,
  "saved_at": "2026-02-11T18:26:40.123456",
  "mode": "chat",
  "cursor": {
    "scroll_offset": 5
  },
  "agents": {
    "lucidia": {
      "status": "active",
      "task": "Memory sync",
      "color": "purple"
    },
    ...
  },
  "log": [
    {
      "time": "2026-02-11T18:26:40.123456",
      "level": "system",
      "msg": "System initialized"
    },
    ...
  ],
  "input_buffer": "",
  "command_mode": false,
  "metrics": { ... }
}
```

## What Doesn't Persist

**Runtime-only data:**
- `dirty` flag
- `running` flag
- `frame_count`
- `start_time`
- Live timestamps (reset on load)

## API

### Save State

```python
from blackroad_persistence import save_state

success = save_state(state)
# Returns: True if successful, False otherwise
```

**Atomic write strategy:**
1. Serialize state to JSON
2. Write to `state.tmp`
3. Copy `state.json` → `state.bak.json`
4. Rename `state.tmp` → `state.json`

**Never corrupts existing state.**

### Load State

```python
from blackroad_persistence import load_state

state = load_state()
# Returns: state dict if found, None if not
```

**Fallback strategy:**
1. Try `state.json`
2. Try `state.bak.json` (if primary corrupted)
3. Return `None` (use engine defaults)

### Create Snapshot

```python
from blackroad_persistence import snapshot_state

filename = snapshot_state(state, label="before_upgrade")
# Returns: "state_20260211_182640_before_upgrade.json"
```

**Snapshots are append-only** — never overwrite.

### List Snapshots

```python
from blackroad_persistence import list_snapshots

snapshots = list_snapshots()
# Returns: [{filename, path, size, modified}, ...]
```

### Load Snapshot

```python
from blackroad_persistence import load_snapshot

state = load_snapshot("state_20260211_182640.json")
# Returns: state dict if valid, None otherwise
```

## Integration

### Startup

```python
from blackroad_persistence import load_state
from blackroad_engine import create_initial_state

# Try to load saved state
state = load_state()

if state:
    print("Restored previous session")
else:
    print("Starting fresh session")
    state = create_initial_state()
```

### Shutdown

```python
from blackroad_persistence import save_state

# On clean exit
if save_state(state):
    print("State saved")
else:
    print("Error saving state")
```

### Commands

Add to `blackroad-command-executor.py`:

```python
elif cmd_name == 'save':
    from blackroad_persistence import save_state
    if save_state(state):
        state = append_log(state, 'system', 'State saved')
    else:
        state = append_log(state, 'system', 'Error saving state')

elif cmd_name == 'load':
    from blackroad_persistence import load_state
    loaded = load_state()
    if loaded:
        state.update(loaded)
        state = append_log(state, 'system', 'State loaded')
    else:
        state = append_log(state, 'system', 'No saved state found')

elif cmd_name == 'snapshot':
    from blackroad_persistence import snapshot_state
    label = args[0] if args else ""
    filename = snapshot_state(state, label)
    if filename:
        state = append_log(state, 'system', f'Snapshot: {filename}')
    else:
        state = append_log(state, 'system', 'Error creating snapshot')

elif cmd_name == 'history':
    from blackroad_persistence import list_snapshots
    snapshots = list_snapshots()
    state = append_log(state, 'system', f'Snapshots: {len(snapshots)}')
    for snap in snapshots[:5]:  # Show 5 most recent
        state = append_log(state, 'system', f"  {snap['filename']}")
```

## Error Handling

### Missing File
```python
state = load_state()
if state is None:
    # Fall back to defaults
    state = create_initial_state()
```

### Corrupted File
- Tries backup automatically
- Logs error
- Returns None (graceful degradation)

### Version Mismatch
- Rejects incompatible versions
- Logs warning
- Returns None

### Partial Write
- Atomic rename prevents corruption
- Original file untouched until new file complete

## Versioning

```python
STATE_VERSION = 1
```

**On save:** Stamp with current version  
**On load:** Reject if version > STATE_VERSION

**When to increment:**
- Schema changes (add/remove keys)
- Data type changes
- Breaking format changes

## Maintenance

### Cleanup Old Snapshots

```python
from blackroad_persistence import cleanup_old_snapshots

# Keep only 10 most recent
cleanup_old_snapshots(keep_count=10)
```

Call periodically or via command:
```
/cleanup snapshots
```

### Persistence Status

```python
from blackroad_persistence import get_persistence_status

status = get_persistence_status()
# Returns:
{
  'dir': '/Users/user/.blackroad-os',
  'state_exists': True,
  'backup_exists': True,
  'snapshot_count': 15,
  'state_size': 12345,
  'state_modified': '2026-02-11T18:26:40'
}
```

## Testing

### Save/Load Cycle

```python
# Save
original_state = {...}
save_state(original_state)

# Load
loaded_state = load_state()

# Verify
assert loaded_state['mode'] == original_state['mode']
assert len(loaded_state['agents']) == len(original_state['agents'])
```

### Corruption Recovery

```python
# Corrupt primary file
with open(STATE_FILE, 'w') as f:
    f.write("invalid json{{{")

# Load should fall back to backup
state = load_state()
assert state is not None  # Loaded from backup
```

## File Example

**state.json:**
```json
{
  "command_mode": false,
  "cursor": {
    "scroll_offset": 0
  },
  "input_buffer": "",
  "log": [
    {
      "level": "system",
      "msg": "System initialized",
      "time": "2026-02-11T18:26:40.123456"
    }
  ],
  "metrics": {
    "cpu_percent": 24.5,
    "memory_percent": 51.2
  },
  "mode": "chat",
  "saved_at": "2026-02-11T18:26:40.456789",
  "version": 1
}
```

Human-readable, inspectable, diffable.

## Performance

- Save: ~5-10ms typical
- Load: ~5-10ms typical
- Snapshot: ~5-10ms typical
- File size: ~10-100KB typical

## Extension Points

### Add New Persistent Key

```python
# In serialize_state():
persist_keys.append('new_key')
```

### Custom Serialization

```python
# In serialize_value():
elif isinstance(value, CustomType):
    return custom_serialize(value)
```

### Migrate Old Versions

```python
# In deserialize_state():
if version == 0:
    # Migrate v0 → v1
    data = migrate_v0_to_v1(data)
```

## Benefits

✅ **Continuity** — State persists between runs  
✅ **Debuggable** — JSON is human-readable  
✅ **Safe** — Atomic writes prevent corruption  
✅ **Versioned** — Incompatible formats rejected  
✅ **Traceable** — Snapshots create audit trail  
✅ **Boring** — No clever tricks, just works

## Complete System

**All layers now exist:**

1. ✅ State model (engine)
2. ✅ View layer (renderer)
3. ✅ Input layer (router)
4. ✅ Logic layer (executor)
5. ✅ Persistence layer (save/load)

**BlackRoad OS is now a real persistent system.**
