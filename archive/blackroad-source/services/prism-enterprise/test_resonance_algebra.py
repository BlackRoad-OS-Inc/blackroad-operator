import math

import pytest

from resonance_algebra import (
    K_B,
    State,
    associativity_defect,
    coherence,
    coupling_product,
    decohere,
    interference_sum,
    landauer_limit,
    normalize,
    phase_cost,
    phase_inversion,
)


class DummyRandom:
    def __init__(self, values):
        self._values = iter(values)

    def random(self):
        return next(self._values)


@pytest.mark.parametrize(
    "a,b,expected_r,expected_phi",
    [
        (State(1.0, 0.0), State(1.0, 0.0), 2.0, 0.0),
        (State(2.0, 0.0), State(2.0, math.pi), 0.0, 0.0),
    ],
)
def test_interference_sum(a, b, expected_r, expected_phi):
    result = interference_sum(a, b)
    assert pytest.approx(expected_r) == result.r
    assert pytest.approx(expected_phi) == result.phi


def test_coupling_product_adds_phases():
    a = State(2.0, math.pi / 3)
    b = State(0.5, math.pi / 2)
    result = coupling_product(a, b)
    assert pytest.approx(1.0) == result.r
    assert pytest.approx((math.pi / 3 + math.pi / 2) % (2 * math.pi)) == result.phi


@pytest.mark.parametrize(
    "phi_offset,expected",
    [(0.0, 1.0), (math.pi, -1.0), (math.pi / 2, 0.0)],
)
def test_coherence(phi_offset, expected):
    base = State(1.0, 0.0)
    shifted = State(1.0, phi_offset)
    assert pytest.approx(expected) == coherence(base, shifted)


def test_phase_inversion_round_trip():
    a = State(2.0, math.pi / 4)
    inv = phase_inversion(a)
    identity = coupling_product(a, inv)
    assert pytest.approx(1.0) == identity.r
    assert pytest.approx(0.0) == identity.phi


def test_associativity_defect_zero_when_aligned():
    aligned = [State(1.0, 0.0), State(0.5, 0.0), State(0.25, 0.0)]
    assert pytest.approx(0.0) == associativity_defect(*aligned)


def test_associativity_defect_detects_phase_drift():
    a = State(1.0, 0.0)
    b = State(1.0, math.pi / 3)
    c = State(1.0, -math.pi / 5)
    assert associativity_defect(a, b, c) != pytest.approx(0.0)


def test_normalize_caps_amplitude():
    state = State(2.5, math.pi / 7)
    assert normalize(state, 1.0) == State(1.0, math.pi / 7)


def test_decohere_uses_rng_when_no_jitter():
    state = State(1.0, 0.0)
    rng = DummyRandom([0.25])
    decohered = decohere(state, beta=math.log(2), rng=rng)
    assert pytest.approx(0.5) == decohered.r
    assert pytest.approx((0.25 * 2 * math.pi) % (2 * math.pi)) == decohered.phi


def test_decohere_with_fixed_jitter():
    state = State(1.0, 0.0)
    decohered = decohere(state, beta=0.0, jitter=math.pi / 3)
    assert pytest.approx(1.0) == decohered.r
    assert pytest.approx(math.pi / 3) == decohered.phi


def test_phase_cost_matches_landauer_floor_for_alignment():
    cost = phase_cost(0.0, 1.0, 1.0, temperature=300.0, lambda_=1.0)
    assert pytest.approx(0.0) == cost


def test_landauer_limit_matches_formula():
    bits = 2.0
    temperature = 300.0
    expected = bits * K_B * temperature * math.log(2.0)
    assert pytest.approx(expected) == landauer_limit(bits, temperature)
