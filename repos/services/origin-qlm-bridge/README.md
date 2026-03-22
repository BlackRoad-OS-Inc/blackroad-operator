# Origin QLM Bridge

FastAPI service that mediates between the Origin Campus gateway and deterministic
quantum learning modules (QLM). The bridge accepts job queue requests from the
gateway, executes sandboxed task runners, validates outputs against policy, and
returns signed artifact manifests.

This repository slice provides a runnable skeleton with clear extension points
for task adapters, lineage verification, and telemetry export.

## Quickstart

```bash
cd services/origin-qlm-bridge
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
uvicorn origin_qlm_bridge.app:create_app --reload --host 0.0.0.0 --port 8100
```

OpenAPI docs will be available at `http://localhost:8100/docs` once the server
is running.

## Environment Variables

| Name                    | Description                                                  |
| ----------------------- | ------------------------------------------------------------ |
| `QLM_BRIDGE_PORT`       | Port for the HTTP server (default `8100`).                   |
| `QLM_GATEWAY_URL`       | Base URL for callbacks into the Origin gateway.              |
| `QLM_STORAGE_PATH`      | Filesystem path for temporary artifact staging.              |
| `QLM_POLICY_BUNDLE`     | Path or URL to the Rego policy bundle for verification.      |
| `QLM_EVIDENCE_STREAM`   | Optional endpoint for append-only evidence fan-out.         |

## Project Layout

```
src/origin_qlm_bridge/
  __init__.py
  app.py        # FastAPI factory and startup hooks
  config.py     # Pydantic settings for runtime configuration
  schemas.py    # Pydantic models shared across routers
  routes/
    __init__.py
    jobs.py     # Job submission, status, and completion webhooks
tests/
  test_health.py
Dockerfile
```

## Next Steps

1. Implement task runner adapters inside `origin_qlm_bridge.routes.jobs`.
2. Persist job state using SQLModel or Postgres per `schema.sql` in the gateway.
3. Wire telemetry to the Origin observability stack.
4. Harden evidence signing and policy enforcement before production RC.
