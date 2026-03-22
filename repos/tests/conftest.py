"""Shared pytest fixtures."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import TYPE_CHECKING, Callable, Sequence
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Ensure runtime compatibility patches (notably the httpx TestClient shim)
# are installed before any of the FastAPI-based tests import TestClient.
import sitecustomize  # noqa: F401  # pylint: disable=unused-import

import pytest

if TYPE_CHECKING:  # pragma: no cover - import-time typing only
    from bots import build_registry as BuildRegistryFunc
    from orchestrator import (
        ConsentRegistry,
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


def _load_orchestrator_modules():
    try:
        from bots import build_registry  # type: ignore
        from orchestrator import (  # type: ignore
            ConsentRegistry,
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
    except Exception as exc:  # pragma: no cover - infrastructure guard
        pytest.skip(f"orchestrator stack unavailable: {exc}")
    return (
        build_registry,
        ConsentRegistry,
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


@pytest.fixture()
def consent_registry(tmp_path: Path, monkeypatch) -> "ConsentRegistry":
    modules = _load_orchestrator_modules()
    ConsentRegistry = modules[1]
    log_path = tmp_path / "consent.jsonl"
    monkeypatch.setenv("PRISM_CONSENT_LOG", str(log_path))
    ConsentRegistry.reset_default()
    registry = ConsentRegistry.get_default()
    yield registry
    ConsentRegistry.reset_default()


@pytest.fixture()
def grant_full_consent(consent_registry) -> Callable[[str, str, Sequence[str] | str | None], None]:
    def _grant(owner: str, bot_name: str, scope: Sequence[str] | str | None = "*") -> None:
        for consent_type in ("task_assignment", "data_access", "collaboration"):
            request_id = consent_registry.request_consent(
                from_agent=owner,
                to_agent=bot_name,
                consent_type=consent_type,
                purpose=f"automated {consent_type}",
                duration="8h",
                scope=scope,
            )
            consent_registry.grant_consent(request_id)

    return _grant


@pytest.fixture()
def task_repository(tmp_path: Path) -> TaskRepository:
    _, _, _, _, _, _, _, _, _, _, TaskRepository = _load_orchestrator_modules()
    return TaskRepository(tmp_path / "tasks.json")


@pytest.fixture()
def policy_file(tmp_path: Path) -> Path:
    approvals = tmp_path / "approvals.yaml"
    approvals.write_text(
        """
policies:
  treasury-bot:
    requires_approval: true
    approvers: [cfo]
  close-bot:
    requires_approval: false
  s&op-bot:
    requires_approval: false
"""
    )
    return approvals


@pytest.fixture()
def policy_engine(policy_file: Path) -> PolicyEngine:
    _, _, _, _, PolicyEngine, _, _, _, _, _, _ = _load_orchestrator_modules()
    return PolicyEngine.from_file(policy_file)


@pytest.fixture()
def route_context(tmp_path: Path, policy_engine: PolicyEngine) -> RouteContext:
    _, _, LineageTracker, MemoryLog, _, RouteContext, _, SecRule2042Gate, _, _, _ = _load_orchestrator_modules()
    memory = MemoryLog(tmp_path / "memory.jsonl")
    lineage = LineageTracker(tmp_path / "lineage.jsonl")
    sec_gate = SecRule2042Gate()
    return RouteContext(
        policy_engine=policy_engine,
        memory=memory,
        lineage=lineage,
        approved_by=[],
        sec_gate=sec_gate,
    )


@pytest.fixture()
def router(task_repository: TaskRepository) -> Router:
    build_registry, _, _, _, _, _, Router, _, _, _, _ = _load_orchestrator_modules()
    registry = build_registry()
    return Router(registry=registry, repository=task_repository)


@pytest.fixture()
def treasury_task() -> Task:
    _, _, _, _, _, _, _, _, Task, TaskPriority, _ = _load_orchestrator_modules()
    return Task(
        id="TSK-TEST",
        goal="Build 13-week cash forecast",
        owner="finance.ops",
        priority=TaskPriority.HIGH,
        created_at=datetime.utcnow(),
        tags=("treasury",),
        metadata={"region": "NA"},
    )
