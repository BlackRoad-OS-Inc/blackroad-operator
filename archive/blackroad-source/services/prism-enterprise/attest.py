"""Evidence bundle generation utilities."""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional

from pydantic import BaseModel

from .. import config
from ..models import AuditManifest, BundleResult, PolicyFinding, ReviewRequest
from ..pdf import render_pdf


@dataclass
class QuantumSigner:
    """Minimal PQC-style signer using SHAKE-256 keyed hashing."""

    secret: bytes

    def sign(self, payload: bytes) -> str:
        digest = hashlib.shake_256(self.secret + payload).hexdigest(64)
        return digest

    def verify(self, payload: bytes, signature: str) -> bool:
        expected = self.sign(payload)
        return expected == signature


DEFAULT_SECRET = hashlib.sha3_256(b"quantum-demo-secret").digest()


def load_signer(secret_path: Optional[Path] = None) -> QuantumSigner:
    if secret_path and secret_path.exists():
        return QuantumSigner(secret_path.read_bytes())
    return QuantumSigner(DEFAULT_SECRET)


class ManifestPayload(BaseModel):
    """Raw manifest JSON structure prior to hashing/signing."""

    manifest_id: str
    created_at: str
    policy_version: str
    service_version: str
    pqc_enabled: bool
    rule_results: List[Dict[str, object]]
    policy_files: List[str]
    input_fingerprint: str
    prompt_hash: str
    metadata: Dict[str, str]


def create_manifest(
    case_id: str,
    request: ReviewRequest,
    findings: Iterable[PolicyFinding],
    *,
    rationale_hash: str,
) -> AuditManifest:
    """Create a manifest describing the review outcome."""

    created_at = datetime.utcnow()
    manifest_id = hashlib.sha256(f"{case_id}-{created_at.isoformat()}".encode("utf-8")).hexdigest()
    rule_payload = [finding.model_dump() for finding in findings]
    fingerprint_input = json.dumps(request.model_dump(mode="json"), sort_keys=True).encode("utf-8")
    input_fingerprint = hashlib.sha256(fingerprint_input).hexdigest()
    prompt_hash = rationale_hash

    manifest = ManifestPayload(
        manifest_id=manifest_id,
        created_at=created_at.isoformat(),
        policy_version=request.policy_version,
        service_version=config.SERVICE_VERSION,
        pqc_enabled=request.pqc_enabled,
        rule_results=rule_payload,
        policy_files=[str(path) for path in config.POLICY_DIR.glob("*.rego")],
        input_fingerprint=input_fingerprint,
        prompt_hash=prompt_hash,
        metadata={
            "advisor_email": request.advisor_email,
            "representative_id": request.representative_id,
        },
    )

    manifest_json = manifest.model_dump(mode="json")
    manifest_bytes = json.dumps(manifest_json, sort_keys=True).encode("utf-8")
    manifest_hash = hashlib.sha256(manifest_bytes).hexdigest()

    return AuditManifest(
        manifest_id=manifest.manifest_id,
        created_at=created_at,
        policy_version=manifest.policy_version,
        service_version=manifest.service_version,
        pqc_enabled=request.pqc_enabled,
        hash_value=manifest_hash,
        input_fingerprint=input_fingerprint,
        prompt_hash=prompt_hash,
        rule_results=list(findings),
        metadata=manifest.metadata,
    )


def emit_bundle(
    case_id: str,
    request: ReviewRequest,
    bundle: BundleResult,
    signer: QuantumSigner,
) -> Dict[str, Path]:
    """Persist artifact JSON, manifest and PDF summary for the review."""

    output_dir = config.BUNDLE_DIR / case_id
    output_dir.mkdir(parents=True, exist_ok=True)

    artifact_path = output_dir / "artifact.json"
    report_path = output_dir / "report.pdf"
    manifest_path = output_dir / "manifest.json"

    artifact_payload = {
        "case_id": case_id,
        "request": request.model_dump(mode="json"),
        "manifest": bundle.manifest.model_dump(mode="json"),
        "findings": [finding.model_dump() for finding in bundle.findings],
        "rationale": bundle.rationale.model_dump(),
    }
    artifact_bytes = json.dumps(artifact_payload, indent=2, sort_keys=True).encode("utf-8")
    artifact_hash = hashlib.sha256(artifact_bytes).hexdigest()
    artifact_path.write_bytes(artifact_bytes)

    manifest_payload = bundle.manifest.model_dump(mode="json")
    manifest_bytes = json.dumps(manifest_payload, indent=2, sort_keys=True).encode("utf-8")
    manifest_path.write_bytes(manifest_bytes)

    if bundle.pqc_enabled:
        signature = signer.sign(manifest_bytes)
    else:
        signature = None

    render_pdf(bundle, report_path)

    return {
        "artifact": artifact_path,
        "manifest": manifest_path,
        "report": report_path,
        "artifact_hash": artifact_hash,
        "signature": signature,
    }
