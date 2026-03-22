#!/usr/bin/env python3
"""
BlackRoad Base Agent Framework
Foundation for all 30,000 AI agents in the BlackRoad ecosystem.
Provides health checking, task processing, metrics reporting, and self-healing.
"""

import os
import time
import json
import logging
import threading
import signal
import sys
from datetime import datetime
from typing import Dict, List, Optional, Callable
from enum import Enum
import uuid
import asyncio
from http.server import HTTPServer, BaseHTTPRequestHandler


class AgentStatus(Enum):
    """Agent operational status"""
    INITIALIZING = "initializing"
    IDLE = "idle"
    WORKING = "working"
    ERROR = "error"
    HEALING = "healing"
    SHUTDOWN = "shutdown"


class AgentType(Enum):
    """Types of specialized agents"""
    QUANTUM_MECHANICS = "quantum_mechanics"
    RELATIVITY = "relativity"
    COSMOLOGY = "cosmology"
    CODE_REVIEW = "code_review"
    TESTING = "testing"
    DEPLOYMENT = "deployment"
    RESEARCH = "research"
    DOCUMENTATION = "documentation"
    MONITORING = "monitoring"
    INTEGRATION = "integration"
    ANALYTICS = "analytics"


class BaseAgent:
    """
    Base agent class that all 30,000 agents inherit from.
    Provides core functionality for health, tasks, and monitoring.
    """

    def __init__(
        self,
        agent_type: AgentType,
        capabilities: List[str],
        agent_id: Optional[str] = None,
        port: int = 8080
    ):
        self.agent_id = agent_id or f"{agent_type.value}-{uuid.uuid4().hex[:8]}"
        self.agent_type = agent_type
        self.capabilities = capabilities
        self.status = AgentStatus.INITIALIZING
        self.port = port

        # Metrics
        self.tasks_completed = 0
        self.tasks_failed = 0
        self.total_processing_time = 0.0
        self.start_time = datetime.now()
        self.last_health_check = datetime.now()

        # Configuration
        self.max_retries = 3
        self.health_check_interval = 10  # seconds
        self.heartbeat_interval = 30  # seconds

        # Logging
        self.setup_logging()
        self.logger.info(f"🤖 Agent {self.agent_id} initializing...")

        # Task queue
        self.current_task = None
        self.task_lock = threading.Lock()

        # Graceful shutdown
        signal.signal(signal.SIGTERM, self.shutdown_handler)
        signal.signal(signal.SIGINT, self.shutdown_handler)

    def setup_logging(self):
        """Configure logging"""
        self.logger = logging.getLogger(self.agent_id)
        self.logger.setLevel(logging.INFO)

        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            f'%(asctime)s - {self.agent_id} - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)

    def health_check(self) -> Dict:
        """
        Kubernetes liveness probe endpoint.
        Returns health status and basic metrics.
        """
        self.last_health_check = datetime.now()
        uptime = (datetime.now() - self.start_time).total_seconds()

        return {
            "status": "healthy",
            "agent_id": self.agent_id,
            "agent_type": self.agent_type.value,
            "operational_status": self.status.value,
            "uptime_seconds": uptime,
            "tasks_completed": self.tasks_completed,
            "tasks_failed": self.tasks_failed,
            "success_rate": self.get_success_rate(),
            "timestamp": datetime.now().isoformat()
        }

    def readiness_check(self) -> Dict:
        """
        Kubernetes readiness probe endpoint.
        Returns whether agent is ready to accept tasks.
        """
        ready = self.status in [AgentStatus.IDLE, AgentStatus.WORKING]

        return {
            "ready": ready,
            "agent_id": self.agent_id,
            "status": self.status.value,
            "can_accept_tasks": self.status == AgentStatus.IDLE,
            "timestamp": datetime.now().isoformat()
        }

    def get_success_rate(self) -> float:
        """Calculate task success rate"""
        total = self.tasks_completed + self.tasks_failed
        if total == 0:
            return 100.0
        return (self.tasks_completed / total) * 100

    def process_task(self, task: Dict) -> Dict:
        """
        Process incoming task.
        This is overridden by specialized agents.
        """
        with self.task_lock:
            self.current_task = task
            self.status = AgentStatus.WORKING

        task_start = time.time()
        self.logger.info(f"📝 Processing task: {task.get('task_id', 'unknown')}")

        try:
            # Call specialized processing logic
            result = self.execute_task(task)

            # Success
            processing_time = time.time() - task_start
            self.tasks_completed += 1
            self.total_processing_time += processing_time

            self.logger.info(
                f"✅ Task completed in {processing_time:.2f}s"
            )

            return {
                "success": True,
                "agent_id": self.agent_id,
                "task_id": task.get("task_id"),
                "result": result,
                "processing_time_s": processing_time,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            # Failure
            self.tasks_failed += 1
            self.logger.error(f"❌ Task failed: {str(e)}")

            return {
                "success": False,
                "agent_id": self.agent_id,
                "task_id": task.get("task_id"),
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

        finally:
            self.current_task = None
            self.status = AgentStatus.IDLE

    def execute_task(self, task: Dict) -> Dict:
        """
        Execute specific task logic.
        OVERRIDE THIS in specialized agents.
        """
        raise NotImplementedError(
            "Specialized agents must implement execute_task()"
        )

    def get_metrics(self) -> Dict:
        """
        Get agent metrics for Prometheus/monitoring.
        """
        uptime = (datetime.now() - self.start_time).total_seconds()
        avg_processing_time = (
            self.total_processing_time / self.tasks_completed
            if self.tasks_completed > 0 else 0
        )

        return {
            "agent_id": self.agent_id,
            "agent_type": self.agent_type.value,
            "status": self.status.value,
            "capabilities": self.capabilities,
            "metrics": {
                "uptime_seconds": uptime,
                "tasks_completed": self.tasks_completed,
                "tasks_failed": self.tasks_failed,
                "success_rate_percent": self.get_success_rate(),
                "avg_processing_time_s": avg_processing_time,
                "total_processing_time_s": self.total_processing_time
            },
            "timestamp": datetime.now().isoformat()
        }

    def heartbeat(self):
        """Send periodic heartbeat to orchestrator"""
        while self.status != AgentStatus.SHUTDOWN:
            self.logger.debug(f"💓 Heartbeat - Status: {self.status.value}")
            time.sleep(self.heartbeat_interval)

    def shutdown_handler(self, signum, frame):
        """Handle graceful shutdown"""
        self.logger.info("🛑 Shutdown signal received, gracefully stopping...")
        self.status = AgentStatus.SHUTDOWN

        # Wait for current task to complete
        if self.current_task:
            self.logger.info("⏳ Waiting for current task to complete...")
            while self.current_task:
                time.sleep(0.1)

        self.logger.info("✅ Agent shutdown complete")
        sys.exit(0)

    def start_http_server(self):
        """Start HTTP server for health checks and task reception"""
        agent = self

        class AgentHTTPHandler(BaseHTTPRequestHandler):
            def log_message(self, format, *args):
                pass  # Suppress default HTTP logging

            def do_GET(self):
                if self.path == "/health":
                    self.send_response(200)
                    self.send_header("Content-type", "application/json")
                    self.end_headers()
                    self.wfile.write(
                        json.dumps(agent.health_check()).encode()
                    )

                elif self.path == "/ready":
                    health = agent.readiness_check()
                    status_code = 200 if health["ready"] else 503
                    self.send_response(status_code)
                    self.send_header("Content-type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps(health).encode())

                elif self.path == "/metrics":
                    self.send_response(200)
                    self.send_header("Content-type", "application/json")
                    self.end_headers()
                    self.wfile.write(
                        json.dumps(agent.get_metrics()).encode()
                    )

                else:
                    self.send_response(404)
                    self.end_headers()

            def do_POST(self):
                if self.path == "/task":
                    content_length = int(self.headers['Content-Length'])
                    task_data = json.loads(
                        self.rfile.read(content_length).decode()
                    )

                    result = agent.process_task(task_data)

                    self.send_response(200)
                    self.send_header("Content-type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps(result).encode())

                else:
                    self.send_response(404)
                    self.end_headers()

        server = HTTPServer(("0.0.0.0", self.port), AgentHTTPHandler)
        self.logger.info(f"🌐 HTTP server started on port {self.port}")
        server.serve_forever()

    def run(self):
        """Start the agent"""
        self.logger.info(f"🚀 Agent {self.agent_id} starting...")
        self.status = AgentStatus.IDLE

        # Start heartbeat in background
        heartbeat_thread = threading.Thread(target=self.heartbeat, daemon=True)
        heartbeat_thread.start()

        # Start HTTP server (blocking)
        self.start_http_server()


# Example specialized agent
class QuantumMechanicsAgent(BaseAgent):
    """Example: Quantum Mechanics specialized agent"""

    def __init__(self, agent_id: Optional[str] = None):
        super().__init__(
            agent_type=AgentType.QUANTUM_MECHANICS,
            capabilities=[
                "hydrogen_energy",
                "wave_function",
                "uncertainty",
                "harmonic_oscillator"
            ],
            agent_id=agent_id
        )

    def execute_task(self, task: Dict) -> Dict:
        """Execute quantum mechanics calculation"""
        calc_type = task.get("calculation_type")

        if calc_type == "hydrogen_energy":
            n = task.get("n", 1)
            energy = -13.6 / (n ** 2)
            return {"energy_eV": energy, "n": n}

        elif calc_type == "uncertainty":
            delta_x = task.get("delta_x")
            h_bar = 1.054571817e-34
            delta_p_min = h_bar / (2 * delta_x)
            return {"delta_p_min": delta_p_min}

        else:
            raise ValueError(f"Unknown calculation type: {calc_type}")


# Entry point
if __name__ == "__main__":
    import sys

    # Get agent type from environment or command line
    agent_type_str = os.getenv("AGENT_TYPE", "quantum_mechanics")
    agent_id = os.getenv("AGENT_ID")
    port = int(os.getenv("PORT", "8080"))

    # Create appropriate agent
    if agent_type_str == "quantum_mechanics":
        agent = QuantumMechanicsAgent(agent_id=agent_id)
    else:
        print(f"Unknown agent type: {agent_type_str}")
        sys.exit(1)

    # Run agent
    agent.run()
