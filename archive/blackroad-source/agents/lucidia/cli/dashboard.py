"""Dashboard - Home screen with widget grid"""

from textual.app import ComposeResult
from textual.containers import Container, Horizontal, Vertical
from textual.widgets import Static, Label, Button
from datetime import datetime
import os

class DashboardTab(Container):
    """Dashboard home with 2x3 widget grid"""
    
    DEFAULT_CSS = """
    DashboardTab {
        layout: grid;
        grid-size: 3 2;
        grid-gutter: 1;
        padding: 1;
    }
    DashboardTab > .widget {
        border: solid gray;
        padding: 1;
    }
    DashboardTab > .widget-title {
        text-style: bold;
        dock: top;
        padding: 0 1;
        background: #333;
    }
    .widget-clock {
        text-align: center;
        text-style: bold;
    }
    .widget-value {
        text-align: center;
        color: white;
    }
    """
    
    def compose(self) -> ComposeResult:
        # Row 1
        yield Container(
            Label("◷ CLOCK", classes="widget-title"),
            Static(datetime.now().strftime("%H:%M:%S"), id="clock-display", classes="widget-clock"),
            Static(datetime.now().strftime("%A, %B %d"), classes="widget-value"),
            classes="widget", id="widget-clock"
        )
        yield Container(
            Label("☁ WEATHER", classes="widget-title"),
            Static("--°F", id="weather-temp", classes="widget-value"),
            Static("Loading...", id="weather-desc"),
            classes="widget", id="widget-weather"
        )
        yield Container(
            Label("✓ TASKS", classes="widget-title"),
            Static("0", id="task-count", classes="widget-value"),
            Static("tasks today"),
            classes="widget", id="widget-tasks"
        )
        # Row 2
        yield Container(
            Label("⚡ CLUSTER", classes="widget-title"),
            Static("● alice", id="node-alice"),
            Static("● octavia", id="node-octavia"),
            Static("● lucidia", id="node-lucidia"),
            classes="widget", id="widget-cluster"
        )
        yield Container(
            Label("📅 TODAY", classes="widget-title"),
            Static("No events", id="today-events"),
            classes="widget", id="widget-calendar"
        )
        yield Container(
            Label("💬 MESSAGES", classes="widget-title"),
            Static("0 unread", id="msg-count", classes="widget-value"),
            classes="widget", id="widget-messages"
        )
    
    def on_mount(self) -> None:
        self.set_interval(1.0, self.update_clock)
        self.load_widgets()
    
    def update_clock(self) -> None:
        try:
            clock = self.query_one("#clock-display", Static)
            clock.update(datetime.now().strftime("%H:%M:%S"))
        except:
            pass
    
    def load_widgets(self) -> None:
        # Load task count
        todo_file = os.path.expanduser("~/.lucidia/kanban.json")
        if os.path.exists(todo_file):
            import json
            try:
                with open(todo_file) as f:
                    data = json.load(f)
                    count = len(data.get("todo", []))
                    self.query_one("#task-count", Static).update(str(count))
            except:
                pass
