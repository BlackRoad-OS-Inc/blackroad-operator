"""Core circuit representation for RoadQLM."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Iterable, List, Sequence

import numpy as np

from .typing import ArrayLike, ParameterBatch

try:  # pragma: no cover - optional dependency
    from qiskit import QuantumCircuit
    from qiskit.circuit import QuantumRegister
except Exception:  # pragma: no cover
    QuantumCircuit = None  # type: ignore
    QuantumRegister = None  # type: ignore


@dataclass(slots=True)
class Operation:
    """Represents a quantum operation."""

    name: str
    qubits: tuple[int, ...]
    params: tuple[float, ...] = ()
    condition: tuple[int, int] | None = None

    def to_qiskit(self, circuit: "QuantumCircuit") -> None:
        if QuantumCircuit is None:  # pragma: no cover - dependency not installed
            raise RuntimeError("qiskit is not available")
        gate = getattr(circuit, self.name, None)
        if callable(gate):
            if self.params:
                gate(*self.params, *self.qubits)
            else:
                gate(*self.qubits)
        else:
            circuit.append(self._as_instruction(), [circuit.qubits[q] for q in self.qubits])

    def _as_instruction(self):  # pragma: no cover - relies on qiskit
        from qiskit.circuit.library import UGate

        if len(self.params) == 3 and self.name.lower() == "u3":
            return UGate(*self.params)
        from qiskit.circuit import Gate

        return Gate(self.name, len(self.qubits), list(self.params))


@dataclass(slots=True)
class Measurement:
    qubit: int
    cbit: int


@dataclass(slots=True)
class Circuit:
    """Minimal circuit container with export utilities."""

    num_qubits: int
    operations: List[Operation] = field(default_factory=list)
    measurements: List[Measurement] = field(default_factory=list)

    def add(self, name: str, *qubits: int, params: Sequence[float] | None = None) -> "Circuit":
        params_tuple: tuple[float, ...]
        if params is None:
            params_tuple = ()
        else:
            params_tuple = tuple(float(p) for p in params)
        self.operations.append(Operation(name=name, qubits=tuple(qubits), params=params_tuple))
        return self

    def measure(self, qubit: int, cbit: int) -> "Circuit":
        self.measurements.append(Measurement(qubit=qubit, cbit=cbit))
        return self

    def vectorize(self, params: ArrayLike | Sequence[ArrayLike]) -> ParameterBatch:
        if isinstance(params, np.ndarray):
            values = params
        else:
            values = np.asarray(list(params), dtype=float)
        if values.ndim == 1:
            values = values.reshape(1, -1)
        return ParameterBatch(values=values)

    # --- Export utilities -------------------------------------------------

    def to_openqasm3(self) -> str:
        lines = ["OPENQASM 3;", f"qubit[{self.num_qubits}] q;"]
        for op in self.operations:
            params = "" if not op.params else "(" + ",".join(f"{p:.10f}" for p in op.params) + ")"
            qubits = ",".join(f"q[{q}]" for q in op.qubits)
            lines.append(f"{op.name}{params} {qubits};")
        for meas in self.measurements:
            lines.append(f"bit c{meas.cbit};")
            lines.append(f"c{meas.cbit} = measure q[{meas.qubit}];")
        return "\n".join(lines)

    def to_qiskit(self) -> "QuantumCircuit":
        if QuantumCircuit is None:  # pragma: no cover
            raise RuntimeError("qiskit is not installed")
        circuit = QuantumCircuit(self.num_qubits, len(self.measurements))
        for op in self.operations:
            circuit.append(op._as_instruction(), [circuit.qubits[i] for i in op.qubits])
        for meas in self.measurements:
            circuit.measure(meas.qubit, meas.cbit)
        return circuit

    @classmethod
    def from_qiskit(cls, circuit: "QuantumCircuit") -> "Circuit":  # pragma: no cover - requires qiskit
        num_qubits = circuit.num_qubits
        ops: list[Operation] = []
        measurements: list[Measurement] = []
        for inst, qargs, cargs in circuit.data:
            name = inst.name
            params = tuple(float(x) for x in inst.params)
            qubit_indices = tuple(circuit.find_bit(q).index for q in qargs)
            if name == "measure":
                measurements.append(Measurement(qubit=qubit_indices[0], cbit=circuit.find_bit(cargs[0]).index))
                continue
            ops.append(Operation(name=name, qubits=qubit_indices, params=params))
        return cls(num_qubits=num_qubits, operations=ops, measurements=measurements)

    def copy(self) -> "Circuit":
        return Circuit(
            num_qubits=self.num_qubits,
            operations=list(self.operations),
            measurements=list(self.measurements),
        )


__all__ = ["Circuit", "Measurement", "Operation"]
