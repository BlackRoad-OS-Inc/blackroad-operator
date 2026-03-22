# BlackRoad Fleet Inventory

Last updated: 2026-02-09

## Human in the Loop

### alexandria (Mac)
- **Role**: Control Center, Human Operator
- **Local IP**: 192.168.4.28
- **Tailscale**: 100.91.90.68
- **User**: alexa

---

## AI Compute Nodes (Pironman Pi 5 + Hailo-8)

### lucidia
- **Hardware**: Raspberry Pi 5 in Pironman 5 case
- **Local IP**: 192.168.4.81
- **Tailscale**: 100.83.149.86
- **User**: pi
- **AI Accelerator**: Hailo-8 (26 TOPS)
  - Serial: HLLWM2B233704606
  - Firmware: 4.23.0
- **Storage**: 1TB NVMe @ /mnt/nvme
- **RAM**: 8GB

### cecilia
- **Hardware**: Raspberry Pi 5 in Pironman 5 case
- **Local IP**: 192.168.4.89
- **Tailscale**: 100.72.180.98
- **User**: cecilia
- **AI Accelerator**: Hailo-8 (26 TOPS)
  - Serial: HLLWM2B233704667
  - Firmware: 4.23.0
- **Storage**: 500GB NVMe (boot drive)
- **RAM**: 8GB

---

## Compute Cluster (Raspberry Pi)

### alice
- **Hardware**: Raspberry Pi 4
- **Local IP**: 192.168.4.49
- **Tailscale**: 100.77.210.18
- **User**: pi
- **Role**: Headscale mesh server
- **Docker**: 7 containers

### octavia
- **Hardware**: Raspberry Pi 4
- **Local IP**: 192.168.4.38
- **Tailscale**: 100.66.235.47
- **User**: pi
- **Docker**: 15 containers

### aria
- **Hardware**: Raspberry Pi 5
- **Local IP**: 192.168.4.82
- **Tailscale**: 100.109.14.17
- **User**: pi
- **Role**: PRIMARY Docker host
- **Docker**: 142 containers

---

## Cloud Servers (DigitalOcean)

### codex-infinity
- **Public IP**: 159.65.43.12
- **Tailscale**: 100.108.132.8
- **Specs**: 8GB RAM, 4 vCPU, 80GB disk

### shellfish
- **Public IP**: 174.138.44.45
- **Tailscale**: 100.94.33.37
- **Specs**: 1GB RAM, 1 vCPU, 25GB disk

---

## Fleet Totals

| Metric | Value |
|--------|-------|
| Total Devices | 8 |
| AI Accelerators | 2x Hailo-8 (lucidia, cecilia) |
| Total AI TOPS | 52 |
| Docker Containers | 167 |
