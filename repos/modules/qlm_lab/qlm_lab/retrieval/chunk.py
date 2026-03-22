"""Corpus chunking utilities for the local retrieval index."""
from __future__ import annotations

from dataclasses import dataclass
from typing import List


@dataclass(slots=True)
class Chunk:
    """Represent a contiguous slice of a source document."""

    doc_id: str
    path: str
    start_line: int
    end_line: int
    text: str


def by_lines(
    text: str,
    path: str,
    doc_id: str,
    max_lines: int = 80,
    overlap: int = 10,
) -> List[Chunk]:
    """Split ``text`` into ``Chunk`` objects using a sliding window."""

    lines = text.splitlines()
    out: List[Chunk] = []
    i = 0
    n = len(lines)
    if n == 0:
        return out
    step = max(max_lines - overlap, 1)
    while i < n:
        j = min(n, i + max_lines)
        chunk_text = "\n".join(lines[i:j])
        out.append(Chunk(doc_id=doc_id, path=path, start_line=i + 1, end_line=j, text=chunk_text))
        if j == n:
            break
        i += step
    return out
