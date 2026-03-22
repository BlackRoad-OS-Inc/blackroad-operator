"""API - HTTP request tester with builder + response"""

from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical
from textual.widgets import Static, Label, Button, Input, TextArea, Select, RichLog
import subprocess
import json

class APITab(Horizontal):
    """API tester with request builder + response panel"""
    
    DEFAULT_CSS = """
    APITab {
        height: 100%;
    }
    APITab > .api-request {
        width: 1fr;
        border-right: solid gray;
        padding: 1;
    }
    APITab > .api-request > .request-row {
        height: 3;
        margin-bottom: 1;
    }
    APITab > .api-request > TextArea {
        height: 10;
        margin-bottom: 1;
    }
    APITab > .api-response {
        width: 1fr;
        padding: 1;
    }
    APITab > .api-response > .response-header {
        height: 3;
        border-bottom: solid gray;
        margin-bottom: 1;
    }
    APITab > .api-response > RichLog {
        height: 1fr;
        background: #111;
    }
    """
    
    def compose(self) -> ComposeResult:
        yield Vertical(
            Label("🔌 REQUEST", classes="section-header"),
            Horizontal(
                Select(
                    [("GET", "GET"), ("POST", "POST"), ("PUT", "PUT"), ("DELETE", "DELETE")],
                    value="GET",
                    id="method-select"
                ),
                Input(placeholder="URL...", id="url-input", value="https://httpbin.org/get"),
                classes="request-row"
            ),
            Label("Headers (JSON):"),
            TextArea(id="headers-input", language="json"),
            Label("Body (JSON):"),
            TextArea(id="body-input", language="json"),
            Button("▶ Send Request", id="btn-send", variant="primary"),
            classes="api-request"
        )
        yield Vertical(
            Static("Response will appear here", id="response-header", classes="response-header"),
            RichLog(id="response-log", wrap=True, markup=True),
            classes="api-response"
        )
    
    def on_mount(self) -> None:
        self.query_one("#headers-input", TextArea).text = '{"Content-Type": "application/json"}'
        self.query_one("#body-input", TextArea).text = '{}'
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-send":
            self.send_request()
    
    def send_request(self) -> None:
        method = self.query_one("#method-select", Select).value
        url = self.query_one("#url-input", Input).value.strip()
        headers_text = self.query_one("#headers-input", TextArea).text
        body_text = self.query_one("#body-input", TextArea).text
        
        header = self.query_one("#response-header", Static)
        log = self.query_one("#response-log", RichLog)
        log.clear()
        
        if not url:
            header.update("[red]Please enter a URL[/red]")
            return
        
        header.update(f"[yellow]Sending {method} to {url}...[/yellow]")
        
        # Build curl command
        cmd = ["curl", "-s", "-w", "\n%{http_code}", "-X", method]
        
        # Add headers
        try:
            headers = json.loads(headers_text) if headers_text.strip() else {}
            for key, val in headers.items():
                cmd.extend(["-H", f"{key}: {val}"])
        except json.JSONDecodeError:
            header.update("[red]Invalid headers JSON[/red]")
            return
        
        # Add body for POST/PUT
        if method in ["POST", "PUT"] and body_text.strip():
            try:
                json.loads(body_text)  # Validate
                cmd.extend(["-d", body_text])
            except json.JSONDecodeError:
                header.update("[red]Invalid body JSON[/red]")
                return
        
        cmd.append(url)
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            output = result.stdout
            
            # Split response and status code
            lines = output.rsplit("\n", 1)
            body = lines[0] if len(lines) > 1 else output
            status = lines[-1] if len(lines) > 1 else "???"
            
            # Color code status
            if status.startswith("2"):
                status_color = "green"
            elif status.startswith("3"):
                status_color = "yellow"
            else:
                status_color = "red"
            
            header.update(f"[{status_color}]Status: {status}[/{status_color}]")
            
            # Try to pretty print JSON
            try:
                parsed = json.loads(body)
                log.write(json.dumps(parsed, indent=2))
            except:
                log.write(body)
        
        except subprocess.TimeoutExpired:
            header.update("[red]Request timed out[/red]")
        except Exception as e:
            header.update(f"[red]Error: {e}[/red]")
