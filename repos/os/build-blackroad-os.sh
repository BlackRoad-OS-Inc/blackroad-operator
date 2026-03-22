#!/usr/bin/env bash
set -euo pipefail

# BlackRoad OS v2.0 — Custom Raspberry Pi Image Builder
# Builds a flashable .img with ALL services pre-installed.
# Flash, boot, Pi auto-joins the fleet. Zero config.
#
# Usage:
#   sudo ./build-blackroad-os.sh [--target pi4|pi5] [--hostname <name>]
#                                [--role gateway|compute|worker|ai]
#                                [--workdir <path>]
#
# Requirements: Linux host with qemu-user-static, losetup, chroot
# Or run on a Pi itself for native ARM builds.

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
RESET='\033[0m'

# ── Defaults ─────────────────────────────────────────────────
TARGET="pi4"
HOSTNAME="blackroad-new"
ROLE="compute"
WORKDIR="$(pwd)/build"
VERSION="2.0.0"
BUILD_DATE=$(date +%Y.%m.%d)

# Base images
PI4_IMAGE_URL="https://downloads.raspberrypi.com/raspios_lite_arm64/images/raspios_lite_arm64-2024-11-19/2024-11-19-raspios-bookworm-arm64-lite.img.xz"
PI5_IMAGE_URL="https://downloads.raspberrypi.com/raspios_lite_arm64/images/raspios_lite_arm64-2024-11-19/2024-11-19-raspios-bookworm-arm64-lite.img.xz"

# Fleet network
FLEET_SUBNET="192.168.4"
GATEWAY_IP="${FLEET_SUBNET}.49"     # Alice
WG_ENDPOINT="gematria.blackroad.io:51820"

log()  { printf "${GREEN}[BUILD]${RESET} %s\n" "$*"; }
warn() { printf "${AMBER}[WARN]${RESET} %s\n" "$*"; }
err()  { printf "\033[31m[ERROR]\033[0m %s\n" "$*" >&2; }

# ── Parse Args ───────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)   shift; TARGET="$1" ;;
    --hostname) shift; HOSTNAME="$1" ;;
    --role)     shift; ROLE="$1" ;;
    --workdir)  shift; WORKDIR="$(realpath "$1")" ;;
    -h|--help)
      echo "Usage: sudo ./build-blackroad-os.sh [--target pi4|pi5] [--hostname <name>] [--role gateway|compute|worker|ai] [--workdir <path>]"
      exit 0 ;;
    *) err "Unknown: $1"; exit 1 ;;
  esac
  shift
done

IMAGE_URL="$PI4_IMAGE_URL"
[[ "$TARGET" == "pi5" ]] && IMAGE_URL="$PI5_IMAGE_URL"

ARCHIVE="${WORKDIR}/base.img.xz"
IMAGE="${WORKDIR}/base.img"
MOUNT_DIR="${WORKDIR}/mnt"
FINAL="${WORKDIR}/blackroad-os-${VERSION}-${TARGET}-${ROLE}.img"

# ── Preflight ────────────────────────────────────────────────
require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    err "Run with sudo: sudo ./build-blackroad-os.sh"
    exit 1
  fi
}

require_commands() {
  for cmd in wget xz losetup mount umount chroot; do
    command -v "$cmd" >/dev/null || { err "Missing: $cmd"; exit 1; }
  done
  # QEMU for cross-arch (if building on x86)
  if [[ "$(uname -m)" != "aarch64" ]]; then
    if ! command -v qemu-aarch64-static >/dev/null; then
      warn "Not on ARM64. Install qemu-user-static for cross-arch chroot."
      warn "  apt install qemu-user-static binfmt-support"
    fi
  fi
}

# ── Banner ───────────────────────────────────────────────────
banner() {
  echo ""
  echo -e "${PINK}BlackRoad OS v${VERSION} Image Builder${RESET}"
  echo -e "  Target: ${TARGET} | Role: ${ROLE} | Host: ${HOSTNAME}"
  echo ""
}

