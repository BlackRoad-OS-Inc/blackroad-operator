#!/usr/bin/env bash
# BlackRoad OS Panel - Updated December 20, 2025
# Enhanced with network mesh and Tailscale features

while true; do
  clear
  echo "🎛️  BlackRoad OS Panel — $(hostname)"
  echo "────────────────────────────────────────"
  echo "1) 🛰️  Node status (br-status)"
  echo "2) 🌐  Network info (IPs + routes)"
  echo "3) 🌐  Mesh status (all Pis + Tailscale)"
  echo "4) 🧠  System info (CPU, memory, disk)"
  echo "5) 🔗  Ping operator Mac (192.168.4.28)"
  echo "6) 🔗  Ping all BlackRoad nodes"
  echo "7) 📊  Live process monitor (htop)"
  echo "8) 🧩  tmux session manager"
  echo "9) 📁  Disk usage by directory"
  echo "d) 🐳  Docker status + containers"
  echo "t) 🌍  Tailscale status"
  echo "j) 📡  Join Tailscale mesh"
  echo "s) 🔄  Restart BlackRoad services"
  echo "r) ♻️  Reboot node"
  echo "q) 🚪 Quit to shell"
  echo "────────────────────────────────────────"
  read -rp "Choose an option: " choice

  case "$choice" in
    1)
      br-status
      read -n1 -rsp "Press any key to return to menu..."
      ;;
    2)
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "  Network Interfaces"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      ip -br a
      echo ""
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "  Routes"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      ip route
      echo ""
      read -n1 -rsp "Press any key to return to menu..."
      ;;
    3)
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "  BlackRoad Mesh Network Status"
      echo "  $(date)"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      echo "Pinging BlackRoad nodes..."
      echo ""

      # Mac-Operator
      echo -n "Mac-Operator (192.168.4.28): "
      if ping -c 1 -W 1 192.168.4.28 &>/dev/null; then
        echo "✅ UP"
      else
        echo "❌ DOWN"
      fi

      # lucidia
      echo -n "lucidia (192.168.4.38): "
      if ping -c 1 -W 1 192.168.4.38 &>/dev/null; then
        echo "✅ UP"
        echo -n "  Tailscale (100.66.235.47): "
        if ping -c 1 -W 1 100.66.235.47 &>/dev/null 2>&1; then
          echo "✅ UP"
        else
          echo "❌ DOWN"
        fi
      else
        echo "❌ DOWN"
      fi

      # alice
      echo -n "alice (192.168.4.49): "
      if ping -c 1 -W 1 192.168.4.49 &>/dev/null; then
        echo "✅ UP"
        echo -n "  Tailscale (100.66.58.5): "
        if ping -c 1 -W 1 100.66.58.5 &>/dev/null 2>&1; then
          echo "✅ UP"
        else
          echo "❌ DOWN"
        fi
      else
        echo "❌ DOWN"
      fi

      # This node
      echo ""
      echo "This node ($(hostname) - $(hostname -I | awk '{print $1}')): ✅ RUNNING"

      # Tailscale status
      echo ""
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "  Tailscale Status (this node)"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      if command -v tailscale &>/dev/null; then
        tailscale status 2>&1 | head -10 || echo "Not connected to Tailscale"
      else
        echo "❌ Tailscale not installed"
      fi

      echo ""
      read -n1 -rsp "Press any key to return to menu..."
      ;;
    4)
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "  System Information"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      echo "Hostname: $(hostname)"
      echo "Uptime:   $(uptime -p)"
      echo ""
      echo "Memory:"
      free -h
      echo ""
      echo "Disk:"
      df -h / | tail -1
      echo ""
      echo "Temperature:"
      if command -v vcgencmd &>/dev/null; then
        vcgencmd measure_temp
      else
        echo "N/A (not a Raspberry Pi)"
      fi
      echo ""
      echo "Kernel: $(uname -r)"
      echo ""
      read -n1 -rsp "Press any key to return to menu..."
      ;;
    5)
      echo "Pinging Mac-Operator..."
      ping -c 5 192.168.4.28 || echo "Mac not reachable"
      read -n1 -rsp "Press any key to return to menu..."
      ;;
    6)
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "  Pinging all BlackRoad nodes"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      for node in "192.168.4.28 Mac-Operator" "192.168.4.38 lucidia" "192.168.4.49 alice" "192.168.4.64 blackroad-pi"; do
        ip=$(echo $node | awk '{print $1}')
        name=$(echo $node | awk '{print $2}')
        echo -n "Pinging $name ($ip)... "
        if ping -c 2 -W 2 $ip &>/dev/null; then
          echo "✅ OK"
        else
          echo "❌ FAILED"
        fi
      done
      echo ""
      read -n1 -rsp "Press any key to return to menu..."
      ;;
    7)
      htop
      ;;
    8)
      tmux attach -t blackroad 2>/dev/null || tmux new -s blackroad
      ;;
    9)
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "  Disk Usage by Directory"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      df -h
      echo ""
      echo "Top 10 directories by size in /:"
      sudo du -h --max-depth=1 / 2>/dev/null | sort -hr | head -10
      echo ""
      read -n1 -rsp "Press any key to return to menu..."
      ;;
    d)
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "  Docker Status"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      if command -v docker &>/dev/null; then
        echo ""
        echo "Docker version:"
        docker --version
        echo ""
        echo "Running containers:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "No containers running"
        echo ""
        echo "Images:"
        docker images --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}" | head -10
      else
        echo "❌ Docker not installed"
      fi
      echo ""
      read -n1 -rsp "Press any key to return to menu..."
      ;;
    t)
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "  Tailscale Status"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      if command -v tailscale &>/dev/null; then
        tailscale status
        echo ""
        echo "Tailscale IP:"
        tailscale ip -4 2>/dev/null || echo "Not connected"
      else
        echo "❌ Tailscale not installed"
        echo ""
        echo "To install Tailscale:"
        echo "  curl -fsSL https://tailscale.com/install.sh | sh"
      fi
      echo ""
      read -n1 -rsp "Press any key to return to menu..."
      ;;
    j)
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "  Join Tailscale Mesh"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      if command -v tailscale &>/dev/null; then
        echo ""
        echo "Connecting to Headscale at headscale.blackroad.io..."
        sudo tailscale up --login-server=https://headscale.blackroad.io --accept-routes
        echo ""
        echo "Tailscale status:"
        tailscale status
      else
        echo "❌ Tailscale not installed"
        echo ""
        echo "Install Tailscale first:"
        echo "  curl -fsSL https://tailscale.com/install.sh | sh"
      fi
      echo ""
      read -n1 -rsp "Press any key to return to menu..."
      ;;
    s)
      echo "Restarting BlackRoad services..."
      sudo systemctl restart blackroad-agent blackroad-agent-cf 2>/dev/null || echo "Services not found"
      echo "Done."
      sleep 2
      ;;
    r)
      echo ""
      read -rp "Are you sure you want to reboot? (y/N): " confirm
      if [[ "$confirm" =~ ^[Yy]$ ]]; then
        echo "Rebooting..."
        sudo reboot
      else
        echo "Cancelled."
        sleep 1
      fi
      ;;
    q)
      echo "👋 Leaving BlackRoad OS Panel."
      exit 0
      ;;
    *)
      echo "❌ Invalid option"
      sleep 1
      ;;
  esac
done
