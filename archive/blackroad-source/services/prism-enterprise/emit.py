"""Emit gate implementation."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict

from .covenants import CovenantProjector
from .trust import trust, TrustConfig, TrustInputs


@dataclass(slots=True)
class EmitLog:
    accepted: bool
    payload: Any | None
    trust_score: float
    threshold: float
    metadata: Dict[str, Any] = field(default_factory=dict)


def emit(payload: Any, projector: CovenantProjector, trust_inputs: TrustInputs, threshold: float = 0.62) -> EmitLog:
    score = trust(trust_inputs, TrustConfig())
    allowed = score >= threshold
    if allowed and not projector.project({"compliance": trust_inputs.compliance}):
        allowed = False
    result = payload if allowed else None
    return EmitLog(accepted=allowed, payload=result, trust_score=score, threshold=threshold)


__all__ = ["EmitLog", "emit"]
