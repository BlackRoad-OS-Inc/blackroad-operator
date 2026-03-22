#!/bin/bash
# ============================================================================
# BLACKROAD OS — Agent & Device Registry
# Single source of truth for all agents, devices, and services
# Usage: br-registry.sh <command> [args]
# ============================================================================

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
CYAN='\033[0;36m'
RED='\033[38;5;196m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

DB="$HOME/.blackroad/registry.db"

sql() { sqlite3 "$DB" "$@"; }

# ── INIT ──
cmd_init() {
    mkdir -p "$(dirname "$DB")"
    sqlite3 "$DB" <<'SQL'
PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS agents (
    agent_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT,
    type TEXT DEFAULT 'worker',
    model TEXT,
    host TEXT,
    port INTEGER DEFAULT 0,
    color TEXT,
    personality TEXT,
    skills TEXT DEFAULT '[]',
    status TEXT DEFAULT 'idle',
    registered_at TEXT NOT NULL,
    last_seen TEXT,
    metadata TEXT DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS devices (
    device_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'unknown',
    ip TEXT,
    mac TEXT,
    hostname TEXT,
    os TEXT,
    cpu TEXT,
    ram_mb INTEGER DEFAULT 0,
    storage_gb INTEGER DEFAULT 0,
    gpu TEXT,
    services TEXT DEFAULT '[]',
    ssh_user TEXT,
    ssh_port INTEGER DEFAULT 22,
    wireguard_ip TEXT,
    status TEXT DEFAULT 'unknown',
    registered_at TEXT NOT NULL,
    last_seen TEXT,
    metadata TEXT DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS services (
    service_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    device_id TEXT,
    port INTEGER,
    protocol TEXT DEFAULT 'http',
    path TEXT DEFAULT '/',
    status TEXT DEFAULT 'unknown',
    health_url TEXT,
    registered_at TEXT NOT NULL,
    last_checked TEXT,
    metadata TEXT DEFAULT '{}',
    FOREIGN KEY (device_id) REFERENCES devices(device_id)
);

CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_services_device ON services(device_id);
SQL
    echo -e "${GREEN}Registry initialized at ${DB}${NC}"
}

check_db() { [[ -f "$DB" ]] || cmd_init; }

# ── AGENT COMMANDS ──

cmd_agent_add() {
    check_db
    local name="$1" role="$2" model="$3" host="$4"
    if [[ -z "$name" ]]; then
        echo -e "${RED}Usage: $0 agent-add <name> [role] [model] [host]${NC}"
        return 1
    fi
    local id=$(echo "$name" | tr '[:upper:]' '[:lower:]')
    local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local email="${id}@blackroad.io"

    sql "INSERT OR REPLACE INTO agents (agent_id, name, email, role, model, host, registered_at, last_seen)
         VALUES ('$id', '$name', '$email', '${role:-worker}', '${model:-}', '${host:-}', '$now', '$now');"
    echo -e "${GREEN}Agent registered:${NC} ${CYAN}${name}${NC} (${role:-worker})"
}

cmd_agent_list() {
    check_db
    echo -e "${PINK}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}Agent Registry${NC}                                       ${PINK}║${NC}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""

    local agents
    agents=$(sql "SELECT agent_id, name, role, model, host, status FROM agents ORDER BY name;")
    if [[ -z "$agents" ]]; then
        echo -e "  ${AMBER}No agents registered${NC}"
        return
    fi

    printf "  ${BOLD}%-15s %-20s %-15s %-15s %-8s${NC}\n" "NAME" "ROLE" "MODEL" "HOST" "STATUS"
    echo -e "  ${DIM}──────────────────────────────────────────────────────────────────${NC}"

    while IFS='|' read -r id name role model host status; do
        local color="${GREEN}"
        [[ "$status" == "offline" ]] && color="${RED}"
        [[ "$status" == "idle" ]] && color="${AMBER}"
        printf "  ${CYAN}%-15s${NC} %-20s %-15s %-15s ${color}%-8s${NC}\n" "$name" "${role:-—}" "${model:-—}" "${host:-—}" "${status:-idle}"
    done <<< "$agents"

    local count=$(sql "SELECT count(*) FROM agents;")
    echo ""
    echo -e "  ${DIM}Total: ${count} agents${NC}"
}

cmd_agent_status() {
    check_db
    local id="$1"
    if [[ -z "$id" ]]; then
        # Quick overview
        local total=$(sql "SELECT count(*) FROM agents;")
        local online=$(sql "SELECT count(*) FROM agents WHERE status='online';")
        local idle=$(sql "SELECT count(*) FROM agents WHERE status='idle';")
        echo -e "${GREEN}${online}${NC} online | ${AMBER}${idle}${NC} idle | ${BLUE}${total}${NC} total"
        return
    fi
    sql "SELECT * FROM agents WHERE agent_id='$id';" -json 2>/dev/null | python3 -c "
import json,sys
agents = json.load(sys.stdin)
for a in agents:
    for k,v in a.items():
        print(f'  {k:15s}: {v}')
" 2>/dev/null
}

# ── DEVICE COMMANDS ──

cmd_device_add() {
    check_db
    local name="$1" ip="$2" type="$3"
    if [[ -z "$name" || -z "$ip" ]]; then
        echo -e "${RED}Usage: $0 device-add <name> <ip> [type]${NC}"
        return 1
    fi
    local id=$(echo "$name" | tr '[:upper:]' '[:lower:]')
    local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    sql "INSERT OR REPLACE INTO devices (device_id, name, ip, type, registered_at, last_seen)
         VALUES ('$id', '$name', '$ip', '${type:-pi}', '$now', '$now');"
    echo -e "${GREEN}Device registered:${NC} ${CYAN}${name}${NC} @ ${ip}"
}

cmd_device_list() {
    check_db
    echo -e "${PINK}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}Device Registry${NC}                                      ${PINK}║${NC}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""

    local devices
    devices=$(sql "SELECT device_id, name, type, ip, wireguard_ip, status, ssh_user FROM devices ORDER BY name;")
    if [[ -z "$devices" ]]; then
        echo -e "  ${AMBER}No devices registered${NC}"
        return
    fi

    printf "  ${BOLD}%-12s %-8s %-16s %-14s %-8s %-8s${NC}\n" "NAME" "TYPE" "IP" "WG IP" "STATUS" "SSH"
    echo -e "  ${DIM}──────────────────────────────────────────────────────────────────${NC}"

    while IFS='|' read -r id name type ip wg status ssh_user; do
        local color="${GREEN}"
        [[ "$status" == "offline" ]] && color="${RED}"
        [[ "$status" == "unknown" ]] && color="${AMBER}"
        printf "  ${CYAN}%-12s${NC} %-8s %-16s %-14s ${color}%-8s${NC} %-8s\n" "$name" "${type:-—}" "${ip:-—}" "${wg:-—}" "${status:-?}" "${ssh_user:-—}"
    done <<< "$devices"

    local count=$(sql "SELECT count(*) FROM devices;")
    echo ""
    echo -e "  ${DIM}Total: ${count} devices${NC}"
}

cmd_device_scan() {
    check_db
    echo -e "${BLUE}Scanning devices...${NC}"
    local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Scan all registered devices
    local devices
    devices=$(sql "SELECT device_id, ip, ssh_user FROM devices WHERE ip IS NOT NULL AND ip != '';")

    while IFS='|' read -r id ip ssh_user; do
        [[ -z "$id" ]] && continue
        echo -n "  $id ($ip)... "

        if ping -c1 -W2 "$ip" >/dev/null 2>&1; then
            sql "UPDATE devices SET status='online', last_seen='$now' WHERE device_id='$id';"
            echo -e "${GREEN}online${NC}"

            # Try SSH for more info
            if [[ -n "$ssh_user" ]]; then
                local info
                info=$(ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no "${ssh_user}@${ip}" "
                    echo \"cpu=\$(nproc)\"
                    echo \"ram=\$(free -m | awk '/^Mem:/{print \$2}')\"
                    echo \"disk=\$(df -BG / | awk 'NR==2{print \$2}' | tr -d 'G')\"
                    echo \"os=\$(cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d= -f2 | tr -d '\"')\"
                    echo \"hostname=\$(hostname)\"
                    echo \"uptime=\$(uptime -p 2>/dev/null || uptime)\"
                " 2>/dev/null)

                if [[ -n "$info" ]]; then
                    local cpu=$(echo "$info" | grep "^cpu=" | cut -d= -f2)
                    local ram=$(echo "$info" | grep "^ram=" | cut -d= -f2)
                    local disk=$(echo "$info" | grep "^disk=" | cut -d= -f2)
                    local os_name=$(echo "$info" | grep "^os=" | cut -d= -f2-)
                    local hostname=$(echo "$info" | grep "^hostname=" | cut -d= -f2)

                    sql "UPDATE devices SET cpu='${cpu} cores', ram_mb=${ram:-0}, storage_gb=${disk:-0}, os='$(echo "$os_name" | sed "s/'/''/g")', hostname='$hostname' WHERE device_id='$id';" 2>/dev/null
                    echo -e "    ${DIM}${cpu} cores, ${ram}MB RAM, ${disk}GB disk, ${os_name}${NC}"
                fi
            fi
        else
            sql "UPDATE devices SET status='offline' WHERE device_id='$id';"
            echo -e "${RED}offline${NC}"
        fi
    done <<< "$devices"
}

# ── SERVICE COMMANDS ──

cmd_service_add() {
    check_db
    local name="$1" device="$2" port="$3"
    if [[ -z "$name" || -z "$device" || -z "$port" ]]; then
        echo -e "${RED}Usage: $0 service-add <name> <device-id> <port>${NC}"
        return 1
    fi
    local id="${device}-${name}"
    local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    sql "INSERT OR REPLACE INTO services (service_id, name, device_id, port, registered_at)
         VALUES ('$id', '$name', '$device', $port, '$now');"
    echo -e "${GREEN}Service registered:${NC} ${CYAN}${name}${NC} on ${device}:${port}"
}

cmd_service_list() {
    check_db
    echo -e "${PINK}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}Service Registry${NC}                                     ${PINK}║${NC}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""

    local services
    services=$(sql "SELECT s.name, d.name, s.port, s.status FROM services s LEFT JOIN devices d ON s.device_id=d.device_id ORDER BY d.name, s.port;")
    if [[ -z "$services" ]]; then
        echo -e "  ${AMBER}No services registered${NC}"
        return
    fi

    printf "  ${BOLD}%-20s %-12s %-8s %-8s${NC}\n" "SERVICE" "DEVICE" "PORT" "STATUS"
    echo -e "  ${DIM}──────────────────────────────────────────────────────────${NC}"

    while IFS='|' read -r sname dname port status; do
        local color="${GREEN}"
        [[ "$status" == "down" ]] && color="${RED}"
        [[ "$status" == "unknown" ]] && color="${AMBER}"
        printf "  %-20s ${CYAN}%-12s${NC} %-8s ${color}%-8s${NC}\n" "$sname" "${dname:-—}" ":${port}" "${status:-?}"
    done <<< "$services"
}

# ── SEED (populate with known infrastructure) ──

cmd_seed() {
    check_db
    echo -e "${BLUE}Seeding registry with known infrastructure...${NC}"
    local now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Devices
    sql "INSERT OR REPLACE INTO devices (device_id, name, type, ip, wireguard_ip, ssh_user, ssh_port, status, registered_at, last_seen) VALUES
        ('alice', 'Alice', 'pi400', '192.168.4.49', '10.8.0.6', 'pi', 22, 'unknown', '$now', '$now'),
        ('cecilia', 'Cecilia', 'pi5', '192.168.4.96', '10.8.0.3', 'blackroad', 22, 'unknown', '$now', '$now'),
        ('octavia', 'Octavia', 'pi5', '192.168.4.101', '10.8.0.4', 'pi', 22, 'unknown', '$now', '$now'),
        ('aria', 'Aria', 'pi5', '192.168.4.98', '', 'blackroad', 22, 'unknown', '$now', '$now'),
        ('lucidia', 'Lucidia', 'pi5', '192.168.4.38', '10.8.0.5', 'blackroad', 22, 'unknown', '$now', '$now'),
        ('gematria', 'Gematria', 'droplet', '159.65.43.12', '10.8.0.8', 'root', 22, 'unknown', '$now', '$now'),
        ('anastasia', 'Anastasia', 'droplet', '174.138.44.45', '', 'root', 22, 'unknown', '$now', '$now'),
        ('alexandria', 'Alexandria', 'mac', '192.168.4.28', '', 'alexa', 22, 'unknown', '$now', '$now');"

    echo -e "  ${GREEN}8 devices${NC}"

    # Agents (62 from RoundTrip + core 5)
    local core_agents=(
        "lucidia|LUCIDIA|The Dreamer|reasoning|qwen3:8b|192.168.4.38|#0af"
        "cecilia|CECILIA|Meta-Cognitive Core|identity|qwen2.5:3b|192.168.4.96|#a855f7"
        "alice|ALICE|The Operator|worker|llama3.2:3b|192.168.4.49|#22c55e"
        "octavia|OCTAVIA|The Architect|architect|qwen2.5:7b|192.168.4.101|#f59e0b"
        "aria|ARIA|The Interface|frontend|tinyllama|192.168.4.98|#3b82f6"
        "shellfish|SHELLFISH|The Hacker|security|codellama:7b|192.168.4.96|#ef4444"
        "hestia|HESTIA|Network Welcome|network|tinyllama|192.168.4.49|#f97316"
        "caddy|CADDY|TLS Edge|infra|none|159.65.43.12|#00D4FF"
        "road|ROAD|Fleet Commander|orchestrator|qwen2.5:3b|192.168.4.101|#CC00AA"
        "alexa|ALEXA|Founder Agent|human|claude|192.168.4.28|#FF6B2B"
    )

    for entry in "${core_agents[@]}"; do
        IFS='|' read -r id name role type model host color <<< "$entry"
        sql "INSERT OR REPLACE INTO agents (agent_id, name, email, role, type, model, host, color, status, registered_at, last_seen) VALUES
            ('$id', '$name', '${id}@blackroad.io', '$role', '$type', '$model', '$host', '$color', 'idle', '$now', '$now');"
    done
    echo -e "  ${GREEN}10 core agents${NC}"

    # Services
    sql "INSERT OR REPLACE INTO services (service_id, name, device_id, port, protocol, status, registered_at) VALUES
        ('alice-pihole', 'Pi-hole', 'alice', 8053, 'http', 'unknown', '$now'),
        ('alice-postgres', 'PostgreSQL', 'alice', 5432, 'tcp', 'unknown', '$now'),
        ('alice-redis', 'Redis', 'alice', 6379, 'tcp', 'unknown', '$now'),
        ('alice-qdrant', 'Qdrant', 'alice', 6333, 'http', 'unknown', '$now'),
        ('alice-nginx', 'nginx', 'alice', 80, 'http', 'unknown', '$now'),
        ('cecilia-ollama', 'Ollama', 'cecilia', 11434, 'http', 'unknown', '$now'),
        ('cecilia-minio', 'MinIO', 'cecilia', 9000, 'http', 'unknown', '$now'),
        ('cecilia-postgres', 'PostgreSQL', 'cecilia', 5432, 'tcp', 'unknown', '$now'),
        ('octavia-gitea', 'RoadCode', 'octavia', 3100, 'http', 'unknown', '$now'),
        ('octavia-nats', 'NATS', 'octavia', 4222, 'tcp', 'unknown', '$now'),
        ('octavia-docker', 'Docker', 'octavia', 2375, 'tcp', 'unknown', '$now'),
        ('octavia-roundtrip', 'RoundTrip', 'octavia', 9016, 'http', 'unknown', '$now'),
        ('octavia-paas', 'PaaS', 'octavia', 3500, 'http', 'unknown', '$now'),
        ('lucidia-nginx', 'nginx', 'lucidia', 80, 'http', 'unknown', '$now'),
        ('lucidia-ollama', 'Ollama', 'lucidia', 11434, 'http', 'unknown', '$now'),
        ('lucidia-pdns', 'PowerDNS', 'lucidia', 53, 'udp', 'unknown', '$now'),
        ('gematria-caddy', 'Caddy', 'gematria', 443, 'https', 'unknown', '$now'),
        ('gematria-ollama', 'Ollama', 'gematria', 11434, 'http', 'unknown', '$now'),
        ('gematria-pdns', 'PowerDNS', 'gematria', 53, 'udp', 'unknown', '$now'),
        ('anastasia-pdns', 'PowerDNS', 'anastasia', 53, 'udp', 'unknown', '$now');"

    echo -e "  ${GREEN}20 services${NC}"
    echo ""
    echo -e "${GREEN}Registry seeded.${NC} Run ${CYAN}$0 device-scan${NC} to check live status."
}

# ── DASHBOARD ──

cmd_dashboard() {
    check_db

    echo -e "${PINK}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}BlackRoad Fleet Dashboard${NC}                              ${PINK}║${NC}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""

    local dev_total=$(sql "SELECT count(*) FROM devices;")
    local dev_online=$(sql "SELECT count(*) FROM devices WHERE status='online';")
    local agent_total=$(sql "SELECT count(*) FROM agents;")
    local svc_total=$(sql "SELECT count(*) FROM services;")

    echo -e "  ${BOLD}Devices:${NC}  ${GREEN}${dev_online}${NC}/${dev_total} online"
    echo -e "  ${BOLD}Agents:${NC}   ${BLUE}${agent_total}${NC}"
    echo -e "  ${BOLD}Services:${NC} ${VIOLET}${svc_total}${NC}"
    echo ""

    # Devices with services
    local devices
    devices=$(sql "SELECT d.name, d.ip, d.status, d.type, GROUP_CONCAT(s.name || ':' || s.port, ', ') FROM devices d LEFT JOIN services s ON d.device_id=s.device_id GROUP BY d.device_id ORDER BY d.name;")

    while IFS='|' read -r name ip status type services; do
        [[ -z "$name" ]] && continue
        local color="${GREEN}"
        [[ "$status" == "offline" ]] && color="${RED}"
        [[ "$status" == "unknown" ]] && color="${AMBER}"
        echo -e "  ${color}●${NC} ${BOLD}${name}${NC} ${DIM}(${type})${NC} — ${ip}"
        [[ -n "$services" ]] && echo -e "    ${DIM}${services}${NC}"
    done <<< "$devices"
}

# ── HELP ──
cmd_help() {
    cat << EOF
${PINK}╔══════════════════════════════════════════════════════════╗${NC}
${PINK}║${NC}  ${BOLD}BlackRoad Agent & Device Registry${NC}                     ${PINK}║${NC}
${PINK}╚══════════════════════════════════════════════════════════╝${NC}

${BOLD}Agents:${NC}
  ${CYAN}agent-add <name> [role] [model] [host]${NC}  Register an agent
  ${CYAN}agent-list${NC}                              List all agents
  ${CYAN}agent-status [id]${NC}                       Agent status

${BOLD}Devices:${NC}
  ${CYAN}device-add <name> <ip> [type]${NC}           Register a device
  ${CYAN}device-list${NC}                             List all devices
  ${CYAN}device-scan${NC}                             Ping + SSH scan all devices

${BOLD}Services:${NC}
  ${CYAN}service-add <name> <device> <port>${NC}      Register a service
  ${CYAN}service-list${NC}                            List all services

${BOLD}System:${NC}
  ${CYAN}seed${NC}                                    Populate with known infrastructure
  ${CYAN}dashboard${NC}                               Fleet overview
  ${CYAN}init${NC}                                    Initialize database
  ${CYAN}help${NC}                                    This help
EOF
}

# ── ROUTER ──
case "${1:-help}" in
    init)           cmd_init ;;
    seed)           cmd_seed ;;
    agent-add|aa)   shift; cmd_agent_add "$@" ;;
    agent-list|al)  cmd_agent_list ;;
    agent-status|as) shift; cmd_agent_status "$@" ;;
    device-add|da)  shift; cmd_device_add "$@" ;;
    device-list|dl) cmd_device_list ;;
    device-scan|ds) cmd_device_scan ;;
    service-add|sa) shift; cmd_service_add "$@" ;;
    service-list|sl) cmd_service_list ;;
    dashboard|d)    cmd_dashboard ;;
    help|--help|-h) cmd_help ;;
    *) echo -e "${RED}Unknown: $1${NC}"; cmd_help; exit 1 ;;
esac
