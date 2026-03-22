"""Web - Browser with URL bar + WebEngine renderer"""

from textual.app import ComposeResult
from textual.containers import Vertical, Horizontal
from textual.widgets import Button, Input, RichLog

from .web_engine import WebEngine


class WebTab(Vertical):
    """Web browser with URL bar + Rich-rendered content pane"""

    DEFAULT_CSS = """
    WebTab {
        height: 100%;
    }
    WebTab > .url-bar {
        height: 3;
        border-bottom: solid gray;
    }
    WebTab > .url-bar > Input {
        width: 1fr;
    }
    WebTab > .web-content {
        height: 1fr;
        padding: 1;
        background: #111;
    }
    """

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.engine = WebEngine()

    def compose(self) -> ComposeResult:
        yield Horizontal(
            Button("←", id="btn-back"),
            Button("⟳", id="btn-refresh"),
            Input(placeholder="Enter URL or search query...", id="url-input", value="https://"),
            Button("Go", id="btn-go", variant="primary"),
            classes="url-bar",
        )
        yield RichLog(id="web-content", wrap=True, markup=True, classes="web-content")

    def on_mount(self) -> None:
        content = self.query_one("#web-content", RichLog)
        content.write("[bold]Lucidia Web Browser[/bold]")
        content.write("\nEnter a URL and press Go or Enter.")
        content.write("\n[dim]Tip: prefix with 'search ' to DuckDuckGo-search[/dim]")

    def on_input_submitted(self, event: Input.Submitted) -> None:
        if event.input.id == "url-input":
            self.navigate(event.value)

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-go":
            self.navigate(self.query_one("#url-input", Input).value)
        elif event.button.id == "btn-refresh" and self.engine.current_url:
            self._render(*self.engine.fetch(self.engine.current_url))
        elif event.button.id == "btn-back":
            self._render(*self.engine.back())

    def navigate(self, value: str) -> None:
        value = value.strip()
        if not value or value == "https://":
            return
        content = self.query_one("#web-content", RichLog)
        content.clear()
        content.write("[dim]Loading…[/dim]\n")
        if value.startswith("search "):
            text, links = self.engine.search(value[7:])
        else:
            text, links = self.engine.fetch(value)
        # Update URL bar to reflect resolved URL
        self.query_one("#url-input", Input).value = self.engine.current_url or value
        self._render(text, links)

    def _render(self, text: str, links: list) -> None:
        content = self.query_one("#web-content", RichLog)
        content.clear()
        content.write(text)
        if links:
            content.write(f"\n[dim]{len(links)} links — follow with: go [n][/dim]")
