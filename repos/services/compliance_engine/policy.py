"""Compliance policy definitions for the Prism Console backend."""

from __future__ import annotations

from datetime import datetime
from typing import Iterable, List

from pydantic import BaseModel, Field


class AccountOpeningRequest(BaseModel):
    """Input payload for an account opening compliance review."""

    client_id: str = Field(..., min_length=1, description="Unique identifier for the client")
    representative_id: str = Field(..., min_length=1, description="Registered rep handling the request")
    product_type: str = Field(..., min_length=1, description="Financial product category")
    submitted_at: datetime = Field(..., description="UTC timestamp for the request submission")
    risk_acknowledged: bool = Field(..., description="Client confirmed they reviewed the risk disclosure")
    forward_looking_acknowledged: bool = Field(
        ..., description="Client confirmed awareness of forward looking statement limitations"
    )
    liability_acknowledged: bool = Field(..., description="Client acknowledged liability language")
    disclosures: List[str] = Field(default_factory=list, description="List of disclosure codes provided")

    def __init__(self, **data):  # type: ignore[override]
        raw_disclosures = data.get("disclosures")
        if raw_disclosures is None:
            data["disclosures"] = []
        else:
            data["disclosures"] = [str(item).strip().lower() for item in raw_disclosures]
        super().__init__(**data)
        object.__setattr__(self, "product_type", self.product_type.lower())


class AccountOpeningPolicy:
    """Evaluate requests against a handful of concrete regulatory checks."""

    REQUIRED_ACKS = {
        "risk_acknowledged": "FINRA Rule 2210 requires explicit customer risk acknowledgement.",
        "forward_looking_acknowledged": "SEC Rule 175 disclosures must be reviewed before account approval.",
        "liability_acknowledged": "Regulation Best Interest requires liability acknowledgement prior to onboarding.",
    }

    DERIVATIVE_DISCLOSURE = "options agreement"

    def evaluate(self, payload: AccountOpeningRequest) -> tuple[str, List[str]]:
        """Return a tuple of (status, violations)."""

        violations: List[str] = []

        for field_name, message in self.REQUIRED_ACKS.items():
            if not getattr(payload, field_name):
                violations.append(message)

        if payload.product_type == "derivative" and self.DERIVATIVE_DISCLOSURE not in payload.disclosures:
            violations.append(
                "Derivative accounts require an executed options agreement under FINRA Rule 2360."
            )

        status = "approved" if not violations else "rejected"
        return status, violations

    def required_disclosures(self) -> Iterable[str]:
        """Expose the compliance disclosures this policy enforces."""

        disclosures = list(self.REQUIRED_ACKS.values())
        disclosures.append(
            "Derivative accounts must include an options agreement disclosure when applicable."
        )
        return disclosures
