from __future__ import annotations

import importlib.util
from pathlib import Path

import numpy as np
import pytest

_AUTONOMY_SPEC = importlib.util.spec_from_file_location(
    "amundson_blackroad.autonomy",
    Path(__file__).resolve().parents[1] / "packages" / "amundson_blackroad" / "autonomy.py",
)
if _AUTONOMY_SPEC is None or _AUTONOMY_SPEC.loader is None:  # pragma: no cover - defensive guard
    raise ImportError("Unable to load amundson_blackroad.autonomy module")

_AUTONOMY = importlib.util.module_from_spec(_AUTONOMY_SPEC)
_AUTONOMY_SPEC.loader.exec_module(_AUTONOMY)

conserved_mass = _AUTONOMY.conserved_mass
simulate_transport = _AUTONOMY.simulate_transport
trust_field_step = _AUTONOMY.trust_field_step


@pytest.mark.parametrize("domain", ["periodic", "neumann"])
def test_transport_mass_and_positivity(domain: str) -> None:
    if domain == "periodic":
        x = np.linspace(0.0, 2 * np.pi, 256, endpoint=False)
        A0 = 0.25 + 0.1 * np.sin(x) + 0.05 * np.cos(2 * x)
        rho = 0.4 + 0.1 * np.sin(3 * x)
    else:
        x = np.linspace(-1.0, 1.0, 256)
        A0 = 0.2 + 0.1 * np.exp(-5.0 * x**2)
        rho = 0.3 + 0.05 * (1.0 - x**2)

    if domain == "periodic":
        steps = 100
        dt = 1e-3
    else:
        steps = 20
        dt = 1e-4
    result = simulate_transport(x, A0, rho, steps, dt)
    initial_mass = conserved_mass(x, A0)
    final_mass = result["mass"]
    assert abs(final_mass - initial_mass) <= 1e-3
    assert np.all(result["A"] >= -1e-10)


@pytest.mark.parametrize("mu_A, chi_A", [(0.1, 0.0), (0.8, 0.4), (1.5, 1.0)])
def test_transport_flux_stability(mu_A: float, chi_A: float) -> None:
    x = np.linspace(0.0, 1.0, 128)
    A0 = 0.3 + 0.05 * np.sin(2 * np.pi * x) ** 2
    rho = 0.5 + 0.2 * np.cos(2 * np.pi * x)
    Uc = 0.1 * np.sin(4 * np.pi * x)
    result = simulate_transport(x, A0, rho, steps=50, dt=5e-4, mu_A=mu_A, chi_A=chi_A, Uc=Uc)
    assert np.all(np.isfinite(result["A"]))
    assert np.all(np.isfinite(result["flux"]))


def test_trust_field_step_positive_terms() -> None:
    x = np.linspace(0.0, 1.0, 128)
    dx = float(x[1] - x[0])
    rho0 = 0.2 + 0.1 * np.sin(np.pi * x) ** 2
    source = 0.05 * np.ones_like(rho0)
    diffusion = 0.05
    relaxation = 0.02
    dt = 1e-3

    rho = rho0.copy()
    for _ in range(20):
        rho = trust_field_step(
            rho,
            dx,
            dt,
            diffusion=diffusion,
            relaxation=relaxation,
            source=source,
        )
        assert np.all(np.isfinite(rho))
        assert np.all(rho >= -1e-10)

    assert np.all(rho >= 0.0)
