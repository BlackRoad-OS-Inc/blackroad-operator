"""Tests for the Amundson VI projective phase mapping."""

from __future__ import annotations

import importlib.util
import math
import sys
from pathlib import Path
from types import ModuleType

import pytest

MODULE_DIR = Path(__file__).resolve().parents[1] / "packages" / "amundson_blackroad"
MODULE_PATH = MODULE_DIR / "projective.py"

PARENT_NAME = "amundson_blackroad"
if PARENT_NAME not in sys.modules:
    package = ModuleType(PARENT_NAME)
    package.__path__ = [str(MODULE_DIR)]
    sys.modules[PARENT_NAME] = package

SPEC = importlib.util.spec_from_file_location(f"{PARENT_NAME}.projective", MODULE_PATH)
assert SPEC and SPEC.loader
projective = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = projective
SPEC.loader.exec_module(projective)

u_from_theta = projective.u_from_theta
theta_from_u = projective.theta_from_u
projective_am2_step = projective.projective_am2_step
simulate_projective_am2 = projective.simulate_projective_am2


@pytest.mark.parametrize("theta", [math.pi / 2 - 1e-9, -(math.pi / 2 - 1e-9)])
def test_projective_round_trip_near_pi_over_two(theta: float) -> None:
    """u = tan(theta/2) remains well-behaved near ±π/2."""

    u = u_from_theta(theta)
    theta_back = theta_from_u(u)
    assert math.isfinite(u)
    assert math.isfinite(theta_back)
    assert math.isclose(theta_back, theta, rel_tol=0.0, abs_tol=1e-9)


def test_projective_derivative_stays_finite() -> None:
    """The projective derivative does not diverge at the polar seam."""

    theta = math.pi / 2 - 1e-6
    u = u_from_theta(theta)
    a_dot, u_dot, theta_dot, _ = projective_am2_step(
        a=0.4, u=u, gamma=0.2, kappa=0.3, eta=0.5, omega0=1.2
    )

    assert math.isfinite(u_dot)
    assert math.isfinite(theta_dot)
    assert abs(math.tan(theta)) > 1e6  # highlight singular original coordinate
    assert abs(u) < 10.0  # Projective coordinate stays bounded
    assert abs(a_dot) < 10.0


def test_simulate_projective_am2_round_trip() -> None:
    """simulate_projective_am2 keeps projective coordinates finite near the seam."""

    eps = 1e-9
    t, a, u, theta, response = simulate_projective_am2(T=2e-3, dt=2e-4, theta0=math.pi / 2 - eps)

    for series in (t, a, u, theta, response):
        assert all(math.isfinite(value) for value in series)

    theta_round_trip = [theta_from_u(value) for value in u]
    max_error = max(abs(expected - actual) for expected, actual in zip(theta, theta_round_trip))
    assert max_error < 1e-9
