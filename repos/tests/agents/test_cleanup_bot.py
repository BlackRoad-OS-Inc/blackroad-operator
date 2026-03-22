"""Tests for the cleanup bot summary helpers."""

from __future__ import annotations

import logging
from typing import Dict

import pytest

from agents.cleanup_bot import CleanupBot, CleanupSummary


class DummyCleanupBot(CleanupBot):
    """Cleanup bot subclass that returns predetermined results."""

    def __init__(self, branches: Dict[str, bool]):
        super().__init__(list(branches))
        self._results = branches

    def delete_branch(self, branch: str) -> bool:  # type: ignore[override]
        return self._results[branch]


def test_cleanup_summary_counts_and_empty_state() -> None:
    """CleanupSummary exposes deletion counts and empty detection."""

    summary = CleanupSummary({"feature/a": True, "feature/b": False})

    assert summary.deleted == 1
    assert summary.failed == 1
    assert not summary.is_empty()


def test_cleanup_summary_log_details(caplog: pytest.LogCaptureFixture) -> None:
    """Log output contains branch status and aggregate counts."""

    summary = CleanupSummary({"feature/a": True, "feature/b": False})

    logger = logging.getLogger("cleanup-tests")
    with caplog.at_level(logging.INFO):
        summary.log_details(logger)

    assert "feature/a: deleted" in caplog.text
    assert "feature/b: failed" in caplog.text
    assert "Summary: 1 deleted, 1 failed" in caplog.text


def test_cleanup_bot_cleanup_returns_summary() -> None:
    """CleanupBot.cleanup returns a summary populated from delete results."""

    bot = DummyCleanupBot({"feature/a": True, "feature/b": False})

    summary = bot.cleanup()

    assert summary.results == {"feature/a": True, "feature/b": False}
    assert summary.deleted == 1
    assert summary.failed == 1
