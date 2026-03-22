"""Mandelbrot escape-time helpers."""

from __future__ import annotations

from collections import Counter
from typing import Iterable, List, Tuple


def escape_time(c: complex, max_iter: int = 256, bailout: float = 2.0) -> int:
    """Return the iteration count needed for ``c`` to escape the Mandelbrot set."""

    z = 0j
    for i in range(max_iter):
        z = z * z + c
        if abs(z) > bailout:
            return i
    return max_iter


def escape_histogram(points: Iterable[complex], max_iter: int = 256, bailout: float = 2.0) -> Counter:
    """Compute a histogram of escape iterations for a collection of points."""

    histogram: Counter = Counter()
    for point in points:
        histogram[escape_time(point, max_iter=max_iter, bailout=bailout)] += 1
    return histogram


def normalise_histogram(histogram: Counter) -> List[Tuple[int, float]]:
    """Normalise a histogram so that the values sum to 1."""

    total = sum(histogram.values())
    if total == 0:
        return [(key, 0.0) for key in sorted(histogram.keys())]
    return [(key, count / total) for key, count in sorted(histogram.items())]
