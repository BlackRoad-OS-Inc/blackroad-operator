#!/usr/bin/env python3
"""
BlackRoad Governance — RFC Voting System
Uses PS-SHA∞ hash chain to create a tamper-evident vote record.

Usage:
    python3 governance_vote.py create RFC-002 "Adopt Trinary Logic for all agents" alice octavia prism
    python3 governance_vote.py vote RFC-002 LUCIDIA yes "Strongly agree — trinary logic is foundational"
    python3 governance_vote.py tally RFC-002
    python3 governance_vote.py verify RFC-002
"""

from __future__ import annotations

import hashlib
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

VOTES_DIR = Path.home() / ".blackroad" / "governance" / "votes"


def ps_sha(prev: str, content: str) -> str:
    payload = f"{prev}:{content}:{time.time_ns()}"
    return hashlib.sha256(payload.encode()).hexdigest()


def load_vote_file(rfc_id: str) -> dict:
    path = VOTES_DIR / f"{rfc_id}.json"
    if not path.exists():
        raise FileNotFoundError(f"No vote record for {rfc_id}")
    return json.loads(path.read_text())


def save_vote_file(rfc_id: str, data: dict) -> None:
    VOTES_DIR.mkdir(parents=True, exist_ok=True)
    (VOTES_DIR / f"{rfc_id}.json").write_text(json.dumps(data, indent=2))


# ── Commands ──────────────────────────────────────────────────────────────────

def cmd_create(rfc_id: str, title: str, eligible_voters: list[str]) -> None:
    """Create a new RFC vote record."""
    path = VOTES_DIR / f"{rfc_id}.json"
    if path.exists():
        print(f"✗ Vote record already exists for {rfc_id}")
        sys.exit(1)

    genesis_entry = {
        "hash": ps_sha("GENESIS", f"{rfc_id}:{title}"),
        "prev_hash": "GENESIS",
        "event": "vote_created",
        "rfc_id": rfc_id,
        "title": title,
        "eligible_voters": eligible_voters,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }

    data = {
        "rfc_id": rfc_id,
        "title": title,
        "status": "open",
        "eligible_voters": eligible_voters,
        "chain": [genesis_entry],
        "votes": {},
    }

    save_vote_file(rfc_id, data)
    print(f"✓ Vote opened: {rfc_id} — {title}")
    print(f"  Eligible: {', '.join(eligible_voters)}")
    print(f"  Genesis hash: {genesis_entry['hash'][:16]}...")


def cmd_vote(rfc_id: str, voter: str, decision: str, reason: str = "") -> None:
    """Cast a vote on an RFC."""
    if decision not in ("yes", "no", "abstain"):
        print("✗ Decision must be: yes | no | abstain"); sys.exit(1)

    data = load_vote_file(rfc_id)
    if data["status"] != "open":
        print(f"✗ Vote is {data['status']}"); sys.exit(1)
    if voter not in data["eligible_voters"]:
        print(f"✗ {voter} is not an eligible voter"); sys.exit(1)
    if voter in data["votes"]:
        print(f"✗ {voter} has already voted"); sys.exit(1)

    prev_hash = data["chain"][-1]["hash"]
    entry = {
        "hash": ps_sha(prev_hash, f"{voter}:{decision}:{reason}"),
        "prev_hash": prev_hash,
        "event": "vote_cast",
        "voter": voter,
        "decision": decision,
        "reason": reason,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
    data["chain"].append(entry)
    data["votes"][voter] = {"decision": decision, "reason": reason, "hash": entry["hash"]}
    save_vote_file(rfc_id, data)

    symbol = {"yes": "✓", "no": "✗", "abstain": "~"}[decision]
    print(f"{symbol} Vote recorded: {voter} voted {decision.upper()}")
    print(f"  Hash: {entry['hash'][:16]}...")


def cmd_tally(rfc_id: str) -> None:
    """Show current vote tally."""
    data = load_vote_file(rfc_id)
    votes = data["votes"]
    eligible = data["eligible_voters"]

    yes = sum(1 for v in votes.values() if v["decision"] == "yes")
    no = sum(1 for v in votes.values() if v["decision"] == "no")
    abstain = sum(1 for v in votes.values() if v["decision"] == "abstain")
    pending = [v for v in eligible if v not in votes]

    print(f"\n{data['rfc_id']}: {data['title']}")
    print(f"Status: {data['status'].upper()}")
    print(f"\n  YES:     {yes}")
    print(f"  NO:      {no}")
    print(f"  ABSTAIN: {abstain}")
    print(f"  PENDING: {len(pending)} ({', '.join(pending) or 'none'})")

    if len(votes) == len(eligible):
        result = "APPROVED" if yes > no else "REJECTED" if no > yes else "TIE"
        print(f"\n  RESULT: {result}")


def cmd_verify(rfc_id: str) -> None:
    """Verify the PS-SHA∞ hash chain integrity."""
    data = load_vote_file(rfc_id)
    chain = data["chain"]
    for i, entry in enumerate(chain):
        expected_prev = "GENESIS" if i == 0 else chain[i - 1]["hash"]
        if entry["prev_hash"] != expected_prev:
            print(f"✗ CHAIN BROKEN at entry {i}: {entry['hash'][:16]}")
            print(f"  Expected prev: {expected_prev[:16]}")
            print(f"  Got prev: {entry['prev_hash'][:16]}")
            sys.exit(1)
    print(f"✓ Chain valid — {len(chain)} entries verified")


def main() -> None:
    args = sys.argv[1:]
    if not args: print(__doc__); return

    cmd = args[0]
    if cmd == "create" and len(args) >= 4:
        cmd_create(args[1], args[2], args[3:])
    elif cmd == "vote" and len(args) >= 4:
        cmd_vote(args[1], args[2], args[3], " ".join(args[4:]))
    elif cmd == "tally" and len(args) >= 2:
        cmd_tally(args[1])
    elif cmd == "verify" and len(args) >= 2:
        cmd_verify(args[1])
    else:
        print("Unknown command or missing args."); print(__doc__)


if __name__ == "__main__":
    main()
