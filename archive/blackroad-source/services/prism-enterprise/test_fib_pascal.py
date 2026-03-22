"""Tests for the Fibonacci–Pascal instrument."""

from __future__ import annotations

import importlib.util
import math
import sys
from pathlib import Path
from types import ModuleType

import numpy as np

MODULE_DIR = Path(__file__).resolve().parents[1] / "packages" / "amundson_blackroad"
MODULE_PATH = MODULE_DIR / "fib_pascal.py"

PARENT_NAME = "amundson_blackroad"
if PARENT_NAME not in sys.modules:
    package = ModuleType(PARENT_NAME)
    package.__path__ = [str(MODULE_DIR)]
    sys.modules[PARENT_NAME] = package

SPEC = importlib.util.spec_from_file_location(f"{PARENT_NAME}.fib_pascal", MODULE_PATH)
assert SPEC and SPEC.loader
fib_pascal = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = fib_pascal
SPEC.loader.exec_module(fib_pascal)

fib = fib_pascal.fib
fibs = fib_pascal.fibs
F_MATRIX = fib_pascal.F_MATRIX
pascal_row = fib_pascal.pascal_row
pascal_diagonal_sums = fib_pascal.pascal_diagonal_sums
golden_rotation_step = fib_pascal.golden_rotation_step
PHI = fib_pascal.PHI


def test_fibonacci_sequence_prefix() -> None:
    """The Fibonacci helper returns the expected prefix."""

    assert fibs(7) == [0, 1, 1, 2, 3, 5, 8]
    assert fib(10) == 55


def test_pascal_rows_and_diagonals_match_fibonacci() -> None:
    """Pascal diagonals equal ``F_{n+1}`` for n ≤ 20."""

    assert pascal_row(5) == [1, 5, 10, 10, 5, 1]
    for n in range(0, 21):
        assert pascal_diagonal_sums(n) == fib(n + 1)


def test_f_matrix_generates_successive_pairs() -> None:
    """The Fibonacci matrix reproduces successive pairs via matrix powers."""

    vector = np.array([[1.0], [0.0]])
    for n in range(1, 6):
        powered = np.linalg.matrix_power(F_MATRIX, n) @ vector
        assert math.isclose(powered[0, 0], fib(n + 1), rel_tol=0.0, abs_tol=1e-12)
        assert math.isclose(powered[1, 0], fib(n), rel_tol=0.0, abs_tol=1e-12)


def test_golden_rotation_step_is_stable() -> None:
    """Golden rotation keeps updates bounded and deterministic."""

    a_next, theta_next = golden_rotation_step(1.0, 0.0, eta=0.05)
    assert math.isclose(a_next, 1.0 + 0.05 / PHI, rel_tol=0.0, abs_tol=1e-12)
    assert math.isclose(theta_next, 0.05 / (PHI**2), rel_tol=0.0, abs_tol=1e-12)
