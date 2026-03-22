"""Lucidia Encompass orchestration utilities.

The ``run`` function queries each registered persona, gathers packets
conforming to :mod:`schemas/persona_packet.json`, and elects a winning
persona based on balanced ternary scoring.

Example
-------
>>> packets = [
...     {"persona": "Origin", "balanced_ternary": "+", "confidence": 0.8, "verdict": "approve", "justification": "OK"},
...     {"persona": "Analyst", "balanced_ternary": "0", "confidence": 0.5, "verdict": "defer", "justification": "uncertain"},
... ]
>>> score_packets(packets)
{'winner': 'Origin', 'consensus_r': 0.5}
"""

from __future__ import annotations

import datetime as dt
import json
import math
import os
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Sequence

from .personas import (
    PERSONAS,
    Persona,
    PersonaError,
    PersonaNetworkError,
    PersonaPacket as PersonaResponsePacket,
    load_default_personas,
    system_prompt,
)

BALANCED_TERNARY_VALUES = {"+": 1, "0": 0, "-": -1}
DEFAULT_MODEL = os.environ.get("SILAS_MODEL", "gpt-4o-mini")
DEFAULT_BASE_URL = os.environ.get("SILAS_BASE_URL", "http://localhost:8000/v1")


@dataclass
class _VotePacket:
    """Normalised persona response used by the OpenAI-backed runner."""

    persona: str
    balanced_ternary: str
    confidence: float
    verdict: str
    justification: str
    evidence: Optional[str] = None
    confidence_notes: Optional[str] = None

    @classmethod
    def from_raw(cls, persona: str, payload: Any, error: Optional[str] = None) -> "_VotePacket":
        """Create a packet from a raw JSON payload or failure message."""

        if isinstance(payload, str):
            try:
                data = json.loads(payload)
            except json.JSONDecodeError:
                data = {}
        elif isinstance(payload, dict):
            data = dict(payload)
        else:
            data = {}

        persona_value = str(data.get("persona") or persona.title())
        bt_raw = str(data.get("balanced_ternary") or "0").strip().lower()
        bt = _normalise_balanced_ternary(bt_raw)

        confidence = _coerce_confidence(data.get("confidence"))
        verdict = str(data.get("verdict") or ("undetermined" if error else "")) or "undetermined"
        justification = str(data.get("justification") or (error or "")) or ""

        evidence = data.get("evidence")
        if evidence is not None:
            evidence = str(evidence)

        confidence_notes = data.get("confidence_notes")
        if confidence_notes is not None:
            confidence_notes = str(confidence_notes)

        if error and not justification:
            justification = error

        return cls(
            persona=persona_value,
            balanced_ternary=bt,
            confidence=confidence,
            verdict=verdict,
            justification=justification,
            evidence=evidence,
            confidence_notes=confidence_notes,
        )

    def to_dict(self) -> Dict[str, Any]:
        """Serialise the packet to a dictionary."""

        payload: Dict[str, Any] = {
            "persona": self.persona,
            "balanced_ternary": self.balanced_ternary,
            "confidence": self.confidence,
            "verdict": self.verdict,
            "justification": self.justification,
        }
        if self.evidence is not None:
            payload["evidence"] = self.evidence
        if self.confidence_notes is not None:
            payload["confidence_notes"] = self.confidence_notes
        return payload


def _normalise_balanced_ternary(value: str) -> str:
    mapping = {
        "+": "+",
        "plus": "+",
        "positive": "+",
        "1": "+",
        "-": "-",
        "minus": "-",
        "negative": "-",
        "-1": "-",
        "0": "0",
        "zero": "0",
        "neutral": "0",
        "": "0",
    }
    return mapping.get(value.strip().lower(), "0")


def _coerce_confidence(value: Any) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        number = 0.0
    return max(0.0, min(1.0, number))


def _score_value(packet: _VotePacket) -> float:
    return BALANCED_TERNARY_VALUES.get(packet.balanced_ternary, 0) * packet.confidence


def score_packets(packets: Iterable[Dict[str, Any]]) -> Dict[str, Any]:
    """Evaluate persona packets and compute the winner and consensus value."""

    packet_objs = [
        _VotePacket(
            persona=str(pkt.get("persona")),
            balanced_ternary=_normalise_balanced_ternary(str(pkt.get("balanced_ternary", "0"))),
            confidence=_coerce_confidence(pkt.get("confidence")),
            verdict=str(pkt.get("verdict", "")) or "undetermined",
            justification=str(pkt.get("justification", "")),
            evidence=str(pkt.get("evidence")) if pkt.get("evidence") is not None else None,
            confidence_notes=str(pkt.get("confidence_notes")) if pkt.get("confidence_notes") is not None else None,
        )
        for pkt in packets
    ]

    if not packet_objs:
        return {"winner": None, "consensus_r": 0.0}

    winner_packet = max(
        packet_objs,
        key=lambda pkt: (abs(_score_value(pkt)), _score_value(pkt), pkt.confidence, pkt.persona),
    )

    bt_vectors = [complex(BALANCED_TERNARY_VALUES.get(pkt.balanced_ternary, 0), 0.0) for pkt in packet_objs]
    mean_vector = sum(bt_vectors, 0j) / len(bt_vectors)
    consensus_r = float(abs(mean_vector))

    return {"winner": winner_packet.persona, "consensus_r": consensus_r}


