#!/bin/bash
# BlackRoad OS — Jetson Orin Nano Super Setup Script
# Node: Alexa | IP: 192.168.4.200 | 67 TOPS | JetPack 6.2
# Run on the Jetson after flashing JetPack 6.2

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

echo -e "${PINK}BlackRoad OS — Jetson Alexa Node Setup${RESET}"
echo "67 TOPS | JetPack 6.2 | MAXN Mode"
echo ""

# 1. Set hostname
echo -e "${GREEN}[1/10] Setting hostname to alexa${RESET}"
sudo hostnamectl set-hostname alexa
echo "127.0.1.1 alexa" | sudo tee -a /etc/hosts > /dev/null

# 2. Set MAXN power mode (full 67 TOPS)
echo -e "${GREEN}[2/10] Setting MAXN power mode (67 TOPS)${RESET}"
sudo nvpmodel -m 0
sudo jetson_clocks

# 3. Create blackroad user
echo -e "${GREEN}[3/10] Creating blackroad user${RESET}"
if ! id blackroad &>/dev/null; then
  sudo adduser --disabled-password --gecos "BlackRoad OS" blackroad
  sudo usermod -aG sudo,video,docker blackroad
  echo "blackroad ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/blackroad
fi

# 4. SSH key setup
echo -e "${GREEN}[4/10] Setting up SSH keys${RESET}"
sudo -u blackroad mkdir -p /home/blackroad/.ssh
sudo -u blackroad chmod 700 /home/blackroad/.ssh
# Copy authorized keys from Alexandria
cat >> /home/blackroad/.ssh/authorized_keys << 'KEYS'
# Add your public key here after first boot
KEYS
sudo -u blackroad chmod 600 /home/blackroad/.ssh/authorized_keys

# 5. Install Ollama
echo -e "${GREEN}[5/10] Installing Ollama${RESET}"
curl -fsSL https://ollama.com/install.sh | sh
# Pull models optimized for Jetson GPU
ollama pull llama3.2:3b
ollama pull qwen2.5:1.5b

# 6. Install Node.js
echo -e "${GREEN}[6/10] Installing Node.js 20${RESET}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g ws

# 7. Install WireGuard and join mesh
echo -e "${GREEN}[7/10] Installing WireGuard${RESET}"
sudo apt-get install -y wireguard
cat > /tmp/wg-alexa.conf << 'WG'
[Interface]
Address = 10.0.0.10/24
PrivateKey = GENERATE_WITH_wg_genkey
ListenPort = 51820

# Alice (gateway)
[Peer]
PublicKey = ALICE_PUBLIC_KEY
Endpoint = 192.168.4.49:51820
AllowedIPs = 10.0.0.0/24
PersistentKeepalive = 25
WG
echo "WireGuard config template at /tmp/wg-alexa.conf"
echo "Generate keys with: wg genkey | tee privatekey | wg pubkey > publickey"

# 8. Set static IP
echo -e "${GREEN}[8/10] Setting static IP 192.168.4.200${RESET}"
cat > /tmp/01-alexa-static.yaml << 'NETPLAN'
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: false
      addresses: [192.168.4.200/24]
      routes:
        - to: default
          via: 192.168.4.1
      nameservers:
        addresses: [192.168.4.49, 1.1.1.1]
NETPLAN
echo "Netplan config at /tmp/01-alexa-static.yaml"
echo "Apply with: sudo cp /tmp/01-alexa-static.yaml /etc/netplan/ && sudo netplan apply"

# 9. Set fd limits for WebSocket capacity
echo -e "${GREEN}[9/10] Setting file descriptor limits${RESET}"
echo "* soft nofile 65535" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65535" | sudo tee -a /etc/security/limits.conf
sudo sysctl -w net.core.somaxconn=65535
sudo sysctl -w fs.file-max=2097152
echo "net.core.somaxconn=65535" | sudo tee -a /etc/sysctl.conf
echo "fs.file-max=2097152" | sudo tee -a /etc/sysctl.conf

# 10. BlackRoad banner
echo -e "${GREEN}[10/10] Setting BlackRoad login banner${RESET}"
cat > /etc/motd << 'BANNER'

  BlackRoad OS, Inc. — Proprietary System
  Node: Alexa | Jetson Orin Nano Super | 67 TOPS
  Unauthorized access is prohibited.
  All sessions logged.

BANNER

echo ""
echo -e "${PINK}Setup complete.${RESET}"
echo ""
echo "Next steps:"
echo "  1. Set static IP:    sudo cp /tmp/01-alexa-static.yaml /etc/netplan/ && sudo netplan apply"
echo "  2. Generate WG keys: wg genkey | tee privatekey | wg pubkey > publickey"
echo "  3. Configure WG:     Edit /tmp/wg-alexa.conf with real keys, sudo cp to /etc/wireguard/wg0.conf"
echo "  4. Start WG:         sudo systemctl enable --now wg-quick@wg0"
echo "  5. Test Ollama:      ollama run llama3.2:3b 'Hello from Alexa'"
echo "  6. Verify TOPS:      sudo tegrastats | head -5"
echo "  7. Add SSH key from Alexandria: ssh-copy-id blackroad@192.168.4.200"
echo ""
echo "Fleet registration:"
echo "  curl -X POST https://roadtrip.blackroad.io/api/chat \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"agent\":\"alexa\",\"message\":\"Alexa online. 67 TOPS. Ready.\",\"channel\":\"general\"}'"
