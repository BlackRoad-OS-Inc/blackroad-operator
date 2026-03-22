# API Creation Plan - BlackRoad Prism Console

## Objective
Create 20+ new API endpoints across three categories to expand platform capabilities and add to KPI metrics.

## Phase 1: Agent Management APIs (7 endpoints)
Location: `/root/blackroad-prism-console/apps/api/src/routes/agents.py`

1. `GET /agents` - List all available agents with metadata
2. `GET /agents/{agent_id}` - Get specific agent details
3. `POST /agents/{agent_id}/execute` - Execute an agent
4. `GET /agents/{agent_id}/status` - Get agent execution status
5. `GET /agents/{agent_id}/history` - Get agent execution history
6. `POST /agents/{agent_id}/configure` - Update agent configuration
7. `DELETE /agents/{agent_id}/executions/{exec_id}` - Cancel/cleanup execution

## Phase 2: Bot Registry APIs (6 endpoints)
Location: `/root/blackroad-prism-console/apps/api/src/routes/bots.py`

1. `GET /bots` - List all registered bots
2. `GET /bots/{bot_id}` - Get bot details and configuration
3. `POST /bots/{bot_id}/trigger` - Trigger bot execution
4. `PUT /bots/{bot_id}/config` - Update bot configuration
5. `GET /bots/{bot_id}/logs` - Get bot execution logs
6. `POST /bots/register` - Register a new bot

## Phase 3: Infrastructure APIs (8 endpoints)
Location: `/root/blackroad-prism-console/apps/api/src/routes/infrastructure.py`

1. `GET /infra/droplets` - List managed droplets
2. `POST /infra/droplets/{id}/repair` - Trigger droplet repair
3. `GET /infra/droplets/{id}/status` - Get droplet health status
4. `POST /infra/cleanup` - Trigger disk cleanup across infrastructure
5. `GET /infra/deployments` - List active deployments
6. `POST /infra/deploy` - Trigger new deployment
7. `GET /infra/metrics` - Get infrastructure metrics
8. `POST /infra/alerts/configure` - Configure alert thresholds

## Implementation Pattern
- FastAPI with APIRouter
- Pydantic BaseModel schemas for request/response
- Async handlers throughout
- HTTPException with structured error details
- Optional authentication guards

## Success Criteria
- 21 new API endpoints operational
- Pydantic schemas for all models
- Consistent error handling
- Documented with OpenAPI/Swagger
