# ROADMAP — carpool

> BlackRoad OS fork of NATS Server v2.12
> NATS fork — pub/sub messaging backbone for agent-to-agent communication

## Phase 1 — Q1: Fleet Integration

- Deploy carpool to Octavia (.101) with systemd auto-start
- Register with RoundTrip agent coordination hub
- Wire to NATS (CarPool) for event pub/sub
- Add GuardRail uptime monitoring (30s interval)
- Connect to blackroad-operator deploy pipeline
- Verify WireGuard (TollBooth) mesh connectivity from all nodes
- Add to fleet-coordinator.sh manifest

## Phase 2 — Q2: Enhance Beyond Upstream

- Build custom BlackRoad UI skin (brand colors: #FF1D6C, #F5A623, #2979FF)
- Add NLP intent routing: 'send message' / 'broadcast'
- Create CarPool Agent persona with RoundTrip auto-chat
- Integrate with RoadMem for persistent state across restarts
- Add Codex solution entries for common carpool operations
- Build blackroad-operator CLI commands: `br carpool status|deploy|logs`

## Phase 3 — Q3: Production Hardening

- Implement automated backup via Local (encrypted fleet sync)
- Add Prometheus metrics endpoint for Grafana (RoadMap) dashboards
- Set up Gitea CI/CD pipeline with act_runner
- Stress test under full fleet load (5 Pis + 2 droplets)
- Security audit: TLS, auth, network isolation
- Create disaster recovery runbook in ~/blackroad-disaster-recovery/

## Phase 4 — Q4: Scale

- Multi-node HA deployment across Pi fleet
- Auto-scaling based on fleet metrics
- Cross-region replication (nyc3 Gematria <-> nyc1 Anastasia)
- Contribute BlackRoad improvements back to upstream NATS Server v2.12
- Document in BlackRoad OS knowledge base for onboarding
- Publish integration guide on docs.blackroad.io
