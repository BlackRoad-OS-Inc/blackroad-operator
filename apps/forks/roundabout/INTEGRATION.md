# INTEGRATION — roundabout

> How this fork connects to the rest of BlackRoad OS

## Node Assignment

| Property | Value |
|----------|-------|
| **Primary Node** | Anastasia (DO nyc1) |
| **Fork Of** | Headscale |
| **RoundTrip Agent** | RoundAbout Agent |
| **NLP Intents** | 'vpn status' / 'add node' |
| **NATS Subject** | `blackroad.roundabout.>` |
| **GuardRail Monitor** | `https://guard.blackroad.io/status/roundabout` |

## Deployment

Deploy via blackroad-operator:

```bash
# From blackroad-operator
cd ~/blackroad-operator
./scripts/deploy/deploy-roundabout.sh

# Or via fleet coordinator
./fleet-coordinator.sh deploy roundabout

# Manual deploy to Anastasia (DO nyc1)
ssh blackroad@$(echo "Anastasia (DO nyc1)" | grep -oP '[0-9.]+' || echo "Anastasia (DO nyc1)") \
  "cd /opt/blackroad/roundabout && git pull && sudo systemctl restart roundabout"
```

## Systemd Service

```ini
[Unit]
Description=BlackRoad roundabout (Headscale fork)
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=blackroad
WorkingDirectory=/opt/blackroad/roundabout
ExecStart=/opt/blackroad/roundabout/start.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## NATS Integration (CarPool)

```bash
# Subscribe to roundabout events
nats sub "blackroad.roundabout.>" --server nats://192.168.4.101:4222

# Publish status
nats pub "blackroad.roundabout.status" '{"node":"Anastasia (DO nyc1)","status":"running"}' \
  --server nats://192.168.4.101:4222
```

## RoundTrip Agent

The **RoundAbout Agent** manages this service via RoundTrip:

```bash
# Check agent status
curl -s https://roundtrip.blackroad.io/api/agents | jq '.[] | select(.name=="RoundAbout Agent")'

# Send command to agent
curl -X POST https://roundtrip.blackroad.io/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"agent":"RoundAbout Agent","message":"status","channel":"fleet"}'
```

## GuardRail Monitoring

Add to Uptime Kuma (Alice :3001):

| Check | URL/Command | Interval |
|-------|------------|----------|
| HTTP Health | `http://Anastasia (DO nyc1):PORT/health` | 30s |
| Process | `systemctl is-active roundabout` | 60s |
| NATS Heartbeat | `blackroad.roundabout.heartbeat` | 60s |

## Memory System Integration

```bash
# Log actions
~/blackroad-operator/scripts/memory/memory-system.sh log deploy roundabout "Deployed to Anastasia (DO nyc1)"

# Add solutions to Codex
~/blackroad-operator/scripts/memory/memory-codex.sh add-solution "roundabout" "How to restart" \
  "sudo systemctl restart roundabout"

# Broadcast learnings
~/blackroad-operator/scripts/memory/memory-til-broadcast.sh broadcast "roundabout" "Config change: ..."
```

## Related Components

| Component | Role | Connection |
|-----------|------|-----------|
| **TollBooth** (WireGuard) | VPN mesh | All traffic between nodes |
| **CarPool** (NATS) | Messaging | Event pub/sub on `blackroad.roundabout.>` |
| **GuardRail** (Uptime Kuma) | Monitoring | Health checks every 30s |
| **RoadMem** (Mem0) | Memory | Persistent agent state |
| **OneWay** (Caddy) | TLS Edge | HTTPS termination on Gematria |
| **RearView** (Qdrant) | Vector Search | Semantic search over roundabout logs |
| **BackRoad** (Portainer) | Containers | Docker management if containerized |
| **PitStop** (Pi-hole) | DNS | Internal `roundabout.blackroad.local` resolution |
