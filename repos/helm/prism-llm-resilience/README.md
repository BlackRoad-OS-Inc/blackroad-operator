# Prism LLM Resilience Chart

Deploys the Lucidia canary CronJob, `llm-healthwatch` service, and the
circuit-breaking `llm-gateway`.

```bash
helm upgrade --install llm-resilience ./helm/prism-llm-resilience \
  --namespace prism --create-namespace
```

Values expose knobs for namespaces, replica counts, half-open ratios, and
storage for the incident log. The CronJob mounts the `lucidia_llm_canary`
script directly so updates stay in lock-step with the repo copy under
`resilience/canary/`.
