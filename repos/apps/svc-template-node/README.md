# Node.js Service Template

Production-ready Express service with metrics, tracing, and structured logging. Drop this folder into a new backend project to align with Blackroad platform conventions.

## Features

- `/health`, `/live`, `/ready`, and `/metrics` endpoints.
- JSON logs powered by `pino` and `pino-http`.
- Prometheus metrics with `app_uptime_seconds`, `http_request_duration_seconds`, and `error_rate`.
- OTLP tracing via OpenTelemetry auto-instrumentation.
- Graceful shutdown on SIGTERM/SIGINT.
- Environment-first configuration validated with `zod`.
- Distroless container image for runtime hardening.

## Getting started

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
```

## Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `APP_NAME` | Service name for logs and tracing | `svc-template-node` |
| `ENVIRONMENT` | Deployment environment tag | `local` |
| `PORT` | HTTP port to bind | `4000` |
| `LOG_LEVEL` | pino log level | `info` |
| `BUILD_SHA` | Build identifier for `/health` | `local` |
| `OTLP_ENDPOINT` | Optional OTLP collector URL | unset |
| `METRICS_AUTH_TOKEN` | Optional bearer token for `/metrics` | unset |
| `READINESS_DEPENDENCIES` | Comma separated dependency URLs | empty |

## Docker build

```bash
docker build -t svc-template-node:latest .
```
