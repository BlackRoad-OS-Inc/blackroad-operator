"""Grover's search algorithm demo using the local simulator and Qiskit."""

from __future__ import annotations

from typing import Dict

import numpy as np

from ..quantum_simulator import QISKIT_AVAILABLE, QuantumCircuit, get_aer_simulator

TARGET_STATE = "11"


def apply_oracle(circuit: QuantumCircuit) -> None:
    circuit.cnot(0, 1)
    circuit.rz(1, np.pi)
    circuit.cnot(0, 1)


def apply_diffusion(circuit: QuantumCircuit) -> None:
    for qubit in range(circuit.num_qubits):
        circuit.hadamard(qubit)
        circuit.pauli_x(qubit)
    circuit.cnot(0, 1)
    circuit.rz(1, np.pi)
    circuit.cnot(0, 1)
    for qubit in range(circuit.num_qubits):
        circuit.pauli_x(qubit)
        circuit.hadamard(qubit)


def grover_circuit(iterations: int = 1) -> QuantumCircuit:
    circuit = QuantumCircuit(2)
    for qubit in range(2):
        circuit.hadamard(qubit)
    for _ in range(iterations):
        apply_oracle(circuit)
        apply_diffusion(circuit)
    circuit.measure_all()
    return circuit


def run_local(iterations: int = 1) -> Dict[str, float]:
    circuit = grover_circuit(iterations)
    state = circuit.simulate()
    probabilities = np.abs(state) ** 2
    labels = [format(i, "02b") for i in range(probabilities.size)]
    return dict(zip(labels, probabilities))


def run_qiskit(iterations: int = 1, shots: int = 1024) -> Dict[str, int]:  # pragma: no cover - optional dep
    if not QISKIT_AVAILABLE:
        raise RuntimeError("Qiskit is required for backend execution")
    circuit = grover_circuit(iterations)
    backend = get_aer_simulator()
    result = circuit.execute_on_backend(backend=backend, shots=shots, measure=True)
    return result.get_counts()


def main() -> None:
    print(f"Target state: {TARGET_STATE}")
    local = run_local(iterations=1)
    print("Local simulator distribution:")
    for bitstring, probability in sorted(local.items()):
        print(f"  {bitstring}: {probability:.3f}")
    if QISKIT_AVAILABLE:
        counts = run_qiskit(iterations=1)
        print("\nAer simulator sample counts:")
        for bitstring, count in sorted(counts.items()):
            print(f"  {bitstring}: {count}")


if __name__ == "__main__":
    main()
