"""Lightweight quantum circuit simulator with optional Qiskit integration."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Mapping, Optional, Tuple

import numpy as np

try:  # pragma: no cover - import guard
    from qiskit import QuantumCircuit as QiskitCircuit
    from qiskit import transpile
    from qiskit.providers.backend import Backend
    from qiskit_aer import Aer

    QISKIT_AVAILABLE = True
except Exception:  # pragma: no cover - graceful fallback
    QiskitCircuit = None  # type: ignore[assignment]
    Backend = object  # type: ignore[misc,assignment]
    Aer = None  # type: ignore[assignment]
    transpile = None  # type: ignore[assignment]
    QISKIT_AVAILABLE = False


_I2 = np.eye(2, dtype=np.complex128)
_SIGMA_X = np.array([[0.0, 1.0], [1.0, 0.0]], dtype=np.complex128)
_SIGMA_Y = np.array([[0.0, -1.0j], [1.0j, 0.0]], dtype=np.complex128)
_SIGMA_Z = np.array([[1.0, 0.0], [0.0, -1.0]], dtype=np.complex128)
_HADAMARD = (1 / np.sqrt(2.0)) * np.array([[1.0, 1.0], [1.0, -1.0]], dtype=np.complex128)
_CNOT = np.array(
    [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 0.0],
    ],
    dtype=np.complex128,
)


@dataclass(frozen=True)
class GateOperation:
    """Representation of a gate application for simulation and export."""

    name: str
    targets: Tuple[int, ...]
    parameters: Tuple[float, ...] = ()


class QuantumCircuit:
    """Small educational circuit simulator with NumPy and Qiskit backends."""

    def __init__(self, num_qubits: int):
        if num_qubits <= 0:
            raise ValueError("QuantumCircuit requires at least one qubit")
        self.num_qubits = num_qubits
        self._operations: List[GateOperation] = []
        self._measure_all = False
        self._dirty = False
        self.reset()

    # ------------------------------------------------------------------
    # gate creation helpers
    def reset(self) -> None:
        """Reset recorded operations and the state vector to |0..0>."""

        self._state = np.zeros(2**self.num_qubits, dtype=np.complex128)
        self._state[0] = 1.0
        self._operations.clear()
        self._measure_all = False
        self._dirty = False

    def copy(self) -> "QuantumCircuit":
        clone = QuantumCircuit(self.num_qubits)
        clone._operations = list(self._operations)
        clone._measure_all = self._measure_all
        clone._state = self._state.copy()
        clone._dirty = self._dirty
        return clone

    # ------------------------------------------------------------------
    # public gate API
    def hadamard(self, qubit: int) -> None:
        self._append_gate("h", (qubit,))

    def pauli_x(self, qubit: int) -> None:
        self._append_gate("x", (qubit,))

    def pauli_y(self, qubit: int) -> None:
        self._append_gate("y", (qubit,))

    def pauli_z(self, qubit: int) -> None:
        self._append_gate("z", (qubit,))

    def phase(self, qubit: int, theta: float) -> None:
        self._append_gate("phase", (qubit,), (theta,))

    def rx(self, qubit: int, theta: float) -> None:
        self._append_gate("rx", (qubit,), (theta,))

    def ry(self, qubit: int, theta: float) -> None:
        self._append_gate("ry", (qubit,), (theta,))

    def rz(self, qubit: int, theta: float) -> None:
        self._append_gate("rz", (qubit,), (theta,))

    def cnot(self, control: int, target: int) -> None:
        self._append_gate("cnot", (control, target))

    def measure_all(self) -> None:
        """Record a full measurement for Qiskit export."""

        self._measure_all = True

    # ------------------------------------------------------------------
    # simulation utilities
    def simulate(self) -> np.ndarray:
        """Simulate the recorded circuit locally with NumPy."""

        state = np.zeros_like(self._state)
        state[0] = 1.0
        for gate in self._operations:
            state = self._apply_gate_to_state(state, gate)
        self._state = state
        self._dirty = False
        return self._state.copy()

    def state(self) -> np.ndarray:
        """Return the most recent simulated state (calling :meth:`simulate` if needed)."""

        if self._dirty:
            return self.simulate()
        return self._state.copy()

    def probabilities(self) -> np.ndarray:
        state = self.state()
        return np.abs(state) ** 2

    def sample_counts(self, shots: int = 1024, seed: Optional[int] = None) -> Dict[str, int]:
        if shots <= 0:
            raise ValueError("shots must be positive")
        rng = np.random.default_rng(seed)
        probs = self.probabilities()
        outcomes = rng.choice(len(probs), size=shots, p=probs)
        counts: Dict[str, int] = {}
        for outcome in outcomes:
            bitstring = format(outcome, f"0{self.num_qubits}b")
            counts[bitstring] = counts.get(bitstring, 0) + 1
        return counts

    def expectation_value(self, pauli_string: str) -> float:
        if len(pauli_string) != self.num_qubits:
            raise ValueError("Pauli string must match qubit count")
        state = self.state()
        operator = _tensor_pauli(pauli_string)
        return float(np.real(np.vdot(state, operator @ state)))

    # ------------------------------------------------------------------
    # Qiskit integration
    def to_qiskit(self, measure: Optional[bool] = None) -> "QiskitCircuit":
        if not QISKIT_AVAILABLE:  # pragma: no cover - depends on optional dep
            raise RuntimeError("Qiskit is not installed. Install qiskit to export circuits.")
        qc = QiskitCircuit(self.num_qubits, self.num_qubits if (measure or self._measure_all) else 0)
        for gate in self._operations:
            if gate.name == "h":
                qc.h(gate.targets[0])
            elif gate.name == "x":
                qc.x(gate.targets[0])
            elif gate.name == "y":
                qc.y(gate.targets[0])
            elif gate.name == "z":
                qc.z(gate.targets[0])
            elif gate.name == "phase":
                qc.p(gate.parameters[0], gate.targets[0])
            elif gate.name == "rx":
                qc.rx(gate.parameters[0], gate.targets[0])
            elif gate.name == "ry":
                qc.ry(gate.parameters[0], gate.targets[0])
            elif gate.name == "rz":
                qc.rz(gate.parameters[0], gate.targets[0])
            elif gate.name == "cnot":
                qc.cx(gate.targets[0], gate.targets[1])
            else:  # pragma: no cover - defensive
                raise ValueError(f"Unsupported gate for Qiskit export: {gate.name}")
        if measure or self._measure_all:
            qc.measure_all()
        return qc

    def transpile_for_backend(
        self,
        backend: "Backend",
        measure: Optional[bool] = None,
        **transpile_options: object,
    ):
        if not QISKIT_AVAILABLE or transpile is None:  # pragma: no cover - optional dep
            raise RuntimeError("Qiskit transpiler not available")
        circuit = self.to_qiskit(measure=measure)
        return transpile(circuit, backend=backend, **transpile_options)

    def execute_on_backend(
        self,
        backend: "Backend" | None = None,
        shots: int = 1024,
        measure: Optional[bool] = None,
        **run_options: object,
    ):
        if not QISKIT_AVAILABLE:  # pragma: no cover - optional dep
            raise RuntimeError("Qiskit is not installed. Install qiskit to run on backends.")
        resolved_backend = backend or get_aer_simulator()
        compiled = self.transpile_for_backend(resolved_backend, measure=measure)
        job = resolved_backend.run(compiled, shots=shots, **run_options)
        return job.result()

    # ------------------------------------------------------------------
    # internal helpers
    def _append_gate(self, name: str, targets: Tuple[int, ...], parameters: Tuple[float, ...] = ()) -> None:
        self._validate_targets(targets)
        self._operations.append(GateOperation(name=name, targets=targets, parameters=parameters))
        self._dirty = True

    def _validate_targets(self, targets: Tuple[int, ...]) -> None:
        for target in targets:
            if not 0 <= target < self.num_qubits:
                raise ValueError(f"Qubit index {target} is out of range for {self.num_qubits} qubits")
        if len(set(targets)) != len(targets):
            raise ValueError("Repeated qubit targets are not supported")

    def _apply_gate_to_state(self, state: np.ndarray, gate: GateOperation) -> np.ndarray:
        matrix = _matrix_for_gate(gate)
        return _apply_unitary(state, matrix, gate.targets, self.num_qubits)


def get_aer_simulator():
    """Return the default Aer simulator backend if available."""

    if not QISKIT_AVAILABLE:  # pragma: no cover - optional dep
        raise RuntimeError("Qiskit is not installed. Install qiskit-aer to access simulators.")
    if Aer is None:  # pragma: no cover - optional dep
        from qiskit import Aer as legacy_aer  # type: ignore

        return legacy_aer.get_backend("aer_simulator")
    return Aer.get_backend("aer_simulator")


def _matrix_for_gate(gate: GateOperation) -> np.ndarray:
    if gate.name == "h":
        return _HADAMARD
    if gate.name == "x":
        return _SIGMA_X
    if gate.name == "y":
        return _SIGMA_Y
    if gate.name == "z":
        return _SIGMA_Z
    if gate.name == "phase":
        theta = gate.parameters[0]
        return np.array([[1.0, 0.0], [0.0, np.exp(1j * theta)]], dtype=np.complex128)
    if gate.name == "rx":
        theta = gate.parameters[0]
        return np.cos(theta / 2.0) * _I2 - 1j * np.sin(theta / 2.0) * _SIGMA_X
    if gate.name == "ry":
        theta = gate.parameters[0]
        return np.cos(theta / 2.0) * _I2 - 1j * np.sin(theta / 2.0) * _SIGMA_Y
    if gate.name == "rz":
        theta = gate.parameters[0]
        return np.cos(theta / 2.0) * _I2 - 1j * np.sin(theta / 2.0) * _SIGMA_Z
    if gate.name == "cnot":
        return _CNOT
    raise ValueError(f"Unknown gate: {gate.name}")


def _apply_unitary(state: np.ndarray, matrix: np.ndarray, targets: Tuple[int, ...], num_qubits: int) -> np.ndarray:
    targets = tuple(targets)
    num_targets = len(targets)
    if num_targets == 0:
        return state
    reshaped = state.reshape([2] * num_qubits)
    perm = [idx for idx in range(num_qubits) if idx not in targets] + list(targets)
    transposed = np.transpose(reshaped, perm)
    leading = 2 ** (num_qubits - num_targets)
    trailing = transposed.reshape(leading, 2**num_targets)
    updated = trailing @ matrix.T
    updated = updated.reshape([2] * num_qubits)
    inverse = np.argsort(perm)
    final_state = np.transpose(updated, inverse)
    return final_state.reshape(-1)


def _tensor_pauli(pauli_string: str) -> np.ndarray:
    pauli_map: Mapping[str, np.ndarray] = {
        "I": _I2,
        "X": _SIGMA_X,
        "Y": _SIGMA_Y,
        "Z": _SIGMA_Z,
    }
    operators = [pauli_map[char] for char in pauli_string.upper()]
    result = operators[0]
    for op in operators[1:]:
        result = np.kron(result, op)
    return result
