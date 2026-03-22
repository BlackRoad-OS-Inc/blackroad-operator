"""Balanced-ternary to qutrit bridge.

The module provides explicit encodings between the classical balanced-ternary
alphabet ``{-1, 0, +1}`` and the computational qutrit basis.  Logical
operations (TNOT, TAND, TOR) are expressed as completely positive trace
preserving (CPTP) maps with Kraus operators acting on density matrices.  A
"ternary Born rule" is implemented to turn quantum amplitudes into voting
probabilities used by Amundson agents.
"""
from __future__ import annotations

from typing import Dict, Iterable, List, Tuple

import numpy as np

# Canonical ordered alphabet for the balanced ternary digit.
BALANCED_TERNARY = (-1, 0, 1)

# Computational qutrit basis vectors | -1 >, | 0 >, | +1 >.
_QUTRIT_BASIS = {
    -1: np.array([1.0, 0.0, 0.0], dtype=complex),
    0: np.array([0.0, 1.0, 0.0], dtype=complex),
    1: np.array([0.0, 0.0, 1.0], dtype=complex),
}


def encode_symbol(symbol: int) -> np.ndarray:
    """Return the computational qutrit vector for a balanced-ternary symbol."""

    if symbol not in _QUTRIT_BASIS:
        raise ValueError(f"Unsupported balanced-ternary symbol: {symbol}")
    return _QUTRIT_BASIS[symbol]


def ternary_state(symbols: Iterable[int]) -> np.ndarray:
    """Kronecker-encode a sequence of balanced-ternary symbols into a qutrit ket."""

    state = np.array([1.0], dtype=complex)
    for symbol in symbols:
        state = np.kron(state, encode_symbol(symbol))
    return state


def _basis_pair(x: int, y: int) -> np.ndarray:
    """Return the tensor product |x>\otimes|y>."""

    return np.kron(encode_symbol(x), encode_symbol(y))


def ternary_born_rule(state: np.ndarray) -> Dict[int, float]:
    """Return measurement probabilities for the ternary alphabet.

    The state can be either a vector (pure state) or a density matrix.  The
    probabilities correspond to projective measurements onto the computational
    basis.
    """

    if state.ndim == 1:
        probs = np.abs(state) ** 2
    elif state.ndim == 2:
        probs = np.real(np.diag(state))
    else:
        raise ValueError("State must be a ket or density matrix")

    probs = probs / np.sum(probs)
    return {symbol: float(probs[i]) for i, symbol in enumerate(BALANCED_TERNARY)}


def apply_channel(kraus_ops: Iterable[np.ndarray], density: np.ndarray) -> np.ndarray:
    """Apply a CPTP map to a density matrix."""

    result = np.zeros_like(density, dtype=complex)
    for op in kraus_ops:
        result += op @ density @ op.conj().T
    return result


def tnot_kraus() -> List[np.ndarray]:
    """Return Kraus operators implementing the ternary NOT operation.

    The gate acts as: ``-1 <-> +1`` and leaves the ``0`` state unchanged.
    Being a permutation, the map is unitary and therefore represented by a
    single Kraus operator.
    """

    u = np.array(
        [
            [0.0, 0.0, 1.0],
            [0.0, 1.0, 0.0],
            [1.0, 0.0, 0.0],
        ],
        dtype=complex,
    )
    return [u]


def _logic_channel(table: Dict[Tuple[int, int], int]) -> List[np.ndarray]:
    """Construct Kraus operators from a classical balanced-ternary logic table."""

    kraus_ops: List[np.ndarray] = []
    for (x, y), result in table.items():
        out_ket = encode_symbol(result)
        in_ket = _basis_pair(x, y)
        kraus_ops.append(np.outer(out_ket, in_ket.conj()))
    return kraus_ops


def tand_kraus() -> List[np.ndarray]:
    """Kraus representation of balanced-ternary AND (minimum)."""

    table = {(x, y): min(x, y) for x in BALANCED_TERNARY for y in BALANCED_TERNARY}
    return _logic_channel(table)


def tor_kraus() -> List[np.ndarray]:
    """Kraus representation of balanced-ternary OR (maximum)."""

    table = {(x, y): max(x, y) for x in BALANCED_TERNARY for y in BALANCED_TERNARY}
    return _logic_channel(table)


def ternary_vote(state: np.ndarray) -> int:
    """Return the most likely agent vote from a qutrit state."""

    distribution = ternary_born_rule(state)
    return max(distribution.items(), key=lambda item: item[1])[0]


__all__ = [
    "BALANCED_TERNARY",
    "apply_channel",
    "encode_symbol",
    "tand_kraus",
    "ternary_born_rule",
    "ternary_state",
    "ternary_vote",
    "tnot_kraus",
    "tor_kraus",
]
