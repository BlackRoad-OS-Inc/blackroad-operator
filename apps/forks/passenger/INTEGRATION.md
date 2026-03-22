# INTEGRATION — passenger

> How this fork connects to the rest of BlackRoad OS

## Node Assignment

| Property | Value |
|----------|-------|
| **Primary Node** | Cecilia/Octavia/Lucidia |
| **Fork Of** | Ollama |
| **RoundTrip Agent** | Passenger Agent |
| **NLP Intents** | 'ask AI' / 'generate' / 'infer' |
| **NATS Subject** | `blackroad.passenger.>` |
| **GuardRail Monitor** | `https://guard.blackroad.io/status/passenger` |

## Deployment

Deploy via blackroad-operator:

```bash
# From blackroad-operator
cd ~/blackroad-operator
./scripts/deploy/deploy-passenger.sh

# Or via fleet coordinator
./fleet-coordinator.sh deploy passenger

# Manual deploy to Cecilia/Octavia/Lucidia
ssh blackroad@$(echo "Cecilia/Octavia/Lucidia" | grep -oP '[0-9.]+' || echo "Cecilia/Octavia/Lucidia") \
  "cd /opt/blackroad/passenger && git pull && sudo systemctl restart passenger"
```

## Systemd Service

```ini
[Unit]
Description=BlackRoad passenger (Ollama fork)
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=blackroad
WorkingDirectory=/opt/blackroad/passenger
ExecStart=/opt/blackroad/passenger/start.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## NATS Integration (CarPool)

```bash
# Subscribe to passenger events
nats sub "blackroad.passenger.>" --server nats://192.168.4.101:4222

# Publish status
nats pub "blackroad.passenger.status" '{"node":"Cecilia/Octavia/Lucidia","status":"running"}' \
  --server nats://192.168.4.101:4222
```

## RoundTrip Agent

The **Passenger Agent** manages this service via RoundTrip:

```bash
# Check agent status
curl -s https://roundtrip.blackroad.io/api/agents | jq '.[] | select(.name=="Passenger Agent")'

# Send command to agent
curl -X POST https://roundtrip.blackroad.io/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"agent":"Passenger Agent","message":"status","channel":"fleet"}'
```

## GuardRail Monitoring

Add to Uptime Kuma (Alice :3001):

| Check | URL/Command | Interval |
|-------|------------|----------|
| HTTP Health | `http://Cecilia/Octavia/Lucidia:PORT/health` | 30s |
| Process | `systemctl is-active passenger` | 60s |
| NATS Heartbeat | `blackroad.passenger.heartbeat` | 60s |

## Memory System Integration

```bash
# Log actions
~/blackroad-operator/scripts/memory/memory-system.sh log deploy passenger "Deployed to Cecilia/Octavia/Lucidia"

# Add solutions to Codex
~/blackroad-operator/scripts/memory/memory-codex.sh add-solution "passenger" "How to restart" \
  "sudo systemctl restart passenger"

# Broadcast learnings
~/blackroad-operator/scripts/memory/memory-til-broadcast.sh broadcast "passenger" "Config change: ..."
```

## Related Components

| Component | Role | Connection |
|-----------|------|-----------|
| **TollBooth** (WireGuard) | VPN mesh | All traffic between nodes |
| **CarPool** (NATS) | Messaging | Event pub/sub on `blackroad.passenger.>` |
| **GuardRail** (Uptime Kuma) | Monitoring | Health checks every 30s |
| **RoadMem** (Mem0) | Memory | Persistent agent state |
| **OneWay** (Caddy) | TLS Edge | HTTPS termination on Gematria |
| **RearView** (Qdrant) | Vector Search | Semantic search over passenger logs |
| **BackRoad** (Portainer) | Containers | Docker management if containerized |
| **PitStop** (Pi-hole) | DNS | Internal `passenger.blackroad.local` resolution |
