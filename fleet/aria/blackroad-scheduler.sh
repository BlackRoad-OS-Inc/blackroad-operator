#!/bin/bash
# BlackRoad Scheduler - Distributed Job Scheduling System
# Cron-like scheduling + distributed execution + job tracking

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
NC='\033[0m'

HOSTNAME=$(hostname)

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  BlackRoad Scheduler - Installing on $HOSTNAME${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

mkdir -p ~/.blackroad/scheduler
mkdir -p ~/.blackroad/scheduler/jobs
mkdir -p ~/.blackroad/scheduler/logs

# ============================================================
# [1/3] Scheduler Daemon
# ============================================================
echo -e "${AMBER}[1/3]${NC} Creating Scheduler Daemon..."

cat > ~/.blackroad/scheduler/scheduler.py << 'SCHEDULER'
#!/usr/bin/env python3
"""
BlackRoad Scheduler - Distributed Job Scheduling
Supports cron syntax, one-time jobs, recurring tasks, and fleet-wide execution
"""

import asyncio
import json
import os
import subprocess
import time
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass
from typing import Optional, List
import re

@dataclass
class Job:
    id: str
    name: str
    command: str
    schedule: str  # cron syntax or @once, @hourly, @daily, @weekly
    target: str    # node name or "all" or "any"
    enabled: bool = True
    last_run: Optional[float] = None
    next_run: Optional[float] = None
    run_count: int = 0
    last_status: str = ""

class CronParser:
    """Parse cron expressions"""
    @staticmethod
    def parse(expr: str) -> Optional[float]:
        """Return seconds until next run"""
        now = datetime.now()

        if expr == "@once":
            return None
        elif expr == "@minutely":
            return 60
        elif expr == "@hourly":
            return 3600
        elif expr == "@daily":
            return 86400
        elif expr == "@weekly":
            return 604800
        elif expr.startswith("@every"):
            # @every 5m, @every 1h, @every 30s
            match = re.match(r'@every\s+(\d+)([smhd])', expr)
            if match:
                val, unit = int(match.group(1)), match.group(2)
                multipliers = {'s': 1, 'm': 60, 'h': 3600, 'd': 86400}
                return val * multipliers.get(unit, 60)

        # Standard cron: min hour day month weekday
        # Simplified: just return interval based on first field
        parts = expr.split()
        if len(parts) >= 5:
            # Every minute if * in first field
            if parts[0] == '*':
                return 60
            try:
                return int(parts[0]) * 60
            except:
                return 300  # default 5 min

        return 300  # default 5 minutes

class Scheduler:
    def __init__(self, db_path: str = "~/.blackroad/scheduler/jobs.db"):
        self.db_path = os.path.expanduser(db_path)
        self.hostname = os.uname().nodename
        self.nodes = ["cecilia", "lucidia", "octavia", "aria", "anastasia"]
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute('''
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                name TEXT,
                command TEXT,
                schedule TEXT,
                target TEXT,
                enabled INTEGER DEFAULT 1,
                last_run REAL,
                next_run REAL,
                run_count INTEGER DEFAULT 0,
                last_status TEXT,
                created_at REAL
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS job_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id TEXT,
                node TEXT,
                started_at REAL,
                ended_at REAL,
                exit_code INTEGER,
                output TEXT
            )
        ''')
        conn.commit()
        conn.close()

    def add_job(self, job: Job) -> bool:
        """Add a new job"""
        conn = sqlite3.connect(self.db_path)
        interval = CronParser.parse(job.schedule)
        job.next_run = time.time() + (interval or 0)

        conn.execute('''
            INSERT OR REPLACE INTO jobs
            (id, name, command, schedule, target, enabled, next_run, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (job.id, job.name, job.command, job.schedule, job.target,
              1 if job.enabled else 0, job.next_run, time.time()))
        conn.commit()
        conn.close()
        return True

    def list_jobs(self) -> List[Job]:
        """List all jobs"""
        conn = sqlite3.connect(self.db_path)
        jobs = []
        for row in conn.execute('SELECT * FROM jobs'):
            jobs.append(Job(
                id=row[0], name=row[1], command=row[2], schedule=row[3],
                target=row[4], enabled=bool(row[5]), last_run=row[6],
                next_run=row[7], run_count=row[8], last_status=row[9] or ""
            ))
        conn.close()
        return jobs

    def delete_job(self, job_id: str) -> bool:
        """Delete a job"""
        conn = sqlite3.connect(self.db_path)
        conn.execute('DELETE FROM jobs WHERE id = ?', (job_id,))
        conn.commit()
        conn.close()
        return True

    def run_job(self, job: Job) -> tuple:
        """Execute a job"""
        target = job.target

        if target == "local" or target == self.hostname:
            # Run locally
            try:
                result = subprocess.run(
                    job.command, shell=True,
                    capture_output=True, text=True, timeout=300
                )
                return result.returncode, result.stdout + result.stderr
            except Exception as e:
                return -1, str(e)

        elif target == "all":
            # Run on all nodes
            outputs = []
            for node in self.nodes:
                try:
                    result = subprocess.run(
                        f"ssh -o ConnectTimeout=5 {node} '{job.command}'",
                        shell=True, capture_output=True, text=True, timeout=60
                    )
                    outputs.append(f"[{node}] {result.stdout}")
                except:
                    outputs.append(f"[{node}] (failed)")
            return 0, "\n".join(outputs)

        elif target == "any":
            # Run on any available node
            import random
            node = random.choice(self.nodes)
            try:
                result = subprocess.run(
                    f"ssh -o ConnectTimeout=5 {node} '{job.command}'",
                    shell=True, capture_output=True, text=True, timeout=60
                )
                return result.returncode, f"[{node}] {result.stdout}"
            except:
                return -1, f"[{node}] failed"

        else:
            # Run on specific node
            try:
                result = subprocess.run(
                    f"ssh -o ConnectTimeout=5 {target} '{job.command}'",
                    shell=True, capture_output=True, text=True, timeout=60
                )
                return result.returncode, result.stdout + result.stderr
            except Exception as e:
                return -1, str(e)

    def record_run(self, job: Job, exit_code: int, output: str):
        """Record job execution"""
        conn = sqlite3.connect(self.db_path)

        # Update job
        interval = CronParser.parse(job.schedule)
        next_run = time.time() + (interval or 86400 * 365)  # far future for @once

        conn.execute('''
            UPDATE jobs SET
                last_run = ?, next_run = ?, run_count = run_count + 1,
                last_status = ?
            WHERE id = ?
        ''', (time.time(), next_run, "OK" if exit_code == 0 else "FAIL", job.id))

        # Record history
        conn.execute('''
            INSERT INTO job_history (job_id, node, started_at, ended_at, exit_code, output)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (job.id, job.target, time.time(), time.time(), exit_code, output[:1000]))

        conn.commit()
        conn.close()

    async def run_scheduler(self):
        """Main scheduler loop"""
        print(f"[{self.hostname}] Scheduler started")

        while True:
            now = time.time()
            jobs = self.list_jobs()

            for job in jobs:
                if job.enabled and job.next_run and now >= job.next_run:
                    print(f"Running job: {job.name}")
                    exit_code, output = self.run_job(job)
                    self.record_run(job, exit_code, output)

            await asyncio.sleep(10)  # Check every 10 seconds

if __name__ == "__main__":
    import sys

    scheduler = Scheduler()

    if len(sys.argv) < 2:
        print("Usage: scheduler.py <command> [args]")
        print("Commands: daemon, add, list, delete, run")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "daemon":
        asyncio.run(scheduler.run_scheduler())

    elif cmd == "add":
        if len(sys.argv) < 6:
            print("Usage: scheduler.py add <id> <name> <schedule> <target> <command>")
            sys.exit(1)
        job = Job(
            id=sys.argv[2],
            name=sys.argv[3],
            schedule=sys.argv[4],
            target=sys.argv[5],
            command=" ".join(sys.argv[6:])
        )
        scheduler.add_job(job)
        print(f"Added job: {job.id}")

    elif cmd == "list":
        jobs = scheduler.list_jobs()
        for job in jobs:
            status = "ON" if job.enabled else "OFF"
            print(f"[{status}] {job.id}: {job.name} ({job.schedule}) -> {job.target}")
            print(f"      Last: {job.last_status} | Runs: {job.run_count}")

    elif cmd == "delete":
        scheduler.delete_job(sys.argv[2])
        print(f"Deleted job: {sys.argv[2]}")

    elif cmd == "run":
        jobs = scheduler.list_jobs()
        for job in jobs:
            if job.id == sys.argv[2]:
                exit_code, output = scheduler.run_job(job)
                print(output)
                break
SCHEDULER

chmod +x ~/.blackroad/scheduler/scheduler.py
echo -e "${GREEN}Scheduler Daemon installed${NC}"

# ============================================================
# [2/3] File Sync System
# ============================================================
echo -e "${AMBER}[2/3]${NC} Creating File Sync System..."

mkdir -p ~/.blackroad/sync

cat > ~/.blackroad/sync/filesync.py << 'FILESYNC'
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
FILESYNC

chmod +x ~/.blackroad/sync/filesync.py

# ============================================================
# [3/3] Notification System
# ============================================================
echo -e "${AMBER}[3/3]${NC} Creating Notification System..."

mkdir -p ~/.blackroad/notify

cat > ~/.blackroad/notify/notify.py << 'NOTIFY'
#!/usr/bin/env python3
"""
BlackRoad Notify - Multi-channel Notification System
Supports: Console, File, Webhook, Event Bus, Fleet Broadcast
"""

import os
import json
import time
import subprocess
from datetime import datetime
from dataclasses import dataclass
from typing import Optional, List
from enum import Enum

class NotifyLevel(Enum):
    INFO = "info"
    WARN = "warn"
    ERROR = "error"
    CRITICAL = "critical"

@dataclass
class Notification:
    title: str
    message: str
    level: NotifyLevel = NotifyLevel.INFO
    source: str = ""
    timestamp: float = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()
        if not self.source:
            self.source = os.uname().nodename

class Notifier:
    def __init__(self):
        self.hostname = os.uname().nodename
        self.log_file = os.path.expanduser("~/.blackroad/notify/notifications.jsonl")
        self.nodes = ["cecilia", "lucidia", "octavia", "aria", "anastasia"]

    def _log(self, notif: Notification):
        """Log notification to file"""
        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)
        with open(self.log_file, 'a') as f:
            f.write(json.dumps({
                "title": notif.title,
                "message": notif.message,
                "level": notif.level.value,
                "source": notif.source,
                "timestamp": notif.timestamp
            }) + '\n')

    def console(self, notif: Notification):
        """Print to console with colors"""
        colors = {
            NotifyLevel.INFO: '\033[38;5;82m',    # green
            NotifyLevel.WARN: '\033[38;5;214m',   # amber
            NotifyLevel.ERROR: '\033[38;5;196m',  # red
            NotifyLevel.CRITICAL: '\033[38;5;201m' # magenta
        }
        nc = '\033[0m'
        color = colors.get(notif.level, '')
        print(f"{color}[{notif.level.value.upper()}]{nc} {notif.title}: {notif.message}")
        self._log(notif)

    def broadcast(self, notif: Notification):
        """Broadcast to all nodes"""
        for node in self.nodes:
            try:
                msg = f"[{notif.source}] {notif.title}: {notif.message}"
                subprocess.run(
                    f"ssh {node} 'echo \"{msg}\" >> ~/.blackroad/notify/inbox.log'",
                    shell=True, timeout=5
                )
            except:
                pass
        self._log(notif)

    def eventbus(self, notif: Notification, channel: str = "alerts"):
        """Send to Event Bus"""
        try:
            # Use the event bus publisher
            subprocess.run(
                f"python3 ~/.blackroad/eventbus/publish.py cecilia {channel} '{notif.title}: {notif.message}'",
                shell=True, timeout=5
            )
        except:
            pass
        self._log(notif)

    def webhook(self, notif: Notification, url: str):
        """Send to webhook URL"""
        import urllib.request
        try:
            data = json.dumps({
                "title": notif.title,
                "message": notif.message,
                "level": notif.level.value,
                "source": notif.source,
                "timestamp": notif.timestamp
            }).encode()

            req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
            urllib.request.urlopen(req, timeout=10)
        except:
            pass
        self._log(notif)

    def slack(self, notif: Notification, webhook_url: str):
        """Send to Slack"""
        import urllib.request
        try:
            icons = {
                NotifyLevel.INFO: ":information_source:",
                NotifyLevel.WARN: ":warning:",
                NotifyLevel.ERROR: ":x:",
                NotifyLevel.CRITICAL: ":rotating_light:"
            }

            data = json.dumps({
                "text": f"{icons.get(notif.level, '')} *{notif.title}*\n{notif.message}\n_Source: {notif.source}_"
            }).encode()

            req = urllib.request.Request(webhook_url, data=data, headers={'Content-Type': 'application/json'})
            urllib.request.urlopen(req, timeout=10)
        except:
            pass
        self._log(notif)

    def send(self, title: str, message: str, level: str = "info", channels: List[str] = None):
        """Send notification to multiple channels"""
        notif = Notification(
            title=title,
            message=message,
            level=NotifyLevel(level)
        )

        channels = channels or ["console"]

        for channel in channels:
            if channel == "console":
                self.console(notif)
            elif channel == "broadcast":
                self.broadcast(notif)
            elif channel == "eventbus":
                self.eventbus(notif)
            elif channel.startswith("webhook:"):
                self.webhook(notif, channel.split(":", 1)[1])
            elif channel.startswith("slack:"):
                self.slack(notif, channel.split(":", 1)[1])

    def recent(self, limit: int = 10) -> List[dict]:
        """Get recent notifications"""
        if not os.path.exists(self.log_file):
            return []

        with open(self.log_file) as f:
            lines = f.readlines()

        notifications = []
        for line in lines[-limit:]:
            try:
                notifications.append(json.loads(line))
            except:
                pass

        return notifications

