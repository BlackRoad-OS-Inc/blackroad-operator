# INTEGRATION — rearview

> How this fork connects to the rest of BlackRoad OS

## Node Assignment

| Property | Value |
|----------|-------|
| **Primary Node** | Alice (.49) |
| **Fork Of** | Qdrant |
| **RoundTrip Agent** | RearView Agent |
| **NLP Intents** | 'search vectors' / 'find similar' |
| **NATS Subject** | `blackroad.rearview.>` |
| **GuardRail Monitor** | `https://guard.blackroad.io/status/rearview` |

## Deployment

Deploy via blackroad-operator:

```bash
# From blackroad-operator
cd ~/blackroad-operator
./scripts/deploy/deploy-rearview.sh

# Or via fleet coordinator
./fleet-coordinator.sh deploy rearview

# Manual deploy to Alice (.49)
ssh blackroad@$(echo "Alice (.49)" | grep -oP '[0-9.]+' || echo "Alice (.49)") \
  "cd /opt/blackroad/rearview && git pull && sudo systemctl restart rearview"
```

## Systemd Service

```ini
[Unit]
Description=BlackRoad rearview (Qdrant fork)
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=blackroad
WorkingDirectory=/opt/blackroad/rearview
ExecStart=/opt/blackroad/rearview/start.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## NATS Integration (CarPool)

```bash
# Subscribe to rearview events
nats sub "blackroad.rearview.>" --server nats://192.168.4.101:4222

# Publish status
nats pub "blackroad.rearview.status" '{"node":"Alice (.49)","status":"running"}' \
  --server nats://192.168.4.101:4222
```

## RoundTrip Agent

The **RearView Agent** manages this service via RoundTrip:

```bash
# Check agent status
curl -s https://roundtrip.blackroad.io/api/agents | jq '.[] | select(.name=="RearView Agent")'

# Send command to agent
curl -X POST https://roundtrip.blackroad.io/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"agent":"RearView Agent","message":"status","channel":"fleet"}'
```

## GuardRail Monitoring

Add to Uptime Kuma (Alice :3001):

| Check | URL/Command | Interval |
|-------|------------|----------|
| HTTP Health | `http://Alice (.49):PORT/health` | 30s |
| Process | `systemctl is-active rearview` | 60s |
| NATS Heartbeat | `blackroad.rearview.heartbeat` | 60s |

## Memory System Integration

```bash
# Log actions
~/blackroad-operator/scripts/memory/memory-system.sh log deploy rearview "Deployed to Alice (.49)"

# Add solutions to Codex
~/blackroad-operator/scripts/memory/memory-codex.sh add-solution "rearview" "How to restart" \
  "sudo systemctl restart rearview"

# Broadcast learnings
~/blackroad-operator/scripts/memory/memory-til-broadcast.sh broadcast "rearview" "Config change: ..."
```

## Related Components

| Component | Role | Connection |
|-----------|------|-----------|
| **TollBooth** (WireGuard) | VPN mesh | All traffic between nodes |
| **CarPool** (NATS) | Messaging | Event pub/sub on `blackroad.rearview.>` |
| **GuardRail** (Uptime Kuma) | Monitoring | Health checks every 30s |
| **RoadMem** (Mem0) | Memory | Persistent agent state |
| **OneWay** (Caddy) | TLS Edge | HTTPS termination on Gematria |
| **RearView** (Qdrant) | Vector Search | Semantic search over rearview logs |
| **BackRoad** (Portainer) | Containers | Docker management if containerized |
| **PitStop** (Pi-hole) | DNS | Internal `rearview.blackroad.local` resolution |
