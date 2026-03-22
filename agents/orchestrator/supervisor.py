"""
BlackRoad Agent Orchestrator — Node Supervisor
Runs on each Pi node. Manages agent pools, processes tasks, reports health.
"""
import asyncio
import time
import os
import logging
from .config import NODES, NodeConfig
from .spawn import SpawnScheduler
from .nats_protocol import NATSBus, TaskMessage, ResultMessage, HeartbeatMessage
from .agent_worker import OllamaClient, run_agent_task

log = logging.getLogger("orchestrator.supervisor")


class NodeSupervisor:
    """Runs on each Pi node. Subscribes to tasks, dispatches to agents."""

    def __init__(self, node_name: str):
        if node_name not in NODES:
            raise ValueError(f"Unknown node: {node_name}")

        self.node_name = node_name
        self.config: NodeConfig = NODES[node_name]
        self.scheduler = SpawnScheduler()
        self.bus = NATSBus()
        self.ollama = OllamaClient(self.config.host, self.config.ollama_port)

        self._active_tasks: dict[str, asyncio.Task] = {}
        self._task_semaphore: asyncio.Semaphore | None = None
        self._running = False
        self._stats = {
            "tasks_processed": 0,
            "tasks_failed": 0,
            "total_latency_ms": 0,
        }

    async def start(self):
        """Start the supervisor: connect NATS, init Ollama, subscribe to tasks."""
        log.info("Starting supervisor for node %s (%s)", self.node_name, self.config.host)

        await self.bus.connect()
        await self.ollama.init(max_concurrent=self.config.max_concurrent_inference)

        self._task_semaphore = asyncio.Semaphore(self.config.max_concurrent_agents)
        self._running = True

        # Subscribe to tasks for each archetype this node handles
        pools = self.scheduler.get_pools_for_node(self.node_name)
        archetypes = set(p.archetype for p in pools)

        for archetype in archetypes:
            await self.bus.subscribe_tasks(
                archetype=archetype,
                handler=self._handle_task,
                queue_group=f"node-{self.node_name}-{archetype}",
            )
            log.info("Listening for %s tasks on node %s", archetype, self.node_name)

        # Start heartbeat loop
        asyncio.create_task(self._heartbeat_loop())

        log.info(
            "Supervisor %s ready: %d pools, %d archetypes, max %d concurrent",
            self.node_name,
            len(pools),
            len(archetypes),
            self.config.max_concurrent_agents,
        )

    async def stop(self):
        """Graceful shutdown."""
        self._running = False

        # Wait for active tasks to finish (with timeout)
        if self._active_tasks:
            log.info("Waiting for %d active tasks...", len(self._active_tasks))
            done, pending = await asyncio.wait(
                self._active_tasks.values(), timeout=30
            )
            for t in pending:
                t.cancel()

        await self.ollama.close()
        await self.bus.disconnect()
        log.info("Supervisor %s stopped", self.node_name)

    async def _handle_task(self, task: TaskMessage):
        """Handle an incoming task: claim an agent, run it, publish result."""
        # Check if we should handle this task (target_node filter)
        if task.target_node and task.target_node != self.node_name:
            return

        async with self._task_semaphore:
            # Claim an idle agent from the pool
            agent = self.scheduler.claim_agent(task.archetype, self.node_name)
            if not agent:
                log.warning(
                    "No idle %s agents on %s for task %s",
                    task.archetype, self.node_name, task.task_id,
                )
                return

            try:
                # Run the agent task
                result = await run_agent_task(
                    agent_id=agent.agent_id,
                    agent_name=agent.name,
                    archetype=agent.archetype,
                    model=agent.model,
                    node=self.node_name,
                    task=task,
                    ollama=self.ollama,
                )

                # Publish result
                await self.bus.publish_result(result)

                # Release agent
                success = result.status == "completed"
                self.scheduler.release_agent(agent.agent_id, success=success)

                # Update stats
                self._stats["tasks_processed"] += 1
                self._stats["total_latency_ms"] += result.latency_ms
                if not success:
                    self._stats["tasks_failed"] += 1

                log.info(
                    "Task %s %s by %s in %dms",
                    task.task_id, result.status, agent.agent_id, result.latency_ms,
                )

            except Exception as e:
                log.error("Task execution error: %s", e)
                self.scheduler.release_agent(agent.agent_id, success=False)
                self._stats["tasks_failed"] += 1

    async def _heartbeat_loop(self):
        """Send periodic heartbeats to the controller."""
        while self._running:
            try:
                pools = self.scheduler.get_pools_for_node(self.node_name)
                total_agents = sum(p.count for p in pools)
                active_agents = sum(p.active for p in pools)

                hb = HeartbeatMessage(
                    node=self.node_name,
                    active_agents=active_agents,
                    idle_agents=total_agents - active_agents,
                    pending_tasks=len(self._active_tasks),
                    inference_queue=self.config.max_concurrent_inference
                    - self.ollama._semaphore._value
                    if self.ollama._semaphore
                    else 0,
                )
                await self.bus.publish_heartbeat(hb)
            except Exception as e:
                log.error("Heartbeat error: %s", e)

            await asyncio.sleep(10)

    def stats(self) -> dict:
        pools = self.scheduler.get_pools_for_node(self.node_name)
        return {
            "node": self.node_name,
            "host": self.config.host,
            "total_agents": sum(p.count for p in pools),
            "active_agents": sum(p.active for p in pools),
            "max_concurrent": self.config.max_concurrent_agents,
            "tasks_processed": self._stats["tasks_processed"],
            "tasks_failed": self._stats["tasks_failed"],
            "avg_latency_ms": (
                self._stats["total_latency_ms"] // max(1, self._stats["tasks_processed"])
            ),
        }
