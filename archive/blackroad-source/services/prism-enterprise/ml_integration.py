"""Hybrid quantum-classical tooling built on top of :mod:`torch`."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Iterable, List, Sequence

import numpy as np

from .quantum_simulator import QISKIT_AVAILABLE, QuantumCircuit

try:  # pragma: no cover - optional dependency import
    import torch
except Exception:  # pragma: no cover - degrade gracefully when torch is missing
    torch = None  # type: ignore[assignment]


@dataclass(frozen=True)
class HamiltonianTerm:
    """Simple Pauli-term Hamiltonian representation."""

    coefficient: float
    pauli_string: str

    def __post_init__(self) -> None:
        object.__setattr__(self, "pauli_string", self.pauli_string.upper())

    def expectation(self, circuit: QuantumCircuit) -> float:
        return self.coefficient * circuit.expectation_value(self.pauli_string)

    def to_qiskit(self):  # pragma: no cover - optional dependency
        if not QISKIT_AVAILABLE:
            raise RuntimeError("Qiskit is required to convert Hamiltonians")
        from qiskit.quantum_info import SparsePauliOp

        return self.coefficient * SparsePauliOp.from_list([(self.pauli_string, 1.0)])


@dataclass(frozen=True)
class VariationalResult:
    """Result container for variational hybrid workflows."""

    optimal_value: float
    optimal_parameters: np.ndarray
    history: List[float]


class TorchVQESolver:
    """Parameter-shift based VQE optimizer orchestrated with PyTorch."""

    def __init__(
        self,
        circuit_builder: Callable[[Sequence[float]], QuantumCircuit],
        hamiltonian: Iterable[HamiltonianTerm],
        learning_rate: float = 0.1,
        max_iterations: int = 200,
        shift: float = np.pi / 2,
    ) -> None:
        if torch is None:  # pragma: no cover - optional dependency
            raise RuntimeError("PyTorch is required for TorchVQESolver")
        self.circuit_builder = circuit_builder
        self.hamiltonian = list(hamiltonian)
        self.learning_rate = learning_rate
        self.max_iterations = max_iterations
        self.shift = shift

    # ------------------------------------------------------------------
    def energy(self, parameters: Sequence[float]) -> float:
        circuit = self.circuit_builder(parameters)
        circuit.simulate()
        return sum(term.expectation(circuit) for term in self.hamiltonian)

    def _parameter_shift_gradient(self, parameters: torch.Tensor) -> torch.Tensor:
        grads: List[float] = []
        base = parameters.detach().clone()
        for idx in range(base.numel()):
            plus = base.clone()
            minus = base.clone()
            plus.view(-1)[idx] += self.shift
            minus.view(-1)[idx] -= self.shift
            grad = 0.5 * (self.energy(plus.numpy()) - self.energy(minus.numpy()))
            grads.append(grad)
        return torch.tensor(grads, dtype=parameters.dtype).reshape_as(parameters)

    def solve(self, initial_parameters: Sequence[float]) -> VariationalResult:
        params = torch.nn.Parameter(torch.tensor(initial_parameters, dtype=torch.float64))
        optimizer = torch.optim.Adam([params], lr=self.learning_rate)
        history: List[float] = []
        best_value = float("inf")
        best_params = params.detach().numpy().copy()
        for _ in range(self.max_iterations):
            optimizer.zero_grad()
            energy_value = self.energy(params.detach().numpy())
            history.append(energy_value)
            grads = self._parameter_shift_gradient(params)
            params.grad = grads
            optimizer.step()
            if energy_value < best_value:
                best_value = energy_value
                best_params = params.detach().numpy().copy()
        if not history:
            best_value = self.energy(params.detach().numpy())
            best_params = params.detach().numpy().copy()
        return VariationalResult(
            optimal_value=best_value,
            optimal_parameters=best_params,
            history=history,
        )


def pauli_terms_from_coefficients(coefficients: Sequence[tuple[str, float]]) -> List[HamiltonianTerm]:
    return [HamiltonianTerm(coefficient=value, pauli_string=pauli) for pauli, value in coefficients]
