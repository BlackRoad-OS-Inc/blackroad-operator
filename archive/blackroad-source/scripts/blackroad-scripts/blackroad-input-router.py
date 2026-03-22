#!/usr/bin/env python3
"""
BlackRoad OS - Input Router (Keys + Commands)

Pure input layer. Reads keystrokes, emits events.
NO rendering. NO state mutation. NO business logic.

This is the INPUT. Not the engine. Not the view.
"""

from typing import Dict, Any, Optional, List
from enum import Enum
import sys
import termios
import tty

# ================================
# EVENT TYPES
# ================================
# Structured events emitted by input router

class EventType(Enum):
    """All possible event types from input"""
    KEY_PRESS = "key_press"          # Raw character input
    MODE_SWITCH = "mode_switch"      # Tab switching (1-7)
    INPUT_SUBMIT = "input_submit"    # Command submitted
    SCROLL = "scroll"                # j/k scrolling
    QUIT = "quit"                    # q pressed
    CLEAR = "clear"                  # ESC pressed
    COMMAND_MODE = "command_mode"    # / pressed

class Event:
    """
    Structured event container
    
    Every input produces exactly ONE event
    Events are pure data, no behavior
    """
    def __init__(self, event_type: EventType, payload: Dict[str, Any] = None):
        self.type = event_type
        self.payload = payload or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dict for serialization"""
        return {
            "type": self.type.value,
            "payload": self.payload,
        }
    
    def __repr__(self):
        return f"Event({self.type.value}, {self.payload})"

# ================================
# KEY BINDINGS
# ================================
# Mapping from raw keys to semantic actions

KEY_BINDINGS = {
    # Mode switching (1-7)
    '1': ('mode_switch', {'mode': 'chat'}),
    '2': ('mode_switch', {'mode': 'github'}),
    '3': ('mode_switch', {'mode': 'projects'}),
    '4': ('mode_switch', {'mode': 'sales'}),
    '5': ('mode_switch', {'mode': 'web'}),
    '6': ('mode_switch', {'mode': 'ops'}),
    '7': ('mode_switch', {'mode': 'council'}),
    
    # Navigation
    'j': ('scroll', {'direction': 'down'}),
    'k': ('scroll', {'direction': 'up'}),
    
    # Mode control
    'q': ('quit', {}),
    '/': ('command_mode', {'enter': True}),
    
    # Special keys (using ASCII codes)
    '\x1b': ('clear', {}),           # ESC (27)
    '\n': ('input_submit', {}),      # Enter (10)
    '\r': ('input_submit', {}),      # Enter (13)
    '\x7f': ('backspace', {}),       # Backspace (127)
    '\x08': ('backspace', {}),       # Backspace (8)
}

# ================================
# COMMAND PARSER
# ================================
# Parse command strings into structured data

class Command:
    """Parsed command structure"""
    def __init__(self, name: str, args: List[str]):
        self.name = name
        self.args = args
    
    def __repr__(self):
        return f"Command({self.name}, {self.args})"
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "args": self.args,
        }

def parse_command(text: str) -> Optional[Command]:
    """
    Parse command string into structured command
    
    Command format:
        /command [arg1] [arg2] ...
    
    Examples:
        /help           → Command("help", [])
        /mode ops       → Command("mode", ["ops"])
        /agent lucidia  → Command("agent", ["lucidia"])
    
    Returns None if not a valid command
    """
    text = text.strip()
    
    # Must start with /
    if not text.startswith('/'):
        return None
    
    # Remove leading /
    text = text[1:]
    
    # Split into tokens
    tokens = text.split()
    if not tokens:
        return None
    
    # First token is command name
    name = tokens[0].lower()
    args = tokens[1:] if len(tokens) > 1 else []
    
    return Command(name, args)

# ================================
# INPUT READER
# ================================
# Non-blocking keyboard input

class InputReader:
    """
    Terminal input reader with non-blocking support
    
    Handles raw terminal I/O, translates to events
    """
    
    def __init__(self, non_blocking: bool = True):
        self.non_blocking = non_blocking
        self.original_settings = None
        
        # Set up terminal for raw input
        if sys.stdin.isatty():
            self.original_settings = termios.tcgetattr(sys.stdin)
            self._set_raw_mode()
    
    def _set_raw_mode(self):
        """Set terminal to raw mode for character-by-character input"""
        tty.setraw(sys.stdin.fileno())
        
        if self.non_blocking:
            # Set non-blocking
            import fcntl
            import os
            fd = sys.stdin.fileno()
            flags = fcntl.fcntl(fd, fcntl.F_GETFL)
            fcntl.fcntl(fd, fcntl.F_SETFL, flags | os.O_NONBLOCK)
    
    def restore(self):
        """Restore terminal to original settings"""
        if self.original_settings and sys.stdin.isatty():
            termios.tcsetattr(sys.stdin, termios.TCSADRAIN, self.original_settings)
    
    def read_char(self) -> Optional[str]:
        """
        Read single character from stdin
        Returns None if no input available (non-blocking mode)
        """
        try:
            char = sys.stdin.read(1)
            return char if char else None
        except (IOError, BlockingIOError):
            return None
    
    def __del__(self):
        """Cleanup on destruction"""
        self.restore()

# ================================
# INPUT ROUTER
# ================================
# Main input routing logic

class InputRouter:
    """
    Routes keyboard input to events
    
    Pure translator: keystrokes → events
    No state mutation, no rendering
    """
    
    def __init__(self):
        self.reader = InputReader(non_blocking=True)
    
    def read_input(self) -> Optional[Event]:
        """
        Read keyboard input and return corresponding event
        
        Returns None if no input available (non-blocking)
        Returns Event if input received
        """
        char = self.reader.read_char()
        
        if char is None:
            return None
        
        # Check key bindings
        if char in KEY_BINDINGS:
            action, payload = KEY_BINDINGS[char]
            return self._create_event(action, payload)
        
        # Printable character
        if 32 <= ord(char) <= 126:
            return Event(EventType.KEY_PRESS, {'char': char})
        
        # Unknown key - emit as raw key press for debugging
        return Event(EventType.KEY_PRESS, {'char': char, 'code': ord(char)})
    
    def _create_event(self, action: str, payload: Dict) -> Event:
        """Convert action string to Event"""
        if action == 'mode_switch':
            return Event(EventType.MODE_SWITCH, payload)
        elif action == 'scroll':
            return Event(EventType.SCROLL, payload)
        elif action == 'quit':
            return Event(EventType.QUIT, payload)
        elif action == 'clear':
            return Event(EventType.CLEAR, payload)
        elif action == 'command_mode':
            return Event(EventType.COMMAND_MODE, payload)
        elif action == 'input_submit':
            return Event(EventType.INPUT_SUBMIT, payload)
        elif action == 'backspace':
            return Event(EventType.KEY_PRESS, {'char': '\x7f'})
        else:
            return Event(EventType.KEY_PRESS, {'char': '?'})
    
    def cleanup(self):
        """Restore terminal state"""
        self.reader.restore()

# ================================
# EVENT INTERPRETER
# ================================
# Interpret events for command execution

def interpret_event(event: Event, current_buffer: str = "") -> Dict[str, Any]:
    """
    Interpret event in context
    
    This is a HELPER, not state mutation
    Returns interpretation data, not new state
    
    Args:
        event: Input event
        current_buffer: Current input buffer (for command parsing)
    
    Returns:
        Dict with interpretation data
    """
    if event.type == EventType.INPUT_SUBMIT:
        # Parse command from buffer
        cmd = parse_command(current_buffer)
        if cmd:
            return {
                "action": "execute_command",
                "command": cmd.to_dict(),
            }
        else:
            return {
                "action": "submit_text",
                "text": current_buffer,
            }
    
    elif event.type == EventType.MODE_SWITCH:
        return {
            "action": "switch_mode",
            "mode": event.payload['mode'],
        }
    
    elif event.type == EventType.SCROLL:
        return {
            "action": "scroll",
            "direction": event.payload['direction'],
        }
    
    elif event.type == EventType.QUIT:
        return {
            "action": "quit",
        }
    
    elif event.type == EventType.CLEAR:
        return {
            "action": "clear_buffer",
        }
    
    elif event.type == EventType.COMMAND_MODE:
        return {
            "action": "enter_command_mode",
        }
    
    elif event.type == EventType.KEY_PRESS:
        char = event.payload.get('char', '')
        if char == '\x7f' or char == '\x08':
            return {
                "action": "delete_char",
            }
        else:
            return {
                "action": "append_char",
                "char": char,
            }
    
    return {"action": "unknown"}

# ================================
# INTEGRATION HELPERS
# ================================
# Functions to wire into main loop

def create_input_router() -> InputRouter:
    """Create and initialize input router"""
    return InputRouter()

def poll_input(router: InputRouter) -> Optional[Event]:
    """
    Poll for input (non-blocking)
    Returns None if no input, Event if input received
    """
    return router.read_input()

# ================================
# COMMAND REGISTRY
# ================================
# Available commands (documentation only)

AVAILABLE_COMMANDS = {
    'help': {
        'description': 'Show help message',
        'args': [],
    },
    'agents': {
        'description': 'List all agents',
        'args': [],
    },
    'mode': {
        'description': 'Switch to mode',
        'args': ['mode_name'],
    },
    'clear': {
        'description': 'Clear log',
        'args': [],
    },
    'agent': {
        'description': 'Show agent details',
        'args': ['agent_name'],
    },
    'quit': {
        'description': 'Exit system',
        'args': [],
    },
    'status': {
        'description': 'Show system status',
        'args': [],
    },
}

def get_command_help(command_name: str) -> str:
    """Get help text for command"""
    if command_name in AVAILABLE_COMMANDS:
        cmd = AVAILABLE_COMMANDS[command_name]
        args_str = ' '.join(f'<{arg}>' for arg in cmd['args'])
        return f"/{command_name} {args_str}\n  {cmd['description']}"
    else:
        return f"Unknown command: {command_name}"

# ================================
# EXAMPLE USAGE
# ================================

if __name__ == "__main__":
    """
    Standalone example showing input router in action
    Press keys to see events, Ctrl+C to quit
    """
    import time
    
    print("BlackRoad OS - Input Router Demo")
    print("=" * 50)
    print("Press keys to see events:")
    print("  1-7: mode switch")
    print("  j/k: scroll")
    print("  /: command mode")
    print("  q: quit")
    print("  Ctrl+C: exit demo")
    print("=" * 50)
    print()
    
    router = create_input_router()
    buffer = ""
    
    try:
        while True:
            event = poll_input(router)
            
            if event:
                print(f"Event: {event}")
                
                # Interpret event
                interpretation = interpret_event(event, buffer)
                print(f"  → {interpretation}")
                
                # Update buffer (for demo only)
                if interpretation['action'] == 'append_char':
                    buffer += interpretation['char']
                elif interpretation['action'] == 'delete_char':
                    buffer = buffer[:-1]
                elif interpretation['action'] == 'submit_text':
                    print(f"  → Submitted: {buffer}")
                    buffer = ""
                elif interpretation['action'] == 'clear_buffer':
                    buffer = ""
                elif interpretation['action'] == 'quit':
                    print("Quit event received")
                    break
                
                if buffer:
                    print(f"  Buffer: '{buffer}'")
                print()
            
            time.sleep(0.01)  # Small delay to prevent CPU spin
    
    except KeyboardInterrupt:
        print("\n\nExiting...")
    finally:
        router.cleanup()
        print("Terminal restored")
