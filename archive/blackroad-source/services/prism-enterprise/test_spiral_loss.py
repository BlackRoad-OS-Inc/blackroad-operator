from __future__ import annotations

from pathlib import Path

import numpy as np

from tools.rf.spiral_loss import estimate_line, load_trace, reconstruct_spiral

DATA_PATH = Path("tools/rf/data/spiral_loss_sample.csv")
VENDOR_ALPHA = 2.4e-10
VENDOR_TOLERANCE = 0.05  # 5 %


def _load_demo_trace():
    return load_trace(
        path=DATA_PATH,
        distance_column="frequency_hz",
        real_column="real",
        imag_column="imag",
        magnitude_column=None,
        phase_column=None,
        phase_degrees=False,
    )


def test_alpha_matches_vendor_within_tolerance():
    trace = _load_demo_trace()
    spiral, line = estimate_line(trace)

    assert abs(line.alpha_magnitude - VENDOR_ALPHA) <= VENDOR_ALPHA * VENDOR_TOLERANCE
    np.testing.assert_allclose(line.c_hat, spiral.pitch, rtol=1e-6, atol=1e-6)

    fitted = reconstruct_spiral(trace, spiral, line)
    rel_err = np.linalg.norm(trace.gamma - fitted) / np.linalg.norm(trace.gamma)
    assert rel_err < 0.05
    assert 0.0 <= spiral.spiralness <= 1.0
