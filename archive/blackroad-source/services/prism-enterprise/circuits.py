"""Circuit visualization utilities."""
from __future__ import annotations

import importlib
from pathlib import Path
from typing import Optional

from quantum_lab.core.circuit import Circuit


def ascii_diagram(circuit: Circuit) -> str:
    """Return an ASCII diagram of the NumPy circuit."""

    width = len(circuit.operations) * 4 + 1
    lines = [list("-" * width) for _ in range(circuit.num_qubits)]
    for col, op in enumerate(circuit.operations):
        column_index = col * 4 + 2
        for qubit in range(circuit.num_qubits):
            lines[qubit][column_index] = "|"
        for target in op.targets:
            lines[target][column_index] = op.name.upper()[0]
        if op.control:
            for control in op.control:
                lines[control][column_index] = "o"
    return "\n".join("".join(row) for row in lines)


def draw_qiskit(circuit: Circuit, path: Optional[Path] = None) -> Path:
    """Render the circuit using Qiskit when available."""

    qiskit_module = importlib.import_module("qiskit")
    quantum_circuit_cls = getattr(qiskit_module, "QuantumCircuit")
    qc = quantum_circuit_cls(circuit.num_qubits)
    for op in circuit.operations:
        method = getattr(qc, op.name.lower(), None)
        if method is None:
            raise ValueError(f"Cannot draw gate {op.name} with Qiskit")
        if op.control:
            method(*op.targets, *op.control)
        elif op.params:
            method(*op.params, *op.targets)
        else:
            method(*op.targets)
    output = path or Path("artifacts/circuit.png")
    output.parent.mkdir(parents=True, exist_ok=True)
    qc.draw("mpl").savefig(output)
    return output
