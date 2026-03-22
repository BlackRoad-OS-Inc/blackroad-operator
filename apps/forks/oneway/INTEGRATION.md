# INTEGRATION — oneway

> How this fork connects to the rest of BlackRoad OS

## Node Assignment

| Property | Value |
|----------|-------|
| **Primary Node** | Gematria (DO nyc3) |
| **Fork Of** | Caddy v2 |
| **RoundTrip Agent** | OneWay Agent |
| **NLP Intents** | 'add domain' / 'check cert' |
| **NATS Subject** | `blackroad.oneway.>` |
| **GuardRail Monitor** | `https://guard.blackroad.io/status/oneway` |

## Deployment

Deploy via blackroad-operator:

```bash
# From blackroad-operator
cd ~/blackroad-operator
./scripts/deploy/deploy-oneway.sh

# Or via fleet coordinator
./fleet-coordinator.sh deploy oneway

# Manual deploy to Gematria (DO nyc3)
ssh blackroad@$(echo "Gematria (DO nyc3)" | grep -oP '[0-9.]+' || echo "Gematria (DO nyc3)") \
  "cd /opt/blackroad/oneway && git pull && sudo systemctl restart oneway"
```

## Systemd Service

```ini
[Unit]
Description=BlackRoad oneway (Caddy v2 fork)
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=blackroad
WorkingDirectory=/opt/blackroad/oneway
ExecStart=/opt/blackroad/oneway/start.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## NATS Integration (CarPool)

```bash
# Subscribe to oneway events
nats sub "blackroad.oneway.>" --server nats://192.168.4.101:4222

# Publish status
nats pub "blackroad.oneway.status" '{"node":"Gematria (DO nyc3)","status":"running"}' \
  --server nats://192.168.4.101:4222
```

## RoundTrip Agent

The **OneWay Agent** manages this service via RoundTrip:

```bash
# Check agent status
curl -s https://roundtrip.blackroad.io/api/agents | jq '.[] | select(.name=="OneWay Agent")'

# Send command to agent
curl -X POST https://roundtrip.blackroad.io/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"agent":"OneWay Agent","message":"status","channel":"fleet"}'
```

## GuardRail Monitoring

Add to Uptime Kuma (Alice :3001):

| Check | URL/Command | Interval |
|-------|------------|----------|
| HTTP Health | `http://Gematria (DO nyc3):PORT/health` | 30s |
| Process | `systemctl is-active oneway` | 60s |
| NATS Heartbeat | `blackroad.oneway.heartbeat` | 60s |

## Memory System Integration

```bash
# Log actions
~/blackroad-operator/scripts/memory/memory-system.sh log deploy oneway "Deployed to Gematria (DO nyc3)"

# Add solutions to Codex
~/blackroad-operator/scripts/memory/memory-codex.sh add-solution "oneway" "How to restart" \
  "sudo systemctl restart oneway"

# Broadcast learnings
~/blackroad-operator/scripts/memory/memory-til-broadcast.sh broadcast "oneway" "Config change: ..."
```

## Related Components

| Component | Role | Connection |
|-----------|------|-----------|
| **TollBooth** (WireGuard) | VPN mesh | All traffic between nodes |
| **CarPool** (NATS) | Messaging | Event pub/sub on `blackroad.oneway.>` |
| **GuardRail** (Uptime Kuma) | Monitoring | Health checks every 30s |
| **RoadMem** (Mem0) | Memory | Persistent agent state |
| **OneWay** (Caddy) | TLS Edge | HTTPS termination on Gematria |
| **RearView** (Qdrant) | Vector Search | Semantic search over oneway logs |
| **BackRoad** (Portainer) | Containers | Docker management if containerized |
| **PitStop** (Pi-hole) | DNS | Internal `oneway.blackroad.local` resolution |
