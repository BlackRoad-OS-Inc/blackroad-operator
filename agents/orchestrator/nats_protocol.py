"""
BlackRoad Agent Orchestrator — NATS Protocol Layer
Agent-to-agent and controller-to-node messaging over NATS JetStream.
"""
import json
import time
import logging
import asyncio
from dataclasses import dataclass, asdict
from typing import Callable, Awaitable
import nats
from nats.js.api import StreamConfig, RetentionPolicy

from .config import NATS_URL, SUBJ_TASK_SUBMIT, SUBJ_TASK_RESULT, SUBJ_HEARTBEAT

log = logging.getLogger("orchestrator.nats")


@dataclass
class TaskMessage:
    task_id: str
    archetype: str
    intent: str
    prompt: str
    priority: int = 5           # 1=critical, 10=low
    target_node: str = ""       # empty = any node
    chain_to: str = ""          # next task after completion
    created_at: float = 0.0

    def __post_init__(self):
        if not self.created_at:
            self.created_at = time.time()

    def encode(self) -> bytes:
        return json.dumps(asdict(self)).encode()

    @classmethod
    def decode(cls, data: bytes) -> "TaskMessage":
        return cls(**json.loads(data))


@dataclass
class ResultMessage:
    task_id: str
    agent_id: str
    node: str
    status: str                 # "completed" | "failed" | "timeout"
    result: str = ""
    latency_ms: int = 0
    error: str = ""

    def encode(self) -> bytes:
        return json.dumps(asdict(self)).encode()

    @classmethod
    def decode(cls, data: bytes) -> "ResultMessage":
        return cls(**json.loads(data))


@dataclass
class HeartbeatMessage:
    node: str
    active_agents: int
    idle_agents: int
    pending_tasks: int
    cpu_percent: float = 0.0
    mem_percent: float = 0.0
    inference_queue: int = 0
    timestamp: float = 0.0

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = time.time()

    def encode(self) -> bytes:
        return json.dumps(asdict(self)).encode()

    @classmethod
    def decode(cls, data: bytes) -> "HeartbeatMessage":
        return cls(**json.loads(data))


class NATSBus:
    """NATS JetStream message bus for agent orchestration."""

    def __init__(self, url: str = NATS_URL):
        self.url = url
        self.nc: nats.NATS | None = None
        self.js = None
        self._subs: list = []

    async def connect(self):
        """Connect to NATS and set up JetStream streams."""
        self.nc = await nats.connect(self.url)
        self.js = self.nc.jetstream()

        # Create streams if they don't exist
        try:
            await self.js.add_stream(
                StreamConfig(
                    name="AGENT_TASKS",
                    subjects=["agent.task.>"],
                    retention=RetentionPolicy.WORK_QUEUE,
                    max_msgs=100_000,
                    max_age=3600 * 24,  # 24h retention
                )
            )
        except Exception:
            pass  # Stream already exists

        try:
            await self.js.add_stream(
                StreamConfig(
                    name="AGENT_RESULTS",
                    subjects=["agent.result.>", SUBJ_TASK_RESULT],
                    retention=RetentionPolicy.LIMITS,
                    max_msgs=500_000,
                    max_age=3600 * 72,  # 72h retention
                )
            )
        except Exception:
            pass

        try:
            await self.js.add_stream(
                StreamConfig(
                    name="AGENT_HEARTBEATS",
                    subjects=[SUBJ_HEARTBEAT],
                    retention=RetentionPolicy.LIMITS,
                    max_msgs_per_subject=100,
                    max_age=300,  # 5min retention
                )
            )
        except Exception:
            pass

        log.info("Connected to NATS at %s, JetStream ready", self.url)

    async def disconnect(self):
        if self.nc:
            await self.nc.drain()
            log.info("Disconnected from NATS")

    # --- Publishing ---

    async def publish_task(self, task: TaskMessage):
        """Publish a task for agent consumption. Routes by archetype."""
        subject = f"agent.task.{task.archetype}"
        await self.nc.publish(subject, task.encode())
        log.debug("Published task %s -> %s", task.task_id, subject)

    async def publish_result(self, result: ResultMessage):
        """Publish a task result back to the controller."""
        await self.nc.publish(SUBJ_TASK_RESULT, result.encode())
        log.debug("Published result for task %s", result.task_id)

    async def publish_heartbeat(self, heartbeat: HeartbeatMessage):
        """Publish node heartbeat."""
        await self.nc.publish(SUBJ_HEARTBEAT, heartbeat.encode())

    # --- Subscribing ---

    async def subscribe_tasks(
        self,
        archetype: str,
        handler: Callable[[TaskMessage], Awaitable[None]],
        queue_group: str = "",
    ):
        """Subscribe to tasks for a specific archetype.
        Uses core NATS queue groups (not JetStream) for load balancing.
        Only one node in the queue group gets each message.
        """
        subject = f"agent.task.{archetype}"
        group = queue_group or f"pool-{archetype}"

        async def _cb(msg):
            task = TaskMessage.decode(msg.data)
            try:
                await handler(task)
            except Exception as e:
                log.error("Task handler error for %s: %s", task.task_id, e)

        sub = await self.nc.subscribe(subject, queue=group, cb=_cb)
        self._subs.append(sub)
        log.info("Subscribed to %s (group=%s)", subject, group)
        return sub

    async def subscribe_results(
        self,
        handler: Callable[[ResultMessage], Awaitable[None]],
    ):
        """Subscribe to all task results (controller side)."""
        async def _cb(msg):
            result = ResultMessage.decode(msg.data)
            await handler(result)

        sub = await self.nc.subscribe(SUBJ_TASK_RESULT, cb=_cb)
        self._subs.append(sub)
        log.info("Subscribed to results")
        return sub

    async def subscribe_heartbeats(
        self,
        handler: Callable[[HeartbeatMessage], Awaitable[None]],
    ):
        """Subscribe to node heartbeats (controller side)."""
        async def _cb(msg):
            hb = HeartbeatMessage.decode(msg.data)
            await handler(hb)

        sub = await self.nc.subscribe(SUBJ_HEARTBEAT, cb=_cb)
        self._subs.append(sub)
        log.info("Subscribed to heartbeats")
        return sub
