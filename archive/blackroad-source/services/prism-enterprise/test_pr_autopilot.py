"""Unit tests for :mod:`agents.pr_autopilot`."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from agents.pr_autopilot import AutomatedPullRequestManager


@pytest.fixture()
def manager(monkeypatch: pytest.MonkeyPatch) -> AutomatedPullRequestManager:
    mgr = AutomatedPullRequestManager("example/repo")
    monkeypatch.setattr(mgr, "run_tests", MagicMock())
    monkeypatch.setattr(mgr, "setup_ci_and_preview_deploy", MagicMock())
    monkeypatch.setattr(mgr, "run_security_and_dependency_scans", MagicMock())
    monkeypatch.setattr(mgr, "apply_comment_fixes", MagicMock())
    monkeypatch.setattr(mgr, "enable_auto_merge", MagicMock())
    return mgr


def test_process_comment_runs_requested_actions(manager: AutomatedPullRequestManager) -> None:
    comment = """
    @codex @copilot @blackboxprogramming @dependabot @asana @linear
    review and test the feature branch, set up CI and preview deploy,
    run security and dependency scans, and apply comment fixes

    @codex fix comments              # auto-fixes code review comments
    @codex apply .github/prompts/codex-fix-comments.md
    @codex patch                     # applies code diffs
    @codex run tests                 # triggers test suite
    @codex ship when green           # queues auto-merge
    """

    manager.process_comment(comment, pr_number=42, branch_name="feature/x")

    assert manager.run_tests.call_count == 1
    assert manager.setup_ci_and_preview_deploy.call_count == 1
    assert manager.run_security_and_dependency_scans.call_count == 1
    manager.apply_comment_fixes.assert_called_once_with(
        pr_number=42, branch_name="feature/x"
    )
    manager.enable_auto_merge.assert_called_once_with(42)


def test_process_comment_requires_pr_number_for_auto_merge(
    manager: AutomatedPullRequestManager,
) -> None:
    manager.process_comment("@codex ship when green", branch_name="feature/x")
    manager.enable_auto_merge.assert_not_called()
