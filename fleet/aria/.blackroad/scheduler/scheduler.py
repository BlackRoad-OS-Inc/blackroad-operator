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
