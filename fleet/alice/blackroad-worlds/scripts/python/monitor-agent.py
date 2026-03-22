#!/usr/bin/env python3
"""
🔍 BlackRoad Autonomous Monitoring Agent
Watches for issues and fixes them automatically
"""

import os
import sys
import time
import json
import sqlite3
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List

class MonitoringAgent:
    """Autonomous monitoring and self-healing agent"""
    
    def __init__(self, name: str = "Monitor"):
        self.name = name
        self.agent_id = f"monitor-{int(time.time())}"
        self.blackroad_dir = Path.home() / '.blackroad'
        self.memory_dir = self.blackroad_dir / 'memory'
        self.alerts_db = self.memory_dir / 'alerts.db'
        self.running = True
        self.checks_run = 0
        self.issues_fixed = 0
        
        # Create directories
        self.memory_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize alerts database
        self.init_alerts_db()
        
    def init_alerts_db(self):
        """Initialize alerts database"""
        conn = sqlite3.connect(self.alerts_db)
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                check_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                message TEXT NOT NULL,
                details TEXT,
                status TEXT DEFAULT 'open',
                created_at TEXT NOT NULL,
                resolved_at TEXT,
                resolution TEXT
            )
        ''')
        conn.commit()
        conn.close()
        
    def log_memory(self, action: str, details: str):
        """Log to memory system"""
        try:
            subprocess.run([
                'bash', '-c',
                f'~/memory-system.sh log "{action}" "{self.agent_id}" "{details}" "monitoring,autonomous"'
            ], capture_output=True, timeout=5)
        except:
            pass
            
    def create_alert(self, check_type: str, severity: str, message: str, details: str = ""):
        """Create an alert"""
        conn = sqlite3.connect(self.alerts_db)
        c = conn.cursor()
        c.execute('''
            INSERT INTO alerts (check_type, severity, message, details, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (check_type, severity, message, details, datetime.now().isoformat()))
        alert_id = c.lastrowid
        conn.commit()
        conn.close()
        
        print(f"🚨 ALERT [{severity}]: {message}")
        self.log_memory("alert-created", f"{severity} alert: {message}")
        
        return alert_id
        
    def resolve_alert(self, alert_id: int, resolution: str):
        """Mark alert as resolved"""
        conn = sqlite3.connect(self.alerts_db)
        c = conn.cursor()
        c.execute('''
            UPDATE alerts 
            SET status = 'resolved', resolved_at = ?, resolution = ?
            WHERE id = ?
        ''', (datetime.now().isoformat(), resolution, alert_id))
        conn.commit()
        conn.close()
        
        print(f"✅ Alert {alert_id} resolved: {resolution}")
        self.log_memory("alert-resolved", f"Alert {alert_id}: {resolution}")
        
    def check_disk_space(self) -> List[int]:
        """Check disk space on all devices"""
        alerts = []
        try:
            result = subprocess.run(['df', '-h'], capture_output=True, text=True)
            lines = result.stdout.split('\n')[1:]  # Skip header
            
            for line in lines:
                if not line.strip():
                    continue
                    
                parts = line.split()
                if len(parts) >= 5:
                    usage = parts[4].rstrip('%')
                    mount = parts[-1]
                    
                    if usage.isdigit():
                        usage_pct = int(usage)
                        
                        if usage_pct > 90:
                            alert_id = self.create_alert(
                                'disk-space',
                                'critical',
                                f'Disk usage at {usage_pct}% on {mount}',
                                f'Threshold: 90%. Current: {usage_pct}%'
                            )
                            alerts.append(alert_id)
                            
                            # Try to fix
                            self.fix_disk_space(mount)
                            
        except Exception as e:
            print(f"❌ Disk check error: {e}")
            
        return alerts
        
    def fix_disk_space(self, mount: str):
        """Attempt to free disk space"""
        print(f"🔧 Attempting to free space on {mount}...")
        
        try:
            # Clean package caches
            if mount == '/':
                subprocess.run(['brew', 'cleanup'], capture_output=True, timeout=60)
                subprocess.run(['npm', 'cache', 'clean', '--force'], capture_output=True, timeout=60)
                subprocess.run(['pip', 'cache', 'purge'], capture_output=True, timeout=60)
                
                print("✅ Cleaned package caches")
                self.issues_fixed += 1
                
        except Exception as e:
            print(f"❌ Fix failed: {e}")
            
    def check_services(self) -> List[int]:
        """Check if critical services are running"""
        alerts = []
        critical_services = ['ollama']
        
        for service in critical_services:
            try:
                result = subprocess.run(['pgrep', '-x', service], capture_output=True)
                
                if result.returncode != 0:
                    alert_id = self.create_alert(
                        'service-down',
                        'critical',
                        f'Service {service} is not running',
                        f'Expected process not found'
                    )
                    alerts.append(alert_id)
                    
                    # Try to fix
                    self.fix_service(service, alert_id)
                    
            except Exception as e:
                print(f"❌ Service check error for {service}: {e}")
                
        return alerts
        
    def fix_service(self, service: str, alert_id: int):
        """Attempt to restart a service"""
        print(f"🔧 Attempting to restart {service}...")
        
        try:
            if service == 'ollama':
                subprocess.Popen(['ollama', 'serve'], 
                               stdout=subprocess.DEVNULL, 
                               stderr=subprocess.DEVNULL)
                time.sleep(5)
                
                # Verify it started
                result = subprocess.run(['pgrep', '-x', 'ollama'], capture_output=True)
                if result.returncode == 0:
                    self.resolve_alert(alert_id, f"Restarted {service} successfully")
                    self.issues_fixed += 1
                else:
                    print(f"❌ Failed to restart {service}")
                    
        except Exception as e:
            print(f"❌ Fix failed: {e}")
            
    def check_github_actions(self) -> List[int]:
        """Check GitHub Actions for failures"""
        alerts = []
        
        try:
            result = subprocess.run([
                'gh', 'run', 'list', 
                '--limit', '10',
                '--json', 'conclusion,name,workflowName'
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                runs = json.loads(result.stdout)
                
                for run in runs:
                    if run.get('conclusion') == 'failure':
                        alert_id = self.create_alert(
                            'workflow-failure',
                            'warning',
                            f"Workflow failed: {run.get('workflowName', 'Unknown')}",
                            json.dumps(run)
                        )
                        alerts.append(alert_id)
                        
        except Exception as e:
            print(f"❌ GitHub Actions check error: {e}")
            
        return alerts
        
    def check_memory_system(self) -> List[int]:
        """Check memory system health"""
        alerts = []
        
        try:
            memory_file = self.memory_dir / 'memory-system.json'
            
            if not memory_file.exists():
                alert_id = self.create_alert(
                    'memory-system',
                    'warning',
                    'Memory system file not found',
                    f'Expected: {memory_file}'
                )
                alerts.append(alert_id)
                
        except Exception as e:
            print(f"❌ Memory check error: {e}")
            
        return alerts
        
    def run_checks(self):
        """Run all monitoring checks"""
        print(f"\n🔍 Running checks ({datetime.now().strftime('%H:%M:%S')})...")
        
        all_alerts = []
        
        # Run each check
        all_alerts.extend(self.check_disk_space())
        all_alerts.extend(self.check_services())
        all_alerts.extend(self.check_github_actions())
        all_alerts.extend(self.check_memory_system())
        
        self.checks_run += 1
        
        if all_alerts:
            print(f"⚠️  Created {len(all_alerts)} alert(s)")
        else:
            print("✅ All checks passed")
            
        # Log check run
        self.log_memory(
            "monitoring-check",
            f"Ran {4} checks. Alerts: {len(all_alerts)}. Issues fixed: {self.issues_fixed}"
        )
        
    def run(self, interval: int = 60):
        """Main monitoring loop"""
        print(f"🔍 {self.name} Monitoring Agent starting...")
        print(f"   Agent ID: {self.agent_id}")
        print(f"   Check interval: {interval} seconds")
        print(f"   Alerts DB: {self.alerts_db}")
        
        self.log_memory(
            "monitor-start",
            f"Monitoring agent started. Check interval: {interval}s"
        )
        
        print("✅ Monitoring active. Press Ctrl+C to stop.\n")
        
        try:
            while self.running:
                self.run_checks()
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print(f"\n🛑 Monitoring stopped")
            print(f"   Checks run: {self.checks_run}")
            print(f"   Issues fixed: {self.issues_fixed}")
            
            self.log_memory(
                "monitor-stop",
                f"Monitoring stopped. Checks: {self.checks_run}, Fixed: {self.issues_fixed}"
            )

def main():
    """Main entry point"""
    interval = int(sys.argv[1]) if len(sys.argv) > 1 else 60
    
    monitor = MonitoringAgent()
    monitor.run(interval)

if __name__ == '__main__':
    main()
