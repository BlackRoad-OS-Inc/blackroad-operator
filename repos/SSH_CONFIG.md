# SSH Configuration

## Quick Reference

```bash
# Human
ssh alexandria       # Your Mac (control center)

# AI Compute (Hailo-8)
ssh octavia          # Pi 5 + Hailo-8 (26 TOPS)
ssh cecilia          # Pi 5 + Hailo-8 (26 TOPS)

# Compute Cluster
ssh alice            # Pi 4 (Headscale)
ssh lucidia          # Pi 4
ssh aria             # Pi 5 (142 containers)

# Cloud
ssh codex-infinity   # DigitalOcean NYC3
ssh shellfish        # DigitalOcean NYC1

# Tailscale (remote access)
ssh alice-ts         # Via Tailscale mesh
ssh octavia-ts       # Via Tailscale mesh
# etc.
```

## Full SSH Config

Location: `~/.ssh/config`

```
# ===== BLACKROAD PI CLUSTER =====
# Updated 2026-02-09

Host alice
    HostName 192.168.4.49
    # Tailscale: 100.77.210.18
    User pi
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no

Host lucidia
    HostName 192.168.4.38
    # Tailscale: 100.66.235.47
    User pi
    IdentityFile ~/.ssh/br_mesh_ed25519
    StrictHostKeyChecking no

Host aria
    HostName 192.168.4.82
    # Tailscale: 100.109.14.17
    User pi
    IdentityFile ~/.ssh/br_mesh_ed25519
    StrictHostKeyChecking no

Host octavia
    HostName 192.168.4.81
    # Tailscale: 100.83.149.86
    User pi
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no

Host cecilia
    HostName 192.168.4.89
    # Tailscale: 100.72.180.98
    User cecilia
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no

# ===== REMOTE SERVERS =====

Host shellfish
    HostName 174.138.44.45
    # Tailscale: 100.94.33.37
    User root
    IdentityFile ~/.ssh/id_ed25519
    StrictHostKeyChecking no

Host codex-infinity
    HostName 159.65.43.12
    # Tailscale: 100.108.132.8
    User root
    StrictHostKeyChecking no

# ===== ALEXANDRIA - HUMAN IN THE LOOP =====

Host alexandria
    HostName 192.168.4.28
    # Tailscale: 100.91.90.68
    User alexa

# ===== TAILSCALE ALIASES =====

Host alice-ts
    HostName 100.77.210.18
    User pi

Host octavia-ts
    HostName 100.83.149.86
    User pi

Host cecilia-ts
    HostName 100.72.180.98
    User cecilia

Host codex-infinity-ts
    HostName 100.108.132.8
    User root
```

## SSH Keys

| Key File | Used For |
|----------|----------|
| `~/.ssh/id_ed25519` | alice, octavia, cecilia, shellfish |
| `~/.ssh/br_mesh_ed25519` | lucidia, aria, anastasia |
