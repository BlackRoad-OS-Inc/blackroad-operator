"""NumPy-based quantum utilities for the QLM lab."""
from __future__ import annotations

from typing import Dict, List, Tuple

import os
import numpy as np


_rng = np.random.default_rng()


def set_seed(seed: int | None) -> None:
    """Seed the RNG used by the module."""

    global _rng
    if seed is None:
        _rng = np.random.default_rng()
    else:
        _rng = np.random.default_rng(seed)


H = (1 / np.sqrt(2)) * np.array([[1, 1], [1, -1]], dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
Z = np.array([[1, 0], [0, -1]], dtype=complex)
Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
I2 = np.eye(2, dtype=complex)

PAULI = {
    "I": I2,
    "X": X,
    "Y": Y,
    "Z": Z,
}


def kron(*matrices: np.ndarray) -> np.ndarray:
    """Kronecker product of all matrices in order."""

    result = np.array([[1]], dtype=complex)
    for matrix in matrices:
        result = np.kron(result, matrix)
    return result


def bell_pair() -> np.ndarray:
    """Return the |Φ⁺⟩ Bell state."""

    state = np.zeros(4, dtype=complex)
    state[0] = 1 / np.sqrt(2)
    state[3] = 1 / np.sqrt(2)
    return state


def measure_counts(state: np.ndarray, shots: int = 4096) -> Dict[str, float]:
    """Sample measurement outcomes and return normalised counts."""

    probabilities = np.abs(state) ** 2
    num_qubits = int(np.log2(len(state)))
    outcomes = [format(i, f"0{num_qubits}b") for i in range(len(state))]
    draws = _rng.choice(len(state), size=shots, p=probabilities)
    counts: Dict[str, int] = {outcome: 0 for outcome in outcomes}
    for draw in draws:
        counts[outcomes[draw]] += 1
    return {outcome: count / shots for outcome, count in counts.items() if count}


def expectation(state: np.ndarray, operator: np.ndarray) -> float:
    """Compute ⟨ψ|O|ψ⟩ for a given operator."""

    bra = np.conjugate(state)
    value = float(np.real(bra @ (operator @ state)))
    return value


def pauli_expectation(state: np.ndarray, pauli_string: str) -> float:
    """Compute ⟨state|P|state⟩ for a tensor product of Pauli operators."""

    operators = [PAULI[p] for p in pauli_string]
    operator = kron(*operators)
    return expectation(state, operator)


def chsh_value(state: np.ndarray) -> float:
    """Return the CHSH S-value for the standard measurement settings."""

    a0 = Z
    a1 = X
    b0 = (Z + X) / np.sqrt(2)
    b1 = (Z - X) / np.sqrt(2)
    operators = {
        "a0b0": kron(a0, b0),
        "a0b1": kron(a0, b1),
        "a1b0": kron(a1, b0),
        "a1b1": kron(a1, b1),
    }
    correlations = {key: expectation(state, op) for key, op in operators.items()}
    return correlations["a0b0"] + correlations["a0b1"] + correlations["a1b0"] - correlations["a1b1"]


def grover_oracle(n: int, target: int) -> np.ndarray:
    size = 2 ** n
    oracle = np.eye(size, dtype=complex)
    oracle[target, target] = -1
    return oracle


def diffusion_operator(n: int) -> np.ndarray:
    size = 2 ** n
    uniform = np.full((size, size), 1 / size, dtype=complex)
    return 2 * uniform - np.eye(size, dtype=complex)


def grover_initial_state(n: int) -> np.ndarray:
    size = 2 ** n
    return np.full(size, 1 / np.sqrt(size), dtype=complex)


def apply_grover(n: int, target: int, iterations: int) -> np.ndarray:
    oracle = grover_oracle(n, target)
    diffusion = diffusion_operator(n)
    state = grover_initial_state(n)
    for _ in range(iterations):
        state = oracle @ state
        state = diffusion @ state
    return state


def grover_success_curve(n: int, target: int) -> Tuple[List[int], List[float]]:
    size = 2 ** n
    max_iterations = max(1, int(np.floor(np.pi / 4 * np.sqrt(size))))
    iterations: List[int] = list(range(max_iterations + 1))
    probs: List[float] = []
    for k in iterations:
        state = apply_grover(n, target, k)
        probability = float(np.abs(state[target]) ** 2)
        probs.append(probability)
    return iterations, probs


def brute_force_success(n: int) -> float:
    return 1 / (2 ** n)


def qft_matrix(n: int) -> np.ndarray:
    size = 2 ** n
    indices = np.arange(size)
    roots = np.exp(2j * np.pi / size)
    omega = roots ** np.outer(indices, indices)
    return omega / np.sqrt(size)


def qft(state: np.ndarray) -> np.ndarray:
    n = int(np.log2(len(state)))
    return qft_matrix(n) @ state


def iqft(state: np.ndarray) -> np.ndarray:
    n = int(np.log2(len(state)))
    return np.conjugate(qft_matrix(n).T) @ state


def phase_kickback_state(phase: float, noise: float = 0.0, precision_bits: int = 4) -> np.ndarray:
    size = 2 ** precision_bits
    indices = np.arange(size)
    state = np.exp(2j * np.pi * phase * indices).astype(complex)
    state /= np.sqrt(size)
    if noise:
        state = state + noise * _rng.normal(size=state.shape)
        state /= np.linalg.norm(state)
    return state


def estimate_phase_with_qft(phase: float, noise: float = 0.0, precision_bits: int = 4) -> Dict[str, float]:
    state = phase_kickback_state(phase, noise, precision_bits=precision_bits)
    transformed = iqft(state)
    probabilities = np.abs(transformed) ** 2
    most_likely = int(np.argmax(probabilities))
    recovered = most_likely / (2 ** precision_bits)
    raw_error = abs(recovered - phase)
    error = min(raw_error, 1 - raw_error)
    return {"phase": phase, "recovered": recovered, "error": error}


def bell_measurement_statistics(shots: int = 2048) -> Dict[str, float]:
    state = bell_pair()
    return measure_counts(state, shots=shots)


def grover_demo_metrics(n: int, target: int) -> Dict[str, float | List[float] | List[int]]:
    iterations, probs = grover_success_curve(n, target)
    brute = brute_force_success(n)
    best = max(probs)
    return {
        "iterations": iterations,
        "probabilities": probs,
        "brute_force": brute,
        "advantage": best / brute,
    }

seed_env = os.getenv('QLAB_SEED')
if seed_env is not None:
    set_seed(int(seed_env))
