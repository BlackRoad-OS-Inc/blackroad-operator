# Prism Policy Engine

OPA-based policy enforcement engine for evaluating Rego policies across the Prism multi-agent platform.

## Features

- **Rego Policy Evaluation**: Native OPA integration
- **Policy Discovery**: Automatic discovery of .rego files
- **Multi-Domain Support**: Deploy, network, safety, compliance policies
- **Decision Logging**: Audit trail for all policy decisions
- **Metrics**: Prometheus metrics for monitoring
- **Fast**: Subprocess-based OPA evaluation with caching

## Quick Start

```bash
# Install dependencies
poetry install

# Run service
poetry run python -m uvicorn app.main:app --reload --port 8001

# Run with Docker
docker build -t prism-policy-engine .
docker run -p 8001:8001 prism-policy-engine
```

## API Usage

### Evaluate Policy

```bash
curl -X POST http://localhost:8001/v1/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "policy": "deploy.authz",
    "input": {
      "action": "deploy",
      "env": "prod",
      "commit": {"verified": true, "signer": "cosign"},
      "checks": {"tests": "pass", "lint": "pass", "sast": "pass", "coverage": 0.85, "coverage_min": 0.80}
    },
    "rule": "allow"
  }'
```

Response:
```json
{
  "result": true,
  "policy": "deploy.authz",
  "rule": "allow",
  "allowed": true,
  "violations": [],
  "metadata": {"policy_file": "/app/policies/deploy.rego"}
}
```

### List Policies

```bash
curl http://localhost:8001/policies
```

## Supported Policies

- **deploy.authz** - Deployment authorization
- **sentinel.network** - Network access control
- **sentinel.fs** - Filesystem access control
- **reproduction** - Agent reproduction safety
- **prism.gates.qlm_lab** - Quantum lab gates

## Policy Development

Add new policies to the `policies/` directory:

```rego
package myapp.authorization

default allow = false

allow {
  input.user.role == "admin"
  input.action == "write"
}
```

The engine automatically discovers and loads all `.rego` files.

## Configuration

Environment variables:
- `POLICY_DIR` - Policy directory path (default: `./policies`)
- `OPA_TIMEOUT` - OPA evaluation timeout in seconds (default: 10)

## Deployment

### Kubernetes

```bash
kubectl apply -f k8s/deployment.yaml
```

### Docker Compose

```bash
docker-compose up -d
```

## Testing

```bash
# Run tests
poetry run pytest

# With coverage
poetry run pytest --cov=app
```

## License

Copyright (c) 2025 BlackRoad Inc.
