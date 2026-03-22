# Macro-Quantum_Sentinel_Zero-Hop_Tunnel_Setup

**Source:** br-drive

---

Macro-Quantum Sentinel
Zero-Hop Cloudflare Tunnel Initialization

Operator-facing setup notes for bringing the Sentinel online via Cloudflare Tunnel + Access

Purpose

Bring the Macro-Quantum Sentinel online with a Zero-Hop Cloudflare Tunnel so the Operator can reach the Physical Gateway (Pi 4B) without opening inbound router ports. Access policies gate entry; the compute enclave stays dark.

Target Topology

Tunnel host (Physical Gateway): Raspberry Pi 4B (Remote Control Server)

Operator: Apple M1 Mac (root signing authority)

Exposed behind Cloudflare Access (recommended):

ssh.sentinel.<yourdomain> → SSH to the Pi 4B (then hop to the Pi 5 cluster over Tailscale/LAN)

health.sentinel.<yourdomain> → optional local health endpoint (HTTP)

Security posture: outbound-only connector; no public inbound ports.

Prerequisites

A Cloudflare account with your zone (domain) active.

Cloudflare Zero Trust enabled (for Access).

SSH keys available for the Operator; disable password SSH on the Pi 4B.

A decision on the Sentinel namespace (subdomain pattern).

Initialization Steps

0) Quick hardening on the Pi 4B

Before exposing anything, ensure SSH is key-only and reachable locally.

Suggested minimum:

Disable password authentication for SSH.

Keep SSH bound to localhost/LAN (default is fine).

1) Install cloudflared on the Pi 4B

Install the Cloudflare Tunnel connector (cloudflared) using the package method for your distro.

cloudflared --version

2) Authenticate the connector

Associate the Pi 4B with your Cloudflare account:

cloudflared tunnel login

3) Create the tunnel

Create a locally-managed tunnel and record the UUID + credentials file path:

cloudflared tunnel create sentinel-zero-hop

4) Create /etc/cloudflared/config.yml

Create an ingress map. Replace <TUNNEL-UUID> and <yourdomain>.

tunnel: <TUNNEL-UUID>
credentials-file: /home/pi/.cloudflared/<TUNNEL-UUID>.json

ingress:
  - hostname: ssh.sentinel.<yourdomain>
    service: ssh://localhost:22
  - hostname: health.sentinel.<yourdomain>
    service: http://localhost:8080
  - service: http_status:404

Notes:

SSH is the single public entry point (still gated by Access).

Health endpoint is optional; omit if unused.

5) Route DNS hostnames to the tunnel

Create DNS routes for each hostname:

cloudflared tunnel route dns sentinel-zero-hop ssh.sentinel.<yourdomain>
cloudflared tunnel route dns sentinel-zero-hop health.sentinel.<yourdomain>

6) Run cloudflared as a service

Install and enable the service so it survives reboots:

sudo cloudflared service install
sudo systemctl enable --now cloudflared
sudo systemctl status cloudflared

If your service needs to point at a specific config path, adjust the unit to run:

cloudflared tunnel run --config /etc/cloudflared/config.yml sentinel-zero-hop

7) Put Cloudflare Access in front of SSH

In Cloudflare Zero Trust, create an Access application for ssh.sentinel.<yourdomain> and restrict it to the Operator identity (and optionally device posture).

Recommended policy requirements:

MFA required.

Only Operator accounts/groups allowed.

Optional: require device posture (Operator machine).

8) Operator connection flow

From the Operator machine, connect using the Cloudflare Access SSH method you choose (browser SSH or client-based flow). After Access auth, you should land on the Pi 4B. From there, hop to the Pi 5 cluster via Tailscale/LAN.

Verification Checklist

On the Pi 4B:

cloudflared tunnel list
cloudflared tunnel info sentinel-zero-hop
sudo journalctl -u cloudflared -n 50 --no-pager

From the Operator:

Visit ssh.sentinel.<yourdomain> and confirm Access policy enforcement.

After authentication, confirm an SSH session to the Pi 4B.

Operational Notes

Design intent:

Only the Physical Gateway is reachable via the tunnel.

Compute enclave nodes remain unexposed; access them via the gateway + Tailscale.

Treat tunnel host as a bouncer: minimal services, minimal secrets, maximum logging.
