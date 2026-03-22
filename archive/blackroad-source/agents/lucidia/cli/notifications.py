"""
LUCIDIA NOTIFICATIONS
Toast notification system
⬥ BlackRoad OS, Inc.
"""

from datetime import datetime
from typing import List, Optional
from enum import Enum
from dataclasses import dataclass


class NotifyLevel(Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"


@dataclass
class Notification:
    message: str
    level: NotifyLevel
    timestamp: datetime
    duration: float = 5.0  # seconds
    read: bool = False
    
    @property
    def color(self) -> str:
        return {
            NotifyLevel.INFO: "blue",
            NotifyLevel.SUCCESS: "green",
            NotifyLevel.WARNING: "yellow",
            NotifyLevel.ERROR: "red",
        }[self.level]
    
    @property
    def icon(self) -> str:
        return {
            NotifyLevel.INFO: "ℹ",
            NotifyLevel.SUCCESS: "✓",
            NotifyLevel.WARNING: "⚠",
            NotifyLevel.ERROR: "✗",
        }[self.level]
    
    def age(self) -> float:
        return (datetime.now() - self.timestamp).total_seconds()
    
    def is_expired(self) -> bool:
        return self.age() > self.duration


class NotificationManager:
    """Manage toast notifications"""
    
    MAX_HISTORY = 100
    
    def __init__(self):
        self.active: List[Notification] = []
        self.history: List[Notification] = []
    
    def notify(self, message: str, level: NotifyLevel = NotifyLevel.INFO, duration: float = 5.0):
        """Send a notification"""
        notif = Notification(
            message=message,
            level=level,
            timestamp=datetime.now(),
            duration=duration
        )
        self.active.append(notif)
        self.history.append(notif)
        
        # Trim history
        if len(self.history) > self.MAX_HISTORY:
            self.history = self.history[-self.MAX_HISTORY:]
    
    def info(self, message: str, duration: float = 5.0):
        self.notify(message, NotifyLevel.INFO, duration)
    
    def success(self, message: str, duration: float = 5.0):
        self.notify(message, NotifyLevel.SUCCESS, duration)
    
    def warning(self, message: str, duration: float = 5.0):
        self.notify(message, NotifyLevel.WARNING, duration)
    
    def error(self, message: str, duration: float = 10.0):
        self.notify(message, NotifyLevel.ERROR, duration)
    
    def tick(self):
        """Remove expired notifications"""
        self.active = [n for n in self.active if not n.is_expired()]
    
    def dismiss(self, index: int = 0):
        """Dismiss a notification"""
        if 0 <= index < len(self.active):
            self.active[index].read = True
            del self.active[index]
    
    def dismiss_all(self):
        """Dismiss all active notifications"""
        for n in self.active:
            n.read = True
        self.active.clear()
    
    def get_unread_count(self) -> int:
        return sum(1 for n in self.history if not n.read)
    
    def render_toast(self, max_show: int = 3) -> str:
        """Render active toasts for overlay"""
        if not self.active:
            return ""
        
        lines = []
        for notif in self.active[:max_show]:
            lines.append(f"[{notif.color}]{notif.icon} {notif.message}[/]")
        
        remaining = len(self.active) - max_show
        if remaining > 0:
            lines.append(f"[dim]+{remaining} more[/]")
        
        return "\n".join(lines)
    
    def render_history(self, limit: int = 20) -> str:
        """Render notification history"""
        lines = ["[bold]Notification History[/]", ""]
        
        for notif in reversed(self.history[-limit:]):
            time_str = notif.timestamp.strftime("%H:%M:%S")
            read_mark = "" if notif.read else "[bold]*[/]"
            lines.append(f"[dim]{time_str}[/] [{notif.color}]{notif.icon}[/] {notif.message} {read_mark}")
        
        return "\n".join(lines)


# Singleton for global access
_manager: Optional[NotificationManager] = None

def get_notifications() -> NotificationManager:
    global _manager
    if _manager is None:
        _manager = NotificationManager()
    return _manager


# Convenience functions
def notify(message: str, level: NotifyLevel = NotifyLevel.INFO):
    get_notifications().notify(message, level)

def info(message: str):
    get_notifications().info(message)

def success(message: str):
    get_notifications().success(message)

def warning(message: str):
    get_notifications().warning(message)

def error(message: str):
    get_notifications().error(message)


# Test
if __name__ == "__main__":
    nm = NotificationManager()
    nm.info("Welcome to Lucidia")
    nm.success("File saved")
    nm.warning("Low disk space")
    nm.error("Connection failed")
    print(nm.render_toast())
    print("\n")
    print(nm.render_history())
