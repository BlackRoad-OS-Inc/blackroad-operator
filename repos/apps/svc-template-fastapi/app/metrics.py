"""Prometheus metrics instrumentation."""

from __future__ import annotations

import time
from typing import Awaitable, Callable

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import PlainTextResponse
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Gauge, Histogram, generate_latest

from .config import Settings, get_settings
from .structured_logging import get_logger

logger = get_logger(__name__)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "Time spent processing request",
    labelnames=("method", "path", "status"),
    buckets=(0.05, 0.1, 0.25, 0.5, 1, 2, 5),
)

ERROR_RATE = Counter(
    "error_rate",
    "Number of error responses",
    labelnames=("method", "path", "status"),
)

APP_UPTIME = Gauge("app_uptime_seconds", "Service uptime in seconds")


class Metrics:
    """Helper to register metrics endpoints and middleware."""

    def __init__(self) -> None:
        self.router = APIRouter()
        self._register_routes()

    def _register_routes(self) -> None:
        @self.router.get("/metrics", response_class=PlainTextResponse)
        async def metrics_endpoint(
            request: Request,
            settings: Settings = Depends(get_settings),
        ) -> Response:
            token = settings.metrics_auth_token
            if token and request.headers.get("authorization") != f"Bearer {token}":
                raise HTTPException(status_code=401, detail="unauthorized")
            payload = generate_latest()
            return Response(content=payload, media_type=CONTENT_TYPE_LATEST)

    def instrument(self, app: FastAPI) -> None:
        APP_UPTIME.set_function(lambda: time.monotonic() - app.state.start_time)  # type: ignore[attr-defined]

        @app.middleware("http")
        async def record_metrics(
            request: Request,
            call_next: Callable[[Request], Awaitable[Response]],
        ) -> Response:
            start = time.perf_counter()
            response = await call_next(request)
            latency = time.perf_counter() - start
            labels = {
                "method": request.method,
                "path": request.url.path,
                "status": str(response.status_code),
            }
            REQUEST_LATENCY.labels(**labels).observe(latency)
            if response.status_code >= 500:
                ERROR_RATE.labels(**labels).inc()
            return response

        app.include_router(self.router)

    @staticmethod
    def shutdown() -> None:
        logger.info("metrics_shutdown")


metrics = Metrics()
