#!/usr/bin/env python3
"""
BlackRoad OS - Persistence Layer (State Save / Load)

Pure persistence. Saves and loads state to disk.
NO business logic. NO rendering. NO input.

This layer must be boring and trustworthy.
"""

import json
import os
import shutil
from datetime import datetime
from typing import Dict, Any, Optional, List
from pathlib import Path

# ================================
# CONFIGURATION
# ================================

# Persistence directory
PERSISTENCE_DIR = Path.home() / ".blackroad-os"
STATE_FILE = PERSISTENCE_DIR / "state.json"
BACKUP_FILE = PERSISTENCE_DIR / "state.bak.json"
SNAPSHOTS_DIR = PERSISTENCE_DIR / "snapshots"

# State version (increment when format changes)
STATE_VERSION = 1

# ================================
# INITIALIZATION
# ================================

def ensure_persistence_dirs():
    """
    Create persistence directories if they don't exist
    
    Called on module import or first use
    Safe to call multiple times
    """
    PERSISTENCE_DIR.mkdir(parents=True, exist_ok=True)
    SNAPSHOTS_DIR.mkdir(parents=True, exist_ok=True)

# ================================
# SERIALIZATION
# ================================

def serialize_state(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert runtime state to serializable dict
    
    Handles:
    - Enum objects → strings
    - datetime objects → ISO strings
    - Filters out render-only data
    
    This is where we decide what persists
    """
    serializable = {}
    
    # Version stamp
    serializable['version'] = STATE_VERSION
    serializable['saved_at'] = datetime.now().isoformat()
    
    # Core state to persist
    persist_keys = [
        'mode',
        'agents',
        'log',
        'input_buffer',
        'command_mode',
        'metrics',
    ]
    
    for key in persist_keys:
        if key in state:
            value = state[key]
            serializable[key] = serialize_value(value)
    
    # Cursor position (separate handling)
    if 'cursor' in state:
        serializable['cursor'] = {
            'scroll_offset': state['cursor'].get('scroll_offset', 0),
        }
    
    return serializable

def serialize_value(value: Any) -> Any:
    """
    Recursively serialize a value
    
    Handles nested structures with special types
    """
    if value is None:
        return None
    
    # Enum → string
    elif hasattr(value, 'value'):
        return value.value
    
    # datetime → ISO string
    elif isinstance(value, datetime):
        return value.isoformat()
    
    # Dict → recurse
    elif isinstance(value, dict):
        return {k: serialize_value(v) for k, v in value.items()}
    
    # List → recurse
    elif isinstance(value, list):
        return [serialize_value(item) for item in value]
    
    # Primitive types
    elif isinstance(value, (str, int, float, bool)):
        return value
    
    # Unknown type → string representation
    else:
        return str(value)

# ================================
# DESERIALIZATION
# ================================

def deserialize_state(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert serialized dict back to runtime state
    
    Handles:
    - String enums → keep as strings (engine will handle)
    - ISO strings → datetime objects
    - Missing keys → defaults
    """
    state = {}
    
    # Check version compatibility
    version = data.get('version', 0)
    if version > STATE_VERSION:
        raise ValueError(f"State version {version} is newer than supported {STATE_VERSION}")
    
    # Restore core state
    state['mode'] = data.get('mode', 'chat')
    state['input_buffer'] = data.get('input_buffer', '')
    state['command_mode'] = data.get('command_mode', False)
    
    # Restore cursor
    cursor_data = data.get('cursor', {})
    state['cursor'] = {
        'scroll_offset': cursor_data.get('scroll_offset', 0),
        'panel': 'main',
        'position': 0,
    }
    
    # Restore agents
    state['agents'] = deserialize_agents(data.get('agents', {}))
    
    # Restore log
    state['log'] = deserialize_log(data.get('log', []))
    
    # Restore metrics (optional)
    state['metrics'] = data.get('metrics', {})
    
    # Runtime-only keys
    state['dirty'] = True
    state['running'] = True
    state['frame_count'] = 0
    state['start_time'] = datetime.now().timestamp()
    
    return state

def deserialize_agents(agents_data: Dict) -> Dict:
    """
    Restore agent state
    
    Converts serialized strings back to proper status values
    """
    import time
    
    agents = {}
    for name, data in agents_data.items():
        agents[name] = {
            'status': data.get('status', 'idle'),  # Keep as string
            'task': data.get('task', 'Idle'),
            'color': data.get('color', 'white'),
            'last_active': time.time(),  # Reset to now
        }
    return agents

def deserialize_log(log_data: List) -> List:
    """
    Restore log entries
    
    Converts ISO strings back to datetime objects
    """
    log = []
    for entry in log_data:
        log_entry = {
            'level': entry.get('level', 'system'),
            'msg': entry.get('msg', ''),
        }
        
        # Parse datetime
        time_str = entry.get('time')
        if time_str:
            try:
                log_entry['time'] = datetime.fromisoformat(time_str)
            except:
                log_entry['time'] = datetime.now()
        else:
            log_entry['time'] = datetime.now()
        
        log.append(log_entry)
    
    return log

# ================================
# SAVE STATE
# ================================

def save_state(state: Dict[str, Any]) -> bool:
    """
    Save state to disk (atomic write)
    
    Strategy:
    1. Write to temp file
    2. Backup existing state
    3. Rename temp to state.json
    
    This prevents corruption if interrupted
    
    Returns:
        True if successful, False otherwise
    """
    ensure_persistence_dirs()
    
    try:
        # Serialize state
        serializable = serialize_state(state)
        
        # Write to temp file first
        temp_file = STATE_FILE.with_suffix('.tmp')
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(serializable, f, indent=2, sort_keys=True)
        
        # Backup existing state if it exists
        if STATE_FILE.exists():
            shutil.copy2(STATE_FILE, BACKUP_FILE)
        
        # Atomic rename
        temp_file.replace(STATE_FILE)
        
        return True
    
    except Exception as e:
        print(f"Error saving state: {e}")
        return False

# ================================
# LOAD STATE
# ================================

def load_state() -> Optional[Dict[str, Any]]:
    """
    Load state from disk
    
    Fallback strategy:
    1. Try state.json
    2. Try state.bak.json
    3. Return None (use defaults)
    
    Returns:
        State dict if successful, None if no valid state found
    """
    ensure_persistence_dirs()
    
    # Try primary state file
    if STATE_FILE.exists():
        state = _load_state_file(STATE_FILE)
        if state:
            return state
    
    # Try backup
    if BACKUP_FILE.exists():
        print("Primary state corrupted, loading backup...")
        state = _load_state_file(BACKUP_FILE)
        if state:
            return state
    
    # No valid state found
    return None

def _load_state_file(filepath: Path) -> Optional[Dict[str, Any]]:
    """
    Load and deserialize a single state file
    
    Returns None if file is corrupted or incompatible
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Deserialize
        state = deserialize_state(data)
        return state
    
    except json.JSONDecodeError as e:
        print(f"Error parsing {filepath}: {e}")
        return None
    
    except ValueError as e:
        print(f"Error loading {filepath}: {e}")
        return None
    
    except Exception as e:
        print(f"Unexpected error loading {filepath}: {e}")
        return None

# ================================
# SNAPSHOTS
# ================================

def snapshot_state(state: Dict[str, Any], label: str = "") -> Optional[str]:
    """
    Create timestamped snapshot
    
    Snapshots are append-only, never overwrite
    Useful for debugging and history
    
    Args:
        state: Current state
        label: Optional label for snapshot
    
    Returns:
        Filename if successful, None otherwise
    """
    ensure_persistence_dirs()
    
    try:
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        if label:
            filename = f"state_{timestamp}_{label}.json"
        else:
            filename = f"state_{timestamp}.json"
        
        filepath = SNAPSHOTS_DIR / filename
        
        # Serialize state
        serializable = serialize_state(state)
        
        # Write snapshot
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(serializable, f, indent=2, sort_keys=True)
        
        return filename
    
    except Exception as e:
        print(f"Error creating snapshot: {e}")
        return None

def list_snapshots() -> List[Dict[str, Any]]:
    """
    List all available snapshots
    
    Returns list of dicts with:
    - filename
    - timestamp
    - size
    """
    ensure_persistence_dirs()
    
    snapshots = []
    
    try:
        for filepath in SNAPSHOTS_DIR.glob("state_*.json"):
            stat = filepath.stat()
            snapshots.append({
                'filename': filepath.name,
                'path': str(filepath),
                'size': stat.st_size,
                'modified': datetime.fromtimestamp(stat.st_mtime),
            })
        
        # Sort by modification time (newest first)
        snapshots.sort(key=lambda x: x['modified'], reverse=True)
    
    except Exception as e:
        print(f"Error listing snapshots: {e}")
    
    return snapshots

def load_snapshot(filename: str) -> Optional[Dict[str, Any]]:
    """
    Load a specific snapshot by filename
    
    Returns state dict if successful, None otherwise
    """
    filepath = SNAPSHOTS_DIR / filename
    
    if not filepath.exists():
        print(f"Snapshot not found: {filename}")
        return None
    
    return _load_state_file(filepath)

# ================================
# INTEGRATION HELPERS
# ================================

def get_persistence_status() -> Dict[str, Any]:
    """
    Get status of persistence system
    
    Useful for /status command
    """
    ensure_persistence_dirs()
    
    status = {
        'dir': str(PERSISTENCE_DIR),
        'state_exists': STATE_FILE.exists(),
        'backup_exists': BACKUP_FILE.exists(),
        'snapshot_count': len(list(SNAPSHOTS_DIR.glob("state_*.json"))),
    }
    
    if STATE_FILE.exists():
        stat = STATE_FILE.stat()
        status['state_size'] = stat.st_size
        status['state_modified'] = datetime.fromtimestamp(stat.st_mtime).isoformat()
    
    return status

# ================================
# CLEANUP
# ================================

def cleanup_old_snapshots(keep_count: int = 10):
    """
    Remove old snapshots, keeping only most recent N
    
    Prevents disk space growth
    """
    snapshots = list_snapshots()
    
    if len(snapshots) <= keep_count:
        return
    
    # Delete oldest snapshots
    to_delete = snapshots[keep_count:]
    for snapshot in to_delete:
        try:
            Path(snapshot['path']).unlink()
        except Exception as e:
            print(f"Error deleting snapshot {snapshot['filename']}: {e}")

# ================================
# EXAMPLE USAGE
# ================================

if __name__ == "__main__":
    """
    Standalone test of persistence layer
    """
    print("BlackRoad OS - Persistence Layer Test")
    print("=" * 50)
    print()
    
    # Create mock state
    from datetime import datetime
    import time
    
    mock_state = {
        'mode': 'chat',
        'cursor': {'scroll_offset': 5},
        'agents': {
            'lucidia': {
                'status': 'active',
                'task': 'Memory sync',
                'color': 'purple',
                'last_active': time.time(),
            },
        },
        'log': [
            {'time': datetime.now(), 'level': 'system', 'msg': 'System initialized'},
            {'time': datetime.now(), 'level': 'command', 'msg': '$ test command'},
        ],
        'input_buffer': 'test',
        'command_mode': True,
        'metrics': {'cpu': 24.5},
    }
    
    # Test save
    print("Testing save...")
    success = save_state(mock_state)
    print(f"  Save: {'✓' if success else '✗'}")
    print(f"  File: {STATE_FILE}")
    print()
    
    # Test load
    print("Testing load...")
    loaded_state = load_state()
    if loaded_state:
        print("  Load: ✓")
        print(f"  Mode: {loaded_state.get('mode')}")
        print(f"  Agents: {len(loaded_state.get('agents', {}))}")
        print(f"  Log entries: {len(loaded_state.get('log', []))}")
    else:
        print("  Load: ✗")
    print()
    
    # Test snapshot
    print("Testing snapshot...")
    snapshot_file = snapshot_state(mock_state, label="test")
    if snapshot_file:
        print(f"  Snapshot: ✓")
        print(f"  File: {snapshot_file}")
    else:
        print("  Snapshot: ✗")
    print()
    
    # List snapshots
    print("Listing snapshots...")
    snapshots = list_snapshots()
    for snap in snapshots:
        print(f"  - {snap['filename']} ({snap['size']} bytes)")
    print()
    
    # Status
    print("Persistence status:")
    status = get_persistence_status()
    for key, value in status.items():
        print(f"  {key}: {value}")
