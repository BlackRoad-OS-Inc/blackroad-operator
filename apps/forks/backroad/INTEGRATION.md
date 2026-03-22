# INTEGRATION — backroad

> How this fork connects to the rest of BlackRoad OS

## Node Assignment

| Property | Value |
|----------|-------|
| **Primary Node** | Aria (.98) |
| **Fork Of** | Portainer CE |
| **RoundTrip Agent** | BackRoad Agent |
| **NLP Intents** | 'manage containers' / 'docker status' |
| **NATS Subject** | `blackroad.backroad.>` |
| **GuardRail Monitor** | `https://guard.blackroad.io/status/backroad` |

## Deployment

Deploy via blackroad-operator:

```bash
# From blackroad-operator
cd ~/blackroad-operator
./scripts/deploy/deploy-backroad.sh

# Or via fleet coordinator
./fleet-coordinator.sh deploy backroad

# Manual deploy to Aria (.98)
ssh blackroad@$(echo "Aria (.98)" | grep -oP '[0-9.]+' || echo "Aria (.98)") \
  "cd /opt/blackroad/backroad && git pull && sudo systemctl restart backroad"
```

## Systemd Service

```ini
[Unit]
Description=BlackRoad backroad (Portainer CE fork)
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=blackroad
WorkingDirectory=/opt/blackroad/backroad
ExecStart=/opt/blackroad/backroad/start.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## NATS Integration (CarPool)

```bash
# Subscribe to backroad events
nats sub "blackroad.backroad.>" --server nats://192.168.4.101:4222

# Publish status
nats pub "blackroad.backroad.status" '{"node":"Aria (.98)","status":"running"}' \
  --server nats://192.168.4.101:4222
```

## RoundTrip Agent

The **BackRoad Agent** manages this service via RoundTrip:

```bash
# Check agent status
curl -s https://roundtrip.blackroad.io/api/agents | jq '.[] | select(.name=="BackRoad Agent")'

# Send command to agent
curl -X POST https://roundtrip.blackroad.io/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"agent":"BackRoad Agent","message":"status","channel":"fleet"}'
```

## GuardRail Monitoring

Add to Uptime Kuma (Alice :3001):

| Check | URL/Command | Interval |
|-------|------------|----------|
| HTTP Health | `http://Aria (.98):PORT/health` | 30s |
| Process | `systemctl is-active backroad` | 60s |
| NATS Heartbeat | `blackroad.backroad.heartbeat` | 60s |

## Memory System Integration

```bash
# Log actions
~/blackroad-operator/scripts/memory/memory-system.sh log deploy backroad "Deployed to Aria (.98)"

# Add solutions to Codex
~/blackroad-operator/scripts/memory/memory-codex.sh add-solution "backroad" "How to restart" \
  "sudo systemctl restart backroad"

# Broadcast learnings
~/blackroad-operator/scripts/memory/memory-til-broadcast.sh broadcast "backroad" "Config change: ..."
```

## Related Components

| Component | Role | Connection |
|-----------|------|-----------|
| **TollBooth** (WireGuard) | VPN mesh | All traffic between nodes |
| **CarPool** (NATS) | Messaging | Event pub/sub on `blackroad.backroad.>` |
| **GuardRail** (Uptime Kuma) | Monitoring | Health checks every 30s |
| **RoadMem** (Mem0) | Memory | Persistent agent state |
| **OneWay** (Caddy) | TLS Edge | HTTPS termination on Gematria |
| **RearView** (Qdrant) | Vector Search | Semantic search over backroad logs |
| **BackRoad** (Portainer) | Containers | Docker management if containerized |
| **PitStop** (Pi-hole) | DNS | Internal `backroad.blackroad.local` resolution |
