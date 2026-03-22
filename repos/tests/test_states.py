from __future__ import annotations

import numpy as np

from quantum_lab.core import states


def test_basis_states_normalized() -> None:
    assert np.isclose(np.linalg.norm(states.basis_zero()), 1)
    assert np.isclose(np.linalg.norm(states.basis_one()), 1)


def test_bell_states_orthonormal() -> None:
    psi0 = states.bell_state(0)
    psi1 = states.bell_state(1)
    assert np.isclose(np.vdot(psi0, psi0), 1)
    assert np.isclose(np.vdot(psi0, psi1), 0)
