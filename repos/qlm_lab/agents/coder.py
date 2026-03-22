"""Coder agent that runs unit tests for generated code."""
from __future__ import annotations

from ..proto import Msg, new
from ..tools import tests
from .base import Agent


class Coder(Agent):
    def can_handle(self, message: Msg) -> bool:
        return message.kind == "task" and message.op == "implement"

    def handle(self, message: Msg) -> list[Msg]:
        target = message.args.get("target")
        if target == "pauli_expectation":
            result = tests.run_pytest(["tests/test_quantum_np.py"])
            return [
                new(
                    self.name,
                    "critic",
                    "result",
                    "codegen",
                    target=target,
                    returncode=result.returncode,
                    stdout=result.stdout.decode(),
                    stderr=result.stderr.decode(),
                )
            ]
        return [new(self.name, message.sender, "critique", "unknown_target", target=target)]
