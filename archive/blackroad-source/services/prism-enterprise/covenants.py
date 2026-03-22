"""Covenant enforcement utilities."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Iterable


@dataclass(slots=True)
class Covenant:
    name: str
    rules: Dict[str, float] = field(default_factory=dict)

    def enforce(self, metric: str, value: float) -> bool:
        threshold = self.rules.get(metric)
        if threshold is None:
            return True
        return value >= threshold


@dataclass(slots=True)
class CovenantProjector:
    covenant: Covenant

    def project(self, circuit_metrics: Dict[str, float]) -> bool:
        return all(self.covenant.enforce(metric, value) for metric, value in circuit_metrics.items())


__all__ = ["Covenant", "CovenantProjector"]
