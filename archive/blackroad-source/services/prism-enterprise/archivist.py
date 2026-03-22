"""Archivist agent responsible for lineage logging."""
from __future__ import annotations

from ..lineage import LineageLogger
from ..proto import Msg
from .base import Agent


class Archivist(Agent):
    def __init__(self, name, bus, lineage: LineageLogger) -> None:
        super().__init__(name, bus)
        self.lineage = lineage

    def can_handle(self, message: Msg) -> bool:
        return True

    def handle(self, message: Msg) -> list[Msg]:
        self.lineage.log_message({
            "id": message.id,
            "sender": message.sender,
            "recipient": message.recipient,
            "kind": message.kind,
            "op": message.op,
            "args": message.args,
        })
        return []
