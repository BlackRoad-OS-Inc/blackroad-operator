"""Portable Graymap (P2) helpers for ASCII rendering."""
from __future__ import annotations

from typing import Sequence

import numpy as np


ArrayLike = Sequence[Sequence[float]] | np.ndarray


def normalize_to_uint8(values: ArrayLike, *, maxval: int = 255) -> list[list[int]]:
    """Scale ``values`` into ``0..maxval`` integer buckets."""

    data = np.asarray(values, dtype=float)
    if data.ndim != 2:
        raise ValueError("values must be a 2D array")
    vmin = float(np.min(data))
    vmax = float(np.max(data))
    if vmax - vmin < 1e-12:
        vmax = vmin + 1.0
    scaled = (data - vmin) / (vmax - vmin) * maxval
    clipped = np.clip(np.rint(scaled), 0, maxval)
    return clipped.astype(int).tolist()


def pgm_p2(gray: ArrayLike, *, maxval: int = 255) -> str:
    """Return an ASCII Portable Graymap string for ``gray`` values."""

    rows = normalize_to_uint8(gray, maxval=maxval)
    height = len(rows)
    width = len(rows[0]) if height else 0
    header = f"P2\n{width} {height}\n{maxval}\n"
    body = "\n".join(" ".join(str(pixel) for pixel in row) for row in rows)
    return header + body + "\n"
