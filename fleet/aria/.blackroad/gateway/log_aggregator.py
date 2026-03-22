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
