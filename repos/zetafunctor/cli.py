"""Command line interface for the zeta functor toolkit."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Sequence

import numpy as np

from . import graphing, hashing, mandelbrot, zeta


def _load_text(args: argparse.Namespace) -> str:
    if args.file:
        return Path(args.file).read_text(encoding="utf-8")
    if args.text:
        return args.text
    raise SystemExit("Either --text or --file must be provided")


def command_hash(args: argparse.Namespace) -> None:
    text = _load_text(args)
    points = hashing.rolling_hash_to_complex(text, window=args.window, step=args.step)
    histogram = mandelbrot.escape_histogram(points, max_iter=args.max_iter, bailout=args.bailout)
    normalised = mandelbrot.normalise_histogram(histogram)
    for iteration, probability in normalised:
        print(f"iter={iteration:3d} probability={probability:.4f}")


def command_crossref(args: argparse.Namespace) -> None:
    edges = graphing.parse_cross_reference_csv(
        Path(args.csv),
        delimiter=args.delimiter,
        prime_only=args.prime_only,
    )
    adjacency = graphing.build_weighted_adjacency(edges)
    radius = zeta.radius_of_convergence(adjacency.matrix)
    print(f"parsed_edges={len(edges)} nodes={len(adjacency.index_to_node)} radius_bound={radius:.4f}")


def command_scan(args: argparse.Namespace) -> None:
    adjacency = graphing.build_cross_reference_adjacency(
        Path(args.csv),
        delimiter=args.delimiter,
        prime_only=args.prime_only,
    )
    radius = zeta.radius_of_convergence(adjacency.matrix)
    if np.isfinite(radius):
        stop = min(args.stop, 0.99 * radius)
    else:
        stop = args.stop
    if stop <= args.start:
        raise SystemExit("Scan stop must be greater than start after applying radius bound")
    z_values = np.linspace(args.start, stop, args.steps)
    samples = zeta.scan_zeta_magnitude(adjacency.matrix, (complex(z, 0.0) for z in z_values))
    for z_value, magnitude in samples:
        print(f"z={z_value.real:.4f} |zeta|={magnitude}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Zeta functor sandbox")
    subparsers = parser.add_subparsers(dest="command", required=True)

    hash_parser = subparsers.add_parser("hash", help="Hash text and collect Mandelbrot escape stats")
    hash_parser.add_argument("--text", help="Text to analyse")
    hash_parser.add_argument("--file", help="Path to text file")
    hash_parser.add_argument("--window", type=int, default=128, help="Sliding window size")
    hash_parser.add_argument("--step", type=int, default=1, help="Stride between windows")
    hash_parser.add_argument("--max-iter", type=int, default=256, help="Maximum Mandelbrot iterations")
    hash_parser.add_argument("--bailout", type=float, default=2.0, help="Escape radius")
    hash_parser.set_defaults(func=command_hash)

    cross_parser = subparsers.add_parser("crossref", help="Summarise cross-reference CSV into adjacency stats")
    cross_parser.add_argument("csv", help="Path to cross-reference CSV")
    cross_parser.add_argument("--delimiter", default=",", help="CSV delimiter")
    cross_parser.add_argument("--prime-only", action="store_true", help="Keep only prime-indexed rows")
    cross_parser.set_defaults(func=command_crossref)

    scan_parser = subparsers.add_parser("scan", help="Scan |zeta_A(z)| along the real axis")
    scan_parser.add_argument("csv", help="Path to cross-reference CSV")
    scan_parser.add_argument("--delimiter", default=",", help="CSV delimiter")
    scan_parser.add_argument("--prime-only", action="store_true", help="Keep only prime-indexed rows")
    scan_parser.add_argument("--start", type=float, default=0.0, help="Start of scan range")
    scan_parser.add_argument("--stop", type=float, default=1.0, help="End of scan range")
    scan_parser.add_argument("--steps", type=int, default=25, help="Number of evaluation points")
    scan_parser.set_defaults(func=command_scan)

    return parser


def main(argv: Sequence[str] | None = None) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.func(args)


if __name__ == "__main__":  # pragma: no cover
    main()
