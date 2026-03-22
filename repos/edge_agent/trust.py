"""Trust computation for the edge agent."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from time import monotonic

from .config import EdgeAgentConfig
from .vitals import Vitals

LOGGER = logging.getLogger(__name__)


@dataclass
class TrustResult:
    """Trust result container."""

    trust: float
    should_emit: bool


class TrustCalculator:
    """Combine vitals into a trust score."""

    def __init__(self, config: EdgeAgentConfig) -> None:
        self._config = config
        self._weights = config.vital_weights

    def compute(self, vitals: Vitals) -> float:
        weighted = (
            vitals.confidence * self._weights.confidence
            + vitals.transparency * self._weights.transparency
            + vitals.stability * self._weights.stability
        )
        LOGGER.debug("Trust weighted sum=%s", weighted)
        return float(max(0.0, min(1.0, weighted)))


class EmitGate:
    """Determine if the agent should emit based on trust and rate limits."""

    def __init__(self, threshold: float, interval_seconds: float) -> None:
        self.threshold = threshold
        self.interval_seconds = interval_seconds
        self._last_emit_time: float | None = None

    def evaluate(self, trust: float) -> TrustResult:
        now = monotonic()
        meets_threshold = trust >= self.threshold
        time_ok = (
            self._last_emit_time is None
            or (now - self._last_emit_time) >= self.interval_seconds
        )
        should_emit = meets_threshold and time_ok
        if should_emit:
            self._last_emit_time = now
        LOGGER.debug(
            "Emit gate evaluation trust=%s meets_threshold=%s time_ok=%s should_emit=%s",
            trust,
            meets_threshold,
            time_ok,
            should_emit,
        )
        return TrustResult(trust=trust, should_emit=should_emit)

    def reset(self) -> None:
        self._last_emit_time = None
