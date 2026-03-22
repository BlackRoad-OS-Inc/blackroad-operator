"""A lightweight circuit model backed by NumPy statevectors."""
from __future__ import annotations

import math
import os
from dataclasses import dataclass
from typing import List, Optional, Sequence

import numpy as np

from . import gates
from .noise import NoiseChannel, apply_kraus_channel

StateVector = np.ndarray


@dataclass
class GateApplication:
    """Dataclass describing a gate operation."""

    name: str
    targets: Sequence[int]
    params: Optional[Sequence[float]] = None
    control: Optional[Sequence[int]] = None

    def matrix(self) -> np.ndarray:
        """Resolve the gate matrix."""

        if self.name.upper() in gates.NAMED_GATES:
            return gates.NAMED_GATES[self.name.upper()]
        if self.name.upper() == "RX" and self.params:
            return gates.rotation_x(self.params[0])
        if self.name.upper() == "RY" and self.params:
            return gates.rotation_y(self.params[0])
        if self.name.upper() == "RZ" and self.params:
            return gates.rotation_z(self.params[0])
        raise ValueError(f"Unknown gate {self.name}")


class Circuit:
    """Simple statevector circuit."""

    def __init__(self, num_qubits: int) -> None:
        self.num_qubits = num_qubits
        self.operations: List[GateApplication] = []
        seed = int(os.getenv("QLAB_SEED", "0")) or None
        self._rng = np.random.default_rng(seed)

    def add(
        self,
        name: str,
        targets: Sequence[int],
        params: Optional[Sequence[float]] = None,
        control: Optional[Sequence[int]] = None,
    ) -> None:
        """Append an operation to the circuit."""

        if any(t >= self.num_qubits for t in targets):
            raise ValueError("Target index out of range")
        if control and any(c >= self.num_qubits for c in control):
            raise ValueError("Control index out of range")
        self.operations.append(GateApplication(name, tuple(targets), params, tuple(control) if control else None))

    def run(
        self,
        init_state: Optional[StateVector] = None,
        noise: Optional[NoiseChannel] = None,
    ) -> StateVector:
        """Run the circuit and return the final statevector."""

        if init_state is None:
            state = np.zeros((2 ** self.num_qubits,), dtype=complex)
            state[0] = 1.0
        else:
            state = init_state.astype(complex)
        for op in self.operations:
            state = gates.apply_gate(op.matrix(), state, op.targets, op.control)
            if noise is not None:
                state = apply_kraus_channel(noise, state)
        return state

    def measure(self, state: StateVector, num_shots: int = 1024) -> dict[str, float]:
        """Sample measurement outcomes."""

        probs = np.abs(state) ** 2
        outcomes = self._rng.choice(len(probs), size=num_shots, p=probs)
        counts: dict[str, int] = {}
        for outcome in outcomes:
            bitstring = format(outcome, f"0{self.num_qubits}b")
            counts[bitstring] = counts.get(bitstring, 0) + 1
        return {key: value / num_shots for key, value in counts.items()}


def qft_matrix(num_qubits: int) -> np.ndarray:
    """Return the Quantum Fourier Transform matrix."""

    dim = 2 ** num_qubits
    omega = np.exp(2j * np.pi / dim)
    matrix = np.zeros((dim, dim), dtype=complex)
    for row in range(dim):
        for col in range(dim):
            matrix[row, col] = omega ** (row * col)
    return matrix / math.sqrt(dim)


def grover_diffusion(num_qubits: int) -> np.ndarray:
    """Return the Grover diffusion operator."""

    dim = 2 ** num_qubits
    uniform = np.full((dim, dim), 1 / dim, dtype=complex)
    return 2 * uniform - np.eye(dim, dtype=complex)
