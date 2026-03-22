"""
Lucidia - BlackRoad OS Native AI.

Lucidia is BlackRoad's sovereign AI interface. It routes to various
backends (Ollama, Copilot, external APIs) but the IDENTITY is Lucidia.

Architecture:
  Lucidia (this) = The mind, personality, router
  Backends       = Pluggable inference engines (local-first)

Priority order:
  1. Local Ollama (cecilia/lucidia Pi with Hailo-8)
  2. Local Ollama (any available node)
  3. GitHub Copilot (if authenticated)
  4. External API fallback

Lucidia is NOT a wrapper around Claude. Lucidia IS the AI.
"""

import os
import sys
import subprocess
import threading
import json
import time
from datetime import datetime
from dataclasses import dataclass
from typing import Callable, List, Dict, Any, Tuple

# Security module (sovereign protection)
try:
    from security import SecurityContext, verify_backend_host
    SECURITY_ENABLED = True
except ImportError:
    SECURITY_ENABLED = False
    SecurityContext = None

# Personality module (sovereign identity)
try:
    from personality import LucidiaPersona, classify_query
    PERSONALITY_ENABLED = True
except ImportError:
    PERSONALITY_ENABLED = False
    LucidiaPersona = None

# Offline module (cache and local commands)
try:
    from offline import OfflineHandler
    OFFLINE_ENABLED = True
except ImportError:
    OFFLINE_ENABLED = False
    OfflineHandler = None

# Tools module (sovereign actions)
try:
    from tools import ToolExecutor
    TOOLS_ENABLED = True
except ImportError:
    TOOLS_ENABLED = False
    ToolExecutor = None

# Agent module (autonomous execution)
try:
    from agent import InteractiveAgent
    AGENT_ENABLED = True
except ImportError:
    AGENT_ENABLED = False
    InteractiveAgent = None

# Context module (intelligent context injection)
try:
    from context import ContextManager
    CONTEXT_ENABLED = True
except ImportError:
    CONTEXT_ENABLED = False
    ContextManager = None

# ═══════════════════════════════════════════════════════════════════════════════
# LUCIDIA BRANDING
# ═══════════════════════════════════════════════════════════════════════════════

LOGO_LARGE = """\
  ██╗     ██╗   ██╗ ██████╗██╗██████╗ ██╗ █████╗
  ██║     ██║   ██║██╔════╝██║██╔══██╗██║██╔══██╗
  ██║     ██║   ██║██║     ██║██║  ██║██║███████║
  ██║     ██║   ██║██║     ██║██║  ██║██║██╔══██║
  ███████╗╚██████╔╝╚██████╗██║██████╔╝██║██║  ██║
  ╚══════╝ ╚═════╝  ╚═════╝╚═╝╚═════╝ ╚═╝╚═╝  ╚═╝"""

ROBOT_FACE = """\
   >─╮
    ▣═▣
    ● ●"""

ROBOT_FULL = """\
     ╭─╮ ╭─╮
     ╰─╯ ╰─╯
       ▒▔▔▒
     ╭─────╮
     │ ░░░ │
     ╰─┬─┬─╯
       │ │
      ╱ | ╲"""

ROBOT_MINI = """\
   >─╮
    ▣═▣
   - - -
    ● ●"""

LAYERS_BOOT = """\
  + Layer 3 (agents/system) loaded
  + Layer 4 (deploy/orchestration) loaded
  + Layer 5 (branches/environments) loaded
  + Layer 6 (Lucidia core/memory) loaded
  + Layer 7 (orchestration) loaded
  + Layer 8 (network/API) loaded"""

# Box drawing
def box(content: List[str], width: int = 80, title: str = "") -> List[str]:
    """Draw a box around content."""
    lines = []
    inner = width - 2

    # Top
    if title:
        pad = inner - len(title) - 2
        lines.append(f"╭─ {title} " + "─" * pad + "╮")
    else:
        lines.append("╭" + "─" * inner + "╮")

    # Content
    for line in content:
        if len(line) > inner:
            line = line[:inner-1] + "…"
        lines.append("│" + line + " " * (inner - len(line)) + "│")

    # Bottom
    lines.append("╰" + "─" * inner + "╯")

    return lines


