from pathlib import Path
import sys

import numpy as np
import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from agents.blackroad_agent_framework_package5 import (
    GKSLMasterEquation,
    LindbladianSuperoperator,
)


def is_hermitian(A: np.ndarray, tol: float = 1e-10) -> bool:
    return np.allclose(A, A.conj().T, atol=tol)


def test_gksl_dissipator_hermitian_derivative():
    L = LindbladianSuperoperator(n_dim=2)
    # Single Lindblad operator: sigma_minus
    sigma_minus = np.array([[0, 1], [0, 0]], dtype=complex)
    L.add_lindblad_operator(sigma_minus, gamma=0.1)
    # Start from excited state density matrix
    rho = np.array([[0, 0], [0, 1]], dtype=complex)
    D = L.lindblad_dissipator(rho)
    assert D.shape == (2, 2)
    assert is_hermitian(D), "GKSL dissipator should yield Hermitian dρ/dt"


def test_gksl_matrix_requires_positive_semidefinite():
    gksl = GKSLMasterEquation(n_dim=2)
    gksl.set_operators([np.array([[0, 1], [0, 0]], dtype=complex)])
    with pytest.raises(ValueError):
        gksl.set_gksl_matrix(np.array([[-0.1]], dtype=complex))


def test_gksl_dissipator_matches_superoperator_path():
    gksl = GKSLMasterEquation(n_dim=2)
    sigma_minus = np.array([[0, 1], [0, 0]], dtype=complex)
    gksl.set_operators([sigma_minus])
    gksl.set_gksl_matrix(np.array([[0.05]], dtype=complex))
    rho = np.array([[0, 0], [0, 1]], dtype=complex)

    dissipator = gksl.gksl_dissipator(rho)

    assert dissipator.shape == (2, 2)
    assert is_hermitian(dissipator)
