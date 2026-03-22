#!/usr/bin/env python3
"""
BlackRoad Agent Task Queue
Distributed task system for 160+ AI agents
"""

import json
import time
import uuid
from pathlib import Path
from typing import Dict, List, Optional

TASK_QUEUE_DIR = Path.home() / ".blackroad" / "agent-tasks"
TASK_QUEUE_DIR.mkdir(parents=True, exist_ok=True)

class Task:
    """Represents a single agent task"""
    def __init__(self, title: str, description: str, task_type: str, priority: int = 5):
        self.id = str(uuid.uuid4())[:8]
        self.title = title
        self.description = description
        self.task_type = task_type
        self.priority = priority
        self.status = "pending"
        self.created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ")
        self.assigned_to = None
        self.completed_at = None
        self.result = None
    
    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "task_type": self.task_type,
            "priority": self.priority,
            "status": self.status,
            "created_at": self.created_at,
            "assigned_to": self.assigned_to,
            "completed_at": self.completed_at,
            "result": self.result
        }

class TaskQueue:
    """Distributed task queue for agent coordination"""
    
    def __init__(self):
        self.queue_file = TASK_QUEUE_DIR / "queue.json"
        self.load()
    
    def load(self):
        """Load task queue from disk"""
        if self.queue_file.exists():
            with open(self.queue_file) as f:
                data = json.load(f)
                self.tasks = data.get("tasks", [])
        else:
            self.tasks = []
    
    def save(self):
        """Save task queue to disk"""
        with open(self.queue_file, 'w') as f:
            json.dump({
                "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "total_tasks": len(self.tasks),
                "tasks": self.tasks
            }, f, indent=2)
    
    def add_task(self, task: Task):
        """Add task to queue"""
        self.tasks.append(task.to_dict())
        self.save()
        return task.id
    
    def get_pending_tasks(self, limit: int = 100) -> List[Dict]:
        """Get pending tasks sorted by priority"""
        pending = [t for t in self.tasks if t["status"] == "pending"]
        return sorted(pending, key=lambda x: x["priority"], reverse=True)[:limit]
    
    def claim_task(self, task_id: str, agent_name: str) -> Optional[Dict]:
        """Agent claims a task"""
        for task in self.tasks:
            if task["id"] == task_id and task["status"] == "pending":
                task["status"] = "in_progress"
                task["assigned_to"] = agent_name
                self.save()
                return task
        return None
    
    def complete_task(self, task_id: str, result: str):
        """Mark task as completed"""
        for task in self.tasks:
            if task["id"] == task_id:
                task["status"] = "completed"
                task["completed_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
                task["result"] = result
                self.save()
                return True
        return False
    
    def get_stats(self) -> Dict:
        """Get queue statistics"""
        pending = len([t for t in self.tasks if t["status"] == "pending"])
        in_progress = len([t for t in self.tasks if t["status"] == "in_progress"])
        completed = len([t for t in self.tasks if t["status"] == "completed"])
        
        return {
            "total": len(self.tasks),
            "pending": pending,
            "in_progress": in_progress,
            "completed": completed
        }

def create_initial_tasks():
    """Create initial task batch for agents"""
    queue = TaskQueue()
    
    tasks = [
        # Code analysis tasks
        Task("Analyze memory system performance", 
             "Review ~/.blackroad/memory/ codebase and suggest optimizations",
             "code-analysis", priority=8),
        Task("Review agent orchestrator code",
             "Analyze agent-orchestrator.py for improvements",
             "code-review", priority=7),
        Task("Scan for security issues",
             "Check all Python scripts in BlackRoad-Private for vulnerabilities",
             "security-scan", priority=9),
        
        # Documentation tasks
        Task("Document agent deployment process",
             "Create step-by-step guide for deploying new agent waves",
             "documentation", priority=6),
        Task("Write API documentation",
             "Document the task queue API for other agents",
             "documentation", priority=5),
        Task("Create agent naming guide",
             "Document the mythology-based naming system",
             "documentation", priority=4),
        
        # Monitoring tasks
        Task("Monitor Pi fleet health",
             "Check CPU, memory, disk usage on all 8 nodes",
             "monitoring", priority=8),
        Task("Track Ollama model availability",
             "Verify all required models are available on all nodes",
             "monitoring", priority=7),
        Task("Check SSH connectivity",
             "Verify all Pi nodes are reachable via SSH",
             "monitoring", priority=8),
        
        # Optimization tasks
        Task("Optimize memory index queries",
             "Improve query performance for 4,900+ entries",
             "optimization", priority=7),
        Task("Reduce agent spawn time",
             "Analyze and optimize agent initialization",
             "optimization", priority=6),
        Task("Improve rsync efficiency",
             "Optimize memory sync to 8 nodes",
             "optimization", priority=5),
        
        # Research tasks
        Task("Research distributed consensus",
             "Study Raft/Paxos for agent coordination",
             "research", priority=4),
        Task("Investigate model quantization",
             "Research smaller model sizes for Pis",
             "research", priority=5),
        Task("Study agent communication patterns",
             "Analyze P2P vs hub-spoke architectures",
             "research", priority=4),
        
        # Infrastructure tasks
        Task("Set up agent health checks",
             "Create automated health monitoring for all agents",
             "infrastructure", priority=7),
        Task("Deploy task result aggregator",
             "Build system to collect and display task results",
             "infrastructure", priority=6),
        Task("Create agent coordination dashboard",
             "Web UI showing all agent activity in real-time",
             "infrastructure", priority=8),
        
        # Testing tasks
        Task("Test agent task claiming",
             "Verify task queue prevents double-claiming",
             "testing", priority=7),
        Task("Load test orchestrator",
             "Deploy 100+ agents and measure performance",
             "testing", priority=6),
        Task("Test cross-node communication",
             "Verify agents can communicate across Pi boundaries",
             "testing", priority=7),
    ]
    
    print(f"📋 Creating {len(tasks)} initial tasks...")
    for task in tasks:
        task_id = queue.add_task(task)
        print(f"✅ {task.title} (ID: {task_id}, Priority: {task.priority})")
    
    print(f"\n📊 Task Queue Stats: {queue.get_stats()}")
    return len(tasks)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "init":
            count = create_initial_tasks()
            print(f"\n✨ Created {count} tasks!")
        
        elif command == "stats":
            queue = TaskQueue()
            stats = queue.get_stats()
            print(f"📊 Task Queue Statistics:")
            print(f"   Total: {stats['total']}")
            print(f"   Pending: {stats['pending']}")
            print(f"   In Progress: {stats['in_progress']}")
            print(f"   Completed: {stats['completed']}")
        
        elif command == "list":
            queue = TaskQueue()
            tasks = queue.get_pending_tasks(20)
            print(f"📋 Pending Tasks ({len(tasks)}):")
            for task in tasks:
                print(f"   [{task['id']}] {task['title']} (Priority: {task['priority']})")
        
        elif command == "claim":
            if len(sys.argv) < 4:
                print("Usage: agent-tasks.py claim <task_id> <agent_name>")
                sys.exit(1)
            
            task_id = sys.argv[2]
            agent_name = sys.argv[3]
            queue = TaskQueue()
            task = queue.claim_task(task_id, agent_name)
            if task:
                print(f"✅ Task claimed by {agent_name}: {task['title']}")
            else:
                print(f"❌ Task {task_id} not found or already claimed")
        
        elif command == "complete":
            if len(sys.argv) < 4:
                print("Usage: agent-tasks.py complete <task_id> <result>")
                sys.exit(1)
            
            task_id = sys.argv[2]
            result = " ".join(sys.argv[3:])
            queue = TaskQueue()
            if queue.complete_task(task_id, result):
                print(f"✅ Task {task_id} marked complete")
            else:
                print(f"❌ Task {task_id} not found")
    else:
        print("Usage: agent-tasks.py [init|stats|list|claim|complete]")
