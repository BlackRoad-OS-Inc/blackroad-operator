"""Tests for the BR-8 Collatz flow instrument."""

from __future__ import annotations

import importlib.util
import math
import sys
from pathlib import Path
from types import ModuleType

BASE_DIR = Path(__file__).resolve().parents[1]
PACKAGE_DIR = BASE_DIR / "packages" / "amundson_blackroad"
COLLATZ_PATH = PACKAGE_DIR / "collatz.py"
RESOLUTION_PATH = PACKAGE_DIR / "resolution.py"

PARENT_NAME = "amundson_blackroad"
if PARENT_NAME not in sys.modules:
    package = ModuleType(PARENT_NAME)
    package.__path__ = [str(PACKAGE_DIR)]
    sys.modules[PARENT_NAME] = package

collatz_spec = importlib.util.spec_from_file_location(f"{PARENT_NAME}.collatz", COLLATZ_PATH)
resolution_spec = importlib.util.spec_from_file_location(f"{PARENT_NAME}.resolution", RESOLUTION_PATH)
assert collatz_spec and collatz_spec.loader
assert resolution_spec and resolution_spec.loader
collatz = importlib.util.module_from_spec(collatz_spec)
resolution = importlib.util.module_from_spec(resolution_spec)
sys.modules[collatz_spec.name] = collatz
sys.modules[resolution_spec.name] = resolution
resolution_spec.loader.exec_module(resolution)
collatz_spec.loader.exec_module(collatz)

next_collatz = collatz.next_collatz
collatz_walk = collatz.collatz_walk
collatz_landauer_cost = collatz.collatz_landauer_cost
collatz_pushforward = collatz.collatz_pushforward
K_BOLTZMANN = resolution.K_BOLTZMANN


def test_collatz_walk_small_seed() -> None:
    """Collatz walk for n=3 matches the known trajectory."""

    path, steps = collatz_walk(3, limit=10)
    assert path == [3, 10, 5, 16, 8, 4, 2, 1]
    assert steps == 7


def test_landauer_cost_matches_step_count() -> None:
    """Landauer energy equals k_B T ln 2 times transition count."""

    temperature = 300.0
    _, steps = collatz_walk(5, limit=20)
    expected = K_BOLTZMANN * temperature * math.log(2.0) * steps
    assert math.isclose(
        collatz_landauer_cost(5, temperature, limit=20), expected, rel_tol=0.0, abs_tol=1e-18
    )


def test_pushforward_preserves_mass_and_energy_accumulates() -> None:
    """Mass stays constant while Landauer cost scales with steps."""

    distribution = {3: 1.0, 4: 0.5}
    temperature = 310.0
    steps = 2
    next_dist, energy = collatz_pushforward(distribution, steps, temperature_K=temperature)

    assert math.isclose(sum(distribution.values()), sum(next_dist.values()), rel_tol=0.0, abs_tol=1e-12)
    assert next_dist == {1: 0.5, 5: 1.0}
    expected_energy = sum(distribution.values()) * steps * K_BOLTZMANN * temperature * math.log(2.0)
    assert math.isclose(energy, expected_energy, rel_tol=0.0, abs_tol=1e-18)
