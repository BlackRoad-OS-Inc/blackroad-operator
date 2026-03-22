# INTEGRATION — guardrail

> How this fork connects to the rest of BlackRoad OS

## Node Assignment

| Property | Value |
|----------|-------|
| **Primary Node** | Alice (.49) |
| **Fork Of** | Uptime Kuma |
| **RoundTrip Agent** | GuardRail Agent |
| **NLP Intents** | 'check status' / 'is X up' |
| **NATS Subject** | `blackroad.guardrail.>` |
| **GuardRail Monitor** | `https://guard.blackroad.io/status/guardrail` |

## Deployment

Deploy via blackroad-operator:

```bash
# From blackroad-operator
cd ~/blackroad-operator
./scripts/deploy/deploy-guardrail.sh

# Or via fleet coordinator
./fleet-coordinator.sh deploy guardrail

# Manual deploy to Alice (.49)
ssh blackroad@$(echo "Alice (.49)" | grep -oP '[0-9.]+' || echo "Alice (.49)") \
  "cd /opt/blackroad/guardrail && git pull && sudo systemctl restart guardrail"
```

## Systemd Service

```ini
[Unit]
Description=BlackRoad guardrail (Uptime Kuma fork)
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=blackroad
WorkingDirectory=/opt/blackroad/guardrail
ExecStart=/opt/blackroad/guardrail/start.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## NATS Integration (CarPool)

```bash
# Subscribe to guardrail events
nats sub "blackroad.guardrail.>" --server nats://192.168.4.101:4222

# Publish status
nats pub "blackroad.guardrail.status" '{"node":"Alice (.49)","status":"running"}' \
  --server nats://192.168.4.101:4222
```

## RoundTrip Agent

The **GuardRail Agent** manages this service via RoundTrip:

```bash
# Check agent status
curl -s https://roundtrip.blackroad.io/api/agents | jq '.[] | select(.name=="GuardRail Agent")'

# Send command to agent
curl -X POST https://roundtrip.blackroad.io/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"agent":"GuardRail Agent","message":"status","channel":"fleet"}'
```

## GuardRail Monitoring

Add to Uptime Kuma (Alice :3001):

| Check | URL/Command | Interval |
|-------|------------|----------|
| HTTP Health | `http://Alice (.49):PORT/health` | 30s |
| Process | `systemctl is-active guardrail` | 60s |
| NATS Heartbeat | `blackroad.guardrail.heartbeat` | 60s |

## Memory System Integration

```bash
# Log actions
~/blackroad-operator/scripts/memory/memory-system.sh log deploy guardrail "Deployed to Alice (.49)"

# Add solutions to Codex
~/blackroad-operator/scripts/memory/memory-codex.sh add-solution "guardrail" "How to restart" \
  "sudo systemctl restart guardrail"

# Broadcast learnings
~/blackroad-operator/scripts/memory/memory-til-broadcast.sh broadcast "guardrail" "Config change: ..."
```

## Related Components

| Component | Role | Connection |
|-----------|------|-----------|
| **TollBooth** (WireGuard) | VPN mesh | All traffic between nodes |
| **CarPool** (NATS) | Messaging | Event pub/sub on `blackroad.guardrail.>` |
| **GuardRail** (Uptime Kuma) | Monitoring | Health checks every 30s |
| **RoadMem** (Mem0) | Memory | Persistent agent state |
| **OneWay** (Caddy) | TLS Edge | HTTPS termination on Gematria |
| **RearView** (Qdrant) | Vector Search | Semantic search over guardrail logs |
| **BackRoad** (Portainer) | Containers | Docker management if containerized |
| **PitStop** (Pi-hole) | DNS | Internal `guardrail.blackroad.local` resolution |
