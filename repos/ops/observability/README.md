# Observability Pack

This directory contains drop-in assets for Prometheus, Grafana, and tracing across services.

- `prometheus/scrape-config.yaml`: scrape configs and alerting rules that enforce golden signals.
- `grafana/service-dashboard.json`: dashboard template parameterized by service label.
- `prometheus/alerting-rules.yml`: SLO-based alerts for latency, error rate, and crash loops.

Use these assets with the Makefile targets and CI workflows to standardize monitoring across environments.
