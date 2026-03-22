"""Tests for Amundson VIII Chebyshev resonance helpers."""

from __future__ import annotations

import importlib.util
import math
import sys
from pathlib import Path
from types import ModuleType

MODULE_DIR = Path(__file__).resolve().parents[1] / "packages" / "amundson_blackroad"
MODULE_PATH = MODULE_DIR / "chebyshev.py"

PARENT_NAME = "amundson_blackroad"
if PARENT_NAME not in sys.modules:
    package = ModuleType(PARENT_NAME)
    package.__path__ = [str(MODULE_DIR)]
    sys.modules[PARENT_NAME] = package

SPEC = importlib.util.spec_from_file_location(f"{PARENT_NAME}.chebyshev", MODULE_PATH)
assert SPEC and SPEC.loader
chebyshev = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = chebyshev
SPEC.loader.exec_module(chebyshev)

cos_n_theta = chebyshev.cos_n_theta
Tn = chebyshev.Tn
Un = chebyshev.Un
resonance_score = chebyshev.resonance_score


def test_chebyshev_matches_cosine_multiple() -> None:
    """Tₙ(cos θ) reproduces cos(nθ) for sample harmonics."""

    theta = 0.37
    for n in range(0, 6):
        expected = math.cos(n * theta)
        got = cos_n_theta(theta, n)
        assert math.isclose(got, expected, rel_tol=0.0, abs_tol=1e-12)


def test_resonance_peaks_on_rational_ratio() -> None:
    """Resonance scores spike when θ/π is rational."""

    theta = math.pi * 2.0 / 5.0
    summary = resonance_score(theta, 6)
    scores = summary["score"]
    max_index = int(scores.argmax())
    assert summary["n"][max_index] == 5
    assert scores[max_index] > 1e8
    assert math.isclose(summary["approx"][max_index], 0.4, abs_tol=1e-12)
