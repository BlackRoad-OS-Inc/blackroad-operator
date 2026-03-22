from __future__ import annotations

from roadqlm.core.circuit import Circuit


def test_openqasm3_export_contains_operations() -> None:
    circuit = Circuit(num_qubits=1)
    circuit.add("H", 0)
    text = circuit.to_openqasm3()
    assert "OPENQASM 3" in text
    assert "H" in text
