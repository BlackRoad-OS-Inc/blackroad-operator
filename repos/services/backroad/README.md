# Backroad Service

Advanced routing and load balancing infrastructure for the Blackroad ecosystem. Provides intelligent request routing, health monitoring, and traffic management across all microservices.

## Features

- **Multiple Load Balancing Strategies**:
  - Round Robin - Distributes requests evenly
  - Least Connections - Routes to least busy backend
  - Weighted - Proportional distribution based on weights
  - Sticky Sessions - Session affinity
  - Fastest - Routes to fastest responding backend

- **Service Discovery**: Dynamic backend registration/deregistration
- **Health Monitoring**: Automatic health checks for all backends
- **Metrics**: Prometheus-compatible metrics export
- **Traffic Management**: Connection pooling and rate limiting
- **Logging**: Comprehensive request/response logging

## API Endpoints

### Management

- `POST /api/v1/register` - Register new backend
- `POST /api/v1/deregister` - Deregister backend
- `GET /api/v1/routes` - View routing table
- `GET /health` - Service health
- `GET /metrics` - Prometheus metrics

### Proxied Routes

All traffic to registered services is automatically routed:
- `/api/auth/*` → Auth Service
- `/api/llm/*` → LLM Gateway
- `/api/prism/*` → Prism Console API
- `/api/roadview/*` → RoadView Enhanced
- `/api/cocoding/*` → Co-Coding Portal
- `/api/roadcoin/*` → RoadCoin Service
- `/api/roadchain/*` → RoadChain Service

## Configuration

```bash
PORT=4100
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
HEALTH_CHECK_INTERVAL=30000
```

## Usage

### Register a Backend

```bash
curl -X POST http://localhost:4100/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "my-service",
    "backendUrl": "http://backend:3000",
    "weight": 2
  }'
```

### View Routes

```bash
curl http://localhost:4100/api/v1/routes
```

## Technology Stack

- **http-proxy** - High-performance HTTP proxying
- **Redis** - Session and state management
- **Prometheus** - Metrics collection
- **Winston** - Structured logging

## Architecture

```
┌────────────┐
│  Clients   │
└──────┬─────┘
       │
   ┌───▼────────────┐
   │   Backroad     │  (Load Balancer)
   │   Service      │
   └───┬────────────┘
       │
       ├─────────────────┬──────────────┬────────────────┐
       │                 │              │                │
┌──────▼──────┐   ┌──────▼──────┐  ┌───▼────┐    ┌─────▼────┐
│ Auth Service│   │ LLM Gateway │  │ Prism  │    │ RoadCoin │
└─────────────┘   └─────────────┘  └────────┘    └──────────┘
```
