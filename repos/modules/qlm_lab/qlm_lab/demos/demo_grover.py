"""Grover search performance demo."""
from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt

from ..tools import quantum_np as Q


def main() -> None:
    n_qubits = 3
    marked = 5
    iterations = 6
    probs = Q.grover_success_probabilities(n_qubits, marked, iterations)
    baseline = 1 / (2 ** n_qubits)
    advantage = max(probs) / baseline
    fig = plt.figure()
    ax = fig.add_subplot(111)
    ax.plot(range(1, iterations + 1), probs, marker="o", label="Grover")
    ax.axhline(baseline, color="red", linestyle="--", label="Baseline")
    ax.set_xlabel("Iteration")
    ax.set_ylabel("Success probability")
    ax.set_title("Grover advantage")
    ax.legend()
    path = Path(__file__).resolve().parents[2] / "artifacts" / "grover_curve.png"
    path.parent.mkdir(exist_ok=True)
    fig.savefig(path, dpi=160, bbox_inches="tight")
    plt.close(fig)
    print(json.dumps({"advantage": advantage, "path": str(path)}))


if __name__ == "__main__":
    main()
