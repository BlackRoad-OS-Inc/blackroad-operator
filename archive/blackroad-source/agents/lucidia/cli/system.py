"""
LUCIDIA VFS & PROCESS MANAGER
"""
import os
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

VFS_ROOT = Path.home() / ".lucidia" / "vfs"


class VirtualFS:
    def __init__(self):
        self.cwd = "/"
        VFS_ROOT.mkdir(parents=True, exist_ok=True)
    
    def _resolve(self, path: str) -> Path:
        if path.startswith('/'):
            rel = path[1:]
        else:
            rel = (self.cwd.lstrip('/') + '/' + path).lstrip('/')
        
        parts = []
        for p in rel.split('/'):
            if p == '..':
                if parts:
                    parts.pop()
            elif p and p != '.':
                parts.append(p)
        return VFS_ROOT / '/'.join(parts)
    
    def pwd(self) -> str:
        return self.cwd
    
    def cd(self, path: str) -> str:
        target = self._resolve(path)
        if target.is_dir():
            rel = str(target.relative_to(VFS_ROOT))
            self.cwd = '/' if rel == '.' else '/' + rel
            return self.cwd
        return f"Not a directory: {path}"
    
    def ls(self, path: str = ".") -> List[str]:
        target = self._resolve(path)
        if not target.exists():
            return []
        if target.is_file():
            return [target.name]
        return sorted([f"{p.name}/" if p.is_dir() else p.name for p in target.iterdir()])
    
    def mkdir(self, path: str) -> str:
        target = self._resolve(path)
        target.mkdir(parents=True, exist_ok=True)
        return f"Created: {path}"
    
    def touch(self, path: str) -> str:
        target = self._resolve(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.touch()
        return f"Created: {path}"
    
    def cat(self, path: str) -> str:
        target = self._resolve(path)
        if target.is_file():
            return target.read_text()
        return f"Not a file: {path}"
    
    def write(self, path: str, content: str) -> str:
        target = self._resolve(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content)
        return f"Wrote: {path}"
    
    def rm(self, path: str) -> str:
        target = self._resolve(path)
        if target.is_file():
            target.unlink()
            return f"Removed: {path}"
        elif target.is_dir():
            import shutil
            shutil.rmtree(target)
            return f"Removed: {path}"
        return f"Not found: {path}"


class ProcessManager:
    def __init__(self):
        self.processes: Dict[int, Dict[str, Any]] = {}
        self.next_pid = 1
    
    def spawn(self, name: str) -> int:
        pid = self.next_pid
        self.next_pid += 1
        self.processes[pid] = {
            "name": name,
            "started": datetime.now(),
            "status": "running"
        }
        return pid
    
    def kill(self, pid: int) -> bool:
        if pid in self.processes:
            del self.processes[pid]
            return True
        return False
    
    def ps(self) -> List[Dict[str, Any]]:
        result = []
        now = datetime.now()
        for pid, proc in self.processes.items():
            uptime = now - proc["started"]
            result.append({
                "pid": pid,
                "name": proc["name"],
                "status": proc["status"],
                "uptime": f"{int(uptime.total_seconds())}s"
            })
        return result


# Simple apps
APPS = {
    "calc": "Calculator - type math expressions",
    "btc": "Bitcoin price",
    "fortune": "Random fortune",
    "time": "Current time",
    "ps": "List processes",
    "whoami": "Current user",
    "help": "Show help"
}
