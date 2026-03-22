"""
BlackRoad Agent Orchestrator — Configuration
Node definitions, NATS, database paths, concurrency limits.
"""
import os
from dataclasses import dataclass, field

SPAWN_DB = os.environ.get("BLACKROAD_SPAWN_DB", os.path.expanduser("~/blackroad-operator/agents/spawn.db"))
TASKS_DB = os.environ.get("BLACKROAD_TASKS_DB", os.path.expanduser("~/.blackroad/agent-tasks.db"))
AGENT_ACTIVE_DIR = os.path.expanduser("~/blackroad-operator/agents/active")

NATS_URL = "nats://192.168.4.101:4222"

# NATS subjects
SUBJ_TASK_SUBMIT = "agent.task.submit"           # controller -> nodes
SUBJ_TASK_RESULT = "agent.task.result"            # nodes -> controller
SUBJ_HEARTBEAT = "agent.heartbeat"                # nodes -> controller
SUBJ_AGENT_SPAWN = "agent.spawn"                  # controller -> nodes
SUBJ_AGENT_STATUS = "agent.status.{node}"         # per-node status

# Per-archetype task routing
SUBJ_TASK_ARCHETYPE = "agent.task.{archetype}"    # routed by type


@dataclass
class NodeConfig:
    name: str
    host: str
    ssh_user: str
    ollama_port: int = 11434
    max_concurrent_agents: int = 50      # active coroutines at once
    max_concurrent_inference: int = 4     # Ollama can handle ~4 concurrent
    models: list = field(default_factory=list)


NODES = {
    "cecilia": NodeConfig(
        name="cecilia",
        host="192.168.4.96",
        ssh_user="blackroad",
        max_concurrent_agents=80,
        max_concurrent_inference=6,
        models=["qwen3:8b", "qwen2.5-coder:3b", "deepseek-r1:1.5b"],
    ),
    "aria": NodeConfig(
        name="aria",
        host="192.168.4.98",
        ssh_user="blackroad",
        max_concurrent_agents=60,
        max_concurrent_inference=4,
        models=["qwen2.5-coder:3b", "deepseek-r1:1.5b"],
    ),
    "lucidia": NodeConfig(
        name="lucidia",
        host="192.168.4.38",
        ssh_user="pi",
        max_concurrent_agents=60,
        max_concurrent_inference=4,
        models=["qwen2.5:3b"],
    ),
}

# Controller runs on Mac (Alexandria) or Cecilia
CONTROLLER_HOST = "0.0.0.0"
CONTROLLER_PORT = 8100
