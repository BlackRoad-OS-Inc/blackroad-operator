"""BlackRoad API — Main FastAPI Application (port 8788)."""

from time import perf_counter
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as v1_router
from app.core.logging import configure_logging
from app.core.settings import settings
from app.workers.sample_task import celery_app
from app.database import init_db


def create_app() -> FastAPI:
    configure_logging()
    init_db(settings.db_path)

    application = FastAPI(
        title="BlackRoad OS API",
        description="REST API for BlackRoad OS — agents, tasks, memory, chat",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )
    application.state.settings = settings
    application.state.celery_app = celery_app
    application.state.start_time = perf_counter()

    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=True,
    )

    application.include_router(v1_router, prefix="/v1")
    return application


app = create_app()
__all__ = ["app"]
