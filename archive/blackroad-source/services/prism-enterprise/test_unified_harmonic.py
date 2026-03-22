from pathlib import Path
import sys

import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from agents.blackroad_agent_framework_package5 import UnifiedHarmonicOperator


def test_unified_harmonic_action_is_finite_and_nonzero():
    op = UnifiedHarmonicOperator()
    val = op.compute_unified_action(n_points=512)
    assert isinstance(val, complex)
    assert np.isfinite(val.real)
    assert np.isfinite(val.imag)
    assert abs(val) > 0.0
