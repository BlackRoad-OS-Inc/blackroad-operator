#!/usr/bin/env python3
"""
BlackRoad FileSync - Distributed File Synchronization
Syncs directories across fleet nodes using rsync
"""

import os
import subprocess
import json
import hashlib
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class SyncConfig:
    name: str
    source: str
    destinations: List[str]  # node:path pairs
    exclude: List[str] = None
    delete: bool = False
    dry_run: bool = False

class FileSync:
    def __init__(self, config_path: str = "~/.blackroad/sync/config.json"):
        self.config_path = os.path.expanduser(config_path)
        self.hostname = os.uname().nodename
        self.nodes = ["cecilia", "lucidia", "octavia", "aria", "anastasia"]
        self.sync_log = os.path.expanduser("~/.blackroad/sync/sync.log")

    def load_configs(self) -> List[SyncConfig]:
        """Load sync configurations"""
        if os.path.exists(self.config_path):
            with open(self.config_path) as f:
                data = json.load(f)
                return [SyncConfig(**c) for c in data.get("syncs", [])]
        return []

    def save_config(self, config: SyncConfig):
        """Save a sync configuration"""
        configs = self.load_configs()
        configs = [c for c in configs if c.name != config.name]
        configs.append(config)

        with open(self.config_path, 'w') as f:
            json.dump({"syncs": [vars(c) for c in configs]}, f, indent=2)

    def sync(self, config: SyncConfig) -> Dict[str, bool]:
        """Execute sync"""
        results = {}

        for dest in config.destinations:
            if ':' in dest:
                node, path = dest.split(':', 1)
            else:
                node, path = dest, config.source

            # Build rsync command
            cmd = ["rsync", "-avz", "--progress"]

            if config.delete:
                cmd.append("--delete")

            if config.dry_run:
                cmd.append("--dry-run")

            if config.exclude:
                for exc in config.exclude:
                    cmd.extend(["--exclude", exc])

            cmd.extend([config.source, f"{node}:{path}"])

            try:
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
                results[dest] = result.returncode == 0

                # Log
                with open(self.sync_log, 'a') as f:
                    f.write(f"{datetime.now().isoformat()} | {config.name} -> {dest} | {'OK' if results[dest] else 'FAIL'}\n")

            except Exception as e:
                results[dest] = False

        return results

    def sync_all(self) -> Dict[str, Dict[str, bool]]:
        """Run all configured syncs"""
        configs = self.load_configs()
        results = {}
        for config in configs:
            results[config.name] = self.sync(config)
        return results

    def quick_sync(self, source: str, targets: List[str]) -> Dict[str, bool]:
        """Quick sync without saving config"""
        config = SyncConfig(
            name="quick",
            source=source,
            destinations=targets
        )
        return self.sync(config)

    def file_hash(self, path: str) -> str:
        """Get MD5 hash of file"""
        if os.path.isfile(path):
            with open(path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        return ""

    def compare(self, path: str, nodes: List[str]) -> Dict[str, str]:
        """Compare file across nodes"""
        results = {self.hostname: self.file_hash(path)}

        for node in nodes:
            try:
                result = subprocess.run(
                    f"ssh {node} 'md5sum {path} 2>/dev/null | cut -d\" \" -f1'",
                    shell=True, capture_output=True, text=True, timeout=10
                )
                results[node] = result.stdout.strip()
            except:
                results[node] = ""

        return results

if __name__ == "__main__":
    import sys

    sync = FileSync()

    if len(sys.argv) < 2:
        print("Usage: filesync.py <command> [args]")
        print("Commands: sync, quick, compare, list")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "sync":
        if len(sys.argv) > 2:
            # Sync specific config
            configs = sync.load_configs()
            for c in configs:
                if c.name == sys.argv[2]:
                    results = sync.sync(c)
                    for dest, ok in results.items():
                        print(f"  {dest}: {'OK' if ok else 'FAIL'}")
        else:
            # Sync all
            results = sync.sync_all()
            for name, dests in results.items():
                print(f"{name}:")
                for dest, ok in dests.items():
                    print(f"  {dest}: {'OK' if ok else 'FAIL'}")

    elif cmd == "quick":
        if len(sys.argv) < 4:
            print("Usage: filesync.py quick <source> <node1:path> [node2:path]...")
            sys.exit(1)
        source = sys.argv[2]
        targets = sys.argv[3:]
        results = sync.quick_sync(source, targets)
        for dest, ok in results.items():
            print(f"{dest}: {'OK' if ok else 'FAIL'}")

    elif cmd == "compare":
        path = sys.argv[2] if len(sys.argv) > 2 else "."
        results = sync.compare(path, sync.nodes)
        for node, hash_val in results.items():
            print(f"{node}: {hash_val or '(missing)'}")

    elif cmd == "list":
        configs = sync.load_configs()
        for c in configs:
            print(f"{c.name}: {c.source} -> {', '.join(c.destinations)}")
