"""Tests for the Lucidia Encompass voting heuristic."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from agents.lucidia_encompass import LucidiaEncompass, WeightedConsensusScorer, score_packets
from agents.personas import Persona, PersonaError, PersonaNetworkError


class StaticPersona(Persona):
    """Persona returning a preconfigured payload for deterministic tests."""

    def __init__(self, name: str, *, response: str, confidence: float) -> None:
        super().__init__(
            name=name,
            voice=f"{name} voice",
            focus=("focus",),
            base_confidence=confidence,
            response_builder=lambda prompt: {
                "response": response,
                "summary": f"{name} summary",
                "confidence": confidence,
            },
        )


class FailingPersona(Persona):
    """Persona raising errors to simulate network/API failures."""

    def __init__(self, name: str, exc: Exception) -> None:
        super().__init__(
            name=name,
            voice=f"{name} voice",
            focus=(),
            response_builder=lambda prompt: _raise(exc),
        )


def _raise(exc: Exception):  # pragma: no cover - helper used indirectly
    raise exc


def test_score_packets_prefers_positive_signal() -> None:
    packets = [
        {
            "persona": "Origin",
            "balanced_ternary": "+",
            "confidence": 0.9,
            "verdict": "approve",
            "justification": "Stable positive outcome",
        },
        {
            "persona": "Analyst",
            "balanced_ternary": "0",
            "confidence": 0.6,
            "verdict": "defer",
            "justification": "Needs more data",
        },
    ]

    result = score_packets(packets)
    assert result["winner"] == "Origin"
    assert result["consensus_r"] == 0.5


def test_score_packets_handles_negative_votes() -> None:
    packets = [
        {
            "persona": "Origin",
            "balanced_ternary": "-",
            "confidence": 0.4,
            "verdict": "reject",
            "justification": "High risk",
        },
        {
            "persona": "Designer",
            "balanced_ternary": "-",
            "confidence": 0.8,
            "verdict": "reject",
            "justification": "Poor UX impact",
        },
    ]

    result = score_packets(packets)
    assert result["winner"] == "Designer"
    assert result["consensus_r"] == 1.0


def test_encompass_orders_packets_by_score() -> None:
    personas = [
        StaticPersona("Low", response="Short reply", confidence=0.2),
        StaticPersona(
            "High",
            response="Detailed response with several components including clarity and alignment",
            confidence=0.9,
        ),
    ]
    scorer = WeightedConsensusScorer(coverage_weight=0.25, depth_weight=0.25)
    result = LucidiaEncompass(personas, scorer=scorer).run("Tell me something important")

    packets = result["packets"]
    assert packets[0]["persona"] == "High"
    assert packets[0]["score"] >= packets[1]["score"]
    assert result["winner"] == "High"
    assert 0.0 <= result["consensus"] <= 1.0


def test_encompass_handles_network_error(tmp_path: Path) -> None:
    personas = [
        StaticPersona("Stable", response="All good here", confidence=0.6),
        FailingPersona("Offline", PersonaNetworkError("gateway timeout")),
    ]

    result = LucidiaEncompass(personas).run("Status check")
    packets = {packet["persona"]: packet for packet in result["packets"]}

    assert packets["Offline"]["error"] == "gateway timeout"
    assert packets["Offline"]["confidence"] == 0.0
    assert packets["Stable"]["score"] > 0.0

    output_file = tmp_path / "packets.json"
    output_file.write_text(json.dumps(result), encoding="utf-8")
    loaded = json.loads(output_file.read_text(encoding="utf-8"))
    assert "winner" in loaded and loaded["winner"]


def test_persona_builder_raises_clean_error() -> None:
    persona = Persona(
        name="Errant",
        voice="",
        focus=(),
        response_builder=lambda prompt: {"response": "", "summary": ""},
    )
    with pytest.raises(PersonaError):
        persona.generate_packet("anything")
