# INTEGRATION — tollbooth

> How this fork connects to the rest of BlackRoad OS

## Node Assignment

| Property | Value |
|----------|-------|
| **Primary Node** | All nodes |
| **Fork Of** | WireGuard |
| **RoundTrip Agent** | TollBooth Agent |
| **NLP Intents** | 'tunnel status' / 'mesh health' |
| **NATS Subject** | `blackroad.tollbooth.>` |
| **GuardRail Monitor** | `https://guard.blackroad.io/status/tollbooth` |

## Deployment

Deploy via blackroad-operator:

```bash
# From blackroad-operator
cd ~/blackroad-operator
./scripts/deploy/deploy-tollbooth.sh

# Or via fleet coordinator
./fleet-coordinator.sh deploy tollbooth

# Manual deploy to All nodes
ssh blackroad@$(echo "All nodes" | grep -oP '[0-9.]+' || echo "All nodes") \
  "cd /opt/blackroad/tollbooth && git pull && sudo systemctl restart tollbooth"
```

## Systemd Service

```ini
[Unit]
Description=BlackRoad tollbooth (WireGuard fork)
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=blackroad
WorkingDirectory=/opt/blackroad/tollbooth
ExecStart=/opt/blackroad/tollbooth/start.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## NATS Integration (CarPool)

```bash
# Subscribe to tollbooth events
nats sub "blackroad.tollbooth.>" --server nats://192.168.4.101:4222

# Publish status
nats pub "blackroad.tollbooth.status" '{"node":"All nodes","status":"running"}' \
  --server nats://192.168.4.101:4222
```

## RoundTrip Agent

The **TollBooth Agent** manages this service via RoundTrip:

```bash
# Check agent status
curl -s https://roundtrip.blackroad.io/api/agents | jq '.[] | select(.name=="TollBooth Agent")'

# Send command to agent
curl -X POST https://roundtrip.blackroad.io/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"agent":"TollBooth Agent","message":"status","channel":"fleet"}'
```

## GuardRail Monitoring

Add to Uptime Kuma (Alice :3001):

| Check | URL/Command | Interval |
|-------|------------|----------|
| HTTP Health | `http://All nodes:PORT/health` | 30s |
| Process | `systemctl is-active tollbooth` | 60s |
| NATS Heartbeat | `blackroad.tollbooth.heartbeat` | 60s |

## Memory System Integration

```bash
# Log actions
~/blackroad-operator/scripts/memory/memory-system.sh log deploy tollbooth "Deployed to All nodes"

# Add solutions to Codex
~/blackroad-operator/scripts/memory/memory-codex.sh add-solution "tollbooth" "How to restart" \
  "sudo systemctl restart tollbooth"

# Broadcast learnings
~/blackroad-operator/scripts/memory/memory-til-broadcast.sh broadcast "tollbooth" "Config change: ..."
```

## Related Components

| Component | Role | Connection |
|-----------|------|-----------|
| **TollBooth** (WireGuard) | VPN mesh | All traffic between nodes |
| **CarPool** (NATS) | Messaging | Event pub/sub on `blackroad.tollbooth.>` |
| **GuardRail** (Uptime Kuma) | Monitoring | Health checks every 30s |
| **RoadMem** (Mem0) | Memory | Persistent agent state |
| **OneWay** (Caddy) | TLS Edge | HTTPS termination on Gematria |
| **RearView** (Qdrant) | Vector Search | Semantic search over tollbooth logs |
| **BackRoad** (Portainer) | Containers | Docker management if containerized |
| **PitStop** (Pi-hole) | DNS | Internal `tollbooth.blackroad.local` resolution |
