#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# 
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================
# BlackRoad Security Stack
# Zero Trust + PS-SHA-∞ + API Rotation + Tailscale Tracking

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
NC='\033[0m'

HOSTNAME=$(hostname)

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  BlackRoad Security Stack - $HOSTNAME${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

mkdir -p ~/.blackroad/security/{keys,tokens,audit}

echo -e "${AMBER}[1/5]${NC} Installing PS-SHA-∞ (Phi-Spiral Hash)..."

cat > ~/.blackroad/security/ps_sha_infinity.py << 'EOFPSSHAI'
#!/usr/bin/env python3
"""
PS-SHA-∞ (Phi-Spiral SHA Infinity)
BlackRoad's proprietary quantum-resistant hashing algorithm

Based on:
- Golden ratio (φ = 1.618033988749895)
- Fibonacci spiral transformations
- SHA-256 as entropy source
- Infinite recursive depth simulation
"""

import hashlib
import struct
import os
from typing import Optional

PHI = 1.618033988749895
PHI_INVERSE = 0.618033988749895
FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987]

def phi_transform(data: bytes, rounds: int = 8) -> bytes:
    """Apply golden ratio transformation to data"""
    result = bytearray(data)
    for r in range(rounds):
        fib_idx = r % len(FIBONACCI)
        phi_shift = int((PHI ** (r + 1)) * FIBONACCI[fib_idx]) % 256
        for i in range(len(result)):
            # Spiral transformation
            spiral_pos = int((i * PHI) % len(result))
            result[i] = (result[i] + result[spiral_pos] + phi_shift) % 256
    return bytes(result)

def ps_sha_infinity(data: bytes, depth: int = 8, salt: Optional[bytes] = None) -> str:
    """
    Generate PS-SHA-∞ hash

    Args:
        data: Input bytes to hash
        depth: Recursive depth (simulates infinity via convergence)
        salt: Optional salt for additional entropy

    Returns:
        64-character hex hash with PS-SHA-∞ prefix marker
    """
    if salt is None:
        salt = struct.pack('>d', PHI)  # Use phi as default salt

    # Initial SHA-256
    current = hashlib.sha256(salt + data).digest()

    # Recursive phi-spiral transformations
    for d in range(depth):
        # Apply phi transformation
        transformed = phi_transform(current, rounds=FIBONACCI[d % len(FIBONACCI)])

        # Spiral mix with previous hash
        mixed = bytearray(32)
        for i in range(32):
            spiral_idx = int((i * PHI_INVERSE * (d + 1))) % 32
            mixed[i] = (transformed[i] ^ current[spiral_idx]) % 256

        # Re-hash with depth marker
        depth_marker = struct.pack('>I', d)
        current = hashlib.sha256(bytes(mixed) + depth_marker).digest()

    # Final phi-weighted combination
    final = bytearray(32)
    for i in range(32):
        weight = (PHI ** (i % 8)) % 1
        final[i] = int((current[i] * weight + current[31-i] * (1-weight))) % 256

    return hashlib.sha256(bytes(final)).hexdigest()

def verify_ps_sha(data: bytes, expected_hash: str, depth: int = 8, salt: Optional[bytes] = None) -> bool:
    """Verify data against PS-SHA-∞ hash"""
    computed = ps_sha_infinity(data, depth, salt)
    return computed == expected_hash

def generate_api_key(prefix: str = "br") -> tuple[str, str]:
    """Generate API key with PS-SHA-∞ verification hash"""
    # Random key
    key_bytes = os.urandom(32)
    key = f"{prefix}_{key_bytes.hex()[:32]}"

    # PS-SHA-∞ hash for verification
    key_hash = ps_sha_infinity(key.encode())

    return key, key_hash

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        if sys.argv[1] == "hash":
            data = sys.argv[2] if len(sys.argv) > 2 else ""
            print(ps_sha_infinity(data.encode()))
        elif sys.argv[1] == "verify":
            data = sys.argv[2] if len(sys.argv) > 2 else ""
            expected = sys.argv[3] if len(sys.argv) > 3 else ""
            result = verify_ps_sha(data.encode(), expected)
            print("VALID" if result else "INVALID")
        elif sys.argv[1] == "genkey":
            prefix = sys.argv[2] if len(sys.argv) > 2 else "br"
            key, hash_val = generate_api_key(prefix)
            print(f"Key: {key}")
            print(f"Hash: {hash_val}")
        else:
            print(f"PS-SHA-∞: {ps_sha_infinity(sys.argv[1].encode())}")
    else:
        # Demo
        test = b"BlackRoad OS"
        print(f"Input: {test.decode()}")
        print(f"PS-SHA-∞: {ps_sha_infinity(test)}")