def header_box(version: str = "0.1.0", model: str = "Lucidia", directory: str = "~") -> List[str]:
    """Create the main header box."""
    content = [
        f"         >_ Road Code (v{version})",
        "",
        f"         model:     {model}        /model to change",
        f"         directory: {directory}",
    ]
    return box(content, width=56)


def welcome_screen(last_login: str = None) -> str:
    """Generate full welcome screen."""
    if not last_login:
        last_login = datetime.now().strftime("%b %d %Y %H:%M")

    lines = [
        "",
        LOGO_LARGE,
        "",
        "  BlackRoad OS, Inc. | AI-Native",
        "",
    ]

    # Robot with info
    lines.extend([
        "╭" + "─" * 46 + "╮",
        "│                                              │",
        "│   >─╮    BlackRoad OS, Inc.                  │",
        "│    ▣═▣                                       │",
        f"│    ● ●   Last Login: {last_login:<20}   │",
        "│                                              │",
        "╰" + "─" * 46 + "╯",
        "",
    ])

    # Layer boot
    lines.append("  ✓ BlackRoad CLI v3 → br-help")
    lines.extend(LAYERS_BOOT.split("\n"))
    lines.append("")

    return "\n".join(lines)


def prompt_box(model: str = "Lucidia", version: str = "0.1.0", cwd: str = "~") -> str:
    """Generate the prompt area."""
    lines = [
        "╭" + "─" * 94 + "╮",
        "│" + " " * 94 + "│",
        "│   BlackRoad OS, Inc. | AI-Native" + " " * 60 + "│",
        "│    ▣═▣  Lucidia by BlackRoad OS, Inc." + " " * 56 + "│",
        "│    ╰─     Describe a task to get started." + " " * 52 + "│",
    ]

    # Inner box
    inner = [
        f"│       ╭{'─' * 52}╮" + " " * 38 + "│",
        f"│       │         >_ Road Code (v{version})" + " " * (52 - 26 - len(version)) + "│" + " " * 38 + "│",
        "│       │" + " " * 52 + "│" + " " * 38 + "│",
        f"│       │         model:     {model}" + " " * (52 - 20 - len(model)) + "│" + " " * 38 + "│",
        f"│       │         directory: {cwd}" + " " * (52 - 22 - len(cwd)) + "│" + " " * 38 + "│",
        f"│       ╰{'─' * 52}╯" + " " * 38 + "│",
    ]
    lines.extend(inner)

    lines.extend([
        "│" + " " * 94 + "│",
        "│  Pick a model with /model. Copilot uses AI, so always check for mistakes." + " " * 19 + "│",
        "╰" + "─" * 94 + "╯",
    ])

    return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════════════════════
# BACKEND DEFINITIONS (Pluggable inference engines)
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class Backend:
    """A pluggable AI backend. Lucidia routes to these."""
    name: str
    id: str
    type: str  # ollama, copilot, api
    description: str
    command: List[str]
    priority: int = 10  # Lower = preferred (local-first)
    requires_network: bool = False

    def is_available(self) -> bool:
        """Check if this backend is currently available."""
        import shutil
        if not self.command:
            return False
        return shutil.which(self.command[0]) is not None


# Backends ordered by preference (local-first, sovereign-first)
BACKENDS = {
    # === LOCAL INFERENCE (Priority 1-3) ===
    "cecilia": Backend(
        name="Cecilia",
        id="cecilia",
        type="ollama",
        description="Hailo-8 edge AI (26 TOPS)",
        command=["ssh", "cecilia", "ollama", "run", "llama3.2"],
        priority=1,
        requires_network=False  # Local network
    ),
    "lucidia-node": Backend(
        name="Lucidia Node",
        id="lucidia-pi",
        type="ollama",
        description="Pi 5 local inference",
        command=["ssh", "lucidia", "ollama", "run", "llama3.2"],
        priority=2,
        requires_network=False
    ),
    "ollama": Backend(
        name="Ollama Local",
        id="ollama",
        type="ollama",
        description="Local LLM on this machine",
        command=["ollama", "run", "llama3.2"],
        priority=3,
        requires_network=False
    ),

    # === AUTHENTICATED SERVICES (Priority 5) ===
    "copilot": Backend(
        name="GitHub Copilot",
        id="copilot",
        type="copilot",
        description="GitHub AI (requires auth)",
        command=["gh", "copilot", "suggest", "-t", "shell"],
        priority=5,
        requires_network=True
    ),

    # === EXTERNAL APIs (Priority 10 - fallback only) ===
    "anthropic": Backend(
        name="Anthropic API",
        id="anthropic",
        type="api",
        description="External API fallback",
        command=["curl", "-X", "POST", "https://api.anthropic.com/v1/messages"],
        priority=10,
        requires_network=True
    ),
}

