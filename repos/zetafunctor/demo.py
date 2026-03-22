"""Run the complete zeta functor showcase pipeline."""

from __future__ import annotations

import csv
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

from . import graphing, hashing, mandelbrot, zeta


OUTPUT_DIR = Path(".")
HISTOGRAM_PATH = OUTPUT_DIR / "histogram_mandelbrot_escape.png"
ZETA_PATH = OUTPUT_DIR / "zeta_mag_plot.png"
CROSSREF_CSV = OUTPUT_DIR / "demo_crossrefs.csv"


SAMPLE_TEXT = """In the beginning God created the heaven and the earth. The earth was without form."""


SAMPLE_CROSSREFS = [
    {"source": "Genesis 1:1", "target": "John 1:1", "count": 12, "semantic": 0.92},
    {"source": "Genesis 1:1", "target": "Psalm 104:30", "count": 5, "semantic": 0.71},
    {"source": "Exodus 3:14", "target": "John 8:58", "count": 7, "semantic": 0.88},
    {"source": "Isaiah 40:3", "target": "Matthew 3:3", "count": 10, "semantic": 0.94},
    {"source": "Jeremiah 31:31", "target": "Hebrews 8:8", "count": 4, "semantic": 0.67},
]


def write_demo_crossrefs(path: Path) -> None:
    with path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=["source", "target", "count", "semantic"])
        writer.writeheader()
        writer.writerows(SAMPLE_CROSSREFS)


def run_hashing_demo(text: str) -> None:
    points = hashing.hash_blocks_to_complex(text, block_size=64)
    histogram = mandelbrot.escape_histogram(points, max_iter=128)
    normalised = mandelbrot.normalise_histogram(histogram)

    plt.figure(figsize=(6, 4))
    xs = [iteration for iteration, _ in normalised]
    ys = [probability for _, probability in normalised]
    plt.bar(xs, ys, width=0.8)
    plt.xlabel("Iterations")
    plt.ylabel("Probability")
    plt.title("Mandelbrot Escape Histogram")
    plt.tight_layout()
    plt.savefig(HISTOGRAM_PATH)
    plt.close()


def run_crossref_demo(csv_path: Path) -> graphing.AdjacencyResult:
    edges = graphing.parse_cross_reference_csv(csv_path)
    adjacency = graphing.build_weighted_adjacency(edges)
    prime_edges = graphing.parse_cross_reference_csv(csv_path, prime_only=True)
    print(f"parsed {len(edges)} edges ({len(prime_edges)} with prime index toggle)")
    return adjacency


def run_zeta_scan(adjacency: graphing.AdjacencyResult) -> None:
    radius = zeta.radius_of_convergence(adjacency.matrix)
    if not np.isfinite(radius):
        radius = 1.0
    z_values = np.linspace(0.0, 0.99 * radius, 50)
    samples = zeta.scan_zeta_magnitude(adjacency.matrix, (complex(z, 0.0) for z in z_values))

    plt.figure(figsize=(6, 4))
    plt.plot([z.real for z, _ in samples], [mag for _, mag in samples])
    plt.xlabel("z (real axis)")
    plt.ylabel("|zeta_A(z)|")
    plt.title("Zeta Magnitude Scan")
    plt.tight_layout()
    plt.savefig(ZETA_PATH)
    plt.close()


def main() -> None:
    write_demo_crossrefs(CROSSREF_CSV)
    run_hashing_demo(SAMPLE_TEXT)
    adjacency = run_crossref_demo(CROSSREF_CSV)
    run_zeta_scan(adjacency)
    print(f"Histogram written to {HISTOGRAM_PATH}")
    print(f"Zeta scan written to {ZETA_PATH}")


if __name__ == "__main__":
    main()
