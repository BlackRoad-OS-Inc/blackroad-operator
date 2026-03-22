#!/usr/bin/env python3
"""
BlackRoad Metrics Collector - Time-series monitoring
Collects CPU, memory, disk, network, and service metrics from all nodes
"""

import asyncio
import json
import os
import time
import subprocess
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass
from typing import Dict, List
import sqlite3

@dataclass
class Metric:
    timestamp: float
    node: str
    metric_name: str
    value: float
    tags: Dict[str, str]

class MetricsCollector:
    def __init__(self, db_path: str = "~/.blackroad/metrics/metrics.db"):
        self.db_path = os.path.expanduser(db_path)
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self.nodes = ["cecilia", "lucidia", "octavia", "aria", "anastasia"]
        self._init_db()

    def _init_db(self):
        """Initialize SQLite database"""
        conn = sqlite3.connect(self.db_path)
        conn.execute('''
            CREATE TABLE IF NOT EXISTS metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp REAL,
                node TEXT,
                metric_name TEXT,
                value REAL,
                tags TEXT
            )
        ''')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_metric_time ON metrics(metric_name, timestamp)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_node_time ON metrics(node, timestamp)')
        conn.commit()
        conn.close()

    def _ssh_cmd(self, node: str, cmd: str, timeout: int = 5) -> str:
        """Execute command on remote node"""
        try:
            result = subprocess.run(
                f"ssh -o ConnectTimeout={timeout} {node} '{cmd}'",
                shell=True, capture_output=True, text=True, timeout=timeout+5
            )
            return result.stdout.strip()
        except:
            return ""

    def collect_node_metrics(self, node: str) -> List[Metric]:
        """Collect all metrics from a node"""
        metrics = []
        ts = time.time()

        # CPU
        cpu = self._ssh_cmd(node, "top -bn1 | grep 'Cpu' | awk '{print $2}'")
        if cpu:
            try:
                metrics.append(Metric(ts, node, "cpu_percent", float(cpu), {}))
            except:
                pass

        # Memory
        mem = self._ssh_cmd(node, "free | awk '/Mem:/{printf \"%.1f\", $3/$2*100}'")
        if mem:
            try:
                metrics.append(Metric(ts, node, "memory_percent", float(mem), {}))
            except:
                pass

        # Disk
        disk = self._ssh_cmd(node, "df / | awk 'NR==2{print $5}' | tr -d '%'")
        if disk:
            try:
                metrics.append(Metric(ts, node, "disk_percent", float(disk), {}))
            except:
                pass

        # Load average
        load = self._ssh_cmd(node, "cat /proc/loadavg | awk '{print $1}'")
        if load:
            try:
                metrics.append(Metric(ts, node, "load_1m", float(load), {}))
            except:
                pass

        # Network (bytes received)
        net = self._ssh_cmd(node, "cat /sys/class/net/eth0/statistics/rx_bytes 2>/dev/null || cat /sys/class/net/end0/statistics/rx_bytes 2>/dev/null")
        if net:
            try:
                metrics.append(Metric(ts, node, "network_rx_bytes", float(net), {}))
            except:
                pass

        # Service checks (port open = 1, closed = 0)
        for port, service in [(8000, "api"), (8765, "mesh"), (8766, "eventbus"), (11434, "ollama")]:
            check = self._ssh_cmd(node, f"ss -tlnp | grep -q :{port} && echo 1 || echo 0")
            try:
                metrics.append(Metric(ts, node, f"service_{service}", float(check), {}))
            except:
                pass

        return metrics

    def collect_all(self) -> List[Metric]:
        """Collect metrics from all nodes"""
        all_metrics = []
        for node in self.nodes:
            metrics = self.collect_node_metrics(node)
            all_metrics.extend(metrics)
        return all_metrics

    def save_metrics(self, metrics: List[Metric]):
        """Save metrics to database"""
        conn = sqlite3.connect(self.db_path)
        for m in metrics:
            conn.execute(
                'INSERT INTO metrics (timestamp, node, metric_name, value, tags) VALUES (?, ?, ?, ?, ?)',
                (m.timestamp, m.node, m.metric_name, m.value, json.dumps(m.tags))
            )
        conn.commit()
        conn.close()

    def query(self, metric_name: str, node: str = None, since: float = None, limit: int = 100) -> List[dict]:
        """Query metrics from database"""
        conn = sqlite3.connect(self.db_path)
        sql = "SELECT timestamp, node, metric_name, value FROM metrics WHERE metric_name = ?"
        params = [metric_name]

        if node:
            sql += " AND node = ?"
            params.append(node)

        if since:
            sql += " AND timestamp > ?"
            params.append(since)

        sql += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)

        results = []
        for row in conn.execute(sql, params):
            results.append({
                "timestamp": row[0],
                "node": row[1],
                "metric": row[2],
                "value": row[3]
            })
        conn.close()
        return results

    def latest(self) -> Dict[str, Dict[str, float]]:
        """Get latest metrics for all nodes"""
        conn = sqlite3.connect(self.db_path)
        sql = '''
            SELECT node, metric_name, value FROM metrics m1
            WHERE timestamp = (SELECT MAX(timestamp) FROM metrics m2 WHERE m2.node = m1.node AND m2.metric_name = m1.metric_name)
        '''
        results = {}
        for row in conn.execute(sql):
            node, metric, value = row
            if node not in results:
                results[node] = {}
            results[node][metric] = value
        conn.close()
        return results

if __name__ == "__main__":
    import sys

    collector = MetricsCollector()

    if len(sys.argv) < 2:
        print("Usage: metrics_collector.py <command> [args]")
        print("Commands: collect, query, latest")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "collect":
        metrics = collector.collect_all()
        collector.save_metrics(metrics)
        print(f"Collected {len(metrics)} metrics")

    elif cmd == "query":
        metric = sys.argv[2] if len(sys.argv) > 2 else "cpu_percent"
        results = collector.query(metric)
        for r in results:
            print(f"[{r['node']}] {r['metric']}: {r['value']}")

    elif cmd == "latest":
        latest = collector.latest()
        for node, metrics in latest.items():
            print(f"\n{node}:")
            for name, value in metrics.items():
                print(f"  {name}: {value}")
