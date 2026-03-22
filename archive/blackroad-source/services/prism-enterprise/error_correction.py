"""Elementary quantum error-correction helpers (bit-flip code)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Mapping, Sequence

import numpy as np

from .quantum_simulator import QuantumCircuit

BIT_FLIP_SYNDROMES: Mapping[int | None, Sequence[str]] = {
    None: ("000", "111"),
    0: ("100", "011"),
    1: ("010", "101"),
    2: ("001", "110"),
}


def _bitstring_probabilities(probabilities: np.ndarray) -> Dict[str, float]:
    width = int(np.log2(probabilities.size))
    return {format(index, f"0{width}b"): float(prob) for index, prob in enumerate(probabilities)}


def infer_bit_flip(probabilities: np.ndarray) -> int | None:
    distribution = _bitstring_probabilities(probabilities)
    best_label = None
    best_value = -1.0
    for qubit, patterns in BIT_FLIP_SYNDROMES.items():
        value = sum(distribution.get(pattern, 0.0) for pattern in patterns)
        if value > best_value:
            best_value = value
            best_label = qubit
    return best_label


@dataclass
class BitFlipResult:
    """Summary of bit-flip error diagnosis."""

    inferred_error: int | None
    distribution: Dict[str, float]


class BitFlipCode:
    """Utility class that wires a three-qubit bit-flip encoding."""

    def prepare(self, theta: float = 0.0, phi: float = 0.0) -> QuantumCircuit:
        circuit = QuantumCircuit(3)
        if theta:
            circuit.ry(0, theta)
        if phi:
            circuit.rz(0, phi)
        circuit.cnot(0, 1)
        circuit.cnot(0, 2)
        return circuit

    def introduce_error(self, circuit: QuantumCircuit, qubit: int) -> None:
        circuit.pauli_x(qubit)

    def diagnose(self, circuit: QuantumCircuit) -> BitFlipResult:
        probabilities = circuit.probabilities()
        inferred = infer_bit_flip(probabilities)
        return BitFlipResult(inferred_error=inferred, distribution=_bitstring_probabilities(probabilities))

    def correct(self, circuit: QuantumCircuit) -> int | None:
        result = self.diagnose(circuit)
        if result.inferred_error is not None:
            circuit.pauli_x(result.inferred_error)
            circuit.simulate()
        return result.inferred_error

    def decode(self, circuit: QuantumCircuit) -> None:
        circuit.cnot(0, 2)
        circuit.cnot(0, 1)


__all__ = ["BitFlipCode", "BitFlipResult", "infer_bit_flip", "BIT_FLIP_SYNDROMES"]
