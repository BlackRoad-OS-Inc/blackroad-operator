from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional
from uuid import UUID

from pydantic import AnyUrl, BaseModel, Field


class JobSubmission(BaseModel):
    session_id: UUID
    pedestal_id: str
    queue_name: str
    seed: Optional[str] = None
    payload: dict[str, Any] = Field(default_factory=dict)


class JobStatus(BaseModel):
    job_id: UUID
    status: Literal["queued", "running", "succeeded", "failed"]
    detail: Optional[str] = None


class ArtifactManifest(BaseModel):
    artifact_id: UUID
    artifact_uri: AnyUrl
    preview_uri: Optional[AnyUrl] = None
    lineage_hash: str
    minted_by: str
    minted_at: datetime
    metadata: dict[str, Any] = Field(default_factory=dict)


class CompletionRequest(BaseModel):
    status: JobStatus
    manifest: Optional[ArtifactManifest] = None
