from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from services.quantum_copilot.attest.attest import QuantumSigner, create_manifest, emit_bundle
from services.quantum_copilot.models import BundleResult, ClientProfile, ReviewRequest
from services.quantum_copilot.policy_engine import PolicyEngine
from services.quantum_copilot.rationale import draft_rationale


def build_bundle(tmp_path: Path, pqc_enabled: bool) -> BundleResult:
    profile = ClientProfile(
        client_name="Morgan",
        client_age=44,
        net_worth_band="1m-5m",
        investment_objective="growth",
        risk_tolerance="aggressive",
        marketing_material="BlackRoad Advisors may pursue sector rotation while emphasising risk oversight.",
        data_sources=["Internal Macro Outlook"],
    )
    request = ReviewRequest(
        profile=profile,
        advisor_email="advisor@blackroad.io",
        representative_id="RR-200",
        pqc_enabled=pqc_enabled,
    )
    rationale = draft_rationale(profile)
    engine = PolicyEngine()
    findings = engine.evaluate(request, rationale_text=rationale.rationale_text)
    manifest = create_manifest(
        case_id="QC-TEST",
        request=request,
        findings=findings,
        rationale_hash="deadbeef",
    )
    bundle_dir = tmp_path / "QC-TEST"
    artifact_path = bundle_dir / "artifact.json"
    pdf_path = bundle_dir / "report.pdf"
    bundle = BundleResult(
        case_id="QC-TEST",
        status="approved",
        findings=findings,
        rationale=rationale,
        manifest=manifest,
        artifact_path=artifact_path,
        pdf_path=pdf_path,
        signature=None,
        pqc_enabled=pqc_enabled,
        latency_ms=42,
    )
    signer = QuantumSigner(b"test-secret")
    outputs = emit_bundle("QC-TEST", request, bundle, signer)
    bundle.signature = outputs["signature"]  # type: ignore[assignment]
    return bundle


def test_emit_bundle_generates_artifacts(tmp_path: Path, monkeypatch):
    monkeypatch.setattr("services.quantum_copilot.config.BUNDLE_DIR", tmp_path)
    bundle = build_bundle(tmp_path, pqc_enabled=True)

    artifact_path = bundle.artifact_path
    manifest_path = artifact_path.parent / "manifest.json"

    assert artifact_path.exists()
    assert manifest_path.exists()
    assert bundle.pdf_path.exists()
    assert bundle.signature is not None

    manifest = json.loads(manifest_path.read_text())
    assert manifest["pqc_enabled"] is True
    assert manifest["manifest_id"]


def test_emit_bundle_handles_non_pqc_signature(tmp_path: Path, monkeypatch):
    monkeypatch.setattr("services.quantum_copilot.config.BUNDLE_DIR", tmp_path)
    bundle = build_bundle(tmp_path, pqc_enabled=False)

    assert bundle.signature is None
    assert bundle.artifact_path.exists()
