#!/usr/bin/env python3
"""
BlackRoad Distributed Task Queue
Async task execution across the mesh
"""

import os
import json
import time
import socket
import subprocess
import threading
from datetime import datetime
from typing import Dict, List, Optional, Callable
from queue import PriorityQueue
from dataclasses import dataclass, field

TASK_DIR = os.path.expanduser("~/.blackroad/tasks")
QUEUE_FILE = os.path.join(TASK_DIR, "queue.json")
RESULTS_FILE = os.path.join(TASK_DIR, "results.jsonl")
HOSTNAME = socket.gethostname()

@dataclass(order=True)
class Task:
    priority: int
    id: str = field(compare=False)
    command: str = field(compare=False)
    created: str = field(compare=False)
    status: str = field(compare=False, default="pending")
    result: Optional[str] = field(compare=False, default=None)
    assigned_to: Optional[str] = field(compare=False, default=None)

class TaskQueue:
    def __init__(self):
        self.queue = PriorityQueue()
        self.tasks: Dict[str, Task] = {}
        self.workers: Dict[str, bool] = {}  # worker_id -> busy
        self.load()

    def load(self):
        """Load queue from disk"""
        try:
            with open(QUEUE_FILE, "r") as f:
                data = json.load(f)
                for t in data.get("tasks", []):
                    task = Task(**t)
                    self.tasks[task.id] = task
                    if task.status == "pending":
                        self.queue.put(task)
        except FileNotFoundError:
            pass

    def save(self):
        """Save queue to disk"""
        data = {"tasks": [vars(t) for t in self.tasks.values()]}
        with open(QUEUE_FILE, "w") as f:
            json.dump(data, f, indent=2)

    def enqueue(self, command: str, priority: int = 5) -> str:
        """Add task to queue"""
        task_id = f"task-{int(time.time())}-{os.urandom(4).hex()}"
        task = Task(
            priority=priority,
            id=task_id,
            command=command,
            created=datetime.utcnow().isoformat()
        )
        self.tasks[task_id] = task
        self.queue.put(task)
        self.save()
        return task_id

    def dequeue(self, worker_id: str) -> Optional[Task]:
        """Get next task for worker"""
        try:
            task = self.queue.get_nowait()
            task.status = "running"
            task.assigned_to = worker_id
            self.workers[worker_id] = True
            self.save()
            return task
        except:
            return None

    def complete(self, task_id: str, result: str, success: bool = True):
        """Mark task complete"""
        if task_id in self.tasks:
            task = self.tasks[task_id]
            task.status = "completed" if success else "failed"
            task.result = result
            if task.assigned_to:
                self.workers[task.assigned_to] = False
            self.save()
            self.log_result(task)

    def log_result(self, task: Task):
        """Log task result"""
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "task_id": task.id,
            "command": task.command,
            "status": task.status,
            "result": task.result[:500] if task.result else None,
            "worker": task.assigned_to
        }
        with open(RESULTS_FILE, "a") as f:
            f.write(json.dumps(entry) + "\n")

    def execute_local(self, task: Task) -> tuple[bool, str]:
        """Execute task locally"""
        try:
            result = subprocess.check_output(
                task.command,
                shell=True,
                timeout=300,
                stderr=subprocess.STDOUT
            ).decode()
            return True, result
        except subprocess.TimeoutExpired:
            return False, "Timeout"
        except subprocess.CalledProcessError as e:
            return False, e.output.decode() if e.output else str(e)
        except Exception as e:
            return False, str(e)

    def worker_loop(self, worker_id: str = None):
        """Run as worker, processing tasks"""
        worker_id = worker_id or f"{HOSTNAME}-worker"
        print(f"[*] Worker {worker_id} starting...")

        while True:
            task = self.dequeue(worker_id)
            if task:
                print(f"[>] Executing: {task.command[:50]}...")
                success, result = self.execute_local(task)
                self.complete(task.id, result, success)
                status = "✓" if success else "✗"
                print(f"[{status}] Task {task.id} complete")
            else:
                time.sleep(1)

    def list_tasks(self, status: str = None) -> List[Dict]:
        """List tasks"""
        tasks = []
        for t in self.tasks.values():
            if status is None or t.status == status:
                tasks.append(vars(t))
        return sorted(tasks, key=lambda x: x["created"], reverse=True)

    def stats(self) -> Dict:
        """Get queue stats"""
        by_status = {}
        for t in self.tasks.values():
            by_status[t.status] = by_status.get(t.status, 0) + 1
        return {
            "total": len(self.tasks),
            "pending": self.queue.qsize(),
            "by_status": by_status,
            "workers": len([w for w, busy in self.workers.items() if busy])
        }

# CLI
if __name__ == "__main__":
    import sys
    queue = TaskQueue()

    if len(sys.argv) < 2:
        print("task_queue.py <command> [args]")
        print("Commands: add, list, worker, stats, results")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "add":
        command = " ".join(sys.argv[2:])
        priority = 5
        # Check for priority flag
        if "-p" in sys.argv:
            idx = sys.argv.index("-p")
            priority = int(sys.argv[idx + 1])
            command = " ".join([a for i, a in enumerate(sys.argv[2:]) if i != idx-2 and i != idx-1])

        task_id = queue.enqueue(command, priority)
        print(f"Queued: {task_id}")

    elif cmd == "list":
        status = sys.argv[2] if len(sys.argv) > 2 else None
        tasks = queue.list_tasks(status)
        for t in tasks[:10]:
            print(f"[{t['status']}] {t['id']}: {t['command'][:40]}")

    elif cmd == "worker":
        worker_id = sys.argv[2] if len(sys.argv) > 2 else None
        queue.worker_loop(worker_id)

    elif cmd == "stats":
        stats = queue.stats()
        print(json.dumps(stats, indent=2))

    elif cmd == "results":
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        try:
            with open(RESULTS_FILE, "r") as f:
                lines = f.readlines()[-n:]
                for line in lines:
                    r = json.loads(line)
                    status = "✓" if r["status"] == "completed" else "✗"
                    print(f"{status} {r['task_id']}: {r['command'][:30]}")
        except FileNotFoundError:
            print("No results yet")
