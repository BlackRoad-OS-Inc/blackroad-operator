"""
BlackRoad Agent Orchestrator — Spawn Scheduler
Reads spawn.db pools and lazily activates agents on demand.
Agents are async coroutines, not processes.
"""
import sqlite3
import uuid
import time
import logging
from dataclasses import dataclass
from .config import SPAWN_DB

log = logging.getLogger("orchestrator.spawn")


@dataclass
class AgentRecord:
    agent_id: str
    name: str
    archetype: str
    node: str
    model: str
    status: str
    pool_id: int
    tasks_completed: int = 0
    tasks_failed: int = 0


@dataclass
class PoolRecord:
    pool_id: int
    archetype: str
    node: str
    model: str
    count: int
    active: int = 0


class SpawnScheduler:
    """Manages agent pools and lazy activation from spawn.db."""

    def __init__(self, db_path: str = SPAWN_DB):
        self.db_path = db_path
        self._pools: dict[int, PoolRecord] = {}
        self._active_agents: dict[str, AgentRecord] = {}
        self._load_pools()

    def _conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        return conn

    def _load_pools(self):
        """Load pool definitions from spawn.db."""
        with self._conn() as conn:
            rows = conn.execute("SELECT * FROM pools ORDER BY pool_id").fetchall()
            for r in rows:
                self._pools[r["pool_id"]] = PoolRecord(
                    pool_id=r["pool_id"],
                    archetype=r["archetype"],
                    node=r["node"],
                    model=r["model"],
                    count=r["count"],
                )
            # Count currently active agents per pool
            for pool in self._pools.values():
                row = conn.execute(
                    "SELECT COUNT(*) as c FROM agents WHERE pool_id=? AND status='working'",
                    (pool.pool_id,),
                ).fetchone()
                pool.active = row["c"] if row else 0

        log.info(
            "Loaded %d pools, %d total agents",
            len(self._pools),
            sum(p.count for p in self._pools.values()),
        )

    def get_pools(self) -> list[PoolRecord]:
        return list(self._pools.values())

    def get_pools_for_node(self, node: str) -> list[PoolRecord]:
        return [p for p in self._pools.values() if p.node == node]

    def get_pools_for_archetype(self, archetype: str) -> list[PoolRecord]:
        return [p for p in self._pools.values() if p.archetype == archetype]

    def claim_agent(self, archetype: str, node: str | None = None) -> AgentRecord | None:
        """Claim an idle agent from the pool matching archetype (and optionally node).
        Marks it as 'working' in spawn.db. Returns the agent record or None.
        """
        with self._conn() as conn:
            if node:
                row = conn.execute(
                    """SELECT agent_id, name, archetype, node, model, status, pool_id,
                              tasks_completed, tasks_failed
                       FROM agents
                       WHERE archetype=? AND node=? AND status='idle'
                       LIMIT 1""",
                    (archetype, node),
                ).fetchone()
            else:
                row = conn.execute(
                    """SELECT agent_id, name, archetype, node, model, status, pool_id,
                              tasks_completed, tasks_failed
                       FROM agents
                       WHERE archetype=? AND status='idle'
                       LIMIT 1""",
                    (archetype,),
                ).fetchone()

            if not row:
                return None

            agent = AgentRecord(
                agent_id=row["agent_id"],
                name=row["name"],
                archetype=row["archetype"],
                node=row["node"],
                model=row["model"],
                status="working",
                pool_id=row["pool_id"],
                tasks_completed=row["tasks_completed"],
                tasks_failed=row["tasks_failed"],
            )

            conn.execute(
                "UPDATE agents SET status='working', last_active=datetime('now') WHERE agent_id=?",
                (agent.agent_id,),
            )
            conn.commit()

            self._active_agents[agent.agent_id] = agent
            if agent.pool_id in self._pools:
                self._pools[agent.pool_id].active += 1

            log.info("Claimed agent %s (%s) on %s", agent.agent_id, agent.archetype, agent.node)
            return agent

    def release_agent(self, agent_id: str, success: bool = True):
        """Release an agent back to idle after task completion."""
        with self._conn() as conn:
            if success:
                conn.execute(
                    "UPDATE agents SET status='idle', tasks_completed=tasks_completed+1 WHERE agent_id=?",
                    (agent_id,),
                )
            else:
                conn.execute(
                    "UPDATE agents SET status='idle', tasks_failed=tasks_failed+1 WHERE agent_id=?",
                    (agent_id,),
                )
            conn.commit()

        agent = self._active_agents.pop(agent_id, None)
        if agent and agent.pool_id in self._pools:
            self._pools[agent.pool_id].active = max(0, self._pools[agent.pool_id].active - 1)

        log.info("Released agent %s (success=%s)", agent_id, success)

    def pool_stats(self) -> dict:
        """Return stats for all pools."""
        self._load_pools()
        stats = {
            "total_agents": sum(p.count for p in self._pools.values()),
            "total_active": sum(p.active for p in self._pools.values()),
            "pools": [],
        }
        for p in self._pools.values():
            stats["pools"].append({
                "pool_id": p.pool_id,
                "archetype": p.archetype,
                "node": p.node,
                "model": p.model,
                "total": p.count,
                "active": p.active,
                "idle": p.count - p.active,
            })
        return stats

    def available_by_archetype(self) -> dict[str, int]:
        """How many idle agents per archetype."""
        result = {}
        with self._conn() as conn:
            rows = conn.execute(
                "SELECT archetype, COUNT(*) as c FROM agents WHERE status='idle' GROUP BY archetype"
            ).fetchall()
            for r in rows:
                result[r["archetype"]] = r["c"]
        return result
