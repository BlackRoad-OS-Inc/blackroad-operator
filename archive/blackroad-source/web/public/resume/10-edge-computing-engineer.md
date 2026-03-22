# Alexa Amundson

**Edge Computing Engineer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

Cloud inference is someone else's computer running your data. Deployed 27 AI models on-device across 5 Pi nodes with 52 TOPS acceleration, built a WiFi mesh for local connectivity, and kept it all running with self-healing automation.

---

## Experience

### BlackRoad OS | Founder & Edge Computing Engineer | 2025–Present

**The Vision: AI at the Edge, Not in the Cloud**
- 27 Ollama models (48.1 GB) running on 3 Pi 5 nodes — inference happens on-premise, data never leaves the network
- 2x Hailo-8 NPUs (52 TOPS total) for hardware-accelerated inference — PCIe integration, driver management, firmware updates
- 4 custom fine-tuned CECE models — personality, voice, and domain expertise that can't be replicated with off-the-shelf models

**The Network: Mesh Connectivity Without Internet**
- RoadNet WiFi mesh: 5 APs on channels 1/6/11, 5 subnets (10.10.x.0/24), NAT through wlan0 — devices connect to fleet directly
- WireGuard mesh for encrypted node-to-node communication. Tailscale overlay (9 peers) for remote management from anywhere
- Pi-hole DNS for local resolution + custom zones (.cece, .blackroad) — edge services discoverable by name, not IP

**The Challenge: Keeping Edge Alive**
- Edge hardware fails differently than cloud — SD cards degrade, power supplies sag, thermal throttling kills inference mid-response
- Self-healing autonomy on every node. Power monitoring every 5 minutes. Automatic service restarts. Temperature alerts before shutdown

---

## Technical Skills

Raspberry Pi, Hailo-8, Ollama, WireGuard, WiFi mesh, Pi-hole, Docker, Linux

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Fleet Nodes | *live* | fleet.sh — SSH probe to all nodes |
| Nodes Online | *live* | fleet.sh — SSH probe to all nodes |
| AI Models | *live* | services.sh — ollama list via SSH |
| Avg Temp | *live* | fleet.sh — /sys/class/thermal via SSH |
| Tailscale Peers | *live* | services.sh — tailscale status via SSH |
| Fleet Storage (GB) | *live* | fleet.sh — df via SSH |
