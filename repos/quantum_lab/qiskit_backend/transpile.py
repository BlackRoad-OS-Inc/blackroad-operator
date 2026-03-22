"""Transpilation helpers for Qiskit backends."""
from __future__ import annotations

import importlib
from typing import Any, Optional


def transpile_circuit(circuit: Any, backend: Optional[Any] = None, opt_level: int = 1) -> Any:
    """Transpile a QuantumCircuit using Qiskit."""

    qiskit_transpile = getattr(importlib.import_module("qiskit"), "transpile")
    basis_gates = ["u3", "cx"]
    return qiskit_transpile(circuit, backend=backend, basis_gates=basis_gates, optimization_level=opt_level)
