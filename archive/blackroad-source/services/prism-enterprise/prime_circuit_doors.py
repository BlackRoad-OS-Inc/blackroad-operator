"""Utility scaffolds for probing the 23 "door" experiments.

This module keeps the implementation intentionally lightweight so that a
researcher can start poking at the numerical and combinatorial patterns
immediately.  The focus is on doors 1, 2, 9, 11 (prime-analytic side) and
doors 14 and 18 (circuit/identity side).

Each helper exposes small, composable functions instead of heavyweight
frameworks.  The goal is to provide data quickly and make it easy to plug the
results into notebooks or bespoke analyses.

Usage examples are provided in the ``__main__`` block at the bottom of the
file.  They intentionally use small limits so that they run within seconds, but
all routines scale to larger inputs when computational resources allow it.
"""

from __future__ import annotations

import dataclasses
import itertools
import math
import random
from typing import Dict, Iterable, Iterator, List, Sequence, Tuple


# ---------------------------------------------------------------------------
# Prime-side helpers (doors 1, 2, 9, 11)
# ---------------------------------------------------------------------------


def _simple_sieve(limit: int) -> List[int]:
    """Return all primes up to ``limit`` using an ordinary sieve."""

    if limit < 2:
        return []

    sieve = bytearray(b"\x01") * (limit + 1)
    sieve[0:2] = b"\x00\x00"
    for p in range(2, int(limit ** 0.5) + 1):
        if sieve[p]:
            step = p
            start = p * p
            sieve[start : limit + 1 : step] = b"\x00" * ((limit - start) // step + 1)
    return [i for i, is_prime in enumerate(sieve) if is_prime]


def segmented_primes(limit: int, segment_size: int = 1 << 18) -> Iterator[int]:
    """Yield primes up to ``limit`` using a segmented sieve."""

    if limit < 2:
        return

    sqrt_limit = int(limit ** 0.5) + 1
    base_primes = _simple_sieve(sqrt_limit)

    yield from (p for p in base_primes if p <= limit)

    segment_size = max(segment_size, sqrt_limit)
    low = sqrt_limit + 1
    while low <= limit:
        high = min(low + segment_size - 1, limit)
        window = bytearray(b"\x01") * (high - low + 1)
        for p in base_primes:
            start = ((low + p - 1) // p) * p
            for multiple in range(start, high + 1, p):
                window[multiple - low] = 0
        for offset, is_prime in enumerate(window):
            if is_prime:
                yield low + offset
        low = high + 1


def chebyshev_psi_table(xs: Sequence[int]) -> List[float]:
    """Compute ``psi(x)`` for each ``x`` in ``xs``.

    The implementation shares the prime sieve across all queries.
    """

    if not xs:
        return []

    checkpoints = sorted(xs)
    limit = checkpoints[-1]

    psi_values: Dict[int, float] = {}
    total = 0.0
    checkpoint_idx = 0

    def flush_until(bound: int) -> None:
        nonlocal checkpoint_idx
        while checkpoint_idx < len(checkpoints) and checkpoints[checkpoint_idx] < bound:
            psi_values[checkpoints[checkpoint_idx]] = total
            checkpoint_idx += 1

    for p in segmented_primes(limit):
        log_p = math.log(p)
        flush_until(p)
        total += log_p
        if checkpoint_idx < len(checkpoints) and checkpoints[checkpoint_idx] == p:
            psi_values[p] = total
            checkpoint_idx += 1
        power = p * p
        while power <= limit:
            flush_until(power)
            total += log_p
            if checkpoint_idx < len(checkpoints) and checkpoints[checkpoint_idx] == power:
                psi_values[power] = total
                checkpoint_idx += 1
            power *= p

    flush_until(limit + 1)
    return [psi_values[x] for x in xs]


def square_root_shadow_fit(xs: Sequence[int]) -> float:
    """Estimate the exponent ``alpha`` with ``|psi(x)-x| ≈ x^alpha``.

    The function performs a log-log least squares fit on the supplied points.
    """

    psi_vals = chebyshev_psi_table(xs)
    errors = [abs(psi - x) for psi, x in zip(psi_vals, xs)]
    valid = [(math.log(x), math.log(err)) for x, err in zip(xs, errors) if err > 0]
    if len(valid) < 2:
        raise ValueError("Need at least two non-zero samples to estimate alpha")

    sum_x = sum(v[0] for v in valid)
    sum_y = sum(v[1] for v in valid)
    sum_xx = sum(v[0] ** 2 for v in valid)
    sum_xy = sum(v[0] * v[1] for v in valid)
    n = len(valid)

    numerator = n * sum_xy - sum_x * sum_y
    denominator = n * sum_xx - sum_x ** 2
    if denominator == 0:
        raise ZeroDivisionError("Log inputs are collinear; cannot fit slope")
    return numerator / denominator


def mobius_sieve(limit: int) -> List[int]:
    """Return ``mu(n)`` for ``n ≤ limit`` using a linear sieve."""

    mu = [1] * (limit + 1)
    primes: List[int] = []
    is_composite = [False] * (limit + 1)
    for i in range(2, limit + 1):
        if not is_composite[i]:
            primes.append(i)
            mu[i] = -1
        for p in primes:
            composite = p * i
            if composite > limit:
                break
            is_composite[composite] = True
            if i % p == 0:
                mu[composite] = 0
                break
            mu[composite] = -mu[i]
    return mu


def mertens_prefix(limit: int) -> List[int]:
    """Compute ``M(n) = Σ_{k ≤ n} μ(k)`` for ``n ≤ limit``."""

    mu = mobius_sieve(limit)
    prefix = [0] * (limit + 1)
    total = 0
    for n in range(1, limit + 1):
        total += mu[n]
        prefix[n] = total
    return prefix


def mobius_weighted_sum(limit: int) -> List[float]:
    """Return the sequence ``Σ_{k ≤ n} μ(k)/k`` for ``n ≤ limit``."""

    mu = mobius_sieve(limit)
    prefix = [0.0] * (limit + 1)
    total = 0.0
    for n in range(1, limit + 1):
        total += mu[n] / n
        prefix[n] = total
    return prefix


def chebyshev_deviation(xs: Sequence[int]) -> List[float]:
    """Return ``psi(x) - x`` for the supplied ``xs``."""

    psi_vals = chebyshev_psi_table(xs)
    return [psi - x for psi, x in zip(psi_vals, xs)]


def chebyshev_envelope(xs: Sequence[int]) -> List[float]:
    """Return the heuristic square-root envelope ``x^{1/2} log^2 x``."""

    return [math.sqrt(x) * (math.log(x) ** 2 if x > 1 else 0.0) for x in xs]


# ---------------------------------------------------------------------------
# Circuit/identity helpers (doors 14 and 18)
# ---------------------------------------------------------------------------


def parity_dnf_terms(n: int) -> List[Dict[int, int]]:
    """Return the canonical DNF terms for the parity function on ``n`` bits.

    Each term is represented as a dictionary ``{variable: literal}`` where
    ``literal`` is ``1`` for a positive occurrence and ``0`` for a negated
    occurrence.
    """

    terms = []
    for assignment in itertools.product((0, 1), repeat=n):
        if sum(assignment) % 2 == 1:
            term = {idx: bit for idx, bit in enumerate(assignment)}
            terms.append(term)
    return terms


def apply_random_restriction(
    n: int,
    free_probability: float,
    rng: random.Random | None = None,
) -> Tuple[Dict[int, int], List[int]]:
    """Generate a random restriction for ``n`` variables.

    Returns a tuple ``(assigned, free_vars)`` where ``assigned`` maps variables
    to fixed bits and ``free_vars`` lists the untouched indices.
    """

    rng = rng or random
    assigned: Dict[int, int] = {}
    free_vars: List[int] = []
    for idx in range(n):
        if rng.random() < free_probability:
            free_vars.append(idx)
        else:
            assigned[idx] = rng.randint(0, 1)
    return assigned, free_vars


def parity_restriction_profile(
    n: int,
    free_probability: float,
    trials: int = 256,
    rng: random.Random | None = None,
) -> Dict[str, float]:
    """Estimate how parity behaves under random restrictions.

    The return value summarises:

    * ``expected_terms`` – surviving DNF terms after applying the restriction.
    * ``expected_width`` – average number of free variables per surviving term.
    * ``shrunk_fraction`` – fraction of trials where the restricted DNF reduces
      to at most one term (hinting at decision tree collapse).
    """

    rng = rng or random
    terms = parity_dnf_terms(n)

    surviving_counts: List[int] = []
    surviving_widths: List[float] = []
    collapses = 0

    for _ in range(trials):
        assigned, free_vars = apply_random_restriction(n, free_probability, rng)
        free_set = set(free_vars)
        survivors = 0
        width_accum = 0
        for term in terms:
            matches = True
            width = 0
            for var, literal in term.items():
                if var in assigned and assigned[var] != literal:
                    matches = False
                    break
                if var in free_set:
                    width += 1
            if matches:
                survivors += 1
                width_accum += width
        surviving_counts.append(survivors)
        if survivors:
            surviving_widths.append(width_accum / survivors)
        else:
            surviving_widths.append(0.0)
        if survivors <= 1:
            collapses += 1

    def average(values: Iterable[float]) -> float:
        values = list(values)
        return sum(values) / len(values) if values else 0.0

    return {
        "expected_terms": average(surviving_counts),
        "expected_width": average(surviving_widths),
        "shrunk_fraction": collapses / trials,
    }


# Sparse polynomial identity testing -------------------------------------------------


@dataclasses.dataclass(frozen=True)
class SparseTerm:
    coefficient: int
    exponents: Tuple[int, ...]


@dataclasses.dataclass
class SparsePolynomial:
    """Sparse polynomial with integer coefficients."""

    terms: Tuple[SparseTerm, ...]

    def variables(self) -> int:
        return max((len(term.exponents) for term in self.terms), default=0)

    def evaluate(self, point: Sequence[int], modulus: int | None = None) -> int:
        """Evaluate at ``point``; optionally reduce modulo ``modulus``."""

        if len(point) < self.variables():
            raise ValueError("Point dimension is smaller than the polynomial arity")
        result = 0
        for term in self.terms:
            value = term.coefficient
            for exponent, coordinate in zip(term.exponents, point):
                value *= coordinate ** exponent
            result += value
        if modulus is not None:
            result %= modulus
        return result


def random_identity_test(
    polynomial: SparsePolynomial,
    field_modulus: int,
    trials: int = 8,
    rng: random.Random | None = None,
) -> bool:
    """Return ``True`` if all random evaluations vanish modulo ``field_modulus``."""

    rng = rng or random
    vars_count = polynomial.variables()
    for _ in range(trials):
        point = [rng.randrange(1, field_modulus) for _ in range(vars_count)]
        if polynomial.evaluate(point, modulus=field_modulus) != 0:
            return False
    return True


def kronecker_hitting_set(
    sparsity: int,
    degree: int,
    variables: int,
    base: int | None = None,
) -> List[Tuple[int, ...]]:
    """Construct a small deterministic hitting set via Kronecker substitution.

    The points are tuples ``(b^0, b^1, …, b^{variables-1})`` evaluated at
    different bases ``b``.  ``base`` overrides the default choice ``degree + 1``.
    """

    if sparsity <= 0:
        return []
    growth_base = base or (degree + 1)
    points = []
    for offset in range(sparsity):
        b = growth_base + offset
        point = tuple(b ** i for i in range(variables))
        points.append(point)
    return points


def deterministic_identity_test(
    polynomial: SparsePolynomial,
    sparsity: int,
    degree: int,
    modulus: int,
) -> bool:
    """Deterministic sparse PIT using a Kronecker-style hitting set."""

    for point in kronecker_hitting_set(sparsity, degree, polynomial.variables()):
        if polynomial.evaluate(point, modulus=modulus) != 0:
            return False
    return True


# ---------------------------------------------------------------------------
# Demonstration harness
# ---------------------------------------------------------------------------


def _demo_prime_side() -> None:
    xs = [10 ** k for k in range(3, 6)]
    alpha = square_root_shadow_fit(xs)
    deviations = chebyshev_deviation(xs)
    envelope = chebyshev_envelope(xs)
    mertens = mertens_prefix(10_000)
    weighted = mobius_weighted_sum(10_000)

    print("Square-root shadow alpha (sample):", alpha)
    print("Chebyshev deviations:")
    for x, dev, env in zip(xs, deviations, envelope):
        print(f"  x={x:>8d} psi(x)-x={dev:>12.2f} envelope≈{env:>12.2f}")
    print("Mertens max up to 10^4:", max(abs(v) for v in mertens))
    print("Weighted Möbius tail at 10^4:", weighted[-1])


def _demo_circuit_side() -> None:
    profile = parity_restriction_profile(n=6, free_probability=0.3, trials=64)
    print("Parity restriction profile (n=6, p=0.3):", profile)

    poly = SparsePolynomial(
        terms=(
            SparseTerm(1, (1, 0)),
            SparseTerm(1, (0, 1)),
            SparseTerm(-1, (0, 0)),
        )
    )
    print(
        "Random PIT verdict:",
        random_identity_test(poly, field_modulus=1_000_003, trials=5),
    )
    print(
        "Deterministic PIT verdict:",
        deterministic_identity_test(poly, sparsity=3, degree=1, modulus=1_000_003),
    )


if __name__ == "__main__":
    _demo_prime_side()
    _demo_circuit_side()

