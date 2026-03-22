#!/usr/bin/env bash
# BlackRoad Pi Config Backup & Google Drive Sync
# Syncs key configs from each Pi to Mac, then rclone to GDrive
# Usage: ./blackroad-backup-sync.sh

set -euo pipefail

# Source centralized config
NODES_CONFIG="$HOME/.blackroad/config/nodes.sh"
if [[ -f "$NODES_CONFIG" ]]; then
  source "$NODES_CONFIG"
else
  PINK='\033[38;5;205m'; AMBER='\033[38;5;214m'; BLUE='\033[38;5;69m'
  VIOLET='\033[38;5;135m'; GREEN='\033[38;5;82m'; RED='\033[38;5;196m'; RESET='\033[0m'
fi

# Directories
DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_BASE="$HOME/.blackroad/backups"
LOG_DIR="$HOME/.blackroad/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/backup-${DATE}.log"

log() {
  local msg="[$(date '+%H:%M:%S')] $1"
  echo "$msg" >> "$LOG_FILE"
  echo -e "$2$msg${RESET}"
}

log_separator() {
  local sep="$(printf '=%.0s' {1..60})"
  echo "$sep" >> "$LOG_FILE"
  echo -e "${VIOLET}${sep}${RESET}"
}

backup_remote() {
  local name="$1" user="$2" ip="$3" remote_path="$4" label="$5"
  local dest="$BACKUP_BASE/$name/$DATE/$label"
  mkdir -p "$dest"

  if ! ping -c 1 -W 3 "$ip" &>/dev/null; then
    log "  SKIP $name/$label - host unreachable" "$RED"
    return 1
  fi

  log "  Syncing $name:$remote_path -> $dest" "$BLUE"
  if rsync -az --timeout=30 \
    -e "ssh -o ConnectTimeout=30 -o ServerAliveInterval=10 -o ServerAliveCountMax=3 -o StrictHostKeyChecking=no -o BatchMode=yes -o LogLevel=ERROR" \
    "${user}@${ip}:${remote_path}" "$dest/" >> "$LOG_FILE" 2>&1; then
    log "  OK: $name/$label" "$GREEN"
  else
    log "  WARN: $name/$label rsync had errors (may need sudo on remote)" "$AMBER"
  fi
}

# Header
log_separator
log "BlackRoad Backup Sync - $TIMESTAMP" "$PINK"
log_separator

# ---- Alice ----
log "--- Alice ---" "$BLUE"
ALICE_IP="${NODE_IP[alice]:-192.168.4.49}"
ALICE_USER="${NODE_USER[alice]:-pi}"
backup_remote "alice" "$ALICE_USER" "$ALICE_IP" "/etc/pihole/" "pihole"
backup_remote "alice" "$ALICE_USER" "$ALICE_IP" "/etc/nginx/" "nginx"

# ---- Cecilia ----
log "--- Cecilia ---" "$BLUE"
CECILIA_IP="${NODE_IP[cecilia]:-192.168.4.96}"
CECILIA_USER="${NODE_USER[cecilia]:-blackroad}"
backup_remote "cecilia" "$CECILIA_USER" "$CECILIA_IP" "/usr/share/ollama/.ollama/Modelfile*" "ollama-modelfiles" || true
backup_remote "cecilia" "$CECILIA_USER" "$CECILIA_IP" "/home/blackroad/Modelfiles/" "ollama-modelfiles-home" || true
backup_remote "cecilia" "$CECILIA_USER" "$CECILIA_IP" "/etc/minio/" "minio-config" || true
backup_remote "cecilia" "$CECILIA_USER" "$CECILIA_IP" "/etc/default/minio" "minio-env" || true

# ---- Octavia ----
log "--- Octavia ---" "$BLUE"
OCTAVIA_IP="${NODE_IP[octavia]:-192.168.4.100}"
OCTAVIA_USER="${NODE_USER[octavia]:-pi}"
backup_remote "octavia" "$OCTAVIA_USER" "$OCTAVIA_IP" "/etc/gitea/" "gitea-config" || true
backup_remote "octavia" "$OCTAVIA_USER" "$OCTAVIA_IP" "/var/lib/gitea/custom/conf/" "gitea-custom-config" || true
backup_remote "octavia" "$OCTAVIA_USER" "$OCTAVIA_IP" "/etc/nats/" "nats-config" || true
backup_remote "octavia" "$OCTAVIA_USER" "$OCTAVIA_IP" "/etc/nats-server.conf" "nats-server-conf" || true

# ---- Lucidia ----
log "--- Lucidia ---" "$BLUE"
LUCIDIA_IP="${NODE_IP[lucidia]:-192.168.4.38}"
LUCIDIA_USER="${NODE_USER[lucidia]:-octavia}"
backup_remote "lucidia" "$LUCIDIA_USER" "$LUCIDIA_IP" "/etc/nginx/" "nginx" || true
backup_remote "lucidia" "$LUCIDIA_USER" "$LUCIDIA_IP" "/opt/blackroad/" "blackroad-config" || true

# ---- rclone to Google Drive ----
log_separator
log "Syncing backups to Google Drive..." "$VIOLET"
if command -v rclone &>/dev/null; then
  if rclone sync "$BACKUP_BASE" gdrive-blackroad:blackroad-pi-backups \
    --log-file="$LOG_DIR/gdrive-backup-sync.log" \
    --log-level=NOTICE 2>&1; then
    log "Google Drive sync complete" "$GREEN"
  else
    log "Google Drive sync failed - check $LOG_DIR/gdrive-backup-sync.log" "$RED"
  fi
else
  log "rclone not found - skipping Google Drive sync" "$AMBER"
fi

log_separator
log "Backup sync finished" "$GREEN"
