"""
BlackRoad Agent Orchestrator — Task Router & Load Balancer
Routes tasks to the best node/agent based on archetype, load, and capacity.
"""
import logging
import time
from dataclasses import dataclass
from .config import NODES
from .nats_protocol import HeartbeatMessage

log = logging.getLogger("orchestrator.router")


@dataclass
class NodeState:
    node: str
    active_agents: int = 0
    idle_agents: int = 0
    pending_tasks: int = 0
    cpu_percent: float = 0.0
    mem_percent: float = 0.0
    inference_queue: int = 0
    last_heartbeat: float = 0.0
    healthy: bool = True


class TaskRouter:
    """Routes tasks to the optimal node based on load and availability."""

    def __init__(self):
        self._node_states: dict[str, NodeState] = {}
        for name in NODES:
            self._node_states[name] = NodeState(node=name)

    def update_heartbeat(self, hb: HeartbeatMessage):
        """Update node state from heartbeat."""
        state = self._node_states.get(hb.node)
        if state:
            state.active_agents = hb.active_agents
            state.idle_agents = hb.idle_agents
            state.pending_tasks = hb.pending_tasks
            state.cpu_percent = hb.cpu_percent
            state.mem_percent = hb.mem_percent
            state.inference_queue = hb.inference_queue
            state.last_heartbeat = hb.timestamp
            state.healthy = True

    def check_health(self, timeout: float = 30.0):
        """Mark nodes unhealthy if heartbeat is stale."""
        now = time.time()
        for state in self._node_states.values():
            if state.last_heartbeat and (now - state.last_heartbeat) > timeout:
                if state.healthy:
                    log.warning("Node %s heartbeat stale (%.0fs)", state.node, now - state.last_heartbeat)
                    state.healthy = False

    def best_node(self, archetype: str) -> str | None:
        """Pick the best node for a task based on load balancing.

        Strategy:
        1. Filter to healthy nodes that have pools for this archetype
        2. Prefer nodes with more idle agents
        3. Break ties by lowest inference queue depth
        """
        candidates = []
        for name, state in self._node_states.items():
            if not state.healthy:
                continue
            config = NODES[name]
            if state.active_agents >= config.max_concurrent_agents:
                continue
            if state.idle_agents <= 0:
                continue
            candidates.append(state)

        if not candidates:
            return None

        # Sort by: most idle agents, then least inference queue
        candidates.sort(key=lambda s: (-s.idle_agents, s.inference_queue))
        best = candidates[0]

        log.debug(
            "Routed %s task to %s (idle=%d, queue=%d)",
            archetype, best.node, best.idle_agents, best.inference_queue,
        )
        return best.node

    def node_states(self) -> list[dict]:
        """Return all node states as dicts."""
        self.check_health()
        return [
            {
                "node": s.node,
                "host": NODES[s.node].host,
                "healthy": s.healthy,
                "active_agents": s.active_agents,
                "idle_agents": s.idle_agents,
                "pending_tasks": s.pending_tasks,
                "inference_queue": s.inference_queue,
                "last_heartbeat": s.last_heartbeat,
                "max_concurrent": NODES[s.node].max_concurrent_agents,
            }
            for s in self._node_states.values()
        ]

    def cluster_stats(self) -> dict:
        """Aggregate cluster statistics."""
        self.check_health()
        healthy = [s for s in self._node_states.values() if s.healthy]
        return {
            "total_nodes": len(self._node_states),
            "healthy_nodes": len(healthy),
            "total_active": sum(s.active_agents for s in self._node_states.values()),
            "total_idle": sum(s.idle_agents for s in self._node_states.values()),
            "total_pending": sum(s.pending_tasks for s in self._node_states.values()),
            "total_inference_queue": sum(s.inference_queue for s in healthy),
        }
