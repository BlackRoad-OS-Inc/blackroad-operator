"""Filesystem helpers with quotas."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Iterable

MAX_BYTES = int(os.environ.get("QLAB_MAX_BYTES", 1_048_576))

__all__ = ["safe_write", "safe_read", "within_quota"]


def within_quota(paths: Iterable[str | Path], limit_bytes: int | None = None) -> bool:
    """Check that the combined size of ``paths`` is within ``limit_bytes``."""

    limit = limit_bytes if limit_bytes is not None else MAX_BYTES
    total = 0
    for item in paths:
        path = Path(item)
        if path.exists():
            total += path.stat().st_size
    return total <= limit


def safe_write(path: str | Path, data: str, limit_bytes: int | None = None) -> None:
    """Write ``data`` to ``path`` if it respects the quota."""

    path = Path(path)
    limit = limit_bytes if limit_bytes is not None else MAX_BYTES
    encoded = data.encode("utf-8")
    if len(encoded) > limit:
        raise ValueError("Data exceeds allowed quota")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(encoded)


def safe_read(path: str | Path, limit_bytes: int | None = None) -> str:
    """Read text from ``path`` ensuring file size stays within the quota."""

    path = Path(path)
    limit = limit_bytes if limit_bytes is not None else MAX_BYTES
    if not path.exists():
        raise FileNotFoundError(path)
    if path.stat().st_size > limit:
        raise ValueError("File exceeds allowed quota")
    return path.read_text(encoding="utf-8")
