from __future__ import annotations

import numpy as np

from quantum_lab.core.circuit import Circuit


def test_bell_circuit() -> None:
    circuit = Circuit(2)
    circuit.add("H", [0])
    circuit.add("CNOT", [0, 1])
    state = circuit.run()
    expected = (1 / np.sqrt(2)) * np.array([1, 0, 0, 1], dtype=complex)
    assert np.allclose(state, expected)


def test_measure_distribution() -> None:
    circuit = Circuit(1)
    circuit.add("H", [0])
    state = circuit.run()
    counts = circuit.measure(state, num_shots=2000)
    assert all(0 <= prob <= 1 for prob in counts.values())
    assert abs(sum(counts.values()) - 1) < 0.1
