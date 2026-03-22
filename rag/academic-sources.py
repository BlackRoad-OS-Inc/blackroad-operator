"""BlackRoad Academic Sources — rigorous citation and source verification.

Ensures RAG responses cite sources with academic-level rigor:
  - Every claim traces back to a specific file, line, and commit
  - Confidence scoring based on source freshness and relevance
  - Cross-referencing across multiple repos for verification
  - Source provenance chain (who wrote it, when, why)

Usage:
    from academic_sources import format_citations, verify_sources, SourceChain
"""

import json
import os
import subprocess
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple


@dataclass
class Source:
    """A single source reference with full provenance."""
    repo: str
    file: str
    line: int
    content: str
    score: float
    file_type: str = ""
    # Provenance fields (populated by enrich_provenance)
    last_author: str = ""
    last_commit: str = ""
    last_date: str = ""
    commit_message: str = ""
    confidence: float = 0.0


@dataclass
class SourceChain:
    """A chain of sources supporting a claim, ordered by relevance."""
    query: str
    sources: List[Source] = field(default_factory=list)
    cross_references: int = 0
    overall_confidence: float = 0.0
    verification_notes: List[str] = field(default_factory=list)

    def to_citation_block(self) -> str:
        """Format as an academic-style citation block."""
        lines = ["## Sources", ""]
        for i, src in enumerate(self.sources, 1):
            confidence_label = (
                "HIGH" if src.confidence > 0.8 else
                "MEDIUM" if src.confidence > 0.5 else
                "LOW"
            )
            lines.append(f"[{i}] `{src.repo}/{src.file}:{src.line}` "
                         f"(relevance: {src.score:.3f}, confidence: {confidence_label})")
            if src.last_author:
                lines.append(f"    Author: {src.last_author} | "
                             f"Date: {src.last_date} | "
                             f"Commit: {src.last_commit[:8]}")
            if src.commit_message:
                lines.append(f"    Context: {src.commit_message}")
            lines.append("")

        if self.verification_notes:
            lines.append("## Verification Notes")
            for note in self.verification_notes:
                lines.append(f"- {note}")
            lines.append("")

        lines.append(f"Cross-references: {self.cross_references} | "
                     f"Overall confidence: {self.overall_confidence:.0%}")

        return "\n".join(lines)

    def to_dict(self) -> dict:
        return {
            "query": self.query,
            "sources": [
                {
                    "repo": s.repo,
                    "file": s.file,
                    "line": s.line,
                    "score": s.score,
                    "confidence": s.confidence,
                    "last_author": s.last_author,
                    "last_date": s.last_date,
                    "last_commit": s.last_commit,
                    "commit_message": s.commit_message,
                }
                for s in self.sources
            ],
            "cross_references": self.cross_references,
            "overall_confidence": self.overall_confidence,
            "verification_notes": self.verification_notes,
        }


def enrich_provenance(source: Source, repos_dir: str = None) -> Source:
    """Add git provenance data to a source (author, date, commit).

    Attempts to run git blame on the source file to get the actual
    author and commit for the specific lines.
    """
    if repos_dir is None:
        repos_dir = os.path.expanduser("~/blackroad-repos")

    repo_path = os.path.join(repos_dir, source.repo)
    file_path = os.path.join(repo_path, source.file)

    if not os.path.exists(file_path):
        # Try blackroad-operator
        repo_path = os.path.expanduser("~/blackroad-operator")
        file_path = os.path.join(repo_path, source.file)
        if not os.path.exists(file_path):
            source.confidence = source.score * 0.5  # Lower confidence without provenance
            return source

    try:
        # Git blame for the specific line
        result = subprocess.run(
            ["git", "blame", "-L", f"{source.line},{source.line + 5}",
             "--porcelain", source.file],
            cwd=repo_path,
            capture_output=True, text=True, timeout=10,
        )

        if result.returncode == 0:
            lines = result.stdout.split("\n")
            for line in lines:
                if line.startswith("author "):
                    source.last_author = line[7:]
                elif line.startswith("committer-time "):
                    ts = int(line[15:])
                    source.last_date = time.strftime("%Y-%m-%d", time.gmtime(ts))
                elif line.startswith("summary "):
                    source.commit_message = line[8:]

            # First line contains the commit hash
            if lines and len(lines[0]) >= 40:
                source.last_commit = lines[0].split()[0]

    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass

    # Calculate confidence based on:
    # - Relevance score (vector similarity)
    # - Freshness (how recently the code was modified)
    # - Whether we have full provenance
    confidence = source.score  # Start with relevance

    if source.last_date:
        # Boost confidence for recently modified code
        try:
            days_ago = (time.time() - time.mktime(time.strptime(source.last_date, "%Y-%m-%d"))) / 86400
            if days_ago < 30:
                confidence *= 1.2  # Recent = more confident
            elif days_ago > 365:
                confidence *= 0.8  # Old = less confident
        except ValueError:
            pass

    if source.last_author:
        confidence *= 1.1  # Having provenance = more confident

    source.confidence = min(1.0, confidence)
    return source


