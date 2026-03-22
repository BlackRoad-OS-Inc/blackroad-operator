from __future__ import annotations

import numpy as np

from roadqlm.sim.torch_statevector import batch_chsh


def test_chsh_peak_close_to_expected() -> None:
    thetas = np.linspace(0, np.pi, 128)
    scores = batch_chsh(thetas)
    assert float(np.max(scores)) <= 1.0
    assert scores.shape == (128,)