EOFPSSHAI
chmod +x ~/.blackroad/security/ps_sha_infinity.py

echo -e "${GREEN}PS-SHA-∞ installed${NC}"

echo -e "${AMBER}[2/5]${NC} Setting up Zero Trust authentication..."

cat > ~/.blackroad/security/zero_trust.py << 'EOFZT'
#!/usr/bin/env python3
"""
BlackRoad Zero Trust Authentication
Never trust, always verify - even internal traffic
"""

import os
import json
import time
import socket
import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import sys
sys.path.insert(0, os.path.dirname(__file__))
from ps_sha_infinity import ps_sha_infinity, verify_ps_sha

TRUST_STORE = os.path.expanduser("~/.blackroad/security/trust_store.json")
AUDIT_LOG = os.path.expanduser("~/.blackroad/security/audit/access.jsonl")
TOKEN_TTL = 300  # 5 minutes

# Trusted agents (PS-SHA-∞ hashes of their identities)
TRUSTED_AGENTS = {}

def load_trust_store() -> Dict:
    """Load trusted agents from store"""
    try:
        with open(TRUST_STORE, "r") as f:
            return json.load(f)
    except:
        return {"agents": {}, "keys": {}, "revoked": []}

def save_trust_store(store: Dict):
    """Save trust store"""
    os.makedirs(os.path.dirname(TRUST_STORE), exist_ok=True)
    with open(TRUST_STORE, "w") as f:
        json.dump(store, f, indent=2)

