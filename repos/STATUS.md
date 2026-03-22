# Fleet Status

Last checked: 2026-02-09 16:00 CST

## ✅ All Systems Operational

| Device | Status | Uptime | Notes |
|--------|--------|--------|-------|
| alice | ✅ Online | 27d 19h | Load stabilized (was high), disk 82% |
| lucidia | ✅ Online | 31m | Pi 5 + Hailo-8 ✓ |
| aria | ✅ Online | 27d 19h | PRIMARY Docker host |
| octavia | ✅ Online | 27d 19h | Pi 4, 15 containers |
| cecilia | ✅ Online | 1h 34m | Pi 5 + Hailo-8 ✓ |
| shellfish | ✅ Online | 6w 2d | DigitalOcean NYC1 |
| codex-infinity | ✅ Online | 4w 15h | DigitalOcean NYC3 |

## Hailo-8 AI Accelerators

Both detected at `/dev/hailo0`:
- **lucidia**: 26 TOPS (Serial: HLLWM2B233704606)
- **cecilia**: 26 TOPS (Serial: HLLWM2B233704667)
- **Total**: 52 TOPS

## Recent Fixes

### Alice (2026-02-09)
- Restarted runaway tailscaled (was 58% CPU)
- Cleaned up disk: 97% → 82% (gained 2GB)
- Truncated large log files (syslog, messages, daemon.log)
- Vacuumed journal (freed 48MB)
