"""Archivist agent persisting lineage."""
from __future__ import annotations

from typing import List

from ..lineage import append
from ..proto import Msg
from .base import Agent


class Archivist(Agent):
    """Store critical messages to the lineage log."""

    name = "archivist"

    def can_handle(self, m: Msg) -> bool:
        return m.recipient == self.name and m.kind in {"result", "critique", "log"}

    def handle(self, m: Msg) -> List[Msg]:
        append({
            "id": m.id,
            "sender": m.sender,
            "recipient": m.recipient,
            "kind": m.kind,
            "op": m.op,
            "args": m.args,
        })
        return []