def audit_log(event: str, agent: str, details: Dict, success: bool):
    """Log security event"""
    os.makedirs(os.path.dirname(AUDIT_LOG), exist_ok=True)
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "host": socket.gethostname(),
        "event": event,
        "agent": agent,
        "success": success,
        "details": details
    }
    with open(AUDIT_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")

def generate_challenge() -> tuple[str, str]:
    """Generate authentication challenge"""
    nonce = os.urandom(32).hex()
    timestamp = str(int(time.time()))
    challenge = f"{nonce}:{timestamp}"
    return challenge, ps_sha_infinity(challenge.encode())

def verify_challenge_response(challenge: str, response: str, agent_key: str) -> bool:
    """Verify challenge-response authentication"""
    expected = ps_sha_infinity(f"{challenge}:{agent_key}".encode())
    return hmac.compare_digest(expected, response)

def register_agent(agent_name: str, public_key: str) -> str:
    """Register new trusted agent"""
    store = load_trust_store()

    # Generate agent identity hash
    identity = ps_sha_infinity(f"{agent_name}:{public_key}:{socket.gethostname()}".encode())

    store["agents"][agent_name] = {
        "identity": identity,
        "public_key": public_key,
        "registered": datetime.utcnow().isoformat(),
        "last_seen": None,
        "trust_level": "standard"
    }

    save_trust_store(store)
    audit_log("agent_registered", agent_name, {"identity": identity[:16]}, True)

    return identity

def verify_agent(agent_name: str, provided_identity: str) -> bool:
    """Verify agent identity using Zero Trust"""
    store = load_trust_store()

    # Check if revoked
    if provided_identity in store.get("revoked", []):
        audit_log("access_denied", agent_name, {"reason": "revoked"}, False)
        return False

    # Verify identity
    agent = store.get("agents", {}).get(agent_name)
    if not agent:
        audit_log("access_denied", agent_name, {"reason": "unknown_agent"}, False)
        return False

    if not hmac.compare_digest(agent["identity"], provided_identity):
        audit_log("access_denied", agent_name, {"reason": "identity_mismatch"}, False)
        return False

    # Update last seen
    agent["last_seen"] = datetime.utcnow().isoformat()
    save_trust_store(store)

    audit_log("access_granted", agent_name, {}, True)
    return True

def generate_session_token(agent_name: str, ttl: int = TOKEN_TTL) -> str:
    """Generate short-lived session token"""
    expiry = int(time.time()) + ttl
    payload = f"{agent_name}:{expiry}:{os.urandom(16).hex()}"
    token = ps_sha_infinity(payload.encode())

    store = load_trust_store()
    if "sessions" not in store:
        store["sessions"] = {}
    store["sessions"][token] = {
        "agent": agent_name,
        "expiry": expiry,
        "created": datetime.utcnow().isoformat()
    }
    save_trust_store(store)

    return token

def verify_session_token(token: str) -> Optional[str]:
    """Verify session token, return agent name if valid"""
    store = load_trust_store()
    session = store.get("sessions", {}).get(token)

    if not session:
        return None

    if time.time() > session["expiry"]:
        # Token expired, remove it
        del store["sessions"][token]
        save_trust_store(store)
        return None

    return session["agent"]

def revoke_agent(agent_name: str):
    """Revoke agent access"""
    store = load_trust_store()

    agent = store.get("agents", {}).get(agent_name)
    if agent:
        store["revoked"].append(agent["identity"])
        del store["agents"][agent_name]
        save_trust_store(store)
        audit_log("agent_revoked", agent_name, {}, True)

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("zero_trust.py <command> [args]")
        print("Commands: register, verify, token, revoke, audit")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "register" and len(sys.argv) >= 3:
        agent = sys.argv[2]
        key = sys.argv[3] if len(sys.argv) > 3 else os.urandom(16).hex()
        identity = register_agent(agent, key)
        print(f"Registered: {agent}")
        print(f"Identity: {identity}")

    elif cmd == "verify" and len(sys.argv) >= 4:
        agent = sys.argv[2]
        identity = sys.argv[3]
        result = verify_agent(agent, identity)
        print("VERIFIED" if result else "DENIED")

    elif cmd == "token" and len(sys.argv) >= 3:
        agent = sys.argv[2]
        token = generate_session_token(agent)
        print(f"Token: {token}")

    elif cmd == "revoke" and len(sys.argv) >= 3:
        agent = sys.argv[2]
        revoke_agent(agent)
        print(f"Revoked: {agent}")

    elif cmd == "audit":
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        try:
            with open(AUDIT_LOG, "r") as f:
                lines = f.readlines()[-n:]
                for line in lines:
                    entry = json.loads(line)
                    status = "✓" if entry["success"] else "✗"
                    print(f"{status} [{entry['event']}] {entry['agent']} @ {entry['timestamp']}")
        except FileNotFoundError:
            print("No audit log yet")
EOFZT
chmod +x ~/.blackroad/security/zero_trust.py

echo -e "${GREEN}Zero Trust installed${NC}"

echo -e "${AMBER}[3/5]${NC} Setting up API key rotation..."

cat > ~/.blackroad/security/api_rotation.py << 'EOFROT'
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
EOFROT
chmod +x ~/.blackroad/security/api_rotation.py

echo -e "${GREEN}API rotation installed${NC}"

echo -e "${AMBER}[4/5]${NC} Setting up Tailscale IP tracking..."

cat > ~/.blackroad/security/tailscale_tracker.sh << 'EOFTS'
#!/bin/bash
# Tailscale IP Tracker for BlackRoad fleet
# Monitors and logs all Tailscale connections

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
NC='\033[0m'

TS_LOG="$HOME/.blackroad/security/audit/tailscale.jsonl"
TS_CACHE="$HOME/.blackroad/security/tailscale_cache.json"

mkdir -p "$(dirname "$TS_LOG")"

log_ts_event() {
    local event="$1"
    local details="$2"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "{\"timestamp\":\"$timestamp\",\"host\":\"$(hostname)\",\"event\":\"$event\",\"details\":$details}" >> "$TS_LOG"
}

case "$1" in
    status)
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${AMBER}Tailscale Status - $(hostname)${NC}"
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        if which tailscale &>/dev/null; then
            echo -e "${BLUE}Current IP:${NC}"
            tailscale ip -4 2>/dev/null || echo "  Not connected"
            echo ""
            echo -e "${BLUE}Peers:${NC}"
            tailscale status 2>/dev/null | head -15
        else
            echo "Tailscale not installed"
        fi
        ;;

    monitor)
        echo -e "${AMBER}Starting Tailscale monitor...${NC}"

        while true; do
            current=$(tailscale status --json 2>/dev/null)
            if [[ -n "$current" ]]; then
                # Check for changes
                if [[ -f "$TS_CACHE" ]]; then
                    old=$(cat "$TS_CACHE")
                    if [[ "$current" != "$old" ]]; then
                        log_ts_event "status_change" "$current"
                        echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} Status changed"
                    fi
                fi
                echo "$current" > "$TS_CACHE"
            fi
            sleep 60
        done
        ;;

    peers)
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${AMBER}Tailscale Peer IPs${NC}"
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

        tailscale status --json 2>/dev/null | jq -r '.Peer | to_entries[] | "\(.value.HostName): \(.value.TailscaleIPs[0]) [\(.value.OS)]"' 2>/dev/null || echo "Cannot fetch peers"
        ;;

    verify)
        ip="$2"
        if [[ -z "$ip" ]]; then
            echo "Usage: tailscale_tracker.sh verify <ip>"
            exit 1
        fi

        # Check if IP is in Tailscale network
        if tailscale status --json 2>/dev/null | jq -e ".Peer | to_entries[] | select(.value.TailscaleIPs[] == \"$ip\")" &>/dev/null; then
            hostname=$(tailscale status --json 2>/dev/null | jq -r ".Peer | to_entries[] | select(.value.TailscaleIPs[] == \"$ip\") | .value.HostName")
            echo -e "${GREEN}VERIFIED${NC}: $ip belongs to $hostname"
            log_ts_event "ip_verified" "{\"ip\":\"$ip\",\"host\":\"$hostname\"}"
        else
            echo -e "${AMBER}UNKNOWN${NC}: $ip not in Tailscale network"
            log_ts_event "ip_unknown" "{\"ip\":\"$ip\"}"
        fi
        ;;

    audit)
        n="${2:-20}"
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${AMBER}Tailscale Audit Log (last $n)${NC}"
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

        if [[ -f "$TS_LOG" ]]; then
            tail -n "$n" "$TS_LOG" | jq -r '"\(.timestamp | split("T")[1] | split(".")[0]) [\(.event)] \(.details | tostring | .[0:50])"' 2>/dev/null
        else
            echo "No audit log yet"
        fi
        ;;

    *)
        echo "tailscale_tracker.sh <command>"
        echo ""
        echo "Commands:"
        echo "  status   - Show Tailscale status"
        echo "  monitor  - Start continuous monitoring"
        echo "  peers    - List all peer IPs"
        echo "  verify   - Verify IP belongs to mesh"
        echo "  audit    - Show audit log"
        ;;
