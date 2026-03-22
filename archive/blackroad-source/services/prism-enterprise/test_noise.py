from __future__ import annotations

import numpy as np

from quantum_lab.core import noise, states


def test_depolarizing_cptp() -> None:
    channel = noise.depolarizing_channel(0.1)
    assert noise.is_cptp(channel)


def test_noise_application_preserves_norm() -> None:
    state = states.plus_state()
    channel = noise.depolarizing_channel(0.2)
    noisy = noise.apply_kraus_channel(channel, state)
    assert np.isclose(np.linalg.norm(noisy), 1.0)
