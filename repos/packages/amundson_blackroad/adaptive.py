"""Adaptive gain dynamics for Amundson V."""

from __future__ import annotations

from typing import Tuple

import numpy as np


def _sigmoid(x: float) -> float:
    """Numerically stable logistic function."""

    return float(1.0 / (1.0 + np.exp(-x)))


def gains_step(
    lambda_: float,
    eta: float,
    e: float,
    tau: float,
    alpha: float,
    beta: float,
) -> Tuple[float, float]:
    """Perform a single adaptive gain update."""

    lam_star = _sigmoid(e)
    eta_star = _sigmoid(tau)
    dlam = alpha * (lam_star - lambda_)
    deta = beta * (eta_star - eta)
    return lambda_ + dlam, eta + deta


def simulate_am5(
    T: float,
    dt: float,
    lambda0: float,
    eta0: float,
    e_series: np.ndarray,
    tau_series: np.ndarray,
    alpha: float = 0.2,
    beta: float = 0.2,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Integrate the Amundson V gain dynamics.

    Parameters
    ----------
    T, dt:
        Duration and integration step.
    lambda0, eta0:
        Initial coupling and damping gains.
    e_series, tau_series:
        Evidence and trust samples aligned with the simulation grid.
    alpha, beta:
        Adaptation rates for the coupling and damping gains.
    """

    n = int(np.ceil(T / dt)) + 1
    t = np.linspace(0.0, dt * (n - 1), n)
    lam = np.empty(n, dtype=float)
    eta = np.empty(n, dtype=float)
    lam[0], eta[0] = float(lambda0), float(eta0)
    for i in range(1, n):
        lam[i], eta[i] = gains_step(
            lam[i - 1],
            eta[i - 1],
            float(e_series[i - 1]),
            float(tau_series[i - 1]),
            alpha,
            beta,
        )
        lam[i] = float(np.clip(lam[i], 0.0, 1.0))
        eta[i] = float(np.clip(eta[i], 0.0, 1.0))
    return t, lam, eta


__all__ = ["gains_step", "simulate_am5"]
