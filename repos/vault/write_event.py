#!/usr/bin/env python3
import json
import hashlib
import pathlib
import sys
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parent
LOGS = ROOT / "logs"
STATE = ROOT / "state"
LOGS.mkdir(parents=True, exist_ok=True)
STATE.mkdir(parents=True, exist_ok=True)
LAST = STATE / "last_chain_hash.txt"

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def main() -> None:
    if len(sys.argv) < 2:
        print("usage: write_event.py '<content string or JSON>'", file=sys.stderr)
        sys.exit(1)

    raw = sys.argv[1]
    try:
        content = json.loads(raw)
    except json.JSONDecodeError:
        content = {"text": raw}

    ts = datetime.now(timezone.utc).isoformat()
    base = {"ts": ts, "content": content}

    content_bytes = json.dumps(base, separators=(",", ":"), sort_keys=True).encode()
    content_hash = sha256(content_bytes)

    prev_hash = LAST.read_text().strip() if LAST.exists() else "0" * 64
    chain_hash = sha256((prev_hash + content_hash).encode())

    line = {
        **base,
        "content_hash": content_hash,
        "prev_hash": prev_hash,
        "chain_hash": chain_hash,
    }

    day = ts[:10]
    out_file = LOGS / f"{day}.jsonl"
    with out_file.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(line, separators=(",", ":"), sort_keys=True) + "\n")

    LAST.write_text(chain_hash)
    print(chain_hash)

if __name__ == "__main__":
    main()
