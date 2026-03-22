"""Execution helpers bridging NumPy circuits to Qiskit backends."""
from __future__ import annotations

import importlib
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Optional

from quantum_lab.core.circuit import Circuit
from quantum_lab.viz.hist import plot_histogram

from .provider import get_provider
from .transpile import transpile_circuit


@dataclass
class BackendResult:
    """Result from running a circuit on a backend."""

    counts: Dict[str, int]
    depth: int
    backend_name: str
    queue_position: Optional[int]


def build_qiskit_circuit(circuit: Circuit) -> Any:
    """Convert a NumPy circuit into a Qiskit QuantumCircuit."""

    qiskit_module = importlib.import_module("qiskit")
    quantum_circuit_cls = getattr(qiskit_module, "QuantumCircuit")
    qc = quantum_circuit_cls(circuit.num_qubits, circuit.num_qubits)
    for op in circuit.operations:
        name = op.name.lower()
        if op.control:
            getattr(qc, name)(*op.targets, *op.control)
        elif op.params:
            getattr(qc, name)(*op.params, *op.targets)
        else:
            getattr(qc, name)(*op.targets)
    qc.measure(range(circuit.num_qubits), range(circuit.num_qubits))
    return qc


def run_job(
    circuit: Circuit,
    backend_name: str,
    shots: int = 1024,
    opt_level: int = 1,
    seed: Optional[int] = None,
    artifacts_dir: Path = Path("artifacts"),
) -> BackendResult:
    """Execute the circuit on a chosen backend."""

    qiskit_module = importlib.import_module("qiskit")
    aer = importlib.import_module("qiskit_aer")
    backend = None
    provider = get_provider()
    if provider is not None:
        backend = provider.backend(backend_name)
    else:
        backend = getattr(aer.Aer, "get_backend")(backend_name)
    qc = build_qiskit_circuit(circuit)
    transpiled = transpile_circuit(qc, backend=backend, opt_level=opt_level)
    job = backend.run(transpiled, shots=shots, seed_simulator=seed)
    result = job.result()
    counts = result.get_counts()
    depth = transpiled.depth()
    queue_position = getattr(job, "queue_position", None)
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    plot_histogram({k: v / shots for k, v in counts.items()}, artifacts_dir / "qiskit_hist.png")
    try:
        transpiled.draw("mpl").savefig(artifacts_dir / "qiskit_circuit.png")
    except Exception:  # pragma: no cover - optional
        pass
    return BackendResult(counts=counts, depth=depth, backend_name=backend_name, queue_position=queue_position)
