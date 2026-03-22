from __future__ import annotations

from datetime import datetime

from services.quantum_copilot.models import ClientProfile, ReviewRequest
from services.quantum_copilot.rationale import draft_rationale
from services.quantum_copilot.policy_engine import PolicyEngine


def make_request(**overrides):
    profile = ClientProfile(
        client_name="Jordan",
        client_age=55,
        net_worth_band="1m-5m",
        investment_objective="growth",
        risk_tolerance="moderate",
        marketing_material="BlackRoad Advisors may deliver sustainable returns while highlighting risk management.",
        data_sources=["Morningstar 2025 Outlook"],
        advisor_notes="Returning client",
    )
    request = ReviewRequest(
        profile=profile,
        advisor_email="advisor@blackroad.io",
        representative_id="RR-100",
        pqc_enabled=False,
        submitted_at=datetime.utcnow(),
    )
    return request.model_copy(update=overrides)


def test_policy_engine_passes_balanced_submission():
    engine = PolicyEngine()
    request = make_request()
    rationale = draft_rationale(request.profile)
    findings = engine.evaluate(request, rationale_text=rationale.rationale_text)

    assert all(finding.passed for finding in findings)


def test_policy_engine_flags_superlative_and_missing_risk():
    engine = PolicyEngine()
    request = make_request(
        profile=ClientProfile(
            client_name="Skyler",
            client_age=42,
            net_worth_band="250k-1m",
            investment_objective="growth",
            risk_tolerance="moderate",
            marketing_material="Guaranteed double digit returns with zero downside.",
            data_sources=[],
        )
    )

    findings = engine.evaluate(request, rationale_text="This rationale text remains sufficiently long for compliance review requirements.")
    failed_rules = {finding.rule_id for finding in findings if not finding.passed}

    assert "finra_2210_001" in failed_rules
    assert "language_safety_003" in failed_rules
    assert "sec_204_2_001" in failed_rules


def test_policy_engine_detects_risk_objective_mismatch():
    engine = PolicyEngine()
    request = make_request(
        profile=ClientProfile(
            client_name="Devon",
            client_age=30,
            net_worth_band="250k-1m",
            investment_objective="speculation",
            risk_tolerance="conservative",
            marketing_material="BlackRoad Advisors may pursue venture themes while disclosing risk factors.",
            data_sources=["PitchBook Index"],
        )
    )

    findings = engine.evaluate(request, rationale_text="This rationale text remains sufficiently long for audit reviewers to consider complete.")
    assert any(f.rule_id == "finra_2210_005" and not f.passed for f in findings)
