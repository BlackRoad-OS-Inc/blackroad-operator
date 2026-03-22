from pathlib import Path
import sys

import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from agents.blackroad_agent_framework_package5 import FourierConsciousnessAnalyzer


def test_resonances_pick_expected_frequencies():
    # 1 second duration at 1 kHz sample rate
    dt = 0.001
    t = np.arange(0.0, 1.0, dt)
    sig = np.sin(2 * np.pi * 5 * t) + 0.5 * np.sin(2 * np.pi * 10 * t)
    freqs = FourierConsciousnessAnalyzer.resonance_frequencies(sig, dt=dt, threshold=0.25)
    # FFT returns ±freq; compare on absolute, rounded bins
    rounded = set(np.round(np.abs(freqs)).astype(int).tolist())
    assert 5 in rounded
    assert 10 in rounded
