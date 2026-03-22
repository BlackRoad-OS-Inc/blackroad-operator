"""Adapter utilities for PennyLane QNodes."""

from __future__ import annotations

from functools import partial
from typing import Any, Callable, Sequence

import numpy as np

from ..core.circuit import Circuit

try:  # pragma: no cover - optional dependency
    import pennylane as qml
except Exception:  # pragma: no cover
    qml = None  # type: ignore


def _apply_operation(op: Circuit, tape: "qml.tape.QuantumTape") -> None:  # pragma: no cover - requires pennylane
    raise RuntimeError("Operation application should be handled via QNode construction")


def to_qnode(
    circuit: Circuit,
    device: str = "lightning.qubit",
    interface: str = "torch",
    diff_method: str = "adjoint",
) -> Callable[[Sequence[float]], Any]:
    """Convert a :class:`~roadqlm.core.circuit.Circuit` into a PennyLane QNode."""

    if qml is None:  # pragma: no cover
        raise RuntimeError("PennyLane is not installed")

    dev = qml.device(device, wires=circuit.num_qubits, interface=interface)

    @qml.qnode(dev, interface=interface, diff_method=diff_method)
    def qnode(params: Sequence[float]) -> Any:  # pragma: no cover - requires pennylane
        for op in circuit.operations:
            gate = getattr(qml, op.name, None)
            if gate is None:
                raise ValueError(f"Unsupported PennyLane operation: {op.name}")
            gate(*([params[i] for i in range(len(op.params))] if op.params else []), wires=op.qubits)
        measurements = []
        if circuit.measurements:
            for meas in circuit.measurements:
                measurements.append(qml.expval(qml.PauliZ(meas.qubit)))
        else:
            measurements.append(qml.state())
        return measurements if len(measurements) > 1 else measurements[0]

    return qnode


__all__ = ["to_qnode"]
