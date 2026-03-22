"""Placeholder utilities for QIR-style metadata."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict


@dataclass(slots=True)
class QIRMetadata:
    """Simple container capturing metadata for circuit exports."""

    created_at: datetime = field(default_factory=datetime.utcnow)
    provenance: Dict[str, Any] = field(default_factory=dict)

    def with_entry(self, key: str, value: Any) -> "QIRMetadata":
        self.provenance[key] = value
        return self


__all__ = ["QIRMetadata"]
