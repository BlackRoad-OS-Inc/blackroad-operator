# BlackRoad Agent Gateway

RESTful API gateway for orchestrating BlackRoad agent swarms. Provides agent discovery, task submission, and status monitoring capabilities.

## Features

- **Agent Discovery**: List all available agents and their capabilities
- **Task Execution**: Submit tasks to specific agents via Prism Shell
- **Status Monitoring**: Real-time agent health and performance metrics
- **Rate Limiting**: Built-in request throttling
- **Security**: Helmet.js security headers and CORS protection

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## API Endpoints

### Agents

#### GET /v1/agents
List all registered agents.

**Response:**
```json
{
  "count": 31,
  "agents": [
    {
      "id": "CECILIA-7C3E-SPECTRUM-9B4F",
      "name": "cecilia",
      "version": "1.0.0",
      "description": "Creative spectrum engineer",
      "capabilities": ["code_architecture", "system_design"],
      "status": "online"
    }
  ]
}
```

#### GET /v1/agents/:id
Get specific agent details.

**Response:**
```json
{
  "manifest": {
    "name": "cecilia",
    "version": "1.0.0",
    "agent_id": "CECILIA-7C3E-SPECTRUM-9B4F",
    "description": "Creative spectrum engineer",
    "capabilities": ["code_architecture", "system_design"]
  },
  "status": {
    "agent_id": "CECILIA-7C3E-SPECTRUM-9B4F",
    "name": "cecilia",
    "status": "online",
    "last_heartbeat": "2025-11-09T12:00:00Z",
    "tasks_completed": 42,
    "tasks_failed": 1
  }
}
```

#### POST /v1/agents/:id/tasks
Submit a task to an agent.

**Request:**
```json
{
  "task": "Analyze system architecture for performance bottlenecks",
  "context": {
    "repository": "blackroad-prism-console",
    "focus_areas": ["database", "API"]
  },
  "priority": "high",
  "timeout_ms": 30000
}
```

**Response:**
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Task submitted successfully",
  "poll_url": "/v1/tasks/550e8400-e29b-41d4-a716-446655440000"
}
```

#### GET /v1/agents/:id/status
Get agent runtime status.

**Response:**
```json
{
  "agent_id": "CECILIA-7C3E-SPECTRUM-9B4F",
  "name": "cecilia",
  "status": "online",
  "last_heartbeat": "2025-11-09T12:00:00Z",
  "uptime_seconds": 3600,
  "tasks_completed": 42,
  "tasks_failed": 1,
  "cpu_usage": 15.2,
  "memory_usage": 256
}
```

#### GET /v1/agents/capabilities/:capability
Find agents by capability.

**Response:**
```json
{
  "capability": "code_architecture",
  "count": 3,
  "agents": [
    {
      "id": "CECILIA-7C3E-SPECTRUM-9B4F",
      "name": "cecilia",
      "description": "Creative spectrum engineer"
    }
  ]
}
```

### Tasks

#### GET /v1/tasks/:taskId
Get task status and results.

**Response:**
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "agent_id": "CECILIA-7C3E-SPECTRUM-9B4F",
  "status": "completed",
  "result": {
    "analysis": "System architecture analysis complete",
    "bottlenecks": ["Database query N+1 problem", "API rate limiting"]
  },
  "started_at": "2025-11-09T12:00:00Z",
  "completed_at": "2025-11-09T12:00:10Z",
  "execution_time_ms": 10000
}
```

### System

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-09T12:00:00Z",
  "uptime": 3600,
  "agents_loaded": 31
}
```

## Configuration

Environment variables (see `.env.example`):

- `AGENT_GATEWAY_PORT`: Server port (default: 3001)
- `PRISM_SHELL_PATH`: Path to Prism Shell executable
- `AGENTS_PATH`: Path to agents directory
- `LOG_LEVEL`: Logging level (info, debug, error)

## Integration with Prism Console

The Agent Gateway integrates seamlessly with the Prism Console web UI:

```typescript
// Fetch agents
const agents = await fetch('http://localhost:3001/v1/agents').then(r => r.json());

// Submit task
const task = await fetch('http://localhost:3001/v1/agents/cecilia/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ task: 'Analyze code quality' })
}).then(r => r.json());

// Poll for results
const result = await fetch(`http://localhost:3001/v1/tasks/${task.task_id}`)
  .then(r => r.json());
```

## Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

## Architecture

```
Agent Gateway
├── src/
│   ├── index.ts              # Main server
│   ├── routes/
│   │   ├── agents.ts         # Agent endpoints
│   │   └── tasks.ts          # Task endpoints
│   ├── services/
│   │   ├── agent-registry.ts # Agent discovery
│   │   └── task-executor.ts  # Task execution via Prism Shell
│   ├── middleware/
│   │   ├── error-handler.ts  # Error handling
│   │   └── logger.ts         # Request logging
│   └── types/
│       └── agent.ts          # TypeScript types
└── package.json
```

## Production Deployment

```bash
# Build
npm run build

# Start with PM2
pm2 start dist/index.js --name agent-gateway

# Docker
docker build -t agent-gateway .
docker run -p 3001:3001 agent-gateway
```

## License

See main repository LICENSE.
