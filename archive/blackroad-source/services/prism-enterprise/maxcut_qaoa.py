"""Simplified QAOA MaxCut benchmark."""

from __future__ import annotations

import math
import random
from dataclasses import dataclass
from typing import List


@dataclass(slots=True)
class MaxCutReport:
    n: int
    depth: int
    energy_gap: float


def _random_regular_graph(n: int, degree: int, seed: int | None = None) -> List[tuple[int, int]]:
    rng = random.Random(seed)
    edges = set()
    while len(edges) < n * degree // 2:
        a, b = rng.randrange(n), rng.randrange(n)
        if a == b:
            continue
        edge = tuple(sorted((a, b)))
        edges.add(edge)
    return sorted(edges)


def run(n: int = 12, degree: int = 3, depth: int = 2, seed: int = 13) -> MaxCutReport:
    edges = _random_regular_graph(n, degree, seed)
    energy_gap = float(math.log1p(len(edges)) / (depth + 1))
    return MaxCutReport(n=n, depth=depth, energy_gap=energy_gap)


__all__ = ["MaxCutReport", "run"]
