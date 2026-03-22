"""Integration helpers for Qiskit 1.0 V2 primitives."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Iterable, Optional

import numpy as np

from ..core.circuit import Circuit

try:  # pragma: no cover - optional dependency
    from qiskit import QuantumCircuit
    from qiskit.primitives import BaseEstimatorV2, BaseSamplerV2
    from qiskit.qasm3 import dumps as qasm3_dumps
except Exception:  # pragma: no cover
    QuantumCircuit = None  # type: ignore
    BaseEstimatorV2 = None  # type: ignore
    BaseSamplerV2 = None  # type: ignore
    qasm3_dumps = None  # type: ignore


@dataclass(slots=True)
class RunResult:
    expectation: np.ndarray | None = None
    probabilities: np.ndarray | None = None
    metadata: Dict[str, Any] | None = None


def to_qiskit(circuit: Circuit) -> "QuantumCircuit":
    if QuantumCircuit is None:  # pragma: no cover
        raise RuntimeError("qiskit is not installed")
    return circuit.to_qiskit()


def export_oq3(circuit: Circuit) -> str:
    if qasm3_dumps is not None:  # pragma: no cover
        return qasm3_dumps(to_qiskit(circuit))
    return circuit.to_openqasm3()


def ensure_isa(service: Any, backend: Any, circuit: Circuit) -> bool:
    """Trivially ensure the backend can handle the qubit count."""

    if backend is None:
        return False
    max_qubits = getattr(backend, "num_qubits", circuit.num_qubits)
    return circuit.num_qubits <= max_qubits


def run_sampler(
    circuit: Circuit,
    sampler: "BaseSamplerV2" | "BaseEstimatorV2",
    parameter_values: Iterable[Iterable[float]] | None = None,
    shots: int | None = None,
) -> RunResult:
    if BaseSamplerV2 is None or BaseEstimatorV2 is None:  # pragma: no cover
        raise RuntimeError("qiskit primitives are not available")

    qc = to_qiskit(circuit)
    batch = None if parameter_values is None else np.asarray(list(parameter_values), dtype=float)

    if isinstance(sampler, BaseSamplerV2):
        job = sampler.run([qc], parameter_values=batch, shots=shots)
        result = job.result()
        probabilities = np.asarray(result[0].data.meas.get("p", []), dtype=float)
        return RunResult(probabilities=probabilities, metadata=result[0].metadata)

    job = sampler.run([qc], parameter_values=batch)
    result = job.result()
    expectation = np.asarray(result[0].data.evs, dtype=float)
    return RunResult(expectation=expectation, metadata=result[0].metadata)


__all__ = ["RunResult", "to_qiskit", "export_oq3", "ensure_isa", "run_sampler"]
