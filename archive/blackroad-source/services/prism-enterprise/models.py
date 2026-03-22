"""Pydantic models shared across the compliance copilot service."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Literal, Optional

from pydantic import BaseModel, Field

from . import config


class LeadRequest(BaseModel):
    """Lead capture form submission."""

    email: str = Field(..., description="Advisor email address")
    role: str = Field(..., description="Role or title")
    organization: str = Field(..., description="Organization name")
    team_size: Literal["1-5", "6-20", "21-100", "100+"] = Field(
        ..., description="Size bucket for the supervising team"
    )
    timeline: Literal["immediate", "this-quarter", "this-year"] = Field(
        ..., description="Buying timeline gauge"
    )


class ClientProfile(BaseModel):
    """Minimal client and marketing payload submitted for review."""

    client_name: str = Field(..., description="Client name used for the review")
    client_age: int = Field(..., ge=18, le=120, description="Client age")
    net_worth_band: Literal["<250k", "250k-1m", "1m-5m", ">5m"] = Field(
        ..., description="Approximate net worth bucket"
    )
    investment_objective: Literal[
        "income",
        "growth",
        "capital-preservation",
        "speculation",
    ] = Field(..., description="Client's primary stated objective")
    risk_tolerance: Literal["conservative", "moderate", "aggressive"] = Field(
        ..., description="Risk tolerance categorisation"
    )
    marketing_material: str = Field(..., description="Marketing or suitability notes")
    data_sources: List[str] = Field(
        default_factory=list,
        description="Sources cited for any statistics included in the draft",
    )
    advisor_notes: Optional[str] = Field(
        default=None, description="Free-form notes captured by the representative"
    )


class ReviewRequest(BaseModel):
    """JSON API payload to trigger a compliance review."""

    profile: ClientProfile
    advisor_email: str
    representative_id: str
    pqc_enabled: bool = Field(False, description="When true generate PQC signature")
    policy_version: str = Field(config.POLICY_VERSION, description="Policy pack version")
    mode: Literal["suitability", "marketing"] = Field(
        "suitability", description="Review context"
    )
    attachments: Optional[List[str]] = Field(
        default=None, description="Optional uploaded filenames"
    )
    submitted_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp captured when the review entered the system",
    )


class PolicyFinding(BaseModel):
    """Represents the outcome of a single policy rule evaluation."""

    rule_id: str
    package: Literal["finra_2210", "sec_204_2", "language_safety"]
    title: str
    passed: bool
    severity: Literal["info", "warning", "critical"]
    rationale: str
    citation: Optional[str] = None


class RationaleBundle(BaseModel):
    """Drafted rationale and remediation guidance."""

    rationale_text: str
    remediation_text: Optional[str] = None
    sources: List[str] = Field(default_factory=list)


class AuditManifest(BaseModel):
    """Structured manifest emitted for evidence bundles."""

    manifest_id: str
    created_at: datetime
    policy_version: str
    service_version: str
    pqc_enabled: bool
    hash_value: str
    input_fingerprint: str
    prompt_hash: str
    rule_results: List[PolicyFinding]
    metadata: Dict[str, str]


class BundleResult(BaseModel):
    """Artifacts returned after a review is evaluated."""

    case_id: str
    status: Literal["approved", "needs-remediation"]
    findings: List[PolicyFinding]
    rationale: RationaleBundle
    manifest: AuditManifest
    artifact_path: Path
    pdf_path: Path
    signature: Optional[str] = None
    pqc_enabled: bool
    latency_ms: int


class MetricsSnapshot(BaseModel):
    """Aggregated metrics exposed through the observability dashboard."""

    generated_at: datetime
    total_reviews: int
    approval_rate: float
    pqc_usage_rate: float
    average_latency_ms: float
    rule_pass_rate: Dict[str, float]
    autofix_success_rate: float
    top_failure_causes: List[str]
    funnel: Dict[str, int]


class ConsoleCaseSummary(BaseModel):
    """Summary row for the console dashboard."""

    case_id: str
    status: str
    created_at: datetime
    pqc_enabled: bool
    advisor_email: str
    representative_id: str
    rule_failures: List[str]


class ConsoleDataset(BaseModel):
    """Dataset rendered by the console UI."""

    cases: List[ConsoleCaseSummary]
    metrics: MetricsSnapshot


class DemoCase(BaseModel):
    """Represents a pre-generated demo case for scripted walkthroughs."""

    case_id: str
    title: str
    description: str
    payload: ReviewRequest
    expected_outcome: Literal["approved", "needs-remediation"]
    highlighted_rules: List[str]
