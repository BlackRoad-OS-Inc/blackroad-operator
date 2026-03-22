"""OpenTelemetry instrumentation helpers."""

from __future__ import annotations

from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from .config import Settings
from .structured_logging import get_logger

logger = get_logger(__name__)


def configure_tracing(settings: Settings) -> None:
    """Configure OTLP tracing if an endpoint is provided."""

    if not settings.otlp_endpoint:
        logger.info("otel_disabled")
        return

    resource = Resource.create(
        {
            "service.name": settings.app_name,
            "deployment.environment": settings.environment,
        }
    )

    provider = TracerProvider(resource=resource)
    processor = BatchSpanProcessor(OTLPSpanExporter(endpoint=settings.otlp_endpoint))
    provider.add_span_processor(processor)
    trace.set_tracer_provider(provider)
    logger.info("otel_configured", endpoint=settings.otlp_endpoint)


def instrument_fastapi(app: FastAPI) -> None:
    """Instrument FastAPI application with OpenTelemetry."""

    FastAPIInstrumentor.instrument_app(app)
