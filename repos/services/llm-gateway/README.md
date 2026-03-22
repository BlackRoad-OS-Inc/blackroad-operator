# LLM Gateway

`llm-gateway` fronts Lucidia chat traffic with a circuit breaker that can
shift requests to the approved fallback model when the `/healthz` signal
turns red. It polls the `llm-healthwatch` service, logs incidents, and
supports gradual recovery (half-open) before returning to steady state.

## Behaviour

1. `closed` — all traffic to the primary Lucidia deployment.
2. `open` — all traffic to the fallback bridge when `/healthz` is red or
   primary requests fail.
3. `half-open` — while `/healthz` is amber, route a configurable fraction
   back to the primary and close the incident after consecutive successes.

Incidents append JSON lines to `INCIDENT_LOG_PATH` so ops can review the
impact window and metrics.

## Environment

| Variable                         | Default                                                      | Description |
| -------------------------------- | ------------------------------------------------------------ | ----------- |
| `PORT`                           | `4010`                                                       | Listen port |
| `PRIMARY_URL`                    | `http://llm.prism.svc.cluster.local:8000/v1/chat`            | Primary chat endpoint |
| `FALLBACK_URL`                   | `http://ollama-bridge.prism.svc.cluster.local:4010/api/chat` | Fallback chat endpoint |
| `HEALTH_ENDPOINT`                | `http://llm-healthwatch.prism.svc.cluster.local:8080/healthz`| Health source |
| `HEALTH_INTERVAL_MS`             | `15000`                                                      | Poll cadence |
| `HALF_OPEN_RATIO`                | `0.2`                                                        | Fraction of traffic retried on primary |
| `HALF_OPEN_SUCCESS_THRESHOLD`    | `5`                                                          | Successes required before closing |
| `REQUEST_TIMEOUT_MS`             | `15000`                                                      | Upstream timeout |
| `INCIDENT_LOG_PATH`              | `/var/log/llm-incidents.jsonl`                               | Append-only log |

Mount the incident log onto persistent storage (e.g., emptyDir + Fluent
Bit tail) so postmortems capture every failover.
