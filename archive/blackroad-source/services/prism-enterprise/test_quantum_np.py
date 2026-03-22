import math

import numpy as np
import pytest

from qlm_lab.tools import quantum_np as Q


def test_bell_state_is_normalised() -> None:
    psi = Q.bell_phi_plus()
    assert pytest.approx(1.0, rel=1e-12) == float(np.linalg.norm(psi))


def test_chsh_value_in_violation_band() -> None:
    value = Q.chsh_value_phi_plus()
    assert 2.2 < value <= 2.9


def test_qft_unitary_for_two_qubits() -> None:
    matrix = Q.qft_matrix(2)
    identity = matrix.conj().T @ matrix
    assert np.allclose(identity, np.eye(4))


def test_basis_state_and_apply_gate_creates_bell() -> None:
    state = Q.basis_state(2, 0)
    state = Q.apply_gate(state, Q.H, [0])
    state = Q.apply_gate(state, Q.CNOT, [0, 1])
    assert np.allclose(state, Q.bell_phi_plus())


def test_measure_counts_balanced() -> None:
    psi = Q.bell_phi_plus()
    counts = Q.measure_counts(psi, shots=2048)
    assert pytest.approx(0.5, rel=0.2) == counts["00"]
    assert pytest.approx(0.5, rel=0.2) == counts["11"]


def test_pauli_expectation_and_error() -> None:
    psi = Q.bell_phi_plus()
    expectation = Q.pauli_expectation(psi, "ZZ")
    assert expectation == pytest.approx(1.0)
    with pytest.raises(ValueError):
        Q.pauli_expectation(psi, "ZA")


def test_grover_success_probability_increases() -> None:
    probs = Q.grover_success_probabilities(3, 5, 4)
    assert max(probs) > 0.7


def test_oracle_and_diffusion_shapes() -> None:
    oracle = Q.oracle_for_index(2, 1)
    diffusion = Q.grover_diffusion(2)
    assert oracle.shape == (4, 4)
    assert diffusion.shape == (4, 4)


def test_apply_qft_inverse_is_identity() -> None:
    state = np.ones(4, dtype=complex) / 2
    transformed = Q.apply_qft(state)
    restored = Q.qft_matrix(2).conj().T @ transformed
    assert np.allclose(restored, state)


def test_bloch_coordinates_for_basis_state() -> None:
    state = np.array([1, 0], dtype=complex)
    x, y, z = Q.bloch_coordinates(state)
    assert (x, y, z) == pytest.approx((0.0, 0.0, 1.0))


def test_basis_state_invalid_index() -> None:
    with pytest.raises(ValueError):
        Q.basis_state(1, 3)


def test_apply_gate_invalid_inputs() -> None:
    state = Q.basis_state(1, 0)
    with pytest.raises(ValueError):
        Q.apply_gate(state, Q.CNOT, [0])


def test_oracle_out_of_range() -> None:
    with pytest.raises(ValueError):
        Q.oracle_for_index(2, 4)
