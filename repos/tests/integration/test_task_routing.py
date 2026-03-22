"""Integration tests for task routing."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path

import pytest

from bots import build_registry
from orchestrator import (
    LineageTracker,
    MemoryLog,
    PolicyEngine,
    RouteContext,
    Router,
    SecRule2042Gate,
    Task,
    TaskPriority,
    TaskRepository,
)
from orchestrator.consent import ConsentGrant, ConsentRegistry, ConsentRequest, ConsentType
from orchestrator.exceptions import ConsentViolationError


def _write_policy(path: Path) -> None:
    path.write_text(
        """
policies:
  treasury-bot:
    requires_approval: true
    approvers: [cfo]
"""
    )


def test_route_records_memory_and_lineage(
    tmp_path: Path, grant_full_consent
) -> None:
    task = Task(
        id="TSK-INTEG",
        goal="Build 13-week cash forecast",
        owner="finance",
        priority=TaskPriority.HIGH,
        created_at=datetime.utcnow(),
    )
    repository = TaskRepository(tmp_path / "tasks.json")
    repository.add(task)
    router = Router(build_registry(), repository)
    approvals = tmp_path / "approvals.yaml"
    _write_policy(approvals)
    context = RouteContext(
        policy_engine=PolicyEngine.from_file(approvals),
        memory=MemoryLog(tmp_path / "memory.jsonl"),
        lineage=LineageTracker(tmp_path / "lineage.jsonl"),
        approved_by=["cfo"],
        sec_gate=SecRule2042Gate(),
    )
    grant_full_consent(task.owner, "Treasury-BOT")
    response = router.route(task.id, "Treasury-BOT", context)
    assert response.ok
    tail = context.memory.tail(1)
    assert tail and tail[0]["task"]["id"] == task.id
    assert context.lineage.events()


def test_route_requires_consent_when_registry_present(tmp_path: Path) -> None:
    task = Task(
        id="TSK-CONSENT",
        goal="Reconcile cash flow",
        owner="finance",
        priority=TaskPriority.MEDIUM,
        created_at=datetime.utcnow(),
    )
    repository = TaskRepository(tmp_path / "tasks.json")
    repository.add(task)
    router = Router(build_registry(), repository)
    approvals = tmp_path / "approvals.yaml"
    _write_policy(approvals)
    consent_registry = ConsentRegistry(tmp_path / "consent.jsonl")
    context = RouteContext(
        policy_engine=PolicyEngine.from_file(approvals),
        memory=MemoryLog(tmp_path / "memory.jsonl"),
        lineage=LineageTracker(tmp_path / "lineage.jsonl"),
        approved_by=["cfo"],
        sec_gate=SecRule2042Gate(),
        consent_registry=consent_registry,
        acting_agent="finance",
    )

    with pytest.raises(ConsentViolationError):
        router.route(task.id, "Treasury-BOT", context)

    request = ConsentRequest(
        from_agent="finance",
        to_agent="Treasury-BOT",
        consent_type=ConsentType.TASK_ASSIGNMENT,
        purpose="Finance requesting treasury support",
        scope=task.id,
    )
    consent_registry.request_consent(request)
    grant = ConsentGrant(
        request_id=request.request_id,
        granted_by="Treasury-BOT",
        granted_to="finance",
        consent_type=ConsentType.TASK_ASSIGNMENT,
        scope=task.id,
    )
    consent_registry.grant_consent(grant)

    response = router.route(task.id, "Treasury-BOT", context)
    assert response.ok