# ── Download & Prepare ───────────────────────────────────────
prepare() {
  mkdir -p "${WORKDIR}" "${MOUNT_DIR}"

  if [[ ! -f "$ARCHIVE" ]]; then
    log "Downloading Raspberry Pi OS Bookworm (arm64 lite)..."
    wget -O "$ARCHIVE" "$IMAGE_URL"
  fi

  if [[ ! -f "$IMAGE" ]]; then
    log "Decompressing..."
    xz -T0 -d -k "$ARCHIVE"
    mv "${WORKDIR}/$(basename "${IMAGE_URL%.xz}")" "$IMAGE" 2>/dev/null || true
  fi

  # Expand image to 8GB for our packages
  log "Expanding image to 8GB..."
  truncate -s 8G "$IMAGE"

  # Fix partition table
  LOOP=$(losetup -f --show -P "$IMAGE")
  log "Loop device: $LOOP"

  # Grow partition 2 to fill space
  parted -s "$LOOP" resizepart 2 100%
  e2fsck -f -y "${LOOP}p2" || true
  resize2fs "${LOOP}p2"

  # Mount
  mount "${LOOP}p2" "$MOUNT_DIR"
  mkdir -p "${MOUNT_DIR}/boot/firmware" 2>/dev/null || true
  mount "${LOOP}p1" "${MOUNT_DIR}/boot/firmware" 2>/dev/null || \
    mount "${LOOP}p1" "${MOUNT_DIR}/boot"

  # Bind system dirs
  mount -t proc /proc "${MOUNT_DIR}/proc"
  mount -t sysfs /sys "${MOUNT_DIR}/sys"
  mount --bind /dev "${MOUNT_DIR}/dev"
  mount --bind /dev/pts "${MOUNT_DIR}/dev/pts"
  cp /etc/resolv.conf "${MOUNT_DIR}/etc/resolv.conf"

  # QEMU binary for cross-arch
  if [[ "$(uname -m)" != "aarch64" ]] && [[ -f /usr/bin/qemu-aarch64-static ]]; then
    cp /usr/bin/qemu-aarch64-static "${MOUNT_DIR}/usr/bin/"
  fi
}

