"""Modular arithmetic helpers used by the Prism Console CLI."""

from __future__ import annotations

from dataclasses import dataclass
from time import perf_counter
from typing import Iterable, List

__all__ = [
    "modexp",
    "multiplicative_order",
    "MultiplicativeOrderError",
    "benchmark_modexp",
    "BenchmarkResult",
    "prime_factors",
    "euler_totient",
    "gcd",
]


class MultiplicativeOrderError(ValueError):
    """Raised when the multiplicative order cannot be determined under the given constraints."""


def _validate_int(name: str, value: int, *, minimum: int | None = None) -> int:
    if not isinstance(value, int):
        raise TypeError(f"{name} must be an integer; received {type(value).__name__}.")
    if minimum is not None and value < minimum:
        raise ValueError(f"{name} must be >= {minimum}.")
    return value


def modexp(base: int, exponent: int, modulus: int) -> int:
    """Compute ``base ** exponent mod modulus`` using exponentiation by squaring."""

    base = _validate_int("base", base)
    exponent = _validate_int("exponent", exponent, minimum=0)
    modulus = _validate_int("modulus", modulus, minimum=1)

    base %= modulus
    result = 1
    power = base
    exp = exponent

    while exp > 0:
        if exp & 1:
            result = (result * power) % modulus
        power = (power * power) % modulus
        exp >>= 1
    return result


def gcd(a: int, b: int) -> int:
    """Return the greatest common divisor of ``a`` and ``b``."""

    while b:
        a, b = b, a % b
    return abs(a)


def prime_factors(n: int) -> List[int]:
    """Return the prime factors of ``n`` with multiplicity using trial division."""

    n = _validate_int("n", n, minimum=1)
    factors: List[int] = []
    candidate = 2
    value = n
    while candidate * candidate <= value:
        while value % candidate == 0:
            factors.append(candidate)
            value //= candidate
        candidate += 1 if candidate == 2 else 2
    if value > 1:
        factors.append(value)
    return factors


def euler_totient(n: int) -> int:
    """Compute Euler's totient function φ(n) via prime factorisation."""

    n = _validate_int("n", n, minimum=1)
    result = n
    for p in set(prime_factors(n)):
        result -= result // p
    return result


def multiplicative_order(base: int, modulus: int, *, max_iter: int | None = None) -> int:
    """Return the smallest positive integer ``k`` with ``base**k ≡ 1 (mod modulus)``."""

    base = _validate_int("base", base)
    modulus = _validate_int("modulus", modulus, minimum=2)
    if max_iter is not None:
        max_iter = _validate_int("max_iter", max_iter, minimum=1)

    if gcd(base, modulus) != 1:
        raise MultiplicativeOrderError("base and modulus must be coprime to have an order.")

    phi = euler_totient(modulus)
    order = phi
    for prime in set(prime_factors(phi)):
        while order % prime == 0 and modexp(base, order // prime, modulus) == 1:
            order //= prime

    if max_iter is not None and order > max_iter:
        raise MultiplicativeOrderError(
            "order exceeds max_iter; increase the limit to compute the full order."
        )

    if modexp(base, order, modulus) != 1:
        raise MultiplicativeOrderError("failed to determine multiplicative order within limits.")
    return order


@dataclass(frozen=True)
class BenchmarkResult:
    """Container for benchmark outcomes."""

    iterations: int
    elapsed_seconds: float


def benchmark_modexp(base: int, exponent: int, modulus: int, *, iterations: int = 10) -> BenchmarkResult:
    """Benchmark ``modexp`` for a number of iterations and report total runtime."""

    iterations = _validate_int("iterations", iterations, minimum=1)
    start = perf_counter()
    for _ in range(iterations):
        modexp(base, exponent, modulus)
    elapsed = perf_counter() - start
    return BenchmarkResult(iterations=iterations, elapsed_seconds=elapsed)
