# 📱 Pixel Office iOS App - TestFlight Setup

Get the visual interface running on your iPhone/iPad!

---

## Quick Links

- **TestFlight Join Link:** https://testflight.apple.com/join/qqTPmvCd
- **Original PixelHQ Repo:** https://github.com/waynedev9598/PixelHQ-bridge
- **Lucidia Fork:** https://github.com/blackboxprogramming/lucidia-workspace

---

## Setup Steps

### 1. Install TestFlight (5 minutes)

On your iPhone/iPad:
1. Open **App Store**
2. Search for **TestFlight**
3. Install TestFlight (it's free from Apple)

### 2. Join PixelHQ Beta (2 minutes)

On your iPhone/iPad:
1. Open this link: https://testflight.apple.com/join/qqTPmvCd
2. Tap **"Accept"** to join the beta
3. Tap **"Install"** to download Pixel Office app

### 3. Start Lucidia Bridge (1 minute)

On your Mac (same WiFi as iPhone):

```bash
cd ~/blackroad/lucidia-workspace
npm start
```

You'll see:
```
┌─────────────────────────────────┐
│  Pairing Code: 123456           │
│  Enter in iOS app to connect    │
└─────────────────────────────────┘
```

### 4. Connect iPhone to Bridge (1 minute)

On your iPhone/iPad:
1. Open **Pixel Office** app
2. It auto-discovers your Mac via Bonjour
3. Enter the **6-digit pairing code**
4. 🎉 **Connected!**

---

## See Lucidia Zones in Action

The original Pixel Office app shows your activity. To trigger Lucidia zone switches:

### Terminal 1: Keep Bridge Running
```bash
cd ~/blackroad/lucidia-workspace
npm start
```

### Terminal 2: Trigger Activities

```bash
# Git commit → Dev Lab 4
cd ~/blackroad
git commit -m "test: zone switch"

# Search → Research Library
grep -r "function" ~/blackroad/lucidia-workspace

# Edit markdown → Research Library  
code ~/blackroad/README.md
```

---

## Advanced: NATS Integration

For manual zone control and event publishing:

### Terminal 1: Start NATS
```bash
nats-server
```

### Terminal 2: Start Lucidia with NATS
```bash
cd ~/blackroad/lucidia-workspace
NATS_URL=nats://localhost:4222 npm start
```

### Terminal 3: Trigger Zone Switches
```bash
# Switch to Communications Tower
nats pub blackroad.zone.control '{"action":"switch","zoneId":"comm_tower"}'

# Switch to Innovation Park
nats pub blackroad.zone.control '{"action":"switch","zoneId":"innovation_park"}'

# Trigger activity-based switch
nats pub blackroad.dev.commit '{"type":"git","message":"feat: kubernetes"}'
```

---

## What You'll See

The Pixel Office app shows:
- ✅ Beautiful pixel art office scene
- ✅ Your avatar moving around as you code
- ✅ Activity indicators (typing, thinking, idle)
- ✅ Real-time updates

The Lucidia backend manages:
- 🗺️ Zone switching logic (5 zones)
- 🔌 NATS event integration
- 📊 Activity tracking and stats
- 🎯 Smart triggers

---

## Troubleshooting

### Can't see bridge in app?
- ✓ Check iPhone and Mac on same WiFi network
- ✓ Disable VPN if active
- ✓ Check macOS firewall settings
- ✓ Restart both bridge and app

### Pairing code not working?
- ✓ Code changes each time bridge restarts
- ✓ Use current code from terminal output
- ✓ Try restarting the bridge

### Not seeing activity?
- ✓ Check Claude Code path exists: `~/.claude`
- ✓ Try test activities (git, file edits)
- ✓ Enable debug mode: `DEBUG=true npm start`

### Zone switches not visible?
- The original Pixel Office app doesn't show zones yet
- Zone logic works in the backend (see terminal output)
- Phase 2 will add custom zone scenes to the iOS app

---

## Network Requirements

- ✓ iPhone/iPad and Mac on **same WiFi network**
- ✓ Bonjour/mDNS not blocked by firewall
- ✓ Port 8080 available (or configure different port)

---

## Future: Custom Lucidia Scenes

Phase 2 will add to the iOS app:
- [ ] Custom pixel art for 5 zones
- [ ] Zone transition animations
- [ ] Multi-agent avatars
- [ ] Zone map UI
- [ ] Agent pathfinding

For now, the original Pixel Office app works perfectly with the Lucidia backend!

---

## Quick Test Script

Run this to verify everything works:

```bash
# Terminal 1
cd ~/blackroad/lucidia-workspace
npm start

# Terminal 2 (after bridge starts)
node test-lucidia.js
```

Watch the terminal output - you'll see zone switches happening!

---

## Links

- **TestFlight:** https://testflight.apple.com/join/qqTPmvCd
- **Lucidia Docs:** LUCIDIA-SETUP-COMPLETE.md
- **Quick Start:** QUICK-START.md

---

*The Pixel Office app was created by waynedev9598. Lucidia extends the backend with multi-zone support.*
