"""Utilities for constructing weighted adjacency matrices from textual data."""

from __future__ import annotations

import csv
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Mapping, MutableMapping, Optional, Sequence, Tuple

import numpy as np

from . import primes


@dataclass
class Edge:
    source: str
    target: str
    count: float = 1.0
    semantic: Optional[float] = None


@dataclass
class AdjacencyResult:
    matrix: np.ndarray
    index_to_node: List[str]
    node_to_index: Dict[str, int]


def _ensure_node(node: str, mapping: MutableMapping[str, int], order: List[str]) -> int:
    if node not in mapping:
        mapping[node] = len(order)
        order.append(node)
    return mapping[node]


def _combine_weights(count: float, semantic: Optional[float]) -> float:
    damped = math.log1p(max(count, 0.0))
    if semantic is None or semantic <= 0:
        return damped
    if damped <= 0:
        return semantic
    return math.sqrt(damped * semantic)


def build_bigram_adjacency(tokens: Sequence[str], row_normalise: bool = True) -> AdjacencyResult:
    """Create a weighted adjacency matrix from token bigrams."""

    node_to_index: Dict[str, int] = {}
    index_to_node: List[str] = []
    weights: Dict[Tuple[int, int], float] = {}

    for current, nxt in zip(tokens, tokens[1:]):
        i = _ensure_node(current, node_to_index, index_to_node)
        j = _ensure_node(nxt, node_to_index, index_to_node)
        weights[(i, j)] = weights.get((i, j), 0.0) + 1.0

    size = len(index_to_node)
    matrix = np.zeros((size, size), dtype=float)
    for (i, j), value in weights.items():
        matrix[i, j] = value

    if row_normalise and size:
        row_sums = matrix.sum(axis=1, keepdims=True)
        row_sums[row_sums == 0] = 1.0
        matrix = matrix / row_sums

    return AdjacencyResult(matrix=matrix, index_to_node=index_to_node, node_to_index=node_to_index)


def build_weighted_adjacency(edges: Iterable[Edge], row_normalise: bool = True) -> AdjacencyResult:
    """Create a row-stochastic adjacency matrix using damped counts and optional semantics."""

    node_to_index: Dict[str, int] = {}
    index_to_node: List[str] = []
    matrix_map: Dict[Tuple[int, int], float] = {}

    for edge in edges:
        i = _ensure_node(edge.source, node_to_index, index_to_node)
        j = _ensure_node(edge.target, node_to_index, index_to_node)
        weight = _combine_weights(edge.count, edge.semantic)
        if weight <= 0:
            continue
        matrix_map[(i, j)] = matrix_map.get((i, j), 0.0) + weight

    size = len(index_to_node)
    matrix = np.zeros((size, size), dtype=float)
    for (i, j), value in matrix_map.items():
        matrix[i, j] = value

    if row_normalise and size:
        row_sums = matrix.sum(axis=1, keepdims=True)
        row_sums[row_sums == 0] = 1.0
        matrix = matrix / row_sums

    return AdjacencyResult(matrix=matrix, index_to_node=index_to_node, node_to_index=node_to_index)


def _canonical_reference(row: Mapping[str, str], prefix: str) -> Optional[str]:
    direct_fields = [prefix, prefix.lower(), prefix.upper()]
    for field in direct_fields:
        if field in row and row[field].strip():
            return row[field].strip()

    book = row.get(f"{prefix}_book") or row.get(f"{prefix}_Book")
    chapter = row.get(f"{prefix}_chapter") or row.get(f"{prefix}_Chapter")
    verse = row.get(f"{prefix}_verse") or row.get(f"{prefix}_Verse")

    if book and chapter and verse:
        return f"{book.strip()} {chapter.strip()}:{verse.strip()}"
    if book and chapter:
        return f"{book.strip()} {chapter.strip()}"
    return None


def _extract_float(row: Mapping[str, str], candidates: Sequence[str], default: float = 0.0) -> float:
    for field in candidates:
        if field in row and row[field].strip():
            try:
                return float(row[field])
            except ValueError:
                continue
    return default


def parse_cross_reference_csv(
    path: Path,
    *,
    count_fields: Sequence[str] = ("count", "weight", "xref_count"),
    semantic_fields: Sequence[str] = ("semantic", "similarity", "cosine_similarity"),
    delimiter: str = ",",
    prime_only: bool = False,
) -> List[Edge]:
    """Parse a cross-reference CSV into ``Edge`` objects.

    The parser is tolerant of different column naming conventions. It looks for
    either canonical ``source``/``target`` fields or ``*_book/chapter/verse``
    triplets. When ``prime_only`` is enabled, only rows whose 1-based position is
    prime are retained, offering a quick way to focus on prime-indexed verses.
    """

    edges: List[Edge] = []
    with Path(path).open("r", encoding="utf-8", newline="") as fh:
        reader = csv.DictReader(fh, delimiter=delimiter)
        if not reader.fieldnames:
            return edges
        source_field = next((f for f in reader.fieldnames if f.lower() in {"source", "from", "src"}), "source")
        target_field = next((f for f in reader.fieldnames if f.lower() in {"target", "to", "dst"}), "target")

        for idx, row in enumerate(reader, start=1):
            if prime_only and not primes.is_prime(idx):
                continue
            source = _canonical_reference(row, source_field)
            target = _canonical_reference(row, target_field)
            if not source or not target:
                continue
            count = _extract_float(row, count_fields, default=1.0)
            semantic = _extract_float(row, semantic_fields, default=0.0)
            semantic_value = semantic if semantic > 0 else None
            edges.append(Edge(source=source, target=target, count=count, semantic=semantic_value))
    return edges


def build_cross_reference_adjacency(
    path: Path,
    *,
    count_fields: Sequence[str] = ("count", "weight", "xref_count"),
    semantic_fields: Sequence[str] = ("semantic", "similarity", "cosine_similarity"),
    delimiter: str = ",",
    prime_only: bool = False,
) -> AdjacencyResult:
    """Parse a CSV file and immediately convert it into an adjacency matrix."""

    edges = parse_cross_reference_csv(
        path,
        count_fields=count_fields,
        semantic_fields=semantic_fields,
        delimiter=delimiter,
        prime_only=prime_only,
    )
    return build_weighted_adjacency(edges)
