"""Distributed message bus for multi-agent communication."""

import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Set
from uuid import uuid4

import redis.asyncio as aioredis
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Prism Message Bus", version="0.1.0")


class Message(BaseModel):
    """Agent message."""

    id: str = Field(default_factory=lambda: str(uuid4()))
    sender: str = Field(..., description="Agent ID sending the message")
    recipient: str | None = Field(None, description="Specific recipient (None for broadcast)")
    topic: str = Field("default", description="Message topic/channel")
    payload: Dict[str, Any] = Field(..., description="Message payload")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    metadata: Dict[str, Any] = Field(default_factory=dict)


class MessageBus:
    """Distributed message bus using Redis Pub/Sub."""

    def __init__(self, redis_url: str = "redis://localhost:6379"):
        """Initialize message bus."""
        self.redis_url = redis_url
        self.redis: aioredis.Redis | None = None
        self.pubsub: aioredis.client.PubSub | None = None
        self.websocket_connections: Dict[str, Set[WebSocket]] = {}
        self.agent_topics: Dict[str, Set[str]] = {}

    async def connect(self):
        """Connect to Redis."""
        self.redis = await aioredis.from_url(self.redis_url, encoding="utf-8", decode_responses=True)
        self.pubsub = self.redis.pubsub()
        logger.info("Connected to Redis message bus")

    async def disconnect(self):
        """Disconnect from Redis."""
        if self.pubsub:
            await self.pubsub.close()
        if self.redis:
            await self.redis.close()

    async def publish(self, message: Message) -> None:
        """Publish message to bus."""
        if not self.redis:
            raise RuntimeError("Not connected to Redis")

        channel = f"topic:{message.topic}"
        await self.redis.publish(channel, message.model_dump_json())

        # Store in history
        await self.redis.lpush(f"history:{message.topic}", message.model_dump_json())
        await self.redis.ltrim(f"history:{message.topic}", 0, 999)  # Keep last 1000

        logger.info(f"Published message {message.id} from {message.sender} to topic {message.topic}")

    async def subscribe(self, agent_id: str, topics: List[str]) -> None:
        """Subscribe agent to topics."""
        if not self.pubsub:
            raise RuntimeError("Not connected to Redis")

        for topic in topics:
            await self.pubsub.subscribe(f"topic:{topic}")
            if agent_id not in self.agent_topics:
                self.agent_topics[agent_id] = set()
            self.agent_topics[agent_id].add(topic)

        logger.info(f"Agent {agent_id} subscribed to {topics}")

    async def unsubscribe(self, agent_id: str, topics: List[str] | None = None) -> None:
        """Unsubscribe agent from topics."""
        if not self.pubsub:
            return

        if topics is None:
            topics = list(self.agent_topics.get(agent_id, []))

        for topic in topics:
            await self.pubsub.unsubscribe(f"topic:{topic}")
            if agent_id in self.agent_topics:
                self.agent_topics[agent_id].discard(topic)

        logger.info(f"Agent {agent_id} unsubscribed from {topics}")

    async def get_history(self, topic: str, limit: int = 100) -> List[Message]:
        """Get message history for topic."""
        if not self.redis:
            raise RuntimeError("Not connected to Redis")

        messages_json = await self.redis.lrange(f"history:{topic}", 0, limit - 1)
        return [Message(**json.loads(msg)) for msg in messages_json]

    def register_websocket(self, agent_id: str, websocket: WebSocket):
        """Register WebSocket connection for agent."""
        if agent_id not in self.websocket_connections:
            self.websocket_connections[agent_id] = set()
        self.websocket_connections[agent_id].add(websocket)

    def unregister_websocket(self, agent_id: str, websocket: WebSocket):
        """Unregister WebSocket connection."""
        if agent_id in self.websocket_connections:
            self.websocket_connections[agent_id].discard(websocket)
            if not self.websocket_connections[agent_id]:
                del self.websocket_connections[agent_id]


# Global bus instance
bus = MessageBus()


@app.on_event("startup")
async def startup():
    """Startup event."""
    await bus.connect()


@app.on_event("shutdown")
async def shutdown():
    """Shutdown event."""
    await bus.disconnect()


@app.get("/health")
async def health():
    """Health check."""
    return {"status": "healthy", "service": "message-bus"}


@app.post("/v1/publish")
async def publish_message(message: Message):
    """Publish a message to the bus."""
    await bus.publish(message)
    return {"status": "published", "message_id": message.id}


@app.get("/v1/history/{topic}")
async def get_history(topic: str, limit: int = 100):
    """Get message history for a topic."""
    messages = await bus.get_history(topic, limit)
    return {"topic": topic, "count": len(messages), "messages": messages}


@app.websocket("/v1/ws/{agent_id}")
async def websocket_endpoint(websocket: WebSocket, agent_id: str):
    """WebSocket endpoint for real-time messaging."""
    await websocket.accept()
    bus.register_websocket(agent_id, websocket)
    logger.info(f"WebSocket connected: {agent_id}")

    try:
        # Handle incoming messages
        async def receive_messages():
            while True:
                try:
                    data = await websocket.receive_json()
                    if data.get("type") == "subscribe":
                        topics = data.get("topics", [])
                        await bus.subscribe(agent_id, topics)
                        await websocket.send_json({"type": "subscribed", "topics": topics})
                    elif data.get("type") == "publish":
                        message = Message(**data.get("message", {}))
                        message.sender = agent_id
                        await bus.publish(message)
                    elif data.get("type") == "unsubscribe":
                        topics = data.get("topics")
                        await bus.unsubscribe(agent_id, topics)
                except Exception as e:
                    logger.error(f"Error receiving message: {e}")
                    break

        # Handle outgoing messages from Redis
        async def send_messages():
            if not bus.pubsub:
                return

            while True:
                try:
                    message = await bus.pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                    if message and message["type"] == "message":
                        await websocket.send_json({"type": "message", "data": json.loads(message["data"])})
                except Exception as e:
                    logger.error(f"Error sending message: {e}")
                    break

        # Run both tasks
        await asyncio.gather(receive_messages(), send_messages())

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {agent_id}")
    finally:
        bus.unregister_websocket(agent_id, websocket)
        await bus.unsubscribe(agent_id)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8002)
