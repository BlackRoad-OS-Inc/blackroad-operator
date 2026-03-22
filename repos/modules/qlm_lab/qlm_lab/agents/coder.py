"""Coder agent synthesising small helper utilities."""
from __future__ import annotations

from typing import List

from ..proto import Msg, new
from ..tools import quantum_np as Q
from .base import Agent


class Coder(Agent):
    """Generate code artefacts and quick validations."""

    name = "coder"

    def can_handle(self, m: Msg) -> bool:
        return m.recipient == self.name and m.kind == "task" and m.op == "implement_pauli"

    def handle(self, m: Msg) -> List[Msg]:
        psi = Q.bell_phi_plus()
        expectation = Q.pauli_expectation(psi, "ZZ")
        return [
            new(
                self.name,
                "critic",
                "result",
                "pauli_expectation",
                expectation=expectation,
                target=1.0,
            )
        ]
