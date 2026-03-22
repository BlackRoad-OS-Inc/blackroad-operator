"""TF-IDF index construction for the retrieval stack."""
from __future__ import annotations

import json
import math
from collections import Counter, defaultdict
from typing import Dict, List, Tuple


def _tokens(text: str) -> List[str]:
    """Tokenise ``text`` using a lightweight alphanumeric filter."""

    filtered = [ch.lower() if ch.isalnum() else " " for ch in text]
    return [token for token in "".join(filtered).split() if token]


class TfidfIndex:
    """Sparse TF-IDF index with cosine similarity search."""

    def __init__(self) -> None:
        self.vocab: Dict[str, int] = {}
        self.idf: List[float] = []
        self.vecs: List[List[Tuple[int, float]]] = []
        self.meta: List[Dict[str, object]] = []

    def build(self, corpus_jsonl: str) -> None:
        """Populate the index from a corpus JSONL file."""

        docs: List[Dict[str, object]] = []
        with open(corpus_jsonl, "r", encoding="utf-8") as handle:
            for line in handle:
                docs.append(json.loads(line))
        if not docs:
            self.vocab = {}
            self.idf = []
            self.vecs = []
            self.meta = []
            return
        doc_freq: Dict[str, int] = defaultdict(int)
        term_freqs: List[Counter[str]] = []
        for doc in docs:
            tokens = _tokens(doc["text"])
            counts = Counter(tokens)
            term_freqs.append(counts)
            for token in counts:
                doc_freq[token] += 1
        self.vocab = {word: idx for idx, word in enumerate(sorted(doc_freq))}
        total_docs = len(docs)
        self.idf = [math.log((total_docs + 1) / (doc_freq[word] + 1)) + 1.0 for word in sorted(doc_freq)]
        self.vecs = []
        self.meta = docs
        for counts in term_freqs:
            items: List[Tuple[int, float]] = []
            length = sum(counts.values()) or 1
            norm_sq = 0.0
            for word, freq in counts.items():
                if word not in self.vocab:
                    continue
                idx = self.vocab[word]
                value = (freq / length) * self.idf[idx]
                items.append((idx, value))
                norm_sq += value * value
            norm = math.sqrt(norm_sq) if norm_sq > 0 else 1.0
            self.vecs.append([(idx, val / norm) for idx, val in items])

    def save(self, path: str) -> None:
        """Serialise the index to ``path`` as JSON."""

        with open(path, "w", encoding="utf-8") as handle:
            json.dump(
                {
                    "vocab": self.vocab,
                    "idf": self.idf,
                    "vecs": self.vecs,
                    "meta": self.meta,
                },
                handle,
            )

    @staticmethod
    def load(path: str) -> "TfidfIndex":
        """Load an index from disk."""

        with open(path, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
        index = TfidfIndex()
        index.vocab = {str(word): int(idx) for word, idx in payload["vocab"].items()}
        index.idf = [float(value) for value in payload["idf"]]
        index.vecs = [
            [(int(position), float(weight)) for position, weight in row]
            for row in payload["vecs"]
        ]
        index.meta = payload["meta"]
        return index


__all__ = ["TfidfIndex", "_tokens"]
