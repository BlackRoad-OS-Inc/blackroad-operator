"""Lineage tracking utilities."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List


@dataclass(slots=True)
class LineageRecord:
    timestamp: datetime
    event: str
    details: Dict[str, Any]


@dataclass(slots=True)
class LineageLedger:
    records: List[LineageRecord] = field(default_factory=list)

    def log(self, event: str, **details: Any) -> None:
        self.records.append(LineageRecord(timestamp=datetime.utcnow(), event=event, details=details))

    def as_json(self) -> list[dict[str, Any]]:
        return [
            {"timestamp": record.timestamp.isoformat(), "event": record.event, "details": record.details}
            for record in self.records
        ]


__all__ = ["LineageLedger", "LineageRecord"]
