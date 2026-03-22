"""Cluster - Node status cards in a grid"""

from textual.app import ComposeResult
from textual.containers import Container, Horizontal, Vertical
from textual.widgets import Static, Label, Button, RichLog
import subprocess
import os

NODES = [
    {"name": "alice", "host": "alice.blackroad.lan", "role": "K3s Gateway", "services": ["traefik", "redis", "api"]},
    {"name": "octavia", "host": "octavia.blackroad.lan", "role": "Hailo Worker", "services": ["hailo", "inference"]},
    {"name": "lucidia", "host": "lucidia.blackroad.lan", "role": "Core AI", "services": ["ollama", "vllm"]},
    {"name": "blackroad os", "host": "blackroad os-infinity", "role": "VPS Edge", "services": ["nginx", "certbot"]},
]

class ClusterTab(Container):
    """Cluster management with node cards"""
    
    DEFAULT_CSS = """
    ClusterTab {
        layout: grid;
        grid-size: 2 2;
        grid-gutter: 1;
        padding: 1;
        height: 100%;
    }
    ClusterTab > .node-card {
        border: solid gray;
        padding: 1;
    }
    ClusterTab > .node-card > .node-header {
        text-style: bold;
        border-bottom: solid gray;
        padding-bottom: 1;
        margin-bottom: 1;
    }
    .node-online { color: green; }
    .node-offline { color: red; }
    .node-checking { color: yellow; }
    .service-tag { background: #333; padding: 0 1; margin-right: 1; }
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.node_status = {n["name"]: "checking" for n in NODES}
    
    def compose(self) -> ComposeResult:
        for node in NODES:
            yield Vertical(
                Horizontal(
                    Static(f"● {node['name'].upper()}", id=f"status-{node['name']}", classes="node-checking"),
                    Static(f" — {node['role']}", classes="node-role"),
                    classes="node-header"
                ),
                Static(f"Host: {node['host']}"),
                Static(f"Services: {', '.join(node['services'])}"),
                Horizontal(
                    Button("Ping", id=f"ping-{node['name']}", variant="primary"),
                    Button("SSH", id=f"ssh-{node['name']}"),
                    classes="node-actions"
                ),
                classes="node-card", id=f"card-{node['name']}"
            )
    
    def on_mount(self) -> None:
        self.check_all_nodes()
    
    def check_all_nodes(self) -> None:
        for node in NODES:
            self.check_node(node["name"], node["host"])
    
    def check_node(self, name: str, host: str) -> None:
        status_widget = self.query_one(f"#status-{name}", Static)
        
        try:
            # Quick ping check
            result = subprocess.run(
                ["ping", "-c", "1", "-W", "1", host],
                capture_output=True, timeout=2
            )
            if result.returncode == 0:
                self.node_status[name] = "online"
                status_widget.update(f"[green]● {name.upper()}[/green]")
            else:
                self.node_status[name] = "offline"
                status_widget.update(f"[red]● {name.upper()}[/red]")
        except:
            self.node_status[name] = "offline"
            status_widget.update(f"[red]● {name.upper()}[/red]")
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        btn_id = event.button.id
        
        if btn_id.startswith("ping-"):
            name = btn_id.replace("ping-", "")
            node = next((n for n in NODES if n["name"] == name), None)
            if node:
                self.check_node(name, node["host"])
        
        elif btn_id.startswith("ssh-"):
            name = btn_id.replace("ssh-", "")
            node = next((n for n in NODES if n["name"] == name), None)
            if node:
                # Would open SSH - for now just log
                self.notify(f"SSH to {node['host']} - use SSH tab", title="Cluster")
