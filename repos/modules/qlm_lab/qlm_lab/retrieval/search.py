"""Cosine similarity search against the TF-IDF index."""
from __future__ import annotations

import math
from collections import Counter
from typing import Dict, List, Tuple

from .index import TfidfIndex, _tokens


def _dense_query(tokens: List[str], vocab: Dict[str, int], idf: List[float]) -> Dict[int, float]:
    """Return a normalised sparse vector for ``tokens``."""

    counts = Counter(tokens)
    total = sum(counts.values()) or 1.0
    vec: Dict[int, float] = {}
    for word, freq in counts.items():
        if word in vocab:
            idx = vocab[word]
            vec[idx] = (freq / total) * idf[idx]
    norm = math.sqrt(sum(value * value for value in vec.values()) or 1.0)
    return {idx: value / norm for idx, value in vec.items()}


def topk(index: TfidfIndex, query: str, k: int = 5) -> List[Tuple[int, float]]:
    """Return the top ``k`` results for ``query`` sorted by cosine score."""

    tokens = _tokens(query)
    if not tokens or not index.vecs:
        return []
    query_vec = _dense_query(tokens, index.vocab, index.idf)
    scores: List[Tuple[int, float]] = []
    for row_idx, row in enumerate(index.vecs):
        score = 0.0
        for col_idx, weight in row:
            if col_idx in query_vec:
                score += weight * query_vec[col_idx]
        scores.append((row_idx, score))
    scores.sort(key=lambda item: item[1], reverse=True)
    return scores[:k]


__all__ = ["topk"]
