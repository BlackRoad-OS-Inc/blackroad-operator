"""Mandelbrot and related fractal utilities for the math service."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, Tuple

import matplotlib
import matplotlib.pyplot as plt
import numpy as np

from .storage import ensure_domain

matplotlib.use("Agg", force=True)

DOMAIN = "fractals"
ESCAPE_RADIUS = 2.0


@dataclass(slots=True)
class MandelbrotComputation:
    """Result of a Mandelbrot generation pass."""

    image_path: Path
    params: Dict[str, float | int]
    invariants: Dict[str, float]
    grid_shape: Tuple[int, int]


def _timestamp() -> str:
    return datetime.utcnow().strftime("%Y%m%dT%H%M%S%f")


def _resolve_cmap(name: str) -> str:
    if name in plt.colormaps():
        return name
    raise ValueError(f"Unknown colormap '{name}'")


def render_mandelbrot(
    *,
    width: int = 512,
    height: int = 512,
    max_iter: int = 256,
    xmin: float = -2.0,
    xmax: float = 1.0,
    ymin: float = -1.5,
    ymax: float = 1.5,
    cmap: str = "viridis",
) -> MandelbrotComputation:
    """Render a Mandelbrot image with configurable bounds."""

    if width <= 0 or height <= 0:
        raise ValueError("width and height must be positive")
    if max_iter <= 0:
        raise ValueError("max_iter must be positive")
    if xmin >= xmax or ymin >= ymax:
        raise ValueError("invalid coordinate bounds")

    _resolve_cmap(cmap)
    output_dir = ensure_domain(DOMAIN)
    file_path = output_dir / f"mandelbrot_{_timestamp()}.png"

    x = np.linspace(xmin, xmax, width)
    y = np.linspace(ymin, ymax, height)
    C = x[None, :] + 1j * y[:, None]
    Z = np.zeros_like(C)
    divergence = np.zeros(C.shape, dtype=int)

    for idx in range(max_iter):
        mask = divergence == 0
        Z[mask] = Z[mask] ** 2 + C[mask]
        diverged = np.greater(np.abs(Z), ESCAPE_RADIUS) & mask
        divergence[diverged] = idx

    fig, ax = plt.subplots(figsize=(6, 6), dpi=150)
    ax.imshow(
        divergence,
        extent=(xmin, xmax, ymin, ymax),
        cmap=cmap,
        origin="lower",
    )
    ax.set_axis_off()
    fig.savefig(file_path, bbox_inches="tight", pad_inches=0)
    plt.close(fig)

    bounded = int((divergence == 0).sum())
    total = int(divergence.size)
    invariants = {
        "escape_radius": ESCAPE_RADIUS,
        "bounded_fraction": bounded / total,
        "max_iter": float(max_iter),
    }
    params = {
        "width": width,
        "height": height,
        "xmin": xmin,
        "xmax": xmax,
        "ymin": ymin,
        "ymax": ymax,
        "cmap": cmap,
    }

    return MandelbrotComputation(
        image_path=file_path,
        params=params,
        invariants=invariants,
        grid_shape=(height, width),
    )


def generate_fractal(**kwargs) -> str:
    """Compatibility helper returning only the image path."""

    result = render_mandelbrot(**kwargs)
    return str(result.image_path)


def demo() -> Dict[str, object]:
    """Generate a demo artefact and return summary information."""

    result = render_mandelbrot(width=256, height=256, max_iter=64)
    return {
        "path": str(result.image_path),
        "params": result.params,
        "invariants": result.invariants,
    }
