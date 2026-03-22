"""Policy engine tests."""

from __future__ import annotations

import pytest

from orchestrator.exceptions import ApprovalRequiredError


def test_policy_requires_approval(policy_engine):
    decision = policy_engine.check("treasury-bot", approved_by=[])
    assert not decision.approved
    assert "required" in decision.message.lower()


def test_policy_enforce(policy_engine):
    with pytest.raises(ApprovalRequiredError):
        policy_engine.enforce("treasury-bot", approved_by=[])
    policy_engine.enforce("treasury-bot", approved_by=["cfo"])
