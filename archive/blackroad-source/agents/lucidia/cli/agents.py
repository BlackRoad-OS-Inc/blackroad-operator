"""Agents - Agent management with list + details + actions"""

from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical, Container
from textual.widgets import Static, Label, Button, DataTable, Input, RichLog
import json
import os

AGENTS_FILE = os.path.expanduser("~/.lucidia/agents.json")

DEFAULT_AGENTS = [
    {"id": "agent-001", "name": "Lucidia", "status": "active", "type": "core", "tasks": 0},
    {"id": "agent-002", "name": "Alice", "status": "active", "type": "gateway", "tasks": 3},
    {"id": "agent-003", "name": "Octavia", "status": "idle", "type": "worker", "tasks": 0},
    {"id": "agent-004", "name": "Cece", "status": "active", "type": "assistant", "tasks": 1},
]

class AgentsTab(Horizontal):
    """Agents with list + details + log panels"""
    
    DEFAULT_CSS = """
    AgentsTab {
        height: 100%;
    }
    AgentsTab > .agent-list {
        width: 35;
        border-right: solid gray;
    }
    AgentsTab > .agent-detail {
        width: 1fr;
    }
    AgentsTab > .agent-detail > .detail-top {
        height: 12;
        border-bottom: solid gray;
        padding: 1;
    }
    AgentsTab > .agent-detail > .detail-log {
        height: 1fr;
    }
    .agent-status-active { color: green; }
    .agent-status-idle { color: yellow; }
    .agent-status-offline { color: red; }
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.agents = self.load_agents()
        self.selected_agent = None
    
    def load_agents(self):
        if os.path.exists(AGENTS_FILE):
            try:
                with open(AGENTS_FILE) as f:
                    return json.load(f)
            except:
                pass
        return DEFAULT_AGENTS
    
    def save_agents(self):
        os.makedirs(os.path.dirname(AGENTS_FILE), exist_ok=True)
        with open(AGENTS_FILE, 'w') as f:
            json.dump(self.agents, f, indent=2)
    
    def compose(self) -> ComposeResult:
        yield Vertical(
            Label("🤖 AGENTS", classes="section-title"),
            DataTable(id="agent-table"),
            Horizontal(
                Button("+ Add", id="btn-add-agent", variant="primary"),
                Button("⟳ Refresh", id="btn-refresh-agents"),
                classes="button-row"
            ),
            classes="agent-list"
        )
        yield Vertical(
            Container(
                Static("Select an agent", id="agent-detail-content"),
                classes="detail-top"
            ),
            RichLog(id="agent-log", wrap=True, markup=True, classes="detail-log"),
            classes="agent-detail"
        )
    
    def on_mount(self) -> None:
        table = self.query_one("#agent-table", DataTable)
        table.add_columns("Status", "Name", "Type", "Tasks")
        table.cursor_type = "row"
        self.refresh_table()
        
        log = self.query_one("#agent-log", RichLog)
        log.write("[dim]Agent activity log[/dim]")
    
    def refresh_table(self) -> None:
        table = self.query_one("#agent-table", DataTable)
        table.clear()
        for agent in self.agents:
            status_icon = {"active": "●", "idle": "○", "offline": "✕"}.get(agent["status"], "?")
            table.add_row(
                status_icon,
                agent["name"],
                agent["type"],
                str(agent["tasks"])
            )
    
    def on_data_table_row_selected(self, event: DataTable.RowSelected) -> None:
        if event.row_key is not None:
            idx = event.cursor_row
            if 0 <= idx < len(self.agents):
                agent = self.agents[idx]
                self.selected_agent = agent
                detail = self.query_one("#agent-detail-content", Static)
                detail.update(
                    f"[bold]{agent['name']}[/bold] ({agent['id']})\n"
                    f"Type: {agent['type']}\n"
                    f"Status: {agent['status']}\n"
                    f"Active tasks: {agent['tasks']}"
                )
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-refresh-agents":
            self.refresh_table()
            log = self.query_one("#agent-log", RichLog)
            log.write("[green]Refreshed agent list[/green]")
        elif event.button.id == "btn-add-agent":
            log = self.query_one("#agent-log", RichLog)
            log.write("[yellow]Use /create <name> to add agents[/yellow]")