# Legacy alias for compatibility
MODELS = BACKENDS


def get_best_backend() -> Backend:
    """Get the best available backend (local-first)."""
    import subprocess

    # Sort by priority
    sorted_backends = sorted(BACKENDS.values(), key=lambda b: b.priority)

    for backend in sorted_backends:
        # Skip network-required backends if we prefer local
        if backend.type == "ollama":
            # Check if Ollama is reachable
            try:
                if "ssh" in backend.command:
                    # Remote Ollama - quick ping check
                    host = backend.command[1]
                    result = subprocess.run(
                        ["ssh", "-o", "ConnectTimeout=2", "-o", "BatchMode=yes", host, "echo", "ok"],
                        capture_output=True, timeout=3
                    )
                    if result.returncode == 0:
                        return backend
                else:
                    # Local Ollama
                    result = subprocess.run(["ollama", "list"], capture_output=True, timeout=2)
                    if result.returncode == 0:
                        return backend
            except:
                continue
        elif backend.type == "copilot":
            try:
                result = subprocess.run(["gh", "auth", "status"], capture_output=True, timeout=2)
                if result.returncode == 0:
                    return backend
            except:
                continue

    # Fallback to first available
    return sorted_backends[0] if sorted_backends else None


# ═══════════════════════════════════════════════════════════════════════════════
# BACKEND RUNNER (Generic inference engine)
# ═══════════════════════════════════════════════════════════════════════════════

class BackendRunner:
    """Runs any AI backend as subprocess. Lucidia routes here."""

    def __init__(self, backend: str = None, security: 'SecurityContext' = None):
        if backend and backend in BACKENDS:
            self.backend = BACKENDS[backend]
        else:
            # Auto-select best available backend
            self.backend = get_best_backend()
            if not self.backend:
                self.backend = BACKENDS.get("ollama")

        self.process: subprocess.Popen = None
        self.running = False
        self.output_buffer: List[str] = []
        self.on_output: Callable[[str], None] = None
        self.cwd = os.getcwd()

        # Security context
        self.security = security
        if SECURITY_ENABLED and not self.security:
            self.security = SecurityContext()

    def start(self) -> bool:
        """Start backend subprocess with security verification."""
        try:
            cmd = self.backend.command.copy()

            # Security: Verify backend is trusted
            if self.security:
                allowed, reason = self.security.check_backend(cmd)
                if not allowed:
                    print(f"  ✗ Security blocked: {reason}")
                    return False
                self.security.audit.log("backend_start", self.backend.name)

            self.process = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                cwd=self.cwd
            )
            self.running = True

            # Start reader thread
            self._reader = threading.Thread(target=self._read_output, daemon=True)
            self._reader.start()

            return True
        except Exception as e:
            print(f"  ✗ Backend failed: {e}")
            if self.security:
                self.security.audit.log_security("backend_error", {"error": str(e)})
            return False

    def _read_output(self):
        """Read output from backend with security filtering."""
        while self.running and self.process:
            try:
                line = self.process.stdout.readline()
                if line:
                    output = line.rstrip()

                    # Security: Filter output for secrets
                    if self.security:
                        output, warnings = self.security.filter_output(output)
                        for w in warnings:
                            print(f"  ⚠ {w}")

                    self.output_buffer.append(output)
                    if self.on_output:
                        self.on_output(output)
                elif self.process.poll() is not None:
                    self.running = False
                    break
            except:
                break

    def send(self, text: str) -> Tuple[bool, str]:
        """Send input to backend with security checks."""
        if not self.process or not self.process.stdin:
            return False, "backend not running"

        # Security: Check and sanitize input
        if self.security:
            allowed, sanitized, warning = self.security.check_input(text)
            if not allowed:
                return False, warning
            if warning:
                print(f"  ⚠ {warning}")
            text = sanitized
            self.security.audit.log_input(self.backend.name, text)

        try:
            self.process.stdin.write(text + "\n")
            self.process.stdin.flush()
            return True, ""
        except Exception as e:
            return False, str(e)

    def stop(self) -> None:
        """Stop backend subprocess."""
        if self.security:
            self.security.audit.log("backend_stop", self.backend.name if self.backend else "unknown")
        self.running = False
        if self.process:
            self.process.terminate()
            try:
                self.process.wait(timeout=2)
            except:
                self.process.kill()

    def get_output(self) -> List[str]:
        """Get and clear output buffer."""
        output = self.output_buffer.copy()
        self.output_buffer.clear()
        return output

    def get_security_status(self) -> Dict:
        """Get security status for this backend."""
        if self.security:
            return self.security.get_status()
        return {"security": "disabled"}


