"""
Infrastructure components: Cluster, Docker, SSH
"""
import json
import subprocess
from pathlib import Path
from datetime import datetime

DATA_DIR = Path.home() / ".lucidia"
DATA_DIR.mkdir(exist_ok=True)


class Cluster:
    """Cluster dashboard for Alice/Octavia/Lucidia nodes"""
    
    def __init__(self):
        self.file = DATA_DIR / "cluster.json"
        self.nodes = self._load()
    
    def _load(self):
        if self.file.exists():
            return json.loads(self.file.read_text())
        return [
            {"name": "alice", "host": "alice.blackroad.lan", "role": "gateway", "services": ["k3s", "traefik", "redis"]},
            {"name": "octavia", "host": "octavia.blackroad.lan", "role": "worker", "services": ["hailo", "inference"]},
            {"name": "lucidia", "host": "lucidia.blackroad.lan", "role": "compute", "services": ["ollama", "vllm"]},
            {"name": "blackroad os", "host": "blackroad os-infinity", "role": "vps", "services": ["nginx", "api"]}
        ]
    
    def _save(self):
        self.file.write_text(json.dumps(self.nodes, indent=2))
    
    def add(self, name: str, host: str, role: str = "worker") -> str:
        node = {"name": name, "host": host, "role": role, "services": []}
        self.nodes.append(node)
        self._save()
        return f"Added node: {name}"
    
    def remove(self, name: str) -> str:
        for n in self.nodes:
            if n["name"] == name:
                self.nodes.remove(n)
                self._save()
                return f"Removed: {name}"
        return "Not found"
    
    def ping(self, name: str) -> str:
        for n in self.nodes:
            if n["name"] == name:
                try:
                    result = subprocess.run(
                        ["ping", "-c", "1", "-W", "2", n["host"]],
                        capture_output=True, timeout=5
                    )
                    return "● online" if result.returncode == 0 else "○ offline"
                except:
                    return "○ timeout"
        return "○ unknown"
    
    def render(self) -> str:
        lines = [
            "[bold]🖥️  CLUSTER DASHBOARD[/]",
            "",
            "[bold]┌──────────┬────────────────────────┬──────────┬─────────────────────────┐[/]",
            "[bold]│[/] Node     [bold]│[/] Host                   [bold]│[/] Role     [bold]│[/] Services                [bold]│[/]",
            "[bold]├──────────┼────────────────────────┼──────────┼─────────────────────────┤[/]"
        ]
        
        for n in self.nodes:
            name = n["name"][:8]
            host = n["host"][:22]
            role = n["role"][:8]
            svcs = ", ".join(n.get("services", []))[:23]
            lines.append(f"[bold]│[/] {name:<8} [bold]│[/] {host:<22} [bold]│[/] {role:<8} [bold]│[/] {svcs:<23} [bold]│[/]")
        
        lines.append("[bold]└──────────┴────────────────────────┴──────────┴─────────────────────────┘[/]")
        lines.append("")
        lines.append("[dim]ping <node> | add <name> <host> | ssh <node>[/]")
        
        return "\n".join(lines)


