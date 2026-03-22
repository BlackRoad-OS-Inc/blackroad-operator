"""Prime number analytics used by the math API."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List

import matplotlib
import matplotlib.pyplot as plt

from .storage import ensure_domain

matplotlib.use("Agg", force=True)

DOMAIN = "primes"


@dataclass(slots=True)
class PrimeComputation:
    """Container holding prime results and artefacts."""

    limit: int
    primes: List[int]
    plot_path: Path | None

    @property
    def invariants(self) -> Dict[str, float]:
        density = len(self.primes) / max(self.limit, 1)
        return {
            "count": float(len(self.primes)),
            "density": density,
            "nth_prime": float(self.primes[-1]) if self.primes else 0.0,
        }


def _timestamp() -> str:
    return datetime.utcnow().strftime("%Y%m%dT%H%M%S%f")


def sieve(limit: int) -> List[int]:
    """Return all primes <= ``limit`` using a simple sieve."""

    if limit < 2:
        return []
    candidates = [True] * (limit + 1)
    candidates[0:2] = [False, False]
    for p in range(2, int(limit ** 0.5) + 1):
        if candidates[p]:
            step = p
            start = p * p
            candidates[start : limit + 1 : step] = [False] * len(range(start, limit + 1, step))
    return [n for n, is_prime in enumerate(candidates) if is_prime]


def plot_primes(primes: List[int], *, output_dir: Path) -> Path:
    """Create a scatter plot of primes."""

    output_dir.mkdir(parents=True, exist_ok=True)
    file_path = output_dir / f"primes_{_timestamp()}.png"
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
    ax.plot(primes, "o", markersize=2)
    ax.set_xlabel("Index")
    ax.set_ylabel("Prime value")
    ax.set_title("Prime numbers")
    fig.tight_layout()
    fig.savefig(file_path)
    plt.close(fig)
    return file_path


def generate_primes(limit: int, *, with_plot: bool = True) -> PrimeComputation:
    if limit <= 0:
        raise ValueError("limit must be positive")
    primes = sieve(limit)
    plot_path: Path | None = None
    if with_plot and primes:
        plot_path = plot_primes(primes, output_dir=ensure_domain(DOMAIN))
    return PrimeComputation(limit=limit, primes=primes, plot_path=plot_path)


def demo() -> Dict[str, object]:
    result = generate_primes(200, with_plot=True)
    payload: Dict[str, object] = {
        "limit": result.limit,
        "count": len(result.primes),
        "invariants": result.invariants,
    }
    if result.plot_path:
        payload["plot_path"] = str(result.plot_path)
    return payload