def _invoke_persona(client: OpenAI, persona_key: str, prompt: str, model: str) -> _VotePacket:
    system_text = system_prompt(persona_key)
    messages = [
        {"role": "system", "content": system_text},
        {"role": "user", "content": prompt},
    ]
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content if response.choices else ""
        return _VotePacket.from_raw(persona_key, content)
    except Exception as exc:  # pragma: no cover - network failure path
        return _VotePacket.from_raw(
            persona_key,
            payload={},
            error=f"persona request failed: {exc}",
        )


def run(prompt: str, base_url: Optional[str] = None, model: Optional[str] = None) -> Dict[str, Any]:
    """Execute an Encompass vote across all personas.

    Parameters
    ----------
    prompt:
        The user prompt to evaluate.
    base_url:
        Optional override for the OpenAI-compatible endpoint.
    model:
        Optional model identifier. Defaults to ``SILAS_MODEL`` env or ``gpt-4o-mini``.

    Returns
    -------
    dict
        A dictionary with keys ``winner``, ``consensus_r``, and ``packets``.
    """

    try:
        from openai import OpenAI  # type: ignore import-not-found
    except ImportError as exc:  # pragma: no cover - optional dependency
        raise RuntimeError("OpenAI client is required to call run()") from exc

    if base_url is None:
        base_url = DEFAULT_BASE_URL
    if model is None:
        model = DEFAULT_MODEL

    client = OpenAI(base_url=base_url)

    packets: List[_VotePacket] = []
    for persona_key in PERSONAS:
        packet = _invoke_persona(client, persona_key, prompt, model)
        packets.append(packet)

    result = score_packets([packet.to_dict() for packet in packets])
    return {
        "winner": result["winner"],
        "consensus_r": result["consensus_r"],
        "packets": [packet.to_dict() for packet in packets],
    }


__all__ = ["ConsensusScore", "LucidiaEncompass", "WeightedConsensusScorer", "score_packets", "run"]


@dataclass
class ConsensusScore:
    """Aggregated scoring information for a persona packet."""

    raw: float
    rationale: str

    @property
    def normalised(self) -> float:
        return max(0.0, min(1.0, self.raw))


class WeightedConsensusScorer:
    """Score packets based on coverage, depth, and persona confidence."""

    def __init__(self, coverage_weight: float = 0.4, depth_weight: float = 0.4, confidence_weight: float = 0.2) -> None:
        total = coverage_weight + depth_weight + confidence_weight
        if total <= 0:
            raise ValueError("weights must sum to a positive value")
        self.coverage_weight = coverage_weight / total
        self.depth_weight = depth_weight / total
        self.confidence_weight = confidence_weight / total

    def score_packets(self, packets: Sequence[PersonaResponsePacket], prompt: str) -> List[ConsensusScore]:
        """Apply heuristic scoring to persona packets."""

        scores: List[ConsensusScore] = []
        for packet in packets:
            coverage = min(1.0, len(packet.tokens) / max(1, len(prompt.split())))
            depth = min(1.0, len(packet.response) / 512)
            score = (
                self.coverage_weight * coverage
                + self.depth_weight * depth
                + self.confidence_weight * packet.confidence
            )
            scores.append(ConsensusScore(raw=score, rationale=packet.summary))
            packet.score = score
        return scores


class LucidiaEncompass:
    """Local orchestrator that aggregates persona outputs without API calls."""

    def __init__(
        self,
        personas: Sequence[Persona] | None = None,
        scorer: WeightedConsensusScorer | None = None,
    ) -> None:
        self.personas: List[Persona] = list(personas or load_default_personas())
        self.scorer = scorer or WeightedConsensusScorer()

    def run(self, prompt: str) -> dict:
        if not prompt:
            raise ValueError("prompt must not be empty")

        packets = self._collect_packets(prompt)
        self.scorer.score_packets(packets, prompt)
        packets.sort(key=lambda p: p.score, reverse=True)

        consensus = self._compute_consensus(packets)
        winner = packets[0].persona if packets else None

        return {
            "prompt": prompt,
            "winner": winner,
            "consensus": round(consensus, 4) if packets else 0.0,
            "packets": [packet.as_dict() for packet in packets],
            "generated_at": dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
        }

    def _collect_packets(self, prompt: str) -> List[PersonaResponsePacket]:
        packets: List[PersonaResponsePacket] = []
        for persona in self.personas:
            try:
                packets.append(persona.generate_packet(prompt))
            except PersonaNetworkError as exc:
                packets.append(
                    PersonaResponsePacket(
                        persona=persona.name,
                        summary="Persona unavailable",
                        response="",
                        confidence=0.0,
                        tokens=[],
                        score=0.0,
                        metadata={"voice": persona.voice, "focus": list(persona.focus)},
                        error=str(exc),
                    )
                )
            except PersonaError as exc:
                packets.append(
                    PersonaResponsePacket(
                        persona=persona.name,
                        summary="Persona failed",
                        response="",
                        confidence=0.0,
                        tokens=[],
                        score=0.0,
                        metadata={"voice": persona.voice, "focus": list(persona.focus)},
                        error=str(exc),
                    )
                )
        return packets

    def _compute_consensus(self, packets: Sequence[PersonaResponsePacket]) -> float:
        if not packets:
            return 0.0
        total = sum(packet.score for packet in packets)
        mean = total / len(packets)
        spread = math.sqrt(sum((packet.score - mean) ** 2 for packet in packets) / len(packets))
        variance_penalty = min(0.25, spread)
        return max(0.0, mean - variance_penalty)
