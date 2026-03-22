import math
import pytest

from prism_math_spiral.primes import (
    FIRST_ZETA_ZEROS,
    chebyshev_psi,
    synthesise_psi,
)


def _psi_direct(x: int) -> float:
    primes = _sieve(int(x))
    total = 0.0
    for p in primes:
        power = p
        while power <= x:
            total += math.log(p)
            power *= p
    return total


def _sieve(limit: int) -> list[int]:
    if limit < 2:
        return []
    sieve = [True] * (limit + 1)
    sieve[0] = sieve[1] = False
    for p in range(2, int(limit ** 0.5) + 1):
        if sieve[p]:
            step = p
            sieve[p * p :: step] = [False] * ((limit - p * p) // step + 1)
    return [i for i, is_prime in enumerate(sieve) if is_prime]


def test_zero_contribution_matches_formula():
    x = 100.0
    zero = FIRST_ZETA_ZEROS[0]
    contribution = chebyshev_psi(x, [zero]).contributions[0]
    sigma = zero.real
    abs_rho = abs(zero)
    phase = -math.atan2(zero.imag, zero.real)
    expected = 2.0 * (x ** sigma) / abs_rho * math.cos(zero.imag * math.log(x) + phase)
    assert contribution.value == pytest.approx(expected, rel=1e-12)


def test_chebyshev_psi_close_to_actual():
    zeros = FIRST_ZETA_ZEROS[:8]
    x = 100.0
    decomposition = chebyshev_psi(x, zeros, correction_terms=6)
    actual = _psi_direct(int(x))
    assert decomposition.value == pytest.approx(actual, rel=0.03, abs=0.25)


def test_synthesise_multiple_points():
    zeros = FIRST_ZETA_ZEROS[:5]
    xs = [10.0, 20.0, 30.0]
    grid = synthesise_psi(xs, zeros=zeros, correction_terms=5)
    assert [round(item.x, 1) for item in grid] == [10.0, 20.0, 30.0]
    assert len(grid[0].contributions) == len(zeros)
