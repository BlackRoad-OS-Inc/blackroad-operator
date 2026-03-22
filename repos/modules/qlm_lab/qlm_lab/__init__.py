"""QLM Lab package bootstrap."""
from __future__ import annotations

import os
import random
from pathlib import Path
from typing import Any, Dict

import numpy as np

__version__ = "0.1.0"
QLAB_DEFAULT_SEED = 1337


def _init_seed() -> int:
    """Initialise the global random seed."""

    raw = os.environ.get("QLAB_SEED")
    try:
        seed = int(raw) if raw is not None else QLAB_DEFAULT_SEED
    except ValueError as exc:  # pragma: no cover - defensive branch
        raise ValueError("QLAB_SEED must be an integer") from exc
    random.seed(seed)
    np.random.seed(seed)
    return seed


SEED = _init_seed()


def package_info() -> Dict[str, Any]:
    """Return metadata about the package runtime state."""

    return {"seed": SEED, "root": str(Path(__file__).resolve().parent)}


__all__ = ["__version__", "SEED", "package_info"]
