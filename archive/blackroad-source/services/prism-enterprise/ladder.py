"""Quadratic ladder invariants for Amundson VII."""

from __future__ import annotations

import math
from typing import List, Sequence, Tuple

import numpy as np

_LADDER_ANGLES: Tuple[float, ...] = (
    0.0,
    math.pi / 6,
    math.pi / 4,
    math.pi / 3,
    math.pi / 2,
)


def sin2_ladder() -> List[float]:
    """Return sin² ladder values for canonical special angles.

    The returned values are dimensionless and correspond to
    :math:`\theta \in \{0, \pi/6, \pi/4, \pi/3, \pi/2\}` measured in radians.
    """

    return [math.sin(theta) ** 2 for theta in _LADDER_ANGLES]


def special_angles() -> List[Tuple[float, float, float]]:
    """Return ``(sin, cos, tan)`` tuples for the ladder angles.

    Each tuple contains dimensionless trigonometric values evaluated in radians.
    ``tan`` is reported as ``inf`` when :math:`\cos\theta` vanishes.
    """

    triples: List[Tuple[float, float, float]] = []
    for theta in _LADDER_ANGLES:
        sin_theta = math.sin(theta)
        cos_theta = math.cos(theta)
        tan_theta = math.tan(theta) if abs(cos_theta) > 1e-15 else float("inf")
        triples.append((sin_theta, cos_theta, tan_theta))
    return triples


def ladder_identity_residuals(angles: Sequence[float] | None = None) -> np.ndarray:
    """Compute residuals of ``sin²θ - (1 - cos 2θ)/2`` for supplied angles.

    Parameters
    ----------
    angles:
        Iterable of angles in radians. Defaults to the canonical ladder.

    Returns
    -------
    np.ndarray
        Residuals in dimensionless units.
    """

    if angles is None:
        angles = _LADDER_ANGLES
    return np.array(
        [math.sin(theta) ** 2 - 0.5 * (1.0 - math.cos(2.0 * theta)) for theta in angles],
        dtype=float,
    )


def verify_ladder_identity(*, tol: float = 1e-12, angles: Sequence[float] | None = None) -> bool:
    """Return ``True`` when the quadratic identity holds within ``tol``.

    Parameters
    ----------
    tol:
        Absolute tolerance for the identity residuals (dimensionless).
    angles:
        Optional override for the angles tested (radians).
    """

    residuals = ladder_identity_residuals(angles)
    return bool(np.all(np.abs(residuals) <= tol))


__all__ = [
    "sin2_ladder",
    "special_angles",
    "ladder_identity_residuals",
    "verify_ladder_identity",
]
