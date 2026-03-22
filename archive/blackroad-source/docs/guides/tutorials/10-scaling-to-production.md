# Tutorial 10 — Scaling to Production (30K Agents)

## Overview

This tutorial covers scaling BlackRoad OS from a single-Pi setup to a production
fleet handling **30,000 concurrent agents** across multiple nodes.

## Prerequisites

- Tutorial 08 (Deploy Instance) completed
- `kubectl` configured for your cluster
- `helm` installed

## Phase 1 — Kubernetes Horizontal Pod Autoscaler

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: blackroad-agents-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: blackroad-agents
  minReplicas: 3
  maxReplicas: 300          # 100 agents/pod × 300 pods = 30K
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 70
```

Apply:
```bash
kubectl apply -f k8s/hpa.yaml
kubectl get hpa blackroad-agents-hpa --watch
```

## Phase 2 — Nomad Auto-Scaling

If you're on Nomad instead of Kubernetes:

```hcl
# nomad/autoscaler.nomad
job "blackroad-autoscaler" {
  group "autoscaler" {
    task "autoscaler" {
      driver = "docker"
      config {
        image = "hashicorp/nomad-autoscaler:latest"
        args  = [
          "agent",
          "-config=/etc/autoscaler/config.hcl",
        ]
      }
    }
  }
}
```

Policy for the agents job:
```hcl
scaling "agent_count" {
  enabled = true
  min     = 1
  max     = 300

  policy {
    check "cpu" {
      source = "nomad-apm"
      query  = "avg_cpu"
      strategy "target-value" { target = 60 }
    }
  }
}
```

## Phase 3 — Cloudflare Worker Sharding

For the gateway, use Durable Objects for per-session stickiness:

```typescript
// wrangler.toml
[[durable_objects.bindings]]
name = "SESSION"
class_name = "AgentSession"

[durable_objects]
bindings = [{ name = "SESSION", class_name = "AgentSession" }]
```

```typescript
export class AgentSession {
  state: DurableObjectState;
  constructor(state: DurableObjectState) { this.state = state; }

  async fetch(request: Request): Promise<Response> {
    const history = await this.state.storage.get<unknown[]>("history") ?? [];
    const body = await request.json() as { message: string };
    history.push({ role: "user", content: body.message, ts: Date.now() });
    await this.state.storage.put("history", history.slice(-100));  // keep last 100
    return Response.json({ session_id: this.state.id.toString(), history_len: history.length });
  }
}
```

## Phase 4 — Pi Fleet Expansion

Scale horizontally with more Pis:

```bash
# Add a new Pi to the fleet
ansible-playbook -i inventory.yaml blackroad-core/ansible/pi-fleet.yaml \
  --limit new-pi-node \
  --extra-vars "pi_hostname=aria128 pi_ip=192.168.4.200 agent_capacity=22500"
```

## Phase 5 — Monitoring at Scale

```bash
# Deploy Prometheus + Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install blackroad-monitoring prometheus-community/kube-prometheus-stack \
  --set grafana.adminPassword=blackroad \
  --set prometheus.prometheusSpec.retention=30d
```

Dashboard import IDs for Grafana:
- Agent throughput: `br-agents-001`
- Memory chain health: `br-memory-002`
- Gateway latency: `br-gateway-003`

## Phase 6 — Load Testing

```bash
# Install k6
brew install k6

# Run 30K agent simulation
k6 run --vus 1000 --duration 5m tests/load-test.js
```

```javascript
// tests/load-test.js
import http from "k6/http";
import { check } from "k6";

export const options = { vus: 1000, duration: "5m" };

export default function () {
  const res = http.post("https://agent.blackroad.ai/v1/chat", JSON.stringify({
    agent: "alice",
    messages: [{ role: "user", content: "status check" }],
  }), { headers: { "Content-Type": "application/json" } });
  check(res, { "status 200": (r) => r.status === 200, "< 500ms": (r) => r.timings.duration < 500 });
}
```

## Capacity Reference

| Nodes | Pods/VMs | Agents | Throughput |
|-------|----------|--------|------------|
| 1 Pi  | 1        | ~500   | ~50 req/s  |
| 3 Pi  | 3        | ~7,500 | ~750 req/s |
| 6 Pi  | 6+DO     | ~30K   | ~3K req/s  |
| K8s   | 300      | 30K    | ~30K req/s |

## Next Steps

- [Monitor agent health](../monitoring/README.md)
- [Set up alerts](../docs/alerting.md)
- [CECE identity across nodes](./CECE.md)
