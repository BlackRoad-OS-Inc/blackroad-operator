import cmath
import math
import pytest

import mpmath as mp

from prism_math_spiral.zeta_pitch import sample_zeta_pitch


@pytest.mark.parametrize("ts", [[], [12.0]])
def test_sample_handles_small_inputs(ts):
    samples = sample_zeta_pitch(ts, dps=40) if ts else sample_zeta_pitch(ts)
    assert isinstance(samples, tuple)
    assert len(samples) == len(ts)


def _mp_log_abs(t: float) -> float:
    z = mp.zeta(mp.mpc(0.5, t))
    return float(mp.log(abs(z)))


def _mp_arg(t: float) -> float:
    z = mp.zeta(mp.mpc(0.5, t))
    return float(mp.arg(z))


def _mp_pitch(t: float, h: float) -> float:
    rho_plus = _mp_log_abs(t + h)
    rho_minus = _mp_log_abs(t - h)
    theta = _mp_arg(t)
    theta_plus = _mp_arg(t + h)
    theta_minus = _mp_arg(t - h)
    theta_plus = _unwrap(theta_plus, theta)
    theta_minus = _unwrap(theta_minus, theta)
    drho = (rho_plus - rho_minus) / (2 * h)
    dtheta = (theta_plus - theta_minus) / (2 * h)
    return float(drho / dtheta)


def _unwrap(angle: float, reference: float) -> float:
    delta = angle - reference
    while delta > math.pi:
        angle -= 2 * math.pi
        delta = angle - reference
    while delta < -math.pi:
        angle += 2 * math.pi
        delta = angle - reference
    return angle


def test_pitch_matches_high_precision_reference():
    mp.mp.dps = 80
    ts = [20.0, 20.05, 20.1]
    samples = sample_zeta_pitch(ts, dps=70)
    centre = samples[1]
    assert centre.theta_derivative is not None
    assert centre.rho_derivative is not None
    h = 1e-4
    expected = _mp_pitch(ts[1], h)
    assert centre.pitch == pytest.approx(expected, rel=2e-3)


def test_custom_evaluator_matches_closed_form():
    def evaluator(s: complex) -> complex:
        return cmath.exp(s)

    ts = [0.0, 0.1, 0.2]
    samples = sample_zeta_pitch(ts, evaluator=evaluator)
    centre = samples[1]
    assert centre.log_magnitude == pytest.approx(0.5)
    assert centre.argument == pytest.approx(ts[1])
    assert centre.rho_derivative == pytest.approx(0.0)
    assert centre.theta_derivative == pytest.approx(1.0)
    assert centre.pitch == pytest.approx(0.0)


def test_strict_ordering():
    with pytest.raises(ValueError):
        sample_zeta_pitch([0.0, 0.0])
