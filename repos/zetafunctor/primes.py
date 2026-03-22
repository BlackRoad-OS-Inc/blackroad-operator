"""Prime utilities used throughout the zeta functor toolkit."""

from __future__ import annotations

from math import isqrt
from typing import Iterable, Iterator, List, Sequence


def sieve(limit: int) -> List[int]:
    """Return all primes ``<= limit`` using a standard sieve of Eratosthenes."""

    if limit < 2:
        return []
    is_prime = [True] * (limit + 1)
    is_prime[0:2] = [False, False]
    for number in range(2, isqrt(limit) + 1):
        if is_prime[number]:
            step = number
            start = number * number
            is_prime[start : limit + 1 : step] = [False] * ((limit - start) // step + 1)
    return [i for i, prime in enumerate(is_prime) if prime]


def is_prime(value: int) -> bool:
    """Simple primality check suitable for moderate values."""

    if value < 2:
        return False
    if value in (2, 3):
        return True
    if value % 2 == 0 or value % 3 == 0:
        return False
    limit = isqrt(value)
    factor = 5
    step = 2
    while factor <= limit:
        if value % factor == 0:
            return False
        factor += step
        step = 6 - step
    return True


def prime_index_subsequence(sequence: Sequence) -> List:
    """Return elements whose 1-based index is prime."""

    return [value for idx, value in enumerate(sequence, start=1) if is_prime(idx)]


def prime_index_iterable(iterable: Iterable) -> Iterator:
    """Yield elements from ``iterable`` whose 1-based index is prime."""

    for idx, value in enumerate(iterable, start=1):
        if is_prime(idx):
            yield value
