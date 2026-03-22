# BlackRoad OS Core Service Mesh

`blackroad-os-core` is the kernel that exposes shared protocol types and orchestrations the rest of the stack consumes. This file maps how it connects to every other canonical repo so downstream services can discover and cascade the same context.

## Dependency cascade

| Upstream service | Repo | Purpose | Interface | Downstream impact |
| --- | --- | --- | --- | --- |
| API Gateway | `blackroad-os-api-gateway` | Edge API that fronts `core` and `operator` for all public traffic. | HTTP :8080 | Centralizes auth/rate limiting before requests reach core types. |
| Domain API | `blackroad-os-api` | User, org, pack, agent, and job logic expressed using core schemas. | HTTP | Feeds both gateway and operator with domain events while staying protocol-aligned. |
| Operator | `blackroad-os-operator` | Control plane that turns core plans into runnable jobs. | HTTP :9001 | Dispatches workflows to the agent fabric using core orchestration graphs. |
| Agent Fabric | `blackroad-os-agents` | Workers that execute tasks issued by the operator. | Queue/worker bus | Executes against the protocol contracts defined in core. |
| Frontend | `blackroad-os-web` | Single Next.js surface (marketing, workspace, console, pack UIs). | HTTP :3000 | Renders UI using the gateway and core SDK types. |
| Infra Registry | `blackroad-os-infra` | IaC + service registry authority. | IaC manifests | Publishes discovery records and routes for every environment. |

## Provided surface

`blackroad-os-core` exposes `blackroad-os-core-api` for internal consumers and registers it through the service registry heartbeat defined in `service-mesh.json`. That API supplies the canonical types, orchestration graphs, and versioned schemas the rest of the stack aligns to.

## Discovery and routing

- Registry endpoint: `https://api.blackroad.io/registry`
- Heartbeat: every 30 seconds
- Typical deployment ports (from the architecture blueprint):
  - Web: 3000
  - API Gateway: 8080
  - Core: 9000 (internal)
  - Operator: 9001

With these anchors, the gateway fans traffic into core/operator, operator fans into the agent fabric, and the frontend keeps in lockstep via shared SDK types. Infra keeps the routing table coherent so every tier can discover the others without manual reconfiguration.