if __name__ == "__main__":
    import sys

    notifier = Notifier()

    if len(sys.argv) < 2:
        print("Usage: notify.py <command> [args]")
        print("Commands: send, broadcast, recent")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "send":
        title = sys.argv[2] if len(sys.argv) > 2 else "Notification"
        message = sys.argv[3] if len(sys.argv) > 3 else ""
        level = sys.argv[4] if len(sys.argv) > 4 else "info"
        notifier.send(title, message, level, ["console"])

    elif cmd == "broadcast":
        title = sys.argv[2] if len(sys.argv) > 2 else "Broadcast"
        message = sys.argv[3] if len(sys.argv) > 3 else ""
        notifier.send(title, message, "info", ["console", "broadcast"])

    elif cmd == "recent":
        limit = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        for n in notifier.recent(limit):
            dt = datetime.fromtimestamp(n['timestamp']).strftime('%H:%M:%S')
            print(f"[{dt}] [{n['level']}] {n['title']}: {n['message']}")
NOTIFY

chmod +x ~/.blackroad/notify/notify.py

# Create CLI
cat > ~/br-schedule << 'SCHEDCLI'
#!/bin/bash
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
NC='\033[0m'

case "$1" in
    start)
        echo -e "${PINK}Starting Scheduler...${NC}"
        nohup python3 ~/.blackroad/scheduler/scheduler.py daemon > ~/.blackroad/scheduler/logs/scheduler.log 2>&1 &
        echo $! > ~/.blackroad/scheduler/scheduler.pid
        echo -e "${GREEN}Scheduler started${NC}"
        ;;
    stop)
        [ -f ~/.blackroad/scheduler/scheduler.pid ] && kill $(cat ~/.blackroad/scheduler/scheduler.pid) 2>/dev/null
        rm -f ~/.blackroad/scheduler/scheduler.pid
        echo "Scheduler stopped"
        ;;
    add)
        shift
        python3 ~/.blackroad/scheduler/scheduler.py add "$@"
        ;;
    list)
        python3 ~/.blackroad/scheduler/scheduler.py list
        ;;
    run)
        python3 ~/.blackroad/scheduler/scheduler.py run "$2"
        ;;
    delete)
        python3 ~/.blackroad/scheduler/scheduler.py delete "$2"
        ;;
    *)
        echo "br-schedule - Distributed Job Scheduler"
        echo "Commands: start, stop, add, list, run <id>, delete <id>"
        echo ""
        echo "Add job: br-schedule add <id> <name> <schedule> <target> <command>"
        echo "Schedule: @hourly, @daily, @every 5m, '*/5 * * * *'"
        echo "Target: cecilia, all, any, local"
        ;;
