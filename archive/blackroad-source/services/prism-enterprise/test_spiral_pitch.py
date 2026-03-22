from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from utils.spiral_pitch import analyze_spiral_trace


def test_log_spiral_pitch_and_reconstruction_matches_exact() -> None:
    theta = np.linspace(0.0, 4.0 * np.pi, 200)
    pitch_true = 0.2
    intercept = -0.3
    z = np.exp((pitch_true * theta + intercept) + 1j * theta)

    pitch, score, reconstruction = analyze_spiral_trace(z)

    assert pytest.approx(pitch_true, rel=1e-6, abs=1e-6) == pitch
    assert score > 0.999999
    np.testing.assert_allclose(reconstruction, z, rtol=1e-9, atol=1e-9)


def test_noisy_spiral_retains_pitch_signal_and_reasonable_score() -> None:
    rng = np.random.default_rng(42)
    theta = np.linspace(0.0, 6.0 * np.pi, 500)
    pitch_true = -0.05
    intercept = 0.4
    magnitude_noise = 0.03 * rng.standard_normal(theta.shape)
    phase_noise = 0.01 * rng.standard_normal(theta.shape)
    rho = pitch_true * theta + intercept + magnitude_noise
    noisy_theta = theta + phase_noise
    z_noisy = np.exp(rho + 1j * noisy_theta)

    pitch, score, reconstruction = analyze_spiral_trace(z_noisy)

    assert pytest.approx(pitch_true, rel=1e-2, abs=1e-3) == pitch
    assert 0.7 < score < 1.0
    assert reconstruction.shape == z_noisy.shape


def test_raises_on_zero_samples() -> None:
    z = np.array([1 + 0j, 0 + 0j, 1j])
    with pytest.raises(ValueError):
        analyze_spiral_trace(z)
