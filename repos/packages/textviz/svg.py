"""SVG generation utilities for text-first rendering."""
from __future__ import annotations

from typing import Iterable, Sequence


def _normalise_range(values: Sequence[float]) -> tuple[float, float]:
    lo = min(values)
    hi = max(values)
    if hi - lo < 1e-12:
        hi = lo + 1.0
    return lo, hi


def line_svg(
    xs: Sequence[float],
    ys: Sequence[float],
    *,
    width: int = 600,
    height: int = 300,
    margin: int = 40,
    stroke: str = "currentColor",
    stroke_width: float = 1.5,
) -> str:
    """Return an SVG polyline chart for ``(xs, ys)`` samples."""

    if len(xs) != len(ys):
        raise ValueError("xs and ys must have equal length")
    if len(xs) < 2:
        raise ValueError("line plots require at least two samples")

    x0, x1 = _normalise_range(xs)
    y0, y1 = _normalise_range(ys)

    def scale_x(x: float) -> float:
        return margin + (x - x0) / (x1 - x0) * (width - 2 * margin)

    def scale_y(y: float) -> float:
        return height - margin - (y - y0) / (y1 - y0) * (height - 2 * margin)

    points = " ".join(f"{scale_x(x):.2f},{scale_y(y):.2f}" for x, y in zip(xs, ys))
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}">'  # noqa: E501
        f'<polyline fill="none" stroke="{stroke}" stroke-width="{stroke_width}" points="{points}"/>'
        "</svg>"
    )


def heatmap_svg(
    grid: Sequence[Sequence[float]],
    *,
    width: int = 400,
    height: int = 400,
    margin: int = 10,
    palette: Iterable[str] | None = None,
) -> str:
    """Render a 2D array as an SVG heatmap using rectangles."""

    rows = list(grid)
    if not rows or not rows[0]:
        raise ValueError("grid must contain at least one element")
    cols = len(rows[0])
    for row in rows:
        if len(row) != cols:
            raise ValueError("heatmap rows must have equal length")

    flat = [float(v) for row in rows for v in row]
    lo, hi = _normalise_range(flat)

    def normalise(value: float) -> float:
        return (value - lo) / (hi - lo)

    if palette is None:
        palette = (
            "#000000",
            "#1b1f3b",
            "#283e68",
            "#3972a6",
            "#4aa3d8",
            "#7cc5f2",
            "#b7e3ff",
        )
    palette_list = list(palette)
    if len(palette_list) < 2:
        raise ValueError("palette must contain at least two colours")

    cell_w = (width - 2 * margin) / cols
    cell_h = (height - 2 * margin) / len(rows)

    rects = []
    for r, row in enumerate(rows):
        for c, value in enumerate(row):
            ratio = normalise(float(value))
            idx = min(int(ratio * (len(palette_list) - 1)), len(palette_list) - 1)
            color = palette_list[idx]
            x = margin + c * cell_w
            y = margin + r * cell_h
            rects.append(
                f'<rect x="{x:.2f}" y="{y:.2f}" width="{cell_w:.2f}" height="{cell_h:.2f}" '
                f'fill="{color}" />'
            )

    rects_str = "".join(rects)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}">'
        f"{rects_str}" "</svg>"
    )