# ── Chroot Payload ───────────────────────────────────────────
write_payload() {
  log "Writing customization payload..."

  cat <<CHROOT > "${MOUNT_DIR}/root/customize.sh"
#!/bin/bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

log() { printf '\033[38;5;205m[BROS]\033[0m %s\n' "\$*"; }

HOSTNAME="${HOSTNAME}"
ROLE="${ROLE}"
VERSION="${VERSION}"
BUILD_DATE="${BUILD_DATE}"
FLEET_SUBNET="${FLEET_SUBNET}"
GATEWAY_IP="${GATEWAY_IP}"

# ── 1. System Update ────────────────────────────────────────
log "Updating base system..."
apt-get update
apt-get upgrade -y

# ── 2. Core Packages ────────────────────────────────────────
log "Installing core packages..."
apt-get install -y \
  git curl wget vim htop neofetch tmux zsh jq bc \
  build-essential python3 python3-pip python3-venv \
  nodejs npm \
  nginx certbot \
  docker.io docker-compose \
  wireguard wireguard-tools \
  sqlite3 \
  avahi-daemon avahi-utils \
  openssh-server \
  fail2ban ufw \
  tor \
  dnsutils net-tools nmap \
  cron logrotate \
  rsync \
  plymouth plymouth-themes

# ── 3. Node.js LTS ──────────────────────────────────────────
log "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs || true
npm install -g pm2 pnpm 2>/dev/null || true

# ── 4. Ollama (AI) ──────────────────────────────────────────
log "Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh || true

# ── 5. Cloudflared ──────────────────────────────────────────
log "Installing cloudflared..."
curl -fsSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb -o /tmp/cloudflared.deb
dpkg -i /tmp/cloudflared.deb || true
rm -f /tmp/cloudflared.deb

# ── 6. User Setup ───────────────────────────────────────────
log "Creating blackroad user..."
if ! id blackroad >/dev/null 2>&1; then
  useradd -m -s /bin/zsh -G sudo,docker,audio,video,netdev blackroad
fi
echo "blackroad:blackroad" | chpasswd
echo "blackroad ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/blackroad
chmod 440 /etc/sudoers.d/blackroad

# Also keep pi user for compatibility
if id pi >/dev/null 2>&1; then
  usermod -aG docker pi 2>/dev/null || true
  echo "pi ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/pi
  chmod 440 /etc/sudoers.d/pi
fi

# ── 7. SSH Hardening ────────────────────────────────────────
log "Configuring SSH..."
sed -i 's/#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Pre-authorize the fleet SSH key (will be replaced on first boot)
mkdir -p /home/blackroad/.ssh /root/.ssh
chmod 700 /home/blackroad/.ssh /root/.ssh

# ── 8. BlackRoad OS Branding ────────────────────────────────
log "Applying branding..."
cat <<'OSR' > /etc/os-release
PRETTY_NAME="BlackRoad OS \${VERSION}"
NAME="BlackRoad OS"
VERSION_ID="\${VERSION}"
VERSION="\${VERSION} (RoadWay)"
ID=blackroad
ID_LIKE=debian
HOME_URL="https://blackroad.io"
SUPPORT_URL="https://blackroad.io/support"
BUG_REPORT_URL="https://blackroad.io/bugs"
OSR

# Hostname
echo "\${HOSTNAME}" > /etc/hostname
cat <<HOSTS > /etc/hosts
127.0.0.1       localhost
127.0.1.1       \${HOSTNAME}
::1             localhost ip6-localhost ip6-loopback

# BlackRoad Fleet
${FLEET_SUBNET}.49    alice
${FLEET_SUBNET}.96    cecilia
${FLEET_SUBNET}.101   octavia
${FLEET_SUBNET}.98    aria
${FLEET_SUBNET}.38    lucidia
${FLEET_SUBNET}.28    alexandria
HOSTS

# MOTD
cat <<'MOTD' > /etc/motd


  \033[38;5;205mBlackRoad OS\033[0m — Pave Tomorrow.

  BlackRoad OS, Inc. — Proprietary System
  Unauthorized access is prohibited.
  All sessions logged.


  BlackRoad OS, Inc. — Proprietary System
  Unauthorized access is prohibited.
  All sessions logged.

MOTD

# Banner on SSH login
cat <<'PROFILE' > /etc/profile.d/blackroad.sh
#!/bin/bash
PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RESET='\033[0m'

echo ""
echo -e "\${PINK}  BlackRoad OS v\$(cat /etc/blackroad-version 2>/dev/null || echo '2.0.0')\${RESET}"
echo -e "\${BLUE}  \$(hostname) | \$(hostname -I | awk '{print \$1}') | \$(cat /etc/blackroad-role 2>/dev/null || echo 'node')\${RESET}"
echo -e "\${GREEN}  Uptime: \$(uptime -p) | Load: \$(cat /proc/loadavg | awk '{print \$1, \$2, \$3}')\${RESET}"
echo ""
PROFILE
chmod +x /etc/profile.d/blackroad.sh

echo "\${VERSION}" > /etc/blackroad-version
echo "\${ROLE}" > /etc/blackroad-role
echo "\${BUILD_DATE}" > /etc/blackroad-build

# ── 9. BlackRoad Agent Daemon ────────────────────────────────
log "Installing BlackRoad agent daemon..."
mkdir -p /opt/blackroad/{bin,etc,data,memory,scripts}

cat <<'AGENT' > /opt/blackroad/bin/blackroad-agent.py
#!/usr/bin/env python3
"""BlackRoad Agent — runs on every node, reports to fleet."""
import json, os, socket, subprocess, time, http.server, threading

VERSION = "2.0.0"
ROLE = open("/etc/blackroad-role").read().strip() if os.path.exists("/etc/blackroad-role") else "unknown"
HOSTNAME = socket.gethostname()
PORT = int(os.environ.get("AGENT_PORT", "8787"))

def get_stats():
    mem = {}
    with open("/proc/meminfo") as f:
        for line in f:
            parts = line.split()
            if parts[0] in ("MemTotal:", "MemAvailable:"):
                mem[parts[0].rstrip(":")] = int(parts[1])
    load = open("/proc/loadavg").read().split()
    temp = "?"
    try:
        temp = str(round(int(open("/sys/class/thermal/thermal_zone0/temp").read().strip()) / 1000, 1))
    except: pass
    disk = subprocess.check_output(["df", "-h", "/"], text=True).split("\\n")[1].split()
    services = subprocess.check_output(
        "systemctl list-units --type=service --state=running --no-pager --plain 2>/dev/null | grep blackroad | wc -l",
        shell=True, text=True
    ).strip()
    docker_count = "0"
    try:
        docker_count = subprocess.check_output("docker ps -q 2>/dev/null | wc -l", shell=True, text=True).strip()
    except: pass
    return {
        "hostname": HOSTNAME, "role": ROLE, "version": VERSION,
        "uptime": open("/proc/uptime").read().split()[0],
        "load": load[:3], "temp": temp,
        "mem_total_mb": mem.get("MemTotal", 0) // 1024,
        "mem_avail_mb": mem.get("MemAvailable", 0) // 1024,
        "disk_used": disk[2] if len(disk) > 2 else "?",
        "disk_total": disk[1] if len(disk) > 1 else "?",
        "disk_pct": disk[4] if len(disk) > 4 else "?",
        "services": services, "docker": docker_count,
        "ip": subprocess.check_output("hostname -I", shell=True, text=True).strip().split()[0],
    }

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", **get_stats()}).encode())
        elif self.path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(f"BlackRoad OS {VERSION} — {HOSTNAME} ({ROLE})\\n".encode())
        else:
            self.send_response(404)
            self.end_headers()
    def log_message(self, *a): pass

if __name__ == "__main__":
    print(f"BlackRoad Agent v{VERSION} on {HOSTNAME}:{PORT} ({ROLE})")
    http.server.HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
AGENT
chmod +x /opt/blackroad/bin/blackroad-agent.py

# Systemd service for agent
cat <<'SVC' > /etc/systemd/system/blackroad-agent.service
[Unit]
Description=BlackRoad Agent Daemon
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/python3 /opt/blackroad/bin/blackroad-agent.py
Restart=always
RestartSec=5
Environment=AGENT_PORT=8787

[Install]
WantedBy=multi-user.target
SVC

# ── 10. Fleet Auto-Join Script ───────────────────────────────
log "Installing fleet auto-join..."
cat <<'AUTOJOIN' > /opt/blackroad/bin/fleet-join.sh
#!/bin/bash
# Runs on first boot — announces this node to the fleet
set -e
HOSTNAME=\$(hostname)
IP=\$(hostname -I | awk '{print \$1}')
ROLE=\$(cat /etc/blackroad-role 2>/dev/null || echo "new")
VERSION=\$(cat /etc/blackroad-version 2>/dev/null || echo "2.0.0")

# Announce to Alice (gateway)
GATEWAY="192.168.4.49"
curl -sf "http://\${GATEWAY}:8011/api/announce" \
  -H "Content-Type: application/json" \
  -d "{\"hostname\":\"\${HOSTNAME}\",\"ip\":\"\${IP}\",\"role\":\"\${ROLE}\",\"version\":\"\${VERSION}\"}" \
  2>/dev/null || true

# Pull SSH authorized_keys from gateway
curl -sf "http://\${GATEWAY}:8011/api/ssh-keys" -o /tmp/fleet-keys 2>/dev/null && {
  cat /tmp/fleet-keys >> /home/blackroad/.ssh/authorized_keys
  sort -u -o /home/blackroad/.ssh/authorized_keys /home/blackroad/.ssh/authorized_keys
  chmod 600 /home/blackroad/.ssh/authorized_keys
  chown blackroad:blackroad /home/blackroad/.ssh/authorized_keys
  rm -f /tmp/fleet-keys
}

# Mark as joined
echo "joined:\$(date -Iseconds)" > /opt/blackroad/data/fleet-status
echo "BlackRoad fleet join complete: \${HOSTNAME} (\${IP}) as \${ROLE}"
AUTOJOIN
chmod +x /opt/blackroad/bin/fleet-join.sh

cat <<'SVC2' > /etc/systemd/system/blackroad-fleet-join.service
[Unit]
Description=BlackRoad Fleet Auto-Join
After=network-online.target
Wants=network-online.target
ConditionPathExists=!/opt/blackroad/data/fleet-status

[Service]
Type=oneshot
ExecStart=/opt/blackroad/bin/fleet-join.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
SVC2

# ── 11. Memory System ───────────────────────────────────────
log "Installing memory system..."
mkdir -p /opt/blackroad/memory
cat <<'MEMSYS' > /opt/blackroad/bin/memory-system.sh
#!/bin/bash
# BlackRoad Memory System — local node journal
JOURNAL="/opt/blackroad/memory/journal.jsonl"
mkdir -p /opt/blackroad/memory

case "\${1:-status}" in
  log)
    shift
    ACTION="\$1"; ENTITY="\$2"; shift 2; DETAILS="\$*"
    echo "{\"ts\":\"\$(date -Iseconds)\",\"action\":\"\${ACTION}\",\"entity\":\"\${ENTITY}\",\"details\":\"\${DETAILS}\",\"host\":\"\$(hostname)\"}" >> "\$JOURNAL"
    echo "Logged: \${ACTION} \${ENTITY}"
    ;;
  status)
    ENTRIES=\$(wc -l < "\$JOURNAL" 2>/dev/null || echo 0)
    echo "Memory: \${ENTRIES} entries on \$(hostname)"
    ;;
  tail)
    tail -n "\${2:-10}" "\$JOURNAL" 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "No entries"
    ;;
  *)
    echo "Usage: memory-system.sh [log|status|tail] ..."
    ;;
