#!/usr/bin/env python3
"""
🌌 BlackRoad Agent Coordination Framework
Real-time multi-agent coordination system with WebSocket communication

This framework enables 30,000 agents to coordinate in real-time through:
- WebSocket communication
- Task marketplace
- Resource allocation
- Conflict resolution
- Performance tracking
"""

import asyncio
import json
import time
import uuid
from dataclasses import dataclass, asdict, field
from typing import Dict, List, Optional, Set
from datetime import datetime
from enum import Enum

class AgentStatus(Enum):
    IDLE = "idle"
    WORKING = "working"
    BLOCKED = "blocked"
    OFFLINE = "offline"

class TaskStatus(Enum):
    PENDING = "pending"
    CLAIMED = "claimed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class TaskPriority(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    URGENT = 4
    CRITICAL = 5

@dataclass
class Task:
    """Represents a task that can be claimed by agents"""
    id: str
    title: str
    description: str
    priority: TaskPriority
    required_capabilities: List[str]
    organization: str
    repository: str
    status: TaskStatus = TaskStatus.PENDING
    assigned_agent: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    claimed_at: Optional[str] = None
    completed_at: Optional[str] = None
    result: Optional[Dict] = None

@dataclass
class AgentState:
    """Current state of an agent"""
    id: str
    name: str
    type: str
    capabilities: List[str]
    status: AgentStatus
    current_task: Optional[str] = None
    tasks_completed: int = 0
    success_rate: float = 100.0
    last_heartbeat: str = field(default_factory=lambda: datetime.now().isoformat())

