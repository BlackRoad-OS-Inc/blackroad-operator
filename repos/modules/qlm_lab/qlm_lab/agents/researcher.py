"""Research helper agent backed by a local retrieval index."""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, List

from ..lineage import append as log_lineage
from ..proto import Msg, new
from ..retrieval.index import TfidfIndex
from ..retrieval.search import topk
from .base import Agent

ARTIFACTS_DIR = Path(__file__).resolve().parents[2] / "artifacts"
CORPUS_PATH = ARTIFACTS_DIR / "corpus.jsonl"
INDEX_PATH = ARTIFACTS_DIR / "index.json"
RAG_TOPK_PATH = ARTIFACTS_DIR / "rag_topk.json"


@dataclass(slots=True)
class Citation:
    """Structured citation returned by the Researcher agent."""

    path: str
    start: int
    end: int
    score: float
    text: str

    def to_dict(self) -> dict[str, Any]:
        """Serialise the citation into JSON-safe primitives."""

        return {
            "path": self.path,
            "start": self.start,
            "end": self.end,
            "score": self.score,
            "text": self.text,
        }


class Researcher(Agent):
    """Collect analytical facts supporting the main workflow."""

    name = "researcher"

    def __init__(self, bus, index_path: Path | None = None) -> None:
        super().__init__(bus)
        self.index_path = Path(index_path) if index_path is not None else INDEX_PATH
        self.index: TfidfIndex | None = None

    def can_handle(self, m: Msg) -> bool:
        return m.recipient == self.name and m.kind == "task" and m.op in {"retrieve", "gather_context"}

    def _ensure_index(self) -> TfidfIndex | None:
        if self.index is not None:
            return self.index
        if not self.index_path.exists():
            return None
        self.index = TfidfIndex.load(str(self.index_path))
        return self.index

    def _collect(self, query: str, k: int) -> List[Citation]:
        index = self._ensure_index()
        if index is None:
            return []
        hits = topk(index, query, k=k)
        citations: List[Citation] = []
        for idx, score in hits:
            if idx >= len(index.meta):
                continue
            meta = index.meta[idx]
            start = int(meta.get("start_line", 0))
            end = int(meta.get("end_line", start))
            text = str(meta.get("text", ""))[:400]
            citations.append(
                Citation(
                    path=str(meta.get("path", "")),
                    start=start,
                    end=end,
                    score=float(score),
                    text=text,
                )
            )
        return citations

    def handle(self, m: Msg) -> List[Msg]:
        query = str(m.args.get("query", m.args.get("goal", ""))).strip()
        k = int(m.args.get("k", 5))
        if k <= 0:
            k = 1
        citations = self._collect(query, k)
        ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
        with RAG_TOPK_PATH.open("w", encoding="utf-8") as handle:
            json.dump([c.to_dict() for c in citations], handle, ensure_ascii=False, indent=2)
        log_lineage(
            {
                "agent": self.name,
                "op": "retrieve",
                "query": query,
                "citations": [c.to_dict() for c in citations],
            }
        )
        return [
            new(
                self.name,
                m.sender if m.op == "retrieve" else "archivist",
                "result",
                "citations",
                citations=[c.to_dict() for c in citations],
                query=query,
            )
        ]


__all__ = [
    "Researcher",
    "Citation",
    "ARTIFACTS_DIR",
    "CORPUS_PATH",
    "INDEX_PATH",
    "RAG_TOPK_PATH",
]
