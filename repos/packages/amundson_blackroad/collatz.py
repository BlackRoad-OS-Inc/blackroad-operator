"""Collatz flow instrument (BR-8) with energetic accounting."""

from __future__ import annotations

import math
from collections import defaultdict
from typing import Dict, Mapping, Tuple

from .resolution import K_BOLTZMANN


def next_collatz(n: int) -> int:
    """Return the next Collatz iterate for ``n ≥ 1``.

    Parameters
    ----------
    n:
        Positive integer input on :math:`\mathbb{N}`.

    Returns
    -------
    int
        Next Collatz iterate on :math:`\mathbb{N}`.
    """

    if n < 1:
        raise ValueError("Collatz sequence defined for n ≥ 1")
    return n // 2 if n % 2 == 0 else 3 * n + 1


def collatz_walk(n: int, limit: int) -> Tuple[list[int], int]:
    """Return the Collatz trajectory and irreversible step count.

    Parameters
    ----------
    n:
        Positive integer initial state.
    limit:
        Maximum number of transitions evaluated.

    Returns
    -------
    list[int], int
        Sequence of visited states and the number of irreversible steps.
    """

    if limit <= 0:
        raise ValueError("limit must be positive")
    if n < 1:
        raise ValueError("Collatz sequence defined for n ≥ 1")

    path = [n]
    current = n
    for _ in range(limit):
        if current == 1:
            break
        current = next_collatz(current)
        path.append(current)
    return path, len(path) - 1


def collatz_landauer_cost(n: int, temperature_K: float, *, limit: int = 256) -> float:
    """Compute the minimal irreversible energy for ``n`` at ``temperature_K``.

    Energy is reported in joules (J) assuming one bit erased per transition.
    """

    _, steps = collatz_walk(n, limit)
    return K_BOLTZMANN * temperature_K * math.log(2.0) * steps


def collatz_pushforward(
    distribution: Mapping[int, float],
    steps: int,
    *,
    temperature_K: float = 300.0,
) -> Tuple[Dict[int, float], float]:
    """Propagate a discrete mass distribution through Collatz dynamics.

    Parameters
    ----------
    distribution:
        Mapping of positive integers to non-negative mass (dimensionless).
    steps:
        Number of Collatz transitions to apply.
    temperature_K:
        Bath temperature in kelvin (K).

    Returns
    -------
    Tuple[Dict[int, float], float]
        Updated distribution and cumulative Landauer energy in joules (J).
    """

    if steps < 0:
        raise ValueError("steps must be non-negative")
    current = defaultdict(float)
    for state, mass in distribution.items():
        if state < 1:
            raise ValueError("states must be positive integers")
        if mass == 0:
            continue
        current[int(state)] += float(mass)

    total_energy = 0.0
    for _ in range(steps):
        next_dist = defaultdict(float)
        for state, mass in current.items():
            target = next_collatz(state)
            next_dist[target] += mass
            total_energy += mass * K_BOLTZMANN * temperature_K * math.log(2.0)
        current = next_dist

    return dict(sorted(current.items())), total_energy


__all__ = [
    "next_collatz",
    "collatz_walk",
    "collatz_landauer_cost",
    "collatz_pushforward",
]
