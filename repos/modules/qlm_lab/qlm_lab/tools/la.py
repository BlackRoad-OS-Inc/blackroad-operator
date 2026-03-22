"""Linear algebra helpers built on NumPy."""
from __future__ import annotations

import numpy as np

__all__ = ["normalize", "project", "fidelity"]


def normalize(vector: np.ndarray) -> np.ndarray:
    """Return a unit-norm copy of ``vector``."""

    norm = np.linalg.norm(vector)
    if norm == 0:
        raise ValueError("Cannot normalise zero vector")
    return vector / norm


def project(vec: np.ndarray, onto: np.ndarray) -> np.ndarray:
    """Project ``vec`` onto ``onto``."""

    onto_norm = normalize(onto)
    coefficient = np.vdot(onto_norm, vec)
    return coefficient * onto_norm


def fidelity(state_a: np.ndarray, state_b: np.ndarray) -> float:
    """Compute the fidelity between two pure states."""

    state_a_n = normalize(state_a)
    state_b_n = normalize(state_b)
    overlap = np.vdot(state_a_n, state_b_n)
    return float(np.abs(overlap) ** 2)
