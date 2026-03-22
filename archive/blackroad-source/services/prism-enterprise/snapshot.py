#!/usr/bin/env python3
import hashlib
import json
import pathlib
from datetime import datetime, timezone

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

ROOT = pathlib.Path(__file__).resolve().parent
LOGS = ROOT / "logs"
SNAPSHOTS = ROOT / "snapshots"
SNAPSHOTS.mkdir(parents=True, exist_ok=True)

def merkle_root(hashes: list[str]) -> str:
    layer = hashes[:]
    if not layer:
        return "0" * 64
    while len(layer) > 1:
        nxt: list[str] = []
        for idx in range(0, len(layer), 2):
            left = layer[idx]
            right = layer[idx + 1] if idx + 1 < len(layer) else layer[idx]
            nxt.append(sha256((left + right).encode()))
        layer = nxt
    return layer[0]

def collect_hashes(day: str) -> tuple[list[str], int | None]:
    path = LOGS / f"{day}.jsonl"
    if not path.exists():
        return [], None
    hashes: list[str] = []
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            obj = json.loads(line)
            hashes.append(obj["chain_hash"])
    return hashes, path.stat().st_size

def main() -> None:
    now = datetime.now(timezone.utc).isoformat()
    day = now[:10]
    hashes, size_bytes = collect_hashes(day)
    root_hash = merkle_root(hashes)
    manifest = {
        "ts": now,
        "day": day,
        "entries": len(hashes),
        "bytes": size_bytes or 0,
        "merkle_root": root_hash,
        "algo": "sha256",
    }
    out_file = SNAPSHOTS / f"{day}.manifest.json"
    out_file.write_text(json.dumps(manifest, indent=2, sort_keys=True))
    print(out_file)

if __name__ == "__main__":
    main()
