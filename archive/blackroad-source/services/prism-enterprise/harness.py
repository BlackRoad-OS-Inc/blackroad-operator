"""Benchmark harness for RoadQLM."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Callable, Dict

from . import chsh, maxcut_qaoa, vqe_h2


@dataclass(slots=True)
class BenchmarkResult:
    name: str
    metrics: dict[str, float]


Task = Callable[[], BenchmarkResult]


def run_suite(output_dir: str | Path | None = None) -> dict[str, dict[str, float]]:
    results: Dict[str, dict[str, float]] = {}
    mapping: dict[str, Callable[[], dict[str, float]]] = {
        "chsh": lambda: chsh.run(),
        "maxcut": lambda: asdict(maxcut_qaoa.run()),
        "vqe_h2": lambda: asdict(vqe_h2.run(thetas=[0.1 * i for i in range(10)])),
    }
    for name, runner in mapping.items():
        metrics = runner()
        results[name] = {k: float(v) for k, v in metrics.items()}

    if output_dir is not None:
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        (output_path / "benchmarks.json").write_text(json.dumps(results, indent=2))
    return results


__all__ = ["BenchmarkResult", "run_suite"]
