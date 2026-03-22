"""Variational Quantum Eigensolver demo for a minimal H2 molecule."""

from __future__ import annotations

from pathlib import Path
from typing import Sequence

import numpy as np

from ..ml_integration import TorchVQESolver, pauli_terms_from_coefficients
from ..quantum_simulator import QISKIT_AVAILABLE, QuantumCircuit

H2_COEFFICIENTS = [
    ("II", -1.052373245772859),
    ("IZ", 0.39793742484318045),
    ("ZI", -0.39793742484318045),
    ("ZZ", -0.01128010425623538),
    ("XX", 0.18093119978423156),
]


def hardware_efficient_ansatz(parameters: Sequence[float]) -> QuantumCircuit:
    circuit = QuantumCircuit(2)
    circuit.hadamard(0)
    circuit.hadamard(1)
    circuit.ry(0, parameters[0])
    circuit.ry(1, parameters[1])
    circuit.cnot(0, 1)
    circuit.ry(0, parameters[2])
    circuit.ry(1, parameters[3])
    circuit.cnot(0, 1)
    return circuit


def main() -> None:
    hamiltonian = pauli_terms_from_coefficients(H2_COEFFICIENTS)
    solver = TorchVQESolver(
        hardware_efficient_ansatz,
        hamiltonian,
        learning_rate=0.15,
        max_iterations=150,
    )
    result = solver.solve([0.0, 0.0, 0.0, 0.0])
    print("Optimal H2 energy:", result.optimal_value)
    print("Parameters:", result.optimal_parameters)
    output = Path("outputs")
    output.mkdir(exist_ok=True)
    np.savetxt(output / "vqe_history.csv", np.array(result.history), delimiter=",")
    if QISKIT_AVAILABLE:
        qc = hardware_efficient_ansatz(result.optimal_parameters)
        print(qc.to_qiskit().draw(output="text"))


if __name__ == "__main__":
    main()
