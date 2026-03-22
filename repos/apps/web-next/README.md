# Next.js Web Template

Next.js 14 starter wired for strict security headers, health checks, metrics, and OpenTelemetry tracing. Pair it with the backend templates to deliver a unified developer experience.

## Quickstart

```bash
npm install
npm run dev
```

## Endpoints

- `/healthz` returns `{ status, build_sha }` for uptime monitoring.
- `/api/metrics` exposes Prometheus metrics (`web_uptime_seconds`, `web_request_duration_seconds`).

## Observability

Set `OTLP_ENDPOINT` to enable OpenTelemetry tracing via `instrumentation.ts`. Metrics are emitted with `prom-client` and secured by the optional `METRICS_AUTH_TOKEN` environment variable.

## Deployment

Use `npm run build` to produce a standalone output suitable for containerization or deployment to Vercel.
