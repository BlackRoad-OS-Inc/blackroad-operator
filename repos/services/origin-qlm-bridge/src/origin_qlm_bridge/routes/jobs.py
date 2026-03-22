from __future__ import annotations

from typing import Optional
from uuid import UUID, uuid4

import structlog
from fastapi import APIRouter, HTTPException, status

from ..config import get_settings
from ..schemas import CompletionRequest, JobStatus, JobSubmission

logger = structlog.get_logger(__name__)
router = APIRouter()


@router.post("/", response_model=JobStatus, status_code=status.HTTP_202_ACCEPTED)
async def enqueue_job(submission: JobSubmission) -> JobStatus:
    settings = get_settings()
    logger.info("qlm_job_enqueued", job=submission.model_dump(), gateway=str(settings.gateway_url))
    job_status = JobStatus(job_id=uuid4(), status="queued")
    return job_status


@router.get("/{job_id}", response_model=JobStatus)
async def get_job(job_id: UUID) -> JobStatus:
    logger.info("qlm_job_lookup", job_id=str(job_id))
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job state persistence not yet implemented")


@router.post("/{job_id}/complete", response_model=JobStatus)
async def complete_job(job_id: UUID, completion: CompletionRequest) -> JobStatus:
    logger.info("qlm_job_completed", job_id=str(job_id), status=completion.status.status, has_manifest=completion.manifest is not None)
    return completion.status


@router.post("/{job_id}/heartbeat", response_model=JobStatus)
async def heartbeat(job_id: UUID, status_update: Optional[JobStatus] = None) -> JobStatus:
    logger.info("qlm_job_heartbeat", job_id=str(job_id), status=status_update.status if status_update else "unknown")
    return status_update or JobStatus(job_id=job_id, status="running")
