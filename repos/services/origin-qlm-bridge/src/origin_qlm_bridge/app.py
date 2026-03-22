from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime

import structlog
from fastapi import FastAPI

from .config import get_settings
from .routes import router as api_router

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info("qlm_bridge_startup", port=settings.bridge_port, gateway=str(settings.gateway_url))
    yield
    logger.info("qlm_bridge_shutdown")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Origin QLM Bridge",
        version="0.1.0",
        lifespan=lifespan
    )
    app.state.settings = settings
    app.include_router(api_router, prefix="/v1")

    @app.get("/healthz")
    async def healthcheck() -> dict[str, str]:
        return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

    return app
