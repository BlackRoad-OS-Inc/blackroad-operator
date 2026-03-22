"""Optional Qiskit bindings."""
from __future__ import annotations

from typing import Any, Dict

try:  # pragma: no cover - optional dependency
    from qiskit import QuantumCircuit
    from qiskit.quantum_info import Statevector
except Exception:  # pragma: no cover - degrade gracefully
    QuantumCircuit = None  # type: ignore
    Statevector = None  # type: ignore


def bell_state() -> Dict[str, Any]:
    """Return a Bell state using Qiskit when available."""

    if QuantumCircuit is None or Statevector is None:
        return {"available": False}
    circuit = QuantumCircuit(2)
    circuit.h(0)
    circuit.cx(0, 1)
    state = Statevector.from_instruction(circuit)
    return {"available": True, "statevector": state.data}


__all__ = ["bell_state"]
