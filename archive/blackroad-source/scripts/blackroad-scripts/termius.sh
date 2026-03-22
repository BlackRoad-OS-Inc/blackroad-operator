#!/bin/bash
clear
cat <<'MENU'

  📟📟📟 TERMIUS + iSH 📟📟📟

  ── TERMIUS ─────────────────
  📋 1  Saved Hosts
  🔑 2  SSH Key Paths
  📂 3  SFTP Bookmarks
  🔗 4  Port Forwarding Presets
  📡 5  Termius SSH ID
  ── iSH (iOS Alpine Linux) ──
  🐧 6  iSH Quick Setup
  📦 7  iSH Packages (apk)
  🐍 8  iSH Python Setup
  📁 9  iSH ↔ Files.app Paths
  ── iOS WORKFLOW ─────────────
  🔄 a  Full iOS Dev Workflow
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) cat <<'HOSTS'
  📋 Termius Saved Hosts:
  ───────────────────────
  alice       pi@192.168.4.49      Pi 400
  aria        pi@192.168.4.64      Pi 5 EC
  octavia     pi@192.168.4.74      Pi 5 PM+Hailo
  lucidia     pi@192.168.4.38      Pi 5 EC
  shellfish   root@174.138.44.45   DigitalOcean
  ts-pi4b     pi@100.95.120.67     Tailscale
  ts-lucidia  pi@100.66.235.47     Tailscale
  SSH ID:     https://sshid.io/blackroad-sandbox
HOSTS
     read -p "  ↩ ";;
  2) echo "  🔑 Keys typically at:"; echo "  ~/.ssh/id_ed25519 (preferred)"; echo "  ~/.ssh/id_rsa"; echo "  Termius stores in-app keychain"; ls ~/.ssh/*.pub 2>/dev/null || echo "  (no local keys)"; read -p "  ↩ ";;
  3) echo "  📂 SFTP bookmarks mirror SSH hosts"; echo "  Quick transfer: drag files in Termius SFTP tab"; read -p "  ↩ ";;
  4) cat <<'FWD'
  🔗 Port Forwarding Presets:
  ───────────────────────────
  Ollama:   L 11434 → octavia:11434
  Flask:    L 5000  → lucidia:5000
  Jupyter:  L 8888  → aria:8888
  Node:     L 3000  → shellfish:3000
  Grafana:  L 3001  → alice:3000
FWD
     read -p "  ↩ ";;
  5) echo "  📡 https://sshid.io/blackroad-sandbox"; echo "  Share SSH access with new devices instantly"; read -p "  ↩ ";;
  6) cat <<'ISH'
  🐧 iSH — Alpine Linux on iOS
  ──────────────────────────────
  Install: App Store → iSH Shell
  First run:
    apk update && apk upgrade
    apk add openssh git curl python3 py3-pip
    apk add nano vim tmux htop jq
  Mount Files.app: Settings → File Providers
ISH
     read -p "  ↩ ";;
  7) cat <<'APK'
  📦 Useful iSH Packages:
  ─────────────────────────
  apk add openssh git curl wget
  apk add python3 py3-pip nodejs npm
  apk add nano vim tmux screen
  apk add htop jq rsync
  apk add build-base gcc musl-dev
  apk add py3-numpy py3-requests
APK
     read -p "  ↩ ";;
  8) cat <<'PYISH'
  🐍 Python in iSH:
  ──────────────────
  apk add python3 py3-pip
  pip3 install paramiko fabric  # SSH scripting
  pip3 install requests rich    # HTTP + TUI
  pip3 install anthropic openai # AI APIs
  Note: numpy/pandas work but slow on emulation
PYISH
     read -p "  ↩ ";;
  9) cat <<'FILES'
  📁 iSH ↔ iOS Files:
  ─────────────────────
  Mount: iSH Settings → File Providers → enable
  Access in iSH:  /mnt/group/
  Access in Files: iSH → browse container
  Tip: symlink for easy access:
    ln -s /mnt/group/Documents ~/docs
FILES
     read -p "  ↩ ";;
  a) cat <<'WORKFLOW'
  🔄 Full iOS Dev Workflow:
  ──────────────────────────
  1. Code in Koder (syntax highlight + SSH)
  2. Git in Working Copy (clone/push/pull)
  3. Terminal in Termius (SSH to Pis/servers)
  4. Local shell in iSH (Alpine Linux)
  5. Python scripts in Pyto (native iOS)
  6. Manage Claude via claude.ai
  7. Files.app bridges all apps
  8. iPad Pro 12.9" + Magic Keyboard = laptop
WORKFLOW
     read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./termius.sh
