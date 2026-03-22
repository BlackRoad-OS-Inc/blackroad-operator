"""Schema checks for the Silas prompt cards dataset."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

CARDS_PATH = Path(__file__).resolve().parents[1] / "ui" / "prompt_cards" / "cards.json"
REQUIRED_TOKEN_CATEGORIES = {"goal", "constraint", "signal", "cadence", "quality"}


def load_cards() -> dict:
    with CARDS_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


@pytest.fixture(scope="module")
def payload() -> dict:
    return load_cards()


def test_top_level_shape(payload: dict) -> None:
    assert payload["agent"] == "Silas"
    assert "cards" in payload and isinstance(payload["cards"], list)
    assert payload["cards"], "cards collection should not be empty"


@pytest.mark.parametrize("required", ["id", "title", "purpose", "prompt", "tokens"])
def test_card_required_fields(payload: dict, required: str) -> None:
    for card in payload["cards"]:
        assert required in card, f"missing {required} in card {card.get('id')}"


@pytest.mark.parametrize("card_index", range(4))
def test_tokens_shape(payload: dict, card_index: int) -> None:
    card = payload["cards"][card_index]
    tokens = card["tokens"]
    assert isinstance(tokens, list) and tokens, "tokens should be a non-empty list"
    for token in tokens:
        assert set(token) == {"text", "category"}
        assert token["category"] in REQUIRED_TOKEN_CATEGORIES
        assert token["text"].strip(), "token text should not be blank"


def test_prompts_have_multiple_lines(payload: dict) -> None:
    for card in payload["cards"]:
        assert "\n" in card["prompt"], "prompt should contain guidance across multiple lines"
