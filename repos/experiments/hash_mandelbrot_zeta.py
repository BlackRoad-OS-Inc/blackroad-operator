"""Hash-to-Mandelbrot and text-graph zeta pipeline.

This module implements the refinements discussed in the latest
Mandelbrot/hash/zeta worklog:

* Rolling SHA-256 hashes are treated as iterates of an ergodic toral map.
* The hashes are projected onto Mandelbrot parameters that exhibit
  postcritically finite (preperiodic) kneading sequences so that
  ``\zeta_{f_c}`` captures hyperbolic components.
* Text streams (Rohonc, Biblical corpora, or surrogates) are converted into
  byte-level bigram graphs whose Artin--Mazur zeta functions encode cycle
  entropies.  Semantic weighting is supported through cosine similarities
  on lightweight bag-of-words embeddings.
* Prime-indexed subsampling highlights arithmetic resonances in the zeta
  evaluations, while Dirichlet twists of the hash avalanche statistics are
  exposed through characters modulo 256.

The script can be executed directly to analyse a text corpus and emit
summary statistics together with CSV artifacts for downstream visualisation.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

import numpy as np


TWO_PI = 2.0 * math.pi
BYTE_STATES = 256


@dataclass
class MandelbrotSample:
    """Summary of the kneading dynamics for a single parameter ``c``."""

    index: int
    c: complex
    chosen_c: complex
    preperiod: Optional[int]
    period: Optional[int]
    multiplier: Optional[complex]
    kneading: str
    escaped: bool


@dataclass
class HashTwistSeries:
    """Dirichlet series associated with a single character twist."""

    character: int
    values: np.ndarray
    s_values: np.ndarray


def rolling_sha256(text: str, chunk_size: int) -> List[bytes]:
    """Return rolling SHA-256 digests over ``text``.

    Each digest corresponds to the prefix ending at ``i + chunk_size`` so
    that successive hashes share most of their data, which amplifies the
    avalanche statistics.
    """

    hashes: List[bytes] = []
    data = text.encode("utf-8", errors="ignore")
    for end in range(chunk_size, len(data) + chunk_size, chunk_size):
        chunk = data[:end]
        if not chunk:
            continue
        h = hashlib.sha256(chunk).digest()
        hashes.append(h)
    return hashes


def hash_to_c(hash_bytes: bytes, scale: float = 1.75) -> complex:
    """Map the first 16 bytes of ``hash_bytes`` to a complex parameter ``c``."""

    if len(hash_bytes) < 16:
        raise ValueError("hash digest must contain at least 16 bytes")
    x = int.from_bytes(hash_bytes[:8], "big") / (1 << 64)
    y = int.from_bytes(hash_bytes[8:16], "big") / (1 << 64)
    return complex(2 * scale * x - scale, 2 * scale * y - scale)


def _quantise(z: complex, tol: float) -> Tuple[int, int]:
    return (int(round(z.real / tol)), int(round(z.imag / tol)))


def mandelbrot_postcritical_data(
    c: complex, *, max_iter: int = 4096, tol: float = 1e-9
) -> Tuple[Optional[int], Optional[int], Optional[complex], str, bool]:
    """Return metadata about the critical orbit of ``f_c(z) = z^2 + c``.

    The function detects eventual periodicity of the critical orbit using a
    tolerance ``tol``.  When an attracting cycle is detected the multiplier is
    computed as ``prod(2 * z_k)`` over one period.
    """

    z = 0j
    seen: Dict[Tuple[int, int], int] = {}
    orbit: List[complex] = []
    kneading: List[str] = []

    for n in range(max_iter):
        orbit.append(z)
        kneading.append("R" if z.real >= 0 else "L")
        key = _quantise(z, tol)
        if key in seen:
            mu = seen[key]
            period = n - mu
            cycle = orbit[mu:n]
            multiplier = complex(1.0)
            for z_k in cycle:
                multiplier *= 2.0 * z_k
            return mu, period, multiplier, "".join(kneading), False
        seen[key] = n
        z = z * z + c
        if abs(z) > 2.0:
            return None, None, None, "".join(kneading), True
    return None, None, None, "".join(kneading), False


def project_to_hyperbolic(
    c: complex,
    radii: Sequence[float] = (0.0, 1e-4, 5e-4, 1e-3, 2e-3),
    samples: int = 12,
    max_iter: int = 4096,
    tol: float = 1e-9,
) -> Tuple[complex, Optional[int], Optional[int], Optional[complex], str, bool]:
    """Search a small neighbourhood of ``c`` for a postcritically finite point."""

    for radius in radii:
        if radius == 0.0:
            candidates = [c]
        else:
            candidates = [
                c + radius * complex(math.cos(theta), math.sin(theta))
                for theta in np.linspace(0.0, TWO_PI, samples, endpoint=False)
            ]
        for cand in candidates:
            preperiod, period, multiplier, kneading, escaped = (
                mandelbrot_postcritical_data(
                    cand, max_iter=max_iter, tol=tol
                )
            )
            if escaped:
                continue
            if period is None:
                continue
            if multiplier is None or abs(multiplier) >= 1.0:
                continue
            return cand, preperiod, period, multiplier, kneading, escaped
    return c, None, None, None, "", True


def avalanche_metric(prev_hash: bytes, curr_hash: bytes) -> float:
    """Return the normalised Hamming distance between two SHA-256 digests."""

    if len(prev_hash) != len(curr_hash):
        raise ValueError("hashes must have equal length")
    diff_bits = sum(
        bin(b1 ^ b2).count("1") for b1, b2 in zip(prev_hash, curr_hash)
    )
    return diff_bits / (8 * len(curr_hash))


def dirichlet_twists(
    values: Sequence[float],
    s_values: np.ndarray,
    characters: Sequence[int],
    modulus: int = BYTE_STATES,
) -> List[HashTwistSeries]:
    """Compute Dirichlet-like series ``L(s, χ)`` for the supplied amplitudes."""

    amplitudes = np.asarray(values, dtype=float)
    if amplitudes.size == 0:
        return []
    indices = np.arange(1, amplitudes.size + 1, dtype=float)
    twists: List[HashTwistSeries] = []
    for chi in characters:
        chi_vals = np.exp(1j * TWO_PI * chi * indices / modulus)
        series = np.array(
            [
                np.sum(amplitudes * chi_vals / (indices ** s))
                for s in s_values
            ]
        )
        twists.append(HashTwistSeries(character=chi, values=series, s_values=s_values))
    return twists


def byte_bigram_matrix(data: bytes) -> np.ndarray:
    """Return a stochastic matrix of byte bigram transitions."""

    if len(data) < 2:
        raise ValueError("at least two bytes are required to build a bigram matrix")
    counts = np.zeros((BYTE_STATES, BYTE_STATES), dtype=float)
    for a, b in zip(data, data[1:]):
        counts[a, b] += 1.0
    row_sums = counts.sum(axis=1, keepdims=True)
    with np.errstate(divide="ignore", invalid="ignore"):
        probs = np.divide(counts, row_sums, out=np.zeros_like(counts), where=row_sums > 0)
    # Restrict to the active subspace for numerical stability.
    active = np.where(row_sums.squeeze() > 0)[0]
    return probs[np.ix_(active, active)]


def bag_of_words_embeddings(chunks: Sequence[str]) -> Dict[str, np.ndarray]:
    """Return L2-normalised bag-of-words vectors for each chunk."""

    vocabulary: Dict[str, int] = {}
    vectors: Dict[str, Counter[str]] = {}
    for chunk in chunks:
        tokens = re.findall(r"\w+", chunk.lower())
        vectors[chunk] = Counter(tokens)
        for tok in vectors[chunk]:
            if tok not in vocabulary:
                vocabulary[tok] = len(vocabulary)
    emb: Dict[str, np.ndarray] = {}
    dim = len(vocabulary)
    for chunk, counter in vectors.items():
        vec = np.zeros(dim, dtype=float)
        for token, count in counter.items():
            vec[vocabulary[token]] = count
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec /= norm
        emb[chunk] = vec
    return emb


def semantic_weighted_matrix(chunks: Sequence[str]) -> np.ndarray:
    """Build a weighted adjacency matrix using cosine similarity between chunks."""

    if len(chunks) < 2:
        raise ValueError("need at least two chunks to compute similarities")
    embeddings = bag_of_words_embeddings(chunks)
    ordered_chunks = list(chunks)
    size = len(ordered_chunks)
    matrix = np.zeros((size, size), dtype=float)
    for i, chunk in enumerate(ordered_chunks[:-1]):
        vec_i = embeddings[chunk]
        vec_j = embeddings[ordered_chunks[i + 1]]
        sim = float(np.dot(vec_i, vec_j))
        matrix[i, i + 1] = sim if sim > 0 else 0.0
    # Normalise rows to interpret as transition probabilities.
    row_sums = matrix.sum(axis=1, keepdims=True)
    with np.errstate(divide="ignore", invalid="ignore"):
        matrix = np.divide(matrix, row_sums, out=np.zeros_like(matrix), where=row_sums > 0)
    return matrix


def artin_mazur_zeta(
    matrix: np.ndarray,
    z_values: np.ndarray,
    trace_terms: int = 64,
) -> np.ndarray:
    """Evaluate ``ζ_G(z)`` = exp(Σ z^k Tr(A^k)/k) along ``z_values``."""

    if matrix.size == 0:
        raise ValueError("matrix must not be empty")
    if trace_terms <= 0:
        raise ValueError("trace_terms must be positive")
    current = np.eye(matrix.shape[0])
    traces: List[complex] = []
    for _ in range(trace_terms):
        current = current @ matrix
        traces.append(np.trace(current))
    zeta_vals: List[complex] = []
    for z in z_values:
        series = sum((z ** (k + 1)) * traces[k] / (k + 1) for k in range(len(traces)))
        zeta_vals.append(math.e ** series)
    return np.array(zeta_vals)


def prime_indices(n: int) -> np.ndarray:
    """Return the prime indices up to ``n`` using a sieve."""

    if n < 2:
        return np.array([], dtype=int)
    sieve = np.ones(n + 1, dtype=bool)
    sieve[:2] = False
    for p in range(2, int(math.sqrt(n)) + 1):
        if sieve[p]:
            sieve[p * p : n + 1 : p] = False
    return np.flatnonzero(sieve)


def level_spacing_ratios(eigenvalues: np.ndarray) -> np.ndarray:
    """Return consecutive spacing ratios for sorted eigenvalues."""

    if eigenvalues.size < 3:
        return np.array([])
    vals = np.sort(np.real(eigenvalues))
    diffs = np.diff(vals)
    valid = diffs[1:]
    valid[valid == 0] = np.finfo(float).eps
    ratios = diffs[:-1] / valid
    return np.abs(ratios)


def analyse_text(
    text: str,
    chunk_size: int,
    characters: Sequence[int],
    s_grid: Sequence[complex],
    z_grid: Sequence[float],
    trace_terms: int,
    prime_only: bool,
) -> Dict[str, object]:
    """Run the full pipeline and return serialisable artefacts."""

    hashes = rolling_sha256(text, chunk_size)
    if not hashes:
        raise ValueError("text too short for the chosen chunk size")

    mandelbrot_samples: List[MandelbrotSample] = []
    kneading_counter: Counter[str] = Counter()
    avalanche: List[float] = []
    for idx, h in enumerate(hashes):
        c = hash_to_c(h)
        chosen_c, preperiod, period, multiplier, kneading, escaped = (
            project_to_hyperbolic(c)
        )
        sample = MandelbrotSample(
            index=idx,
            c=c,
            chosen_c=chosen_c,
            preperiod=preperiod,
            period=period,
            multiplier=multiplier,
            kneading=kneading,
            escaped=escaped,
        )
        mandelbrot_samples.append(sample)
        if kneading:
            kneading_counter[kneading[: min(len(kneading), 12)]] += 1
        if idx > 0:
            avalanche.append(avalanche_metric(hashes[idx - 1], h))

    avalanche = np.array(avalanche, dtype=float)
    s_values = np.array(s_grid, dtype=complex)
    twist_series = dirichlet_twists(avalanche, s_values, characters)

    data_bytes = text.encode("utf-8", errors="ignore")
    bigram = byte_bigram_matrix(data_bytes)
    z_values = np.array(z_grid, dtype=float)
    zeta_vals = artin_mazur_zeta(bigram, z_values, trace_terms=trace_terms)

    # Semantic graph using newline-delimited chunks.
    chunks = [chunk.strip() for chunk in text.splitlines() if chunk.strip()]
    semantic_matrix = (
        semantic_weighted_matrix(chunks) if len(chunks) >= 2 else np.zeros((0, 0))
    )
    semantic_zeta = (
        artin_mazur_zeta(semantic_matrix, z_values, trace_terms=trace_terms)
        if semantic_matrix.size
        else np.array([], dtype=complex)
    )

    eigenvalues = np.linalg.eigvals(bigram)
    spacing = level_spacing_ratios(eigenvalues)
    prime_mask = prime_indices(len(zeta_vals)) if prime_only else None
    if prime_mask is not None and prime_mask.size:
        zeta_prime = zeta_vals[prime_mask - 1]
    else:
        zeta_prime = np.array([])

    return {
        "mandelbrot": mandelbrot_samples,
        "kneading_counter": kneading_counter,
        "avalanche": avalanche,
        "twists": twist_series,
        "zeta": zeta_vals,
        "semantic_zeta": semantic_zeta,
        "z_values": z_values,
        "spacing_ratios": spacing,
        "zeta_prime": zeta_prime,
    }


def write_csv(path: Path, headers: Sequence[str], rows: Iterable[Sequence[object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(headers)
        for row in rows:
            writer.writerow(row)


def serialise_results(
    results: Dict[str, object],
    output_dir: Path,
    base_name: str,
) -> None:
    """Persist results as CSV/JSON artefacts under ``output_dir``."""

    output_dir.mkdir(parents=True, exist_ok=True)
    mandelbrot_path = output_dir / f"{base_name}_mandelbrot.csv"
    write_csv(
        mandelbrot_path,
        [
            "index",
            "c_real",
            "c_imag",
            "chosen_real",
            "chosen_imag",
            "preperiod",
            "period",
            "multiplier_real",
            "multiplier_imag",
            "kneading",
            "escaped",
        ],
        (
            (
                sample.index,
                sample.c.real,
                sample.c.imag,
                sample.chosen_c.real,
                sample.chosen_c.imag,
                sample.preperiod,
                sample.period,
                sample.multiplier.real if sample.multiplier else None,
                sample.multiplier.imag if sample.multiplier else None,
                sample.kneading,
                sample.escaped,
            )
            for sample in results["mandelbrot"]
        ),
    )

    kneading_path = output_dir / f"{base_name}_kneading.json"
    kneading_serialisable = {
        word: count for word, count in results["kneading_counter"].items()
    }
    kneading_path.write_text(json.dumps(kneading_serialisable, indent=2))

    avalanche_path = output_dir / f"{base_name}_avalanche.csv"
    write_csv(
        avalanche_path,
        ["index", "avalanche"],
        ((i + 1, float(val)) for i, val in enumerate(results["avalanche"])),
    )

    twist_base = output_dir / f"{base_name}_twist"
    for twist in results["twists"]:
        twist_path = twist_base.with_name(f"{twist_base.name}_{twist.character}.csv")
        write_csv(
            twist_path,
            ["Re(s)", "Im(s)", "Re(L)", "Im(L)"],
            (
                (
                    float(s.real),
                    float(s.imag),
                    float(val.real),
                    float(val.imag),
                )
                for s, val in zip(twist.s_values, twist.values)
            ),
        )

    zeta_path = output_dir / f"{base_name}_zeta.csv"
    write_csv(
        zeta_path,
        ["z", "Re(zeta)", "Im(zeta)"],
        (
            (float(z), float(val.real), float(val.imag))
            for z, val in zip(results["z_values"], results["zeta"])
        ),
    )

    if results["semantic_zeta"].size:
        sem_path = output_dir / f"{base_name}_semantic_zeta.csv"
        write_csv(
            sem_path,
            ["z", "Re(zeta)", "Im(zeta)"],
            (
                (float(z), float(val.real), float(val.imag))
                for z, val in zip(results["z_values"], results["semantic_zeta"])
            ),
        )

    spacing_path = output_dir / f"{base_name}_spacing.csv"
    write_csv(
        spacing_path,
        ["ratio"],
        ((float(val),) for val in results["spacing_ratios"]),
    )

    if results["zeta_prime"].size:
        prime_path = output_dir / f"{base_name}_prime_zeta.csv"
        write_csv(
            prime_path,
            ["Re(zeta)", "Im(zeta)"],
            ((float(val.real), float(val.imag)) for val in results["zeta_prime"]),
        )


def main() -> None:  # pragma: no cover - CLI plumbing
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("text_file", type=Path, help="path to the input text file")
    parser.add_argument(
        "--chunk-size",
        type=int,
        default=1024,
        help="chunk size (in bytes) for rolling SHA-256",
    )
    parser.add_argument(
        "--characters",
        type=int,
        nargs="*",
        default=[1, 3, 5],
        help="Dirichlet characters modulo 256 to evaluate",
    )
    parser.add_argument(
        "--s-grid",
        type=str,
        default="0.5+14j,0.6+14j,0.7+14j",
        help="comma-separated complex s values (Python syntax)",
    )
    parser.add_argument(
        "--z-grid",
        type=str,
        default="0.05:0.95:0.05",
        help="z grid specification (start:stop:step or comma separated)",
    )
    parser.add_argument(
        "--trace-terms",
        type=int,
        default=48,
        help="number of trace terms for Artin–Mazur zeta",
    )
    parser.add_argument(
        "--prime-only",
        action="store_true",
        help="store Artin–Mazur zeta samples only at prime indices",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("artifacts/hash_mandelbrot"),
        help="directory for generated CSV artefacts",
    )
    args = parser.parse_args()

    text = args.text_file.read_text(encoding="utf-8", errors="ignore")

    def parse_complex_list(spec: str) -> List[complex]:
        values: List[complex] = []
        for token in spec.split(","):
            token = token.strip()
            if not token:
                continue
            values.append(complex(token))
        return values

    def parse_z_grid(spec: str) -> List[float]:
        if ":" in spec:
            start, stop, step = (float(x) for x in spec.split(":"))
            return list(np.arange(start, stop + 1e-9, step))
        return [float(x.strip()) for x in spec.split(",") if x.strip()]

    s_grid = parse_complex_list(args.s_grid)
    z_grid = parse_z_grid(args.z_grid)

    results = analyse_text(
        text,
        chunk_size=args.chunk_size,
        characters=args.characters,
        s_grid=s_grid,
        z_grid=z_grid,
        trace_terms=args.trace_terms,
        prime_only=args.prime_only,
    )

    serialise_results(results, args.output_dir, args.text_file.stem)

    print(f"Analysed {args.text_file} → artefacts stored in {args.output_dir}")


if __name__ == "__main__":  # pragma: no cover - CLI entrypoint
    main()
