# Zeta Functor Scaffold

This package stitches together text hashing, Mandelbrot escape analysis, and
weighted adjacency construction for scripture cross-reference studies.

## Features

- Rolling SHA-256 hashing with projections to the complex plane.
- Mandelbrot escape-time histograms for hashed points.
- Log-damped, row-normalised adjacency builders for bigram or edge-list inputs.
- CSV parser for Bible cross references with optional prime-index filtering.
- Rohonc glyph mapper that fits glyphs into a 256-symbol alphabet.
- Matrix zeta scans with spectral radius-derived convergence bounds.
- Command line interface and demo pipeline that produce ready-to-inspect plots.

## Quickstart

```bash
python -m zetafunctor.demo
```

This generates `histogram_mandelbrot_escape.png`, `zeta_mag_plot.png`, and a
sample cross-reference CSV illustrating the new tooling.

To explore individual pieces:

```bash
python -m zetafunctor.cli hash --text "In the beginning..."
python -m zetafunctor.cli crossref demo_crossrefs.csv
python -m zetafunctor.cli scan demo_crossrefs.csv --start 0.0 --stop 0.9 --steps 20
```

Add `--prime-only` to `crossref` or `scan` commands to restrict attention to
prime-indexed entries (1-based indexing).
