"""Metrics aggregation for the compliance copilot."""

from __future__ import annotations

import json
from collections import Counter
from datetime import datetime
from statistics import mean
from typing import Iterable

from . import config
from .models import MetricsSnapshot
from .policy_engine import PolicyEngine


def compute_metrics(records: Iterable[dict]) -> MetricsSnapshot:
    records = list(records)
    total = len(records)
    approvals = sum(1 for record in records if record.get("status") == "approved")
    pqc_enabled = sum(1 for record in records if record.get("pqc_enabled"))
    latencies = [record.get("latency_ms", 0) for record in records]

    engine = PolicyEngine()
    rule_ids = [rule.rule_id for rule in engine.rules]
    failure_counter = Counter()
    for record in records:
        for failure in record.get("rule_failures", []):
            failure_counter[failure] += 1

    rule_pass_rate = {}
    for rule_id in rule_ids:
        failures = failure_counter.get(rule_id, 0)
        if total:
            rule_pass_rate[rule_id] = max(0.0, 1.0 - failures / total)
        else:
            rule_pass_rate[rule_id] = 1.0

    top_failures = [rule for rule, _ in failure_counter.most_common(3)]

    if config.METRICS_PATH.exists():
        funnel = json.loads(config.METRICS_PATH.read_text(encoding="utf-8"))
    else:
        funnel = {"visits": 0, "sandbox": 0, "bundles": 0, "signups": 0}

    return MetricsSnapshot(
        generated_at=datetime.utcnow(),
        total_reviews=total,
        approval_rate=(approvals / total) if total else 0.0,
        pqc_usage_rate=(pqc_enabled / total) if total else 0.0,
        average_latency_ms=mean(latencies) if latencies else 0.0,
        rule_pass_rate=rule_pass_rate,
        autofix_success_rate=(approvals / total) if total else 0.0,
        top_failure_causes=top_failures,
        funnel=funnel,
    )


__all__ = ["compute_metrics"]
