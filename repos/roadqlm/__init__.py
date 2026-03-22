"""RoadQLM – agent-first quantum SDK."""

from __future__ import annotations

from importlib import metadata

try:  # pragma: no cover - fallback for editable installs
    __version__ = metadata.version("roadqlm")
except metadata.PackageNotFoundError:  # pragma: no cover
    __version__ = "0.1.0a0"

__all__ = ["__version__"]
