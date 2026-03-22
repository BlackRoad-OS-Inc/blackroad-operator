"""Tensor network backend autopicker (conceptual placeholder)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Dict

from ..core.circuit import Circuit


@dataclass(slots=True)
class TensorNetworkBackend:
    name: str
    runner: Callable[[Circuit], complex]

    def run(self, circuit: Circuit) -> complex:
        return self.runner(circuit)


class Autopicker:
    """Select between registered tensor-network backends."""

    def __init__(self) -> None:
        self._registry: Dict[str, TensorNetworkBackend] = {}

    def register(self, backend: TensorNetworkBackend) -> None:
        self._registry[backend.name] = backend

    def pick(self, circuit: Circuit) -> TensorNetworkBackend:
        if circuit.num_qubits <= 6 and "exact" in self._registry:
            return self._registry["exact"]
        return next(iter(self._registry.values()))


__all__ = ["Autopicker", "TensorNetworkBackend"]
