#!/usr/bin/env python3
"""
Lucidia CLI - Index Command
Indexes the entire BlackRoad ecosystem: local files, GitHub repos, Cloudflare workers, domains, KV, D1, R2
"""

import json
import subprocess
import sqlite3
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Optional
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from rich.theme import Theme

# BlackRoad theme
THEME = Theme({
    "br.orange": "orange1",
    "br.dark_orange": "dark_orange",
    "br.pink": "deep_pink2",
    "br.orchid": "medium_orchid",
    "br.magenta": "magenta",
    "br.blue": "dodger_blue2",
})
console = Console(theme=THEME)

# Index storage - use .lucidia to avoid conflicts with existing .blackroad
INDEX_DIR = Path.home() / ".lucidia" / "index"
DB_PATH = INDEX_DIR / "blackroad.db"

# GitHub orgs to index
GITHUB_ORGS = [
    "BlackRoad-OS",
    # Add more orgs as needed
]

def init_db():
    """Initialize SQLite database for index."""
    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Repos table
    c.execute('''CREATE TABLE IF NOT EXISTS repos (
        id TEXT PRIMARY KEY,
        org TEXT,
        name TEXT,
        full_name TEXT,
        description TEXT,
        visibility TEXT,
        updated_at TEXT,
        default_branch TEXT,
        url TEXT,
        class TEXT,
        indexed_at TEXT
    )''')
    
    # Workers table
    c.execute('''CREATE TABLE IF NOT EXISTS workers (
        id TEXT PRIMARY KEY,
        name TEXT,
        created_on TEXT,
        modified_on TEXT,
        indexed_at TEXT
    )''')
    
    # Domains table
    c.execute('''CREATE TABLE IF NOT EXISTS domains (
        id TEXT PRIMARY KEY,
        name TEXT,
        status TEXT,
        type TEXT,
        indexed_at TEXT
    )''')
    
    # KV namespaces table
    c.execute('''CREATE TABLE IF NOT EXISTS kv_namespaces (
        id TEXT PRIMARY KEY,
        title TEXT,
        indexed_at TEXT
    )''')
    
    # D1 databases table
    c.execute('''CREATE TABLE IF NOT EXISTS d1_databases (
        id TEXT PRIMARY KEY,
        name TEXT,
        created_at TEXT,
        indexed_at TEXT
    )''')
    
    # R2 buckets table
    c.execute('''CREATE TABLE IF NOT EXISTS r2_buckets (
        name TEXT PRIMARY KEY,
        creation_date TEXT,
        indexed_at TEXT
    )''')
    
    # Local files table
    c.execute('''CREATE TABLE IF NOT EXISTS local_files (
        path TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        filetype TEXT,
        size INTEGER,
        modified TEXT,
        description TEXT,
        indexed_at TEXT
    )''')
    
    # Modelfiles/Agents table
    c.execute('''CREATE TABLE IF NOT EXISTS agents (
        name TEXT PRIMARY KEY,
        model TEXT,
        system_prompt TEXT,
        filepath TEXT,
        indexed_at TEXT
    )''')
    
    # Full-text search virtual table
    c.execute('''CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
        type, name, description, content
    )''')
    
    conn.commit()
    return conn

def run_cmd(cmd: list[str]) -> Optional[str]:
    """Run command and return output or None on failure."""
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    except Exception:
        return None

def classify_repo(name: str) -> str:
    """Classify repo into CORE, LABS, or ARCHIVE."""
    name_lower = name.lower()
    if any(kw in name_lower for kw in ["core", "os", "agent", "api", "gateway", "mesh", "infra", "lucidia"]):
        return "CORE"
    elif any(kw in name_lower for kw in ["test", "example", "demo", "template", "sim", "lab", "experiment"]):
        return "LABS"
    return "ARCHIVE"

