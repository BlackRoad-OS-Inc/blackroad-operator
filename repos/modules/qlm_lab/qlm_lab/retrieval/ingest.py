"""Corpus ingestion helpers for building the retrieval index."""
from __future__ import annotations

import json
import os
from dataclasses import asdict
from pathlib import Path

from .chunk import Chunk, by_lines

TEXT_EXT = {".md", ".txt", ".py"}


def _resolve_root(path: str) -> Path:
    """Resolve ``path`` relative to either the CWD or repo root."""

    root_path = Path(path)
    if root_path.exists():
        return root_path

    # When tests run from modules/qlm_lab the fixtures live one level higher at
    # repository/modules/qlm_lab/....  Fall back to that location so the
    # ingestion helpers keep working regardless of the current working dir.
    repo_root = Path(__file__).resolve().parents[4]
    candidate = (repo_root / root_path).resolve()
    if candidate.exists():
        return candidate

    raise FileNotFoundError(f"Corpus root '{path}' does not exist")


def read_text(path: str) -> str:
    """Return the UTF-8 text content for ``path`` when supported."""

    ext = Path(path).suffix.lower()
    if ext not in TEXT_EXT:
        return ""
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as handle:
            return handle.read()
    except OSError:
        return ""


def ingest(root: str, out_path: str) -> int:
    """Walk ``root`` and write chunked corpus entries to ``out_path``."""

    count = 0
    root_path = _resolve_root(root)
    out_file = Path(out_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    with out_file.open("w", encoding="utf-8") as handle:
        for dirpath, _, filenames in os.walk(root_path):
            for filename in filenames:
                path = os.path.join(dirpath, filename)
                text = read_text(path)
                if not text.strip():
                    continue
                rel = os.path.relpath(path, root_path)
                for chunk in by_lines(text, path=path, doc_id=rel):
                    handle.write(json.dumps(asdict(chunk), ensure_ascii=False) + "\n")
                    count += 1
    return count


__all__ = ["Chunk", "ingest", "read_text", "TEXT_EXT"]
