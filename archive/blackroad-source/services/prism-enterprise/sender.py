"""Gateway sender utilities."""

from __future__ import annotations

import base64
import json
import logging
import time
from typing import Any, Dict, Iterable

import cv2
import requests

from .config import EdgeAgentConfig
from .vitals import Vitals

LOGGER = logging.getLogger(__name__)


class GatewaySender:
    """Send vitals and trust payloads to the Island Gateway."""

    def __init__(self, config: EdgeAgentConfig) -> None:
        self._config = config

    def _encode_frame(self, frame) -> str:
        success, buffer = cv2.imencode(".jpg", frame)
        if not success:
            raise RuntimeError("Failed to encode frame for transmission")
        return base64.b64encode(buffer.tobytes()).decode("ascii")

    def build_payload(
        self,
        vitals: Vitals,
        trust: float,
        timestamp: float,
        frame,
    ) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "agent_id": self._config.agent_id,
            "timestamp": timestamp,
            "vitals": vitals.as_dict(),
            "trust": trust,
        }
        tags: Iterable[str] = self._config.as_tags()
        if tags:
            payload["tags"] = list(tags)
        if self._config.send_frame:
            payload["frame_jpeg_base64"] = self._encode_frame(frame)
        return payload

    def send(self, payload: Dict[str, Any]) -> bool:
        try:
            response = requests.post(
                f"{self._config.gateway_url.rstrip('/')}/agents/{self._config.agent_id}/vitals",
                data=json.dumps(payload),
                headers={"Content-Type": "application/json"},
                timeout=10,
            )
            response.raise_for_status()
            LOGGER.info("Payload delivered successfully status=%s", response.status_code)
            return True
        except requests.RequestException as exc:
            LOGGER.exception("Failed to send payload: %s", exc)
            return False

    def heartbeat(self) -> Dict[str, Any]:
        return {
            "agent_id": self._config.agent_id,
            "timestamp": time.time(),
            "status": "alive",
        }
