# 🧠 BlackRoad Gateway - Adaptive Learning System

## Overview

The BlackRoad Copilot Gateway now includes **adaptive learning** that continuously improves routing decisions based on real-world performance data.

## Features

### ✅ Performance Tracking
- Records every routing decision
- Tracks success/failure rates
- Measures response latency
- Stores last 1,000 requests

### ✅ Metrics Analysis
- Per-model performance scores
- Per-intent success rates
- Average/min/max latency tracking
- Confidence scoring based on sample size

### ✅ Adaptive Routing
- Automatically reorders models by performance
- Promotes better-performing models
- Learns optimal model selection
- Self-optimizing gateway

### ✅ Data Persistence
- `~/copilot-agent-gateway/data/performance-history.json`
- `~/copilot-agent-gateway/data/performance-metrics.json`
- Automatic cleanup of old data

---

## API Endpoints

### Get Learning Statistics
```bash
curl http://localhost:3030/api/learning/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "adaptiveMode": true,
    "learning": {
      "totalRequests": 42,
      "uniqueIntents": 5,
      "uniqueModels": 3,
      "overallSuccessRate": 0.95,
      "avgLatency": 1250,
      "topPerformers": [
        {
          "intent": "code-generation",
          "model": "qwen2.5-coder:7b",
          "successRate": 0.98,
          "avgLatency": 980,
          "requests": 15,
          "score": 0.92
        }
      ]
    }
  }
}
```

### Get Best Model for Intent
```bash
curl http://localhost:3030/api/learning/best/code-generation
```

**Response:**
```json
{
  "success": true,
  "intent": "code-generation",
  "bestModel": "qwen2.5-coder:7b"
}
```

### Get Recommended Models
```bash
curl "http://localhost:3030/api/learning/recommendations/code-generation?count=3"
```

**Response:**
```json
{
  "success": true,
  "intent": "code-generation",
  "recommendations": [
    {
      "model": "qwen2.5-coder:7b",
      "successRate": 0.98,
      "avgLatency": 980,
      "confidence": 0.95
    },
    {
      "model": "codellama:7b",
      "successRate": 0.92,
      "avgLatency": 1100,
      "confidence": 0.85
    }
  ]
}
```

### Toggle Adaptive Mode
```bash
# Enable adaptive mode
curl -X POST http://localhost:3030/api/learning/adaptive/on

# Disable adaptive mode  
curl -X POST http://localhost:3030/api/learning/adaptive/off
```

---

## How It Works

### 1. Request Routing
```
User Request → Classifier → Adaptive Router → Model Selection
                                    ↓
                          Performance Learning
```

### 2. Performance Recording
Every request records:
- Intent type
- Selected model
- Success/failure
- Response latency
- Provider & instance details
- Timestamp

### 3. Metrics Calculation
For each intent+model pair:
```javascript
{
  totalRequests: 15,
  successfulRequests: 14,
  failedRequests: 1,
  successRate: 0.93,
  avgLatency: 1050,
  minLatency: 850,
  maxLatency: 1400,
  lastUsed: "2026-02-18T02:45:00Z"
}
```

### 4. Performance Scoring
```javascript
score = (successRate * 0.7) + (latencyScore * 0.3)

// Where latencyScore = 1 - min(avgLatency / 5000, 1)
```

### 5. Adaptive Reordering
When routing a request, models are reordered by performance score:
```
Before: [model-a, model-b, model-c]
After:  [model-c, model-a, model-b]  // Sorted by score
```

---

## Configuration

### Minimum Requests for Confidence
```javascript
const minRequests = 10  // At least 10 requests needed for confidence
```

### Viable Model Threshold
```javascript
const minSuccessRate = 0.7  // 70% success rate minimum
```

### History Retention
```javascript
const maxHistory = 1000  // Keep last 1000 requests
```

---

## Testing

### Test Script
```bash
~/test-learning-system.sh
```

### Manual Testing
```bash
# Send test requests
curl -X POST http://localhost:3030/api/test-route \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Write a Python function","intent":"code-generation"}'

# Check learning stats
curl http://localhost:3030/api/learning/stats

# View raw data
cat ~/copilot-agent-gateway/data/performance-metrics.json
```

---

## Benefits

### 🚀 Performance Optimization
- Gateway learns which models work best
- Automatically routes to fastest models
- Improves response times over time

### 📊 Data-Driven Decisions
- No guessing which model to use
- Real performance data
- Confidence-based recommendations

### 🔄 Self-Healing
- Poor-performing models demoted
- High-performing models promoted
- Adapts to changing conditions

### 📈 Continuous Improvement
- More requests = better learning
- Performance improves automatically
- No manual tuning required

---

## Architecture

```
AdaptiveRouter
  ├── PerformanceLearner
  │   ├── history[]        (recent requests)
  │   └── metrics{}        (aggregated stats)
  └── RouteEngine
      ├── ApiMap          (model registry)
      ├── ApiProvider     (provider abstraction)
      └── ApiInstance     (endpoint tracking)
```

---

## Files

- `~/copilot-agent-gateway/learning/performance-learner.js` - Learning engine
- `~/copilot-agent-gateway/learning/adaptive-router.js` - Adaptive routing logic
- `~/copilot-agent-gateway/web-server.js` - Updated with learning endpoints
- `~/copilot-agent-gateway/data/performance-history.json` - Request history
- `~/copilot-agent-gateway/data/performance-metrics.json` - Aggregated metrics
- `~/test-learning-system.sh` - Testing script

---

## What's Next

The gateway is now **fully intelligent**:
- ✅ 8-layer routing architecture
- ✅ Real-time health monitoring
- ✅ Load balancing
- ✅ Performance tracking
- ✅ Adaptive learning
- ✅ Self-optimization

**The gateway gets smarter with every request!** 🧠✨

