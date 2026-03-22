"""Utilities for preparing canonical quantum states."""
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Tuple

import numpy as np

StateVector = np.ndarray


@dataclass(frozen=True)
class BasisState:
    """Immutable container describing an n-qubit basis state."""

    ket: Tuple[int, ...]

    def to_vector(self) -> StateVector:
        """Return the computational basis vector for this state."""
        dim = 2 ** len(self.ket)
        index = 0
        for value in self.ket:
            index = (index << 1) | value
        vector = np.zeros((dim,), dtype=complex)
        vector[index] = 1.0 + 0.0j
        return vector


def basis_zero() -> StateVector:
    """Return the |0> single-qubit state."""

    return np.array([1.0, 0.0], dtype=complex)


def basis_one() -> StateVector:
    """Return the |1> single-qubit state."""

    return np.array([0.0, 1.0], dtype=complex)


def plus_state() -> StateVector:
    """Return the |+> state."""

    return (1 / math.sqrt(2)) * np.array([1.0, 1.0], dtype=complex)


def minus_state() -> StateVector:
    """Return the |-> state."""

    return (1 / math.sqrt(2)) * np.array([1.0, -1.0], dtype=complex)


def bell_state(index: int = 0) -> StateVector:
    """Return one of the four Bell states."""

    if index == 0:
        return (1 / math.sqrt(2)) * np.array([1.0, 0.0, 0.0, 1.0], dtype=complex)
    if index == 1:
        return (1 / math.sqrt(2)) * np.array([0.0, 1.0, 1.0, 0.0], dtype=complex)
    if index == 2:
        return (1 / math.sqrt(2)) * np.array([1.0, 0.0, 0.0, -1.0], dtype=complex)
    if index == 3:
        return (1 / math.sqrt(2)) * np.array([0.0, 1.0, -1.0, 0.0], dtype=complex)
    raise ValueError("Bell state index must be 0-3")


def kron(*states: StateVector) -> StateVector:
    """Return the Kronecker product of a sequence of states."""

    result = np.array([1.0 + 0.0j])
    for state in states:
        result = np.kron(result, state)
    return result
