# INTEGRATION — curb

> How this fork connects to the rest of BlackRoad OS

## Node Assignment

| Property | Value |
|----------|-------|
| **Primary Node** | Cecilia (.96) |
| **Fork Of** | MinIO |
| **RoundTrip Agent** | Curb Agent |
| **NLP Intents** | 'store file' / 'get asset' |
| **NATS Subject** | `blackroad.curb.>` |
| **GuardRail Monitor** | `https://guard.blackroad.io/status/curb` |

## Deployment

Deploy via blackroad-operator:

```bash
# From blackroad-operator
cd ~/blackroad-operator
./scripts/deploy/deploy-curb.sh

# Or via fleet coordinator
./fleet-coordinator.sh deploy curb

# Manual deploy to Cecilia (.96)
ssh blackroad@$(echo "Cecilia (.96)" | grep -oP '[0-9.]+' || echo "Cecilia (.96)") \
  "cd /opt/blackroad/curb && git pull && sudo systemctl restart curb"
```

## Systemd Service

```ini
[Unit]
Description=BlackRoad curb (MinIO fork)
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=blackroad
WorkingDirectory=/opt/blackroad/curb
ExecStart=/opt/blackroad/curb/start.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## NATS Integration (CarPool)

```bash
# Subscribe to curb events
nats sub "blackroad.curb.>" --server nats://192.168.4.101:4222

# Publish status
nats pub "blackroad.curb.status" '{"node":"Cecilia (.96)","status":"running"}' \
  --server nats://192.168.4.101:4222
```

## RoundTrip Agent

The **Curb Agent** manages this service via RoundTrip:

```bash
# Check agent status
curl -s https://roundtrip.blackroad.io/api/agents | jq '.[] | select(.name=="Curb Agent")'

# Send command to agent
curl -X POST https://roundtrip.blackroad.io/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"agent":"Curb Agent","message":"status","channel":"fleet"}'
```

## GuardRail Monitoring

Add to Uptime Kuma (Alice :3001):

| Check | URL/Command | Interval |
|-------|------------|----------|
| HTTP Health | `http://Cecilia (.96):PORT/health` | 30s |
| Process | `systemctl is-active curb` | 60s |
| NATS Heartbeat | `blackroad.curb.heartbeat` | 60s |

## Memory System Integration

```bash
# Log actions
~/blackroad-operator/scripts/memory/memory-system.sh log deploy curb "Deployed to Cecilia (.96)"

# Add solutions to Codex
~/blackroad-operator/scripts/memory/memory-codex.sh add-solution "curb" "How to restart" \
  "sudo systemctl restart curb"

# Broadcast learnings
~/blackroad-operator/scripts/memory/memory-til-broadcast.sh broadcast "curb" "Config change: ..."
```

## Related Components

| Component | Role | Connection |
|-----------|------|-----------|
| **TollBooth** (WireGuard) | VPN mesh | All traffic between nodes |
| **CarPool** (NATS) | Messaging | Event pub/sub on `blackroad.curb.>` |
| **GuardRail** (Uptime Kuma) | Monitoring | Health checks every 30s |
| **RoadMem** (Mem0) | Memory | Persistent agent state |
| **OneWay** (Caddy) | TLS Edge | HTTPS termination on Gematria |
| **RearView** (Qdrant) | Vector Search | Semantic search over curb logs |
| **BackRoad** (Portainer) | Containers | Docker management if containerized |
| **PitStop** (Pi-hole) | DNS | Internal `curb.blackroad.local` resolution |
