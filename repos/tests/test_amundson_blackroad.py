from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pytest

sys.path.append(str(Path(__file__).resolve().parents[1] / "packages"))

from amundson_blackroad.autonomy import conserved_mass, simulate_transport
from amundson_blackroad.spiral import simulate_am2
from amundson_blackroad.thermo import energy_increment, landauer_min, spiral_entropy


@pytest.mark.parametrize("steps", [250, 500])
def test_mass_conservation_within_threshold(steps: int) -> None:
    x = np.linspace(-5.0, 5.0, 512)
    A0 = np.exp(-x ** 2)
    rho = np.tanh(x)
    dt = 1e-3
    result = simulate_transport(x, A0, rho, steps, dt, mu_A=0.8)
    initial_mass = conserved_mass(x, A0)
    assert pytest.approx(initial_mass, rel=1e-3) == result["mass"]


def test_spiral_entropy_positive() -> None:
    t, a, theta, _ = simulate_am2(1.0, 1e-3, 0.3, 0.0, 0.8, 0.2, 0.4, 1.2)
    entropy = spiral_entropy(a, theta)
    assert entropy >= 0.0
    assert entropy == pytest.approx(spiral_entropy(a, theta))


def test_energy_increment_agrees_with_finite_difference() -> None:
    T = 2.0
    dt = 1e-3
    params = dict(T=T, dt=dt, a0=0.2, theta0=0.1, gamma=0.5, kappa=0.3, eta=0.4, omega0=1.1)
    t, a, theta, _ = simulate_am2(**params)
    ledger_value = energy_increment(a, theta, dt, gamma=params["gamma"], eta=params["eta"])
    finite_diff = np.trapz(params["gamma"] * a ** 2 + params["eta"] * np.abs(a * theta), dx=dt)
    assert pytest.approx(finite_diff, rel=1e-6) == ledger_value


def test_landauer_min_matches_manual() -> None:
    bits = 64
    temperature = 310.0
    expected = 1.380649e-23 * temperature * np.log(2.0) * bits
    assert pytest.approx(expected, rel=1e-12) == landauer_min(bits, temperature)


@pytest.mark.parametrize("temperature", [1.0, 77.0, 273.15, 350.0, 600.0])
def test_landauer_min_monotonic_in_bits(temperature: float) -> None:
    bits_grid = np.array([0.0, 0.125, 1.0, 8.0, 64.0, 256.0])
    energies = [landauer_min(bits, temperature) for bits in bits_grid]
    assert all(previous <= current for previous, current in zip(energies, energies[1:]))


@pytest.mark.parametrize("bits", [1.0, 2.5, 16.0, 64.0, 128.0])
def test_landauer_min_monotonic_in_temperature(bits: float) -> None:
    temperatures = np.array([1.0, 25.0, 77.0, 150.0, 273.15, 400.0])
    energies = [landauer_min(bits, temperature) for temperature in temperatures]
    assert all(previous <= current for previous, current in zip(energies, energies[1:]))


@pytest.mark.parametrize("size", [8, 64, 256])
def test_energy_increment_random_traces_match_trapz(size: int) -> None:
    rng = np.random.default_rng(seed=size)
    dt = 1e-3
    gamma = 0.7
    eta = 0.2
    a = rng.normal(loc=0.0, scale=0.5, size=size)
    theta = rng.normal(loc=0.0, scale=0.5, size=size)
    expected = np.trapz(gamma * a ** 2 + eta * np.abs(a * theta), dx=dt)
    observed = energy_increment(a, theta, dt, gamma=gamma, eta=eta)
    assert observed == pytest.approx(expected, abs=1e-6)


@pytest.mark.parametrize("shape", [(5,), (2, 3), (4, 4, 2)])
def test_spiral_entropy_non_negative_for_zero_arrays(shape: tuple[int, ...]) -> None:
    zeros = np.zeros(shape)
    entropy = spiral_entropy(zeros, zeros)
    assert entropy >= 0.0
    assert entropy == pytest.approx(0.0, abs=1e-12)
