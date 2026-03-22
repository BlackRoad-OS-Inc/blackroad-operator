"""Tests for the :mod:`agents.cleanup_bot` module."""

from __future__ import annotations

from subprocess import CalledProcessError
from typing import List
"""Tests for :mod:`agents.cleanup_bot`."""

from subprocess import CalledProcessError

import pytest

from agents.cleanup_bot import CleanupBot


class _CallRecorder:
    """Utility helper to record sequential command invocations."""

    def __init__(self, responses: List[object] | None = None) -> None:
        self.calls: List[tuple[str, ...]] = []
        self._responses = iter(responses or [])

    def __call__(self, *cmd: str):  # type: ignore[override]
        self.calls.append(cmd)
        try:
            return next(self._responses)
        except StopIteration:
            return None



def test_cleanup_bot_executes_git_commands(monkeypatch: pytest.MonkeyPatch) -> None:
    """The bot should execute git commands for each branch."""

    bot = CleanupBot(["feature/new"], dry_run=False)
    calls: list[tuple[str, ...]] = []

    def fake_run(*cmd: str):
        calls.append(cmd)
        return None

    monkeypatch.setattr(bot, "_run", fake_run)

def test_delete_branch_success() -> None:
    """Successful branch deletion returns True."""
    bot = CleanupBot(branches=[])
    recorder = _CallRecorder()
    bot._run = recorder  # type: ignore[assignment]

    assert bot.delete_branch("feature/refactor") is True
    assert recorder.calls == [
        ("git", "branch", "-D", "feature/refactor"),
        ("git", "push", "origin", "--delete", "feature/refactor"),
    ]


def test_delete_branch_failure_returns_false() -> None:
    """Failures during deletion should be swallowed and return False."""
    bot = CleanupBot(branches=[])

    def failing_run(*_: str):  # type: ignore[override]
        raise CalledProcessError(1, "git")

    bot._run = failing_run  # type: ignore[assignment]

    assert bot.delete_branch("stale/branch") is False


def test_cleanup_attempts_local_and_remote_deletions(capsys: pytest.CaptureFixture[str]) -> None:
    """cleanup should attempt to delete both local and remote branches."""
    bot = CleanupBot(branches=["topic", "bugfix"])
    recorder = _CallRecorder()
    bot._run = recorder  # type: ignore[assignment]

    bot.cleanup()
    assert results == {"feature/new": True}
    assert calls == [
        ("git", "branch", "-D", "feature/new"),
        ("git", "push", "origin", "--delete", "feature/new"),
    ]


def test_cleanup_bot_dry_run_prints_commands(capsys: pytest.CaptureFixture[str]) -> None:
    """Dry-run mode should log delete commands without executing them."""

    bot = CleanupBot(branches=["feature/awesome"], dry_run=True)

    assert recorder.calls == [
        ("git", "branch", "-D", "topic"),
        ("git", "push", "origin", "--delete", "topic"),
        ("git", "branch", "-D", "bugfix"),
        ("git", "push", "origin", "--delete", "bugfix"),
    ]
    captured = capsys.readouterr()
    assert captured.out == ""


def test_cleanup_reports_missing_branches(capsys: pytest.CaptureFixture[str]) -> None:
    """cleanup should report when branches do not exist locally or remotely."""
    bot = CleanupBot(branches=["topic"])

    def failing_then_success(*cmd: str):  # type: ignore[override]
        if cmd[1] == "branch":
            raise CalledProcessError(1, cmd)
        if cmd[1] == "push":
            raise CalledProcessError(1, cmd)
        return None
    assert results == {"feature/awesome": True}


def test_cleanup_bot_cleanup_handles_failures(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    """``CleanupBot`` should mark branches as failed when git commands error."""

    bot = CleanupBot(branches=["bugfix/failure"], dry_run=False)
    calls: list[tuple[str, ...]] = []

    def failing_git(*args: str):
        calls.append(args)
        raise CalledProcessError(returncode=1, cmd=("git", *args))

    monkeypatch.setattr(bot, "_git", failing_git)

    bot._run = failing_then_success  # type: ignore[assignment]

    bot.cleanup()
    captured = capsys.readouterr()
    assert "Local branch 'topic' does not exist." in captured.out
    assert "Remote branch 'topic' does not exist." in captured.out
    assert results == {"bugfix/failure": False}
    captured = capsys.readouterr().out.strip().splitlines()
    assert captured == ["Failed to delete local branch 'bugfix/failure'"]
    assert calls == [("branch", "-D", "bugfix/failure")]
