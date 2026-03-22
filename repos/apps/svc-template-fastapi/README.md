# FastAPI Service Template

A production-grade FastAPI scaffold with health/readiness probes, Prometheus metrics, OpenTelemetry tracing, and structured logs. Use this template to spin up new backend services with the Blackroad platform defaults.

## Features

- `/health`, `/live`, `/ready`, `/metrics`, and `/openapi.json` endpoints.
- JSON logs via structlog with ISO timestamps.
- Prometheus metrics including `app_uptime_seconds`, `http_request_duration_seconds`, and `error_rate` counters.
- OTLP tracing (enable by setting `OTLP_ENDPOINT`).
- Configuration strictly via environment variables using Pydantic settings.
- Graceful shutdown on SIGTERM/SIGINT for container orchestrators.
- Dockerfile targeting `gcr.io/distroless/python3` for a non-root runtime.

## Quickstart

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
uvicorn app.main:create_app --factory
```

## Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `APP_NAME` | Service name | `svc-template-fastapi` |
| `ENVIRONMENT` | Deployment environment | `local` |
| `LOG_LEVEL` | Python log level | `INFO` |
| `OTLP_ENDPOINT` | Optional OTLP collector URL | unset |
| `BUILD_SHA` | Git SHA for health endpoint | `local` |
| `READINESS_DEPENDENCIES` | Comma separated dependency URLs | empty |
| `METRICS_AUTH_TOKEN` | Optional bearer token for `/metrics` | unset |

## Running tests

```bash
pytest
```

## Docker build

```bash
docker build -t svc-template-fastapi:latest .
```
