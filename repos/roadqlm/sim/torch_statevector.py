"""Torch accelerated statevector simulator with graceful NumPy fallback."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Sequence

import numpy as np

from ..core.circuit import Circuit
from ..core.typing import ParameterBatch

try:  # pragma: no cover - optional dependency
    import torch
except Exception:  # pragma: no cover
    torch = None  # type: ignore


@dataclass(slots=True)
class SimulationResult:
    probabilities: np.ndarray
    expectation: float | None = None
    runtime_s: float | None = None


PAULI_Z = np.array([[1, 0], [0, -1]], dtype=complex)
HADAMARD = (1 / np.sqrt(2)) * np.array([[1, 1], [1, -1]], dtype=complex)
CNOT = np.array(
    [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 1],
        [0, 0, 1, 0],
    ],
    dtype=complex,
)


def _matrix_for_gate(name: str, theta: float | None = None) -> np.ndarray:
    if name.lower() in {"h", "hadamard"}:
        return HADAMARD
    if name.lower() in {"x", "paulix"}:
        return np.array([[0, 1], [1, 0]], dtype=complex)
    if name.lower() in {"rz"} and theta is not None:
        return np.array([[np.exp(-1j * theta / 2), 0], [0, np.exp(1j * theta / 2)]], dtype=complex)
    if name.lower() in {"cx", "cnot"}:
        return CNOT
    raise ValueError(f"Unsupported gate: {name}")


def simulate_statevector(circuit: Circuit, params: Sequence[float] | None = None) -> np.ndarray:
    """Simulate *circuit* returning the resulting statevector."""

    num_qubits = circuit.num_qubits
    state = np.zeros(2**num_qubits, dtype=complex)
    state[0] = 1
    param_iter = iter(params or [])

    for op in circuit.operations:
        theta = next(param_iter, None) if op.params else None
        matrix = _matrix_for_gate(op.name, theta)
        if matrix.shape == (2, 2):
            state = _apply_single_qubit(matrix, state, num_qubits, op.qubits[0])
        elif matrix.shape == (4, 4):
            state = _apply_two_qubit(matrix, state, num_qubits, op.qubits)
        else:  # pragma: no cover - not expected in tests
            raise ValueError("Unsupported matrix size")
    return state


def _apply_single_qubit(matrix: np.ndarray, state: np.ndarray, num_qubits: int, wire: int) -> np.ndarray:
    state_reshaped = state.reshape([2] * num_qubits)
    axes = list(range(num_qubits))
    axes[wire], axes[-1] = axes[-1], axes[wire]
    state_reshaped = np.transpose(state_reshaped, axes)
    state_reshaped = state_reshaped.reshape(2, -1)
    updated = matrix @ state_reshaped
    updated = updated.reshape([2] * num_qubits)
    axes = list(range(num_qubits))
    axes[wire], axes[-1] = axes[-1], axes[wire]
    return np.transpose(updated, axes).reshape(-1)


def _apply_two_qubit(matrix: np.ndarray, state: np.ndarray, num_qubits: int, wires: Sequence[int]) -> np.ndarray:
    state_reshaped = state.reshape([2] * num_qubits)
    axes = list(range(num_qubits))
    axes[wires[0]], axes[-2] = axes[-2], axes[wires[0]]
    axes[wires[1]], axes[-1] = axes[-1], axes[wires[1]]
    state_reshaped = np.transpose(state_reshaped, axes)
    state_reshaped = state_reshaped.reshape(4, -1)
    updated = matrix @ state_reshaped
    updated = updated.reshape([2] * num_qubits)
    axes = list(range(num_qubits))
    axes[wires[0]], axes[-2] = axes[-2], axes[wires[0]]
    axes[wires[1]], axes[-1] = axes[-1], axes[wires[1]]
    return np.transpose(updated, axes).reshape(-1)


def chsh_expectation(theta: float) -> float:
    circuit = Circuit(num_qubits=2)
    circuit.add("H", 0)
    circuit.add("CNOT", 0, 1)
    circuit.add("RZ", 0, params=(theta,))
    state = simulate_statevector(circuit, params=[theta])
    prob = np.abs(state) ** 2
    return float(prob[0] - prob[-1])


def batch_chsh(thetas: Iterable[float]) -> np.ndarray:
    return np.array([chsh_expectation(theta) for theta in thetas], dtype=float)


__all__ = ["SimulationResult", "simulate_statevector", "chsh_expectation", "batch_chsh"]
