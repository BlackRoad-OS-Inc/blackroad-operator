"""Executable demonstrations for the quantum math lab."""

from .grover_demo import grover_circuit, run_local as run_grover_local
from .vqe_example import hardware_efficient_ansatz

__all__ = [
    "grover_circuit",
    "run_grover_local",
    "hardware_efficient_ansatz",
]
