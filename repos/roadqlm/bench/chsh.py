"""CHSH benchmark."""

from __future__ import annotations

import numpy as np

from ..sim.torch_statevector import batch_chsh


def run(theta_count: int = 64) -> dict[str, float]:
    thetas = np.linspace(0, np.pi, theta_count)
    scores = batch_chsh(thetas)
    s_max = float(np.max(scores))
    return {"theta_count": float(theta_count), "s_max": s_max}


__all__ = ["run"]
