"""Ladder holography and memory quantisation primitives."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import numpy as np


@dataclass
class LadderDensity:
    """Discrete sampling of the ladder density over a surface."""

    weights: np.ndarray
    density: np.ndarray

    @classmethod
    def from_samples(cls, weights: Iterable[float], density: Iterable[float]) -> "LadderDensity":
        weights = np.asarray(list(weights), dtype=float)
        density = np.asarray(list(density), dtype=float)
        if weights.shape != density.shape:
            raise ValueError("Weights and density must share the same shape")
        return cls(weights, density)

    def integral(self) -> float:
        """Return the discretised surface integral of the density."""

        return float(np.sum(self.weights * self.density))


@dataclass
class MemoryCommitment:
    """Information about a quantised memory commit."""

    quanta: int
    action: float


class LadderHolography:
    """Variational rule that turns ladder closure into quantised memory."""

    def __init__(self, quantum: float):
        if quantum <= 0:
            raise ValueError("Quantum must be positive")
        self.quantum = quantum
        self._accumulated_action = 0.0

    def ingest(self, ladder_density: LadderDensity) -> MemoryCommitment | None:
        """Update the holographic integral and emit commitments when quantised."""

        action = ladder_density.integral()
        self._accumulated_action += action
        quanta = int(self._accumulated_action // self.quantum)
        if quanta > 0:
            committed_action = quanta * self.quantum
            self._accumulated_action -= committed_action
            return MemoryCommitment(quanta, committed_action)
        return None

    @property
    def residual(self) -> float:
        """Return the action still waiting to reach the next quantum."""

        return self._accumulated_action


__all__ = ["LadderDensity", "LadderHolography", "MemoryCommitment"]
