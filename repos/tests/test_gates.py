from __future__ import annotations

import numpy as np

from quantum_lab.core import gates


def test_hadamard_unitary() -> None:
    h = gates.hadamard()
    identity = h.conj().T @ h
    assert np.allclose(identity, np.eye(2))


def test_apply_gate_x() -> None:
    state = np.array([1, 0], dtype=complex)
    result = gates.apply_gate(gates.pauli_x(), state, targets=[0])
    assert np.allclose(result, np.array([0, 1]))


def test_apply_cnot() -> None:
    state = np.array([0, 1, 0, 0], dtype=complex)
    result = gates.apply_gate(gates.cnot(), state, targets=[0, 1])
    assert np.allclose(result, np.array([0, 1, 0, 0]))
