#!/usr/bin/env python3
"""
🎯 BlackRoad Agent Health Dashboard
Real-time visualization and monitoring dashboard
"""

import asyncio
import json
from datetime import datetime, timedelta
from pathlib import Path
import sqlite3
from typing import Dict, List

class HealthDashboard:
    """Interactive health dashboard for agent monitoring"""

    def __init__(self, health_db_path: str = None):
        if health_db_path is None:
            health_db_path = Path.home() / ".blackroad" / "health" / "agent_health.db"
        self.db_path = health_db_path

    def get_dashboard_data(self) -> Dict:
        """Get comprehensive dashboard data"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # System overview
        cursor.execute("""
        SELECT * FROM system_health
        ORDER BY timestamp DESC
        LIMIT 1
        """)
        system_health = cursor.fetchone()

        # Recent alerts
        cursor.execute("""
        SELECT * FROM health_alerts
        WHERE resolved = 0
        ORDER BY timestamp DESC
        LIMIT 10
        """)
        alerts = cursor.fetchall()

        # Top unhealthy agents
        cursor.execute("""
        SELECT agent_id, status, health_score, response_time_ms, success_rate
        FROM agent_health
        WHERE (agent_id, timestamp) IN (
            SELECT agent_id, MAX(timestamp)
            FROM agent_health
            GROUP BY agent_id
        )
        ORDER BY health_score ASC
        LIMIT 10
        """)
        unhealthy_agents = cursor.fetchall()

        # Health trend (last 24 hours)
        yesterday = (datetime.now() - timedelta(hours=24)).isoformat()
        cursor.execute("""
        SELECT timestamp, healthy_agents, total_agents, avg_health_score
        FROM system_health
        WHERE timestamp > ?
        ORDER BY timestamp ASC
        """, (yesterday,))
        health_trend = cursor.fetchall()

        conn.close()

        return {
            "system": dict(system_health) if system_health else {},
            "alerts": [dict(a) for a in alerts],
            "unhealthy_agents": [dict(a) for a in unhealthy_agents],
            "health_trend": [dict(t) for t in health_trend],
            "timestamp": datetime.now().isoformat()
        }

    def generate_html_dashboard(self) -> str:
        """Generate HTML dashboard"""
        data = self.get_dashboard_data()
        
        system = data["system"]
        total = system.get("total_agents", 0)
        healthy = system.get("healthy_agents", 0)
        health_pct = (healthy / total * 100) if total > 0 else 0

        html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>🏥 BlackRoad Agent Health Dashboard</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0a0a0a;
            color: #e0e0e0;
            padding: 20px;
        }}
        
        .header {{
            text-align: center;
            padding: 40px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            margin-bottom: 30px;
        }}
        
        .header h1 {{
            font-size: 3em;
            margin-bottom: 10px;
        }}
        
        .header .subtitle {{
            font-size: 1.2em;
            opacity: 0.9;
        }}
        
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        
        .stat-card {{
            background: #1a1a1a;
            border: 2px solid #333;
            border-radius: 15px;
            padding: 25px;
            transition: transform 0.2s, border-color 0.2s;
        }}
        
        .stat-card:hover {{
            transform: translateY(-5px);
            border-color: #667eea;
        }}
        
        .stat-card .label {{
            font-size: 0.9em;
            color: #888;
            margin-bottom: 10px;
        }}
        
        .stat-card .value {{
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }}
        
        .stat-card.healthy .value {{ color: #4ade80; }}
        .stat-card.warning .value {{ color: #fbbf24; }}
        .stat-card.critical .value {{ color: #ef4444; }}
        .stat-card.info .value {{ color: #60a5fa; }}
        
        .section {{
            background: #1a1a1a;
            border: 2px solid #333;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
        }}
        
        .section h2 {{
            font-size: 1.8em;
            margin-bottom: 20px;
            color: #667eea;
        }}
        
        .alert-list {{
            list-style: none;
        }}
        
        .alert-item {{
            background: #2a2a2a;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 10px;
            border-left: 4px solid;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        
        .alert-item.critical {{ border-color: #ef4444; }}
        .alert-item.warning {{ border-color: #fbbf24; }}
        .alert-item.info {{ border-color: #60a5fa; }}
        
        .alert-content {{
            flex: 1;
        }}
        
        .alert-badge {{
            background: #333;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: bold;
            text-transform: uppercase;
        }}
        
        .agent-list {{
            display: grid;
            gap: 15px;
        }}
        
        .agent-item {{
            background: #2a2a2a;
            padding: 20px;
            border-radius: 10px;
            display: grid;
            grid-template-columns: 1fr auto auto auto;
            gap: 20px;
            align-items: center;
        }}
        
        .agent-name {{
            font-weight: bold;
            font-size: 1.1em;
        }}
        
        .metric {{
            text-align: center;
        }}
        
        .metric-label {{
            font-size: 0.8em;
            color: #888;
        }}
        
        .metric-value {{
            font-size: 1.2em;
            font-weight: bold;
            margin-top: 5px;
        }}
        
        .health-bar {{
            height: 8px;
            background: #333;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 10px;
        }}
        
        .health-bar-fill {{
            height: 100%;
            background: linear-gradient(90deg, #4ade80, #22c55e);
            transition: width 0.3s;
        }}
        
        .timestamp {{
            text-align: center;
            color: #666;
            margin-top: 30px;
            font-size: 0.9em;
        }}
        
        @keyframes pulse {{
            0%, 100% {{ opacity: 1; }}
            50% {{ opacity: 0.5; }}
        }}
        
        .live-indicator {{
            display: inline-block;
            width: 10px;
            height: 10px;
            background: #4ade80;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🏥 Agent Health Dashboard</h1>
        <div class="subtitle">
            <span class="live-indicator"></span>
            Real-time monitoring of {total} agents
        </div>
    </div>
    
    <div class="stats-grid">
        <div class="stat-card healthy">
            <div class="label">Healthy Agents</div>
            <div class="value">{healthy}</div>
            <div class="health-bar">
                <div class="health-bar-fill" style="width: {health_pct}%"></div>
            </div>
        </div>
        
        <div class="stat-card warning">
            <div class="label">Degraded</div>
            <div class="value">{system.get('degraded_agents', 0)}</div>
        </div>
        
        <div class="stat-card critical">
            <div class="label">Unhealthy</div>
            <div class="value">{system.get('unhealthy_agents', 0)}</div>
        </div>
        
        <div class="stat-card info">
            <div class="label">Health Score</div>
            <div class="value">{system.get('avg_health_score', 0):.1f}</div>
        </div>
        
        <div class="stat-card info">
            <div class="label">Response Time</div>
            <div class="value">{system.get('avg_response_time', 0):.0f}ms</div>
        </div>
        
        <div class="stat-card info">
            <div class="label">Success Rate</div>
            <div class="value">{system.get('avg_success_rate', 0)*100:.1f}%</div>
        </div>
    </div>
    
    <div class="section">
        <h2>🚨 Active Alerts</h2>
        <ul class="alert-list">
"""

        if data["alerts"]:
            for alert in data["alerts"]:
                level = alert.get("level", "info")
                html += f"""
            <li class="alert-item {level}">
                <div class="alert-content">
                    <div style="font-weight: bold;">{alert.get('message', 'Unknown alert')}</div>
                    <div style="color: #888; font-size: 0.9em; margin-top: 5px;">
                        Agent: {alert.get('agent_id', 'unknown')} | 
                        Metric: {alert.get('metric', 'unknown')}
                    </div>
                </div>
                <span class="alert-badge">{level}</span>
            </li>
"""
        else:
            html += """
            <li class="alert-item info">
                <div class="alert-content">
                    <div style="font-weight: bold;">✅ No active alerts</div>
                    <div style="color: #888; font-size: 0.9em; margin-top: 5px;">
                        All agents are operating normally
                    </div>
                </div>
            </li>
"""

        html += """
        </ul>
    </div>
    
    <div class="section">
        <h2>📊 Agents Requiring Attention</h2>
        <div class="agent-list">
"""

        if data["unhealthy_agents"]:
            for agent in data["unhealthy_agents"][:5]:
                score = agent.get("health_score", 100)
                html += f"""
            <div class="agent-item">
                <div class="agent-name">{agent.get('agent_id', 'unknown')}</div>
                <div class="metric">
                    <div class="metric-label">Health Score</div>
                    <div class="metric-value">{score:.1f}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Response Time</div>
                    <div class="metric-value">{agent.get('response_time_ms', 0):.0f}ms</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Success Rate</div>
                    <div class="metric-value">{agent.get('success_rate', 0)*100:.0f}%</div>
                </div>
            </div>
"""
        else:
            html += """
            <div class="agent-item">
                <div class="agent-name">✅ All agents healthy</div>
            </div>
"""

        html += f"""
        </div>
    </div>
    
    <div class="timestamp">
        Last updated: {data['timestamp']}
    </div>
    
    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => {{ location.reload(); }}, 30000);
    </script>
</body>
</html>
"""
        return html

    def save_dashboard(self, output_path: str = None):
        """Save dashboard to HTML file"""
        if output_path is None:
            output_path = "agent-health-dashboard.html"
        
        html = self.generate_html_dashboard()
        
        with open(output_path, 'w') as f:
            f.write(html)
        
        print(f"📊 Dashboard saved to: {output_path}")
        return output_path


async def main():
    """Generate and display dashboard"""
    print("🎯 Generating Agent Health Dashboard...")
    
    dashboard = HealthDashboard()
    output = dashboard.save_dashboard()
    
    print(f"\n✅ Dashboard ready!")
    print(f"📍 Open: file://{Path(output).absolute()}")
    print(f"🔄 Auto-refreshes every 30 seconds")


if __name__ == "__main__":
    asyncio.run(main())
