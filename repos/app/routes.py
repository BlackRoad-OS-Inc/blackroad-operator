"""Shared FastAPI router used by the Lucidia API service."""

from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()


@router.get("/health", summary="API health probe")
def health() -> dict[str, bool]:
    """Return a simple JSON health payload."""

    return {"ok": True}
