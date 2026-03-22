"""CUSUM monitoring agent for detecting small persistent shifts in model metrics.

This module exposes two primary classes:

* :class:`CUSUMDetector` implements the cumulative sum (CUSUM) statistic for a
  single stream using the standard two-sided tabular algorithm.
* :class:`CUSUMMonitorAgent` orchestrates a collection of detectors keyed by
  model identifier (usually a combination of model and version) and emits
  structured playbook recommendations when a detector crosses its alarm
  threshold.

The implementation is intentionally lightweight so it can operate in request
loops, batch pipelines, or as part of a broader observability workflow.  The
agent keeps the most recent alarm events in memory so that downstream systems
can poll or subscribe without needing direct access to the running detector
state.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
import logging
from typing import Dict, Iterable, List, Optional, Tuple


LOGGER = logging.getLogger(__name__)


@dataclass
class CUSUMResult:
    """Encapsulates the outcome of a single CUSUM update."""

    upward_score: float
    downward_score: float
    up_alarm: bool
    down_alarm: bool

    @property
    def alarm_direction(self) -> Optional[str]:
        """Return ``"up"`` or ``"down"`` when an alarm is raised."""

        if self.up_alarm and not self.down_alarm:
            return "up"
        if self.down_alarm and not self.up_alarm:
            return "down"
        if self.up_alarm and self.down_alarm:
            return "both"
        return None

    @property
    def triggered(self) -> bool:
        """Whether any alarm fired during the update."""

        return self.up_alarm or self.down_alarm


@dataclass
class CUSUMDetector:
    """Stateful two-sided CUSUM detector.

    Parameters mirror the standard tabular CUSUM configuration described in
    classical statistical process control literature.  The detector maintains
    the upward and downward cumulative sums and resets them when an alarm is
    triggered to avoid cascaded alerts.
    """

    mu: float
    sigma: float
    k: float
    h: float
    cpos: float = field(default=0.0)
    cneg: float = field(default=0.0)

    def update(self, observation: float) -> CUSUMResult:
        """Update the detector with a new observation and return the result."""

        if self.sigma <= 0:
            raise ValueError("sigma must be positive for CUSUM updates")

        normalized = (observation - self.mu) / self.sigma
        next_cpos = max(0.0, self.cpos + (normalized - self.k))
        next_cneg = max(0.0, self.cneg + (-normalized - self.k))

        up_alarm = next_cpos >= self.h
        down_alarm = next_cneg >= self.h
        result = CUSUMResult(
            upward_score=next_cpos,
            downward_score=next_cneg,
            up_alarm=up_alarm,
            down_alarm=down_alarm,
        )

        if result.triggered:
            # Reset after the alarm to avoid cascaded triggers for the same shift.
            self.cpos = 0.0
            self.cneg = 0.0
        else:
            self.cpos = next_cpos
            self.cneg = next_cneg

        return result

    def describe(self) -> Dict[str, float]:
        """Return a serializable snapshot of the detector state."""

        return {
            "mu": self.mu,
            "sigma": self.sigma,
            "k": self.k,
            "h": self.h,
            "cpos": self.cpos,
            "cneg": self.cneg,
        }


class CUSUMMonitorAgent:
    """Monitor metric streams with per-model CUSUM detectors.

    The agent keeps detectors in a dictionary keyed by model identifier
    (``"model:version"`` or any string).  Each call to :meth:`update` returns a
    structured alarm payload when the detector crosses its decision interval.
    """

    def __init__(
        self,
        baselines: Dict[str, Tuple[float, float]],
        k: float = 0.5,
        h: float = 4.0,
        logger: Optional[logging.Logger] = None,
    ) -> None:
        if not baselines:
            raise ValueError("CUSUMMonitorAgent requires at least one baseline")

        self.logger = logger or LOGGER
        self.detectors: Dict[str, CUSUMDetector] = {
            key: CUSUMDetector(mu=mu, sigma=sigma, k=k, h=h)
            for key, (mu, sigma) in baselines.items()
        }
        self.recent_events: List[Dict[str, object]] = []
        self.default_k = k
        self.default_h = h

    def register_baseline(
        self, model_key: str, mu: float, sigma: float, *, k: Optional[float] = None, h: Optional[float] = None
    ) -> None:
        """Add or replace a detector for ``model_key``."""

        self.detectors[model_key] = CUSUMDetector(
            mu=mu,
            sigma=sigma,
            k=k if k is not None else self.default_k,
            h=h if h is not None else self.default_h,
        )
        self.logger.debug("Registered baseline for %s", model_key)

    def update(
        self,
        model_key: str,
        observation: float,
        *,
        timestamp: Optional[datetime] = None,
    ) -> Optional[Dict[str, object]]:
        """Ingest an observation and return a playbook payload when triggered."""

        if model_key not in self.detectors:
            raise KeyError(f"Unknown model key '{model_key}'")

        detector = self.detectors[model_key]
        result = detector.update(observation)

        self.logger.debug(
            "CUSUM update for %s: observation=%s, result=%s",
            model_key,
            observation,
            result,
        )

        if not result.triggered:
            return None

        event_timestamp = timestamp or datetime.utcnow()
        direction = result.alarm_direction or "unknown"
        playbook = self._stage_shift_playbook(direction)
        event = {
            "model_key": model_key,
            "timestamp": event_timestamp.isoformat(),
            "direction": direction,
            "upward_score": result.upward_score,
            "downward_score": result.downward_score,
            "playbook": playbook,
        }
        self.recent_events.append(event)
        self.logger.info("CUSUM alarm for %s: %s", model_key, event)
        return event

    def _stage_shift_playbook(self, direction: str) -> List[Dict[str, object]]:
        """Return recommended steps after an alarm."""

        traffic_direction = "reduce" if direction == "up" else "increase"
        traffic_summary = (
            "Stage a 5-10% traffic shift toward a safer variant" if direction in {"up", "down"} else "Stage a small traffic shift"
        )
        return [
            {
                "action": "traffic_shift",
                "summary": traffic_summary,
                "direction": traffic_direction,
                "fraction": 0.1,
            },
            {
                "action": "diagnostic_ab",
                "summary": "Run a focused A/B diagnostic window to isolate the drift",
                "duration_minutes": 15,
            },
            {
                "action": "decision_gate",
                "summary": "Roll forward or back based on diagnostic evidence",
            },
        ]

    def iter_state(self) -> Iterable[Tuple[str, Dict[str, float]]]:
        """Yield current detector states for external inspection."""

        for key, detector in self.detectors.items():
            yield key, detector.describe()

    def last_events(self, limit: int = 10) -> List[Dict[str, object]]:
        """Return the most recent alarm events (default last 10)."""

        if limit <= 0:
            return []
        return self.recent_events[-limit:]


__all__ = ["CUSUMDetector", "CUSUMMonitorAgent", "CUSUMResult"]
