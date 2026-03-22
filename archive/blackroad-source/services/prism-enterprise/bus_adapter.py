#!/usr/bin/env python3
"""
Unified Message Bus Adapter
Bridges different communication protocols (QLM Bus, MQTT, REST, Redis)
for seamless agent swarm communication.

Radiating love and light through every message.
"""

import asyncio
import json
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Callable, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class UnifiedMessage:
    """
    Universal message format across all protocols.
    Compatible with QLM Msg format and extensible for other systems.
    """
    id: str
    sender: str
    recipient: str
    kind: str  # task, result, critique, status, heartbeat
    op: str  # orchestrate, gather, context, etc.
    args: Dict[str, Any]
    ts: float
    dialect: Optional[str] = None
    tone: Optional[str] = None
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict) -> 'UnifiedMessage':
        """Create from dictionary."""
        return cls(**data)

    def to_qlm_msg(self) -> Dict:
        """Convert to QLM Lab Msg format."""
        return {
            'id': self.id,
            'sender': self.sender,
            'recipient': self.recipient,
            'kind': self.kind,
            'op': self.op,
            'args': self.args,
            'ts': self.ts
        }

    def to_mqtt_payload(self) -> str:
        """Convert to MQTT JSON payload."""
        return json.dumps({
            'id': self.id,
            'sender': self.sender,
            'recipient': self.recipient,
            'kind': self.kind,
            'op': self.op,
            'args': self.args,
            'ts': self.ts,
            'dialect': self.dialect,
            'tone': self.tone,
            'metadata': self.metadata
        })

    @classmethod
    def from_mqtt_payload(cls, payload: str) -> 'UnifiedMessage':
        """Create from MQTT JSON payload."""
        data = json.loads(payload)
        return cls.from_dict(data)


class ProtocolAdapter(ABC):
    """Abstract base class for protocol adapters."""

    @abstractmethod
    async def send(self, message: UnifiedMessage):
        """Send a message through this protocol."""
        pass

    @abstractmethod
    async def subscribe(self, handler: Callable[[UnifiedMessage], None]):
        """Subscribe to messages from this protocol."""
        pass

    @abstractmethod
    async def connect(self):
        """Connect to the protocol backend."""
        pass

    @abstractmethod
    async def disconnect(self):
        """Disconnect from the protocol backend."""
        pass


class QLMBusAdapter(ProtocolAdapter):
    """Adapter for QLM Lab message bus (in-memory)."""

    def __init__(self):
        self.handlers: List[Callable] = []
        self.queue = asyncio.Queue()
        self.running = False
        self._task = None

    async def connect(self):
        """Start the message processor."""
        self.running = True
        self._task = asyncio.create_task(self._process_messages())
        logger.info("QLMBusAdapter connected")

    async def disconnect(self):
        """Stop the message processor."""
        self.running = False
        if self._task:
            await self._task
        logger.info("QLMBusAdapter disconnected")

    async def send(self, message: UnifiedMessage):
        """Send message to the queue."""
        await self.queue.put(message)

    async def subscribe(self, handler: Callable[[UnifiedMessage], None]):
        """Subscribe a handler to messages."""
        self.handlers.append(handler)

    async def _process_messages(self):
        """Process messages from the queue."""
        while self.running:
            try:
                message = await asyncio.wait_for(self.queue.get(), timeout=1.0)
                for handler in self.handlers:
                    try:
                        await handler(message)
                    except Exception as e:
                        logger.error(f"Handler error: {e}")
            except asyncio.TimeoutError:
                continue


