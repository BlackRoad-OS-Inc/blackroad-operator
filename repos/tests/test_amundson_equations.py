from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np
import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from lucidia_math_lab.amundson_equations import (
    AmundsonCoherenceModel,
    amundson_energy_balance,
    amundson_learning_update,
    coherence,
    decoherence_energy,
    phase_derivative,
)


def test_coherence_matches_cosine_difference():
    assert math.isclose(coherence(0.0, 0.0), 1.0)
    assert math.isclose(coherence(math.pi / 2, 0.0), math.cos(math.pi / 2))
    assert math.isclose(coherence(math.pi, 0.0), -1.0)


def test_decoherence_energy_penalizes_misalignment():
    aligned = decoherence_energy(
        phi_x=0.0,
        phi_y=0.0,
        r_x=1.0,
        r_y=1.0,
        lambda_=2.0,
        k_b_t=0.5,
    )
    misaligned = decoherence_energy(
        phi_x=math.pi / 2,
        phi_y=0.0,
        r_x=1.0,
        r_y=1.0,
        lambda_=2.0,
        k_b_t=0.5,
    )
    assert math.isclose(aligned, 0.0)
    assert misaligned > aligned


def test_phase_derivative_combines_terms():
    value = phase_derivative(
        omega_0=1.0,
        lambda_=0.5,
        eta=0.1,
        phi_x=math.pi / 3,
        phi_y=0.0,
        r_x=1.2,
        r_y=0.8,
        k_b_t=0.7,
    )
    c_term = coherence(math.pi / 3, 0.0)
    energy = decoherence_energy(
        phi_x=math.pi / 3,
        phi_y=0.0,
        r_x=1.2,
        r_y=0.8,
        lambda_=0.5,
        k_b_t=0.7,
    )
    expected = 1.0 + 0.5 * c_term - 0.1 * energy
    assert math.isclose(value, expected)


class DummySystem:
    def __init__(self) -> None:
        self.last_update = None

    def update_phase(self, d_phi_dt: float) -> None:
        self.last_update = d_phi_dt


def test_model_evolve_applies_derivative():
    model = AmundsonCoherenceModel(omega_0=1.0, lambda_=0.4, eta=0.2, k_b_t=0.6)
    dummy = DummySystem()
    derivative = model.evolve(
        dummy,
        phi_x=0.1,
        phi_y=0.05,
        r_x=1.0,
        r_y=0.9,
    )
    assert math.isclose(derivative, dummy.last_update)


def test_energy_balance_reduces_energy_but_clamps_at_zero():
    assert math.isclose(amundson_energy_balance(energy=1.0, dissipation=0.1), 0.9)
    assert math.isclose(amundson_energy_balance(energy=0.05, dissipation=1.0), 0.0)


def test_energy_balance_validates_inputs():
    with pytest.raises(ValueError):
        amundson_energy_balance(energy=-0.1, dissipation=0.0)
    with pytest.raises(ValueError):
        amundson_energy_balance(energy=1.0, dissipation=-0.5)


def test_learning_update_reduces_to_gradient_descent_with_identity_metric():
    weights = np.array([1.0, -0.5])
    gradient = np.array([0.2, -0.4])
    metric = np.eye(2)
    eta = 0.1
    updated = amundson_learning_update(
        weights=weights,
        gradient=gradient,
        metric=metric,
        learning_rate=eta,
        k_b_t=0.0,
        noise=np.zeros_like(weights),
    )
    expected = weights - eta * gradient
    assert np.allclose(updated, expected)


def test_learning_update_respects_metric_and_noise_channel():
    weights = np.array([0.3, -1.2])
    gradient = np.array([1.0, -0.5])
    metric = np.array([[2.0, 0.3], [0.3, 1.5]])
    eta = 0.2
    k_b_t = 0.7
    noise = np.array([0.5, -1.0])

    updated = amundson_learning_update(
        weights=weights,
        gradient=gradient,
        metric=metric,
        learning_rate=eta,
        k_b_t=k_b_t,
        noise=noise,
    )

    chol = np.linalg.cholesky(metric)
    natural_grad = np.linalg.solve(metric, gradient)
    deterministic = -eta * natural_grad
    stochastic = math.sqrt(2.0 * eta * k_b_t) * np.linalg.solve(chol.T, noise)
    expected = weights + deterministic + stochastic
    assert np.allclose(updated, expected)
