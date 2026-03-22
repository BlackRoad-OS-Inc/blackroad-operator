"""Tests for the Amundson coherence auto-resolver."""

from __future__ import annotations

import importlib.util
import math
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "packages"))

from amundson_blackroad.resolution import AmbrContext, K_BOLTZMANN, resolve_coherence_inputs


def test_defaults_and_units() -> None:
    values, missing, why = resolve_coherence_inputs()
    expected_missing = {
        "omega_0",
        "lambda_",
        "eta",
        "phi_x",
        "phi_y",
        "r",
        "amplitude",
        "temperature_K",
        "k_b_t",
    }
    assert expected_missing.issubset(set(missing))
    assert "k_b_t" in why and "omega_0" in why
    expected = 300.0 * K_BOLTZMANN
    assert math.isclose(values["k_b_t"], expected, rel_tol=1e-12)


def test_context_fills_phases() -> None:
    ctx = AmbrContext(last_phi_x=0.3, last_phi_y=1.1)
    values, missing, why = resolve_coherence_inputs(ctx=ctx)
    assert values["phi_x"] == 0.3
    assert values["phi_y"] == 1.1
    assert "phi_x" in missing and "phi_y" in missing
    assert why["phi_x"].startswith("Phase φ_x")
    assert why["phi_y"].startswith("Phase φ_y")
MODULE_PATH = Path(__file__).resolve().parents[1] / "packages" / "amundson_blackroad" / "resolution.py"
SPEC = importlib.util.spec_from_file_location("amundson_blackroad.resolution", MODULE_PATH)
assert SPEC and SPEC.loader
resolution = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = resolution
SPEC.loader.exec_module(resolution)

K_BOLTZMANN = resolution.K_BOLTZMANN
AmbrContext = resolution.AmbrContext
resolve_coherence_inputs = resolution.resolve_coherence_inputs


def test_resolver_infers_defaults() -> None:
    """Missing parameters are filled with documented defaults."""

    ctx = AmbrContext(last_phi_x=0.25, last_phi_y=-0.1)
    resolved, missing, why = resolve_coherence_inputs(ctx)

    expected_defaults = {
        "omega_0": 1.0,
        "lambda_": 0.5,
        "eta": 0.2,
        "phi_x": 0.25,
        "phi_y": -0.1,
        "r": 1.0,
        "amplitude": 1.0,
        "temperature_K": ctx.default_temperature_K,
    }
    for key, value in expected_defaults.items():
        assert math.isclose(resolved[key], value, rel_tol=0.0, abs_tol=1e-12)
        assert key in missing
        assert key in why

    assert "k_b_t" in resolved
    assert "k_b_t" in missing
    assert why["k_b_t"].startswith("Computed k_B")


def test_resolver_respects_payload_temperature() -> None:
    """The thermal product k_B T follows the supplied temperature."""

    ctx = AmbrContext(last_phi_x=1.1, last_phi_y=0.2)
    resolved, missing, _ = resolve_coherence_inputs(ctx, temperature_K=350.0)

    assert math.isclose(
        resolved["k_b_t"],
        K_BOLTZMANN * 350.0,
        rel_tol=0.0,
        abs_tol=1e-12,
    )
    assert "temperature_K" not in missing


def test_resolver_uses_context_phases_when_not_supplied() -> None:
    """Context phases become defaults while explicit inputs bypass missing log."""

    ctx = AmbrContext(last_phi_x=0.9, last_phi_y=0.7)
    resolved, missing, why = resolve_coherence_inputs(ctx, phi_x=0.1)

    assert math.isclose(resolved["phi_x"], 0.1)
    assert "phi_x" not in missing
    assert why["phi_x"] == "Provided explicitly in payload."

    assert math.isclose(resolved["phi_y"], 0.7)
    assert "phi_y" in missing
