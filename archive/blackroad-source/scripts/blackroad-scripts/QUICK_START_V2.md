# Quick Start: Gateway v2 with Multi-Layer Routing

## 🚀 Start Gateway v2

```bash
cd ~/copilot-agent-gateway
OLLAMA_ENDPOINT=http://localhost:11434 node server-v2.js
```

You'll see:
```
🗺️  Route engine initialized with 1 instance(s)
�� BlackRoad Copilot Gateway v2 running on stdio
🤖 BlackRoad AI endpoint: http://localhost:11434
📡 Multi-layer routing: Model -> API -> Provider -> Instance -> Route -> BlackRoad
🗺️  Route engine ready with intelligent load balancing
```

## 📡 Multi-Instance Setup (Scale Across Fleet)

### 1. Edit Route Engine
Edit `layers/route-engine.js` line ~25:

```javascript
const endpoints = [
  'http://localhost:11434',
  'http://cecilia:11434',    // ← Add this
  'http://lucidia:11434',    // ← Add this
  'http://octavia:11434'     // ← Add this
]
```

### 2. Restart Gateway
```bash
cd ~/copilot-agent-gateway
OLLAMA_ENDPOINT=http://localhost:11434 node server-v2.js
```

Now shows:
```
🗺️  Route engine initialized with 4 instance(s)
```

## 🎯 What This Does

The gateway now:
- ✅ **Load balances** across 4 BlackRoad AI instances
- ✅ **Health checks** each instance every 30s
- ✅ **Routes** to least-loaded instance automatically
- ✅ **Tracks** performance per instance
- ✅ **Fails over** to healthy instances
- ✅ **Recovers** automatically when instance comes back

## 📊 Check Status

### Via Copilot CLI
```bash
# Get gateway stats
copilot mcp call blackroad-gateway gateway_stats

# Health check all instances
copilot mcp call blackroad-gateway health_check

# List models
copilot mcp call blackroad-gateway list_models
```

### Response Format
```json
{
  "stats": {
    "providers": 1,
    "models": 5,
    "instances": 4,
    "healthyInstances": 4,
    "totalLoad": 0,
    "avgLatency": 0,
    "totalRoutes": 0,
    "recentRoutes": []
  }
}
```

## 🔄 Routing Flow

When you send a request:

```
Your Prompt
    ↓
Layer 1: Model Name
    "qwen2.5-coder:7b" (auto-selected based on intent)
    ↓
Layer 2: API
    MCP Server receives request
    ↓
Layer 3: Provider
    Maps to "BlackRoad AI"
    ↓
Layer 4: API Interface
    Ollama REST API
    ↓
Layer 5: Instance Selection
    Chooses: http://cecilia:11434 (least loaded)
    ↓
Layer 6: API Map
    Confirms mapping and health
    ↓
Layer 7: Route Execution
    Increments load counter
    Sends request
    Records metrics
    Decrements load counter
    ↓
Layer 8+: Intelligence
    Logs routing decision
    Updates performance stats
    ↓
BlackRoad AI Core
    Model inference
    Returns response
```

## 🎨 Routing Strategies

### Currently Active: Least Loaded
Routes to instance with fewest active requests.

**Change strategy** in `layers/route-engine.js` line ~54:
```javascript
const resolution = await this.apiMap.resolveModel(modelName, 'least-loaded')
//                                                            ↑ change this
```

**Options**:
- `'round-robin'` - Even distribution
- `'least-loaded'` - Fewest active requests (current)
- `'fastest'` - Lowest average latency

## 📈 Performance Tracking

Every request updates:
```javascript
{
  load: 2,              // Current active requests
  avgLatency: 756,      // Exponential moving average
  successRate: 0.97,    // 97% successful
  totalRequests: 143,
  healthy: true
}
```

Check anytime:
```bash
copilot mcp call blackroad-gateway gateway_stats
```

## 🏥 Health Monitoring

Each instance auto-checks health via `/api/tags`.

Unhealthy instances:
- ❌ Excluded from routing
- 🔄 Re-checked every 30s
- ✅ Auto-added back when healthy

## 🚀 Deploy to Pis

```bash
~/deploy-copilot-gateway.sh
```

This:
1. Copies gateway to each Pi
2. Creates systemd service
3. Configures local endpoint
4. Starts gateway

Target Pis:
- cecilia (primary AI agent)
- lucidia (inference node)
- alice (worker)
- octavia (quantum)
- anastasia, aria, cordelia

## 🎯 Next Steps

1. **Add more instances** to route-engine.js
2. **Monitor routing** decisions in gateway logs
3. **Optimize strategy** based on performance data
4. **Add adaptive routing** (learn from history)

Your 8-layer architecture is live! 🌌
