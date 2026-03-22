"""
BlackRoad Labs — Research Analyzer
Structured analysis tooling for research papers and experiment reports.
Supports metadata extraction, citation tracking, hypothesis scoring,
statistical comparison, and SQLite-backed storage.

Usage:
    python -m src.research_analyzer demo
    python -m src.research_analyzer list
    python -m src.research_analyzer search --query "contradiction"
    python -m src.research_analyzer stats
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import sqlite3
import sys
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

DB_PATH = Path.home() / ".blackroad" / "labs-research.db"


# ──────────────────────────────────────────────────────────────────────────────
# Data models
# ──────────────────────────────────────────────────────────────────────────────

@dataclass
class Hypothesis:
    """A testable hypothesis with confidence tracking."""
    id:         str
    text:       str
    status:     str           # proposed | testing | confirmed | refuted | shelved
    confidence: float         # 0.0 – 1.0
    evidence:   List[str]     = field(default_factory=list)
    created_at: str           = ""
    updated_at: str           = ""

    def is_active(self) -> bool:
        return self.status in ("proposed", "testing")

    def update_confidence(self, delta: float) -> None:
        self.confidence = max(0.0, min(1.0, self.confidence + delta))


@dataclass
class Citation:
    """A single citation or reference."""
    ref_id:    str
    title:     str
    authors:   List[str]      = field(default_factory=list)
    year:      Optional[int]  = None
    url:       str            = ""
    notes:     str            = ""


@dataclass
class ResearchPaper:
    """
    A structured research paper or experiment report entry.

    Attributes:
        id:          Unique identifier (auto-generated from title hash).
        title:       Paper / report title.
        abstract:    Abstract or summary text.
        authors:     List of author names.
        tags:        Classification tags (e.g. "multi-agent", "memory").
        hypotheses:  Tracked hypotheses associated with this paper.
        citations:   Outgoing citations.
        status:      draft | review | published | archived.
        score:       Manual relevance / quality score (0–10).
        created_at:  ISO-8601 timestamp.
        updated_at:  ISO-8601 timestamp.
        metadata:    Arbitrary key-value metadata.
    """
    id:          str
    title:       str
    abstract:    str                    = ""
    authors:     List[str]             = field(default_factory=list)
    tags:        List[str]             = field(default_factory=list)
    hypotheses:  List[Hypothesis]      = field(default_factory=list)
    citations:   List[Citation]        = field(default_factory=list)
    status:      str                   = "draft"
    score:       float                 = 0.0
    created_at:  str                   = ""
    updated_at:  str                   = ""
    metadata:    Dict[str, Any]        = field(default_factory=dict)

    def word_count(self) -> int:
        return len(self.abstract.split())

    def confirmed_hypotheses(self) -> List[Hypothesis]:
        return [h for h in self.hypotheses if h.status == "confirmed"]

    def avg_confidence(self) -> Optional[float]:
        active = [h.confidence for h in self.hypotheses if h.is_active()]
        return sum(active) / len(active) if active else None

    def matches_query(self, query: str) -> bool:
        """Case-insensitive search across title, abstract, and tags."""
        q   = query.lower()
        hay = " ".join([self.title, self.abstract] + self.tags).lower()
        return q in hay


# ──────────────────────────────────────────────────────────────────────────────
# Analyzer
# ──────────────────────────────────────────────────────────────────────────────

class ResearchAnalyzer:
    """
    SQLite-backed store and analysis engine for research papers.

    Example::

        ra = ResearchAnalyzer()
        pid = ra.add_paper("Emergence in Multi-Agent Systems",
                            abstract="...", tags=["multi-agent", "emergence"])
        ra.add_hypothesis(pid, "Agents self-organize under contradiction pressure",
                          confidence=0.7)
        ra.update_score(pid, 8.5)
        results = ra.search("emergence")
        stats   = ra.corpus_stats()
    """

    def __init__(self, db_path: Optional[Path] = None) -> None:
        self.db_path = db_path or DB_PATH
        self._init_db()

    # ── DB bootstrap ──────────────────────────────────────────────────────────

    def _init_db(self) -> None:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(self.db_path) as con:
            con.executescript("""
                CREATE TABLE IF NOT EXISTS papers (
                    id          TEXT PRIMARY KEY,
                    title       TEXT NOT NULL,
                    abstract    TEXT NOT NULL DEFAULT '',
                    authors     TEXT NOT NULL DEFAULT '[]',
                    tags        TEXT NOT NULL DEFAULT '[]',
                    status      TEXT NOT NULL DEFAULT 'draft',
                    score       REAL NOT NULL DEFAULT 0.0,
                    created_at  TEXT NOT NULL,
                    updated_at  TEXT NOT NULL,
                    metadata    TEXT NOT NULL DEFAULT '{}'
                );
                CREATE TABLE IF NOT EXISTS hypotheses (
                    id          TEXT PRIMARY KEY,
                    paper_id    TEXT NOT NULL REFERENCES papers(id),
                    text        TEXT NOT NULL,
                    status      TEXT NOT NULL DEFAULT 'proposed',
                    confidence  REAL NOT NULL DEFAULT 0.5,
                    evidence    TEXT NOT NULL DEFAULT '[]',
                    created_at  TEXT NOT NULL,
                    updated_at  TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS citations (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    paper_id    TEXT NOT NULL REFERENCES papers(id),
                    ref_id      TEXT NOT NULL,
                    title       TEXT NOT NULL,
                    authors     TEXT NOT NULL DEFAULT '[]',
                    year        INTEGER,
                    url         TEXT NOT NULL DEFAULT '',
                    notes       TEXT NOT NULL DEFAULT ''
                );
                CREATE VIRTUAL TABLE IF NOT EXISTS papers_fts
                    USING fts5(id UNINDEXED, title, abstract, tags,
                               content='papers', content_rowid='rowid');
                CREATE INDEX IF NOT EXISTS idx_papers_status ON papers(status);
                CREATE INDEX IF NOT EXISTS idx_papers_score  ON papers(score);
                CREATE INDEX IF NOT EXISTS idx_hyp_paper     ON hypotheses(paper_id);
                CREATE INDEX IF NOT EXISTS idx_hyp_status    ON hypotheses(status);
            """)

    # ── Paper CRUD ────────────────────────────────────────────────────────────

    def add_paper(
        self,
        title:    str,
        abstract: str                    = "",
        authors:  Optional[List[str]]    = None,
        tags:     Optional[List[str]]    = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Add a new research paper to the corpus.

        Args:
            title:    Paper title (must be unique-ish; ID derived from hash).
            abstract: Abstract or summary text.
            authors:  List of author name strings.
            tags:     Classification / keyword tags.
            metadata: Additional key-value metadata.

        Returns:
            Paper ID string.
        """
        pid = _paper_id(title)
        ts  = _now()
        with sqlite3.connect(self.db_path) as con:
            con.execute(
                """
                INSERT OR IGNORE INTO papers
                    (id, title, abstract, authors, tags, status,
                     score, created_at, updated_at, metadata)
                VALUES (?, ?, ?, ?, ?, 'draft', 0.0, ?, ?, ?)
                """,
                (pid, title, abstract,
                 json.dumps(authors or []), json.dumps(tags or []),
                 ts, ts, json.dumps(metadata or {})),
            )
            con.execute(
                "INSERT OR IGNORE INTO papers_fts(id, title, abstract, tags) VALUES (?,?,?,?)",
                (pid, title, abstract, " ".join(tags or [])),
            )
        return pid

    def get_paper(self, paper_id: str) -> Optional[ResearchPaper]:
        """Load a full ResearchPaper by ID."""
        with sqlite3.connect(self.db_path) as con:
            con.row_factory = sqlite3.Row
            row = con.execute("SELECT * FROM papers WHERE id=?", (paper_id,)).fetchone()
            if not row:
                return None
            return self._row_to_paper(dict(row), con)

    def update_score(self, paper_id: str, score: float) -> None:
        """Update the relevance/quality score (0–10)."""
        with sqlite3.connect(self.db_path) as con:
            con.execute("UPDATE papers SET score=?, updated_at=? WHERE id=?",
                        (max(0.0, min(10.0, score)), _now(), paper_id))

    def update_status(self, paper_id: str, status: str) -> None:
        """Transition paper status (draft→review→published→archived)."""
        valid = {"draft", "review", "published", "archived"}
        if status not in valid:
            raise ValueError(f"Invalid status '{status}'. Choose from {valid}")
        with sqlite3.connect(self.db_path) as con:
            con.execute("UPDATE papers SET status=?, updated_at=? WHERE id=?",
                        (status, _now(), paper_id))

    def delete_paper(self, paper_id: str) -> bool:
        with sqlite3.connect(self.db_path) as con:
            for tbl in ("hypotheses", "citations"):
                con.execute(f"DELETE FROM {tbl} WHERE paper_id=?", (paper_id,))
            cur = con.execute("DELETE FROM papers WHERE id=?", (paper_id,))
            return cur.rowcount > 0

    # ── Hypotheses ────────────────────────────────────────────────────────────

    def add_hypothesis(
        self,
        paper_id:   str,
        text:       str,
        confidence: float = 0.5,
        evidence:   Optional[List[str]] = None,
    ) -> str:
        """Register a hypothesis for a paper."""
        ts  = _now()
        hid = hashlib.md5(f"{paper_id}{text}{ts}".encode()).hexdigest()[:12]
        with sqlite3.connect(self.db_path) as con:
            con.execute(
                """
                INSERT INTO hypotheses (id, paper_id, text, status, confidence,
                                        evidence, created_at, updated_at)
                VALUES (?, ?, ?, 'proposed', ?, ?, ?, ?)
                """,
                (hid, paper_id, text, confidence,
                 json.dumps(evidence or []), ts, ts),
            )
        return hid

    def update_hypothesis(
        self,
        hyp_id:     str,
        status:     Optional[str]       = None,
        confidence: Optional[float]     = None,
        evidence:   Optional[List[str]] = None,
    ) -> None:
        """Update hypothesis status, confidence, or evidence list."""
        with sqlite3.connect(self.db_path) as con:
            row = con.execute(
                "SELECT * FROM hypotheses WHERE id=?", (hyp_id,)
            ).fetchone()
            if not row:
                raise KeyError(f"Hypothesis '{hyp_id}' not found")
            new_status     = status     or row[3]
            new_confidence = confidence if confidence is not None else row[4]
            ev_list        = evidence   or json.loads(row[5])
            con.execute(
                "UPDATE hypotheses SET status=?, confidence=?, evidence=?, updated_at=? WHERE id=?",
                (new_status, new_confidence, json.dumps(ev_list), _now(), hyp_id),
            )

    # ── Citations ─────────────────────────────────────────────────────────────

    def add_citation(
        self,
        paper_id: str,
        ref_id:   str,
        title:    str,
        authors:  Optional[List[str]] = None,
        year:     Optional[int]       = None,
        url:      str                 = "",
        notes:    str                 = "",
    ) -> None:
        """Register a citation for a paper."""
        with sqlite3.connect(self.db_path) as con:
            con.execute(
                """
                INSERT INTO citations (paper_id, ref_id, title, authors, year, url, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (paper_id, ref_id, title, json.dumps(authors or []), year, url, notes),
            )

    # ── Search & Queries ──────────────────────────────────────────────────────

    def search(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Full-text search over title, abstract, and tags.

        Falls back to LIKE-based search if FTS5 is unavailable.
        """
        q = query.lower()
        with sqlite3.connect(self.db_path) as con:
            con.row_factory = sqlite3.Row
            try:
                rows = con.execute(
                    """
                    SELECT p.* FROM papers p
                    JOIN papers_fts f ON p.id = f.id
                    WHERE papers_fts MATCH ? ORDER BY rank LIMIT ?
                    """,
                    (query, limit),
                ).fetchall()
            except sqlite3.OperationalError:
                # FTS fallback
                rows = con.execute(
                    """
                    SELECT * FROM papers
                    WHERE lower(title)    LIKE ?
                       OR lower(abstract) LIKE ?
                       OR lower(tags)     LIKE ?
                    LIMIT ?
                    """,
                    (f"%{q}%", f"%{q}%", f"%{q}%", limit),
                ).fetchall()
        return [self._row_to_summary(dict(r)) for r in rows]

    def list_papers(
        self,
        status:   Optional[str] = None,
        tag:      Optional[str] = None,
        min_score: float        = 0.0,
        limit:    int           = 50,
    ) -> List[Dict[str, Any]]:
        """List papers with optional filters sorted by score descending."""
        clauses: List[str] = ["score >= ?"]
        params:  List[Any] = [min_score]
        if status:
            clauses.append("status = ?")
            params.append(status)
        where = "WHERE " + " AND ".join(clauses)
        with sqlite3.connect(self.db_path) as con:
            con.row_factory = sqlite3.Row
            rows = con.execute(
                f"SELECT * FROM papers {where} ORDER BY score DESC LIMIT ?",
                params + [limit],
            ).fetchall()
        result = [self._row_to_summary(dict(r)) for r in rows]
        if tag:
            result = [r for r in result if tag.lower() in [t.lower() for t in r["tags"]]]
        return result

    def corpus_stats(self) -> Dict[str, Any]:
        """Return aggregate statistics for the full corpus."""
        with sqlite3.connect(self.db_path) as con:
            total     = con.execute("SELECT COUNT(*) FROM papers").fetchone()[0]
            by_status = dict(con.execute(
                "SELECT status, COUNT(*) FROM papers GROUP BY status"
            ).fetchall())
            avg_score = con.execute("SELECT AVG(score) FROM papers WHERE score > 0").fetchone()[0]
            hyp_count = con.execute("SELECT COUNT(*) FROM hypotheses").fetchone()[0]
            confirmed = con.execute(
                "SELECT COUNT(*) FROM hypotheses WHERE status='confirmed'"
            ).fetchone()[0]
            tag_rows  = con.execute("SELECT tags FROM papers").fetchall()

        all_tags: Dict[str, int] = {}
        for (tags_json,) in tag_rows:
            for t in json.loads(tags_json or "[]"):
                all_tags[t] = all_tags.get(t, 0) + 1
        top_tags = sorted(all_tags.items(), key=lambda x: x[1], reverse=True)[:10]

        return {
            "total_papers":        total,
            "by_status":           by_status,
            "avg_score":           round(avg_score or 0.0, 2),
            "total_hypotheses":    hyp_count,
            "confirmed_hypotheses": confirmed,
            "confirmation_rate":   round(confirmed / hyp_count, 3) if hyp_count else 0.0,
            "top_tags":            top_tags,
        }

    def top_papers(self, n: int = 5, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Return top-N papers by score."""
        return self.list_papers(status=status, limit=n)

    # ── Internal helpers ──────────────────────────────────────────────────────

    def _row_to_paper(self, row: Dict[str, Any], con: sqlite3.Connection) -> ResearchPaper:
        pid = row["id"]
        con.row_factory = sqlite3.Row

        hyp_rows = con.execute(
            "SELECT * FROM hypotheses WHERE paper_id=? ORDER BY created_at", (pid,)
        ).fetchall()
        hypotheses = [
            Hypothesis(
                id=h["id"], text=h["text"], status=h["status"],
                confidence=h["confidence"], evidence=json.loads(h["evidence"]),
                created_at=h["created_at"], updated_at=h["updated_at"],
            )
            for h in hyp_rows
        ]

        cit_rows  = con.execute("SELECT * FROM citations WHERE paper_id=?", (pid,)).fetchall()
        citations = [
            Citation(
                ref_id=c["ref_id"], title=c["title"],
                authors=json.loads(c["authors"]), year=c["year"],
                url=c["url"], notes=c["notes"],
            )
            for c in cit_rows
        ]

        return ResearchPaper(
            id=pid,
            title=row["title"],
            abstract=row["abstract"],
            authors=json.loads(row.get("authors") or "[]"),
            tags=json.loads(row.get("tags")    or "[]"),
            hypotheses=hypotheses,
            citations=citations,
            status=row["status"],
            score=row["score"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            metadata=json.loads(row.get("metadata") or "{}"),
        )

    def _row_to_summary(self, row: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id":         row["id"],
            "title":      row["title"],
            "status":     row["status"],
            "score":      row["score"],
            "authors":    json.loads(row.get("authors") or "[]"),
            "tags":       json.loads(row.get("tags")    or "[]"),
            "created_at": row["created_at"],
        }


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _paper_id(title: str) -> str:
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
    h  = hashlib.md5(f"{title}{ts}".encode()).hexdigest()[:10]
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower())[:24].strip("-")
    return f"{slug}-{h}"


# ──────────────────────────────────────────────────────────────────────────────
# Demo
# ──────────────────────────────────────────────────────────────────────────────

DEMO_PAPERS = [
    {
        "title":    "Contradiction Amplification in Multi-Agent Systems",
        "abstract": "We study how contradictions in distributed agent beliefs "
                    "propagate and amplify across network topologies, proposing "
                    "K(t) = C(t) · e^(λ|δ_t|) as a model for emergence dynamics.",
        "authors":  ["A. Blackroad", "L. Core"],
        "tags":     ["multi-agent", "contradiction", "emergence", "ps-sha"],
        "hypotheses": [
            ("Contradiction amplification follows exponential growth", 0.8),
            ("Agent belief divergence stabilizes under quorum mechanisms",  0.6),
        ],
        "citations": [
            ("ref-001", "Paraconsistent Logic for AI", ["D. Priest"], 2019),
        ],
        "score": 9.2,
    },
    {
        "title":    "PS-SHA∞: Persistent Hash-Chain Memory for AI Agents",
        "abstract": "We introduce PS-SHA∞, an append-only journal scheme with "
                    "cryptographic chaining for tamper-evident agent memory, "
                    "enabling cross-session identity persistence.",
        "authors":  ["C. Ellis", "A. Blackroad"],
        "tags":     ["memory", "cryptography", "identity", "ps-sha"],
        "hypotheses": [
            ("PS-SHA∞ journals are computationally indistinguishable from tamper-free logs", 0.9),
        ],
        "citations": [
            ("ref-002", "Merkle Trees in Distributed Systems", ["R. Merkle"], 1988),
            ("ref-003", "Blockchain Fundamentals",             ["S. Nakamoto"], 2008),
        ],
        "score": 8.7,
    },
    {
        "title":    "Trinary Logic for Epistemic Uncertainty in AI",
        "abstract": "We extend classical binary logic with a third truth value "
                    "(0 = unknown) enabling agents to reason under uncertainty "
                    "without collapsing to arbitrary defaults.",
        "authors":  ["L. Core"],
        "tags":     ["logic", "uncertainty", "reasoning", "trinary"],
        "hypotheses": [
            ("Trinary reasoning reduces hallucination in LLM pipelines",  0.65),
            ("Unknown-state quarantine outperforms random tie-breaking",  0.75),
        ],
        "score": 7.9,
    },
    {
        "title":    "World Artifact Generation via Agent Collaboration",
        "abstract": "Collaborative agent systems can generate coherent world "
                    "artifacts (maps, histories, economies) through iterated "
                    "negotiation and contradiction resolution.",
        "authors":  ["A. Blackroad", "C. Ellis", "L. Core"],
        "tags":     ["world-gen", "multi-agent", "collaboration", "emergence"],
        "score": 8.1,
    },
    {
        "title":    "Emergence Patterns in Large-Scale Agent Networks",
        "abstract": "Statistical analysis of 30,000 concurrent agent simulations "
                    "reveals phase-transition emergence at critical connectivity "
                    "thresholds consistent with percolation theory.",
        "authors":  ["D. Research"],
        "tags":     ["emergence", "statistical", "multi-agent", "scale"],
        "score": 8.5,
    },
]


def _run_demo(ra: ResearchAnalyzer) -> None:
    print("\n\U0001f9ea BlackRoad Labs — Research Corpus Demo\n")

    paper_ids = []
    for p in DEMO_PAPERS:
        pid = ra.add_paper(
            title=p["title"], abstract=p["abstract"],
            authors=p.get("authors", []), tags=p.get("tags", []),
        )
        ra.update_score(pid, p["score"])
        ra.update_status(pid, "published")
        for hyp_text, conf in p.get("hypotheses", []):
            ra.add_hypothesis(pid, hyp_text, confidence=conf)
        for cit in p.get("citations", []):
            ra.add_citation(pid, *cit)
        paper_ids.append(pid)
        print(f"  + {p['title'][:55]:<55} score={p['score']}")

    print("\n\U0001f4ca Corpus statistics:")
    stats = ra.corpus_stats()
    print(f"  Papers     : {stats['total_papers']}")
    print(f"  Hypotheses : {stats['total_hypotheses']}")
    print(f"  Avg score  : {stats['avg_score']}")
    top = stats["top_tags"][:5]
    print(f"  Top tags   : {', '.join(f'{t}({n})' for t, n in top)}")

    print("\n\U0001f50d Search 'emergence':")
    results = ra.search("emergence")
    for r in results[:3]:
        print(f"  [{r['score']:.1f}] {r['title'][:60]}")

    print("\n\U0001f3c6 Top papers:")
    for r in ra.top_papers(3):
        print(f"  [{r['score']:.1f}] {r['title'][:60]}")
    print()


# ──────────────────────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────────────────────

def _build_cli() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="research_analyzer",
        description="BlackRoad Labs — Research Analyzer",
    )
    sub = p.add_subparsers(dest="command", required=True)

    sub.add_parser("demo",  help="Load demo corpus and print summary")

    ls = sub.add_parser("list", help="List papers")
    ls.add_argument("--status",    default=None)
    ls.add_argument("--tag",       default=None)
    ls.add_argument("--min-score", type=float, default=0.0)
    ls.add_argument("--limit",     type=int, default=20)

    sr = sub.add_parser("search", help="Full-text search")
    sr.add_argument("--query", required=True)
    sr.add_argument("--limit", type=int, default=10)

    sub.add_parser("stats", help="Print corpus statistics")

    show = sub.add_parser("show", help="Show a paper's full details")
    show.add_argument("paper_id")

    return p


def main(argv: Optional[List[str]] = None) -> int:
    args = _build_cli().parse_args(argv)
    ra   = ResearchAnalyzer()

    if args.command == "demo":
        _run_demo(ra)
        return 0

    elif args.command == "list":
        papers = ra.list_papers(status=args.status, tag=args.tag,
                                min_score=args.min_score, limit=args.limit)
        print(f"\n{'ID':<14} {'Score':>6}  {'Status':<12} {'Title'}")
        print(f"{'─'*14} {'─'*6}  {'─'*12} {'─'*40}")
        for pp in papers:
            print(f"{pp['id'][:14]:<14} {pp['score']:>6.1f}  {pp['status']:<12} {pp['title'][:50]}")
        print()
        return 0

    elif args.command == "search":
        results = ra.search(args.query, limit=args.limit)
        print(f"\nSearch: '{args.query}'  —  {len(results)} results\n")
        for r in results:
            print(f"  [{r['score']:.1f}] {r['title']}")
            print(f"         tags: {', '.join(r['tags'])}")
        print()
        return 0

    elif args.command == "stats":
        stats = ra.corpus_stats()
        print("\n\U0001f4ca Corpus Statistics\n")
        for k, v in stats.items():
            print(f"  {k:<25} {v}")
        print()
        return 0

    elif args.command == "show":
        paper = ra.get_paper(args.paper_id)
        if not paper:
            print(f"Paper '{args.paper_id}' not found")
            return 1
        print(f"\nTitle    : {paper.title}")
        print(f"Status   : {paper.status}  Score: {paper.score}")
        print(f"Authors  : {', '.join(paper.authors)}")
        print(f"Tags     : {', '.join(paper.tags)}")
        print(f"Abstract : {paper.abstract[:200]}{'...' if len(paper.abstract) > 200 else ''}")
        if paper.hypotheses:
            print(f"\nHypotheses ({len(paper.hypotheses)}):")
            for h in paper.hypotheses:
                print(f"  [{h.status:<10}] conf={h.confidence:.2f}  {h.text[:70]}")
        if paper.citations:
            print(f"\nCitations ({len(paper.citations)}):")
            for c in paper.citations:
                year_str = f" ({c.year})" if c.year else ""
                print(f"  [{c.ref_id}] {c.title}{year_str}")
        print()
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