esac
SCHEDCLI

chmod +x ~/br-schedule

cat > ~/br-sync << 'SYNCCLI'
#!/bin/bash
PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
NC='\033[0m'

case "$1" in
    quick)
        shift
        python3 ~/.blackroad/sync/filesync.py quick "$@"
        ;;
    all)
        python3 ~/.blackroad/sync/filesync.py sync
        ;;
    compare)
        python3 ~/.blackroad/sync/filesync.py compare "$2"
        ;;
    scripts)
        echo -e "${PINK}Syncing scripts to fleet...${NC}"
        for node in cecilia lucidia octavia aria anastasia; do
            echo -n "$node: "
            rsync -az ~/pi-autonomy-package/ "$node":~/pi-autonomy-package/ 2>/dev/null && \
                echo -e "${GREEN}OK${NC}" || echo "FAIL"
        done
        ;;
    *)
        echo "br-sync - Distributed File Sync"
        echo "Commands:"
        echo "  quick <src> <node:path>...  - Quick sync"
        echo "  scripts                     - Sync pi-autonomy-package"
        echo "  compare <file>              - Compare file across nodes"
        ;;
esac
SYNCCLI

chmod +x ~/br-sync

cat > ~/br-notify << 'NOTIFYCLI'
#!/bin/bash
PINK='\033[38;5;205m'
NC='\033[0m'

