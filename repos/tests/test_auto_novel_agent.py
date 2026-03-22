"""Tests for the :mod:`agents.auto_novel_agent` module."""
"""Tests for the AutoNovelAgent bot."""

import pytest

from agents.auto_novel_agent import AutoNovelAgent


def test_generate_storyline_returns_expected_sentence() -> None:
    """AutoNovelAgent should build a deterministic storyline."""
    agent = AutoNovelAgent()

    storyline = agent.generate_storyline("Ada", "a digital forest")

    assert (
        storyline
        == "Ada embarks on an adventure in a digital forest, "
        "discovering the true meaning of courage."
    )


def test_list_supported_engines_sorted() -> None:
    """The supported engines list should be sorted alphabetically."""
    agent = AutoNovelAgent()

    assert agent.list_supported_engines() == ["unity", "unreal"]
    with pytest.raises(ValueError):
        agent.create_game("godot")
    agent.add_supported_engine("Godot")
    assert "godot" in agent.list_supported_engines()
    agent.create_game("godot")


def test_remove_supported_engine_disables_creation():
    agent = AutoNovelAgent()
    agent.add_supported_engine("godot")
    agent.remove_supported_engine("Godot")
    with pytest.raises(ValueError):
        agent.create_game("godot")


def test_supported_engines_are_isolated_per_instance():
    first = AutoNovelAgent()
    second = AutoNovelAgent()

    first.add_supported_engine("godot")

    assert "godot" in first.list_supported_engines()
    assert "godot" not in second.list_supported_engines()
def test_list_supported_engines() -> None:
    agent = AutoNovelAgent()
    assert agent.list_supported_engines() == ["unity", "unreal"]


def test_create_game_supported_engine(capsys: pytest.CaptureFixture[str]) -> None:
    agent = AutoNovelAgent()
    agent.create_game("Unity")
    captured = capsys.readouterr()
    assert "Creating a Unity game without weapons..." in captured.out


def test_create_game_unsupported_engine() -> None:
    agent = AutoNovelAgent()
    with pytest.raises(ValueError):
        agent.create_game("godot")


def test_create_game_with_weapons() -> None:
    agent = AutoNovelAgent()
    with pytest.raises(ValueError):
        agent.create_game("unity", include_weapons=True)
