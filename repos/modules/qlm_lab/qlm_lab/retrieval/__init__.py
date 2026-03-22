"""Lightweight retrieval stack for local RAG flows."""
from .chunk import Chunk, by_lines
from .ingest import ingest
from .index import TfidfIndex
from .search import topk

__all__ = ["Chunk", "by_lines", "ingest", "TfidfIndex", "topk"]
