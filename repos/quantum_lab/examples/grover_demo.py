"""Small Grover search demonstration."""
from __future__ import annotations

from pathlib import Path

import numpy as np

from quantum_lab.core.circuit import Circuit, grover_diffusion
from quantum_lab.viz.hist import plot_histogram


def oracle_matrix(num_qubits: int, marked: int) -> np.ndarray:
    """Return an oracle that flips the phase of the marked state."""

    dim = 2 ** num_qubits
    matrix = np.eye(dim, dtype=complex)
    matrix[marked, marked] = -1
    return matrix


def main() -> None:
    """Run Grover iterations on a 2-qubit search problem."""

    num_qubits = 2
    marked_state = 3
    circuit = Circuit(num_qubits)
    for qubit in range(num_qubits):
        circuit.add("H", targets=[qubit])
    state = circuit.run()
    state = oracle_matrix(num_qubits, marked_state) @ state
    state = grover_diffusion(num_qubits) @ state
    probs = np.abs(state) ** 2
    data = {format(index, "02b"): float(prob) for index, prob in enumerate(probs)}
    plot_histogram(data, Path("artifacts/grover_success.png"))
    print("Grover demo complete. Peak probability at state", format(marked_state, "02b"))


if __name__ == "__main__":
    main()