def classify_local_file(name: str, path: str) -> tuple[str, str]:
    """Classify local file into category and type."""
    name_lower = name.lower()
    ext = Path(name).suffix.lower()
    
    # Determine filetype
    if ext == '.sh':
        filetype = 'script'
    elif ext == '.py':
        filetype = 'python'
    elif ext == '.js':
        filetype = 'javascript'
    elif ext == '.html':
        filetype = 'html'
    elif ext == '.md':
        filetype = 'markdown'
    elif ext == '.json':
        filetype = 'json'
    elif ext == '.yaml' or ext == '.yml':
        filetype = 'yaml'
    elif ext == '.db':
        filetype = 'database'
    elif ext == '.log':
        filetype = 'log'
    elif ext in ['.tar', '.gz', '.tgz', '.zip']:
        filetype = 'archive'
    elif name.startswith('Modelfile'):
        filetype = 'modelfile'
    elif os.path.isdir(path):
        filetype = 'directory'
    else:
        filetype = 'other'
    
    # Determine category
    if 'agent' in name_lower:
        category = 'AGENTS'
    elif 'dashboard' in name_lower or 'monitor' in name_lower:
        category = 'DASHBOARDS'
    elif 'deploy' in name_lower or 'setup' in name_lower:
        category = 'DEPLOY'
    elif 'api' in name_lower or 'worker' in name_lower:
        category = 'API'
    elif 'cli' in name_lower or 'tool' in name_lower:
        category = 'TOOLS'
    elif 'test' in name_lower:
        category = 'TESTING'
    elif 'product' in name_lower or 'app' in name_lower:
        category = 'PRODUCTS'
    elif 'blackroad os' in name_lower or 'knowledge' in name_lower or 'rag' in name_lower:
        category = 'KNOWLEDGE'
    elif 'cluster' in name_lower or 'pi' in name_lower or 'infra' in name_lower:
        category = 'INFRA'
    elif name.startswith('Modelfile'):
        category = 'AGENTS'
    elif os.path.isdir(path):
        category = 'PROJECT'
    else:
        category = 'OTHER'
    
    return category, filetype

def extract_description(filepath: str) -> str:
    """Extract description from file (first comment or docstring)."""
    try:
        with open(filepath, 'r', errors='ignore') as f:
            lines = f.readlines()[:20]  # First 20 lines
        
        for line in lines:
            line = line.strip()
            # Shell script comment
            if line.startswith('# ') and len(line) > 10 and not line.startswith('#!/'):
                return line[2:].strip()[:200]
            # Python docstring
            if line.startswith('"""') or line.startswith("'''"):
                return line.strip('"\'').strip()[:200]
            # HTML title
            if '<title>' in line.lower():
                match = re.search(r'<title>(.*?)</title>', line, re.I)
                if match:
                    return match.group(1)[:200]
    except:
        pass
    return ""

def parse_modelfile(filepath: str) -> tuple[str, str]:
    """Parse Ollama Modelfile to extract model and system prompt."""
    model = ""
    system = ""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Extract FROM line
        match = re.search(r'^FROM\s+(\S+)', content, re.M)
        if match:
            model = match.group(1)
        
        # Extract SYSTEM line
        match = re.search(r'^SYSTEM\s+"?(.+?)"?\s*$', content, re.M | re.S)
        if match:
            system = match.group(1).strip()[:500]
    except:
        pass
    return model, system

