"""Configuration helpers for the edge agent."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Iterable, Tuple

from dotenv import load_dotenv


def _parse_bool(value: str | None, default: bool) -> bool:
    if value is None:
        return default
    value = value.strip().lower()
    if value in {"1", "true", "yes", "on"}:
        return True
    if value in {"0", "false", "no", "off"}:
        return False
    return default


def _parse_float(value: str | None, default: float) -> float:
    if value is None:
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _parse_int(value: str | None, default: int) -> int:
    if value is None:
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _parse_tags(value: str | None) -> Tuple[str, ...]:
    if not value:
        return tuple()
    return tuple(tag.strip() for tag in value.split(",") if tag.strip())


@dataclass
class VitalWeights:
    """Weighting for vitals when computing overall trust."""

    confidence: float = 0.5
    transparency: float = 0.3
    stability: float = 0.2

    def normalise(self) -> "VitalWeights":
        total = self.confidence + self.transparency + self.stability
        if total <= 0:
            return self
        return VitalWeights(
            confidence=self.confidence / total,
            transparency=self.transparency / total,
            stability=self.stability / total,
        )


@dataclass
class EdgeAgentConfig:
    """Runtime configuration for the edge agent."""

    gateway_url: str
    agent_id: str
    camera_index: int = 0
    frame_width: int | None = None
    frame_height: int | None = None
    emit_threshold: float = 0.55
    emit_interval_seconds: float = 2.0
    send_frame: bool = True
    session_tags: Tuple[str, ...] = field(default_factory=tuple)
    vital_weights: VitalWeights = field(default_factory=VitalWeights)

    @classmethod
    def from_env(cls, env_file: str | None = None) -> "EdgeAgentConfig":
        """Create a configuration object from environment variables."""

        if env_file:
            load_dotenv(env_file)
        else:
            load_dotenv()

        gateway_url = os.getenv("GATEWAY_URL")
        agent_id = os.getenv("AGENT_ID")
        if not gateway_url:
            raise ValueError("GATEWAY_URL environment variable is required")
        if not agent_id:
            raise ValueError("AGENT_ID environment variable is required")

        camera_index = _parse_int(os.getenv("CAMERA_INDEX"), 0)
        frame_width = _parse_int(os.getenv("FRAME_WIDTH"), None) if os.getenv("FRAME_WIDTH") else None
        frame_height = _parse_int(os.getenv("FRAME_HEIGHT"), None) if os.getenv("FRAME_HEIGHT") else None
        emit_threshold = max(0.0, min(1.0, _parse_float(os.getenv("EMIT_THRESHOLD"), 0.55)))
        emit_interval_seconds = max(0.1, _parse_float(os.getenv("EMIT_INTERVAL_SECONDS"), 2.0))
        send_frame = _parse_bool(os.getenv("SEND_FRAME"), True)
        session_tags = _parse_tags(os.getenv("AGENT_TAGS"))

        weights = VitalWeights(
            confidence=_parse_float(os.getenv("WEIGHT_CONFIDENCE"), 0.5),
            transparency=_parse_float(os.getenv("WEIGHT_TRANSPARENCY"), 0.3),
            stability=_parse_float(os.getenv("WEIGHT_STABILITY"), 0.2),
        ).normalise()

        return cls(
            gateway_url=gateway_url,
            agent_id=agent_id,
            camera_index=camera_index,
            frame_width=frame_width,
            frame_height=frame_height,
            emit_threshold=emit_threshold,
            emit_interval_seconds=emit_interval_seconds,
            send_frame=send_frame,
            session_tags=session_tags,
            vital_weights=weights,
        )

    def as_tags(self) -> Iterable[str]:
        if not self.session_tags:
            return ()
        return self.session_tags