esac
MEMSYS
chmod +x /opt/blackroad/bin/memory-system.sh

# ── 12. NATS Agent ──────────────────────────────────────────
log "Installing NATS CLI..."
curl -fsSL https://github.com/nats-io/natscli/releases/latest/download/nats-0.1.5-linux-arm64.zip -o /tmp/nats.zip 2>/dev/null && {
  cd /tmp && unzip -o nats.zip 2>/dev/null && mv nats /usr/local/bin/ 2>/dev/null
  rm -f nats.zip
} || true

# ── 13. WireGuard Config Template ───────────────────────────
log "Preparing WireGuard..."
mkdir -p /etc/wireguard
cat <<'WG' > /etc/wireguard/wg0.conf.template
# BlackRoad WireGuard — fill in on first boot
[Interface]
# PrivateKey = <generated on first boot>
Address = 10.0.0.X/24
DNS = ${FLEET_SUBNET}.49

[Peer]
PublicKey = <gateway-pubkey>
Endpoint = ${WG_ENDPOINT}
AllowedIPs = 10.0.0.0/24, ${FLEET_SUBNET}.0/24
PersistentKeepalive = 25
WG

# ── 14. Docker Config ───────────────────────────────────────
log "Configuring Docker..."
mkdir -p /etc/docker
cat <<'DOCK' > /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "storage-driver": "overlay2"
}
DOCK

