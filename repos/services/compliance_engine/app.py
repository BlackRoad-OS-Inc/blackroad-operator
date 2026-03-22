"""FastAPI application that exposes compliance evaluation endpoints."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Iterable, List

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field

from .policy import AccountOpeningPolicy, AccountOpeningRequest
from .storage import ComplianceStore

DEFAULT_DB_PATH = Path("data/compliance/events.sqlite")


def create_app(db_path: Path | None = None) -> FastAPI:
    """Create the FastAPI app with a SQLite-backed compliance store."""

    if db_path:
        database_path = Path(db_path)
    else:
        env_path = os.environ.get("PRISM_COMPLIANCE_DB")
        database_path = Path(env_path) if env_path else DEFAULT_DB_PATH
    store = ComplianceStore(database_path)
    policy = AccountOpeningPolicy()

    app = FastAPI(
        title="Prism Console Compliance API",
        version="0.1.0",
        description="Operational compliance checks for onboarding workflows.",
    )

    class AccountOpeningResponse(BaseModel):
        status: str = Field(..., description="Outcome of the compliance evaluation")
        violations: List[str] = Field(default_factory=list, description="Any policy failures encountered")
        record_id: int = Field(..., description="Primary key of the persisted compliance record")
        created_at: str = Field(..., description="UTC ISO-8601 timestamp of when the decision was recorded")

    class ComplianceHistoryResponse(BaseModel):
        client_id: str
        events: List[AccountOpeningResponse]

    def get_store() -> ComplianceStore:
        return store

    def get_policy() -> AccountOpeningPolicy:
        return policy

    @app.post("/v1/compliance/account-opening", response_model=AccountOpeningResponse)
    def evaluate_account_opening(
        payload: AccountOpeningRequest,
        store: ComplianceStore = Depends(get_store),
        policy: AccountOpeningPolicy = Depends(get_policy),
    ) -> AccountOpeningResponse:
        status, violations = policy.evaluate(payload)
        record = store.record_event(payload=payload, status=status, violations=violations)
        return AccountOpeningResponse(**record.as_dict())

    @app.get("/v1/compliance/events/{client_id}", response_model=ComplianceHistoryResponse)
    def get_client_events(
        client_id: str,
        store: ComplianceStore = Depends(get_store),
    ) -> ComplianceHistoryResponse:
        events = [AccountOpeningResponse(**record.as_dict()) for record in store.list_events(client_id)]
        if not events:
            raise HTTPException(status_code=404, detail=f"No compliance history for client '{client_id}'.")
        return ComplianceHistoryResponse(client_id=client_id, events=events)

    @app.get("/v1/compliance/disclosures", response_model=List[str])
    def list_required_disclosures(policy: AccountOpeningPolicy = Depends(get_policy)) -> Iterable[str]:
        return list(policy.required_disclosures())

    return app
