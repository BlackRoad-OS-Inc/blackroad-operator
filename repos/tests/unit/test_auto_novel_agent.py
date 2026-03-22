"""Unit tests for :mod:`agents.auto_novel_agent`."""

import pytest

from agents.auto_novel_agent import (
    AutoNovelAgent,
    DEFAULT_CONSENT_SCOPES,
    DEFAULT_SUPPORTED_ENGINES,
)
from agents.consent_policy import ConsentRecord


@pytest.fixture()
def agent() -> AutoNovelAgent:
    """Return an agent with deterministic consent scopes for testing."""

    consent = ConsentRecord.full(
        scopes=DEFAULT_CONSENT_SCOPES,
        evidence="unit-test",
    )
    return AutoNovelAgent(consent=consent)


def test_deploy_returns_message(agent: AutoNovelAgent) -> None:
    message = agent.deploy()
    assert message.endswith("ready to generate novels!")


def test_supported_engines_are_normalised(agent: AutoNovelAgent) -> None:
    assert agent.supports_engine("Unity")
    agent.add_supported_engine(" Godot ")
    assert "godot" in agent.supported_engines
    agent.remove_supported_engine("godot")
    assert set(agent.list_supported_engines()) == set(DEFAULT_SUPPORTED_ENGINES)


def test_create_game_with_unsupported_engine(agent: AutoNovelAgent) -> None:
    with pytest.raises(ValueError, match="Unsupported engine"):
        agent.create_game("cryengine")


def test_generate_story_series(agent: AutoNovelAgent) -> None:
    stories = agent.generate_story_series(["mystery", "sci-fi"], protagonist="Explorer")
    assert len(stories) == 2
    assert all("Explorer" in story for story in stories)


def test_generate_code_snippet(agent: AutoNovelAgent) -> None:
    snippet = agent.generate_code_snippet("Implement addition", language="python")
    assert "TODO: Implement addition" in snippet
    assert snippet.endswith("pass\n")


def test_generate_code_snippet_invalid_language(agent: AutoNovelAgent) -> None:
    with pytest.raises(ValueError, match="Unsupported language"):
        agent.generate_code_snippet("demo", language="brainfuck")


def test_validate_scopes_rejects_unknown(agent: AutoNovelAgent) -> None:
    with pytest.raises(ValueError, match="Invalid scopes"):
        agent.validate_scopes(["agent:configure", "unknown:scope"])


def test_set_gamma_updates_value(agent: AutoNovelAgent) -> None:
    agent.set_gamma(2.5)
    assert agent.gamma == 2.5


def test_write_novel_creates_outline(agent: AutoNovelAgent) -> None:
    outline = agent.write_novel("Journey", chapters=2)
    assert outline == ["Chapter 1: TBD", "Chapter 2: TBD"]

