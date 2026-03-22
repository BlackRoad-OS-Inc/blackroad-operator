"""Fuzz tests for Amundson–BlackRoad spiral and transport kernels."""

from __future__ import annotations

import math
import sys
from importlib import util
from pathlib import Path

import numpy as np
from hypothesis import assume, given, settings
from hypothesis import strategies as st

PACKAGE_DIR = Path(__file__).resolve().parents[2] / "packages" / "amundson_blackroad"


def load_module(name: str, relative: str):
    """Load a module from the Amundson–BlackRoad package directory."""

    module_path = PACKAGE_DIR / relative
    spec = util.spec_from_file_location(name, module_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"unable to load {name} from {module_path}")
    module = util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


autonomy = load_module("ambr_autonomy", "autonomy.py")
spiral = load_module("ambr_spiral", "spiral.py")
thermo = load_module("ambr_thermo", "thermo.py")

conserved_mass = autonomy.conserved_mass
simulate_transport = autonomy.simulate_transport
simulate_am2 = spiral.simulate_am2
annotate_run_with_thermo = thermo.annotate_run_with_thermo
energy_increment = thermo.energy_increment
spiral_entropy = thermo.spiral_entropy


@st.composite
def am2_parameters(draw: st.DrawFn) -> dict[str, float]:
    """Draw bounded parameters for AM-2 simulations."""

    dt = draw(st.floats(min_value=1e-4, max_value=0.05, allow_nan=False, allow_infinity=False))
    steps = draw(st.integers(min_value=5, max_value=200))
    horizon = dt * steps
    assume(math.isfinite(horizon) and horizon > 0.0)
    params = {
        "T": horizon,
        "dt": dt,
        "a0": draw(st.floats(min_value=-1.0, max_value=1.0, allow_nan=False, allow_infinity=False)),
        "theta0": draw(st.floats(min_value=-1.0, max_value=1.0, allow_nan=False, allow_infinity=False)),
        "gamma": draw(st.floats(min_value=0.0, max_value=1.5, allow_nan=False, allow_infinity=False)),
        "kappa": draw(st.floats(min_value=-1.0, max_value=1.0, allow_nan=False, allow_infinity=False)),
        "eta": draw(st.floats(min_value=0.0, max_value=1.5, allow_nan=False, allow_infinity=False)),
        "omega0": draw(st.floats(min_value=0.0, max_value=2.0, allow_nan=False, allow_infinity=False)),
    }
    return params


@st.composite
def transport_states(draw: st.DrawFn) -> dict[str, object]:
    """Generate random transport states and parameters."""

    n_points = draw(st.integers(min_value=5, max_value=40))
    dx = draw(st.floats(min_value=0.05, max_value=1.0, allow_nan=False, allow_infinity=False))
    origin = draw(st.floats(min_value=-10.0, max_value=10.0, allow_nan=False, allow_infinity=False))
    x = origin + dx * np.arange(n_points, dtype=float)
    assume(np.all(np.isfinite(x)))
    a0 = np.array(
        draw(
            st.lists(
                st.floats(min_value=-2.0, max_value=2.0, allow_nan=False, allow_infinity=False),
                min_size=n_points,
                max_size=n_points,
            )
        ),
        dtype=float,
    )
    if n_points > 2:
        a0[0] = a0[1]
        a0[-1] = a0[-2]

    phase = np.linspace(0.0, np.pi, n_points, dtype=float)
    rho_base = draw(st.floats(min_value=-1.0, max_value=1.0, allow_nan=False, allow_infinity=False))
    rho_amp = draw(st.floats(min_value=-0.5, max_value=0.5, allow_nan=False, allow_infinity=False))
    rho = rho_base + rho_amp * np.cos(phase)
    steps = draw(st.integers(min_value=1, max_value=25))
    dt = draw(st.floats(min_value=1e-4, max_value=0.05, allow_nan=False, allow_infinity=False))
    mu_a = draw(st.floats(min_value=0.1, max_value=2.0, allow_nan=False, allow_infinity=False))
    chi_a = draw(st.floats(min_value=0.0, max_value=1.0, allow_nan=False, allow_infinity=False))
    return {
        "x": x,
        "A0": a0,
        "rho": rho,
        "steps": steps,
        "dt": dt,
        "mu_A": mu_a,
        "chi_A": chi_a,
    }


