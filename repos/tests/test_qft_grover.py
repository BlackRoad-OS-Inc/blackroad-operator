from __future__ import annotations

import numpy as np

from quantum_lab.core.circuit import Circuit, grover_diffusion, qft_matrix


def test_qft_inverse() -> None:
    matrix = qft_matrix(3)
    identity = matrix.conj().T @ matrix
    assert np.allclose(identity, np.eye(8))


def test_grover_diffusion_properties() -> None:
    diff = grover_diffusion(2)
    assert np.allclose(diff.conj().T @ diff, np.eye(4))
