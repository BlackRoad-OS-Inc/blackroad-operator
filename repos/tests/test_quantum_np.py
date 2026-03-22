from __future__ import annotations

import pytest
import numpy as np

from qlm_lab.tools import quantum_np


def test_bell_state_properties() -> None:
    state = quantum_np.bell_pair()
    assert np.isclose(np.linalg.norm(state), 1.0)
    s_value = quantum_np.chsh_value(state)
    assert 2.2 < s_value <= 2.9


def test_grover_advantage() -> None:
    metrics = quantum_np.grover_demo_metrics(3, target=5)
    probs = metrics["probabilities"]
    assert all(0 <= p <= 1 for p in probs)
    assert metrics["advantage"] > 3


def test_phase_estimation_accuracy() -> None:
    result = quantum_np.estimate_phase_with_qft(0.25)
    assert result["error"] < 0.1


def test_pauli_expectation() -> None:
    state = quantum_np.bell_pair()
    expect = quantum_np.pauli_expectation(state, "ZZ")
    assert np.isclose(expect, 1.0)


def test_additional_quantum_helpers() -> None:
    quantum_np.set_seed(123)
    state = quantum_np.bell_pair()
    counts = quantum_np.measure_counts(state, shots=512)
    assert sum(counts.values()) == pytest.approx(1.0, abs=1e-3)
    iterations, probs = quantum_np.grover_success_curve(2, target=1)
    assert len(iterations) == len(probs)
    matrix = quantum_np.qft_matrix(2)
    assert matrix.shape == (4, 4)
    vec = quantum_np.grover_initial_state(2)
    transformed = quantum_np.qft(vec)
    restored = quantum_np.iqft(transformed)
    assert np.allclose(vec, restored)
    kick = quantum_np.phase_kickback_state(0.125)
    assert np.isclose(np.linalg.norm(kick), 1.0)
    stats = quantum_np.bell_measurement_statistics(shots=256)
    assert stats

