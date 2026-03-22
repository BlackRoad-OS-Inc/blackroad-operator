"""Quantum Math Lab package with simulation, visualization, and ML utilities."""

from .quantum_simulator import QuantumCircuit, QISKIT_AVAILABLE, get_aer_simulator
from .ml_integration import HamiltonianTerm, TorchVQESolver, VariationalResult
from .error_correction import BitFlipCode, BitFlipResult, infer_bit_flip

__all__ = [
    "QuantumCircuit",
    "QISKIT_AVAILABLE",
    "get_aer_simulator",
    "HamiltonianTerm",
    "TorchVQESolver",
    "VariationalResult",
    "BitFlipCode",
    "BitFlipResult",
    "infer_bit_flip",
]
