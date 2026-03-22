from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
from typer.testing import CliRunner

from cli.consent_cli import build_cli_app
from orchestrator.consent import ConsentGrant, ConsentRegistry, ConsentRequest, ConsentType
from orchestrator.exceptions import ConsentError


def test_consent_lifecycle(tmp_path: Path) -> None:
    registry = ConsentRegistry(tmp_path / "consent.jsonl")
    request = ConsentRequest(
        from_agent="finance",
        to_agent="Treasury-BOT",
        consent_type=ConsentType.TASK_ASSIGNMENT,
        purpose="route treasury tasks",
        scope="TSK-*",
    )
    request_id = registry.request_consent(request)
    grant = ConsentGrant(
        request_id=request_id,
        granted_by="Treasury-BOT",
        granted_to="finance",
        consent_type=ConsentType.TASK_ASSIGNMENT,
        scope="TSK-*",
        conditions=("respond within 4 hours",),
        expires_at=datetime.utcnow() + timedelta(hours=1),
    )
    registry.grant_consent(grant)
    assert registry.check_consent("finance", ConsentType.TASK_ASSIGNMENT, "Treasury-BOT", "TSK-123")
    registry.revoke_consent(grant.grant_id, "finance")
    assert not registry.check_consent(
        "finance", ConsentType.TASK_ASSIGNMENT, "Treasury-BOT", "TSK-123"
    )


def test_consent_persistence(tmp_path: Path) -> None:
    path = tmp_path / "consent.jsonl"
    registry = ConsentRegistry(path)
    request = ConsentRequest(
        from_agent="finance",
        to_agent="Treasury-BOT",
        consent_type=ConsentType.DATA_ACCESS,
        purpose="audit", 
        scope="artifacts/treasury/*",
    )
    registry.request_consent(request)
    grant = ConsentGrant(
        request_id=request.request_id,
        granted_by="Treasury-BOT",
        granted_to="finance",
        consent_type=ConsentType.DATA_ACCESS,
        scope="artifacts/treasury/*",
    )
    registry.grant_consent(grant)

    reloaded = ConsentRegistry(path)
    assert reloaded.check_consent(
        "finance", ConsentType.DATA_ACCESS, "Treasury-BOT", "artifacts/treasury/forecast.json"
    )


def test_revoke_requires_participant(tmp_path: Path) -> None:
    registry = ConsentRegistry(tmp_path / "consent.jsonl")
    request = ConsentRequest(
        from_agent="finance",
        to_agent="Treasury-BOT",
        consent_type=ConsentType.TASK_ASSIGNMENT,
        purpose="run treasury bot",
    )
    registry.request_consent(request)
    grant = ConsentGrant(
        request_id=request.request_id,
        granted_by="Treasury-BOT",
        granted_to="finance",
        consent_type=ConsentType.TASK_ASSIGNMENT,
        scope="TSK-001",
    )
    registry.grant_consent(grant)
    with pytest.raises(PermissionError):
        registry.revoke_consent(grant.grant_id, "random-agent")


def test_consent_request_natural_language() -> None:
    request = ConsentRequest(
        request_id="req-demo",
        from_agent="Alpha",
        to_agent="Beta",
        consent_type="data_access",
        purpose="share metrics",
        duration="2h",
        scope=("task:DEMO",),
    )
    summary = request.to_natural_language()
    assert "Alpha" in summary and "Beta" in summary
    assert "2h" in summary


def test_consent_request_signature_is_stable() -> None:
    timestamp = datetime.now(timezone.utc)
    request_one = ConsentRequest(
        request_id="req-stable",
        from_agent="Alpha",
        to_agent="Beta",
        consent_type="collaboration",
        purpose="joint planning",
        duration="1d",
        scope=("*",),
        created_at=timestamp,
    )
    request_two = ConsentRequest(
        request_id="req-stable",
        from_agent="Alpha",
        to_agent="Beta",
        consent_type="collaboration",
        purpose="joint planning",
        duration="1d",
        scope=("*",),
        created_at=timestamp,
    )
    assert request_one.signature == request_two.signature


def test_grant_validity_and_expiry(consent_registry: ConsentRegistry) -> None:
    request_id = consent_registry.request_consent(
        from_agent="finance",
        to_agent="Treasury-BOT",
        consent_type="task_assignment",
        purpose="assign cash forecasting",
        duration="1h",
        scope="*",
    )
    grant_id = consent_registry.grant_consent(request_id)
    grant = consent_registry.get_grant(grant_id)
    assert grant.is_valid()
    future = datetime.now(timezone.utc) + timedelta(hours=2)
    assert not grant.is_valid(future)


def test_scope_enforcement(consent_registry: ConsentRegistry) -> None:
    request_id = consent_registry.request_consent(
        from_agent="finance",
        to_agent="Treasury-BOT",
        consent_type="data_access",
        purpose="read treasury data",
        scope=("task:TSK-1",),
    )
    consent_registry.grant_consent(request_id)
    consent_registry.check_consent(
        from_agent="finance",
        to_agent="Treasury-BOT",
        consent_type="data_access",
        scope="task:TSK-1",
    )
    with pytest.raises(ConsentError):
        consent_registry.check_consent(
            from_agent="finance",
            to_agent="Treasury-BOT",
            consent_type="data_access",
            scope="task:TSK-2",
        )


