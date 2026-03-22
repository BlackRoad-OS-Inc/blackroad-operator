"""Module entry-point for ``python -m lucid_ego``."""
from __future__ import annotations

import sys

from .cli import main


if __name__ == "__main__":  # pragma: no cover - manual invocation guard
    sys.exit(main())