def index_local(conn: sqlite3.Connection, progress: Progress) -> dict:
    """Index local BlackRoad files in home directory."""
    home = Path.home()
    stats = {'files': 0, 'dirs': 0, 'agents': 0}
    now = datetime.utcnow().isoformat()
    
    # Find all blackroad-related items
    task = progress.add_task("[br.orange]Scanning local files...", total=None)
    
    items = []
    for item in home.iterdir():
        name = item.name
        if 'blackroad' in name.lower() or name.startswith('Modelfile.blackroad'):
            items.append(item)
    
    progress.update(task, total=len(items))
    
    for item in items:
        try:
            name = item.name
            path = str(item)
            category, filetype = classify_local_file(name, path)
            
            if item.is_file():
                size = item.stat().st_size
                modified = datetime.fromtimestamp(item.stat().st_mtime).isoformat()
                description = extract_description(path)
                
                conn.execute('''INSERT OR REPLACE INTO local_files
                    (path, name, category, filetype, size, modified, description, indexed_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                    (path, name, category, filetype, size, modified, description, now)
                )
                stats['files'] += 1
                
                # Parse Modelfiles separately
                if name.startswith('Modelfile.blackroad'):
                    agent_name = name.replace('Modelfile.blackroad-', '').replace('Modelfile.', '')
                    model, system = parse_modelfile(path)
                    conn.execute('''INSERT OR REPLACE INTO agents
                        (name, model, system_prompt, filepath, indexed_at)
                        VALUES (?, ?, ?, ?, ?)''',
                        (agent_name, model, system, path, now)
                    )
                    stats['agents'] += 1
                    
            elif item.is_dir():
                modified = datetime.fromtimestamp(item.stat().st_mtime).isoformat()
                # Count items in directory
                try:
                    count = len(list(item.iterdir()))
                    description = f"{count} items"
                except:
                    description = ""
                
                conn.execute('''INSERT OR REPLACE INTO local_files
                    (path, name, category, filetype, size, modified, description, indexed_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
                    (path, name, category, 'directory', 0, modified, description, now)
                )
                stats['dirs'] += 1
                
        except Exception as e:
            pass
        
        progress.advance(task)
    
    conn.commit()
    return stats

def index_github(conn: sqlite3.Connection, progress: Progress) -> int:
    """Index GitHub repos from all configured orgs."""
    task = progress.add_task("[br.orange]GitHub repos...", total=len(GITHUB_ORGS))
    total = 0
    
    for org in GITHUB_ORGS:
        output = run_cmd([
            "gh", "repo", "list", org,
            "--limit", "1000",
            "--json", "name,description,visibility,updatedAt,defaultBranchRef,url"
        ])
        
        if output:
            repos = json.loads(output)
            now = datetime.utcnow().isoformat()
            
            for repo in repos:
                conn.execute('''INSERT OR REPLACE INTO repos 
                    (id, org, name, full_name, description, visibility, updated_at, default_branch, url, class, indexed_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                    (
                        f"{org}/{repo['name']}",
                        org,
                        repo['name'],
                        f"{org}/{repo['name']}",
                        repo.get('description', ''),
                        repo.get('visibility', 'private'),
                        repo.get('updatedAt', ''),
                        repo.get('defaultBranchRef', {}).get('name', 'main') if repo.get('defaultBranchRef') else 'main',
                        repo.get('url', ''),
                        classify_repo(repo['name']),
                        now
                    )
                )
                total += 1
            
            conn.commit()
        progress.advance(task)
    
    return total

def index_workers(conn: sqlite3.Connection, progress: Progress) -> int:
    """Index Cloudflare Workers."""
    task = progress.add_task("[br.pink]Workers...", total=1)
    
    output = run_cmd(["wrangler", "deployments", "list", "--json"])
    # Alternative: use Cloudflare API directly
    # For now, try listing via wrangler or fall back to API
    
    # Simpler approach - list directories if wrangler doesn't work
    # This is a placeholder - in production, use Cloudflare API
    total = 0
    progress.advance(task)
    return total

def index_cloudflare_kv(conn: sqlite3.Connection, progress: Progress) -> int:
    """Index Cloudflare KV namespaces."""
    task = progress.add_task("[br.orchid]KV namespaces...", total=1)
    
    output = run_cmd(["wrangler", "kv", "namespace", "list"])
    total = 0
    
    if output:
        try:
            namespaces = json.loads(output)
            now = datetime.utcnow().isoformat()
            
            for ns in namespaces:
                conn.execute('''INSERT OR REPLACE INTO kv_namespaces
                    (id, title, indexed_at) VALUES (?, ?, ?)''',
                    (ns.get('id', ''), ns.get('title', ''), now)
                )
                total += 1
            conn.commit()
        except json.JSONDecodeError:
            pass
    
    progress.advance(task)
    return total

def index_cloudflare_d1(conn: sqlite3.Connection, progress: Progress) -> int:
    """Index Cloudflare D1 databases."""
    task = progress.add_task("[br.magenta]D1 databases...", total=1)
    
    output = run_cmd(["wrangler", "d1", "list", "--json"])
    total = 0
    
    if output:
        try:
            databases = json.loads(output)
            now = datetime.utcnow().isoformat()
            
            for db in databases:
                conn.execute('''INSERT OR REPLACE INTO d1_databases
                    (id, name, created_at, indexed_at) VALUES (?, ?, ?, ?)''',
                    (db.get('uuid', ''), db.get('name', ''), db.get('created_at', ''), now)
                )
                total += 1
            conn.commit()
        except json.JSONDecodeError:
            pass
    
    progress.advance(task)
    return total

def index_cloudflare_r2(conn: sqlite3.Connection, progress: Progress) -> int:
    """Index Cloudflare R2 buckets."""
    task = progress.add_task("[br.blue]R2 buckets...", total=1)
    
    # R2 doesn't support --json, parse text output
    output = run_cmd(["wrangler", "r2", "bucket", "list"])
    total = 0
    
    if output:
        now = datetime.utcnow().isoformat()
        lines = output.split('\n')
        current_name = None
        current_date = None
        
        for line in lines:
            line = line.strip()
            if line.startswith('name:'):
                current_name = line.split(':', 1)[1].strip()
            elif line.startswith('creation_date:'):
                current_date = line.split(':', 1)[1].strip()
                if current_name:
                    conn.execute('''INSERT OR REPLACE INTO r2_buckets
                        (name, creation_date, indexed_at) VALUES (?, ?, ?)''',
                        (current_name, current_date, now)
                    )
                    total += 1
                    current_name = None
                    current_date = None
        
        conn.commit()
    
    progress.advance(task)
    return total

def rebuild_search_index(conn: sqlite3.Connection):
    """Rebuild FTS search index from all tables."""
    c = conn.cursor()
    
    # Clear existing search index
    c.execute("DELETE FROM search_index")
    
    # Index repos
    c.execute('''INSERT INTO search_index (type, name, description, content)
        SELECT 'repo', name, description, name || ' ' || COALESCE(description, '') || ' ' || org
        FROM repos''')
    
    # Index KV namespaces
    c.execute('''INSERT INTO search_index (type, name, description, content)
        SELECT 'kv', title, '', title FROM kv_namespaces''')
    
    # Index D1 databases
    c.execute('''INSERT INTO search_index (type, name, description, content)
        SELECT 'd1', name, '', name FROM d1_databases''')
    
    # Index R2 buckets
    c.execute('''INSERT INTO search_index (type, name, description, content)
        SELECT 'r2', name, '', name FROM r2_buckets''')
    
    # Index local files
    c.execute('''INSERT INTO search_index (type, name, description, content)
        SELECT filetype, name, description, name || ' ' || category || ' ' || COALESCE(description, '')
        FROM local_files''')
    
    # Index agents
    c.execute('''INSERT INTO search_index (type, name, description, content)
        SELECT 'agent', name, system_prompt, name || ' ' || model || ' ' || COALESCE(system_prompt, '')
        FROM agents''')
    
    conn.commit()

def cmd_index(args: list[str]):
    """Main index command - indexes everything or specific targets."""
    targets = args if args else ["all"]
    
    console.print(Panel(
        "[br.orange]B[/][br.dark_orange]L[/][br.pink]A[/][br.orchid]C[/][br.magenta]K[/][br.blue]ROAD[/] Index",
        subtitle="Indexing ecosystem..."
    ))
    
    conn = init_db()
    stats = {}
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TaskProgressColumn(),
        console=console
    ) as progress:
        
        # Local files - always index unless specifically targeting something else
        if "all" in targets or "local" in targets:
            local_stats = index_local(conn, progress)
            stats['files'] = local_stats['files']
            stats['dirs'] = local_stats['dirs']
            stats['agents'] = local_stats['agents']
        
        if "all" in targets or "github" in targets:
            stats['repos'] = index_github(conn, progress)
        
        if "all" in targets or "kv" in targets:
            stats['kv'] = index_cloudflare_kv(conn, progress)
        
        if "all" in targets or "d1" in targets:
            stats['d1'] = index_cloudflare_d1(conn, progress)
        
        if "all" in targets or "r2" in targets:
            stats['r2'] = index_cloudflare_r2(conn, progress)
        
        # Rebuild search index
        task = progress.add_task("[br.blue]Building search index...", total=1)
        rebuild_search_index(conn)
        progress.advance(task)
    
    conn.close()
    
    # Print summary
    table = Table(title="Index Complete", show_header=True)
    table.add_column("Type", style="br.orange")
    table.add_column("Count", style="br.blue", justify="right")
    
    for key, count in stats.items():
        table.add_row(key, str(count))
    
    console.print(table)
    console.print(f"\n[dim]Index stored at:[/] {DB_PATH}")

def cmd_search(query: str):
    """Search the index."""
    if not DB_PATH.exists():
        console.print("[red]Index not found. Run 'lucidia index' first.[/]")
        return
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # FTS search
    c.execute('''SELECT type, name, description, snippet(search_index, 3, '[', ']', '...', 64)
        FROM search_index WHERE search_index MATCH ? ORDER BY rank LIMIT 20''', (query,))
    
    results = c.fetchall()
    conn.close()
    
    if not results:
        console.print(f"[dim]No results for:[/] {query}")
        return
    
    table = Table(title=f"Search: {query}", show_header=True)
    table.add_column("Type", style="br.pink", width=8)
    table.add_column("Name", style="br.orange")
    table.add_column("Match", style="dim")
    
    for type_, name, desc, snippet in results:
        table.add_row(type_, name, snippet)
    
    console.print(table)

def cmd_status():
    """Show index status and counts."""
    if not DB_PATH.exists():
        console.print("[red]Index not found. Run 'lucidia index' first.[/]")
        return
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    table = Table(title="Index Status", show_header=True)
    table.add_column("Resource", style="br.orange")
    table.add_column("Count", style="br.blue", justify="right")
    table.add_column("Last Updated", style="dim")
    
    for tbl, label in [
        ("local_files", "Local Files"),
        ("agents", "Agents"),
        ("repos", "Repositories"),
        ("kv_namespaces", "KV Namespaces"),
        ("d1_databases", "D1 Databases"),
        ("r2_buckets", "R2 Buckets"),
    ]:
        try:
            c.execute(f"SELECT COUNT(*), MAX(indexed_at) FROM {tbl}")
            count, last = c.fetchone()
            table.add_row(label, str(count or 0), (last or "never")[:19])
        except:
            table.add_row(label, "0", "never")
    
    conn.close()
    console.print(table)
    
    # Show category breakdown for local files
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        c.execute("SELECT category, COUNT(*) FROM local_files GROUP BY category ORDER BY COUNT(*) DESC")
        rows = c.fetchall()
        if rows:
            console.print("\n[br.pink]Local Files by Category:[/]")
            cat_table = Table(show_header=False, box=None)
            cat_table.add_column("Category", style="br.orange")
            cat_table.add_column("Count", style="br.blue", justify="right")
            for cat, cnt in rows:
                cat_table.add_row(cat, str(cnt))
            console.print(cat_table)
    except:
        pass
    conn.close()

def cmd_list(resource: str, filter_arg: Optional[str] = None):
    """List indexed resources."""
    if not DB_PATH.exists():
        console.print("[red]Index not found. Run 'lucidia index' first.[/]")
        return
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    if resource == "repos":
        if filter_arg:
            c.execute("SELECT name, class, visibility, updated_at FROM repos WHERE class = ? ORDER BY updated_at DESC", (filter_arg.upper(),))
        else:
            c.execute("SELECT name, class, visibility, updated_at FROM repos ORDER BY class, updated_at DESC")
        
        table = Table(title="Repositories", show_header=True)
        table.add_column("Name", style="br.orange")
        table.add_column("Class", style="br.pink")
        table.add_column("Vis", style="dim")
        table.add_column("Updated", style="br.blue")
        
        for name, cls, vis, updated in c.fetchall():
            table.add_row(name, cls, vis[:3], (updated or "")[:10])
    
    elif resource == "local" or resource == "files":
        if filter_arg:
            c.execute("SELECT name, category, filetype, size, modified FROM local_files WHERE category = ? ORDER BY modified DESC", (filter_arg.upper(),))
        else:
            c.execute("SELECT name, category, filetype, size, modified FROM local_files ORDER BY category, modified DESC LIMIT 100")
        
        table = Table(title="Local Files", show_header=True)
        table.add_column("Name", style="br.orange", max_width=50)
        table.add_column("Category", style="br.pink")
        table.add_column("Type", style="dim")
        table.add_column("Size", style="br.blue", justify="right")
        table.add_column("Modified", style="dim")
        
        for name, cat, ftype, size, modified in c.fetchall():
            size_str = f"{size//1024}K" if size > 1024 else f"{size}B" if size else "-"
            table.add_row(name[:50], cat, ftype, size_str, (modified or "")[:10])
    
    elif resource == "agents":
        c.execute("SELECT name, model, system_prompt FROM agents ORDER BY name")
        
        table = Table(title="Agents (Modelfiles)", show_header=True)
        table.add_column("Name", style="br.orange")
        table.add_column("Model", style="br.pink")
        table.add_column("System Prompt", style="dim", max_width=60)
        
        for name, model, prompt in c.fetchall():
            table.add_row(name, model or "-", (prompt or "")[:60])
    
    elif resource == "scripts":
        c.execute("SELECT name, category, description, size FROM local_files WHERE filetype = 'script' ORDER BY modified DESC")
        
        table = Table(title="Shell Scripts", show_header=True)
        table.add_column("Name", style="br.orange", max_width=50)
        table.add_column("Category", style="br.pink")
        table.add_column("Description", style="dim", max_width=40)
        table.add_column("Size", style="br.blue", justify="right")
        
        for name, cat, desc, size in c.fetchall():
            size_str = f"{size//1024}K" if size > 1024 else f"{size}B"
            table.add_row(name[:50], cat, (desc or "")[:40], size_str)
    
    elif resource == "dashboards":
        c.execute("SELECT name, filetype, description, modified FROM local_files WHERE category = 'DASHBOARDS' ORDER BY modified DESC")
        
        table = Table(title="Dashboards", show_header=True)
        table.add_column("Name", style="br.orange", max_width=50)
        table.add_column("Type", style="br.pink")
        table.add_column("Description", style="dim", max_width=40)
        table.add_column("Modified", style="br.blue")
        
        for name, ftype, desc, modified in c.fetchall():
            table.add_row(name[:50], ftype, (desc or "")[:40], (modified or "")[:10])
    
    elif resource == "kv":
        c.execute("SELECT title, id FROM kv_namespaces ORDER BY title")
        
        table = Table(title="KV Namespaces", show_header=True)
        table.add_column("Title", style="br.orange")
        table.add_column("ID", style="dim")
        
        for title, id_ in c.fetchall():
            table.add_row(title, id_[:20] + "..." if len(id_) > 20 else id_)
    
    elif resource == "d1":
        c.execute("SELECT name, id, created_at FROM d1_databases ORDER BY name")
        
        table = Table(title="D1 Databases", show_header=True)
        table.add_column("Name", style="br.orange")
        table.add_column("ID", style="dim")
        table.add_column("Created", style="br.blue")
        
        for name, id_, created in c.fetchall():
            table.add_row(name, id_[:20] + "...", (created or "")[:10])
    
    elif resource == "r2":
        c.execute("SELECT name, creation_date FROM r2_buckets ORDER BY name")
        
        table = Table(title="R2 Buckets", show_header=True)
        table.add_column("Name", style="br.orange")
        table.add_column("Created", style="br.blue")
        
        for name, created in c.fetchall():
            table.add_row(name, (created or "")[:10])
    
    else:
        console.print(f"[red]Unknown resource: {resource}[/]")
        console.print("[dim]Available: local, files, agents, scripts, dashboards, repos, kv, d1, r2[/]")
        return
    
    conn.close()
    console.print(table)

def main():
    """CLI entry point."""
    import sys
    
    args = sys.argv[1:]
    
    if not args:
        cmd_index(["all"])
        return
    
    cmd = args[0]
    
    if cmd == "search" and len(args) > 1:
        cmd_search(" ".join(args[1:]))
    elif cmd == "status":
        cmd_status()
    elif cmd == "list" and len(args) > 1:
        filter_class = args[2] if len(args) > 2 else None
        cmd_list(args[1], filter_class)
    elif cmd == "help" or cmd == "-h" or cmd == "--help":
        console.print("""
[br.orange]lucidia index[/] - Index and search BlackRoad ecosystem

[bold]Commands:[/]
  lucidia index              Index everything (local files, repos, kv, d1, r2)
  lucidia index local        Index only local BlackRoad files
  lucidia index github       Index only GitHub repos
  lucidia index kv           Index only KV namespaces
  lucidia index d1           Index only D1 databases
  lucidia index r2           Index only R2 buckets

  lucidia index search <q>   Search indexed resources
  lucidia index status       Show index stats
  
  lucidia index list local   List local files
  lucidia index list agents  List all Ollama agents
  lucidia index list repos   List all repos
  lucidia index list kv      List KV namespaces
  lucidia index list d1      List D1 databases
  lucidia index list r2      List R2 buckets

[dim]~/.lucidia/index/blackroad.db stores the search index[/]
""")
    else:
        cmd_index(args)

if __name__ == "__main__":
    main()
