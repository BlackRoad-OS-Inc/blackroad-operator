# Alexa Amundson

**Systems Engineer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

When your production fleet is single-board computers, every kernel parameter matters. Tuned CPU governors, stabilized voltage, integrated PCIe AI accelerators, and squeezed production workloads from hardware that fits in your hand.

---

## Experience

### BlackRoad OS | Founder & Systems Engineer | 2025–Present

**The Constraint: Maximum Work from Minimum Hardware**
- A Pi 5 has 8 GB RAM, a quad-core ARM, and a 30W power budget. It needs to run Docker, Ollama, Nginx, PostgreSQL, and 50+ systemd services simultaneously
- Tuned swappiness to 10, dirty_ratio to 40, applied conservative CPU governors, capped frequency to 2 GHz — workloads stable, temperatures safe
- GPU memory reduced from 256MB to 16MB on headless nodes — freed RAM for actual compute. Disabled cups, rpcbind, nfs, lightdm across fleet

**The Integration: Making Hardware Talk**
- 2x Hailo-8 NPU via PCIe — installed drivers, firmware, verified /dev/hailo0 on both nodes. 52 TOPS of AI acceleration, zero cloud cost
- NVMe SSD on Octavia (1TB) — faster I/O for Gitea, Docker images, and model weights. USB peripherals: UART, keyboards, microphones, OLED displays
- Overclock on one node caused undervoltage (0.75V) — removed overclock, tuned config.txt, recovered +95mV. Fleet-wide voltage monitoring deployed

**The Discipline: 256 Services, Zero Chaos**
- 256 systemd services and 35 timers across fleet — each one has a purpose, a health check, and an owner
- Self-healing watchdogs restart failed services. Power monitoring logs every 5 minutes. Everything persistent across reboots via sysctl.d and tmpfiles.d

---

## Technical Skills

Linux kernel, systemd, sysctl, PCIe, I2C, GPIO, Hailo-8, NVMe, Bash, Python

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Systemd Services | *live* | services.sh — systemctl list-units via SSH |
| Systemd Timers | *live* | services.sh — systemctl list-timers via SSH |
| Fleet Nodes | *live* | fleet.sh — SSH probe to all nodes |
| Avg Temp | *live* | fleet.sh — /sys/class/thermal via SSH |
| Fleet RAM (MB) | *live* | fleet.sh — /proc/meminfo via SSH |
| Fleet Storage (GB) | *live* | fleet.sh — df via SSH |
