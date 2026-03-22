"""Measurement utilities for the NumPy simulator."""
from __future__ import annotations

from typing import Iterable, Optional, Sequence

import numpy as np

StateVector = np.ndarray


def probabilities(state: StateVector) -> np.ndarray:
    """Return measurement probabilities for the full register."""

    return np.abs(state) ** 2


def marginal_probabilities(state: StateVector, qubits: Sequence[int]) -> np.ndarray:
    """Return marginal probabilities for selected qubits."""

    probs = probabilities(state)
    num_qubits = int(np.log2(state.size))
    marginal = np.zeros((2 ** len(qubits),), dtype=float)
    for index, prob in enumerate(probs):
        bits = format(index, f"0{num_qubits}b")
        marginal_index_bits = [bits[q] for q in qubits]
        marginal_index = int("".join(marginal_index_bits), 2)
        marginal[marginal_index] += prob
    return marginal


def expectation(state: StateVector, observable: np.ndarray) -> float:
    """Return the expectation value of an observable."""

    bra = np.conjugate(state)
    value = bra @ observable @ state
    return float(np.real(value))


def sample_counts(
    state: StateVector,
    shots: int = 1024,
    seed: Optional[int] = None,
    qubits: Optional[Iterable[int]] = None,
) -> dict[str, int]:
    """Draw measurement samples from the statevector."""

    rng = np.random.default_rng(seed)
    probs = probabilities(state)
    outcomes = rng.choice(len(probs), size=shots, p=probs)
    counts: dict[str, int] = {}
    num_qubits = int(np.log2(state.size))
    for outcome in outcomes:
        bitstring = format(outcome, f"0{num_qubits}b")
        if qubits is not None:
            bitstring = "".join(bitstring[i] for i in qubits)
        counts[bitstring] = counts.get(bitstring, 0) + 1
    return counts
