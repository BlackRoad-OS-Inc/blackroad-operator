"""Shell - Terminal with output/input split"""

from textual.app import ComposeResult
from textual.containers import Vertical
from textual.widgets import Static, Input, RichLog
import subprocess
import os

class ShellTab(Vertical):
    """Shell with output log + input"""
    
    DEFAULT_CSS = """
    ShellTab {
        height: 100%;
    }
    ShellTab > RichLog {
        height: 1fr;
        border: solid gray;
        background: #111;
    }
    ShellTab > .shell-input-row {
        height: 3;
        padding: 0 1;
    }
    ShellTab > .shell-input-row > Static {
        width: auto;
        padding-top: 1;
    }
    ShellTab > .shell-input-row > Input {
        width: 1fr;
    }
    """
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.cwd = os.path.expanduser("~")
        self.history = []
        self.history_idx = 0
    
    def compose(self) -> ComposeResult:
        yield RichLog(id="shell-output", wrap=True, highlight=True, markup=True)
        from textual.containers import Horizontal
        yield Horizontal(
            Static("$ ", classes="shell-prompt"),
            Input(placeholder="Enter command...", id="shell-input"),
            classes="shell-input-row"
        )
    
    def on_mount(self) -> None:
        log = self.query_one("#shell-output", RichLog)
        log.write("[bold]Lucidia Shell v0.7[/bold]")
        log.write(f"Working directory: {self.cwd}")
        log.write("Type 'help' for commands.\n")
    
    def on_input_submitted(self, event: Input.Submitted) -> None:
        if event.input.id != "shell-input":
            return
        
        cmd = event.value.strip()
        event.input.value = ""
        
        if not cmd:
            return
        
        self.history.append(cmd)
        self.history_idx = len(self.history)
        
        log = self.query_one("#shell-output", RichLog)
        log.write(f"[dim]${self.cwd}>[/dim] {cmd}")
        
        # Built-in commands
        if cmd == "clear":
            log.clear()
            return
        elif cmd == "help":
            log.write("  clear, cd, pwd, ls, cat, history, exit")
            return
        elif cmd == "pwd":
            log.write(self.cwd)
            return
        elif cmd.startswith("cd "):
            path = cmd[3:].strip()
            new_path = os.path.join(self.cwd, path) if not path.startswith("/") else path
            new_path = os.path.abspath(os.path.expanduser(new_path))
            if os.path.isdir(new_path):
                self.cwd = new_path
                log.write(f"Changed to: {self.cwd}")
            else:
                log.write(f"[red]Not a directory: {new_path}[/red]")
            return
        elif cmd == "history":
            for i, h in enumerate(self.history[-10:]):
                log.write(f"  {i+1}. {h}")
            return
        
        # External command
        try:
            result = subprocess.run(
                cmd, shell=True, capture_output=True, text=True,
                cwd=self.cwd, timeout=10
            )
            if result.stdout:
                log.write(result.stdout.rstrip())
            if result.stderr:
                log.write(f"[red]{result.stderr.rstrip()}[/red]")
        except subprocess.TimeoutExpired:
            log.write("[red]Command timed out[/red]")
        except Exception as e:
            log.write(f"[red]Error: {e}[/red]")
