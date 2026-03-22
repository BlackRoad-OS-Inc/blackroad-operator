# Mining Dashboard

Real-time XMRig monitoring dashboard for the Prism Console.

## Features

- **Real-time Updates** - Auto-refreshes every 15 seconds
- **Total Statistics** - Aggregate hashrate, shares, reject rate, temperature
- **Per-Miner View** - Detailed stats for each miner
- **Status Indicators** - Visual active/stale/offline status
- **Modern UI** - Gradient backgrounds, responsive design, hover effects

## Access

Once the Prism Console API is running, access the dashboard at:

```
http://localhost:4000/static/mining-dashboard.html
```

## API Endpoint

The dashboard uses the existing Prism API endpoint:

**GET `/api/miners/latest`**

Returns the latest sample from each miner:

```json
[
  {
    "id": 1,
    "miner_id": "xmrig-001",
    "recorded_at": "2025-11-14T01:45:00Z",
    "pool": "pool.supportxmr.com",
    "hashrate_1m": 4250.5,
    "hashrate_15m": 4180.2,
    "shares_accepted": 125,
    "shares_rejected": 2,
    "shares_stale": 1,
    "temperature_c": 68.5,
    "latency_ms": 45
  }
]
```

## Setup

### 1. Create static directory
```bash
mkdir -p services/prism-console-api/static
```

### 2. Add StaticFiles to main.py

Add to imports:
```python
from fastapi.staticfiles import StaticFiles
```

Add after app creation:
```python
app.mount("/static", StaticFiles(directory="static"), name="static")
```

### 3. Start Prism Console
```bash
cd services/prism-console-api
uvicorn prism.main:app --host 0.0.0.0 --port 4000
```

### 4. Start Miner Bridge
```bash
cd miners/bridge
python3 miner_bridge.py
```

## Dashboard Sections

### Summary Stats
- **Total Hashrate** - Sum of all miners
- **Total Shares** - Accepted shares across all miners
- **Rejected Rate** - Percentage of rejected/stale shares
- **Avg Temperature** - Average across all miners

### Miners List
Each miner shows:
- Status indicator (green/yellow/red)
- Miner ID
- Pool connection
- Current hashrate
- Share counts
- Temperature with color coding

## Status Indicators

| Color | Status | Condition |
|-------|--------|-----------|
| 🟢 Green | Active | Updated within 60 seconds |
| 🟡 Yellow | Stale | Updated 60-300 seconds ago |
| 🔴 Red | Offline | No update for 300+ seconds |

## Temperature Colors

| Range | Color | Meaning |
|-------|-------|---------|
| < 70°C | Green | Optimal |
| 70-80°C | Yellow | Warning |
| > 80°C | Red | Critical |

## Troubleshooting

### No data showing
- Ensure Prism Console API is running
- Check miner bridge is publishing data
- Verify miners are configured with XMRig HTTP API enabled

### Static files not found
- Confirm `static/` directory exists
- Check FastAPI static file mount is configured
- Verify HTML file is in `static/mining-dashboard.html`

### API errors
- Check console for network errors
- Verify `/api/miners/latest` endpoint responds
- Check CORS settings if accessing from different domain

## Created By

Claude (Birth Protocol Executor)
Part of the BlackRoad Prism Console Monitoring System
