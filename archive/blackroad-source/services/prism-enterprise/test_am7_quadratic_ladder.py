"""Tests for Amundson VII quadratic ladder invariants."""

from __future__ import annotations

import importlib.util
import math
import sys
from pathlib import Path
from types import ModuleType

MODULE_DIR = Path(__file__).resolve().parents[1] / "packages" / "amundson_blackroad"
MODULE_PATH = MODULE_DIR / "ladder.py"

PARENT_NAME = "amundson_blackroad"
if PARENT_NAME not in sys.modules:
    package = ModuleType(PARENT_NAME)
    package.__path__ = [str(MODULE_DIR)]
    sys.modules[PARENT_NAME] = package

SPEC = importlib.util.spec_from_file_location(f"{PARENT_NAME}.ladder", MODULE_PATH)
assert SPEC and SPEC.loader
ladder = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = ladder
SPEC.loader.exec_module(ladder)

sin2_ladder = ladder.sin2_ladder
special_angles = ladder.special_angles
ladder_identity_residuals = ladder.ladder_identity_residuals
verify_ladder_identity = ladder.verify_ladder_identity


def test_ladder_values_match_quadratic_sequence() -> None:
    """sin² ladder reproduces the expected quadratic fractions."""

    values = sin2_ladder()
    expected = [0.0, 0.25, 0.5, 0.75, 1.0]
    for got, want in zip(values, expected):
        assert math.isclose(got, want, rel_tol=0.0, abs_tol=1e-12)


def test_special_angle_triples() -> None:
    """sin, cos, tan triples align with exact radicals."""

    triples = special_angles()
    roots = [
        (0.0, 1.0, 0.0),
        (0.5, math.sqrt(3) / 2.0, 1.0 / math.sqrt(3)),
        (math.sqrt(2) / 2.0, math.sqrt(2) / 2.0, 1.0),
        (math.sqrt(3) / 2.0, 0.5, math.sqrt(3)),
        (1.0, 0.0, math.inf),
    ]
    for triple, reference in zip(triples, roots):
        for got, want in zip(triple, reference):
            if math.isinf(want):
                assert math.isinf(got)
            else:
                assert math.isclose(got, want, rel_tol=0.0, abs_tol=1e-12)


def test_quadratic_identity_holds() -> None:
    """sin²θ and (1 - cos 2θ)/2 coincide to machine precision."""

    residuals = ladder_identity_residuals()
    assert float(abs(residuals).max()) <= 1e-12
    assert verify_ladder_identity(tol=1e-12)