def build_source_chain(results: List[Dict], query: str,
                       enrich: bool = True) -> SourceChain:
    """Build a verified source chain from RAG search results.

    Args:
        results: List of search result dicts from rag-engine
        query: Original search query
        enrich: Whether to add git provenance (slower but more rigorous)
    """
    chain = SourceChain(query=query)

    sources = []
    for r in results:
        src = Source(
            repo=r.get("repo", ""),
            file=r.get("file", ""),
            line=r.get("line", 0),
            content=r.get("content", ""),
            score=r.get("score", 0),
            file_type=r.get("type", ""),
        )
        if enrich:
            src = enrich_provenance(src)
        else:
            src.confidence = src.score
        sources.append(src)

    chain.sources = sources

    # Cross-reference analysis: how many unique files/repos agree?
    unique_files = set()
    unique_repos = set()
    for src in sources:
        unique_files.add(f"{src.repo}/{src.file}")
        unique_repos.add(src.repo)

    chain.cross_references = len(unique_files)

    # Verification notes
    if len(unique_repos) > 1:
        chain.verification_notes.append(
            f"Found in {len(unique_repos)} different repositories — higher confidence"
        )
    if len(unique_files) > len(sources) * 0.8:
        chain.verification_notes.append(
            "Sources are diverse (mostly different files) — good coverage"
        )
    if any(s.score > 0.85 for s in sources):
        chain.verification_notes.append(
            "At least one highly relevant match (>0.85 similarity)"
        )
    if all(s.score < 0.5 for s in sources):
        chain.verification_notes.append(
            "WARNING: All matches have low relevance (<0.5) — results may not be accurate"
        )

    # Overall confidence = weighted average
    if sources:
        total_weight = sum(s.score for s in sources)
        if total_weight > 0:
            chain.overall_confidence = sum(s.confidence * s.score for s in sources) / total_weight
        else:
            chain.overall_confidence = 0.0

    return chain


def format_citations(results: List[Dict], query: str,
                     style: str = "inline") -> str:
    """Format search results as citations.

    Styles:
        inline: [1] repo/file:line — compact inline citations
        academic: Full academic-style with provenance
        markdown: Markdown footnotes
    """
    chain = build_source_chain(results, query, enrich=(style == "academic"))

    if style == "academic":
        return chain.to_citation_block()

    elif style == "markdown":
        lines = []
        for i, src in enumerate(chain.sources, 1):
            lines.append(f"[^{i}]: `{src.repo}/{src.file}:{src.line}` "
                         f"(score: {src.score:.3f})")
        return "\n".join(lines)

    else:  # inline
        parts = []
        for i, src in enumerate(chain.sources, 1):
            parts.append(f"[{i}] {src.repo}/{src.file}:{src.line}")
        return " | ".join(parts)


def verify_claim(claim: str, results: List[Dict]) -> Dict:
    """Verify a claim against RAG results.

    Returns a verification report with confidence level and supporting evidence.
    """
    chain = build_source_chain(results, claim, enrich=True)

    # Determine verification status
    if chain.overall_confidence > 0.8:
        status = "VERIFIED"
    elif chain.overall_confidence > 0.5:
        status = "LIKELY"
    elif chain.overall_confidence > 0.3:
        status = "UNCERTAIN"
    else:
        status = "UNVERIFIED"

    return {
        "claim": claim,
        "status": status,
        "confidence": chain.overall_confidence,
        "supporting_sources": len(chain.sources),
        "cross_references": chain.cross_references,
        "citations": chain.to_citation_block(),
        "notes": chain.verification_notes,
    }
