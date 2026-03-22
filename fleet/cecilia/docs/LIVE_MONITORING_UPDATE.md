# BlackRoad OS - Live System Monitoring

## What Changed

**Added real-time system monitoring:**
- Live CPU usage (%)
- Live memory stats (GB + %)  
- Live disk usage (GB + %)
- Live network traffic (MB sent/received)
- Top processes by CPU usage

## Updates

### Engine (`blackroad-engine.py`)
- Added `psutil` integration
- New function: `get_live_metrics()` — fetches real CPU/memory/disk/network
- New function: `get_live_processes()` — gets top processes
- New function: `update_live_metrics()` — updates state with fresh data
- Event loop now refreshes metrics every 1 second

### Terminal UI (`blackroad-terminal-os.py`)
- Added `update_metrics()` method
- Main buffer now shows live system data
- Auto-refreshes every second
- Non-blocking input (100ms timeout)
- Shows top 10 processes with PID, name, CPU%, MEM%

## Run It

```bash
python3 ~/blackroad-terminal-os.py
```

**You'll see:**
- Real CPU/memory/disk usage updating every second
- Live process list sorted by CPU
- Network traffic totals
- All metrics refresh automatically

**Controls still work:**
- `1-7` to switch tabs
- `j/k` to scroll
- `/` for command mode
- `q` to quit

## Example Output

```
LIVE SYSTEM METRICS:
  CPU:     8.2% (8 cores)
  Memory:  12.4 GB / 16.0 GB (77.5%)
  Disk:    420 GB / 1000 GB (42.0%)
  Network: ↑248.3 MB  ↓1842.7 MB

TOP PROCESSES BY CPU:
  1234     WindowServer            CPU:  4.2%  MEM:  1.8%
  5678     Python                  CPU:  3.1%  MEM:  0.5%
  9012     Chrome                  CPU:  2.4%  MEM:  4.2%
```

## Dependencies

```bash
pip3 install psutil
```

This is the only external dependency. Everything else is standard library.

## What's Next

Now the OS shows **real system state**, not fake data. This makes it actually useful for:
- System monitoring
- Process debugging
- Resource tracking
- Performance analysis

All in a pure terminal interface.
