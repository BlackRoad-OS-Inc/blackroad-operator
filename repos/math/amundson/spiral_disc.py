"""Circle-Limit style spiral tiling renderer.

This module implements the spiral swarm construction described in the Escher
notes.  A base motif is replicated along a logarithmic spiral with a fixed
pitch ``c = ln(s) / phi`` and subsequently mapped into the Poincaré disk via
``w = (z - i) / (z + i)``.  The output is a dense PNG image that resembles the
hyperbolic tilings from Escher's *Circle Limit* series.

Example usage::

    python -m math.amundson.spiral_disc motif.svg spiral.png \
        --arms 6 --scale 0.5 --copies 160 --canvas-size 2048

The script accepts either SVG or raster motif inputs.  When an SVG is
provided the file is rasterised via ``cairosvg``; install it with
``pip install cairosvg`` if it is not already available in the environment.
"""
from __future__ import annotations

import argparse
import importlib.util
import io
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Tuple

import numpy as np
from PIL import Image


@dataclass(frozen=True)
class SpiralDiscConfig:
    """Configuration for :func:`render_spiral_disc`."""

    arms: int = 6
    scale: float = 0.5
    copies: int = 144
    radial_offset: float = 1.6
    motif_extent: float = 1.0
    canvas_size: int = 2048
    point_stride: int = 1

    @property
    def pitch(self) -> float:
        """Return the logarithmic pitch ``c = ln(scale) / phi``."""

        phi = 2.0 * math.pi / float(self.arms)
        return math.log(self.scale) / phi


def _require_cairosvg() -> None:
    """Ensure that :mod:`cairosvg` is available before rasterising SVGs."""

    if importlib.util.find_spec("cairosvg") is None:
        raise RuntimeError(
            "SVG motifs require the 'cairosvg' dependency. Install it with "
            "`pip install cairosvg` or provide a raster image instead."
        )


def _load_svg_bytes(path: Path) -> bytes:
    """Rasterise the SVG file located at *path* into PNG bytes."""

    _require_cairosvg()
    import cairosvg

    return cairosvg.svg2png(url=str(path))


def _open_image(path: Path) -> Image.Image:
    """Open *path* as a Pillow image, rasterising SVG sources when needed."""

    suffix = path.suffix.lower()
    if suffix == ".svg":
        png_bytes = _load_svg_bytes(path)
        return Image.open(io.BytesIO(png_bytes))
    return Image.open(path)


def _sample_motif_points(
    image: Image.Image,
    extent: float,
    stride: int,
) -> Tuple[np.ndarray, np.ndarray]:
    """Return complex sample points and intensities extracted from *image*."""

    rgba = image.convert("RGBA")
    data = np.asarray(rgba, dtype=np.float32)
    alpha = data[..., 3]
    mask = alpha > 0
    if not np.any(mask):
        raise ValueError("The motif image does not contain any opaque pixels")

    ys, xs = np.nonzero(mask)
    if stride > 1:
        ys = ys[::stride]
        xs = xs[::stride]
    sample_rgba = data[ys, xs]
    sample_alpha = sample_rgba[:, 3] / 255.0
    rgb = sample_rgba[:, :3] / 255.0
    intensities = (
        0.2126 * rgb[:, 0] + 0.7152 * rgb[:, 1] + 0.0722 * rgb[:, 2]
    ) * sample_alpha

    width, height = rgba.size
    x = ((xs + 0.5) / float(width) - 0.5) * extent
    y = ((height - (ys + 0.5)) / float(height) - 0.5) * extent
    points = x + 1j * y
    return points.astype(np.complex128), intensities.astype(np.float64)


def _log_spiral_swarm(
    points: np.ndarray,
    intensities: np.ndarray,
    config: SpiralDiscConfig,
) -> Iterable[Tuple[np.ndarray, np.ndarray]]:
    """Yield transformed motif samples along the logarithmic spiral."""

    phi = 2.0 * math.pi / float(config.arms)
    rotations = np.exp(1j * np.arange(config.copies) * phi)
    scales = config.scale ** np.arange(config.copies)
    base = points + config.radial_offset

    for rot, scale in zip(rotations, scales):
        transformed = base * (scale * rot)
        yield transformed, intensities


