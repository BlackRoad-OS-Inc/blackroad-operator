"""Toy factoring helper inspired by Shor's algorithm."""
from __future__ import annotations

from math import gcd
from random import randrange


def find_period(a: int, n: int) -> int:
    """Return the multiplicative order of a modulo n."""

    r = 1
    value = a % n
    while value != 1:
        value = (value * a) % n
        r += 1
    return r


def shor_toy(n: int) -> tuple[int, int]:
    """Factor a composite integer using classical period finding."""

    while True:
        a = randrange(2, n)
        if gcd(a, n) != 1:
            return gcd(a, n), n // gcd(a, n)
        r = find_period(a, n)
        if r % 2 == 0:
            candidate = pow(a, r // 2, n)
            if candidate not in (1, n - 1):
                factor1 = gcd(candidate - 1, n)
                factor2 = gcd(candidate + 1, n)
                if factor1 * factor2 == n and factor1 not in (1, n) and factor2 not in (1, n):
                    return factor1, factor2


def main() -> None:
    """Run the toy Shor routine."""

    n = 15
    factors = shor_toy(n)
    print(f"Factors of {n}: {factors}")


if __name__ == "__main__":
    main()
