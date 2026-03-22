"""Renormalisation group estimators for the spiral parameters."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Tuple

import numpy as np


@dataclass
class SpiralRGFlow:
    """Estimated beta functions for ``a`` (dilation) and ``omega`` (rotation)."""

    beta_a: float
    beta_omega: float

    def flow_step(self, a: float, omega: float, scale: float) -> Tuple[float, float]:
        """Evolve the parameters by a single logarithmic scale step."""

        return a + self.beta_a * scale, omega + self.beta_omega * scale


def _linear_beta(log_scales: np.ndarray, values: np.ndarray) -> float:
    """Fit ``beta`` using a least-squares slope on log-scale data."""

    coeffs = np.polyfit(log_scales, values, deg=1)
    return float(coeffs[0])


def estimate_flow(scales: Iterable[float], a_samples: Iterable[float], omega_samples: Iterable[float]) -> SpiralRGFlow:
    """Estimate beta functions from simulation samples."""

    log_scales = np.log(np.asarray(list(scales), dtype=float))
    a_samples = np.asarray(list(a_samples), dtype=float)
    omega_samples = np.asarray(list(omega_samples), dtype=float)

    if log_scales.size < 2:
        raise ValueError("At least two scale samples are required")

    beta_a = _linear_beta(log_scales, a_samples)
    beta_omega = _linear_beta(log_scales, omega_samples)
    return SpiralRGFlow(beta_a, beta_omega)


__all__ = ["SpiralRGFlow", "estimate_flow"]
