"""BlackRoad Agent Communication System

Implements agent-to-agent communication via event bus with:
- Typed message protocols
- Request/response patterns
- Pub/sub broadcasting
- Message persistence
- NATS JetStream adapter (production)

Based on Cece Agent Mode v2.0 coordination model."""

import asyncio
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Callable, Awaitable
from datetime import datetime, UTC
from enum import Enum
import json
from pathlib import Path
import uuid


class MessageType(Enum):
    """Agent message types."""
    REQUEST = "request"  # Expecting response
    RESPONSE = "response"  # Reply to request
    BROADCAST = "broadcast"  # One-to-many
    NOTIFICATION = "notification"  # Fire-and-forget
    ERROR = "error"  # Error notification


class MessagePriority(Enum):
    """Message priority levels."""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


@dataclass
class Message:
    """A message between agents.

    Messages flow through the event bus and can be:
    - Point-to-point (request/response)
    - Broadcast (pub/sub)
    - Persistent (logged to journal)"""
    id: str
    type: MessageType
    sender_id: str
    recipient_id: Optional[str]  # None for broadcasts
    topic: str
    payload: Dict[str, Any]
    priority: MessagePriority = MessagePriority.NORMAL

    # Metadata
    timestamp: str = field(default_factory=lambda: datetime.now(UTC).isoformat())
    correlation_id: Optional[str] = None  # For request/response pairing
    reply_to: Optional[str] = None
    ttl_seconds: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "id": self.id,
            "type": self.type.value,
            "sender_id": self.sender_id,
            "recipient_id": self.recipient_id,
            "topic": self.topic,
            "payload": self.payload,
            "priority": self.priority.value,
            "timestamp": self.timestamp,
            "correlation_id": self.correlation_id,
            "reply_to": self.reply_to,
            "ttl_seconds": self.ttl_seconds
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Message":
        """Create from dictionary."""
        return cls(
            id=data["id"],
            type=MessageType(data["type"]),
            sender_id=data["sender_id"],
            recipient_id=data.get("recipient_id"),
            topic=data["topic"],
            payload=data["payload"],
            priority=MessagePriority(data.get("priority", "normal")),
            timestamp=data.get("timestamp", datetime.utcnow().isoformat()),
            correlation_id=data.get("correlation_id"),
            reply_to=data.get("reply_to"),
            ttl_seconds=data.get("ttl_seconds")
        )


MessageHandler = Callable[[Message], Awaitable[Optional[Message]]]


