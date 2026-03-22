# Model Health Service

This service provides a centralized `/healthz` endpoint and incident log for the
LLM providers that power Prism. It ingests minute-level canary samples, computes
rolling five minute SLOs (error rate, p95 latency, timeout rate), and recommends
fallback ratios for the API gateway when the primary provider degrades.

## Features

- **/samples** — ingest canary results (`provider`, `latency_ms`, `code`,
  `ok`, `tokens`). Samples older than five minutes are discarded automatically.
- **/healthz** — aggregate red/amber/green classification with JSON details for
  dashboards and Kubernetes probes. Returns HTTP 503 while red.
- **/providers/{name}** — provider-level health snapshot including recommended
  fallback ratio.
- **/config** — exposes currently loaded SLO and expectation metadata.
- **Incident logging** — transitions to `red` append an incident record to
  `${INCIDENT_LOG_PATH:-/var/log/model-incidents.jsonl}`; resolutions append a
  matching `resolve` entry with duration.

## Configuration

The service expects `PROVIDER_CONFIG_PATH` (default `/config/providers.yaml`) to
point at a configuration file that matches `configs/aiops/providers.yaml` in this
repository. Mount the same file into the canary CronJob so both components stay
in sync.

Environment variables:

| Variable | Purpose |
| --- | --- |
| `PROVIDER_CONFIG_PATH` | Location of the provider config file (YAML). |
| `INCIDENT_LOG_PATH` | Optional path for JSONL incident log output. |

## Development

```bash
pip install -r services/model-health/requirements.txt
uvicorn services.model-health.app.main:app --reload --port 8080
```

Run the bundled canary locally (requires provider credentials):

```bash
PROVIDER_CONFIG_PATH=configs/aiops/providers.yaml \
HEALTH_SINK_URL=http://127.0.0.1:8080 \
python services/model-health/canary.py
```
