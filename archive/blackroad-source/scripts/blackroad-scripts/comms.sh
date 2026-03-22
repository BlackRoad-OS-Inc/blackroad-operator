#!/bin/bash
clear
cat <<'M'

  📡📡📡 COMMS 📡📡📡

  💬  1 │ NATS Messaging
  📨  2 │ Agent Mail
  🔔  3 │ Alerts
  📻  4 │ LoRa Status
  🔙  0 │ ← Back

M
read -p "  ⌨️  > " c
case $c in
  1) echo "  💬 NATS: 36 subjects | 12.4k/s";;
  2) echo "  📨 Inbox: 3 unread";;
  3) echo "  🔔 Alerts: 0 critical | 2 info";;
  4) echo "  📻 Heltec LoRa: STANDBY";;
  0) exec ./menu.sh;;
esac
read -p "  ↩ "; exec ./comms.sh
