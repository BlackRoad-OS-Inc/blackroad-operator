import sys
from pathlib import Path

import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "packages"))

from amundson_blackroad.adaptive import simulate_am5


def test_adaptive_gains_converge() -> None:
    T, dt = 2.0, 1e-3
    steps = int(np.ceil(T / dt)) + 1
    evidence = np.full(steps, 3.0)
    trust = np.zeros(steps)
    t, lam, eta = simulate_am5(T, dt, 0.1, 0.1, evidence, trust, alpha=0.5, beta=0.5)
    assert t.size == lam.size == eta.size
    assert 0.9 < lam[-1] < 1.0
    assert 0.45 < eta[-1] < 0.55
