"""Simple proof recording utilities."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict

from .storage import ensure_domain, write_json

DOMAIN = "proofs"


@dataclass(slots=True)
class ProofRecord:
    statement: str
    assumption: str
    contradiction: str
    result: str
    created_at: str

    def to_payload(self) -> Dict[str, str]:
        return {
            "statement": self.statement,
            "assumption": self.assumption,
            "contradiction": self.contradiction,
            "result": self.result,
            "created_at": self.created_at,
        }


def _timestamp() -> str:
    return datetime.utcnow().strftime("%Y%m%dT%H%M%S%f")


def _derive_contradiction(statement: str, assumption: str) -> str:
    norm_stmt = statement.strip().lower()
    norm_assumption = assumption.strip().lower()
    if norm_assumption.startswith("not ") and norm_assumption[4:] == norm_stmt:
        return "Direct negation of the statement"
    return f"{assumption.strip()} contradicts {statement.strip()}"


def record_contradiction(statement: str, assumption: str) -> Path:
    if not statement.strip():
        raise ValueError("statement must not be empty")
    if not assumption.strip():
        raise ValueError("assumption must not be empty")

    contradiction = _derive_contradiction(statement, assumption)
    record = ProofRecord(
        statement=statement.strip(),
        assumption=assumption.strip(),
        contradiction=contradiction,
        result="contradiction established",
        created_at=datetime.utcnow().isoformat(),
    )
    output_dir = ensure_domain(DOMAIN)
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / f"proof_{_timestamp()}.json"
    write_json(path, record.to_payload())
    return path


def demo() -> Dict[str, str]:
    path = record_contradiction("P", "not P")
    return {"path": str(path)}
