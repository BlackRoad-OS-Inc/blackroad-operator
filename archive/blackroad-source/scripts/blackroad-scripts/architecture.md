# BlackRoad Gateway Architecture

## Multi-Layer Routing Flow

```
┌─────────────┐
│ Model Name  │  "qwen2.5-coder:7b"
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   API       │  Initial API abstraction
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Provider   │  BlackRoad AI (Ollama-powered)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   API       │  Provider-specific API interface
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Instance│  http://localhost:11434
└──────┬──────┘  http://cecilia:11434
       │         http://lucidia:11434
       ▼
┌─────────────┐
│  API Map    │  Model -> Provider -> Instance mapping
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Route     │  Routing decision with load balancing
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    ...      │  Additional routing layers (fallback, retry, etc.)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  BlackRoad  │  Actual model execution
└─────────────┘
```

## Components

### Layer 1: Model Name
- User requests a specific model
- Example: "qwen2.5-coder:7b"

### Layer 2: API Abstraction
- Initial API layer that receives the request
- MCP server tools: `route_request`

### Layer 3: Provider Resolution
- Maps model to provider
- Example: "qwen2.5-coder:7b" -> "BlackRoad AI"

### Layer 4: Provider API
- Provider-specific API interface
- BlackRoad AI uses Ollama REST API

### Layer 5: Instance Selection
- Multiple API instances for load balancing
- Strategies: round-robin, least-loaded, fastest
- Health checking and auto-recovery

### Layer 6: API Map
- Central mapping registry
- Model -> Provider -> Instance
- Tracks health, load, latency per instance

### Layer 7: Route Execution
- Executes the routing decision
- Tracks performance metrics
- Logs routing history

### Layer 8+: Additional Intelligence
- Fallback logic (try next model if primary fails)
- Retry logic (retry on transient failures)
- Circuit breaker (stop routing to failed instances)
- Adaptive routing (learn from performance data)

### Final: BlackRoad Execution
- Actual model inference
- Return response to user

## Key Classes

### `ApiProvider`
- Represents a provider (e.g., "BlackRoad AI")
- Manages multiple API instances
- Selects instances based on strategy

### `ApiInstance`
- Single API endpoint
- Tracks: health, load, latency, success rate
- Self-healing health checks

### `ApiMap`
- Central registry
- Maps: model -> provider -> instance
- Provides routing resolution

### `RouteEngine`
- Orchestrates complete routing flow
- Handles all 8+ layers
- Logs performance metrics

## Routing Strategies

### Round Robin
- Distribute requests evenly across instances
- Good for uniform workloads

### Least Loaded
- Route to instance with fewest active requests
- Best for varying request durations

### Fastest
- Route to instance with lowest average latency
- Optimal for latency-sensitive applications

## Health & Recovery

- Periodic health checks (every 30s)
- Auto-mark unhealthy instances
- Auto-recover when healthy again
- Circuit breaker prevents cascade failures

## Performance Tracking

Per instance:
- Active load (current requests)
- Average latency (exponential moving average)
- Success rate (successful / total requests)
- Last health check timestamp

## Future Enhancements

1. **Geo-routing**: Route based on instance location
2. **Cost optimization**: Route to cheapest available instance
3. **Quality routing**: Route based on model quality scores
4. **A/B testing**: Split traffic for experimentation
5. **Canary deployments**: Gradually roll out new instances

