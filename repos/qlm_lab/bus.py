"""Simple in-memory publish/subscribe message bus for agents."""
from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from typing import Callable, Deque, Dict, Iterable, Optional

from .proto import Msg


@dataclass
class Subscriber:
    """Represents an agent subscribed to the bus."""

    name: str
    handler: Callable[[Msg], Iterable[Msg]]


class Bus:
    """Event bus delivering :class:`~qlm_lab.proto.Msg` objects between agents."""

    def __init__(self) -> None:
        self._subscribers: Dict[str, Subscriber] = {}
        self._queue: Deque[Msg] = deque()

    def subscribe(self, subscriber: Subscriber) -> None:
        """Register a new subscriber on the bus."""

        self._subscribers[subscriber.name] = subscriber

    def publish(self, message: Msg) -> None:
        """Publish a message to the bus."""

        self._queue.append(message)
        archivist = self._subscribers.get("archivist")
        if archivist and message.recipient != "archivist":
            for produced in archivist.handler(message):
                self.publish(produced)

    def deliver_next(self) -> Optional[Msg]:
        """Deliver the next message in the queue.

        Returns the last message produced by the handler, if any.
        """

        if not self._queue:
            return None
        message = self._queue.popleft()
        recipient = self._subscribers.get(message.recipient)
        if recipient is None:
            raise KeyError(f"No subscriber named {message.recipient}")
        result: Optional[Msg] = None
        for produced in recipient.handler(message):
            result = produced
            self.publish(produced)
        return result

    def run(self) -> None:
        """Drain the queue."""

        while self._queue:
            self.deliver_next()