# ── 15. Firewall ────────────────────────────────────────────
log "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8787/tcp   # agent
ufw allow 51820/udp  # wireguard
ufw allow from ${FLEET_SUBNET}.0/24  # fleet subnet
echo "y" | ufw enable || true

# ── 16. Plymouth Boot Theme ─────────────────────────────────
log "Installing boot theme..."
install -d -m 0755 /usr/share/plymouth/themes/blackroad
cat <<'PLY' > /usr/share/plymouth/themes/blackroad/blackroad.plymouth
[Plymouth Theme]
Name=BlackRoad OS
Description=BlackRoad OS Boot Theme — Pave Tomorrow
ModuleName=script

[script]
ImageDir=/usr/share/plymouth/themes/blackroad
ScriptFile=/usr/share/plymouth/themes/blackroad/blackroad.script
PLY

cat <<'PLYSCRIPT' > /usr/share/plymouth/themes/blackroad/blackroad.script
Window.SetBackgroundTopColor(0.04, 0.04, 0.06);
Window.SetBackgroundBottomColor(0.04, 0.04, 0.06);

messages = [
  "BlackRoad OS v2.0.0",
  "",
  "> Initializing sovereign kernel...",
  "> Loading fleet drivers...",
  "> Mounting encrypted filesystems...",
  "> Starting agent daemon...",
  "> Connecting to mesh network...",
  "",
  "[ OK ] All systems operational",
  "[ OK ] Pave Tomorrow.",
];

fun refresh_callback() {
  t = Plymouth.GetTime();
  for (i = 0; i < messages.GetLength(); i++) {
    delay = i * 0.2;
    if (t > delay) {
      if (messages[i].SubString(0, 1) == ">")
        img = Image.Text(messages[i], 1.0, 0.114, 0.424, 1.0);
      else if (messages[i].SubString(0, 1) == "[")
        img = Image.Text(messages[i], 0.133, 0.773, 0.369, 1.0);
      else
        img = Image.Text(messages[i], 0.9, 0.9, 0.9, 1.0);
      s = Sprite(img);
      s.SetX(60);
      s.SetY(80 + (i * 24));
    }
  }
}
Plymouth.SetRefreshFunction(refresh_callback);
fun progress_callback(d, p) {}
Plymouth.SetBootProgressFunction(progress_callback);
PLYSCRIPT

plymouth-set-default-theme -R blackroad 2>/dev/null || true

# ── 17. Cron Jobs ───────────────────────────────────────────
log "Setting up cron..."
cat <<'CRON' > /etc/cron.d/blackroad
# BlackRoad OS cron jobs
*/5 * * * * root /opt/blackroad/bin/memory-system.sh log heartbeat \$(hostname) "alive" 2>/dev/null
0 * * * * root /opt/blackroad/bin/fleet-join.sh 2>/dev/null || true
CRON

