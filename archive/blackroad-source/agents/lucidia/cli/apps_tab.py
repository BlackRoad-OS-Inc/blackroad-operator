"""
LUCIDIA APPS TAB
Mini application launcher
⬥ BlackRoad OS, Inc.
"""

from textual.app import ComposeResult
from textual.containers import Vertical, Horizontal
from textual.widgets import Static, Input, RichLog

from .apps import APPS, Calculator, Weather


class AppsTab(Vertical):
    """Mini app launcher — type an app name to run it"""

    DEFAULT_CSS = """
    AppsTab {
        height: 100%;
    }
    AppsTab > .apps-help {
        height: auto;
        border-bottom: solid gray;
        padding: 1;
        background: #1a1a1a;
    }
    AppsTab > .apps-output {
        height: 1fr;
        border: solid gray;
        background: #111;
        padding: 0 1;
    }
    AppsTab > .apps-input-row {
        height: 3;
        padding: 0 1;
    }
    AppsTab > .apps-input-row > Static {
        width: auto;
        padding-top: 1;
    }
    AppsTab > .apps-input-row > Input {
        width: 1fr;
    }
    """

    HELP_TEXT = (
        "[bold]Apps:[/bold]  "
        "[cyan]calc <expr>[/]  [cyan]btc[/]  [cyan]eth[/]  "
        "[cyan]weather [city][/]  [cyan]fortune[/]  "
        "[cyan]time[/]  [cyan]date[/]  [cyan]unix[/]  "
        "[cyan]whoami[/]  [cyan]neofetch[/]"
    )

    def compose(self) -> ComposeResult:
        yield Static(self.HELP_TEXT, classes="apps-help", markup=True)
        yield RichLog(id="apps-output", wrap=True, markup=True, classes="apps-output")
        yield Horizontal(
            Static("> ", classes="apps-prompt"),
            Input(placeholder="Run an app (e.g. calc 2+2, fortune, weather London)...", id="apps-input"),
            classes="apps-input-row",
        )

    def on_mount(self) -> None:
        log = self.query_one("#apps-output", RichLog)
        log.write("[bold]Lucidia Apps v0.7[/bold]")
        log.write("Type an app name to run it.\n")

    def on_input_submitted(self, event: Input.Submitted) -> None:
        if event.input.id != "apps-input":
            return

        cmd = event.value.strip()
        event.input.value = ""

        if not cmd:
            return

        log = self.query_one("#apps-output", RichLog)
        log.write(f"[dim]>[/dim] {cmd}")

        parts = cmd.split(None, 1)
        name = parts[0].lower()
        arg = parts[1] if len(parts) > 1 else None

        if name == "calc":
            result = Calculator.eval(arg or "")
            log.write(f"  {result}")
        elif name == "weather":
            result = Weather.get(arg or "Minneapolis")
            log.write(f"  {result}")
        elif name in APPS:
            result = APPS[name]()
            if isinstance(result, dict):
                for k, v in result.items():
                    log.write(f"  [cyan]{k}:[/] {v}")
            else:
                log.write(f"  {result}")
        else:
            log.write(f"  [red]Unknown app:[/] {name}")
            log.write(f"  [dim]{self.HELP_TEXT}[/]")
