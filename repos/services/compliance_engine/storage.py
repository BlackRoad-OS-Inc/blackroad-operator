"""Persistence helpers for compliance events."""

from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, List

from .policy import AccountOpeningRequest


@dataclass
class ComplianceRecord:
    """Structured view of a compliance decision stored in SQLite."""

    record_id: int
    client_id: str
    representative_id: str
    product_type: str
    status: str
    violations: List[str]
    payload: AccountOpeningRequest
    created_at: datetime

    def as_dict(self) -> dict:
        """Convert the record into a JSON-serialisable dictionary."""

        return {
            "record_id": self.record_id,
            "client_id": self.client_id,
            "representative_id": self.representative_id,
            "product_type": self.product_type,
            "status": self.status,
            "violations": self.violations,
            "created_at": self.created_at.isoformat(),
        }


class ComplianceStore:
    """Very small SQLite-backed persistence layer."""

    def __init__(self, db_path: Path) -> None:
        self._db_path = Path(db_path)
        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialise()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self._db_path)

    def _initialise(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS compliance_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    client_id TEXT NOT NULL,
                    representative_id TEXT NOT NULL,
                    product_type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    violations TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.commit()

    def record_event(
        self,
        payload: AccountOpeningRequest,
        status: str,
        violations: List[str],
    ) -> ComplianceRecord:
        """Persist the compliance decision and return the stored record."""

        created_at = datetime.now(tz=timezone.utc)
        serialised_payload = payload.model_dump_json()
        violations_json = json.dumps(violations)

        with self._connect() as conn:
            cursor = conn.execute(
                """
                INSERT INTO compliance_events (
                    client_id,
                    representative_id,
                    product_type,
                    status,
                    violations,
                    payload,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    payload.client_id,
                    payload.representative_id,
                    payload.product_type,
                    status,
                    violations_json,
                    serialised_payload,
                    created_at.isoformat(),
                ),
            )
            conn.commit()
            record_id = cursor.lastrowid

        return ComplianceRecord(
            record_id=record_id,
            client_id=payload.client_id,
            representative_id=payload.representative_id,
            product_type=payload.product_type,
            status=status,
            violations=violations,
            payload=payload,
            created_at=created_at,
        )

    def list_events(self, client_id: str) -> Iterable[ComplianceRecord]:
        """Return all compliance events for a given client."""

        with self._connect() as conn:
            cursor = conn.execute(
                """
                SELECT
                    id,
                    client_id,
                    representative_id,
                    product_type,
                    status,
                    violations,
                    payload,
                    created_at
                FROM compliance_events
                WHERE client_id = ?
                ORDER BY created_at ASC
                """,
                (client_id,),
            )
            rows = cursor.fetchall()

        records: List[ComplianceRecord] = []
        for row in rows:
            (record_id, c_id, rep_id, product_type, status, violations_json, payload_json, created_at) = row
            payload = AccountOpeningRequest.model_validate_json(payload_json)
            record = ComplianceRecord(
                record_id=record_id,
                client_id=c_id,
                representative_id=rep_id,
                product_type=product_type,
                status=status,
                violations=json.loads(violations_json),
                payload=payload,
                created_at=datetime.fromisoformat(created_at),
            )
            records.append(record)
        return records
