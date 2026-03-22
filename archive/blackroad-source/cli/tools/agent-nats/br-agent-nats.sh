#!/bin/zsh
# BR NATS — Agent Pub/Sub Coordination
# NATS v2.12.3 running on Octavia (Docker Swarm) with JetStream

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
DIM='\033[2m'
NC='\033[0m'

NATS_HOST="${NATS_HOST:-192.168.4.101}"
NATS_HTTP="http://${NATS_HOST}:8222"

case "${1:-help}" in
  status)
    echo -e "${PINK}NATS Status${NC}"
    curl -s "$NATS_HTTP/varz" 2>/dev/null | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(f'  Server:      {d.get(\"server_name\",\"?\")} v{d.get(\"version\",\"?\")}')
print(f'  Uptime:      {d.get(\"uptime\",\"?\")}')
print(f'  Connections: {d.get(\"connections\",0)}')
print(f'  Msgs In/Out: {d.get(\"in_msgs\",0)} / {d.get(\"out_msgs\",0)}')
js = d.get('jetstream',{}).get('config',{})
print(f'  JetStream:   {\"enabled\" if js else \"disabled\"}')" 2>/dev/null || echo -e "  ${AMBER}NATS unreachable${NC}"
    echo -e "  ${DIM}nats://${NATS_HOST}:4222 | ${NATS_HTTP}${NC}"
    ;;
  conns)
    curl -s "$NATS_HTTP/connz" 2>/dev/null | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(f'Connections: {d.get(\"num_connections\",0)}')
for c in d.get('connections',[]): print(f'  {c.get(\"name\",\"?\"):20s} {c.get(\"ip\",\"?\")}  in={c.get(\"in_msgs\",0)} out={c.get(\"out_msgs\",0)}')" 2>/dev/null
    ;;
  streams)
    curl -s "$NATS_HTTP/jsz" 2>/dev/null | python3 -c "
import json,sys; d=json.load(sys.stdin)
print(f'Streams: {d.get(\"streams\",0)}, Consumers: {d.get(\"consumers\",0)}')" 2>/dev/null
    ;;
  *)
    echo -e "${PINK}BR NATS${NC} — Agent Pub/Sub"
    echo "  status    Server status"
    echo "  conns     Active connections"
    echo "  streams   JetStream streams"
    echo -e "  ${DIM}BlackRoad OS — Pave Tomorrow.${NC}"
    ;;
esac
