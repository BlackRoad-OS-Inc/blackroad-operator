"""Trust scoring primitives."""

from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass(slots=True)
class TrustInputs:
    compliance: float
    transparency: float
    entropy: float


@dataclass(slots=True)
class TrustConfig:
    alpha_compliance: float = 0.8
    alpha_transparency: float = 0.5
    alpha_entropy: float = 0.7


def trust(inputs: TrustInputs, config: TrustConfig | None = None) -> float:
    cfg = config or TrustConfig()
    weighted = (
        cfg.alpha_compliance * inputs.compliance
        + cfg.alpha_transparency * inputs.transparency
        - cfg.alpha_entropy * inputs.entropy
    )
    return 1 / (1 + math.exp(-weighted))


__all__ = ["TrustInputs", "TrustConfig", "trust"]
