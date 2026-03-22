"""tket integration hooks (optional)."""

from __future__ import annotations

from dataclasses import dataclass

from ..core.circuit import Circuit

try:  # pragma: no cover - optional dependency
    from pytket import Circuit as TKetCircuit
    from pytket.extensions.qiskit import qiskit_to_tk
except Exception:  # pragma: no cover
    TKetCircuit = None  # type: ignore
    qiskit_to_tk = None  # type: ignore


@dataclass(slots=True)
class TKetReport:
    depth: int
    two_qubit_count: int


def tket_compile(circuit: Circuit, backend_name: str | None = None) -> tuple[Circuit, TKetReport]:
    if TKetCircuit is None:  # pragma: no cover
        report = TKetReport(depth=len(circuit.operations), two_qubit_count=_count_two_qubit(circuit))
        return circuit.copy(), report

    tk_circuit = qiskit_to_tk(circuit.to_qiskit())  # pragma: no cover
    depth = tk_circuit.depth()  # pragma: no cover
    two_qubit_count = sum(1 for gate in tk_circuit if gate.op.n_qubits == 2)  # pragma: no cover
    compiled = Circuit.from_qiskit(tk_circuit.to_qiskit())  # pragma: no cover
    return compiled, TKetReport(depth=depth, two_qubit_count=two_qubit_count)


def _count_two_qubit(circuit: Circuit) -> int:
    return sum(1 for op in circuit.operations if len(op.qubits) == 2)


__all__ = ["TKetReport", "tket_compile"]
