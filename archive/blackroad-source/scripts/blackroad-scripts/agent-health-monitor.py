#!/usr/bin/env python3
"""
🏥 BlackRoad Agent Health Monitor
Real-time health monitoring and diagnostics for 30K+ agent system
"""

import asyncio
import json
import sqlite3
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
from pathlib import Path

class HealthStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    CRITICAL = "critical"
    UNKNOWN = "unknown"

class AlertLevel(Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

@dataclass
class AgentHealthMetrics:
    """Comprehensive health metrics for an agent"""
    agent_id: str
    status: HealthStatus
    uptime_seconds: float
    last_heartbeat: str
    response_time_ms: float
    success_rate: float
    task_count: int
    error_count: int
    memory_usage_mb: Optional[float] = None
    cpu_usage_percent: Optional[float] = None
    load_average: Optional[float] = None
    last_error: Optional[str] = None
    health_score: float = 100.0
    timestamp: str = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()

@dataclass
class HealthAlert:
    """Health alert for agent issues"""
    id: str
    level: AlertLevel
    agent_id: str
    message: str
    metric: str
    value: Any
    threshold: Any
    timestamp: str
    resolved: bool = False
    resolution_time: Optional[str] = None

class AgentHealthMonitor:
    """
    Comprehensive health monitoring system for BlackRoad agents
    - Real-time health tracking
    - Predictive failure detection
    - Automated recovery actions
    - Performance analytics
    """

    def __init__(self, db_path: str = None):
        if db_path is None:
            db_path = Path.home() / ".blackroad" / "health" / "agent_health.db"
        
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.init_database()

        # Health thresholds
        self.thresholds = {
            "heartbeat_timeout": 300,  # 5 minutes
            "response_time_warning": 5000,  # 5 seconds
            "response_time_critical": 15000,  # 15 seconds
            "success_rate_warning": 0.90,  # 90%
            "success_rate_critical": 0.70,  # 70%
            "error_count_warning": 10,
            "error_count_critical": 50,
            "cpu_warning": 80.0,
            "cpu_critical": 95.0,
            "memory_warning": 80.0,
            "memory_critical": 95.0,
        }

        # Active monitoring
        self.monitoring_active = False
        self.alert_callbacks: List = []

    def init_database(self):
        """Initialize health monitoring database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Agent health metrics
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS agent_health (
            agent_id TEXT,
            timestamp TEXT,
            status TEXT,
            uptime_seconds REAL,
            response_time_ms REAL,
            success_rate REAL,
            task_count INTEGER,
            error_count INTEGER,
            memory_usage_mb REAL,
            cpu_usage_percent REAL,
            load_average REAL,
            health_score REAL,
            last_error TEXT,
            PRIMARY KEY (agent_id, timestamp)
        )
        """)

        # Health alerts
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS health_alerts (
            id TEXT PRIMARY KEY,
            level TEXT,
            agent_id TEXT,
            message TEXT,
            metric TEXT,
            value TEXT,
            threshold TEXT,
            timestamp TEXT,
            resolved BOOLEAN,
            resolution_time TEXT
        )
        """)

        # Health events (for timeline)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS health_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_id TEXT,
            event_type TEXT,
            event_data TEXT,
            severity TEXT,
            timestamp TEXT
        )
        """)

        # System-wide health snapshots
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_health (
            timestamp TEXT PRIMARY KEY,
            total_agents INTEGER,
            healthy_agents INTEGER,
            degraded_agents INTEGER,
            unhealthy_agents INTEGER,
            critical_agents INTEGER,
            unknown_agents INTEGER,
            avg_response_time REAL,
            avg_success_rate REAL,
            avg_health_score REAL,
            active_alerts INTEGER,
            total_tasks INTEGER,
            tasks_per_second REAL
        )
        """)

        # Recovery actions
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS recovery_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_id TEXT,
            action_type TEXT,
            trigger_reason TEXT,
            action_taken TEXT,
            success BOOLEAN,
            timestamp TEXT,
            duration_seconds REAL,
            notes TEXT
        )
        """)

        # Create indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_agent_timestamp ON agent_health(agent_id, timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_health_status ON agent_health(status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON health_alerts(resolved, level)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_agent ON health_events(agent_id, timestamp)")

        conn.commit()
        conn.close()

    async def record_health(self, metrics: AgentHealthMetrics):
        """Record agent health metrics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
        INSERT INTO agent_health (
            agent_id, timestamp, status, uptime_seconds, response_time_ms,
            success_rate, task_count, error_count, memory_usage_mb,
            cpu_usage_percent, load_average, health_score, last_error
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            metrics.agent_id,
            metrics.timestamp,
            metrics.status.value,
            metrics.uptime_seconds,
            metrics.response_time_ms,
            metrics.success_rate,
            metrics.task_count,
            metrics.error_count,
            metrics.memory_usage_mb,
            metrics.cpu_usage_percent,
            metrics.load_average,
            metrics.health_score,
            metrics.last_error
        ))

        conn.commit()
        conn.close()

        # Check thresholds and create alerts
        await self.check_health_thresholds(metrics)

    async def check_health_thresholds(self, metrics: AgentHealthMetrics):
        """Check if metrics exceed thresholds and create alerts"""
        alerts = []

        # Check response time
        if metrics.response_time_ms > self.thresholds["response_time_critical"]:
            alerts.append(self.create_alert(
                AlertLevel.CRITICAL,
                metrics.agent_id,
                "Critical response time",
                "response_time_ms",
                metrics.response_time_ms,
                self.thresholds["response_time_critical"]
            ))
        elif metrics.response_time_ms > self.thresholds["response_time_warning"]:
            alerts.append(self.create_alert(
                AlertLevel.WARNING,
                metrics.agent_id,
                "High response time",
                "response_time_ms",
                metrics.response_time_ms,
                self.thresholds["response_time_warning"]
            ))

        # Check success rate
        if metrics.success_rate < self.thresholds["success_rate_critical"]:
            alerts.append(self.create_alert(
                AlertLevel.CRITICAL,
                metrics.agent_id,
                "Critical success rate",
                "success_rate",
                metrics.success_rate,
                self.thresholds["success_rate_critical"]
            ))
        elif metrics.success_rate < self.thresholds["success_rate_warning"]:
            alerts.append(self.create_alert(
                AlertLevel.WARNING,
                metrics.agent_id,
                "Low success rate",
                "success_rate",
                metrics.success_rate,
                self.thresholds["success_rate_warning"]
            ))

        # Check error count
        if metrics.error_count > self.thresholds["error_count_critical"]:
            alerts.append(self.create_alert(
                AlertLevel.CRITICAL,
                metrics.agent_id,
                "Critical error count",
                "error_count",
                metrics.error_count,
                self.thresholds["error_count_critical"]
            ))

        # Check CPU usage
        if metrics.cpu_usage_percent and metrics.cpu_usage_percent > self.thresholds["cpu_critical"]:
            alerts.append(self.create_alert(
                AlertLevel.CRITICAL,
                metrics.agent_id,
                "Critical CPU usage",
                "cpu_usage_percent",
                metrics.cpu_usage_percent,
                self.thresholds["cpu_critical"]
            ))

        # Store alerts
        for alert in alerts:
            await self.store_alert(alert)
            await self.trigger_alert_callbacks(alert)

    def create_alert(self, level: AlertLevel, agent_id: str, message: str,
                    metric: str, value: Any, threshold: Any) -> HealthAlert:
        """Create a health alert"""
        alert_id = f"{agent_id}_{metric}_{int(time.time())}"
        return HealthAlert(
            id=alert_id,
            level=level,
            agent_id=agent_id,
            message=message,
            metric=metric,
            value=value,
            threshold=threshold,
            timestamp=datetime.now().isoformat()
        )

    async def store_alert(self, alert: HealthAlert):
        """Store alert in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
        INSERT OR REPLACE INTO health_alerts (
            id, level, agent_id, message, metric, value, threshold,
            timestamp, resolved, resolution_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            alert.id,
            alert.level.value,
            alert.agent_id,
            alert.message,
            alert.metric,
            json.dumps(alert.value),
            json.dumps(alert.threshold),
            alert.timestamp,
            alert.resolved,
            alert.resolution_time
        ))

        conn.commit()
        conn.close()

    async def trigger_alert_callbacks(self, alert: HealthAlert):
        """Trigger registered alert callbacks"""
        for callback in self.alert_callbacks:
            try:
                await callback(alert)
            except Exception as e:
                print(f"Error in alert callback: {e}")

    async def get_agent_health(self, agent_id: str, limit: int = 100) -> List[AgentHealthMetrics]:
        """Get recent health metrics for an agent"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("""
        SELECT * FROM agent_health
        WHERE agent_id = ?
        ORDER BY timestamp DESC
        LIMIT ?
        """, (agent_id, limit))

        rows = cursor.fetchall()
        conn.close()

        metrics = []
        for row in rows:
            metrics.append(AgentHealthMetrics(
                agent_id=row["agent_id"],
                status=HealthStatus(row["status"]),
                uptime_seconds=row["uptime_seconds"],
                last_heartbeat=row["timestamp"],
                response_time_ms=row["response_time_ms"],
                success_rate=row["success_rate"],
                task_count=row["task_count"],
                error_count=row["error_count"],
                memory_usage_mb=row["memory_usage_mb"],
                cpu_usage_percent=row["cpu_usage_percent"],
                load_average=row["load_average"],
                health_score=row["health_score"],
                last_error=row["last_error"],
                timestamp=row["timestamp"]
            ))

        return metrics

    async def get_system_health_snapshot(self) -> Dict[str, Any]:
        """Get current system-wide health snapshot"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Get latest metrics for each agent
        cursor.execute("""
        SELECT agent_id, MAX(timestamp) as latest
        FROM agent_health
        GROUP BY agent_id
        """)
        
        agents = cursor.fetchall()
        
        health_counts = {
            HealthStatus.HEALTHY: 0,
            HealthStatus.DEGRADED: 0,
            HealthStatus.UNHEALTHY: 0,
            HealthStatus.CRITICAL: 0,
            HealthStatus.UNKNOWN: 0
        }

        total_response_time = 0
        total_success_rate = 0
        total_health_score = 0
        total_tasks = 0
        agent_count = 0

        for agent in agents:
            cursor.execute("""
            SELECT * FROM agent_health
            WHERE agent_id = ? AND timestamp = ?
            """, (agent["agent_id"], agent["latest"]))
            
            health = cursor.fetchone()
            if health:
                health_counts[HealthStatus(health["status"])] += 1
                total_response_time += health["response_time_ms"]
                total_success_rate += health["success_rate"]
                total_health_score += health["health_score"]
                total_tasks += health["task_count"]
                agent_count += 1

        # Get active alerts
        cursor.execute("""
        SELECT COUNT(*) as count FROM health_alerts
        WHERE resolved = 0
        """)
        active_alerts = cursor.fetchone()["count"]

        conn.close()

        return {
            "timestamp": datetime.now().isoformat(),
            "total_agents": agent_count,
            "healthy": health_counts[HealthStatus.HEALTHY],
            "degraded": health_counts[HealthStatus.DEGRADED],
            "unhealthy": health_counts[HealthStatus.UNHEALTHY],
            "critical": health_counts[HealthStatus.CRITICAL],
            "unknown": health_counts[HealthStatus.UNKNOWN],
            "avg_response_time_ms": total_response_time / agent_count if agent_count > 0 else 0,
            "avg_success_rate": total_success_rate / agent_count if agent_count > 0 else 0,
            "avg_health_score": total_health_score / agent_count if agent_count > 0 else 0,
            "active_alerts": active_alerts,
            "total_tasks": total_tasks
        }

    async def calculate_health_score(self, metrics: AgentHealthMetrics) -> float:
        """Calculate overall health score (0-100)"""
        score = 100.0

        # Response time impact (max -30)
        if metrics.response_time_ms > self.thresholds["response_time_critical"]:
            score -= 30
        elif metrics.response_time_ms > self.thresholds["response_time_warning"]:
            score -= 15

        # Success rate impact (max -40)
        if metrics.success_rate < self.thresholds["success_rate_critical"]:
            score -= 40
        elif metrics.success_rate < self.thresholds["success_rate_warning"]:
            score -= 20

        # Error count impact (max -20)
        if metrics.error_count > self.thresholds["error_count_critical"]:
            score -= 20
        elif metrics.error_count > self.thresholds["error_count_warning"]:
            score -= 10

        # CPU usage impact (max -10)
        if metrics.cpu_usage_percent:
            if metrics.cpu_usage_percent > self.thresholds["cpu_critical"]:
                score -= 10
            elif metrics.cpu_usage_percent > self.thresholds["cpu_warning"]:
                score -= 5

        return max(0.0, score)

    async def get_active_alerts(self, level: Optional[AlertLevel] = None) -> List[HealthAlert]:
        """Get active (unresolved) alerts"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        if level:
            cursor.execute("""
            SELECT * FROM health_alerts
            WHERE resolved = 0 AND level = ?
            ORDER BY timestamp DESC
            """, (level.value,))
        else:
            cursor.execute("""
            SELECT * FROM health_alerts
            WHERE resolved = 0
            ORDER BY timestamp DESC
            """)

        rows = cursor.fetchall()
        conn.close()

        alerts = []
        for row in rows:
            alerts.append(HealthAlert(
                id=row["id"],
                level=AlertLevel(row["level"]),
                agent_id=row["agent_id"],
                message=row["message"],
                metric=row["metric"],
                value=json.loads(row["value"]),
                threshold=json.loads(row["threshold"]),
                timestamp=row["timestamp"],
                resolved=bool(row["resolved"]),
                resolution_time=row["resolution_time"]
            ))

        return alerts

    def register_alert_callback(self, callback):
        """Register callback for health alerts"""
        self.alert_callbacks.append(callback)

    async def start_monitoring(self, interval: int = 60):
        """Start continuous health monitoring"""
        self.monitoring_active = True
        print(f"🏥 Starting agent health monitoring (interval: {interval}s)")

        while self.monitoring_active:
            try:
                snapshot = await self.get_system_health_snapshot()
                await self.store_system_snapshot(snapshot)
                
                print(f"✅ Health check: {snapshot['healthy']}/{snapshot['total_agents']} healthy")
                
            except Exception as e:
                print(f"❌ Monitoring error: {e}")

            await asyncio.sleep(interval)

    async def store_system_snapshot(self, snapshot: Dict[str, Any]):
        """Store system health snapshot"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
        INSERT INTO system_health (
            timestamp, total_agents, healthy_agents, degraded_agents,
            unhealthy_agents, critical_agents, unknown_agents,
            avg_response_time, avg_success_rate, avg_health_score,
            active_alerts, total_tasks, tasks_per_second
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            snapshot["timestamp"],
            snapshot["total_agents"],
            snapshot["healthy"],
            snapshot["degraded"],
            snapshot["unhealthy"],
            snapshot["critical"],
            snapshot["unknown"],
            snapshot["avg_response_time_ms"],
            snapshot["avg_success_rate"],
            snapshot["avg_health_score"],
            snapshot["active_alerts"],
            snapshot["total_tasks"],
            0.0  # tasks_per_second - calculate if needed
        ))

        conn.commit()
        conn.close()

    def stop_monitoring(self):
        """Stop health monitoring"""
        self.monitoring_active = False
        print("🛑 Health monitoring stopped")


