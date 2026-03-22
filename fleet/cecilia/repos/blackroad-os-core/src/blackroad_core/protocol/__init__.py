"""BlackRoad Protocol Definitions

Core protocol types, status enums, and event definitions for the BlackRoad OS."""

from enum import Enum
from dataclasses import dataclass, field
from typing import Any, Optional
from datetime import datetime


class JobStatus(str, Enum):
    """Status of a job in the system."""
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"
    RETRYING = "retrying"


class AgentStatus(str, Enum):
    """Status of an agent."""
    ACTIVE = "active"
    PAUSED = "paused"
    ERROR = "error"
    ARCHIVED = "archived"
    INITIALIZING = "initializing"


class RuntimeType(str, Enum):
    """Supported agent runtime types."""
    LLM_BRAIN = "llm_brain"
    LLM_WORKFLOW = "llm_workflow"
    WORKFLOW_ENGINE = "workflow_engine"
    PYTHON_SCRIPT = "python_script"
    HTTP_WEBHOOK = "http_webhook"
    COMPOSITE = "composite"


class EventType(str, Enum):
    """Types of events in the system."""
    # Job events
    JOB_QUEUED = "job.queued"
    JOB_STARTED = "job.started"
    JOB_PROGRESS = "job.progress"
    JOB_COMPLETED = "job.completed"
    JOB_FAILED = "job.failed"
    JOB_RETRIED = "job.retried"
    JOB_CANCELLED = "job.cancelled"

    # Agent events
    AGENT_CREATED = "agent.created"
    AGENT_UPDATED = "agent.updated"
    AGENT_PAUSED = "agent.paused"
    AGENT_RESUMED = "agent.resumed"
    AGENT_ERROR = "agent.error"
    AGENT_ARCHIVED = "agent.archived"

    # Pack events
    PACK_INSTALLED = "pack.installed"
    PACK_UPDATED = "pack.updated"
    PACK_UNINSTALLED = "pack.uninstalled"

    # Workflow events
    WORKFLOW_STARTED = "workflow.started"
    WORKFLOW_STEP_COMPLETED = "workflow.step_completed"
    WORKFLOW_COMPLETED = "workflow.completed"
    WORKFLOW_FAILED = "workflow.failed"

    # System events
    SYSTEM_HEALTH = "system.health"
    SYSTEM_SCALE = "system.scale"
    SYSTEM_ERROR = "system.error"


class Priority(int, Enum):
    """Job priority levels."""
    LOW = 0
    NORMAL = 50
    HIGH = 100
    CRITICAL = 200


@dataclass
class Job:
    """Job data transfer object."""
    id: str
    org_id: str
    agent_id: str
    trace_id: str
    status: JobStatus
    input: Optional[dict[str, Any]] = None
    output: Optional[dict[str, Any]] = None
    error: Optional[str] = None
    priority: int = Priority.NORMAL
    retry_count: int = 0
    max_retries: int = 3
    created_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class Event:
    """Event data transfer object."""
    id: str
    type: EventType
    org_id: str
    entity_type: str
    entity_id: str
    payload: dict[str, Any] = field(default_factory=dict)
    timestamp: Optional[datetime] = None
    trace_id: Optional[str] = None
    actor_type: str = "system"
    actor_id: Optional[str] = None


@dataclass
class HealthCheck:
    """Health check response."""
    status: str  # "healthy", "degraded", "unhealthy"
    service: str
    version: str
    timestamp: datetime
    details: dict[str, Any] = field(default_factory=dict)


@dataclass
class VersionInfo:
    """Version information response."""
    version: str
    git_sha: str
    build_time: str
    service: str
    environment: str = "unknown"


# Queue naming conventions
def get_queue_name(pack_key: str, priority: str = "default") -> str:
    """    Get the Redis stream queue name for a pack.

    Args:
        pack_key: The pack identifier (e.g., 'finance', 'education')
        priority: Priority level ('default', 'high', 'low')

    Returns:
        Queue name string (e.g., 'jobs.finance.default')"""
    return f"jobs.{pack_key}.{priority}"


def parse_queue_name(queue_name: str) -> tuple[str, str]:
    """    Parse a queue name into pack and priority.

    Args:
        queue_name: The queue name (e.g., 'jobs.finance.default')

    Returns:
        Tuple of (pack_key, priority)"""
    parts = queue_name.split(".")
    if len(parts) != 3 or parts[0] != "jobs":
        raise ValueError(f"Invalid queue name format: {queue_name}")
    return parts[1], parts[2]


__all__ = [
    "JobStatus",
    "AgentStatus",
    "RuntimeType",
    "EventType",
    "Priority",
    "Job",
    "Event",
    "HealthCheck",
    "VersionInfo",
    "get_queue_name",
    "parse_queue_name",
]
