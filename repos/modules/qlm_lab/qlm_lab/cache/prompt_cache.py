from __future__ import annotations
from dataclasses import dataclass, asdict
from typing import List, Dict, Any
from pathlib import Path
import json
import time
import difflib

CACHE_PATH: Path = Path(__file__).resolve().parents[2] / "artifacts" / "prompt_cache.jsonl"


@dataclass
class CacheEntry:
    ts: float
    prompt: str
    plan_text: str
    artifacts: List[str]
    meta: Dict[str, Any]


def _ensure_dir() -> None:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)


def put(prompt: str, plan_text: str, artifacts: List[str] | None = None, **meta: Any) -> None:
    _ensure_dir()
    entry = CacheEntry(time.time(), prompt, plan_text, artifacts or [], meta)
    with CACHE_PATH.open("a", encoding="utf-8") as f:
        f.write(json.dumps(asdict(entry)) + "\n")


def _norm(s: str) -> str:
    return " ".join("".join(c.lower() if c.isalnum() else " " for c in s).split())


def get(prompt: str, cutoff: float = 0.78, max_results: int = 3) -> List[CacheEntry]:
    if not CACHE_PATH.exists():
        return []
    target = _norm(prompt)
    hits: List[CacheEntry] = []
    with CACHE_PATH.open("r", encoding="utf-8") as f:
        for line in f:
            try:
                data = json.loads(line)
                ratio = difflib.SequenceMatcher(None, target, _norm(data.get("prompt", ""))).ratio()
                if ratio >= cutoff:
                    hits.append(CacheEntry(**data))
            except Exception:  # pragma: no cover - defensive
                continue
    hits.sort(key=lambda entry: entry.ts, reverse=True)
    return hits[:max_results]
