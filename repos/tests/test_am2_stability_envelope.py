from __future__ import annotations

import importlib.util
from pathlib import Path

import numpy as np
import pytest

SPIRAL_PATH = Path(__file__).resolve().parents[1] / "packages" / "amundson_blackroad" / "spiral.py"
_spec = importlib.util.spec_from_file_location("amundson_blackroad.spiral", SPIRAL_PATH)
_spiral = importlib.util.module_from_spec(_spec)
assert _spec and _spec.loader
_spec.loader.exec_module(_spiral)

am2_step = _spiral.am2_step
field_lift = _spiral.field_lift
fixed_point_stability = _spiral.fixed_point_stability
simulate_am2 = _spiral.simulate_am2


@pytest.mark.parametrize("gamma", [0.1, 0.3, 0.6])
@pytest.mark.parametrize("eta", [0.2, 0.5, 0.8])
@pytest.mark.parametrize("kappa", [-0.5, 0.0, 0.5])
def test_simulate_am2_envelope_is_finite(gamma: float, eta: float, kappa: float) -> None:
    """Ensure the short-horizon simulation stays within numerical bounds."""

    t, a, theta, amp = simulate_am2(
        T=0.25,
        dt=2e-3,
        a0=0.2,
        theta0=0.1,
        gamma=gamma,
        kappa=kappa,
        eta=eta,
        omega0=1.0,
    )
    assert np.all(np.isfinite(t))
    assert np.all(np.isfinite(a))
    assert np.all(np.isfinite(theta))
    assert np.all(np.isfinite(amp))


def test_fixed_point_stability_matches_perturbation_eigenvalues() -> None:
    """Eigenvalues from the Jacobian should match finite-difference estimates."""

    params = dict(a=0.15, theta=-0.05, gamma=0.4, kappa=0.25, eta=0.6, omega0=1.0)
    report = fixed_point_stability(**params, eps=1e-7)

    base = np.array(am2_step(**params)[0:2])
    eps = 1e-7
    perturbations = [np.array([eps, 0.0]), np.array([0.0, eps])]
    columns = []
    for delta in perturbations:
        shifted = np.array(
            am2_step(
                params["a"] + delta[0],
                params["theta"] + delta[1],
                params["gamma"],
                params["kappa"],
                params["eta"],
                params["omega0"],
            )[0:2]
        )
        columns.append((shifted - base) / eps)
    numerical_jacobian = np.column_stack(columns)

    eigvals_report = np.linalg.eigvals(report.jacobian)
    eigvals_numerical = np.linalg.eigvals(numerical_jacobian)
    assert eigvals_report == pytest.approx(eigvals_numerical, rel=1e-6, abs=1e-9)


def test_field_lift_clip_guard() -> None:
    """The exponential lift should remain clipped to the configured ceiling."""

    lifted = field_lift(1e3, 1e3, mode="exponential")
    assert lifted <= np.exp(50.0)
    assert lifted == pytest.approx(np.exp(50.0))
