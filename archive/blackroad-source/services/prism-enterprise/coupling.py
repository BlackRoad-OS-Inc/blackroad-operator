"""Curvature coupling helpers (BR-6)."""

from __future__ import annotations

from typing import Callable

import numpy as np

Array = np.ndarray


def curvature_source(curvature: Array, *, gain: float = 1.0) -> Array:
    """Map curvature input into a source term for the autonomy field."""

    return gain * curvature


def couple_curvature_response(
    curvature: Array,
    a_field: Array,
    *,
    gain: float = 1.0,
    response_fn: Callable[[Array], Array] | None = None,
) -> Array:
    """Apply curvature sourced signals onto the a-field."""

    if response_fn is None:
        response_fn = np.tanh
    source = curvature_source(curvature, gain=gain)
    return a_field + response_fn(source)
