#!/bin/bash
# BlackRoad Security Hardening Script
# Applies CIS Benchmark Level 1 controls to Raspberry Pi / Ubuntu servers
set -euo pipefail

GREEN="[0;32m"; RED="[0;31m"; YELLOW="[1;33m"; CYAN="[0;36m"; NC="[0m"

info()    { echo -e "${CYAN}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn()    { echo -e "${YELLOW}⚠${NC} $1"; }
error()   { echo -e "${RED}✗${NC} $1"; }

echo -e "${CYAN}
╔══════════════════════════════════════════════╗
║   BlackRoad Security Hardening               ║
║   CIS Benchmark Level 1 — Raspberry Pi/Ubuntu ║
╚══════════════════════════════════════════════╝
${NC}"

# ── 1. SSH Hardening ──────────────────────────
harden_ssh() {
  info "Hardening SSH configuration..."
  SSH_CONFIG="/etc/ssh/sshd_config"
  
  declare -A settings=(
    ["PermitRootLogin"]="no"
    ["PasswordAuthentication"]="no"
    ["X11Forwarding"]="no"
    ["MaxAuthTries"]="3"
    ["LoginGraceTime"]="60"
    ["ClientAliveInterval"]="300"
    ["ClientAliveCountMax"]="2"
    ["Protocol"]="2"
    ["AllowAgentForwarding"]="no"
    ["AllowTcpForwarding"]="no"
  )
  
  for key in "${!settings[@]}"; do
    value="${settings[$key]}"
    if grep -q "^$key" "$SSH_CONFIG" 2>/dev/null; then
      sudo sed -i "s|^$key.*|$key $value|" "$SSH_CONFIG"
    else
      echo "$key $value" | sudo tee -a "$SSH_CONFIG" > /dev/null
    fi
    success "SSH: $key = $value"
  done
  
  sudo systemctl reload sshd 2>/dev/null || sudo service ssh reload 2>/dev/null || warn "Could not reload SSH"
}

# ── 2. Firewall (UFW) ─────────────────────────
setup_firewall() {
  info "Configuring UFW firewall..."
  
  if ! command -v ufw &>/dev/null; then
    sudo apt-get install -y ufw 2>/dev/null || warn "Could not install ufw"
    return
  fi
  
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  sudo ufw allow 22/tcp   # SSH
  sudo ufw allow 8787/tcp  # BlackRoad gateway
  sudo ufw allow 8000/tcp  # BlackRoad API
  sudo ufw --force enable
  success "UFW configured (deny all inbound except SSH + BlackRoad ports)"
}

# ── 3. Fail2ban ──────────────────────────────
setup_fail2ban() {
  info "Configuring fail2ban..."
  
  if ! command -v fail2ban-client &>/dev/null; then
    sudo apt-get install -y fail2ban 2>/dev/null || { warn "fail2ban not available"; return; }
  fi
  
  sudo tee /etc/fail2ban/jail.local > /dev/null << JAILEOF
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5
backend  = systemd

[sshd]
enabled = true
port    = ssh
maxretry = 3
bantime  = 24h
JAILEOF
  
  sudo systemctl enable fail2ban && sudo systemctl restart fail2ban
  success "fail2ban configured (SSH max 3 retries, 24h ban)"
}

# ── 4. System Updates ────────────────────────
apply_updates() {
  info "Applying security updates..."
  sudo apt-get update -qq
  sudo apt-get upgrade -y --only-upgrade 2>/dev/null || sudo apt-get dist-upgrade -y
  success "System updated"
}

# ── 5. File Permissions ──────────────────────
fix_permissions() {
  info "Fixing sensitive file permissions..."
  
  # SSH keys
  find /home -name "*.pem" -o -name "id_rsa" -o -name "id_ed25519" 2>/dev/null | while read f; do
    chmod 600 "$f" && success "Fixed: $f"
  done
  
  # BlackRoad vault
  if [ -d "$HOME/.blackroad/vault" ]; then
    chmod 700 "$HOME/.blackroad/vault"
    find "$HOME/.blackroad/vault" -type f -exec chmod 600 {} \;
    success "BlackRoad vault: 700/600"
  fi
  
  # /etc/shadow
  sudo chmod 640 /etc/shadow 2>/dev/null && success "/etc/shadow: 640"
}

# ── 6. Kernel Hardening ──────────────────────
harden_kernel() {
  info "Applying kernel sysctl hardening..."
  
  sudo tee /etc/sysctl.d/99-blackroad-hardening.conf > /dev/null << SYSCTL
# Network hardening
net.ipv4.ip_forward = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.all.log_martians = 1
net.ipv4.tcp_syncookies = 1

# Disable IPv6 redirects
net.ipv6.conf.all.accept_redirects = 0

# Memory protection
kernel.randomize_va_space = 2
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 2
SYSCTL
  
  sudo sysctl -p /etc/sysctl.d/99-blackroad-hardening.conf 2>/dev/null
  success "Kernel hardening applied"
}

# ── Run all ──────────────────────────────────
main() {
  harden_ssh
  setup_firewall
  setup_fail2ban
  fix_permissions
  harden_kernel
  
  echo -e "
${GREEN}=== Hardening Complete ==="
  echo "Run 'sudo lynis audit system' for a full audit report"
}

main "$@"