esac
EOFTS
chmod +x ~/.blackroad/security/tailscale_tracker.sh

echo -e "${GREEN}Tailscale tracker installed${NC}"

echo -e "${AMBER}[5/5]${NC} Creating security CLI..."

cat > ~/br-security << 'EOFSECCLI'
#!/bin/bash
# BlackRoad Security CLI
# Zero Trust + PS-SHA-∞ + API Rotation + Tailscale

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
WHITE='\033[1;37m'
NC='\033[0m'

SEC_DIR="$HOME/.blackroad/security"

case "$1" in
    status|"")
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${WHITE}  BlackRoad Security Status - $(hostname)${NC}"
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        echo -e "${BLUE}Components:${NC}"
        [[ -f "$SEC_DIR/ps_sha_infinity.py" ]] && echo -e "  ${GREEN}●${NC} PS-SHA-∞" || echo -e "  ○ PS-SHA-∞"
        [[ -f "$SEC_DIR/zero_trust.py" ]] && echo -e "  ${GREEN}●${NC} Zero Trust" || echo -e "  ○ Zero Trust"
        [[ -f "$SEC_DIR/api_rotation.py" ]] && echo -e "  ${GREEN}●${NC} API Rotation" || echo -e "  ○ API Rotation"
        [[ -f "$SEC_DIR/tailscale_tracker.sh" ]] && echo -e "  ${GREEN}●${NC} Tailscale Tracker" || echo -e "  ○ Tailscale Tracker"

        echo ""
        echo -e "${BLUE}API Keys:${NC}"
        python3 "$SEC_DIR/api_rotation.py" list 2>/dev/null | head -5 || echo "  No keys configured"

        echo ""
        echo -e "${BLUE}Trusted Agents:${NC}"
        if [[ -f "$SEC_DIR/trust_store.json" ]]; then
            jq -r '.agents | keys[]' "$SEC_DIR/trust_store.json" 2>/dev/null | while read agent; do
                echo -e "  ${GREEN}●${NC} $agent"
            done
        else
            echo "  No agents registered"
        fi

        echo ""
        echo -e "${BLUE}Tailscale:${NC}"
        if which tailscale &>/dev/null; then
            ts_ip=$(tailscale ip -4 2>/dev/null || echo "not connected")
            echo "  IP: $ts_ip"
        else
            echo "  Not installed"
        fi
        ;;

    hash)
        shift
        python3 "$SEC_DIR/ps_sha_infinity.py" hash "$@"
        ;;

    genkey)
        name="${2:-api_$(date +%s)}"
        priority="${3:-standard}"
        python3 "$SEC_DIR/api_rotation.py" create "$name" "$priority"
        ;;

    rotate)
        if [[ -z "$2" ]]; then
            python3 "$SEC_DIR/api_rotation.py" auto
        else
            python3 "$SEC_DIR/api_rotation.py" rotate "$2"
        fi
        ;;

    trust)
        shift
        python3 "$SEC_DIR/zero_trust.py" "$@"
        ;;

    tailscale|ts)
        shift
        "$SEC_DIR/tailscale_tracker.sh" "$@"
        ;;

    audit)
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${WHITE}  Security Audit Log${NC}"
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        echo -e "${AMBER}Access Log:${NC}"
        python3 "$SEC_DIR/zero_trust.py" audit 5 2>/dev/null || echo "  No access log"

        echo ""
        echo -e "${AMBER}Rotation Log:${NC}"
        tail -5 "$SEC_DIR/audit/rotations.jsonl" 2>/dev/null | jq -r '"\(.timestamp | split("T")[0]) [\(.action)] \(.key_name)"' || echo "  No rotation log"
        ;;

    *)
        echo -e "${PINK}br-security${NC} - BlackRoad Security CLI"
        echo ""
        echo "Commands:"
        echo "  status          - Show security status"
        echo "  hash <data>     - Generate PS-SHA-∞ hash"
        echo "  genkey [name]   - Generate API key"
        echo "  rotate [name]   - Rotate API key(s)"
        echo "  trust <cmd>     - Zero Trust operations"
        echo "  tailscale       - Tailscale tracking"
        echo "  audit           - View audit logs"
        ;;
esac
EOFSECCLI
chmod +x ~/br-security

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Security Stack Installed on $HOSTNAME!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Components:${NC}"
echo "  • PS-SHA-∞ (quantum-resistant hashing)"
echo "  • Zero Trust authentication"
echo "  • API key rotation"
echo "  • Tailscale IP tracking"
echo ""
echo -e "${AMBER}Quick commands:${NC}"
echo "  ~/br-security status"
echo "  ~/br-security hash 'data'"
echo "  ~/br-security genkey mykey critical"
echo "  ~/br-security trust register agent1"
echo "  ~/br-security tailscale peers"
