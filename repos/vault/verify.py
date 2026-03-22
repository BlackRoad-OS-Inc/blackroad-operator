#!/usr/bin/env python3
import json
import pathlib
import sys
import hashlib

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

ROOT = pathlib.Path(__file__).resolve().parent

def rebuild_chain(day: str) -> tuple[list[str], str | None]:
    log_path = ROOT / "logs" / f"{day}.jsonl"
    if not log_path.exists():
        return [], None

    prev = "0" * 64
    chain_hashes: list[str] = []
    with log_path.open(encoding="utf-8") as fh:
        for line in fh:
            obj = json.loads(line)
            base = {"ts": obj["ts"], "content": obj["content"]}
            content_hash = sha256(json.dumps(base, separators=(",", ":"), sort_keys=True).encode())
            if obj["content_hash"] != content_hash:
                raise ValueError("content_hash mismatch")
            expected = sha256((prev + content_hash).encode())
            if obj["chain_hash"] != expected:
                raise ValueError("chain_hash mismatch")
            chain_hashes.append(expected)
            prev = expected
    return chain_hashes, prev

def merkle_root(hashes: list[str]) -> str:
    if not hashes:
        return "0" * 64
    layer = hashes[:]
    while len(layer) > 1:
        nxt: list[str] = []
        for idx in range(0, len(layer), 2):
            left = layer[idx]
            right = layer[idx + 1] if idx + 1 < len(layer) else layer[idx]
            nxt.append(sha256((left + right).encode()))
        layer = nxt
    return layer[0]

def verify_day(day: str) -> None:
    manifest_path = ROOT / "snapshots" / f"{day}.manifest.json"
    manifest = json.loads(manifest_path.read_text())
    chain_hashes, _ = rebuild_chain(day)
    root = merkle_root(chain_hashes)
    if root != manifest["merkle_root"]:
        raise ValueError("merkle root mismatch")

def main() -> None:
    if len(sys.argv) < 2:
        sys.exit("usage: verify.py YYYY-MM-DD")

    day = sys.argv[1]
    try:
        verify_day(day)
    except FileNotFoundError as exc:
        sys.exit(f"missing file: {exc}")
    except ValueError as exc:
        sys.exit(f"verification failed: {exc}")
    print("VERIFIED")

if __name__ == "__main__":
    main()