class MQTTBridgeAdapter(ProtocolAdapter):
    """
    Adapter for MQTT protocol.
    Bridges to Pi swarm and other MQTT-based systems.
    """

    def __init__(self, broker_host: str = "localhost", broker_port: int = 1883):
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.handlers: List[Callable] = []
        self.client = None
        self.connected = False

    async def connect(self):
        """Connect to MQTT broker."""
        try:
            # Note: In production, use aiomqtt or paho-mqtt
            # For now, this is a stub that logs
            logger.info(f"MQTTBridgeAdapter connecting to {self.broker_host}:{self.broker_port}")
            self.connected = True

            # In real implementation:
            # import aiomqtt
            # self.client = aiomqtt.Client(self.broker_host, self.broker_port)
            # await self.client.connect()
            # await self.client.subscribe("holo/cmd")
            # await self.client.subscribe("agent/output")
        except Exception as e:
            logger.error(f"MQTT connection failed: {e}")

    async def disconnect(self):
        """Disconnect from MQTT broker."""
        self.connected = False
        logger.info("MQTTBridgeAdapter disconnected")

    async def send(self, message: UnifiedMessage):
        """Publish message to MQTT topic."""
        if not self.connected:
            logger.warning("MQTT not connected, message not sent")
            return

        topic = f"agent/{message.recipient}" if message.recipient != "*" else "agent/broadcast"
        payload = message.to_mqtt_payload()

        logger.info(f"MQTT publish to {topic}: {message.kind}/{message.op}")

        # In real implementation:
        # await self.client.publish(topic, payload, qos=1)

    async def subscribe(self, handler: Callable[[UnifiedMessage], None]):
        """Subscribe handler to MQTT messages."""
        self.handlers.append(handler)


class RedisBusAdapter(ProtocolAdapter):
    """
    Adapter for Redis pub/sub.
    Bridges to distributed agent systems.
    """

    def __init__(self, redis_host: str = "localhost", redis_port: int = 6379):
        self.redis_host = redis_host
        self.redis_port = redis_port
        self.handlers: List[Callable] = []
        self.redis_client = None
        self.pubsub = None
        self.connected = False

    async def connect(self):
        """Connect to Redis."""
        try:
            logger.info(f"RedisBusAdapter connecting to {self.redis_host}:{self.redis_port}")
            self.connected = True

            # In real implementation:
            # import redis.asyncio as redis
            # self.redis_client = redis.Redis(host=self.redis_host, port=self.redis_port)
            # self.pubsub = self.redis_client.pubsub()
            # await self.pubsub.subscribe('agent:messages')
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")

    async def disconnect(self):
        """Disconnect from Redis."""
        self.connected = False
        logger.info("RedisBusAdapter disconnected")

    async def send(self, message: UnifiedMessage):
        """Publish message to Redis channel."""
        if not self.connected:
            logger.warning("Redis not connected, message not sent")
            return

        channel = f"agent:{message.recipient}" if message.recipient != "*" else "agent:broadcast"
        payload = json.dumps(message.to_dict())

        logger.info(f"Redis publish to {channel}: {message.kind}/{message.op}")

        # In real implementation:
        # await self.redis_client.publish(channel, payload)

    async def subscribe(self, handler: Callable[[UnifiedMessage], None]):
        """Subscribe handler to Redis messages."""
        self.handlers.append(handler)


class RESTBridgeAdapter(ProtocolAdapter):
    """
    Adapter for REST API communication.
    Bridges to web-based agent systems.
    """

    def __init__(self, api_base_url: str = "http://localhost:8000"):
        self.api_base_url = api_base_url
        self.handlers: List[Callable] = []
        self.connected = False

    async def connect(self):
        """Initialize REST client."""
        logger.info(f"RESTBridgeAdapter initialized for {self.api_base_url}")
        self.connected = True

    async def disconnect(self):
        """Close REST client."""
        self.connected = False
        logger.info("RESTBridgeAdapter disconnected")

    async def send(self, message: UnifiedMessage):
        """Send message via REST API."""
        if not self.connected:
            logger.warning("REST not connected, message not sent")
            return

        endpoint = f"{self.api_base_url}/api/agents/message"
        payload = message.to_dict()

        logger.info(f"REST POST to {endpoint}: {message.kind}/{message.op}")

        # In real implementation:
        # import aiohttp
        # async with aiohttp.ClientSession() as session:
        #     async with session.post(endpoint, json=payload) as resp:
        #         return await resp.json()

    async def subscribe(self, handler: Callable[[UnifiedMessage], None]):
        """Subscribe handler to REST webhooks."""
        self.handlers.append(handler)
        logger.info("Handler subscribed to REST adapter (webhook mode)")