@st.composite
def thermo_samples(draw: st.DrawFn) -> tuple[float, float, float, float]:
    """Draw bit and temperature pairs for thermo ledger checks."""

    bits_a = draw(st.floats(min_value=0.0, max_value=256.0, allow_nan=False, allow_infinity=False))
    bits_b = draw(st.floats(min_value=0.0, max_value=256.0, allow_nan=False, allow_infinity=False))
    temp_a = draw(st.floats(min_value=1e-3, max_value=1000.0, allow_nan=False, allow_infinity=False))
    temp_b = draw(st.floats(min_value=1e-3, max_value=1000.0, allow_nan=False, allow_infinity=False))
    return bits_a, bits_b, temp_a, temp_b


@given(am2_parameters())
@settings(deadline=None, max_examples=75)
def test_am2_simulation_is_finite_and_thermo_non_negative(params: dict[str, float]) -> None:
    """AM-2 simulations should remain finite and yield non-negative thermo values."""

    t, a, theta, amp = simulate_am2(**params)
    for array in (t, a, theta, amp):
        assert array.dtype == float
        assert array.shape == t.shape
        assert np.all(np.isfinite(array))

    entropy = spiral_entropy(a, theta)
    assert entropy >= 0.0

    energy = energy_increment(a, theta, params["dt"], gamma=params["gamma"], eta=params["eta"])
    assert energy >= -1e-12


@given(transport_states())
@settings(deadline=None, max_examples=75)
def test_transport_mass_conservation_and_flux_finiteness(state: dict[str, object]) -> None:
    """Transport simulations conserve mass and maintain finite flux."""

    x = state["x"]
    a0 = state["A0"]
    rho = state["rho"]
    result = simulate_transport(
        x,
        a0,
        rho,
        int(state["steps"]),
        float(state["dt"]),
        mu_A=float(state["mu_A"]),
        chi_A=float(state["chi_A"]),
    )

    initial_mass = conserved_mass(x, a0)
    assert math.isfinite(initial_mass)
    assert math.isfinite(result["mass"])

    flux = np.asarray(result["flux"], dtype=float)
    tolerance = 1e-5 + 1e-5 * abs(initial_mass) + float(state["dt"]) * np.sum(np.abs(flux))
    assert abs(result["mass"] - initial_mass) <= tolerance

    for key in ("A",):
        array = np.asarray(result[key], dtype=float)
        assert array.shape == x.shape
        assert np.all(np.isfinite(array))

    assert flux.shape == x.shape
    assert np.all(np.isfinite(flux))


@given(thermo_samples())
@settings(deadline=None, max_examples=100)
def test_thermo_ledger_landauer_monotonic(samples: tuple[float, float, float, float]) -> None:
    """Landauer ledger outputs are monotonic in bits and temperature."""

    bits_a, bits_b, temp_a, temp_b = samples
    bits_low, bits_high = sorted((bits_a, bits_b))
    temp_low, temp_high = sorted((temp_a, temp_b))

    ledger_low_bits = annotate_run_with_thermo({}, bits=bits_low, temperature=temp_high)
    ledger_high_bits = annotate_run_with_thermo({}, bits=bits_high, temperature=temp_high)

    thermo_low_bits = ledger_low_bits["thermo"]
    thermo_high_bits = ledger_high_bits["thermo"]
    assert thermo_high_bits["delta_e_min_J"] >= thermo_low_bits["delta_e_min_J"]
    assert thermo_low_bits["delta_e_min_J"] >= 0.0
    assert thermo_low_bits["delta_e_effective_J"] >= 0.0

    ledger_cold = annotate_run_with_thermo({}, bits=bits_high, temperature=temp_low)
    ledger_hot = annotate_run_with_thermo({}, bits=bits_high, temperature=temp_high)

    thermo_cold = ledger_cold["thermo"]
    thermo_hot = ledger_hot["thermo"]
    assert thermo_hot["delta_e_min_J"] >= thermo_cold["delta_e_min_J"]
    assert thermo_hot["delta_e_effective_J"] >= thermo_cold["delta_e_effective_J"]
    assert thermo_hot["delta_e_min_J"] >= 0.0
