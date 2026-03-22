"""Fibonacci–Pascal instrument combining combinatorics and golden flows."""

from __future__ import annotations

import math
from typing import List, Tuple

import numpy as np

PHI = (1.0 + math.sqrt(5.0)) / 2.0
F_MATRIX = np.array([[1.0, 1.0], [1.0, 0.0]], dtype=float)


def fib(n: int) -> int:
    """Return the nth Fibonacci number with ``F₀ = 0`` and ``F₁ = 1``.

    Parameters
    ----------
    n:
        Sequence index (dimensionless).

    Returns
    -------
    int
        Dimensionless Fibonacci value.
    """

    if n < 0:
        raise ValueError("n must be non-negative")
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a


def fibs(k: int) -> List[int]:
    """Return the first ``k`` Fibonacci numbers.

    Parameters
    ----------
    k:
        Number of terms requested (dimensionless).
    """

    if k < 0:
        raise ValueError("k must be non-negative")
    seq: List[int] = []
    a, b = 0, 1
    for _ in range(k):
        seq.append(a)
        a, b = b, a + b
    return seq


def pascal_row(n: int) -> List[int]:
    """Return the nth Pascal row (0-indexed).

    Parameters
    ----------
    n:
        Row index (dimensionless).
    """

    if n < 0:
        raise ValueError("n must be non-negative")
    return [math.comb(n, k) for k in range(n + 1)]


def pascal_diagonal_sums(n: int) -> int:
    """Return the shallow diagonal sum equal to ``F_{n+1}``.

    Returns the diagonal sum as a dimensionless integer.
    """

    if n < 0:
        raise ValueError("n must be non-negative")
    total = 0
    for k in range(n + 1):
        total += math.comb(n - k, k)
    return total


def golden_rotation_step(a: float, theta: float, eta: float) -> Tuple[float, float]:
    """Apply a golden-ratio rotation step to ``(a, θ)``.

    Parameters
    ----------
    a:
        Amplitude (dimensionless).
    theta:
        Phase in radians (rad).
    eta:
        Increment magnitude (dimensionless).

    Returns
    -------
    Tuple[float, float]
        Updated amplitude and phase (rad).
    """

    delta_a = eta / PHI
    delta_theta = eta / (PHI**2)
    return a + delta_a, theta + delta_theta


__all__ = [
    "fib",
    "fibs",
    "F_MATRIX",
    "pascal_row",
    "pascal_diagonal_sums",
    "golden_rotation_step",
]
