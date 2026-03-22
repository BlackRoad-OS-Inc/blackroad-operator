from __future__ import annotations

from pathlib import Path
import runpy

import sys

HERE = Path(__file__).resolve()
MODULE_ROOT = HERE.parents[3]
if str(MODULE_ROOT) not in sys.path:
    sys.path.insert(0, str(MODULE_ROOT))
TARGET = MODULE_ROOT / "scripts" / "make_gate_input.py"

if __name__ == "__main__":
    runpy.run_path(str(TARGET), run_name="__main__")
