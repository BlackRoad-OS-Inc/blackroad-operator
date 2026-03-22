#!/usr/bin/env python3
"""
🔗 Agent Health Integration
Connects health monitoring with agent coordination framework
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime

# Import both systems
sys.path.append(str(Path.home()))
from agent_coordination_framework import AgentCoordinator, AgentState, AgentStatus
from agent_health_monitor import AgentHealthMonitor, AgentHealthMetrics, HealthStatus

class IntegratedAgentSystem:
    """
    Integrated system combining coordination and health monitoring
    """

    def __init__(self):
        self.coordinator = AgentCoordinator()
        self.health_monitor = AgentHealthMonitor()
        
        # Register health alert callback
        self.health_monitor.register_alert_callback(self.handle_health_alert)
        
        print("🔗 Integrated Agent System initialized")

    async def register_agent_with_health(self, agent: AgentState):
        """Register agent in both coordination and health systems"""
        # Register in coordination system
        await self.coordinator.register_agent(agent)
        
        # Initialize health metrics
        initial_metrics = AgentHealthMetrics(
            agent_id=agent.id,
            status=HealthStatus.HEALTHY,
            uptime_seconds=0.0,
            last_heartbeat=datetime.now().isoformat(),
            response_time_ms=0.0,
            success_rate=1.0,
            task_count=0,
            error_count=0
        )
        
        await self.health_monitor.record_health(initial_metrics)
        
        print(f"✅ Registered {agent.id} with health monitoring")

    async def handle_health_alert(self, alert):
        """Handle health alerts and trigger recovery actions"""
        print(f"🚨 HEALTH ALERT: {alert.message} for {alert.agent_id}")
        
        agent = self.coordinator.agents.get(alert.agent_id)
        if not agent:
            return
        
        # Take action based on alert level
        if alert.level.value == "critical":
            # Mark agent as blocked
            agent.status = AgentStatus.BLOCKED
            
            # If agent has a task, reassign it
            if agent.current_task:
                print(f"🔄 Reassigning task {agent.current_task} due to critical health")
                await self.coordinator.reassign_task(agent.current_task)
            
            # Log recovery action
            print(f"🏥 Initiated recovery for {alert.agent_id}")

    async def update_agent_health_from_task(self, agent_id: str, task_completed: bool, 
                                           duration_ms: float):
        """Update agent health based on task completion"""
        agent = self.coordinator.agents.get(agent_id)
        if not agent:
            return
        
        # Calculate success rate
        success_rate = agent.success_rate / 100.0 if hasattr(agent, 'success_rate') else 1.0
        
        # Determine health status
        if success_rate > 0.95 and duration_ms < 5000:
            status = HealthStatus.HEALTHY
        elif success_rate > 0.85 and duration_ms < 10000:
            status = HealthStatus.DEGRADED
        elif success_rate > 0.70:
            status = HealthStatus.UNHEALTHY
        else:
            status = HealthStatus.CRITICAL
        
        # Create health metrics
        metrics = AgentHealthMetrics(
            agent_id=agent_id,
            status=status,
            uptime_seconds=(datetime.now() - datetime.fromisoformat(agent.last_heartbeat)).total_seconds(),
            last_heartbeat=agent.last_heartbeat,
            response_time_ms=duration_ms,
            success_rate=success_rate,
            task_count=agent.tasks_completed,
            error_count=0 if task_completed else 1
        )
        
        metrics.health_score = await self.health_monitor.calculate_health_score(metrics)
        
        await self.health_monitor.record_health(metrics)

    async def run_health_check_cycle(self):
        """Run a health check on all agents"""
        print("\n🏥 Running health check cycle...")
        
        for agent_id, agent in self.coordinator.agents.items():
            # Calculate time since last heartbeat
            last_hb = datetime.fromisoformat(agent.last_heartbeat)
            time_since_hb = (datetime.now() - last_hb).total_seconds()
            
            # Determine status based on heartbeat
            if time_since_hb > 300:  # 5 minutes
                status = HealthStatus.CRITICAL
            elif time_since_hb > 120:  # 2 minutes
                status = HealthStatus.UNHEALTHY
            elif time_since_hb > 60:  # 1 minute
                status = HealthStatus.DEGRADED
            else:
                status = HealthStatus.HEALTHY
            
            # Create health snapshot
            metrics = AgentHealthMetrics(
                agent_id=agent_id,
                status=status,
                uptime_seconds=time_since_hb,
                last_heartbeat=agent.last_heartbeat,
                response_time_ms=0.0,  # Would be measured from actual calls
                success_rate=agent.success_rate / 100.0,
                task_count=agent.tasks_completed,
                error_count=0
            )
            
            await self.health_monitor.record_health(metrics)
        
        # Get system health snapshot
        snapshot = await self.health_monitor.get_system_health_snapshot()
        print(f"✅ Health check complete: {snapshot['healthy']}/{snapshot['total_agents']} healthy")
        
        return snapshot

    async def start_integrated_monitoring(self, interval: int = 60):
        """Start integrated monitoring loop"""
        print(f"🚀 Starting integrated monitoring (interval: {interval}s)")
        
        while True:
            try:
                # Run health checks
                await self.run_health_check_cycle()
                
                # Detect stalled agents
                stalled = await self.coordinator.detect_stalled_agents()
                if stalled:
                    print(f"⚠️  Detected {len(stalled)} stalled agents")
                
                # Get coordinator stats
                stats = await self.coordinator.get_stats()
                print(f"📊 System: {stats['agents']['active']} active, "
                      f"{stats['tasks']['pending']} pending tasks")
                
            except Exception as e:
                print(f"❌ Monitoring error: {e}")
            
            await asyncio.sleep(interval)


async def demo():
    """Demo the integrated system"""
    print("""
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║        🔗 INTEGRATED AGENT COORDINATION + HEALTH SYSTEM         ║
║                                                                  ║
║     Unified agent management with health monitoring             ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
    """)

    system = IntegratedAgentSystem()

    # Register some demo agents
    print("\n📝 Registering demo agents...")
    
    demo_agents = [
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

    for agent in demo_agents:
        await system.register_agent_with_health(agent)

    # Simulate some heartbeats
    print("\n💓 Simulating heartbeats...")
    for agent in demo_agents:
        await system.coordinator.heartbeat(agent.id)

    # Run health check
    print("\n🏥 Running health check...")
    snapshot = await system.run_health_check_cycle()
    
    print("\n📊 System Health:")
    print(f"  Total Agents: {snapshot['total_agents']}")
    print(f"  Healthy: {snapshot['healthy']}")
    print(f"  Avg Health Score: {snapshot['avg_health_score']:.2f}")

    # Generate dashboard
    print("\n📊 Generating dashboard...")
    from agent_health_dashboard import HealthDashboard
    dashboard = HealthDashboard()
    output = dashboard.save_dashboard()
    
    print(f"\n✅ Demo complete!")
    print(f"📍 View dashboard: file://{Path(output).absolute()}")


if __name__ == "__main__":
    asyncio.run(demo())
