"""Linear algebra helpers backed by NumPy."""
from __future__ import annotations

import numpy as np


def vector_norm(vec: np.ndarray) -> float:
    """Return the Euclidean norm of a vector."""

    return float(np.linalg.norm(vec))


def eigenvalues(matrix: np.ndarray) -> np.ndarray:
    """Compute eigenvalues of the given matrix."""

    return np.linalg.eigvals(matrix)


def singular_values(matrix: np.ndarray) -> np.ndarray:
    """Compute singular values of the given matrix."""

    return np.linalg.svd(matrix, compute_uv=False)
