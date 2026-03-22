"""QFT phase reasoning demo."""
from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

from ..tools import quantum_np as Q


def main() -> None:
    n_qubits = 3
    N = 2 ** n_qubits
    freq = 3
    amps = np.array([
        np.exp(2j * np.pi * freq * j / N) / np.sqrt(N) for j in range(N)
    ], dtype=complex)
    spectrum = np.abs(Q.apply_qft(amps)) ** 2
    target = (N - freq) % N
    error = float(1.0 - spectrum[target])
    fig = plt.figure()
    ax = fig.add_subplot(111)
    ax.bar(range(N), spectrum, color="#6a4fb3")
    ax.set_xlabel("Frequency")
    ax.set_ylabel("Probability")
    ax.set_title("QFT Spectrum")
    path = Path(__file__).resolve().parents[2] / "artifacts" / "qft_phase.png"
    path.parent.mkdir(exist_ok=True)
    fig.savefig(path, dpi=160, bbox_inches="tight")
    plt.close(fig)
    print(json.dumps({"error": error, "path": str(path)}))


if __name__ == "__main__":
    main()
