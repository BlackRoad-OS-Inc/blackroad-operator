#!/bin/bash
clear
cat <<'MENU'

  💽💽💽 NVMe STORAGE 💽💽💽

  Pironman 5-MAX: dual NVMe, RAID 0/1

  📊 1  Local NVMe Info
  🖥️  2  octavia NVMe
  🖥️  3  anastasia NVMe
  🌡️  4  NVMe Temps
  💾 5  SMART Data
  📋 6  Partition Table
  🔧 7  RAID Status
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) lsblk -d | grep nvme 2>/dev/null || echo "  ⚠️  No NVMe found locally"; read -p "  ↩ ";;
  2) echo "  🖥️  octavia NVMe:"; ssh -o ConnectTimeout=3 pi@192.168.4.74 "lsblk | grep nvme; df -h | grep nvme" 2>/dev/null || echo "  ⚠️  Offline"; read -p "  ↩ ";;
  3) echo "  ⚠️  anastasia IP TBD"; read -p "  ↩ ";;
  4) echo "  🌡️  NVMe Temps:"
     ssh -o ConnectTimeout=3 pi@192.168.4.74 "sudo smartctl -a /dev/nvme0 2>/dev/null | grep -i temp || sudo nvme smart-log /dev/nvme0 2>/dev/null | grep -i temp" || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  5) read -p "  💾 Device (e.g. /dev/nvme0): " d; sudo smartctl -a "$d" 2>/dev/null || sudo nvme smart-log "$d" 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  6) read -p "  📋 Device (e.g. /dev/nvme0n1): " d; sudo fdisk -l "$d" 2>/dev/null || echo "  ⚠️  Failed"; read -p "  ↩ ";;
  7) echo "  🔧 RAID (mdadm):"; cat /proc/mdstat 2>/dev/null || echo "  (no software RAID)"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./nvme.sh
