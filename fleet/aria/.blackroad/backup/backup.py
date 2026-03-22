#!/usr/bin/env python3
"""
BlackRoad Backup - Automated Backup System
Supports incremental backups, remote sync, and scheduled snapshots
"""

import os
import json
import tarfile
import subprocess
import shutil
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
import hashlib

class BackupSystem:
    def __init__(self, backup_dir: str = "~/.blackroad/backup"):
        self.backup_dir = Path(os.path.expanduser(backup_dir))
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        self.snapshots_dir = self.backup_dir / "snapshots"
        self.snapshots_dir.mkdir(exist_ok=True)
        self.hostname = os.uname().nodename
        self.nodes = ["cecilia", "lucidia", "octavia", "aria", "anastasia"]

        # Default backup targets
        self.targets = {
            "config": "~/.blackroad/config",
            "vault": "~/.blackroad/vault",
            "memory": "~/.blackroad/memory/journals",
            "scheduler": "~/.blackroad/scheduler/jobs.db",
        }

    def _get_snapshot_name(self, prefix: str = "backup") -> str:
        """Generate snapshot filename"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"{prefix}_{self.hostname}_{timestamp}.tar.gz"

    def create_snapshot(self, targets: List[str] = None, name: str = None) -> str:
        """Create a backup snapshot"""
        targets = targets or list(self.targets.keys())
        name = name or self._get_snapshot_name()

        snapshot_path = self.snapshots_dir / name
        paths_to_backup = []

        for target in targets:
            if target in self.targets:
                path = Path(os.path.expanduser(self.targets[target]))
                if path.exists():
                    paths_to_backup.append(path)

        # Create tarball
        with tarfile.open(snapshot_path, "w:gz") as tar:
            for path in paths_to_backup:
                tar.add(path, arcname=path.name)

        # Create manifest
        manifest = {
            "created": datetime.now().isoformat(),
            "hostname": self.hostname,
            "targets": targets,
            "size_bytes": snapshot_path.stat().st_size,
            "checksum": self._file_hash(snapshot_path)
        }

        manifest_path = snapshot_path.with_suffix(".manifest.json")
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)

        return str(snapshot_path)

    def _file_hash(self, path: Path) -> str:
        """Calculate SHA256 hash of file"""
        sha256 = hashlib.sha256()
        with open(path, 'rb') as f:
            for chunk in iter(lambda: f.read(65536), b''):
                sha256.update(chunk)
        return sha256.hexdigest()

    def list_snapshots(self) -> List[Dict]:
        """List all snapshots"""
        snapshots = []
        for manifest_path in self.snapshots_dir.glob("*.manifest.json"):
            try:
                with open(manifest_path) as f:
                    manifest = json.load(f)
                    manifest["file"] = str(manifest_path.with_suffix("").with_suffix(".tar.gz"))
                    snapshots.append(manifest)
            except:
                pass
        return sorted(snapshots, key=lambda x: x.get("created", ""), reverse=True)

    def restore(self, snapshot_name: str, target_dir: str = None) -> bool:
        """Restore from snapshot"""
        snapshot_path = self.snapshots_dir / snapshot_name

        if not snapshot_path.exists():
            return False

        target_dir = target_dir or os.path.expanduser("~/.blackroad/restored")
        Path(target_dir).mkdir(parents=True, exist_ok=True)

        with tarfile.open(snapshot_path, "r:gz") as tar:
            tar.extractall(target_dir)

        return True

    def sync_to_remote(self, node: str, snapshot_name: str = None) -> bool:
        """Sync backup to remote node"""
        if snapshot_name:
            source = self.snapshots_dir / snapshot_name
        else:
            source = self.snapshots_dir

        try:
            subprocess.run(
                f"rsync -avz {source} {node}:{self.backup_dir}/",
                shell=True, timeout=300
            )
            return True
        except:
            return False

    def collect_from_nodes(self) -> Dict[str, bool]:
        """Collect backups from all nodes"""
        results = {}
        for node in self.nodes:
            if node == self.hostname:
                continue
            try:
                subprocess.run(
                    f"rsync -avz {node}:{self.snapshots_dir}/ {self.snapshots_dir}/{node}/",
                    shell=True, timeout=300
                )
                results[node] = True
            except:
                results[node] = False
        return results

    def cleanup(self, keep_count: int = 10) -> int:
        """Remove old snapshots, keeping only the most recent"""
        snapshots = sorted(self.snapshots_dir.glob("*.tar.gz"), key=lambda x: x.stat().st_mtime, reverse=True)
        removed = 0

        for snapshot in snapshots[keep_count:]:
            snapshot.unlink()
            manifest = snapshot.with_suffix(".manifest.json")
            if manifest.exists():
                manifest.unlink()
            removed += 1

        return removed

    def auto_backup(self) -> str:
        """Perform automatic backup of all targets"""
        return self.create_snapshot()

if __name__ == "__main__":
    import sys

    backup = BackupSystem()

    if len(sys.argv) < 2:
        print("Usage: backup.py <command> [args]")
        print("Commands: create, list, restore, sync, collect, cleanup")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "create":
        targets = sys.argv[2:] if len(sys.argv) > 2 else None
        path = backup.create_snapshot(targets)
        print(f"Created: {path}")

    elif cmd == "list":
        for s in backup.list_snapshots():
            size_mb = s.get("size_bytes", 0) / 1024 / 1024
            print(f"  {os.path.basename(s['file'])} ({size_mb:.1f}MB) - {s['created']}")

    elif cmd == "restore":
        name = sys.argv[2]
        target = sys.argv[3] if len(sys.argv) > 3 else None
        if backup.restore(name, target):
            print(f"Restored: {name}")
        else:
            print("Restore failed")

    elif cmd == "sync":
        node = sys.argv[2]
        name = sys.argv[3] if len(sys.argv) > 3 else None
        if backup.sync_to_remote(node, name):
            print(f"Synced to {node}")
        else:
            print("Sync failed")

    elif cmd == "collect":
        results = backup.collect_from_nodes()
        for node, ok in results.items():
            print(f"{node}: {'OK' if ok else 'FAIL'}")

    elif cmd == "cleanup":
        keep = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        removed = backup.cleanup(keep)
        print(f"Removed {removed} old snapshots")
