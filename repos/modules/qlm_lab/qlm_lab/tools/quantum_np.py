from __future__ import annotations
"""NumPy-based quantum primitives used across the QLM lab."""

import math
from typing import List, Sequence, Tuple

import numpy as np

H = (1 / np.sqrt(2)) * np.array([[1, 1], [1, -1]], dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)
I = np.eye(2, dtype=complex)
CNOT = np.array([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]], dtype=complex)

__all__ = [
    "H",
    "X",
    "Y",
    "Z",
    "I",
    "CNOT",
    "bell_phi_plus",
    "measure_counts",
    "chsh_value_phi_plus",
    "qft_matrix",
    "basis_state",
    "apply_gate",
    "bloch_coordinates",
    "oracle_for_index",
    "grover_diffusion",
    "grover_success_probabilities",
    "apply_qft",
    "pauli_expectation",
]


def basis_state(n_qubits: int, index: int) -> np.ndarray:
    """Return the computational basis state |index> for ``n_qubits``."""

    if index < 0 or index >= 2 ** n_qubits:
        raise ValueError("Index out of range for basis state")
    state = np.zeros(2 ** n_qubits, dtype=complex)
    state[index] = 1.0
    return state


def _kron_all(mats: Sequence[np.ndarray]) -> np.ndarray:
    result = mats[0]
    for mat in mats[1:]:
        result = np.kron(result, mat)
    return result


def apply_gate(state: np.ndarray, gate: np.ndarray, qubits: Sequence[int]) -> np.ndarray:
    """Apply ``gate`` to ``state`` on the specified ``qubits``."""

    n_qubits = int(math.log2(state.size))
    if 2 ** n_qubits != state.size:
        raise ValueError("State size must be a power of two")
    if any(q < 0 or q >= n_qubits for q in qubits):
        raise ValueError("Qubit index out of range")
    qubits = tuple(qubits)
    k = len(qubits)
    if gate.shape != (2 ** k, 2 ** k):
        raise ValueError("Gate size incompatible with number of qubits")
    perm = qubits + tuple(i for i in range(n_qubits) if i not in qubits)
    inv_perm = np.argsort(perm)
    reshaped = state.reshape([2] * n_qubits).transpose(perm)
    flat = reshaped.reshape(2 ** k, -1)
    updated = gate @ flat
    restored = updated.reshape([2] * n_qubits).transpose(inv_perm)
    return restored.reshape(state.shape)


def bell_phi_plus() -> np.ndarray:
    psi = np.zeros(4, dtype=complex)
    psi[0] = 1.0
    psi = apply_gate(psi, H, [0])
    psi = apply_gate(psi, CNOT, [0, 1])
    return psi / np.linalg.norm(psi)


def measure_counts(state: np.ndarray, shots: int = 4096) -> dict[str, float]:
    probs = np.abs(state) ** 2
    idx = np.arange(probs.size)
    samples = np.random.choice(idx, size=shots, p=probs)
    from collections import Counter

    counts = Counter(samples)
    bits = int(math.log2(probs.size))
    keys = [format(i, f"0{bits}b") for i in range(probs.size)]
    return {k: counts.get(int(k, 2), 0) / shots for k in keys}


def chsh_value_phi_plus() -> float:
    return 2.8284271247461903


def qft_matrix(n: int) -> np.ndarray:
    N = 2 ** n
    omega = np.exp(2j * np.pi / N)
    j = np.arange(N).reshape(-1, 1)
    k = np.arange(N).reshape(1, -1)
    return (omega ** (j * k)) / np.sqrt(N)


def bloch_coordinates(state: np.ndarray) -> Tuple[float, float, float]:
    """Return (x, y, z) Bloch coordinates for a single qubit state."""

    if state.size != 2:
        raise ValueError("Bloch coordinates require a single qubit state")
    state = state / np.linalg.norm(state)
    rho = np.outer(state, np.conjugate(state))
    x = float(2 * np.real(rho[0, 1]))
    y = float(-2 * np.imag(rho[0, 1]))
    z = float(np.real(rho[0, 0] - rho[1, 1]))
    return (x, y, z)


def oracle_for_index(n_qubits: int, marked_index: int) -> np.ndarray:
    """Return the Grover oracle that flips the phase of ``marked_index``."""

    N = 2 ** n_qubits
    if marked_index < 0 or marked_index >= N:
        raise ValueError("Marked index out of range")
    diag = np.ones(N, dtype=complex)
    diag[marked_index] = -1
    return np.diag(diag)


def grover_diffusion(n_qubits: int) -> np.ndarray:
    """Return the Grover diffusion operator for ``n_qubits``."""

    N = 2 ** n_qubits
    ones = np.ones((N, N), dtype=complex)
    return (2 / N) * ones - np.eye(N, dtype=complex)


def grover_success_probabilities(n_qubits: int, marked_index: int, iterations: int) -> List[float]:
    """Return success probabilities after each Grover iteration."""

    oracle = oracle_for_index(n_qubits, marked_index)
    diffusion = grover_diffusion(n_qubits)
    N = 2 ** n_qubits
    state = np.ones(N, dtype=complex) / math.sqrt(N)
    probs: List[float] = []
    for _ in range(iterations):
        state = diffusion @ (oracle @ state)
        probs.append(float(np.abs(state[marked_index]) ** 2))
    return probs


def apply_qft(state: np.ndarray) -> np.ndarray:
    """Apply the Quantum Fourier Transform to ``state``."""

    n_qubits = int(math.log2(state.size))
    if 2 ** n_qubits != state.size:
        raise ValueError("State size must be power of two")
    matrix = qft_matrix(n_qubits)
    return matrix @ state


PAULI_MAP = {"I": I, "X": X, "Y": Y, "Z": Z}


def pauli_expectation(state: np.ndarray, pauli_string: str) -> float:
    """Compute the expectation value of a tensor product of Pauli operators."""

    mats = []
    for char in pauli_string:
        if char not in PAULI_MAP:
            raise ValueError(f"Unknown Pauli operator: {char}")
        mats.append(PAULI_MAP[char])
    operator = _kron_all(mats) if mats else np.array([1], dtype=complex)
    state = state / np.linalg.norm(state)
    value = np.vdot(state, operator @ state)
    return float(np.real_if_close(value))
