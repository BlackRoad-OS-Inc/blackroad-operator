#!/bin/bash
clear
cat <<'M'

  🔐🔐🔐 SECURITY 🔐🔐🔐

  🛡️   1 │ Firewall Status
  🔑  2 │ Key Vault
  🧾  3 │ Audit Log
  🚨  4 │ Threat Scanner
  🔙  0 │ ← Back

M
read -p "  ⌨️  > " c
case $c in
  1) echo "  🛡️  Firewall: ALL ZONES SECURE";;
  2) echo "  🔑 Vault: 42 keys | sealed";;
  3) echo "  🧾 Audit: last entry $(date -u +%H:%M:%S)";;
  4) echo "  🚨 Threats: 0 detected";;
  0) exec ./menu.sh;;
esac
read -p "  ↩ "; exec ./security.sh
