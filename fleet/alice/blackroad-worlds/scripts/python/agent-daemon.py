#!/usr/bin/env python3
"""
🤖 BlackRoad Autonomous Agent Daemon
Runs 24/7, processing tasks autonomously
"""

import os
import sys
import time
import json
import sqlite3
import subprocess
import signal
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

class AgentDaemon:
    """24/7 autonomous agent daemon"""
    
    def __init__(self, agent_id: str, agent_name: str, model: str = "qwen2.5-coder:7b"):
        self.agent_id = agent_id
        self.agent_name = agent_name
        self.model = model
        self.running = True
        self.tasks_completed = 0
        self.blackroad_dir = Path.home() / '.blackroad'
        self.memory_dir = self.blackroad_dir / 'memory'
        self.task_queue_db = self.memory_dir / 'task-queue.db'
        
        # Create directories
        self.memory_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize task queue database
        self.init_task_queue()
        
        # Register signal handlers
        signal.signal(signal.SIGTERM, self.shutdown)
        signal.signal(signal.SIGINT, self.shutdown)
        
    def init_task_queue(self):
        """Initialize SQLite task queue"""
        conn = sqlite3.connect(self.task_queue_db)
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_type TEXT NOT NULL,
                priority INTEGER DEFAULT 5,
                payload TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                assigned_to TEXT,
                created_at TEXT NOT NULL,
                started_at TEXT,
                completed_at TEXT,
                result TEXT,
                error TEXT
            )
        ''')
        c.execute('''
            CREATE INDEX IF NOT EXISTS idx_status_priority 
            ON tasks(status, priority DESC)
        ''')
        conn.commit()
        conn.close()
        
    def log_memory(self, action: str, details: str, tags: str = "agent,autonomous"):
        """Log to PS-SHA-∞ memory system"""
        try:
            subprocess.run([
                'bash', '-c',
                f'~/memory-system.sh log "{action}" "{self.agent_id}" "{details}" "{tags}"'
            ], capture_output=True, timeout=5)
        except:
            pass
            
    def get_next_task(self) -> Optional[Dict]:
        """Get highest priority pending task"""
        conn = sqlite3.connect(self.task_queue_db)
        c = conn.cursor()
        c.execute('''
            SELECT id, task_type, payload, priority 
            FROM tasks 
            WHERE status = 'pending' 
            ORDER BY priority DESC, created_at ASC 
            LIMIT 1
        ''')
        row = c.fetchone()
        conn.close()
        
        if row:
            return {
                'id': row[0],
                'type': row[1],
                'payload': json.loads(row[2]),
                'priority': row[3]
            }
        return None
        
    def mark_task_started(self, task_id: int):
        """Mark task as in progress"""
        conn = sqlite3.connect(self.task_queue_db)
        c = conn.cursor()
        c.execute('''
            UPDATE tasks 
            SET status = 'in_progress', 
                assigned_to = ?, 
                started_at = ? 
            WHERE id = ?
        ''', (self.agent_id, datetime.now().isoformat(), task_id))
        conn.commit()
        conn.close()
        
    def mark_task_completed(self, task_id: int, result: str):
        """Mark task as completed"""
        conn = sqlite3.connect(self.task_queue_db)
        c = conn.cursor()
        c.execute('''
            UPDATE tasks 
            SET status = 'completed', 
                completed_at = ?,
                result = ?
            WHERE id = ?
        ''', (datetime.now().isoformat(), result, task_id))
        conn.commit()
        conn.close()
        
    def mark_task_failed(self, task_id: int, error: str):
        """Mark task as failed"""
        conn = sqlite3.connect(self.task_queue_db)
        c = conn.cursor()
        c.execute('''
            UPDATE tasks 
            SET status = 'failed', 
                completed_at = ?,
                error = ?
            WHERE id = ?
        ''', (datetime.now().isoformat(), error, task_id))
        conn.commit()
        conn.close()
        
    def execute_task(self, task: Dict) -> str:
        """Execute a task using Ollama"""
        task_type = task['type']
        payload = task['payload']
        
        print(f"🔧 Executing {task_type}: {payload.get('description', 'No description')}")
        
        # Build prompt based on task type
        if task_type == 'code-review':
            prompt = f"Review this code and provide feedback:\n\n{payload.get('code', '')}"
        elif task_type == 'deploy':
            prompt = f"Deploy service {payload.get('service', '')} to {payload.get('environment', '')}"
        elif task_type == 'test':
            prompt = f"Run tests for {payload.get('path', '')}"
        elif task_type == 'monitor':
            prompt = f"Check health of {payload.get('service', '')}"
        elif task_type == 'fix':
            prompt = f"Fix issue: {payload.get('description', '')}"
        else:
            prompt = payload.get('prompt', str(payload))
            
        # Execute with Ollama
        try:
            result = subprocess.run([
                'ollama', 'run', self.model,
                prompt
            ], capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                return result.stdout
            else:
                return f"Error: {result.stderr}"
        except subprocess.TimeoutExpired:
            return "Error: Task timeout after 5 minutes"
        except Exception as e:
            return f"Error: {str(e)}"
            
    def run(self):
        """Main daemon loop"""
        print(f"🤖 {self.agent_name} ({self.agent_id}) starting...")
        print(f"   Model: {self.model}")
        print(f"   Task Queue: {self.task_queue_db}")
        print(f"   PID: {os.getpid()}")
        
        # Log startup
        self.log_memory(
            "agent-daemon-start",
            f"{self.agent_name} daemon started. Model: {self.model}. Ready for autonomous operation.",
            "agent,daemon,autonomous"
        )
        
        # Write PID file
        pid_file = self.blackroad_dir / 'agents' / f'{self.agent_id}.pid'
        pid_file.parent.mkdir(parents=True, exist_ok=True)
        pid_file.write_text(str(os.getpid()))
        
        print("✅ Daemon running. Press Ctrl+C to stop.\n")
        
        while self.running:
            try:
                # Get next task
                task = self.get_next_task()
                
                if task:
                    task_id = task['id']
                    print(f"\n📋 Task {task_id}: {task['type']} (priority: {task['priority']})")
                    
                    # Mark as started
                    self.mark_task_started(task_id)
                    
                    # Execute task
                    try:
                        result = self.execute_task(task)
                        self.mark_task_completed(task_id, result)
                        self.tasks_completed += 1
                        print(f"✅ Task {task_id} completed")
                        
                        # Log completion
                        self.log_memory(
                            "task-completed",
                            f"Completed {task['type']} task {task_id}. Total: {self.tasks_completed}",
                            "agent,autonomous,task"
                        )
                    except Exception as e:
                        error_msg = str(e)
                        self.mark_task_failed(task_id, error_msg)
                        print(f"❌ Task {task_id} failed: {error_msg}")
                        
                        self.log_memory(
                            "task-failed",
                            f"Failed {task['type']} task {task_id}: {error_msg}",
                            "agent,autonomous,error"
                        )
                else:
                    # No tasks, wait a bit
                    time.sleep(5)
                    
            except Exception as e:
                print(f"❌ Error in main loop: {e}")
                time.sleep(10)
                
        print(f"\n🛑 Daemon stopped. Tasks completed: {self.tasks_completed}")
        
    def shutdown(self, signum, frame):
        """Graceful shutdown"""
        print(f"\n🛑 Received signal {signum}, shutting down...")
        self.running = False
        
        # Log shutdown
        self.log_memory(
            "agent-daemon-stop",
            f"{self.agent_name} daemon stopped. Tasks completed: {self.tasks_completed}",
            "agent,daemon,shutdown"
        )
        
        # Remove PID file
        pid_file = self.blackroad_dir / 'agents' / f'{self.agent_id}.pid'
        if pid_file.exists():
            pid_file.unlink()
            
        sys.exit(0)

def main():
    """Main entry point"""
    if len(sys.argv) < 3:
        print("Usage: autonomous-agent-daemon.py <agent_id> <agent_name> [model]")
        print("Example: autonomous-agent-daemon.py erebus-1 Erebus qwen2.5-coder:7b")
        sys.exit(1)
        
    agent_id = sys.argv[1]
    agent_name = sys.argv[2]
    model = sys.argv[3] if len(sys.argv) > 3 else "qwen2.5-coder:7b"
    
    daemon = AgentDaemon(agent_id, agent_name, model)
    daemon.run()

if __name__ == '__main__':
    main()
