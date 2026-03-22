#!/bin/bash
# BlackRoad API Gateway - Intelligent Load Balancing & Routing
# Central entry point for the BlackRoad Internet

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
NC='\033[0m'

HOSTNAME=$(hostname)

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  BlackRoad API Gateway - Installing on $HOSTNAME${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

mkdir -p ~/.blackroad/gateway
mkdir -p ~/.blackroad/gateway/logs

# ============================================================
# [1/4] API Gateway Server
# ============================================================
echo -e "${AMBER}[1/4]${NC} Creating API Gateway Server..."

cat > ~/.blackroad/gateway/gateway.py << 'GATEWAY'
#!/usr/bin/env python3
"""
BlackRoad API Gateway - Intelligent Load Balancer
Routes requests to healthy backend nodes with round-robin, weighted, and least-connections strategies
"""

import asyncio
import aiohttp
from aiohttp import web
import json
import time
import os
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from collections import defaultdict
import random

@dataclass
class Backend:
    name: str
    host: str
    port: int
    weight: int = 1
    healthy: bool = True
    last_check: float = 0
    response_time: float = 0
    connections: int = 0
    requests: int = 0
    errors: int = 0

@dataclass
class GatewayConfig:
    backends: List[Backend] = field(default_factory=list)
    strategy: str = "round_robin"  # round_robin, weighted, least_conn, random
    health_interval: int = 30
    timeout: int = 10
    retry_count: int = 2

class BlackRoadGateway:
    def __init__(self, config: GatewayConfig):
        self.config = config
        self.current_index = 0
        self.stats = {
            "total_requests": 0,
            "successful": 0,
            "failed": 0,
            "started_at": time.time()
        }

    def get_next_backend(self) -> Optional[Backend]:
        """Select next backend based on strategy"""
        healthy = [b for b in self.config.backends if b.healthy]
        if not healthy:
            return None

        if self.config.strategy == "round_robin":
            backend = healthy[self.current_index % len(healthy)]
            self.current_index += 1
            return backend

        elif self.config.strategy == "weighted":
            total_weight = sum(b.weight for b in healthy)
            r = random.randint(1, total_weight)
            for backend in healthy:
                r -= backend.weight
                if r <= 0:
                    return backend
            return healthy[0]

        elif self.config.strategy == "least_conn":
            return min(healthy, key=lambda b: b.connections)

        elif self.config.strategy == "random":
            return random.choice(healthy)

        return healthy[0]

    async def health_check(self):
        """Check health of all backends"""
        async with aiohttp.ClientSession() as session:
            for backend in self.config.backends:
                url = f"http://{backend.host}:{backend.port}/"
                try:
                    start = time.time()
                    async with session.get(url, timeout=5) as resp:
                        backend.response_time = time.time() - start
                        backend.healthy = resp.status < 500
                        backend.last_check = time.time()
                except:
                    backend.healthy = False
                    backend.last_check = time.time()

    async def proxy_request(self, request: web.Request) -> web.Response:
        """Proxy request to backend"""
        self.stats["total_requests"] += 1

        for attempt in range(self.config.retry_count):
            backend = self.get_next_backend()
            if not backend:
                self.stats["failed"] += 1
                return web.json_response({"error": "No healthy backends"}, status=503)

            backend.connections += 1
            backend.requests += 1

            url = f"http://{backend.host}:{backend.port}{request.path}"
            if request.query_string:
                url += f"?{request.query_string}"

            try:
                async with aiohttp.ClientSession() as session:
                    method = getattr(session, request.method.lower())

                    # Forward headers
                    headers = dict(request.headers)
                    headers["X-Forwarded-For"] = request.remote
                    headers["X-Forwarded-Host"] = request.host
                    headers["X-Backend"] = backend.name

                    # Get body if present
                    body = await request.read() if request.can_read_body else None

                    async with method(url, headers=headers, data=body, timeout=self.config.timeout) as resp:
                        backend.connections -= 1
                        self.stats["successful"] += 1

                        # Return response
                        response_body = await resp.read()
                        return web.Response(
                            body=response_body,
                            status=resp.status,
                            headers={
                                "X-Backend": backend.name,
                                "X-Response-Time": str(int((time.time() - backend.last_check) * 1000))
                            }
                        )

            except Exception as e:
                backend.connections -= 1
                backend.errors += 1
                backend.healthy = False
                continue

        self.stats["failed"] += 1
        return web.json_response({"error": "All backends failed"}, status=503)

    def get_stats(self) -> dict:
        """Get gateway statistics"""
        return {
            "stats": self.stats,
            "uptime": time.time() - self.stats["started_at"],
            "backends": [
                {
                    "name": b.name,
                    "healthy": b.healthy,
                    "requests": b.requests,
                    "errors": b.errors,
                    "response_time_ms": int(b.response_time * 1000),
                    "connections": b.connections
                }
                for b in self.config.backends
            ]
        }

# Create default config
config = GatewayConfig(
    backends=[
        Backend("cecilia", "192.168.4.89", 8000, weight=3),
        Backend("lucidia", "192.168.4.81", 8000, weight=2),
        Backend("octavia", "192.168.4.38", 8000, weight=2),
        Backend("aria", "192.168.4.82", 8000, weight=2),
        Backend("anastasia", "159.65.43.12", 8000, weight=1),
    ],
    strategy="weighted",
    health_interval=30
)

gateway = BlackRoadGateway(config)

# Routes
async def handle_stats(request):
    return web.json_response(gateway.get_stats())

async def handle_health(request):
    await gateway.health_check()
    healthy_count = sum(1 for b in config.backends if b.healthy)
    return web.json_response({
        "status": "healthy" if healthy_count > 0 else "unhealthy",
        "healthy_backends": healthy_count,
        "total_backends": len(config.backends)
    })

async def handle_proxy(request):
    return await gateway.proxy_request(request)

# Health check background task
async def health_check_loop(app):
    while True:
        await gateway.health_check()
        await asyncio.sleep(config.health_interval)

async def start_background_tasks(app):
    app['health_checker'] = asyncio.create_task(health_check_loop(app))

async def cleanup_background_tasks(app):
    app['health_checker'].cancel()

# App setup
app = web.Application()
app.router.add_get('/gateway/stats', handle_stats)
app.router.add_get('/gateway/health', handle_health)
app.router.add_route('*', '/{path:.*}', handle_proxy)

app.on_startup.append(start_background_tasks)
app.on_cleanup.append(cleanup_background_tasks)

if __name__ == '__main__':
    hostname = os.uname().nodename
    print(f"[{hostname}] BlackRoad Gateway starting on port 8080...")
    web.run_app(app, host='0.0.0.0', port=8080)
GATEWAY

chmod +x ~/.blackroad/gateway/gateway.py
echo -e "${GREEN}API Gateway Server installed${NC}"

# ============================================================
# [2/4] Log Aggregator
# ============================================================
echo -e "${AMBER}[2/4]${NC} Creating Log Aggregator..."

mkdir -p ~/.blackroad/logs/aggregated

cat > ~/.blackroad/gateway/log_aggregator.py << 'LOGAGG'
#!/usr/bin/env python3
"""
BlackRoad Log Aggregator - Centralized logging from all nodes
Collects, indexes, and searches logs across the fleet
"""

import asyncio
import json
import os
import time
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass
from typing import List, Optional
import subprocess

@dataclass
class LogEntry:
    timestamp: str
    node: str
    service: str
    level: str
    message: str

class LogAggregator:
    def __init__(self, log_dir: str = "~/.blackroad/logs/aggregated"):
        self.log_dir = Path(os.path.expanduser(log_dir))
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.nodes = ["cecilia", "lucidia", "octavia", "aria", "anastasia"]
        self.log_file = self.log_dir / f"aggregated-{datetime.now().strftime('%Y%m%d')}.jsonl"

    def collect_from_node(self, node: str, service: str = "api", lines: int = 100) -> List[LogEntry]:
        """Collect logs from a remote node"""
        log_paths = {
            "api": "~/blackroad-api/api.log",
            "mesh": "~/.blackroad/mesh/hub.log",
            "eventbus": "~/.blackroad/eventbus/logs/bus.log",
            "health": "~/.blackroad/monitor/health.log",
            "system": "/var/log/syslog"
        }

        path = log_paths.get(service, log_paths["api"])
        cmd = f"ssh -o ConnectTimeout=5 {node} 'tail -{lines} {path} 2>/dev/null'"

        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
            entries = []
            for line in result.stdout.strip().split('\n'):
                if line:
                    entries.append(LogEntry(
                        timestamp=datetime.now().isoformat(),
                        node=node,
                        service=service,
                        level="INFO",
                        message=line
                    ))
            return entries
        except:
            return []

    def collect_all(self, service: str = "api", lines: int = 50) -> List[LogEntry]:
        """Collect logs from all nodes"""
        all_entries = []
        for node in self.nodes:
            entries = self.collect_from_node(node, service, lines)
            all_entries.extend(entries)
        return all_entries

    def save_entries(self, entries: List[LogEntry]):
        """Save entries to aggregated log file"""
        with open(self.log_file, 'a') as f:
            for entry in entries:
                f.write(json.dumps({
                    "timestamp": entry.timestamp,
                    "node": entry.node,
                    "service": entry.service,
                    "level": entry.level,
                    "message": entry.message
                }) + '\n')

    def search(self, query: str, node: Optional[str] = None, limit: int = 100) -> List[dict]:
        """Search aggregated logs"""
        results = []
        for log_file in sorted(self.log_dir.glob("*.jsonl"), reverse=True):
            with open(log_file) as f:
                for line in f:
                    try:
                        entry = json.loads(line)
                        if query.lower() in entry.get("message", "").lower():
                            if node is None or entry.get("node") == node:
                                results.append(entry)
                                if len(results) >= limit:
                                    return results
                    except:
                        continue
        return results

    def tail(self, node: Optional[str] = None, service: str = "api", follow: bool = False):
        """Tail logs in real-time"""
        import sys

        while True:
            entries = self.collect_all(service, lines=10) if node is None else \
                      self.collect_from_node(node, service, lines=10)

            for entry in entries:
                print(f"[{entry.node}] {entry.message}")

            if not follow:
                break

            time.sleep(2)

if __name__ == "__main__":
    import sys

    agg = LogAggregator()

    if len(sys.argv) < 2:
        print("Usage: log_aggregator.py <command> [args]")
        print("Commands: collect, search, tail")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "collect":
        service = sys.argv[2] if len(sys.argv) > 2 else "api"
        entries = agg.collect_all(service)
        agg.save_entries(entries)
        print(f"Collected {len(entries)} entries")

    elif cmd == "search":
        query = sys.argv[2] if len(sys.argv) > 2 else ""
        results = agg.search(query)
        for r in results:
            print(f"[{r['node']}] {r['message']}")

    elif cmd == "tail":
        node = sys.argv[2] if len(sys.argv) > 2 else None
        agg.tail(node)
LOGAGG

chmod +x ~/.blackroad/gateway/log_aggregator.py
echo -e "${GREEN}Log Aggregator installed${NC}"

# ============================================================
# [3/4] Metrics Collector
# ============================================================
echo -e "${AMBER}[3/4]${NC} Creating Metrics Collector..."

mkdir -p ~/.blackroad/metrics

cat > ~/.blackroad/gateway/metrics_collector.py << 'METRICS'
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
METRICS

chmod +x ~/.blackroad/gateway/metrics_collector.py
echo -e "${GREEN}Metrics Collector installed${NC}"

# ============================================================
# [4/4] Gateway CLI
# ============================================================
echo -e "${AMBER}[4/4]${NC} Creating Gateway CLI..."

cat > ~/br-gateway << 'GWCLI'
#!/bin/bash
# br-gateway - BlackRoad API Gateway CLI

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
NC='\033[0m'

case "$1" in
    start)
        echo -e "${PINK}Starting API Gateway on port 8080...${NC}"
        pip3 install aiohttp --quiet 2>/dev/null
        nohup python3 ~/.blackroad/gateway/gateway.py > ~/.blackroad/gateway/logs/gateway.log 2>&1 &
        echo $! > ~/.blackroad/gateway/gateway.pid
        echo -e "${GREEN}Gateway started (PID: $(cat ~/.blackroad/gateway/gateway.pid))${NC}"
        ;;

    stop)
        if [ -f ~/.blackroad/gateway/gateway.pid ]; then
            kill $(cat ~/.blackroad/gateway/gateway.pid) 2>/dev/null
            rm ~/.blackroad/gateway/gateway.pid
            echo -e "${AMBER}Gateway stopped${NC}"
        fi
        ;;

    status)
        if [ -f ~/.blackroad/gateway/gateway.pid ] && kill -0 $(cat ~/.blackroad/gateway/gateway.pid) 2>/dev/null; then
            echo -e "${GREEN}Gateway running${NC} (PID: $(cat ~/.blackroad/gateway/gateway.pid))"
            curl -s http://localhost:8080/gateway/stats | python3 -m json.tool 2>/dev/null || echo "(stats unavailable)"
        else
            echo -e "${AMBER}Gateway not running${NC}"
        fi
        ;;

    health)
        curl -s http://localhost:8080/gateway/health | python3 -m json.tool
        ;;

    logs)
        service="${2:-api}"
        python3 ~/.blackroad/gateway/log_aggregator.py collect "$service"
        ;;

    search)
        shift
        query="$*"
        python3 ~/.blackroad/gateway/log_aggregator.py search "$query"
        ;;

    metrics)
        echo -e "${PINK}Collecting metrics from fleet...${NC}"
        python3 ~/.blackroad/gateway/metrics_collector.py collect
        echo ""
        python3 ~/.blackroad/gateway/metrics_collector.py latest
        ;;

    *)
        echo -e "${PINK}br-gateway${NC} - BlackRoad API Gateway"
        echo ""
        echo "Commands:"
        echo "  start       - Start API Gateway"
        echo "  stop        - Stop API Gateway"
        echo "  status      - Show gateway status"
        echo "  health      - Check backend health"
        echo "  logs [svc]  - Aggregate logs (api/mesh/eventbus)"
        echo "  search <q>  - Search aggregated logs"
        echo "  metrics     - Collect and show metrics"
        ;;
esac
GWCLI

chmod +x ~/br-gateway

echo -e ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  API Gateway Stack Installed on $HOSTNAME!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Components:${NC}"
echo "  • API Gateway (port 8080) - Load balancing"
echo "  • Log Aggregator - Centralized logging"
echo "  • Metrics Collector - Time-series monitoring"
echo ""
echo -e "${AMBER}Quick start:${NC}"
echo "  ~/br-gateway start"
echo "  ~/br-gateway health"
echo "  ~/br-gateway metrics"
echo "  ~/br-gateway logs api"
