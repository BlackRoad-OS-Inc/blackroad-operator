"""Noise channels implemented via Kraus operators."""
from __future__ import annotations

from typing import List, Tuple

import numpy as np

StateVector = np.ndarray
NoiseChannel = Tuple[np.ndarray, ...]


def depolarizing_channel(probability: float) -> NoiseChannel:
    """Return the depolarizing noise channel."""

    p = probability
    k0 = np.sqrt(1 - 3 * p / 4) * np.eye(2, dtype=complex)
    k1 = np.sqrt(p / 4) * np.array([[0, 1], [1, 0]], dtype=complex)
    k2 = np.sqrt(p / 4) * np.array([[0, -1j], [1j, 0]], dtype=complex)
    k3 = np.sqrt(p / 4) * np.array([[1, 0], [0, -1]], dtype=complex)
    return (k0, k1, k2, k3)


def dephasing_channel(probability: float) -> NoiseChannel:
    """Return the phase damping channel."""

    p = probability
    k0 = np.array([[1, 0], [0, np.sqrt(1 - p)]], dtype=complex)
    k1 = np.array([[0, 0], [0, np.sqrt(p)]], dtype=complex)
    return (k0, k1)


def amplitude_damping(gamma: float) -> NoiseChannel:
    """Return the amplitude damping channel."""

    k0 = np.array([[1, 0], [0, np.sqrt(1 - gamma)]], dtype=complex)
    k1 = np.array([[0, np.sqrt(gamma)], [0, 0]], dtype=complex)
    return (k0, k1)


def is_cptp(channel: NoiseChannel) -> bool:
    """Check that the channel is completely positive and trace preserving."""

    dim = channel[0].shape[0]
    total = np.zeros((dim, dim), dtype=complex)
    for kraus in channel:
        total += kraus.conj().T @ kraus
    return np.allclose(total, np.eye(dim))


def tensor_channel(channel: NoiseChannel, num_qubits: int) -> NoiseChannel:
    """Extend a single-qubit channel to multiple qubits via tensor products."""

    kraus_ops: List[np.ndarray] = []
    for kraus in channel:
        op = kraus
        for _ in range(num_qubits - 1):
            op = np.kron(op, np.eye(2, dtype=complex))
        kraus_ops.append(op)
    return tuple(kraus_ops)


def apply_kraus_channel(channel: NoiseChannel, state: StateVector) -> StateVector:
    """Apply a Kraus map to a statevector."""

    rho = np.outer(state, np.conjugate(state))
    new_rho = np.zeros_like(rho)
    for kraus in channel:
        new_rho += kraus @ rho @ kraus.conj().T
    evals, evecs = np.linalg.eigh(new_rho)
    idx = np.argmax(evals)
    state = evecs[:, idx]
    return state / np.linalg.norm(state)


def mixed_state(channel: NoiseChannel, state: StateVector) -> np.ndarray:
    """Return the density matrix after applying the noise channel."""

    rho = np.outer(state, np.conjugate(state))
    new_rho = np.zeros_like(rho)
    for kraus in channel:
        new_rho += kraus @ rho @ kraus.conj().T
    return new_rho