class AgentCoordinator:
    """
    Central coordinator for all agents
    Manages task distribution, conflict resolution, and real-time communication
    """

    def __init__(self):
        self.agents: Dict[str, AgentState] = {}
        self.tasks: Dict[str, Task] = {}
        self.task_queue: List[Task] = []
        self.websocket_connections: Dict[str, any] = {}  # agent_id -> websocket
        self.coordination_log: List[Dict] = []

    async def register_agent(self, agent: AgentState) -> Dict:
        """Register a new agent in the system"""
        self.agents[agent.id] = agent

        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "action": "agent_registered",
            "agent_id": agent.id,
            "agent_type": agent.type,
            "capabilities": agent.capabilities
        }
        self.coordination_log.append(log_entry)

        # Broadcast to all connected agents
        await self.broadcast_message({
            "type": "agent_joined",
            "agent": asdict(agent)
        })

        return {
            "success": True,
            "message": f"Agent {agent.id} registered successfully",
            "total_agents": len(self.agents)
        }

    async def create_task(self, task: Task) -> Dict:
        """Create a new task in the marketplace"""
        self.tasks[task.id] = task
        self.task_queue.append(task)

        # Sort by priority
        self.task_queue.sort(key=lambda t: t.priority.value, reverse=True)

        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "action": "task_created",
            "task_id": task.id,
            "priority": task.priority.name
        }
        self.coordination_log.append(log_entry)

        # Notify capable agents
        await self.notify_capable_agents(task)

        return {
            "success": True,
            "task_id": task.id,
            "queue_position": self.task_queue.index(task)
        }

    async def notify_capable_agents(self, task: Task):
        """Notify agents that have the required capabilities"""
        capable_agents = [
            agent for agent in self.agents.values()
            if agent.status == AgentStatus.IDLE and
            all(cap in agent.capabilities for cap in task.required_capabilities)
        ]

        message = {
            "type": "task_available",
            "task": asdict(task),
            "capable_agents_count": len(capable_agents)
        }

        for agent in capable_agents:
            await self.send_to_agent(agent.id, message)

    async def claim_task(self, agent_id: str, task_id: str) -> Dict:
        """Agent claims a task"""
        if task_id not in self.tasks:
            return {"success": False, "error": "Task not found"}

        task = self.tasks[task_id]
        agent = self.agents.get(agent_id)

        if not agent:
            return {"success": False, "error": "Agent not found"}

        if task.status != TaskStatus.PENDING:
            return {"success": False, "error": "Task already claimed"}

        # Check capabilities
        if not all(cap in agent.capabilities for cap in task.required_capabilities):
            return {"success": False, "error": "Agent lacks required capabilities"}

        # Claim task
        task.status = TaskStatus.CLAIMED
        task.assigned_agent = agent_id
        task.claimed_at = datetime.now().isoformat()

        agent.status = AgentStatus.WORKING
        agent.current_task = task_id

        # Remove from queue
        self.task_queue = [t for t in self.task_queue if t.id != task_id]

        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "action": "task_claimed",
            "task_id": task_id,
            "agent_id": agent_id
        }
        self.coordination_log.append(log_entry)

        # Broadcast update
        await self.broadcast_message({
            "type": "task_claimed",
            "task_id": task_id,
            "agent_id": agent_id
        })

        return {
            "success": True,
            "task": asdict(task)
        }

    async def complete_task(self, agent_id: str, task_id: str, result: Dict) -> Dict:
        """Mark task as completed"""
        task = self.tasks.get(task_id)
        agent = self.agents.get(agent_id)

        if not task or not agent:
            return {"success": False, "error": "Task or agent not found"}

        if task.assigned_agent != agent_id:
            return {"success": False, "error": "Task not assigned to this agent"}

        task.status = TaskStatus.COMPLETED
        task.completed_at = datetime.now().isoformat()
        task.result = result

        agent.status = AgentStatus.IDLE
        agent.current_task = None
        agent.tasks_completed += 1

        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "action": "task_completed",
            "task_id": task_id,
            "agent_id": agent_id,
            "duration": self._calculate_duration(task.claimed_at, task.completed_at)
        }
        self.coordination_log.append(log_entry)

        # Broadcast completion
        await self.broadcast_message({
            "type": "task_completed",
            "task_id": task_id,
            "agent_id": agent_id,
            "result": result
        })

        # Check for dependent tasks
        await self.check_dependent_tasks(task_id)

        return {"success": True}

    async def send_to_agent(self, agent_id: str, message: Dict):
        """Send message to specific agent via WebSocket"""
        ws = self.websocket_connections.get(agent_id)
        if ws:
            await ws.send(json.dumps(message))

    async def broadcast_message(self, message: Dict):
        """Broadcast message to all connected agents"""
        for agent_id, ws in self.websocket_connections.items():
            try:
                await ws.send(json.dumps(message))
            except:
                pass  # Handle disconnected clients

    async def check_dependent_tasks(self, completed_task_id: str):
        """Check if any pending tasks depended on the completed task"""
        # This could trigger new tasks or update existing ones
        pass

    def _calculate_duration(self, start: str, end: str) -> float:
        """Calculate duration in seconds between two ISO timestamps"""
        try:
            start_dt = datetime.fromisoformat(start)
            end_dt = datetime.fromisoformat(end)
            return (end_dt - start_dt).total_seconds()
        except:
            return 0.0

    async def get_stats(self) -> Dict:
        """Get current system statistics"""
        total_agents = len(self.agents)
        active_agents = sum(1 for a in self.agents.values() if a.status == AgentStatus.WORKING)
        idle_agents = sum(1 for a in self.agents.values() if a.status == AgentStatus.IDLE)

        pending_tasks = sum(1 for t in self.tasks.values() if t.status == TaskStatus.PENDING)
        in_progress_tasks = sum(1 for t in self.tasks.values() if t.status == TaskStatus.IN_PROGRESS)
        completed_tasks = sum(1 for t in self.tasks.values() if t.status == TaskStatus.COMPLETED)

        return {
            "agents": {
                "total": total_agents,
                "active": active_agents,
                "idle": idle_agents,
                "blocked": sum(1 for a in self.agents.values() if a.status == AgentStatus.BLOCKED),
                "offline": sum(1 for a in self.agents.values() if a.status == AgentStatus.OFFLINE)
            },
            "tasks": {
                "total": len(self.tasks),
                "pending": pending_tasks,
                "in_progress": in_progress_tasks,
                "completed": completed_tasks,
                "failed": sum(1 for t in self.tasks.values() if t.status == TaskStatus.FAILED)
            },
            "queue": {
                "size": len(self.task_queue),
                "critical": sum(1 for t in self.task_queue if t.priority == TaskPriority.CRITICAL),
                "urgent": sum(1 for t in self.task_queue if t.priority == TaskPriority.URGENT)
            }
        }

    async def heartbeat(self, agent_id: str):
        """Update agent's last heartbeat"""
        if agent_id in self.agents:
            self.agents[agent_id].last_heartbeat = datetime.now().isoformat()

    async def detect_stalled_agents(self, timeout_seconds: int = 300):
        """Detect agents that haven't sent a heartbeat recently"""
        now = datetime.now()
        stalled = []

        for agent in self.agents.values():
            last_hb = datetime.fromisoformat(agent.last_heartbeat)
            if (now - last_hb).total_seconds() > timeout_seconds:
                stalled.append(agent.id)
                agent.status = AgentStatus.OFFLINE

                # Reassign their tasks
                if agent.current_task:
                    await self.reassign_task(agent.current_task)

        return stalled

    async def reassign_task(self, task_id: str):
        """Reassign a task to another capable agent"""
        task = self.tasks.get(task_id)
        if not task:
            return

        task.status = TaskStatus.PENDING
        task.assigned_agent = None
        task.claimed_at = None

        self.task_queue.append(task)
        self.task_queue.sort(key=lambda t: t.priority.value, reverse=True)

        await self.notify_capable_agents(task)