# Legacy alias
ClaudeWrapper = BackendRunner


# ═══════════════════════════════════════════════════════════════════════════════
# LUCIDIA SHELL (The sovereign AI interface)
# ═══════════════════════════════════════════════════════════════════════════════

class LucidiaShell:
    """
    Lucidia - BlackRoad OS Native AI Shell.

    This is THE interface. Backends are pluggable inference engines.
    Lucidia has her own personality, routes intelligently, prefers local.
    """

    def __init__(self):
        self.backend = None
        self.backend_name = None  # Will auto-select
        self.running = False
        self.history: List[str] = []
        self.cwd = os.getcwd()

        # Personality and memory
        self.persona = None
        if PERSONALITY_ENABLED:
            self.persona = LucidiaPersona()

        # Offline mode handler
        self.offline = None
        if OFFLINE_ENABLED:
            self.offline = OfflineHandler()

        # Tool executor
        self.tools = None
        if TOOLS_ENABLED:
            self.tools = ToolExecutor()

        # Agent mode
        self.agent = None
        if AGENT_ENABLED:
            self.agent = InteractiveAgent()

        # Context injection
        self.context = None
        if CONTEXT_ENABLED:
            self.context = ContextManager()

    def boot(self) -> None:
        """Display boot sequence."""
        print(welcome_screen())

    def select_backend(self) -> str:
        """Interactive backend selector."""
        print("\n  Select Backend")
        print("  " + "─" * 60)

        backends = list(BACKENDS.items())
        for i, (key, backend) in enumerate(backends):
            marker = "›" if key == self.backend_name else " "
            status = "●" if backend.priority <= 3 else "○"  # Local vs remote
            print(f"  {marker} {i+1}. {status} {backend.name:20} {backend.description}")

        print("\n  ● = Local (sovereign)  ○ = Remote")
        print("  Press number to select or Enter to auto-select")

        try:
            choice = input("  > ").strip()
            if choice.isdigit():
                idx = int(choice) - 1
                if 0 <= idx < len(backends):
                    self.backend_name = backends[idx][0]
                    print(f"\n  ✓ Selected: {BACKENDS[self.backend_name].name}")
        except:
            pass

        return self.backend_name

    # Legacy alias
    select_model = select_backend

    def show_prompt(self) -> None:
        """Show the prompt UI."""
        home = os.path.expanduser("~")
        cwd = self.cwd.replace(home, "~")

        # Show Lucidia as the identity, backend in parentheses
        backend_info = ""
        if self.backend and self.backend.backend:
            backend_info = f" ({self.backend.backend.name})"

        print(f"\n   >─╮    Lucidia{backend_info}")
        print(f"    ▣═▣   {cwd}")
        print(f"    ● ●")

    def handle_command(self, cmd: str) -> bool:
        """Handle slash commands. Returns True if handled."""
        if cmd in ("/model", "/backend"):
            self.select_backend()
            return True
        elif cmd == "/new":
            self.history.clear()
            if self.persona:
                self.persona.memory.new_conversation(tags=["manual"])
            print("\n  ✓ Started new conversation")
            return True
        elif cmd == "/help":
            print("\n  Lucidia Commands:")
            print("    /backend  - Select inference backend")
            print("    /new      - New conversation")
            print("    /memory   - Show conversation memory")
            print("    /history  - Show recent conversations")
            print("    /persona  - Show Lucidia's identity")
            print("    /status   - Show backend status")
            print("    /security - Show security status")
            print("    /routing  - Show query routing logic")
            print("    /offline  - Show offline mode stats")
            print("    /tools    - List available tools")
            print("    /agent    - Agent mode (autonomous tasks)")
            print("    /context  - Context injection settings")
            print("    /layers   - Show loaded layers")
            print("    /quit     - Exit")
            return True
        elif cmd == "/layers":
            print(LAYERS_BOOT)
            return True
        elif cmd == "/memory":
            if self.persona and self.persona.memory.current:
                conv = self.persona.memory.current
                print(f"\n  Conversation: {conv.id}")
                print(f"  Messages: {len(conv.messages)}")
                if conv.messages:
                    print("  Recent:")
                    for msg in conv.messages[-5:]:
                        role = "You" if msg.role == "assistant" else "›"
                        content = msg.content[:60] + "..." if len(msg.content) > 60 else msg.content
                        print(f"    {role} {content}")
            else:
                print("\n  Memory: not available")
            return True
        elif cmd == "/history":
            if self.persona:
                recent = self.persona.memory.get_recent(10)
                print("\n  Recent Conversations:")
                for conv in recent:
                    print(f"    {conv['id']} ({conv.get('message_count', 0)} msgs)")
            else:
                print("\n  History: not available")
            return True
        elif cmd == "/persona":
            if self.persona:
                stats = self.persona.get_stats()
                print("\n  Lucidia Identity:")
                print(f"    Session:  {stats['session_id']}")
                print(f"    User:     {stats['user']}")
                print(f"    Device:   {stats['device']}")
                print(f"    Messages: {stats['messages']}")
                print(f"    History:  {stats['total_conversations']} conversations")
            else:
                print("\n  Persona: not loaded")
            return True
        elif cmd == "/status":
            if self.backend and self.backend.backend:
                b = self.backend.backend
                print(f"\n  Backend: {b.name}")
                print(f"  Type:    {b.type}")
                print(f"  Local:   {'Yes' if b.priority <= 3 else 'No'}")
            else:
                print("\n  No backend connected")
            return True
        elif cmd == "/security":
            if self.backend:
                status = self.backend.get_security_status()
                print("\n  Security Status:")
                if "session_stats" in status:
                    stats = status["session_stats"]
                    print(f"    Session:    {stats.get('session_id', 'unknown')}")
                    print(f"    Events:     {stats.get('total_events', 0)}")
                    print(f"    Inputs:     {stats.get('inputs', 0)}")
                    print(f"    Outputs:    {stats.get('outputs', 0)}")
                print(f"    Rate limit: {status.get('rate_limit_remaining', 'N/A')} remaining")
                print(f"    Warnings:   {status.get('warnings', 0)}")
                print(f"    Blocked:    {status.get('blocked', 0)}")
            else:
                print("\n  Security: disabled (no backend)")
            return True
        elif cmd.startswith("/context"):
            if not self.context:
                print("\n  Context: module not loaded")
                return True

            parts = cmd.split(None, 1)
            if len(parts) == 1:
                # Show status
                stats = self.context.get_stats()
                print("\n  Context Injection:")
                print(f"    Auto-inject: {'ON' if stats['auto_inject'] else 'OFF'}")
                print(f"    Injections:  {stats['injections_count']}")
                print(f"    Cached files: {stats['builder']['cached_files']}")
                print(f"    Max lines:   {stats['builder']['max_context_lines']}")
                print("\n  Last context:")
                print(f"    {self.context.get_last_context_summary()}")
            else:
                subcmd = parts[1].strip()
                if subcmd == "on":
                    self.context.auto_inject = True
                    print("  ✓ Context auto-injection: ON")
                elif subcmd == "off":
                    self.context.auto_inject = False
                    print("  ✓ Context auto-injection: OFF")
                elif subcmd == "clear":
                    self.context.builder.clear_cache()
                    print("  ✓ Context cache cleared")
            return True
        elif cmd.startswith("/agent"):
            if not self.agent:
                print("\n  Agent: module not loaded")
                return True

            parts = cmd.split(None, 1)
            if len(parts) == 1:
                print(self.agent.help())
            else:
                subcmd = parts[1].strip()
                if subcmd == "go":
                    output = self.agent.go()
                    print(output)
                elif subcmd == "step":
                    output = self.agent.step()
                    print(output)
                elif subcmd == "stats":
                    stats = self.agent.executor.get_stats()
                    print("\n  Agent Statistics:")
                    print(f"    Tasks run:      {stats['tasks_run']}")
                    print(f"    Total steps:    {stats['total_steps']}")
                    print(f"    Successful:     {stats['successful_steps']}")
                    print(f"    Success rate:   {stats['success_rate']}")
                elif subcmd == "help":
                    print(self.agent.help())
                else:
                    # Treat as a goal - preview the plan
                    output = self.agent.preview(subcmd)
                    print(f"\n{output}")
            return True
        elif cmd == "/tools":
            if self.tools:
                print(self.tools.list_tools())
                print("\n  Usage: @toolname [args]")
                print("  Example: @read lucidia.py")
                print("  Example: @grep \"def main\"")
            else:
                print("\n  Tools: module not loaded")
            return True
        elif cmd == "/offline":
            if self.offline:
                stats = self.offline.get_stats()
                print("\n  Offline Mode:")
                cache = stats.get("cache", {})
                print(f"    Cached responses: {cache.get('entries', 0)}")
                print(f"    Total cache hits: {cache.get('total_hits', 0)}")
                print(f"    Offline responses this session: {stats.get('offline_responses', 0)}")
                print(f"    Local commands this session: {stats.get('local_commands', 0)}")
                if cache.get('categories'):
                    print(f"    Categories: {', '.join(cache['categories'])}")
            else:
                print("\n  Offline: module not loaded")
            return True
        elif cmd == "/routing":
            print("\n  Intelligent Query Routing:")
            print("    Category → Backend")
            print("    ─────────────────────")
            print("    code     → ollama (local for privacy)")
            print("    compute  → ollama (local for speed)")
            print("    search   → ollama (local grep/find)")
            print("    creative → copilot (better at creative)")
            print("    chat     → ollama (local default)")
            print("\n  Keywords detected for routing:")
            print("    code: function, class, def, import, error, bug, fix...")
            print("    compute: calculate, compute, math, equation, sum...")
            print("    search: find, search, where, locate, grep...")
            print("    creative: write, generate, create, compose, story...")
            return True
        elif cmd in ("/quit", "/exit", "/q"):
            self.running = False
            return True
        return False

    def run(self) -> None:
        """Run the Lucidia shell."""
        self.boot()
        self.running = True

        # Auto-select best backend (local-first)
        print("\n  ◐ Detecting backends...")
        self.backend = BackendRunner(self.backend_name)

        if self.backend.backend:
            locality = "local" if self.backend.backend.priority <= 3 else "remote"
            print(f"  ✓ Using {self.backend.backend.name} ({locality})")
        else:
            print("  ⚠ No backend available - running in offline mode")

        # Security status
        if SECURITY_ENABLED:
            print("  ✓ Security: enabled (audit, sanitize, filter)")
        else:
            print("  ⚠ Security: module not loaded")

        # Personality/memory status
        if PERSONALITY_ENABLED and self.persona:
            convs = len(self.persona.memory.index)
            print(f"  ✓ Memory: {convs} conversations stored")
        else:
            print("  ⚠ Memory: module not loaded")

        # Offline status
        if OFFLINE_ENABLED and self.offline:
            cache_stats = self.offline.cache.get_stats()
            print(f"  ✓ Offline: {cache_stats.get('entries', 0)} cached responses")
        else:
            print("  ⚠ Offline: module not loaded")

        # Tools status
        if TOOLS_ENABLED and self.tools:
            print(f"  ✓ Tools: {len(self.tools.tools)} available (@tools)")
        else:
            print("  ⚠ Tools: module not loaded")

        # Agent status
        if AGENT_ENABLED and self.agent:
            print("  ✓ Agent: autonomous mode available (/agent)")
        else:
            print("  ⚠ Agent: module not loaded")

        # Context status
        if CONTEXT_ENABLED and self.context:
            print("  ✓ Context: auto-injection enabled (/context)")
        else:
            print("  ⚠ Context: module not loaded")

        backend_available = self.backend.start()
        if not backend_available:
            if self.offline:
                print("  ⚠ Backend unavailable - running in offline mode")
            else:
                print("  ✗ Failed to start backend")
                print("  → Try: ollama serve (start local inference)")
                return

        print("\n  ✓ Lucidia ready")

        while self.running:
            self.show_prompt()

            try:
                user_input = input("\n  › ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\n")
                break

            if not user_input:
                continue

            # Check for commands
            if user_input.startswith("/"):
                if self.handle_command(user_input):
                    continue

            # Check for tool commands (@read, @grep, etc.)
            if self.tools and user_input.startswith("@"):
                result = self.tools.run(user_input)
                if result:
                    print(f"\n    [{result.tool_name}] ({result.duration_ms}ms)")
                    for line in result.output.split("\n"):
                        print(f"    {line}")
                    continue

            # Process through persona (adds to memory, classifies query)
            suggested_backend = None
            if self.persona:
                prep = self.persona.process_input(user_input)
                suggested_backend = prep.get('suggested_backend')
                query_type = prep.get('query_type')
                if query_type:
                    print(f"    [{query_type.category}]", end="")

            # Intelligent routing: switch backend if better option available
            if suggested_backend and suggested_backend != self.backend_name:
                if suggested_backend in BACKENDS:
                    new_backend = BACKENDS[suggested_backend]
                    # Only switch if suggested is local or we're using remote
                    current_priority = self.backend.backend.priority if self.backend and self.backend.backend else 99
                    if new_backend.priority < current_priority:
                        print(f" → routing to {new_backend.name}")
                        self.backend.stop()
                        self.backend_name = suggested_backend
                        self.backend = BackendRunner(self.backend_name)
                        if not self.backend.start():
                            print(f"    ⚠ Fallback: couldn't start {new_backend.name}")
                            self.backend = BackendRunner(None)  # Auto-select
                            self.backend.start()

            # Context injection (auto-read relevant files)
            backend_input = user_input
            if self.context:
                backend_input, context_added = self.context.process_query(user_input)
                if context_added:
                    print(" +context", end="")

            # Send to backend (with security checks)
            self.history.append(user_input)
            success, error = self.backend.send(backend_input)

            # If backend fails, try offline mode
            if not success:
                if self.offline and self.offline.can_handle(user_input):
                    print("\n    ▣═▣ [offline]")
                    handled, response, source = self.offline.handle(user_input)
                    if handled:
                        print(f"    (via {source})")
                        for line in response.split("\n"):
                            print(f"    {line}")
                        if self.persona:
                            self.persona.process_response(response)
                        continue
                print(f"\n  ✗ Blocked: {error}")
                continue

            # Lucidia thinking indicator
            print("\n    ▣═▣ ···")

            # Wait for and display response
            time.sleep(0.5)

            response_text = []
            while True:
                output = self.backend.get_output()
                if output:
                    for line in output:
                        # Filter UI noise from various backends
                        if not any(skip in line for skip in ["╭", "╰", "│", "thinking", ">"]):
                            print(f"    {line}")
                            response_text.append(line)

                if not self.backend.running:
                    break

                time.sleep(0.1)
                if not self.backend.output_buffer:
                    break

            # Store response in persona memory and cache for offline use
            if response_text:
                full_response = "\n".join(response_text)
                if self.persona:
                    self.persona.process_response(full_response)
                if self.offline:
                    category = query_type.category if query_type else "chat"
                    backend_name = self.backend.backend.name if self.backend and self.backend.backend else "unknown"
                    self.offline.cache_response(user_input, full_response, backend_name, category)

        # Save persona state on exit
        if self.persona:
            self.persona.save()

        self.backend.stop()
        print("\n  ╰─ Goodbye from Lucidia\n")


# ═══════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    """Main entry point."""
    shell = LucidiaShell()
    shell.run()


if __name__ == "__main__":
    main()
