# Prism Message Bus

Distributed message bus for multi-agent communication using Redis Pub/Sub and WebSockets.

## Features

- **Redis Pub/Sub**: Scalable distributed messaging
- **WebSocket Support**: Real-time bidirectional communication
- **Topic-based Routing**: Flexible message routing
- **Message History**: Persist last 1000 messages per topic
- **Agent Management**: Track agent subscriptions

## Quick Start

```bash
# Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# Run service
poetry run python -m uvicorn app.main:app --reload --port 8002
```

## Usage

### WebSocket Connection

```python
import asyncio
import websockets
import json

async def agent_client():
    async with websockets.connect("ws://localhost:8002/v1/ws/agent-001") as ws:
        # Subscribe to topics
        await ws.send(json.dumps({
            "type": "subscribe",
            "topics": ["default", "agent-commands"]
        }))

        # Send message
        await ws.send(json.dumps({
            "type": "publish",
            "message": {
                "topic": "default",
                "payload": {"action": "ping"}
            }
        }))

        # Receive messages
        while True:
            msg = await ws.recv()
            print(f"Received: {msg}")

asyncio.run(agent_client())
```

### HTTP API

```bash
# Publish message
curl -X POST http://localhost:8002/v1/publish \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "agent-001",
    "topic": "default",
    "payload": {"message": "hello"}
  }'

# Get history
curl http://localhost:8002/v1/history/default?limit=10
```

## License

Copyright (c) 2025 BlackRoad Inc.
