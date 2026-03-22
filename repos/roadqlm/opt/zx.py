"""ZX-calculus simplification with optional PyZX integration."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..core.circuit import Circuit

try:  # pragma: no cover - optional dependency
    import pyzx
except Exception:  # pragma: no cover
    pyzx = None  # type: ignore


@dataclass(slots=True)
class ZXProof:
    description: str
    steps: int


def zx_simplify(circuit: Circuit, level: str = "full_reduce") -> tuple[Circuit, ZXProof]:
    if pyzx is None:
        proof = ZXProof(description="pyzx not installed; circuit unchanged", steps=0)
        return circuit.copy(), proof

    graph = pyzx.circuit_to_graph(circuit.to_qiskit())  # pragma: no cover
    if level == "full_reduce":  # pragma: no cover
        pyzx.full_reduce(graph)
    elif level == "basic":  # pragma: no cover
        pyzx.basic_optimization(graph)
    else:  # pragma: no cover
        raise ValueError(f"Unknown ZX level: {level}")
    simplified = Circuit.from_qiskit(pyzx.graph_to_circuit(graph))  # pragma: no cover
    proof = ZXProof(description=f"ZX {level}", steps=len(graph.gates))
    return simplified, proof


__all__ = ["ZXProof", "zx_simplify"]
