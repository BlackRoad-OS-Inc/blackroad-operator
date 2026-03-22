"""Tests for src/research_analyzer.py"""
from __future__ import annotations
from pathlib import Path
import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.research_analyzer import ResearchAnalyzer, ResearchPaper, Hypothesis


@pytest.fixture
def ra(tmp_path: Path) -> ResearchAnalyzer:
    return ResearchAnalyzer(db_path=tmp_path / "test_research.db")


@pytest.fixture
def sample_paper(ra: ResearchAnalyzer) -> str:
    pid = ra.add_paper(
        "Emergence in Multi-Agent Systems",
        abstract="We study emergence under contradiction pressure in agent networks.",
        authors=["A. Author"],
        tags=["multi-agent", "emergence"],
    )
    ra.update_score(pid, 8.5)
    return pid


class TestAddPaper:
    def test_returns_id(self, ra):
        pid = ra.add_paper("Test Paper")
        assert isinstance(pid, str) and len(pid) > 5

    def test_get_paper_roundtrip(self, ra, sample_paper):
        paper = ra.get_paper(sample_paper)
        assert paper is not None
        assert paper.title == "Emergence in Multi-Agent Systems"
        assert paper.score == pytest.approx(8.5)
        assert "emergence" in paper.tags

    def test_missing_paper_returns_none(self, ra):
        assert ra.get_paper("nonexistent-id") is None

    def test_update_status(self, ra, sample_paper):
        ra.update_status(sample_paper, "published")
        paper = ra.get_paper(sample_paper)
        assert paper.status == "published"

    def test_invalid_status_raises(self, ra, sample_paper):
        with pytest.raises(ValueError, match="Invalid status"):
            ra.update_status(sample_paper, "super-published")

    def test_delete_paper(self, ra, sample_paper):
        assert ra.delete_paper(sample_paper) is True
        assert ra.get_paper(sample_paper) is None


class TestHypotheses:
    def test_add_hypothesis(self, ra, sample_paper):
        hid = ra.add_hypothesis(sample_paper, "Agents self-organize", confidence=0.7)
        paper = ra.get_paper(sample_paper)
        assert len(paper.hypotheses) == 1
        assert paper.hypotheses[0].confidence == pytest.approx(0.7)

    def test_update_hypothesis_status(self, ra, sample_paper):
        hid = ra.add_hypothesis(sample_paper, "Test hypothesis", confidence=0.5)
        ra.update_hypothesis(hid, status="confirmed", confidence=0.95)
        paper = ra.get_paper(sample_paper)
        h = paper.hypotheses[0]
        assert h.status == "confirmed"
        assert h.confidence == pytest.approx(0.95)

    def test_hypothesis_is_active(self):
        h = Hypothesis(id="x", text="t", status="proposed", confidence=0.5)
        assert h.is_active() is True
        h.status = "confirmed"
        assert h.is_active() is False

    def test_update_confidence_clamped(self):
        h = Hypothesis(id="x", text="t", status="proposed", confidence=0.9)
        h.update_confidence(0.5)
        assert h.confidence == pytest.approx(1.0)
        h.update_confidence(-2.0)
        assert h.confidence == pytest.approx(0.0)


class TestCitations:
    def test_add_citation(self, ra, sample_paper):
        ra.add_citation(sample_paper, "ref-001", "Foundational Paper",
                        authors=["B. Smart"], year=2020)
        paper = ra.get_paper(sample_paper)
        assert len(paper.citations) == 1
        assert paper.citations[0].year == 2020


class TestSearch:
    def test_search_finds_paper(self, ra, sample_paper):
        results = ra.search("emergence")
        ids = [r["id"] for r in results]
        assert sample_paper in ids

    def test_search_no_results(self, ra, sample_paper):
        results = ra.search("xyzzy_not_found_12345")
        assert results == []

    def test_list_by_tag(self, ra, sample_paper):
        papers = ra.list_papers(tag="multi-agent")
        assert any(p["id"] == sample_paper for p in papers)

    def test_list_min_score(self, ra, sample_paper):
        papers = ra.list_papers(min_score=9.0)
        assert all(p["score"] >= 9.0 for p in papers)


class TestCorpusStats:
    def test_stats_keys(self, ra, sample_paper):
        stats = ra.corpus_stats()
        assert "total_papers"     in stats
        assert "total_hypotheses" in stats
        assert "avg_score"        in stats
        assert "top_tags"         in stats

    def test_total_papers_count(self, ra):
        for i in range(3):
            ra.add_paper(f"Paper {i}", tags=["test"])
        stats = ra.corpus_stats()
        assert stats["total_papers"] >= 3


class TestResearchPaperModel:
    def test_word_count(self):
        p = ResearchPaper(id="x", title="t", abstract="hello world three words four five")
        assert p.word_count() == 6

    def test_matches_query(self):
        p = ResearchPaper(id="x", title="Trinary Logic", abstract="uncertain world",
                          tags=["logic"])
        assert p.matches_query("trinary") is True
        assert p.matches_query("xyz_no") is False


class TestCLI:
    def test_demo_command(self, tmp_path, monkeypatch, capsys):
        monkeypatch.setattr("src.research_analyzer.DB_PATH", tmp_path / "ra.db")
        from src.research_analyzer import main
        rc = main(["demo"])
        assert rc == 0
        out = capsys.readouterr().out
        assert "score=" in out or "Papers" in out

    def test_stats_command(self, tmp_path, monkeypatch, capsys):
        monkeypatch.setattr("src.research_analyzer.DB_PATH", tmp_path / "ra2.db")
        from src.research_analyzer import main
        main(["demo"])
        rc = main(["stats"])
        assert rc == 0

    def test_search_command(self, tmp_path, monkeypatch, capsys):
        monkeypatch.setattr("src.research_analyzer.DB_PATH", tmp_path / "ra3.db")
        from src.research_analyzer import main
        main(["demo"])
        rc = main(["search", "--query", "emergence"])
        assert rc == 0
