"""Curvature-coupled diffusion utilities implementing BR-6 demos."""

from __future__ import annotations

import numpy as np

Array = np.ndarray


def simulate_a_field(
    L: float = 10.0,
    N: int = 512,
    T: float = 5.0,
    dt: float = 2e-3,
    D: float = 0.2,
    Gamma: float = 0.3,
    xi: float = 1.0,
    R_t=lambda _t: 0.0,
) -> tuple[Array, Array]:
    """Integrate a curvature-coupled amplitude field in one dimension."""

    if N <= 2:
        raise ValueError("N must be > 2 for finite-difference stencils")
    if dt <= 0 or T <= 0:
        raise ValueError("Time horizon and step must be positive")

    x = np.linspace(-L / 2, L / 2, N)
    dx = x[1] - x[0]
    a = np.zeros_like(x)
    steps = int(T / dt)
    for s in range(steps):
        lap = (np.roll(a, -1) - 2 * a + np.roll(a, 1)) / (dx * dx)
        S = np.full_like(a, -R_t(s * dt) / xi)
        a = a + dt * (D * lap - Gamma * a + S)
    return x, a


__all__ = ["simulate_a_field"]
