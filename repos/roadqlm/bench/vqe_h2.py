"""Simplified VQE benchmark for H2."""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Iterable

import numpy as np


def _ansatz_energy(theta: float) -> float:
    return math.cos(theta) - 0.5 * math.sin(theta)


@dataclass(slots=True)
class VQESummary:
    best_energy: float
    iterations: int


def run(thetas: Iterable[float]) -> VQESummary:
    values = np.array([_ansatz_energy(theta) for theta in thetas], dtype=float)
    best_idx = int(np.argmin(values))
    return VQESummary(best_energy=float(values[best_idx]), iterations=len(values))


__all__ = ["VQESummary", "run"]
