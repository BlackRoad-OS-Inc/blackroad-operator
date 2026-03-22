"""
LUCIDIA VIRTUAL FILESYSTEM
Sandboxed filesystem with persistence
⬥ BlackRoad OS, Inc.
"""

from pathlib import Path
from datetime import datetime


class VirtualFS:
    """Virtual filesystem rooted at ~/.lucidia/vfs"""
    
    DEFAULT_DIRS = [
        "/home/lucidia",
        "/home/lucidia/Documents",
        "/home/lucidia/Projects", 
        "/home/lucidia/Downloads",
        "/var/log",
        "/etc/lucidia",
        "/tmp"
    ]
    
    def __init__(self, root="~/.lucidia/vfs"):
        self.root = Path(root).expanduser()
        self.root.mkdir(parents=True, exist_ok=True)
        self.cwd = Path("/home/lucidia")
        self._init_structure()

    def _init_structure(self):
        for d in self.DEFAULT_DIRS:
            (self.root / d.lstrip('/')).mkdir(parents=True, exist_ok=True)

    def _real_path(self, path):
        """Convert virtual path to real path"""
        if path.startswith('/'):
            return self.root / path.lstrip('/')
        return self.root / str(self.cwd).lstrip('/') / path

    def ls(self, path="."):
        """List directory contents"""
        rp = self._real_path(path)
        if rp.is_dir():
            return sorted([f.name + ('/' if f.is_dir() else '') for f in rp.iterdir()])
        return []

    def cd(self, path):
        """Change directory"""
        if path == "~":
            self.cwd = Path("/home/lucidia")
        elif path == "..":
            self.cwd = self.cwd.parent if self.cwd != Path("/") else self.cwd
        elif path.startswith("/"):
            self.cwd = Path(path)
        else:
            self.cwd = self.cwd / path
        return str(self.cwd)

    def pwd(self):
        """Print working directory"""
        return str(self.cwd)

    def cat(self, path):
        """Read file contents"""
        rp = self._real_path(path)
        if rp.is_file():
            return rp.read_text()
        return f"cat: {path}: No such file"

    def write(self, path, content):
        """Write content to file"""
        rp = self._real_path(path)
        rp.parent.mkdir(parents=True, exist_ok=True)
        rp.write_text(content)
        return f"Wrote {len(content)} bytes to {path}"

    def append(self, path, content):
        """Append content to file"""
        rp = self._real_path(path)
        rp.parent.mkdir(parents=True, exist_ok=True)
        with open(rp, 'a') as f:
            f.write(content)
        return f"Appended {len(content)} bytes to {path}"

    def mkdir(self, path):
        """Create directory"""
        self._real_path(path).mkdir(parents=True, exist_ok=True)
        return f"Created {path}"

    def rm(self, path):
        """Remove file"""
        rp = self._real_path(path)
        if rp.is_file():
            rp.unlink()
            return f"Removed {path}"
        return f"rm: {path}: Not a file (use rmdir for directories)"

    def rmdir(self, path):
        """Remove empty directory"""
        rp = self._real_path(path)
        if rp.is_dir():
            try:
                rp.rmdir()
                return f"Removed directory {path}"
            except OSError:
                return f"rmdir: {path}: Directory not empty"
        return f"rmdir: {path}: Not a directory"

    def exists(self, path):
        """Check if path exists"""
        return self._real_path(path).exists()

    def stat(self, path):
        """Get file/dir info"""
        rp = self._real_path(path)
        if rp.exists():
            st = rp.stat()
            return {
                "size": st.st_size,
                "modified": datetime.fromtimestamp(st.st_mtime).isoformat(),
                "is_dir": rp.is_dir()
            }
        return None


# Test if run directly
if __name__ == "__main__":
    vfs = VirtualFS()
    print(f"PWD: {vfs.pwd()}")
    print(f"LS: {vfs.ls()}")
    vfs.write("test.txt", "Hello from Lucidia!")
    print(f"CAT: {vfs.cat('test.txt')}")
