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
