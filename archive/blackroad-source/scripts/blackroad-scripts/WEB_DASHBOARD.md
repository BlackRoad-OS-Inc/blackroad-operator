# Web Dashboard

## 🌐 Visual Gateway Interface

The BlackRoad Copilot Gateway now includes a **beautiful web dashboard** for real-time monitoring and visualization.

## 🚀 Quick Start

```bash
~/start-gateway-web.sh
```

Or manually:
```bash
cd ~/copilot-agent-gateway
OLLAMA_ENDPOINT=http://localhost:11434 node web-server.js
```

Then open: **http://localhost:3030**

## ✨ Dashboard Features

### Real-Time Status Bar
- **Providers**: Number of AI providers registered
- **Instances**: Healthy/total instance count
- **Total Routes**: Cumulative routing decisions
- **Avg Latency**: Average response time across all instances

### Instance Health Monitor
Shows each API instance with:
- 🟢 **Health Status**: Healthy/Down indicator
- **Endpoint**: Instance URL
- **Load**: Active requests
- **Latency**: Average response time
- **Success Rate**: % of successful requests

### Available Models
Lists all BlackRoad AI models:
- Model name (e.g., qwen2.5-coder:7b)
- Description
- Priority level
- Capabilities

### Recent Routing Decisions
Live feed of routing activity:
- Intent classification
- Latency
- Request preview
- Selected model
- Target instance
- Success/failure status

### Auto-Refresh
Dashboard updates every 5 seconds automatically.

## 📊 API Endpoints

### GET /api/stats
Gateway statistics:
```json
{
  "success": true,
  "stats": {
    "providers": 1,
    "models": 5,
    "instances": 1,
    "healthyInstances": 1,
    "totalLoad": 0,
    "avgLatency": 0,
    "totalRoutes": 0,
    "recentRoutes": []
  }
}
```

### GET /api/health
Instance health check:
```json
{
  "success": true,
  "instances": [
    {
      "provider": "BlackRoad AI",
      "endpoint": "http://localhost:11434",
      "healthy": true,
      "load": 0,
      "avgLatency": 0,
      "successRate": 0
    }
  ]
}
```

### GET /api/models
List available models:
```json
{
  "success": true,
  "models": [
    {
      "name": "qwen2.5-coder:7b",
      "provider": "BlackRoad AI",
      "capabilities": ["code_analysis", "code_refactoring"],
      "priority": 1,
      "description": "Best for code analysis"
    }
  ]
}
```

### GET /api/routing-history?limit=50
Recent routing decisions:
```json
{
  "success": true,
  "history": [
    {
      "timestamp": "2026-02-18T01:58:00.000Z",
      "request": "Write a function to...",
      "intent": "code_generation",
      "confidence": 0.95,
      "modelSelected": "deepseek-coder:6.7b",
      "provider": "BlackRoad AI",
      "instance": "http://localhost:11434",
      "latency": 842,
      "success": true
    }
  ]
}
```

### POST /api/test-route
Test routing (for development):
```bash
curl -X POST http://localhost:3030/api/test-route \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Fix this bug in my code",
    "intent": "debugging"
  }'
```

Response:
```json
{
  "success": true,
  "routing": {
    "intent": "debugging",
    "confidence": 1.0,
    "model": "deepseek-coder:6.7b",
    "provider": "BlackRoad AI",
    "instance": "http://localhost:11434",
    "latency": 756,
    "load": 0
  },
  "response": "..."
}
```

## 🎨 Design

The dashboard features:
- **BlackRoad Brand Colors**:
  - Hot Pink (#ff1d6c)
  - Amber (#f5a623)
  - Electric Blue (#2979ff)
  - Dark gradient background

- **Responsive Grid Layout**
- **Auto-refreshing data**
- **Status indicators** (green/red)
- **Smooth animations**
- **Mobile-friendly**

## 🔧 Configuration

### Change Port
```bash
PORT=8080 node web-server.js
```

### Multiple Instances
Edit `layers/route-engine.js` to add more endpoints:
```javascript
const endpoints = [
  'http://localhost:11434',
  'http://cecilia:11434',
  'http://lucidia:11434'
]
```

Dashboard will automatically show all instances with individual health/metrics.

## 🚀 Deployment

### Local Development
```bash
~/start-gateway-web.sh
```

### Production (systemd)
```bash
# Deploy to Pi fleet
~/deploy-copilot-gateway.sh
```

Each Pi will run:
- MCP gateway (stdio) for Copilot CLI
- Web dashboard on port 3030
- Both connected to local Ollama

### Access Across Network
```bash
# Start web server
PORT=3030 node web-server.js

# Access from other machines
http://<pi-ip>:3030
```

## 📈 Use Cases

1. **Monitor Gateway Health**
   - See which instances are up/down
   - Track success rates
   - Identify performance issues

2. **Debug Routing Decisions**
   - Watch routing history in real-time
   - See which models are selected
   - Check latency per request

3. **Performance Analysis**
   - Compare instance performance
   - Identify bottlenecks
   - Optimize routing strategy

4. **Demo/Presentation**
   - Show live routing in action
   - Visualize multi-layer architecture
   - Demonstrate load balancing

## 🎯 Next Steps

1. **Add Charts**: Visualize latency trends, success rates over time
2. **Add Filters**: Filter routing history by intent, model, success
3. **Add Controls**: Manually trigger health checks, clear history
4. **Add Alerts**: Notify when instances go down
5. **Add Metrics Export**: Download performance data as CSV/JSON

Your gateway now has a beautiful visual interface! 🌌
