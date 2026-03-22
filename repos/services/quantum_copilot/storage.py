"""Persistence helpers for the compliance copilot demo."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import List

from . import config
from .metrics import compute_metrics
from .models import BundleResult, ConsoleCaseSummary, ConsoleDataset, LeadRequest, ReviewRequest


def _append_json_line(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(payload) + "\n")


def _load_json_lines(path: Path) -> List[dict]:
    if not path.exists():
        return []
    records = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            records.append(json.loads(line))
    return records


class ComplianceRepository:
    """Stores lead submissions and review history in JSONL files."""

    def __init__(self) -> None:
        self.lead_path = config.LEAD_PATH
        self.review_path = config.REVIEW_PATH

    def record_lead(self, lead: LeadRequest) -> None:
        payload = lead.model_dump()
        payload["submitted_at"] = datetime.utcnow().isoformat()
        _append_json_line(self.lead_path, payload)

    def record_review(
        self,
        request: ReviewRequest,
        bundle: BundleResult,
        *,
        artifact_hash: str,
        signature: str | None,
    ) -> None:
        failures = [finding.rule_id for finding in bundle.findings if not finding.passed]
        payload = {
            "case_id": bundle.case_id,
            "status": bundle.status,
            "created_at": datetime.utcnow().isoformat(),
            "pqc_enabled": bundle.pqc_enabled,
            "advisor_email": request.advisor_email,
            "representative_id": request.representative_id,
            "policy_version": request.policy_version,
            "artifact_hash": artifact_hash,
            "signature": signature,
            "latency_ms": bundle.latency_ms,
            "rule_failures": failures,
        }
        _append_json_line(self.review_path, payload)

    def load_console_dataset(self) -> ConsoleDataset:
        review_records = _load_json_lines(self.review_path)
        cases: List[ConsoleCaseSummary] = []
        for record in review_records:
            cases.append(
                ConsoleCaseSummary(
                    case_id=record["case_id"],
                    status=record["status"],
                    created_at=datetime.fromisoformat(record["created_at"]),
                    pqc_enabled=record["pqc_enabled"],
                    advisor_email=record["advisor_email"],
                    representative_id=record["representative_id"],
                    rule_failures=record["rule_failures"],
                )
            )

        metrics = compute_metrics(review_records)

        return ConsoleDataset(cases=cases, metrics=metrics)

    def load_funnel_counts(self) -> dict[str, int]:
        metrics_path = config.METRICS_PATH
        if not metrics_path.exists():
            return {"visits": 0, "sandbox": 0, "bundles": 0, "signups": 0}
        return json.loads(metrics_path.read_text(encoding="utf-8"))

    def update_funnel(self, *, visit: bool = False, sandbox: bool = False, bundle: bool = False, signup: bool = False) -> None:
        counts = self.load_funnel_counts()
        if visit:
            counts["visits"] = counts.get("visits", 0) + 1
        if sandbox:
            counts["sandbox"] = counts.get("sandbox", 0) + 1
        if bundle:
            counts["bundles"] = counts.get("bundles", 0) + 1
        if signup:
            counts["signups"] = counts.get("signups", 0) + 1
        config.METRICS_PATH.write_text(json.dumps(counts, indent=2), encoding="utf-8")


__all__ = ["ComplianceRepository"]
