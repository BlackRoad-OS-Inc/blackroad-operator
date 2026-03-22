from __future__ import annotations

import numpy as np

from quantum_lab.core import measurement, states


def test_probabilities_sum_to_one() -> None:
    state = states.plus_state()
    probs = measurement.probabilities(state)
    assert np.isclose(probs.sum(), 1.0)


def test_marginal_probabilities() -> None:
    state = states.bell_state(0)
    marg = measurement.marginal_probabilities(state, [0])
    assert np.allclose(marg, np.array([0.5, 0.5]))