def test_revocation_blocks_future_checks(consent_registry: ConsentRegistry) -> None:
    request_id = consent_registry.request_consent(
        from_agent="finance",
        to_agent="Treasury-BOT",
        consent_type="collaboration",
        purpose="share forecast",
        scope="*",
    )
    grant_id = consent_registry.grant_consent(request_id, revocable=True)
    consent_registry.revoke_consent(grant_id, reason="owner revoked")
    with pytest.raises(ConsentError):
        consent_registry.check_consent(
            from_agent="finance",
            to_agent="Treasury-BOT",
            consent_type="collaboration",
        )


def test_registry_persistence_round_trip(consent_registry: ConsentRegistry) -> None:
    request_id = consent_registry.request_consent(
        from_agent="finance",
        to_agent="Treasury-BOT",
        consent_type="task_assignment",
        purpose="persist",
        duration="30m",
        scope=("*",),
    )
    grant_id = consent_registry.grant_consent(request_id)
    log_path = consent_registry.log_path
    ConsentRegistry.reset_default()
    reloaded = ConsentRegistry(log_path)
    grant = reloaded.get_grant(grant_id)
    assert grant.matches("finance", "Treasury-BOT", "task_assignment")


def test_registry_rejects_tampered_log(tmp_path: Path) -> None:
    log_path = tmp_path / "consent.jsonl"
    registry = ConsentRegistry(log_path)
    request = ConsentRequest(
        from_agent="alpha",
        to_agent="beta",
        consent_type=ConsentType.DATA_ACCESS,
        purpose="tamper check",
        scope="*",
    )
    registry.request_consent(request)
    lines = [line for line in log_path.read_text().splitlines() if line.strip()]
    assert lines
    entry = json.loads(lines[0])
    entry["hash"] = "corrupted"
    log_path.write_text(json.dumps(entry) + "\n")
    with pytest.raises(ConsentError):
        ConsentRegistry(log_path)


def test_audit_filters_by_agent(consent_registry: ConsentRegistry) -> None:
    request_id = consent_registry.request_consent(
        from_agent="finance",
        to_agent="Treasury-BOT",
        consent_type="task_assignment",
        purpose="audit",
        scope="*",
    )
    consent_registry.grant_consent(request_id)
    entries = consent_registry.audit("finance")
    assert entries
    assert all(
        entry["type"] == "request" or entry.get("grant", {}).get("from_agent") == "finance"
        for entry in entries
    )


def test_cli_flow_request_grant_revoke(tmp_path, monkeypatch) -> None:
    log_path = tmp_path / "cli-consent.jsonl"
    monkeypatch.setenv("PRISM_CONSENT_LOG", str(log_path))
    ConsentRegistry.reset_default()
    runner = CliRunner()
    app = build_cli_app()

    request_result = runner.invoke(
        app,
        [
            "consent:request",
            "--from",
            "TreasuryBOT",
            "--to",
            "ComplianceBOT",
            "--type",
            "task_assignment",
            "--purpose",
            "delegate compliance check",
            "--duration",
            "1h",
            "--scope",
            "task:*",
        ],
    )
    assert request_result.exit_code == 0, request_result.output
    lines = [line for line in request_result.output.splitlines() if line.startswith("request_id=")]
    assert lines, request_result.output
    request_id = lines[-1].split("=", 1)[1]

    grant_result = runner.invoke(
        app,
        ["consent:grant", "--request", request_id, "--expires-in", "2h"],
    )
    assert grant_result.exit_code == 0, grant_result.output
    grant_line = [line for line in grant_result.output.splitlines() if line.startswith("grant_id=")][0]
    grant_id = grant_line.split("=", 1)[1]

    revoke_result = runner.invoke(
        app,
        ["consent:revoke", "--grant", grant_id, "--reason", "Completed"],
    )
    assert revoke_result.exit_code == 0, revoke_result.output

    registry = ConsentRegistry.get_default()
    with pytest.raises(ConsentError):
        registry.check_consent(
            from_agent="TreasuryBOT",
            to_agent="ComplianceBOT",
            consent_type="task_assignment",
        )


def test_missing_scope_raises(consent_registry: ConsentRegistry) -> None:
    request_id = consent_registry.request_consent(
        from_agent="finance",
        to_agent="Treasury-BOT",
        consent_type="data_access",
        purpose="limited scope",
        scope=("task:ALLOWED",),
    )
    consent_registry.grant_consent(request_id)
    with pytest.raises(ConsentError):
        consent_registry.check_consent(
            from_agent="finance",
            to_agent="Treasury-BOT",
            consent_type="data_access",
            scope=("task:BLOCKED",),
        )


def test_non_revocable_grant_cannot_be_revoked(consent_registry: ConsentRegistry) -> None:
    request_id = consent_registry.request_consent(
        from_agent="finance",
        to_agent="Treasury-BOT",
        consent_type="collaboration",
        purpose="non revocable",
        scope="*",
    )
    grant_id = consent_registry.grant_consent(request_id, revocable=False)
    with pytest.raises(ConsentError):
        consent_registry.revoke_consent(grant_id)

