"""Base definitions for agents."""
from __future__ import annotations

from dataclasses import dataclass
from ..bus import Bus, Subscriber
from ..proto import Msg


@dataclass
class Agent:
    """Base agent class."""

    name: str
    bus: Bus

    def can_handle(self, message: Msg) -> bool:
        return False

    def handle(self, message: Msg) -> list[Msg]:
        raise NotImplementedError

    def as_subscriber(self) -> Subscriber:
        return Subscriber(self.name, self._dispatch)

    def _dispatch(self, message: Msg) -> list[Msg]:
        if self.can_handle(message):
            return list(self.handle(message))
        return []