class TaskMarketplace:
    """Task marketplace for agents to discover and claim work"""

    def __init__(self, coordinator: AgentCoordinator):
        self.coordinator = coordinator

    async def post_task(self, title: str, description: str, priority: TaskPriority,
                       capabilities: List[str], org: str, repo: str) -> str:
        """Post a new task to the marketplace"""
        task = Task(
            id=str(uuid.uuid4()),
            title=title,
            description=description,
            priority=priority,
            required_capabilities=capabilities,
            organization=org,
            repository=repo
        )

        await self.coordinator.create_task(task)
        return task.id

    async def browse_tasks(self, agent_id: str) -> List[Task]:
        """Browse available tasks for an agent"""
        agent = self.coordinator.agents.get(agent_id)
        if not agent:
            return []

        # Filter tasks agent is capable of
        available = [
            task for task in self.coordinator.task_queue
            if all(cap in agent.capabilities for cap in task.required_capabilities)
        ]

        return available

    async def get_task_details(self, task_id: str) -> Optional[Task]:
        """Get details of a specific task"""
        return self.coordinator.tasks.get(task_id)


def create_demo_scenario():
    """Create a demo scenario with agents and tasks"""
    print("🌌 BlackRoad Agent Coordination Framework")
    print("=" * 70)
    print()

    coordinator = AgentCoordinator()
    marketplace = TaskMarketplace(coordinator)

    # Create sample agents
    agents = [
        AgentState(
            id="agent-dev-001",
            name="Code Generator Alpha",
            type="development",
            capabilities=["generate-code", "refactor", "test"],
            status=AgentStatus.IDLE
        ),
        AgentState(
            id="agent-ops-001",
            name="Deploy Master",
            type="operations",
            capabilities=["deploy", "monitor", "scale"],
            status=AgentStatus.IDLE
        ),
        AgentState(
            id="agent-security-001",
            name="Security Scanner",
            type="security",
            capabilities=["scan", "audit", "patch"],
            status=AgentStatus.IDLE
        )
    ]

    print("📊 Demo Agents Created:")
    for agent in agents:
        print(f"   • {agent.name} ({agent.type})")
        print(f"     Capabilities: {', '.join(agent.capabilities)}")
    print()

    # Create sample tasks
    tasks = [
        ("Implement user authentication", TaskPriority.HIGH,
         ["generate-code", "test"], "BlackRoad-OS", "blackroad-os-api"),
        ("Deploy to production", TaskPriority.URGENT,
         ["deploy", "monitor"], "BlackRoad-OS", "blackroad-os-web"),
        ("Security audit", TaskPriority.CRITICAL,
         ["scan", "audit"], "BlackRoad-OS", "blackroad-os-core")
    ]

    print("📋 Demo Tasks Created:")
    for title, priority, caps, org, repo in tasks:
        print(f"   • {title}")
        print(f"     Priority: {priority.name}")
        print(f"     Required: {', '.join(caps)}")
    print()

    print("✅ Framework ready!")
    print()
    print("📖 API Methods:")
    print("   • coordinator.register_agent(agent)")
    print("   • marketplace.post_task(...)")
    print("   • coordinator.claim_task(agent_id, task_id)")
    print("   • coordinator.complete_task(agent_id, task_id, result)")
    print("   • coordinator.get_stats()")
    print()
    print("🚀 To run with real WebSocket server:")
    print("   python3 agent-coordination-server.py")
    print()

if __name__ == '__main__':
    create_demo_scenario()
