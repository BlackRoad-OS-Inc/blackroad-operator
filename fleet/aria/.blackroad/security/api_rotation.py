#!/usr/bin/env python3
"""
BlackRoad API Key Rotation System
Automatic key rotation with zero downtime
"""

import os
import json
import time
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import sys
sys.path.insert(0, os.path.dirname(__file__))
from ps_sha_infinity import ps_sha_infinity

KEY_STORE = os.path.expanduser("~/.blackroad/security/keys/api_keys.json")
ROTATION_LOG = os.path.expanduser("~/.blackroad/security/audit/rotations.jsonl")

# Rotation intervals (seconds)
ROTATION_INTERVALS = {
    "critical": 3600,      # 1 hour
    "high": 86400,         # 1 day
    "standard": 604800,    # 1 week
    "low": 2592000         # 30 days
}

def load_keys() -> Dict:
    """Load API keys from store"""
    try:
        with open(KEY_STORE, "r") as f:
            return json.load(f)
    except:
        return {"keys": {}, "rotations": []}

def save_keys(store: Dict):
    """Save API keys"""
    os.makedirs(os.path.dirname(KEY_STORE), exist_ok=True)
    with open(KEY_STORE, "w") as f:
        json.dump(store, f, indent=2)

def log_rotation(key_name: str, action: str, details: Dict):
    """Log rotation event"""
    os.makedirs(os.path.dirname(ROTATION_LOG), exist_ok=True)
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "key_name": key_name,
        "action": action,
        "details": details
    }
    with open(ROTATION_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")

def generate_api_key(prefix: str = "br") -> str:
    """Generate new API key"""
    random_part = secrets.token_hex(24)
    return f"{prefix}_{random_part}"

def create_key(name: str, priority: str = "standard", prefix: str = "br") -> Dict:
    """Create new API key"""
    store = load_keys()

    key = generate_api_key(prefix)
    key_hash = ps_sha_infinity(key.encode())

    now = datetime.utcnow()
    interval = ROTATION_INTERVALS.get(priority, ROTATION_INTERVALS["standard"])
    next_rotation = now + timedelta(seconds=interval)

    key_entry = {
        "key": key,
        "hash": key_hash,
        "priority": priority,
        "created": now.isoformat(),
        "last_rotated": now.isoformat(),
        "next_rotation": next_rotation.isoformat(),
        "rotation_count": 0,
        "active": True,
        "previous_keys": []  # Keep last 2 for grace period
    }

    store["keys"][name] = key_entry
    save_keys(store)
    log_rotation(name, "created", {"priority": priority})

    return {"name": name, "key": key, "hash": key_hash[:16] + "..."}

def rotate_key(name: str) -> Optional[Dict]:
    """Rotate API key"""
    store = load_keys()

    if name not in store["keys"]:
        return None

    key_entry = store["keys"][name]
    old_key = key_entry["key"]

    # Generate new key
    new_key = generate_api_key(old_key.split("_")[0])
    new_hash = ps_sha_infinity(new_key.encode())

    # Keep previous key for grace period
    key_entry["previous_keys"] = [old_key] + key_entry["previous_keys"][:1]

    # Update key
    now = datetime.utcnow()
    interval = ROTATION_INTERVALS.get(key_entry["priority"], ROTATION_INTERVALS["standard"])

    key_entry["key"] = new_key
    key_entry["hash"] = new_hash
    key_entry["last_rotated"] = now.isoformat()
    key_entry["next_rotation"] = (now + timedelta(seconds=interval)).isoformat()
    key_entry["rotation_count"] += 1

    save_keys(store)
    log_rotation(name, "rotated", {"count": key_entry["rotation_count"]})

    return {"name": name, "new_key": new_key, "hash": new_hash[:16] + "..."}

def verify_key(name: str, provided_key: str) -> bool:
    """Verify API key (checks current and grace period keys)"""
    store = load_keys()

    if name not in store["keys"]:
        return False

    key_entry = store["keys"][name]

    # Check current key
    if secrets.compare_digest(key_entry["key"], provided_key):
        return True

    # Check grace period keys
    for old_key in key_entry.get("previous_keys", []):
        if secrets.compare_digest(old_key, provided_key):
            return True

    return False

def check_rotations() -> List[str]:
    """Check which keys need rotation"""
    store = load_keys()
    needs_rotation = []

    now = datetime.utcnow()

    for name, key_entry in store["keys"].items():
        if not key_entry.get("active", True):
            continue

        next_rotation = datetime.fromisoformat(key_entry["next_rotation"])
        if now >= next_rotation:
            needs_rotation.append(name)

    return needs_rotation

def auto_rotate() -> List[Dict]:
    """Automatically rotate all keys that need it"""
    needs_rotation = check_rotations()
    results = []

    for name in needs_rotation:
        result = rotate_key(name)
        if result:
            results.append(result)

    return results

def list_keys() -> List[Dict]:
    """List all API keys (without exposing actual keys)"""
    store = load_keys()
    keys = []

    for name, entry in store["keys"].items():
        keys.append({
            "name": name,
            "priority": entry["priority"],
            "hash": entry["hash"][:16] + "...",
            "rotations": entry["rotation_count"],
            "next_rotation": entry["next_rotation"],
            "active": entry.get("active", True)
        })

    return keys

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("api_rotation.py <command> [args]")
        print("Commands: create, rotate, verify, check, auto, list")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "create":
        name = sys.argv[2] if len(sys.argv) > 2 else f"key_{int(time.time())}"
        priority = sys.argv[3] if len(sys.argv) > 3 else "standard"
        result = create_key(name, priority)
        print(json.dumps(result, indent=2))

    elif cmd == "rotate" and len(sys.argv) > 2:
        result = rotate_key(sys.argv[2])
        if result:
            print(json.dumps(result, indent=2))
        else:
            print("Key not found")

    elif cmd == "verify" and len(sys.argv) > 3:
        result = verify_key(sys.argv[2], sys.argv[3])
        print("VALID" if result else "INVALID")

    elif cmd == "check":
        needs = check_rotations()
        if needs:
            print(f"Keys needing rotation: {', '.join(needs)}")
        else:
            print("All keys current")

    elif cmd == "auto":
        results = auto_rotate()
        if results:
            print(f"Rotated {len(results)} keys")
            for r in results:
                print(f"  - {r['name']}")
        else:
            print("No rotations needed")

    elif cmd == "list":
        keys = list_keys()
        for k in keys:
            status = "●" if k["active"] else "○"
            print(f"{status} {k['name']} [{k['priority']}] rotations:{k['rotations']}")
