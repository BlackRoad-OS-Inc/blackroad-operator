"""Illustrate the Quantum Fourier Transform."""
from __future__ import annotations

import numpy as np

from quantum_lab.core.circuit import qft_matrix


def main() -> None:
    """Compute and verify the QFT matrix."""

    matrix = qft_matrix(2)
    identity = matrix.conj().T @ matrix
    assert np.allclose(identity, np.eye(4))
    print("QFT matrix verified to be unitary.")


if __name__ == "__main__":
    main()