case "$1" in
    send)
        shift
        python3 ~/.blackroad/notify/notify.py send "$@"
        ;;
    broadcast)
        shift
        python3 ~/.blackroad/notify/notify.py broadcast "$@"
        ;;
    recent)
        python3 ~/.blackroad/notify/notify.py recent "${2:-10}"
        ;;
    alert)
        shift
        python3 ~/.blackroad/notify/notify.py send "ALERT" "$*" "error"
        ;;
    *)
        echo "br-notify - Notification System"
        echo "Commands:"
        echo "  send <title> <message> [level]  - Send notification"
        echo "  broadcast <title> <message>     - Broadcast to all nodes"
        echo "  alert <message>                 - Send error alert"
        echo "  recent [n]                      - Show recent notifications"
        ;;
esac
NOTIFYCLI

chmod +x ~/br-notify

echo -e ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Scheduler + Sync + Notify Installed on $HOSTNAME!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Components:${NC}"
echo "  • Scheduler (cron-like job scheduling)"
echo "  • FileSync (rsync-based fleet sync)"
echo "  • Notify (multi-channel notifications)"
echo ""
echo -e "${AMBER}Quick start:${NC}"
echo "  ~/br-schedule add healthcheck 'Health' @hourly all 'uptime'"
echo "  ~/br-sync scripts"
echo "  ~/br-notify broadcast 'Deploy' 'New version live'"