def render_spiral_disc(motif: Path, output: Path, config: SpiralDiscConfig) -> None:
    """Render the spiral disc specified by *config* to *output* PNG file."""

    if config.arms <= 0:
        raise ValueError("arms must be positive")
    if not (0.0 < config.scale < 1.0):
        raise ValueError("scale must lie in (0, 1)")
    if config.copies <= 0:
        raise ValueError("copies must be positive")
    if config.canvas_size <= 0:
        raise ValueError("canvas_size must be positive")

    motif_image = _open_image(motif)
    points, intensities = _sample_motif_points(
        motif_image, extent=config.motif_extent, stride=max(1, config.point_stride)
    )
    canvas = np.zeros((config.canvas_size, config.canvas_size), dtype=np.float32)
    complex_i = 1j

    for transformed_points, sample_values in _log_spiral_swarm(points, intensities, config):
        denominator = transformed_points + complex_i
        valid = np.abs(denominator) > 1e-9
        if not np.any(valid):
            continue
        transformed_points = transformed_points[valid]
        sample_values = sample_values[valid]
        denominator = denominator[valid]
        numerators = transformed_points - complex_i
        mapped = numerators / denominator
        inside = np.abs(mapped) < 1.0
        if not np.any(inside):
            continue
        mapped = mapped[inside]
        sample_values = sample_values[inside]
        real = np.clip((mapped.real + 1.0) * 0.5 * (config.canvas_size - 1), 0, config.canvas_size - 1)
        imag = np.clip((1.0 - (mapped.imag + 1.0) * 0.5) * (config.canvas_size - 1), 0, config.canvas_size - 1)
        xi = real.astype(np.int32)
        yi = imag.astype(np.int32)
        canvas[yi, xi] = np.maximum(canvas[yi, xi], sample_values)

    image = Image.fromarray(np.clip(canvas * 255.0, 0, 255).astype(np.uint8), mode="L")
    image.save(output)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Render a Circle-Limit style spiral disc.")
    parser.add_argument("motif", type=Path, help="Path to the source motif (SVG or raster image).")
    parser.add_argument("output", type=Path, help="Destination PNG file.")
    parser.add_argument("--arms", type=int, default=6, help="Number of spiral arms (n in the recipe).")
    parser.add_argument(
        "--scale",
        type=float,
        default=0.5,
        help="Scale factor s between successive motif copies (0 < s < 1).",
    )
    parser.add_argument(
        "--copies",
        type=int,
        default=144,
        help="Maximum number of motif copies to place along the spiral.",
    )
    parser.add_argument(
        "--radial-offset",
        type=float,
        default=1.6,
        help="Base offset applied to motif samples before spiral replication.",
    )
    parser.add_argument(
        "--motif-extent",
        type=float,
        default=1.0,
        help="Width/height of the motif sample window in spiral units.",
    )
    parser.add_argument(
        "--canvas-size",
        type=int,
        default=2048,
        help="Output canvas size in pixels (produces a square PNG).",
    )
    parser.add_argument(
        "--point-stride",
        type=int,
        default=1,
        help="Sample every N-th opaque motif pixel to balance fidelity and speed.",
    )
    return parser


def main(argv: Iterable[str] | None = None) -> None:
    """CLI entry point for rendering a spiral disc."""

    parser = _build_parser()
    args = parser.parse_args(argv)
    config = SpiralDiscConfig(
        arms=args.arms,
        scale=args.scale,
        copies=args.copies,
        radial_offset=args.radial_offset,
        motif_extent=args.motif_extent,
        canvas_size=args.canvas_size,
        point_stride=args.point_stride,
    )
    render_spiral_disc(args.motif, args.output, config)
    print(
        f"Rendered spiral disc to {args.output} with pitch {config.pitch:.6f} "
        f"using {config.copies} copies.",
    )


if __name__ == "__main__":  # pragma: no cover - CLI utility
    main()
