#!/usr/bin/env python3
import os, sys, json, hashlib, time
from pathlib import Path
from datetime import datetime

ROOTS = [
    Path.home() / "blackroad-io-v2",
    Path.home() / "lucidia-cli",
    Path.home() / "blackboxprogramming",
    Path.home() / "Documents" / "BlackRoad",
]

TEXT_EXTS = {
    ".md", ".txt", ".py", ".js", ".ts", ".sh",
    ".json", ".yaml", ".yml", ".toml", ".sql"
}

EXCLUDE_DIRS = {
    "node_modules", ".git", ".venv", "venv",
    "__pycache__", "dist", "build"
}

MAX_BYTES = 250 * 1024

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def is_excluded(path: Path) -> bool:
    return any(part in EXCLUDE_DIRS for part in path.parts)

def read_file(path: Path):
    try:
        data = path.read_bytes()
    except Exception:
        return None, None

    h = sha256(data)
    if path.suffix in TEXT_EXTS and len(data) <= MAX_BYTES:
        try:
            return data.decode("utf-8", errors="replace"), h
        except Exception:
            return None, h
    return None, h

out = Path("state/file_index.jsonl")
out.parent.mkdir(parents=True, exist_ok=True)

with out.open("w") as f:
    for root in ROOTS:
        if not root.exists():
            continue
        repo = root.name
        for path in root.rglob("*"):
            if path.is_dir():
                continue
            if is_excluded(path):
                continue

            content, h = read_file(path)
            stat = path.stat()

            record = {
                "id": f"sha256:{h}",
                "path": str(path),
                "repo": repo,
                "rel_path": str(path.relative_to(root)),
                "ext": path.suffix,
                "size": stat.st_size,
                "mtime": datetime.utcfromtimestamp(stat.st_mtime).isoformat() + "Z",
                "hash": h,
            }

            if content is not None:
                record["content"] = content

            f.write(json.dumps(record, ensure_ascii=False) + "\n")