# ── 18. Zsh Config ──────────────────────────────────────────
log "Configuring shell..."
cat <<'ZSH' > /home/blackroad/.zshrc
export PATH="/opt/blackroad/bin:\$PATH"
export EDITOR=vim

PROMPT='%F{205}blackroad%f@%F{69}%m%f:%F{82}%~%f %# '

alias ll='ls -la --color=auto'
alias gs='git status'
alias mem='memory-system.sh'
alias fleet='curl -s http://localhost:8787/health | python3 -m json.tool'
alias dps='docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
alias svc='systemctl list-units --type=service --state=running --no-pager | grep blackroad'
ZSH
chown blackroad:blackroad /home/blackroad/.zshrc

# ── 19. Enable Services ─────────────────────────────────────
log "Enabling services..."
systemctl enable ssh
systemctl enable avahi-daemon
systemctl enable docker
systemctl enable blackroad-agent
systemctl enable blackroad-fleet-join
systemctl enable fail2ban
systemctl enable nginx
systemctl enable tor 2>/dev/null || true
systemctl disable bluetooth 2>/dev/null || true

# ── 20. Role-Specific Config ────────────────────────────────
log "Applying role config: \${ROLE}..."
case "\${ROLE}" in
  gateway)
    apt-get install -y pihole 2>/dev/null || true
    apt-get install -y redis-server postgresql 2>/dev/null || true
    ;;
  worker)
    # Self-hosted Workers (workerd)
    npm install -g workerd 2>/dev/null || true
    ;;
  ai)
    # Ollama is already installed, pull default model on first boot
    cat <<'PULL' > /opt/blackroad/bin/pull-models.sh
#!/bin/bash
ollama pull tinyllama 2>/dev/null || true
ollama pull nomic-embed-text 2>/dev/null || true
PULL
    chmod +x /opt/blackroad/bin/pull-models.sh
    ;;
  compute)
    # General purpose — already has everything
    ;;
esac

# ── 21. Cleanup ─────────────────────────────────────────────
log "Cleaning up..."
apt-get autoremove -y
apt-get clean
rm -rf /var/cache/apt/archives/* /tmp/* /var/log/*.log
: > /home/blackroad/.zsh_history 2>/dev/null || true

log "BlackRoad OS v\${VERSION} customization complete!"
rm -- "\$0"
CHROOT

  chmod +x "${MOUNT_DIR}/root/customize.sh"
}

# ── Run Chroot ───────────────────────────────────────────────
run_chroot() {
  log "Entering chroot (this takes a while)..."
  chroot "${MOUNT_DIR}" /bin/bash /root/customize.sh
}

# ── Cleanup & Compress ───────────────────────────────────────
cleanup_mounts() {
  log "Unmounting..."
  umount -lf "${MOUNT_DIR}/dev/pts" 2>/dev/null || true
  umount -lf "${MOUNT_DIR}/dev" 2>/dev/null || true
  umount -lf "${MOUNT_DIR}/sys" 2>/dev/null || true
  umount -lf "${MOUNT_DIR}/proc" 2>/dev/null || true
  umount -lf "${MOUNT_DIR}/boot/firmware" 2>/dev/null || true
  umount -lf "${MOUNT_DIR}/boot" 2>/dev/null || true
  umount -lf "${MOUNT_DIR}" 2>/dev/null || true
  losetup -d "$LOOP" 2>/dev/null || true
}

compress() {
  log "Copying final image..."
  cp "$IMAGE" "$FINAL"

  log "Compressing (xz -9)..."
  xz -9 -T0 -f "$FINAL"

  local size=$(du -sh "${FINAL}.xz" | awk '{print $1}')
  echo ""
  echo ""
  echo -e "${PINK}BlackRoad OS v${VERSION} -- Build Complete${RESET}"
  echo ""
  echo "  Image:  ${FINAL}.xz (${size})"
  echo "  Target: ${TARGET} | Role: ${ROLE}"
  echo ""
  echo "  Flash with:"
  echo "    xz -d ${FINAL}.xz"
  echo "    sudo dd if=${FINAL} of=/dev/sdX bs=4M"
  echo ""
  echo "  Or use Raspberry Pi Imager with the .img file"
  echo ""
}

trap cleanup_mounts EXIT

# ── Main ─────────────────────────────────────────────────────
main() {
  banner
  require_root
  require_commands
  prepare
  write_payload
  run_chroot
  cleanup_mounts
  trap - EXIT
  compress
}

main "$@"
