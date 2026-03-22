"""Docker - Container management with list + logs"""

from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical
from textual.widgets import Static, Label, Button, DataTable, RichLog
import subprocess

class DockerTab(Horizontal):
    """Docker with container list + logs panel"""
    
    DEFAULT_CSS = """
    DockerTab {
        height: 100%;
    }
    DockerTab > .docker-list {
        width: 1fr;
        border-right: solid gray;
    }
    DockerTab > .docker-list > .list-header {
        height: 3;
        border-bottom: solid gray;
        padding: 0 1;
    }
    DockerTab > .docker-list > DataTable {
        height: 1fr;
    }
    DockerTab > .docker-logs {
        width: 1fr;
    }
    DockerTab > .docker-logs > .logs-header {
        height: 3;
        border-bottom: solid gray;
        padding: 1;
    }
    DockerTab > .docker-logs > RichLog {
        height: 1fr;
        background: #111;
    }
    .status-running { color: green; }
    .status-exited { color: red; }
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.selected_container = None
    
    def compose(self) -> ComposeResult:
        yield Vertical(
            Horizontal(
                Label("🐳 CONTAINERS"),
                Button("⟳ Refresh", id="btn-refresh-docker"),
                classes="list-header"
            ),
            DataTable(id="container-table"),
            classes="docker-list"
        )
        yield Vertical(
            Static("Select a container to view logs", id="logs-header", classes="logs-header"),
            RichLog(id="container-logs", wrap=True, markup=True),
            classes="docker-logs"
        )
    
    def on_mount(self) -> None:
        table = self.query_one("#container-table", DataTable)
        table.add_columns("Status", "Name", "Image", "Ports")
        table.cursor_type = "row"
        self.refresh_containers()
    
    def refresh_containers(self) -> None:
        table = self.query_one("#container-table", DataTable)
        table.clear()
        
        try:
            result = subprocess.run(
                ["docker", "ps", "-a", "--format", "{{.Status}}|{{.Names}}|{{.Image}}|{{.Ports}}"],
                capture_output=True, text=True, timeout=5
            )
            
            if result.returncode == 0 and result.stdout.strip():
                for line in result.stdout.strip().split("\n"):
                    parts = line.split("|")
                    if len(parts) >= 4:
                        status = "●" if "Up" in parts[0] else "○"
                        table.add_row(status, parts[1], parts[2][:20], parts[3][:20] if parts[3] else "-")
            else:
                table.add_row("-", "No containers", "-", "-")
        
        except FileNotFoundError:
            table.add_row("-", "Docker not installed", "-", "-")
        except Exception as e:
            table.add_row("-", f"Error: {e}", "-", "-")
    
    def on_data_table_row_selected(self, event: DataTable.RowSelected) -> None:
        table = self.query_one("#container-table", DataTable)
        row_key = event.row_key
        if row_key:
            row_idx = event.cursor_row
            row_data = table.get_row_at(row_idx)
            if row_data and len(row_data) > 1:
                container_name = row_data[1]
                if container_name not in ["No containers", "Docker not installed"]:
                    self.selected_container = container_name
                    self.fetch_logs(container_name)
    
    def fetch_logs(self, container: str) -> None:
        header = self.query_one("#logs-header", Static)
        header.update(f"📋 Logs: {container}")
        
        logs = self.query_one("#container-logs", RichLog)
        logs.clear()
        
        try:
            result = subprocess.run(
                ["docker", "logs", "--tail", "50", container],
                capture_output=True, text=True, timeout=5
            )
            
            output = result.stdout + result.stderr
            if output.strip():
                for line in output.strip().split("\n")[-30:]:
                    logs.write(line)
            else:
                logs.write("[dim]No logs available[/dim]")
        
        except Exception as e:
            logs.write(f"[red]Error fetching logs: {e}[/red]")
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-refresh-docker":
            self.refresh_containers()
