"""Reflection utilities for RoadQLM."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List


@dataclass(slots=True)
class ReflectionLog:
    summary: Dict[str, float] = field(default_factory=dict)
    history: List[Dict[str, float]] = field(default_factory=list)

    def update(self, metrics: Dict[str, float]) -> None:
        self.history.append(metrics)
        for key, value in metrics.items():
            self.summary[key] = (self.summary.get(key, 0.0) + value) / 2


__all__ = ["ReflectionLog"]