async def demo():
    """Demo the health monitoring system"""
    print("""
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║            🏥 BLACKROAD AGENT HEALTH MONITOR 🏥                 ║
║                                                                  ║
║          Real-time Health Monitoring for 30K+ Agents            ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
    """)

    monitor = AgentHealthMonitor()

    # Register alert callback
    async def alert_handler(alert: HealthAlert):
        print(f"🚨 {alert.level.value.upper()}: {alert.message} for {alert.agent_id}")

    monitor.register_alert_callback(alert_handler)

    # Simulate some agent health data
    print("\n📊 Recording agent health metrics...")
    
    for i in range(5):
        metrics = AgentHealthMetrics(
            agent_id=f"agent-{i:03d}",
            status=HealthStatus.HEALTHY,
            uptime_seconds=3600 + i * 100,
            last_heartbeat=datetime.now().isoformat(),
            response_time_ms=100 + i * 50,
            success_rate=0.95 - (i * 0.02),
            task_count=100 + i * 10,
            error_count=i * 2,
            cpu_usage_percent=50 + i * 5,
            memory_usage_mb=256 + i * 64
        )
        metrics.health_score = await monitor.calculate_health_score(metrics)
        await monitor.record_health(metrics)

    print("✅ Health data recorded")

    # Get system snapshot
    print("\n📈 System Health Snapshot:")
    snapshot = await monitor.get_system_health_snapshot()
    print(json.dumps(snapshot, indent=2))

    # Get active alerts
    print("\n🚨 Active Alerts:")
    alerts = await monitor.get_active_alerts()
    print(f"Found {len(alerts)} active alerts")

    print("\n✅ Demo complete!")


if __name__ == "__main__":
    asyncio.run(demo())
