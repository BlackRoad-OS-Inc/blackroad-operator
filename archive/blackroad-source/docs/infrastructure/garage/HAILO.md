# Hailo-8 AI Accelerator Setup

## Overview

Two Pironman Pi 5 units equipped with Hailo-8 M.2 AI accelerators.

| Device | Serial Number | Firmware | TOPS |
|--------|---------------|----------|------|
| octavia | HLLWM2B233704606 | 4.23.0 | 26 |
| cecilia | HLLWM2B233704667 | 4.23.0 | 26 |

**Total AI Compute: 52 TOPS**

## Hailo-8 Specifications

- **Architecture**: HAILO8
- **Part Number**: HM218B1C2FAE
- **Product Name**: HAILO-8 AI ACC M.2 M KEY MODULE EXT TEMP
- **Performance**: 26 TOPS (Tera Operations Per Second)
- **Interface**: M.2 M-Key (PCIe)

## Quick Commands

### Check Hailo Status
```bash
# Identify device
ssh octavia "hailortcli fw-control identify"

# Scan for devices
ssh octavia "hailortcli scan"

# Check device exists
ssh octavia "ls -la /dev/hailo0"
```

### Run Benchmark
```bash
# On cecilia (has sample models)
ssh cecilia "hailortcli benchmark /usr/share/hailo-models/resnet_v1_50_h8l.hef -t 5"
```

### Sample Output
```
Network resnet_v1_50/resnet_v1_50: 100% | FPS: 23.98
```

## Available Models

Located at `/usr/share/hailo-models/` on cecilia:
- `resnet_v1_50_h10.hef`
- `resnet_v1_50_h8l.hef`
- `scrfd_2.5g_h8l.hef`

## Pironman 5 Fan Service

Both units run the Pironman 5 fan control service:

```bash
# Check status
ssh octavia "systemctl status pironman5"

# View settings
ssh octavia "pironman5 --help"

# RGB LED control
ssh octavia "pironman5 -rc '#FF1D6C' -rs solid"
```

## HailoRT Service

The Hailo runtime service runs automatically:

```bash
ssh cecilia "systemctl status hailort"
```

## Use Cases

1. **Real-time Object Detection** - YOLO models at 30+ FPS
2. **Image Classification** - ResNet, MobileNet
3. **Face Detection** - SCRFD models
4. **Edge AI Inference** - Low latency local processing

## Integration Notes

- Both devices have Docker installed for containerized AI workloads
- Cecilia runs Ollama for LLM inference
- NVMe storage available for model caching
- Tailscale mesh enables remote AI inference calls
