# Headlights by BlackRoad OS, Inc.

**See the Road Ahead.**

Sovereign VR built on Oculus Quest 2, powered by the BlackRoad fleet.

---

## What is Headlights?

Headlights is BlackRoad's VR product layer. It rebrands and extends the Quest 2 experience under sovereign infrastructure:

- **WebXR apps** served from BlackRoad's Pi fleet and Cloudflare edge
- **ADB CLI tools** for device management, sideloading, and streaming
- **Local dashboard** on :8100 for monitoring Quest status, screenshots, and streams
- **Pixel HQ integration** connecting VR to the BlackRoad metaverse (14 floors, 50 agents)

## Architecture

```
Quest 2 <--USB/ADB--> Mac (Alexandria, 192.168.4.28)
                          |
                          +--> headlights.sh CLI (status, mirror, install, stream)
                          +--> Local dashboard (:8100)
                          +--> Pi fleet (Alice, Cecilia, Octavia, Aria, Lucidia)
                          +--> headlights.blackroad.io (WebXR lobby)
```

## Quick Start

```bash
# Check Quest is connected
./bin/headlights.sh status

# Mirror the Quest screen
./bin/headlights.sh mirror

# Launch the local dashboard
npm run dev

# Sideload an APK
./bin/headlights.sh install path/to/app.apk

# Take a screenshot
./bin/headlights.sh screenshot

# Deploy WebXR lobby to edge
npm run deploy
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `headlights status` | Check device connection, battery, model |
| `headlights mirror` | Launch scrcpy to mirror Quest screen |
| `headlights install <apk>` | Sideload an APK to the Quest |
| `headlights screenshot` | Capture and pull a screenshot |
| `headlights info` | Full device info dump |
| `headlights stream` | Start streaming view to local web server |

## Stack

- **Runtime**: Oculus Quest 2 (Android-based)
- **Transport**: ADB over USB
- **WebXR**: A-Frame 1.6
- **Dashboard**: Static HTML served on :8100
- **Edge**: Cloudflare Workers (headlights.blackroad.io)
- **Fleet**: 5 Raspberry Pis via WireGuard mesh

## Brand

- **Product**: Headlights by BlackRoad OS, Inc.
- **Tagline**: See the Road Ahead.
- **Design**: Black backgrounds, Space Grotesk, pink (#FF1D6C) and amber (#F5A623) accents
- **Parent**: BlackRoad OS -- Pave Tomorrow.

---

BlackRoad OS, Inc. -- Pave Tomorrow.
