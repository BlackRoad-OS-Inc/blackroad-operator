"""Tests for the WebberBot Prettier integration."""

import subprocess

import pytest

from agents.webber_bot import WebberBot


@pytest.fixture
def webber_bot():
    """Return a WebberBot instance for testing."""
    return WebberBot()


def test_run_prettier_missing_executable(monkeypatch, webber_bot):
    """Missing Prettier should surface a descriptive RuntimeError."""

    def fake_run(*_args, **_kwargs):
        raise FileNotFoundError("prettier not installed")

    monkeypatch.setattr(subprocess, "run", fake_run)

    with pytest.raises(RuntimeError) as excinfo:
        webber_bot._run_prettier("index.html")

    message = str(excinfo.value)
    assert "Prettier executable not found" in message


def test_run_prettier_failure_includes_process_output(monkeypatch, webber_bot):
    """CalledProcessError should include stdout and stderr in the message."""

    def fake_run(*_args, **_kwargs):
        raise subprocess.CalledProcessError(
            returncode=2,
            cmd=["prettier", "--write", "index.html"],
            output="formatted diff",
            stderr="syntax error",
        )

    monkeypatch.setattr(subprocess, "run", fake_run)

    with pytest.raises(RuntimeError) as excinfo:
        webber_bot._run_prettier("index.html")

    message = str(excinfo.value)
    assert "Prettier failed for index.html" in message
    assert "formatted diff" in message
    assert "syntax error" in message
