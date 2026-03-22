"""Planning of thoughts (PoT) helpers used in tests."""

from __future__ import annotations

import json
import random
from pathlib import Path


def _ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def _build_trace(question: str, index: int, rng: random.Random) -> list[dict[str, object]]:
    thoughts = [
        {"op": "PLAN", "question": question, "index": index},
        {
            "op": "THINK",
            "detail": f"consider alternative {rng.randint(0, 9999)}",
        },
        {"op": "YIELD", "answer": f"Prototype answer {index}"},
    ]
    return thoughts


def plan_question(question: str, *, n: int, out_dir: str, seed: int | None = None) -> list[list[dict[str, object]]]:
    """Generate ``n`` reasoning traces and store them in ``out_dir``.

    The return value mirrors the JSONL artefacts that are written to disk so that
    the caller can inspect the generated content without re-reading the files.
    """

    rng = random.Random(seed)
    output = Path(out_dir)
    _ensure_dir(output)

    traces: list[list[dict[str, object]]] = []
    for idx in range(n):
        steps = _build_trace(question, idx, rng)
        trace_path = output / f"trace_{idx}.jsonl"
        with trace_path.open("w", encoding="utf-8") as handle:
            for step in steps:
                handle.write(json.dumps(step) + "\n")
        traces.append(steps)
    return traces


__all__ = ["plan_question"]
