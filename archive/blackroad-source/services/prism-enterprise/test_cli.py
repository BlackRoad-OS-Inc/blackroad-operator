"""Tests for the BlackRoad agent CLI entrypoint."""

from click.testing import CliRunner

from blackroad_agent.cli.blackroad import cli


def test_cli_run_invokes_remote_job(monkeypatch):
    """Ensure the `run` subcommand dispatches to `jobs.run_remote`."""

    calls = {}

    def fake_run_remote(hostname, command):
        calls["hostname"] = hostname
        calls["command"] = command

    monkeypatch.setattr("blackroad_agent.cli.blackroad.jobs.run_remote", fake_run_remote)

    runner = CliRunner()
    result = runner.invoke(cli, ["run", "echo", "hello"])

    assert result.exit_code == 0
    assert calls == {"hostname": "jetson.local", "command": "echo hello"}


def test_cli_help_succeeds():
    """The root CLI should render a help message without errors."""

    runner = CliRunner()
    result = runner.invoke(cli, ["--help"])

    assert result.exit_code == 0
    assert "BlackRoad CLI" in result.output
