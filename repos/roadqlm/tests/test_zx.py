from __future__ import annotations

from roadqlm.core.circuit import Circuit
from roadqlm.opt.zx import zx_simplify


def test_zx_identity_without_dependency() -> None:
    circuit = Circuit(num_qubits=1)
    circuit.add("H", 0)
    simplified, proof = zx_simplify(circuit)
    assert simplified.operations == circuit.operations
    assert proof.steps == 0
