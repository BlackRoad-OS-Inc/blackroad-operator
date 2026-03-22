"""Application factory for the FastAPI template."""

from __future__ import annotations

import asyncio
import signal
import time
from contextlib import asynccontextmanager
from typing import AsyncIterator

import uvicorn
from fastapi import FastAPI

from .config import Settings, get_settings
from .instrumentation import configure_tracing, instrument_fastapi
from .structured_logging import configure_logging, get_logger
from .metrics import metrics
from .routes import router as health_router

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.start_time = time.monotonic()
    app.state.shutdown_event = asyncio.Event()
    logger.info("startup")
    try:
        yield
    finally:
        logger.info("shutdown")
        metrics.shutdown()
        app.state.shutdown_event.set()


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_level)
    configure_tracing(settings)

    app = FastAPI(title=settings.app_name, lifespan=lifespan)
    app.state.start_time = time.monotonic()
    app.state.shutdown_event = asyncio.Event()
    app.include_router(health_router)

    metrics.instrument(app)
    instrument_fastapi(app)

    return app


def run() -> None:
    settings = get_settings()
    app = create_app(settings)
    config = uvicorn.Config(
        app=app,
        host="0.0.0.0",
        port=4000,
        log_config=None,
        proxy_headers=True,
        workers=1,
    )
    server = uvicorn.Server(config)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, lambda s=sig: asyncio.create_task(server.shutdown()))

    try:
        loop.run_until_complete(server.serve())
    finally:
        loop.run_until_complete(loop.shutdown_asyncgens())
        loop.close()


if __name__ == "__main__":
    run()
