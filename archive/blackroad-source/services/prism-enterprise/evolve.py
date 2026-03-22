"""Simple evolution primitive."""

from __future__ import annotations

import numpy as np

from .love import DEFAULT_WEIGHTS


def evolve(hessian: np.ndarray, loss: np.ndarray, projector: np.ndarray, state: np.ndarray, dt: float) -> np.ndarray:
    """Perform a simple gradient-like evolution step."""

    weights = np.array([DEFAULT_WEIGHTS.user, DEFAULT_WEIGHTS.team, DEFAULT_WEIGHTS.world])
    direction = projector @ loss
    update = direction * weights[: direction.shape[0]]
    next_state = state - dt * (hessian @ update)
    norm = np.linalg.norm(next_state)
    if norm == 0:
        return next_state
    return next_state / norm


__all__ = ["evolve"]
