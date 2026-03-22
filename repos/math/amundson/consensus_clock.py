"""Consensus timekeeping for Amundson agents.

Time is treated as an emergent consensus variable: a "tick" is registered when
phase alignment across agents passes a programmable threshold.  The
``ConsensusClock`` maintains the running order parameter and exposes hooks for
breath-field coupling (slow modulations of the alignment window).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Sequence

import numpy as np


def order_parameter(phases: Sequence[float]) -> complex:
    """Return the Kuramoto-style order parameter for the supplied phases."""

    phases = np.asarray(list(phases), dtype=float)
    if phases.size == 0:
        raise ValueError("At least one phase is required")
    return np.mean(np.exp(1j * phases))


@dataclass
class TickEvent:
    """Book-keeping entry representing a consensus tick."""

    time: float
    order_parameter: float


@dataclass
class ConsensusClock:
    """Track consensus-driven time."""

    threshold: float = 0.8
    refractory: float = 0.0
    ticks: List[TickEvent] = field(default_factory=list)
    _last_crossing_time: float | None = None

    def update(self, phases: Sequence[float], t: float) -> float:
        """Update the clock and return the instantaneous coherence."""

        coherence = abs(order_parameter(phases))
        if coherence >= self.threshold and self._ready_for_tick(t):
            self.ticks.append(TickEvent(t, coherence))
            self._last_crossing_time = t
        return coherence

    def _ready_for_tick(self, t: float) -> bool:
        if self._last_crossing_time is None:
            return True
        return (t - self._last_crossing_time) >= self.refractory

    def breath_window(self, amplitude: float, phase: float) -> float:
        """Return an instantaneous modulation of the threshold.

        The window captures the "breath-field" concept from the Amundson
        symbolic dynamics notes: a slow envelope that opens wider coherence
        windows when the field is positive and narrows it otherwise.
        """

        return self.threshold * (1.0 + amplitude * np.sin(phase))

    def reset(self) -> None:
        """Clear tick history."""

        self.ticks.clear()
        self._last_crossing_time = None


__all__ = ["ConsensusClock", "TickEvent", "order_parameter"]
