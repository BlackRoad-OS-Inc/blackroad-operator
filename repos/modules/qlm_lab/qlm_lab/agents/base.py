from __future__ import annotations

from typing import Iterable, List

from ..proto import Msg


class Agent:
    """Base class for simple bus-connected agents."""

    name = "agent"

    def __init__(self, bus):
        self.bus = bus

    def can_handle(self, m: Msg) -> bool:
        return False

    def handle(self, m: Msg) -> List[Msg]:
        return []

    def __call__(self, message: Msg) -> None:
        if self.can_handle(message):
            for response in self.handle(message):
                self.bus.publish(response)

    def emit(self, messages: Iterable[Msg]) -> None:
        for message in messages:
            self.bus.publish(message)
