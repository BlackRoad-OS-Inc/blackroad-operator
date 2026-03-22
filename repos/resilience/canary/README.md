# Lucidia LLM Canary

This probe exercises the lightest-weight chat path for the Lucidia model
fleet. It mirrors the production wiring inside the Prism namespace and
feeds the `/healthz` controller so we can alert or fail over before end
users notice.

## Providers

By default the canary tests the following endpoints every minute:

| Provider          | Env var prefix           | Default URL                                      | Notes |
| ----------------- | ------------------------ | ------------------------------------------------ | ----- |
| `lucidia-primary` | `PRISM_LUCIDIA_PRIMARY`  | `http://llm.prism.svc.cluster.local:8000`        | In-cluster Lucidia LLM |
| `lucidia-fallback`| `PRISM_LUCIDIA_FALLBACK` | `http://ollama-bridge.prism.svc.cluster.local:4010` | Qwen2/Qwen2.5 bridge |

Additional providers can be appended by setting
`PRISM_LLM_EXTRA_CANARY_PROVIDERS` to a comma-separated list. For each
entry `foo-bar` the script expects environment variables:
`FOO_BAR_URL`, `FOO_BAR_KEY` (optional), and `FOO_BAR_MODEL` (optional).

## Expectations

The probe enforces the Lucidia SLO guardrails:

- p95 latency under **1.2s** (`PRISM_LLM_CANARY_MAX_P95_MS`)
- Total tokens under **32** (`PRISM_LLM_CANARY_MAX_TOKENS`)
- HTTP `200` response with the literal payload `pong`

Failures exit with code `2`, allowing Kubernetes Jobs and alerting to
surface the regression immediately.

## Healthwatch integration

When the `PRISM_LLM_HEALTHWATCH_URL` variable is set (defaulting to the
cluster service name) each run posts its samples to the
`llm-healthwatch` sidecar via `POST /samples`. That service keeps a
five-minute sliding window to drive the `/healthz` state machine and the
circuit breaker controller.
