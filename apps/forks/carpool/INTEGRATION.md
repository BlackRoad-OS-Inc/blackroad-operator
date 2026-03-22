# INTEGRATION — carpool

> How this fork connects to the rest of BlackRoad OS

## Node Assignment

| Property | Value |
|----------|-------|
| **Primary Node** | Octavia (.101) |
| **Fork Of** | NATS Server v2.12 |
| **RoundTrip Agent** | CarPool Agent |
| **NLP Intents** | 'send message' / 'broadcast' |
| **NATS Subject** | `blackroad.carpool.>` |
| **GuardRail Monitor** | `https://guard.blackroad.io/status/carpool` |

## Deployment

Deploy via blackroad-operator:

```bash
# From blackroad-operator
cd ~/blackroad-operator
./scripts/deploy/deploy-carpool.sh

# Or via fleet coordinator
./fleet-coordinator.sh deploy carpool

# Manual deploy to Octavia (.101)
ssh blackroad@$(echo "Octavia (.101)" | grep -oP '[0-9.]+' || echo "Octavia (.101)") \
  "cd /opt/blackroad/carpool && git pull && sudo systemctl restart carpool"
```

## Systemd Service

```ini
[Unit]
Description=BlackRoad carpool (NATS Server v2.12 fork)
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=blackroad
WorkingDirectory=/opt/blackroad/carpool
ExecStart=/opt/blackroad/carpool/start.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## NATS Integration (CarPool)

```bash
# Subscribe to carpool events
nats sub "blackroad.carpool.>" --server nats://192.168.4.101:4222

# Publish status
nats pub "blackroad.carpool.status" '{"node":"Octavia (.101)","status":"running"}' \
  --server nats://192.168.4.101:4222
```

## RoundTrip Agent

The **CarPool Agent** manages this service via RoundTrip:

```bash
# Check agent status
curl -s https://roundtrip.blackroad.io/api/agents | jq '.[] | select(.name=="CarPool Agent")'

# Send command to agent
curl -X POST https://roundtrip.blackroad.io/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"agent":"CarPool Agent","message":"status","channel":"fleet"}'
```

## GuardRail Monitoring

Add to Uptime Kuma (Alice :3001):

| Check | URL/Command | Interval |
|-------|------------|----------|
| HTTP Health | `http://Octavia (.101):PORT/health` | 30s |
| Process | `systemctl is-active carpool` | 60s |
| NATS Heartbeat | `blackroad.carpool.heartbeat` | 60s |

## Memory System Integration

```bash
# Log actions
~/blackroad-operator/scripts/memory/memory-system.sh log deploy carpool "Deployed to Octavia (.101)"

# Add solutions to Codex
~/blackroad-operator/scripts/memory/memory-codex.sh add-solution "carpool" "How to restart" \
  "sudo systemctl restart carpool"

# Broadcast learnings
~/blackroad-operator/scripts/memory/memory-til-broadcast.sh broadcast "carpool" "Config change: ..."
```

## Related Components

| Component | Role | Connection |
|-----------|------|-----------|
| **TollBooth** (WireGuard) | VPN mesh | All traffic between nodes |
| **CarPool** (NATS) | Messaging | Event pub/sub on `blackroad.carpool.>` |
| **GuardRail** (Uptime Kuma) | Monitoring | Health checks every 30s |
| **RoadMem** (Mem0) | Memory | Persistent agent state |
| **OneWay** (Caddy) | TLS Edge | HTTPS termination on Gematria |
| **RearView** (Qdrant) | Vector Search | Semantic search over carpool logs |
| **BackRoad** (Portainer) | Containers | Docker management if containerized |
| **PitStop** (Pi-hole) | DNS | Internal `carpool.blackroad.local` resolution |
