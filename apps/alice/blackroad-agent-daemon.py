#!/usr/bin/env python3
"""BlackRoad Agent Daemon — runs on Alice Pi
Lightweight HTTP API for remote shell, file ops, git, and code search.
Called by chat.blackroad.io Worker to provide Claude Code-like capabilities.
Usage: python3 blackroad-agent-daemon.py [port]
"""

import http.server
import json
import subprocess
import os
import sys
import glob as globmod
import traceback
from urllib.parse import urlparse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
SANDBOX_ROOT = os.path.expanduser("~/projects")
MAX_OUTPUT = 16000
TIMEOUT = 30

os.makedirs(SANDBOX_ROOT, exist_ok=True)

class AgentHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write(f"[agent] {fmt % args}\n")

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)

    def _body(self):
        length = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(length)) if length else {}

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/health":
            self._json(200, {"status": "ok", "node": "alice", "pid": os.getpid(), "sandbox": SANDBOX_ROOT})
        elif path == "/projects":
            projects = []
            for root, dirs, files in os.walk(SANDBOX_ROOT):
                if ".git" in dirs:
                    projects.append(root)
                    dirs.remove(".git")  # don't recurse into .git
                if len(projects) >= 50:
                    break
            self._json(200, {"projects": projects})
        else:
            self._json(404, {"error": "unknown endpoint"})

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            body = self._body()
        except:
            self._json(400, {"error": "invalid JSON"})
            return

        try:
            if path == "/exec":
                self._handle_exec(body)
            elif path == "/file/read":
                self._handle_file_read(body)
            elif path == "/file/write":
                self._handle_file_write(body)
            elif path == "/file/edit":
                self._handle_file_edit(body)
            elif path == "/search":
                self._handle_search(body)
            elif path == "/glob":
                self._handle_glob(body)
            elif path == "/git":
                self._handle_git(body)
            elif path == "/agent":
                self._handle_agent(body)
            else:
                self._json(404, {"error": "unknown endpoint"})
        except Exception as e:
            self._json(500, {"error": str(e), "trace": traceback.format_exc()})

    def _run(self, cmd, cwd=None, timeout=TIMEOUT):
        """Run a command and return (output, exit_code)"""
        try:
            r = subprocess.run(cmd, shell=True, capture_output=True, text=True,
                             timeout=timeout, cwd=cwd)
            output = r.stdout + r.stderr
            if len(output) > MAX_OUTPUT:
                output = output[:MAX_OUTPUT] + "\n... (truncated)"
            return output, r.returncode
        except subprocess.TimeoutExpired:
            return f"Command timed out after {timeout}s", 124
        except Exception as e:
            return str(e), 1

    def _handle_exec(self, body):
        """Execute shell command or code snippet"""
        cmd = body.get("command", "")
        lang = body.get("language", "bash")
        code = body.get("code", "")
        timeout = min(body.get("timeout", TIMEOUT), 60)
        cwd = body.get("cwd", SANDBOX_ROOT)

        if cmd:
            output, exit_code = self._run(cmd, cwd=cwd, timeout=timeout)
        elif code:
            if lang in ("python", "python3"):
                output, exit_code = self._run(f"python3 -c {repr(code)}", cwd=cwd, timeout=timeout)
            elif lang in ("js", "javascript", "node"):
                output, exit_code = self._run(f"node -e {repr(code)}", cwd=cwd, timeout=timeout)
            elif lang in ("bash", "sh"):
                output, exit_code = self._run(code, cwd=cwd, timeout=timeout)
            else:
                self._json(400, {"error": f"Unsupported language: {lang}"})
                return
        else:
            self._json(400, {"error": "No command or code provided"})
            return

        self._json(200, {"output": output, "exitCode": exit_code, "language": lang})

    def _handle_file_read(self, body):
        """Read a file or list a directory"""
        filepath = body.get("path", "")
        if not filepath:
            self._json(400, {"error": "No path provided"})
            return

        filepath = os.path.expanduser(filepath)
        if not os.path.exists(filepath):
            self._json(404, {"error": f"Not found: {filepath}"})
            return

        if os.path.isdir(filepath):
            entries = []
            for name in sorted(os.listdir(filepath))[:100]:
                full = os.path.join(filepath, name)
                entry = {"name": name, "type": "dir" if os.path.isdir(full) else "file"}
                if not os.path.isdir(full):
                    entry["size"] = os.path.getsize(full)
                entries.append(entry)
            self._json(200, {"type": "directory", "path": filepath, "entries": entries})
        else:
            try:
                with open(filepath, "r") as f:
                    content = f.read(100000)
                lines = content.count("\n") + 1
                size = os.path.getsize(filepath)
                self._json(200, {"type": "file", "path": filepath, "content": content, "lines": lines, "size": size})
            except UnicodeDecodeError:
                self._json(200, {"type": "binary", "path": filepath, "size": os.path.getsize(filepath)})

    def _handle_file_write(self, body):
        """Write content to a file"""
        filepath = body.get("path", "")
        content = body.get("content", "")
        if not filepath:
            self._json(400, {"error": "No path provided"})
            return
        filepath = os.path.expanduser(filepath)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w") as f:
            f.write(content)
        self._json(200, {"written": filepath, "size": len(content)})

    def _handle_file_edit(self, body):
        """Edit a file: find and replace"""
        filepath = body.get("path", "")
        old = body.get("old_string", "")
        new = body.get("new_string", "")
        if not filepath or not old:
            self._json(400, {"error": "Need path, old_string, new_string"})
            return
        filepath = os.path.expanduser(filepath)
        if not os.path.exists(filepath):
            self._json(404, {"error": f"Not found: {filepath}"})
            return
        with open(filepath, "r") as f:
            content = f.read()
        if old not in content:
            self._json(400, {"error": "old_string not found in file"})
            return
        count = content.count(old)
        if body.get("replace_all"):
            content = content.replace(old, new)
        else:
            content = content.replace(old, new, 1)
        with open(filepath, "w") as f:
            f.write(content)
        self._json(200, {"edited": filepath, "replacements": count if body.get("replace_all") else 1})

    def _handle_search(self, body):
        """Search file contents (like grep)"""
        pattern = body.get("pattern", "")
        directory = body.get("directory", SANDBOX_ROOT)
        max_results = min(body.get("max", 30), 100)
        if not pattern:
            self._json(400, {"error": "No pattern provided"})
            return
        output, _ = self._run(
            f"grep -rn --include='*.py' --include='*.js' --include='*.ts' --include='*.sh' "
            f"--include='*.go' --include='*.rs' --include='*.md' --include='*.json' "
            f"--include='*.yaml' --include='*.yml' --include='*.toml' --include='*.html' "
            f"--include='*.css' {repr(pattern)} {repr(directory)} | head -{max_results}",
            timeout=10
        )
        matches = [l for l in output.strip().split("\n") if l]
        self._json(200, {"pattern": pattern, "directory": directory, "count": len(matches), "matches": matches})

    def _handle_glob(self, body):
        """Find files by pattern"""
        pattern = body.get("pattern", "")
        directory = body.get("directory", SANDBOX_ROOT)
        if not pattern:
            self._json(400, {"error": "No pattern provided"})
            return
        full_pattern = os.path.join(directory, "**", pattern)
        files = sorted(globmod.glob(full_pattern, recursive=True))[:50]
        self._json(200, {"pattern": pattern, "files": files})

    def _handle_git(self, body):
        """Git operations"""
        repo = body.get("repo", "")
        op = body.get("op", "status")
        args = body.get("args", "")

        if not repo:
            self._json(400, {"error": "No repo path provided"})
            return

        repo = os.path.expanduser(repo)

        # Clone is special — doesn't need existing repo
        if op == "clone":
            output, code = self._run(f"git clone {args}", cwd=SANDBOX_ROOT, timeout=60)
            self._json(200, {"op": "clone", "output": output, "exitCode": code})
            return

        if not os.path.isdir(os.path.join(repo, ".git")):
            self._json(400, {"error": f"Not a git repo: {repo}"})
            return

        git_commands = {
            "status": "git status --short",
            "log": "git log --oneline -20",
            "diff": "git diff | head -300",
            "diff-staged": "git diff --staged | head -300",
            "branch": "git branch -a",
            "add": f"git add {args}",
            "commit": f"git commit -m {repr(args)}",
            "pull": "git pull",
            "push": "git push",
            "stash": "git stash",
            "stash-pop": "git stash pop",
            "remote": "git remote -v",
            "blame": f"git blame {args} | head -50",
        }

        cmd = git_commands.get(op)
        if not cmd:
            self._json(400, {"error": f"Unknown git op: {op}. Available: {', '.join(git_commands.keys())}"})
            return

        output, code = self._run(cmd, cwd=repo)
        self._json(200, {"op": op, "repo": repo, "output": output, "exitCode": code})

    def _handle_agent(self, body):
        """Agentic loop: AI plans steps, executes them sequentially"""
        task = body.get("task", "")
        if not task:
            self._json(400, {"error": "No task provided"})
            return
        # Just returns the task for now — the Worker's AI will plan and call individual endpoints
        self._json(200, {"task": task, "status": "ready", "endpoints": [
            "POST /exec — run shell/code",
            "POST /file/read — read files",
            "POST /file/write — write files",
            "POST /file/edit — find & replace",
            "POST /search — grep codebase",
            "POST /glob — find files",
            "POST /git — git operations",
            "GET /projects — list git repos",
        ]})


if __name__ == "__main__":
    server = http.server.HTTPServer(("0.0.0.0", PORT), AgentHandler)
    print(f"[agent] BlackRoad Agent Daemon on port {PORT}")
    print(f"[agent] Sandbox: {SANDBOX_ROOT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[agent] Shutting down")
        server.shutdown()
