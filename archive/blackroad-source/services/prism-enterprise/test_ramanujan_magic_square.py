from pathlib import Path
import sys

import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from agents.blackroad_agent_framework_package5 import RamanujanMagicSquare


def test_ramanujan_magic_square_verifies():
    ms = RamanujanMagicSquare()
    square = ms.create_ramanujan_dob_square()
    v = ms.verify_magic()
    assert square.shape == (4, 4)
    assert v["is_magic"], "Square should satisfy magic constraints"
    # All rows/cols equal the magic constant
    target = ms.magic_constant
    assert all(square[i, :].sum() == target for i in range(4))
    assert all(square[:, j].sum() == target for j in range(4))
    assert np.trace(square) == target
    assert np.trace(np.fliplr(square)) == target
