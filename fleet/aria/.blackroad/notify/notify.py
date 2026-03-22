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
