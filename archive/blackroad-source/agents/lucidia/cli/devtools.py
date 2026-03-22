"""
Dev tools: Git, SQL, API Tester
"""
import json
import subprocess
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime

DATA_DIR = Path.home() / ".lucidia"
DATA_DIR.mkdir(exist_ok=True)


class Git:
    """Git repo viewer"""
    
    def __init__(self):
        self.repo_path = Path.cwd()
        self.status = None
        self.branch = None
        self.commits = []
    
    def refresh(self) -> str:
        try:
            # Get branch
            result = subprocess.run(
                ["git", "branch", "--show-current"],
                capture_output=True, text=True, cwd=self.repo_path, timeout=5
            )
            self.branch = result.stdout.strip() if result.returncode == 0 else "not a repo"
            
            # Get status
            result = subprocess.run(
                ["git", "status", "--porcelain"],
                capture_output=True, text=True, cwd=self.repo_path, timeout=5
            )
            self.status = result.stdout.strip().split("\n") if result.stdout.strip() else []
            
            # Get recent commits
            result = subprocess.run(
                ["git", "log", "--oneline", "-10"],
                capture_output=True, text=True, cwd=self.repo_path, timeout=5
            )
            self.commits = result.stdout.strip().split("\n") if result.stdout.strip() else []
            
            return f"Refreshed: {self.branch}"
        except Exception as e:
            return f"Error: {e}"
    
    def cd(self, path: str) -> str:
        p = Path(path).expanduser().resolve()
        if p.exists() and p.is_dir():
            self.repo_path = p
            self.refresh()
            return f"Changed to: {p}"
        return "Path not found"
    
    def render(self) -> str:
        lines = [
            "[bold]🔀 GIT[/]",
            "",
            f"[bold]Repo:[/] {self.repo_path}",
            f"[bold]Branch:[/] {self.branch or '[dim]unknown[/]'}",
            ""
        ]
        
        # Status
        lines.append("[bold]Status:[/]")
        if self.status:
            for s in self.status[:8]:
                marker = s[:2] if len(s) >= 2 else "  "
                file = s[3:] if len(s) > 3 else s
                if marker.strip():
                    lines.append(f"  [bold]{marker}[/] {file}")
        else:
            lines.append("  [dim]Clean working tree[/]")
        
        # Commits
        lines.append("")
        lines.append("[bold]Recent commits:[/]")
        for c in self.commits[:5]:
            lines.append(f"  [dim]{c}[/]")
        
        lines.append("")
        lines.append("[dim]refresh | cd <path> | pull | push | commit <msg>[/]")
        
        return "\n".join(lines)


class SQL:
    """SQLite query interface"""
    
    def __init__(self):
        self.db_path = DATA_DIR / "lucidia.db"
        self.history = []
        self.last_result = []
    
    def connect(self, path: str) -> str:
        p = Path(path).expanduser().resolve()
        if p.exists() or path.endswith(".db"):
            self.db_path = p
            return f"Connected: {p}"
        return "Invalid path"
    
    def query(self, sql: str) -> str:
        try:
            import sqlite3
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(sql)
            
            if sql.strip().upper().startswith("SELECT"):
                self.last_result = cursor.fetchall()
                cols = [desc[0] for desc in cursor.description] if cursor.description else []
                conn.close()
                self.history.append({"sql": sql, "time": datetime.now().isoformat()})
                return self._format_result(cols, self.last_result)
            else:
                conn.commit()
                affected = cursor.rowcount
                conn.close()
                self.history.append({"sql": sql, "time": datetime.now().isoformat()})
                return f"OK. {affected} rows affected."
        except Exception as e:
            return f"Error: {e}"
    
    def _format_result(self, cols: list, rows: list) -> str:
        if not rows:
            return "[dim]No results[/]"
        
        lines = []
        # Header
        header = " | ".join(str(c)[:15] for c in cols)
        lines.append(f"[bold]{header}[/]")
        lines.append("-" * len(header))
        
        # Rows
        for row in rows[:20]:
            line = " | ".join(str(v)[:15] for v in row)
            lines.append(line)
        
        if len(rows) > 20:
            lines.append(f"[dim]... and {len(rows) - 20} more rows[/]")
        
        return "\n".join(lines)
    
    def tables(self) -> str:
        return self.query("SELECT name FROM sqlite_master WHERE type='table'")
    
    def render(self) -> str:
        lines = [
            "[bold]🗄️  SQL[/]",
            "",
            f"[bold]DB:[/] {self.db_path}",
            ""
        ]
        
        if self.history:
            lines.append("[bold]History:[/]")
            for h in self.history[-5:]:
                sql_preview = h["sql"][:50] + "..." if len(h["sql"]) > 50 else h["sql"]
                lines.append(f"  [dim]{sql_preview}[/]")
        
        lines.append("")
        lines.append("[dim]Type SQL query | .tables | .connect <path>[/]")
        
        return "\n".join(lines)


class API:
    """API tester - curl-like"""
    
    def __init__(self):
        self.history = []
        self.last_response = None
    
    def request(self, method: str, url: str, data: str = None, headers: dict = None) -> str:
        try:
            if not url.startswith("http"):
                url = f"https://{url}"
            
            req = urllib.request.Request(url, method=method.upper())
            req.add_header("User-Agent", "Lucidia-CLI/0.5")
            req.add_header("Accept", "application/json")
            
            if headers:
                for k, v in headers.items():
                    req.add_header(k, v)
            
            if data:
                req.data = data.encode()
                req.add_header("Content-Type", "application/json")
            
            with urllib.request.urlopen(req, timeout=10) as resp:
                body = resp.read().decode()
                status = resp.status
                
                self.last_response = {
                    "status": status,
                    "body": body,
                    "headers": dict(resp.headers)
                }
                
                self.history.append({
                    "method": method.upper(),
                    "url": url,
                    "status": status,
                    "time": datetime.now().isoformat()
                })
                
                # Pretty print JSON
                try:
                    parsed = json.loads(body)
                    body = json.dumps(parsed, indent=2)[:500]
                except:
                    body = body[:500]
                
                return f"[bold]{status}[/]\n{body}"
        
        except urllib.error.HTTPError as e:
            return f"[dim]HTTP {e.code}[/]: {e.reason}"
        except Exception as e:
            return f"Error: {e}"
    
    def get(self, url: str) -> str:
        return self.request("GET", url)
    
    def post(self, url: str, data: str) -> str:
        return self.request("POST", url, data)
    
    def render(self) -> str:
        lines = [
            "[bold]🌐 API TESTER[/]",
            ""
        ]
        
        if self.history:
            lines.append("[bold]History:[/]")
            for h in self.history[-5:]:
                status_style = "bold" if h["status"] < 400 else "dim"
                lines.append(f"  [{status_style}]{h['status']}[/] {h['method']} {h['url'][:40]}")
        
        if self.last_response:
            lines.append("")
            lines.append("[bold]Last response:[/]")
            body_preview = self.last_response["body"][:200]
            lines.append(f"[dim]{body_preview}...[/]")
        
        lines.append("")
        lines.append("[dim]get <url> | post <url> <json> | put/delete[/]")
        
        return "\n".join(lines)
