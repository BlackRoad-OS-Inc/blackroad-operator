# INTEGRATION — overpass

> How this fork connects to the rest of BlackRoad OS

## Node Assignment

| Property | Value |
|----------|-------|
| **Primary Node** | Octavia (.101) |
| **Fork Of** | n8n |
| **RoundTrip Agent** | OverPass Agent |
| **NLP Intents** | 'run workflow' / 'automate' |
| **NATS Subject** | `blackroad.overpass.>` |
| **GuardRail Monitor** | `https://guard.blackroad.io/status/overpass` |

## Deployment

Deploy via blackroad-operator:

```bash
# From blackroad-operator
cd ~/blackroad-operator
./scripts/deploy/deploy-overpass.sh

# Or via fleet coordinator
./fleet-coordinator.sh deploy overpass

# Manual deploy to Octavia (.101)
ssh blackroad@$(echo "Octavia (.101)" | grep -oP '[0-9.]+' || echo "Octavia (.101)") \
  "cd /opt/blackroad/overpass && git pull && sudo systemctl restart overpass"
```

## Systemd Service

```ini
[Unit]
Description=BlackRoad overpass (n8n fork)
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=blackroad
WorkingDirectory=/opt/blackroad/overpass
ExecStart=/opt/blackroad/overpass/start.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## NATS Integration (CarPool)

```bash
# Subscribe to overpass events
nats sub "blackroad.overpass.>" --server nats://192.168.4.101:4222

# Publish status
nats pub "blackroad.overpass.status" '{"node":"Octavia (.101)","status":"running"}' \
  --server nats://192.168.4.101:4222
```

## RoundTrip Agent

The **OverPass Agent** manages this service via RoundTrip:

```bash
# Check agent status
curl -s https://roundtrip.blackroad.io/api/agents | jq '.[] | select(.name=="OverPass Agent")'

# Send command to agent
curl -X POST https://roundtrip.blackroad.io/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"agent":"OverPass Agent","message":"status","channel":"fleet"}'
```

## GuardRail Monitoring

Add to Uptime Kuma (Alice :3001):

| Check | URL/Command | Interval |
|-------|------------|----------|
| HTTP Health | `http://Octavia (.101):PORT/health` | 30s |
| Process | `systemctl is-active overpass` | 60s |
| NATS Heartbeat | `blackroad.overpass.heartbeat` | 60s |

## Memory System Integration

```bash
# Log actions
~/blackroad-operator/scripts/memory/memory-system.sh log deploy overpass "Deployed to Octavia (.101)"

# Add solutions to Codex
~/blackroad-operator/scripts/memory/memory-codex.sh add-solution "overpass" "How to restart" \
  "sudo systemctl restart overpass"

# Broadcast learnings
~/blackroad-operator/scripts/memory/memory-til-broadcast.sh broadcast "overpass" "Config change: ..."
```

## Related Components

| Component | Role | Connection |
|-----------|------|-----------|
| **TollBooth** (WireGuard) | VPN mesh | All traffic between nodes |
| **CarPool** (NATS) | Messaging | Event pub/sub on `blackroad.overpass.>` |
| **GuardRail** (Uptime Kuma) | Monitoring | Health checks every 30s |
| **RoadMem** (Mem0) | Memory | Persistent agent state |
| **OneWay** (Caddy) | TLS Edge | HTTPS termination on Gematria |
| **RearView** (Qdrant) | Vector Search | Semantic search over overpass logs |
| **BackRoad** (Portainer) | Containers | Docker management if containerized |
| **PitStop** (Pi-hole) | DNS | Internal `overpass.blackroad.local` resolution |