class CommunicationBus:
    """Enhanced event bus for agent-to-agent communication.

    Supports:
    - Topic-based pub/sub
    - Point-to-point messaging
    - Request/response patterns
    - Message persistence
    - Priority queues"""

    def __init__(self, persist_dir: Optional[Path] = None):
        self.persist_dir = persist_dir or Path("data/messages")
        self.persist_dir.mkdir(parents=True, exist_ok=True)

        # Topic subscriptions
        self.subscriptions: Dict[str, List[MessageHandler]] = {}

        # Direct handlers (agent_id -> handler)
        self.agent_handlers: Dict[str, MessageHandler] = {}

        # Pending requests (correlation_id -> future)
        self.pending_requests: Dict[str, asyncio.Future] = {}

        # Message persistence
        self.message_log = self.persist_dir / "messages.jsonl"

        # Statistics
        self.stats = {
            "sent": 0,
            "received": 0,
            "broadcasts": 0,
            "requests": 0,
            "responses": 0
        }

    async def send(
        self,
        sender_id: str,
        topic: str,
        payload: Dict[str, Any],
        recipient_id: Optional[str] = None,
        priority: MessagePriority = MessagePriority.NORMAL,
        wait_for_response: bool = False,
        timeout: float = 30.0
    ) -> Optional[Message]:
        """Send a message to a topic or specific agent.

        Args:
            sender_id: ID of sending agent
            topic: Message topic
            payload: Message data
            recipient_id: Specific recipient (None for broadcast)
            priority: Message priority
            wait_for_response: Wait for reply if request
            timeout: Response timeout in seconds

        Returns:
            Response message if wait_for_response=True, else None"""
        # Create message
        message_type = MessageType.REQUEST if wait_for_response else MessageType.BROADCAST
        correlation_id = str(uuid.uuid4()) if wait_for_response else None

        message = Message(
            id=str(uuid.uuid4()),
            type=message_type,
            sender_id=sender_id,
            recipient_id=recipient_id,
            topic=topic,
            payload=payload,
            priority=priority,
            correlation_id=correlation_id
        )

        # Persist message
        self._persist_message(message)

        # Setup response waiting
        response_future = None
        if wait_for_response:
            response_future = asyncio.Future()
            self.pending_requests[correlation_id] = response_future

        # Deliver message
        await self._deliver_message(message)

        # Update stats
        self.stats["sent"] += 1
        if wait_for_response:
            self.stats["requests"] += 1
        else:
            self.stats["broadcasts"] += 1

        # Wait for response if requested
        if wait_for_response:
            try:
                response = await asyncio.wait_for(response_future, timeout=timeout)
                return response
            except asyncio.TimeoutError:
                del self.pending_requests[correlation_id]
                raise TimeoutError(f"No response received within {timeout}s")

        return None

    async def broadcast(
        self,
        sender_id: str,
        topic: str,
        payload: Dict[str, Any],
        priority: MessagePriority = MessagePriority.NORMAL
    ):
        """Broadcast a message to all subscribers of a topic."""
        await self.send(
            sender_id=sender_id,
            topic=topic,
            payload=payload,
            recipient_id=None,
            priority=priority,
            wait_for_response=False
        )

    async def reply(
        self,
        original_message: Message,
        sender_id: str,
        payload: Dict[str, Any]
    ):
        """Reply to a request message."""
        response = Message(
            id=str(uuid.uuid4()),
            type=MessageType.RESPONSE,
            sender_id=sender_id,
            recipient_id=original_message.sender_id,
            topic=original_message.topic,
            payload=payload,
            correlation_id=original_message.correlation_id,
            reply_to=original_message.id
        )

        # Persist
        self._persist_message(response)

        # Resolve pending request
        if original_message.correlation_id in self.pending_requests:
            future = self.pending_requests.pop(original_message.correlation_id)
            future.set_result(response)

        # Also deliver to topic subscribers
        await self._deliver_message(response)

        self.stats["responses"] += 1

    def subscribe(self, topic: str, handler: MessageHandler):
        """Subscribe to a topic."""
        if topic not in self.subscriptions:
            self.subscriptions[topic] = []
        self.subscriptions[topic].append(handler)

    def unsubscribe(self, topic: str, handler: MessageHandler):
        """Unsubscribe from a topic."""
        if topic in self.subscriptions:
            self.subscriptions[topic].remove(handler)

    def register_agent(self, agent_id: str, handler: MessageHandler):
        """Register a direct message handler for an agent."""
        self.agent_handlers[agent_id] = handler

    def unregister_agent(self, agent_id: str):
        """Unregister an agent's message handler."""
        if agent_id in self.agent_handlers:
            del self.agent_handlers[agent_id]

    async def _deliver_message(self, message: Message):
        """Deliver a message to appropriate handlers."""
        handlers_called = 0

        # Direct delivery to specific agent
        if message.recipient_id and message.recipient_id in self.agent_handlers:
            handler = self.agent_handlers[message.recipient_id]
            asyncio.create_task(self._call_handler(handler, message))
            handlers_called += 1

        # Topic-based delivery
        if message.topic in self.subscriptions:
            for handler in self.subscriptions[message.topic]:
                asyncio.create_task(self._call_handler(handler, message))
                handlers_called += 1

        self.stats["received"] += handlers_called

    async def _call_handler(self, handler: MessageHandler, message: Message):
        """Call a message handler with error handling."""
        try:
            response = await handler(message)
            # If handler returns a response, send it
            if response:
                await self.reply(message, response.sender_id, response.payload)
        except Exception as e:
            # Log error
            error_payload = {
                "error": str(e),
                "original_message_id": message.id,
                "handler": str(handler)
            }
            await self.send(
                sender_id="system",
                topic="errors.message_handler",
                payload=error_payload,
                priority=MessagePriority.HIGH
            )

    def _persist_message(self, message: Message):
        """Persist message to journal."""
        with open(self.message_log, 'a') as f:
            f.write(json.dumps(message.to_dict()) + '\n')

    def get_stats(self) -> Dict[str, int]:
        """Get communication statistics."""
        return self.stats.copy()


class AgentCommunicator:
    """Communication interface for a single agent.

    Wraps the communication bus with agent-specific convenience methods."""

    def __init__(self, agent_id: str, comm_bus: CommunicationBus):
        self.agent_id = agent_id
        self.comm_bus = comm_bus

        # Register self as handler
        self.comm_bus.register_agent(agent_id, self._handle_message)

        # Subscribed topics
        self.topic_handlers: Dict[str, MessageHandler] = {}

    async def _handle_message(self, message: Message) -> Optional[Message]:
        """Internal message handler."""
        # Check if we have a specific handler for this topic
        if message.topic in self.topic_handlers:
            return await self.topic_handlers[message.topic](message)
        return None

    async def send_to(
        self,
        recipient_id: str,
        topic: str,
        payload: Dict[str, Any],
        wait_for_response: bool = False,
        timeout: float = 30.0
    ) -> Optional[Message]:
        """Send a message to a specific agent."""
        return await self.comm_bus.send(
            sender_id=self.agent_id,
            topic=topic,
            payload=payload,
            recipient_id=recipient_id,
            wait_for_response=wait_for_response,
            timeout=timeout
        )

    async def broadcast(
        self,
        topic: str,
        payload: Dict[str, Any]
    ):
        """Broadcast to all subscribers of a topic."""
        await self.comm_bus.broadcast(
            sender_id=self.agent_id,
            topic=topic,
            payload=payload
        )

    def subscribe_to(self, topic: str, handler: MessageHandler):
        """Subscribe to a topic with a handler."""
        self.topic_handlers[topic] = handler
        self.comm_bus.subscribe(topic, handler)

    def unsubscribe_from(self, topic: str):
        """Unsubscribe from a topic."""
        if topic in self.topic_handlers:
            handler = self.topic_handlers.pop(topic)
            self.comm_bus.unsubscribe(topic, handler)


__all__ = [
    "CommunicationBus",
    "AgentCommunicator",
    "Message",
    "MessageType",
    "MessagePriority",
    "MessageHandler"
]
