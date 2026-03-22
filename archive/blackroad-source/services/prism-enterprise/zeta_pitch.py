"""Critical-line sampling helpers for the zeta spiral geometry."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, List, Optional, Sequence, Tuple
import cmath
import math

try:  # pragma: no cover - optional dependency
    import mpmath
except ImportError:  # pragma: no cover - defer error until runtime
    mpmath = None  # type: ignore

__all__ = ["ZetaPitchSample", "sample_zeta_pitch"]

CriticalEvaluator = Callable[[complex], complex]


@dataclass(frozen=True)
class ZetaPitchSample:
    """Numerical snapshot of :math:`\zeta(\tfrac12 + it)` along the critical line."""

    t: float
    value: complex
    log_magnitude: float
    argument: float
    rho_derivative: Optional[float]
    theta_derivative: Optional[float]

    @property
    def pitch(self) -> Optional[float]:
        """Return the spiral pitch ratio ``d log|zeta| / d arg zeta`` when defined."""

        if self.rho_derivative is None or self.theta_derivative is None:
            return None
        if abs(self.theta_derivative) < 1e-12:
            return None
        return self.rho_derivative / self.theta_derivative


def _unwrap_angle(angle: float, reference: float) -> float:
    delta = angle - reference
    while delta > math.pi:
        angle -= 2 * math.pi
        delta = angle - reference
    while delta < -math.pi:
        angle += 2 * math.pi
        delta = angle - reference
    return angle


def _compute_phases(values: Sequence[complex]) -> List[float]:
    phases: List[float] = []
    prev: Optional[float] = None
    for value in values:
        magnitude = abs(value)
        if magnitude == 0.0:
            if prev is None:
                phases.append(0.0)
            else:
                phases.append(prev)
            continue
        angle = cmath.phase(value)
        if prev is None:
            phases.append(angle)
            prev = angle
        else:
            unwrapped = _unwrap_angle(angle, prev)
            phases.append(unwrapped)
            prev = unwrapped
    return phases


def _finite_difference(values: Sequence[float], ts: Sequence[float]) -> List[Optional[float]]:
    n = len(values)
    derivatives: List[Optional[float]] = [None] * n
    if n == 0:
        return derivatives
    for idx in range(n):
        current = values[idx]
        if not math.isfinite(current):
            continue
        if n == 1:
            derivatives[idx] = None
            continue
        if idx == 0:
            neighbour = values[1]
            if not math.isfinite(neighbour):
                continue
            dt = ts[1] - ts[0]
            derivatives[idx] = (neighbour - current) / dt
        elif idx == n - 1:
            neighbour = values[n - 2]
            if not math.isfinite(neighbour):
                continue
            dt = ts[n - 1] - ts[n - 2]
            derivatives[idx] = (current - neighbour) / dt
        else:
            prev = values[idx - 1]
            nxt = values[idx + 1]
            if not (math.isfinite(prev) and math.isfinite(nxt)):
                continue
            dt = ts[idx + 1] - ts[idx - 1]
            derivatives[idx] = (nxt - prev) / dt
    return derivatives


def sample_zeta_pitch(
    ts: Sequence[float],
    *,
    evaluator: Optional[CriticalEvaluator] = None,
    dps: int = 50,
) -> Tuple[ZetaPitchSample, ...]:
    """Sample the zeta function on the critical line and estimate the spiral pitch."""

    if not ts:
        return tuple()
    if any(b <= a for a, b in zip(ts, ts[1:])):
        raise ValueError("t values must be provided in strictly increasing order")

    if evaluator is None:
        if mpmath is None:
            raise RuntimeError("mpmath is required unless a custom evaluator is supplied")
        mp_ctx = mpmath.mp
        old_dps = mp_ctx.dps
        mp_ctx.dps = max(old_dps, dps)
        try:
            values: List[complex] = [complex(mpmath.zeta(mpmath.mpc(0.5, t))) for t in ts]
        finally:
            mp_ctx.dps = old_dps
    else:
        values = [complex(evaluator(0.5 + 1j * t)) for t in ts]

    log_magnitudes: List[float] = []
    for value in values:
        magnitude = abs(value)
        if magnitude == 0.0:
            log_magnitudes.append(float("-inf"))
        else:
            log_magnitudes.append(math.log(magnitude))

    phases = _compute_phases(values)
    rho_derivatives = _finite_difference(log_magnitudes, ts)
    theta_derivatives = _finite_difference(phases, ts)

    samples: List[ZetaPitchSample] = []
    for idx, t in enumerate(ts):
        samples.append(
            ZetaPitchSample(
                t=float(t),
                value=values[idx],
                log_magnitude=log_magnitudes[idx],
                argument=phases[idx],
                rho_derivative=rho_derivatives[idx],
                theta_derivative=theta_derivatives[idx],
            )
        )
    return tuple(samples)