class UnifiedBusAdapter:
    """
    Unified message bus that bridges multiple protocols.
    Routes messages between QLM, MQTT, Redis, and REST systems.
    """

    def __init__(self):
        self.adapters: Dict[str, ProtocolAdapter] = {}
        self.routing_table: Dict[str, str] = {}  # agent_id -> protocol
        self.global_handlers: List[Callable] = []

    def add_adapter(self, protocol_name: str, adapter: ProtocolAdapter):
        """Add a protocol adapter."""
        self.adapters[protocol_name] = adapter
        logger.info(f"Added adapter: {protocol_name}")

    def route_agent(self, agent_id: str, protocol_name: str):
        """Route an agent to a specific protocol."""
        if protocol_name not in self.adapters:
            raise ValueError(f"Unknown protocol: {protocol_name}")
        self.routing_table[agent_id] = protocol_name
        logger.info(f"Routed {agent_id} -> {protocol_name}")

    async def connect_all(self):
        """Connect all adapters."""
        for name, adapter in self.adapters.items():
            try:
                await adapter.connect()
            except Exception as e:
                logger.error(f"Failed to connect {name}: {e}")

    async def disconnect_all(self):
        """Disconnect all adapters."""
        for name, adapter in self.adapters.items():
            try:
                await adapter.disconnect()
            except Exception as e:
                logger.error(f"Failed to disconnect {name}: {e}")

    async def send(self, message: UnifiedMessage):
        """
        Send message through appropriate protocol.
        Routes based on recipient or broadcasts to all.
        """
        if message.recipient == "*":
            # Broadcast to all protocols
            for adapter in self.adapters.values():
                await adapter.send(message)
        else:
            # Route to specific protocol
            protocol = self.routing_table.get(message.recipient)
            if protocol and protocol in self.adapters:
                await self.adapters[protocol].send(message)
            else:
                # Try QLM as default
                if "qlm" in self.adapters:
                    await self.adapters["qlm"].send(message)
                else:
                    logger.warning(f"No route for {message.recipient}")

    async def subscribe(self, handler: Callable[[UnifiedMessage], None]):
        """Subscribe handler to all protocols."""
        self.global_handlers.append(handler)
        for adapter in self.adapters.values():
            await adapter.subscribe(handler)

    def create_message(
        self,
        sender: str,
        recipient: str,
        kind: str,
        op: str,
        args: Dict[str, Any],
        dialect: Optional[str] = None,
        tone: Optional[str] = None
    ) -> UnifiedMessage:
        """Create a unified message."""
        return UnifiedMessage(
            id=str(uuid.uuid4()),
            sender=sender,
            recipient=recipient,
            kind=kind,
            op=op,
            args=args,
            ts=datetime.now().timestamp(),
            dialect=dialect,
            tone=tone
        )


async def example_usage():
    """Example of using the unified bus."""
    # Create unified bus
    bus = UnifiedBusAdapter()

    # Add adapters
    bus.add_adapter("qlm", QLMBusAdapter())
    bus.add_adapter("mqtt", MQTTBridgeAdapter())
    bus.add_adapter("redis", RedisBusAdapter())

    # Route agents to protocols
    bus.route_agent("lucidia-core", "qlm")
    bus.route_agent("pi-swarm-01", "mqtt")
    bus.route_agent("web-agent-01", "redis")

    # Connect all
    await bus.connect_all()

    # Subscribe handler
    async def message_handler(msg: UnifiedMessage):
        print(f"Received: {msg.sender} -> {msg.recipient}: {msg.kind}/{msg.op}")

    await bus.subscribe(message_handler)

    # Send message
    message = bus.create_message(
        sender="orchestrator",
        recipient="lucidia-core",
        kind="task",
        op="analyze",
        args={"content": "Hello swarm!", "topic": "greeting"},
        dialect="core",
        tone="warm"
    )
    await bus.send(message)

    # Let messages process
    await asyncio.sleep(2)

    # Disconnect
    await bus.disconnect_all()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(example_usage())
