"""API routes for health, readiness, and metadata."""

from __future__ import annotations

import httpx
from fastapi import APIRouter, Depends, HTTPException

from .config import Settings, get_settings
from .structured_logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


async def check_dependency(url: str) -> tuple[str, bool, str | None]:
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(url)
            response.raise_for_status()
        return (url, True, None)
    except Exception as exc:  # pragma: no cover - network errors collapsed
        return (url, False, str(exc))


@router.get("/health")
async def health(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    """Return a simple health payload including the build SHA."""

    return {"status": "ok", "build_sha": settings.build_sha}


@router.get("/live")
async def liveness() -> dict[str, str]:
    """Return 200 when the process is alive."""

    return {"status": "alive"}


@router.get("/ready")
async def readiness(settings: Settings = Depends(get_settings)) -> dict[str, object]:
    """Run dependency checks and report readiness."""

    results: list[dict[str, object]] = []
    for dependency in settings.readiness_dependencies:
        url, ok, error = await check_dependency(dependency)
        results.append({"url": url, "ok": ok, "error": error})

    failing = [item["url"] for item in results if not item["ok"]]
    if failing:
        logger.warning("readiness_failed", failing=failing)
        raise HTTPException(status_code=503, detail={"dependencies": results})

    return {"status": "ready", "dependencies": results}
