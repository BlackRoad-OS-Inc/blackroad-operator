"""Chebyshev resonance utilities for Amundson VIII."""

from __future__ import annotations

import math

import numpy as np


def _prepare_array(x: float | np.ndarray) -> tuple[np.ndarray, bool]:
    """Coerce ``x`` to an array while recording whether it was scalar."""

    arr = np.asarray(x, dtype=float)
    return arr, np.isscalar(x)


def Tn(n: int, x: float | np.ndarray) -> float | np.ndarray:
    """Evaluate the Chebyshev polynomial of the first kind ``Tₙ(x)``."""

    if n < 0:
        raise ValueError("order must be non-negative")
    x_arr, is_scalar = _prepare_array(x)
    if n == 0:
        result = np.ones_like(x_arr)
    elif n == 1:
        result = x_arr.copy()
    else:
        t0 = np.ones_like(x_arr)
        t1 = x_arr.copy()
        for _ in range(2, n + 1):
            t0, t1 = t1, 2.0 * x_arr * t1 - t0
        result = t1
    if is_scalar:
        return float(np.squeeze(result))
    return result


def Un(n: int, x: float | np.ndarray) -> float | np.ndarray:
    """Evaluate the Chebyshev polynomial of the second kind ``Uₙ(x)``."""

    if n < 0:
        raise ValueError("order must be non-negative")
    x_arr, is_scalar = _prepare_array(x)
    if n == 0:
        result = np.ones_like(x_arr)
    elif n == 1:
        result = 2.0 * x_arr
    else:
        u0 = np.ones_like(x_arr)
        u1 = 2.0 * x_arr
        for _ in range(2, n + 1):
            u0, u1 = u1, 2.0 * x_arr * u1 - u0
        result = u1
    if is_scalar:
        return float(np.squeeze(result))
    return result


def cos_n_theta(theta: float | np.ndarray, n: int) -> float | np.ndarray:
    """Compute ``cos(nθ)`` by evaluating ``Tₙ(cos θ)``."""

    theta_arr, is_scalar = _prepare_array(theta)
    result = Tn(n, np.cos(theta_arr))
    if is_scalar:
        return float(np.squeeze(result))
    return result


def resonance_score(theta: float, n_max: int, *, eps: float = 1e-9) -> dict:
    """Return resonance metrics for harmonics up to ``n_max``.

    Parameters
    ----------
    theta:
        Phase angle in radians (rad).
    n_max:
        Highest harmonic considered.
    eps:
        Regularisation parameter preventing division by zero.

    Returns
    -------
    dict
        Dictionary containing arrays ``n`` (harmonic index), ``p`` (nearest
        numerator), ``approx`` (rational approximation of ``θ/π``), and
        ``score`` (dimensionless resonance score).
    """

    if n_max <= 0:
        raise ValueError("n_max must be positive")
    frac = theta / math.pi
    n_values = np.arange(1, n_max + 1, dtype=int)
    numerators = np.rint(frac * n_values).astype(int)
    ratios = numerators / n_values
    delta = np.abs(frac - ratios)
    scores = 1.0 / (delta + eps)
    return {
        "n": n_values,
        "p": numerators,
        "approx": ratios,
        "score": scores,
    }


__all__ = ["Tn", "Un", "cos_n_theta", "resonance_score"]
