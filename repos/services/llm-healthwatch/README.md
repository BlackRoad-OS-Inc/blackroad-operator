# LLM Healthwatch

`llm-healthwatch` ingests Lucidia canary samples and exposes a unified
`/healthz` endpoint for Kubernetes probes, dashboards, and automation.
It computes rolling five-minute SLOs and exports Prometheus metrics for
p95 latency, error rate, and timeouts.

## Endpoints

- `POST /samples` — accepts `{ "samples": [...] }` payloads from the
  CronJob. Each sample should contain `provider`, `latency_ms`, `ok`, and
  optional `status_code` / `timed_out` fields.
- `GET /healthz` — returns `green|amber|red` and the computed window
  metrics. Responds with HTTP `503` when **red** so K8s readiness probes
  will hold traffic.
- `GET /metrics` — Prometheus exposition with `prism_llm_canary_*`
  series.

## Configuration

| Variable              | Default | Description |
| --------------------- | ------- | ----------- |
| `PORT`                | `8080`  | Listen port |
| `WINDOW_MS`           | `300000`| Sliding window size |
| `P95_SLO_MS`          | `1200`  | Target p95 latency |
| `ERROR_RATE_SLO`      | `0.02`  | Error rate before amber |
| `ERROR_RATE_AMBER`    | `0.05`  | Error rate triggering red |
| `MIN_SAMPLE_COUNT`    | `20`    | Minimum samples required for green |

Deploy via the Helm chart at `helm/prism-llm-resilience`.
