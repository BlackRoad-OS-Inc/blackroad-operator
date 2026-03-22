"""Bell pair demo that produces Bloch and histogram plots."""
from __future__ import annotations

from pathlib import Path

from quantum_lab.core.circuit import Circuit
from quantum_lab.core.states import basis_zero
from quantum_lab.viz.bloch import plot_bloch
from quantum_lab.viz.hist import plot_histogram


def main() -> None:
    """Build and measure a Bell pair."""

    circuit = Circuit(num_qubits=2)
    circuit.add("H", targets=[0])
    circuit.add("CNOT", targets=[0, 1])
    state = circuit.run()
    counts = circuit.measure(state, num_shots=1024)
    plot_histogram(counts, Path("artifacts/bell_hist.png"))
    plot_bloch(basis_zero())
    print("Generated artifacts in artifacts/ directory")


if __name__ == "__main__":
    main()
