"""Quantum gates implemented with NumPy."""
from __future__ import annotations

import math
from typing import Dict, Iterable, List, Optional, Sequence

import numpy as np

StateVector = np.ndarray


def pauli_x() -> np.ndarray:
    """Return the Pauli-X matrix."""

    return np.array([[0, 1], [1, 0]], dtype=complex)


def pauli_y() -> np.ndarray:
    """Return the Pauli-Y matrix."""

    return np.array([[0, -1j], [1j, 0]], dtype=complex)


def pauli_z() -> np.ndarray:
    """Return the Pauli-Z matrix."""

    return np.array([[1, 0], [0, -1]], dtype=complex)


def hadamard() -> np.ndarray:
    """Return the Hadamard matrix."""

    return (1 / math.sqrt(2)) * np.array([[1, 1], [1, -1]], dtype=complex)


def phase_s() -> np.ndarray:
    """Return the phase (S) gate."""

    return np.array([[1, 0], [0, 1j]], dtype=complex)


def t_gate() -> np.ndarray:
    """Return the T gate."""

    return np.array([[1, 0], [0, math.e ** (1j * math.pi / 4)]], dtype=complex)


def rotation_x(theta: float) -> np.ndarray:
    """Rotation around the X axis."""

    return np.array(
        [
            [math.cos(theta / 2), -1j * math.sin(theta / 2)],
            [-1j * math.sin(theta / 2), math.cos(theta / 2)],
        ],
        dtype=complex,
    )


def rotation_y(theta: float) -> np.ndarray:
    """Rotation around the Y axis."""

    return np.array(
        [
            [math.cos(theta / 2), -math.sin(theta / 2)],
            [math.sin(theta / 2), math.cos(theta / 2)],
        ],
        dtype=complex,
    )


def rotation_z(theta: float) -> np.ndarray:
    """Rotation around the Z axis."""

    return np.array(
        [
            [math.e ** (-0.5j * theta), 0],
            [0, math.e ** (0.5j * theta)],
        ],
        dtype=complex,
    )


def cnot() -> np.ndarray:
    """Return the controlled-NOT gate."""

    return np.array(
        [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 1],
            [0, 0, 1, 0],
        ],
        dtype=complex,
    )


def swap() -> np.ndarray:
    """Return the SWAP gate."""

    return np.array(
        [
            [1, 0, 0, 0],
            [0, 0, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 1],
        ],
        dtype=complex,
    )


NAMED_GATES: Dict[str, np.ndarray] = {
    "X": pauli_x(),
    "Y": pauli_y(),
    "Z": pauli_z(),
    "H": hadamard(),
    "S": phase_s(),
    "T": t_gate(),
    "CNOT": cnot(),
    "SWAP": swap(),
}


def apply_gate(
    gate: np.ndarray,
    state: StateVector,
    targets: Sequence[int],
    control: Optional[Iterable[int]] = None,
) -> StateVector:
    """Apply a gate to a statevector."""

    num_qubits = int(round(math.log2(state.size)))
    full_matrix = _expand_gate(gate, num_qubits, targets, control)
    return full_matrix @ state


def _expand_gate(
    gate: np.ndarray,
    num_qubits: int,
    targets: Sequence[int],
    control: Optional[Iterable[int]],
) -> np.ndarray:
    """Construct the full matrix for a gate acting on a subset of qubits."""

    control_set = set(control or [])
    dim = 2 ** num_qubits
    full = np.zeros((dim, dim), dtype=complex)
    for basis_index in range(dim):
        basis_vec = np.zeros((dim,), dtype=complex)
        basis_vec[basis_index] = 1.0
        bits = _index_to_bits(basis_index, num_qubits)
        if control_set and not control_set.issubset({i for i, bit in enumerate(bits) if bit == 1}):
            full[:, basis_index] = basis_vec
            continue
        target_bits = [bits[i] for i in targets]
        target_index = _bits_to_int(target_bits)
        for output_index, amplitude in enumerate(gate[:, target_index]):
            new_bits = bits.copy()
            output_bits = _index_to_bits(output_index, len(targets))
            for local, qubit in enumerate(targets):
                new_bits[qubit] = output_bits[local]
            new_index = _bits_to_int(new_bits)
            full[new_index, basis_index] = amplitude
    return full


def _index_to_bits(index: int, num_qubits: int) -> List[int]:
    return [int(bool((index >> (num_qubits - 1 - i)) & 1)) for i in range(num_qubits)]


def _bits_to_int(bits: Sequence[int]) -> int:
    value = 0
    for bit in bits:
        value = (value << 1) | int(bit)
    return value
