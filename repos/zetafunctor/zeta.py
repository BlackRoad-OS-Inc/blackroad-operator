"""Matrix zeta utilities."""

from __future__ import annotations

from typing import Iterable, List, Tuple

import numpy as np


def spectral_radius(matrix: np.ndarray) -> float:
    """Return the spectral radius of ``matrix``."""

    eigenvalues = np.linalg.eigvals(matrix)
    return float(max(abs(ev) for ev in eigenvalues)) if eigenvalues.size else 0.0


def radius_of_convergence(matrix: np.ndarray) -> float:
    """Return the ``|z|`` radius where ``det(I - zA)`` is guaranteed to converge."""

    rho = spectral_radius(matrix)
    if rho == 0:
        return float("inf")
    return 1.0 / rho


def matrix_zeta(z: complex, matrix: np.ndarray) -> complex:
    """Compute ``1 / det(I - zA)`` for the provided matrix ``A``."""

    identity = np.eye(matrix.shape[0], dtype=complex)
    shifted = identity - z * matrix.astype(complex)
    determinant = np.linalg.det(shifted)
    if determinant == 0:
        raise ZeroDivisionError("det(I - zA) is zero; zeta function has a pole")
    return 1.0 / determinant


def scan_zeta_magnitude(
    matrix: np.ndarray,
    z_values: Iterable[complex],
) -> List[Tuple[complex, float]]:
    """Return ``(z, |zeta(z)|)`` pairs for an iterable of sample points."""

    magnitudes: List[Tuple[complex, float]] = []
    for z in z_values:
        try:
            value = matrix_zeta(z, matrix)
        except ZeroDivisionError:
            magnitude = float("inf")
        else:
            magnitude = abs(value)
        magnitudes.append((z, magnitude))
    return magnitudes