class Docker:
    """Container viewer"""
    
    def __init__(self):
        self.containers = []
    
    def refresh(self) -> str:
        try:
            result = subprocess.run(
                ["docker", "ps", "--format", "{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"],
                capture_output=True, text=True, timeout=10
            )
            if result.returncode == 0:
                self.containers = []
                for line in result.stdout.strip().split("\n"):
                    if line:
                        parts = line.split("\t")
                        self.containers.append({
                            "name": parts[0] if len(parts) > 0 else "",
                            "image": parts[1] if len(parts) > 1 else "",
                            "status": parts[2] if len(parts) > 2 else "",
                            "ports": parts[3] if len(parts) > 3 else ""
                        })
                return f"Found {len(self.containers)} containers"
            return f"Error: {result.stderr}"
        except FileNotFoundError:
            return "[dim]Docker not installed[/]"
        except Exception as e:
            return f"Error: {e}"
    
    def logs(self, name: str, lines: int = 20) -> str:
        try:
            result = subprocess.run(
                ["docker", "logs", "--tail", str(lines), name],
                capture_output=True, text=True, timeout=10
            )
            return result.stdout or result.stderr or "No logs"
        except Exception as e:
            return f"Error: {e}"
    
    def render(self) -> str:
        lines = [
            "[bold]🐳 DOCKER CONTAINERS[/]",
            "",
            "[bold]┌────────────────────┬────────────────────┬──────────────────┬────────────┐[/]",
            "[bold]│[/] Name               [bold]│[/] Image              [bold]│[/] Status           [bold]│[/] Ports      [bold]│[/]",
            "[bold]├────────────────────┼────────────────────┼──────────────────┼────────────┤[/]"
        ]
        
        for c in self.containers[:10]:
            name = c["name"][:18]
            image = c["image"][:18]
            status = c["status"][:16]
            ports = c["ports"][:10] if c["ports"] else "-"
            lines.append(f"[bold]│[/] {name:<18} [bold]│[/] {image:<18} [bold]│[/] {status:<16} [bold]│[/] {ports:<10} [bold]│[/]")
        
        if not self.containers:
            lines.append("[bold]│[/] [dim]No containers running — type 'refresh'[/]                                       [bold]│[/]")
        
        lines.append("[bold]└────────────────────┴────────────────────┴──────────────────┴────────────┘[/]")
        lines.append("")
        lines.append("[dim]refresh | logs <name> | start/stop/restart <name>[/]")
        
        return "\n".join(lines)


class SSH:
    """SSH connection manager"""
    
    def __init__(self):
        self.file = DATA_DIR / "ssh.json"
        self.hosts = self._load()
        self.history = []
    
    def _load(self):
        if self.file.exists():
            return json.loads(self.file.read_text())
        return [
            {"name": "alice", "user": "pi", "host": "alice.blackroad.lan", "port": 22},
            {"name": "octavia", "user": "pi", "host": "octavia.blackroad.lan", "port": 22},
            {"name": "blackroad os", "user": "root", "host": "blackroad os-infinity", "port": 22}
        ]
    
    def _save(self):
        self.file.write_text(json.dumps(self.hosts, indent=2))
    
    def add(self, name: str, user: str, host: str, port: int = 22) -> str:
        self.hosts.append({"name": name, "user": user, "host": host, "port": port})
        self._save()
        return f"Added: {name}"
    
    def remove(self, name: str) -> str:
        for h in self.hosts:
            if h["name"] == name:
                self.hosts.remove(h)
                self._save()
                return f"Removed: {name}"
        return "Not found"
    
    def get_command(self, name: str) -> str:
        for h in self.hosts:
            if h["name"] == name:
                return f"ssh {h['user']}@{h['host']} -p {h['port']}"
        return None
    
    def exec(self, name: str, cmd: str) -> str:
        for h in self.hosts:
            if h["name"] == name:
                try:
                    result = subprocess.run(
                        ["ssh", f"{h['user']}@{h['host']}", "-p", str(h['port']), cmd],
                        capture_output=True, text=True, timeout=30
                    )
                    self.history.append({"host": name, "cmd": cmd, "time": datetime.now().isoformat()})
                    return result.stdout or result.stderr or "Done"
                except Exception as e:
                    return f"Error: {e}"
        return "Host not found"
    
    def render(self) -> str:
        lines = [
            "[bold]📡 SSH MANAGER[/]",
            "",
        ]
        
        for h in self.hosts:
            lines.append(f"[bold]{h['name']}[/]")
            lines.append(f"  [dim]{h['user']}@{h['host']}:{h['port']}[/]")
        
        if self.history:
            lines.append("")
            lines.append("[bold]Recent:[/]")
            for h in self.history[-3:]:
                lines.append(f"  [dim]{h['host']}:[/] {h['cmd']}")
        
        lines.append("")
        lines.append("[dim]connect <name> | exec <name> <cmd> | add <name> <user> <host>[/]")
        
        return "\n".join(lines)
