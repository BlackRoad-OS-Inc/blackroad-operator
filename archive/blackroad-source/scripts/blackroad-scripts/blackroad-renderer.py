#!/usr/bin/env python3
"""
BlackRoad OS - Terminal Renderer (ANSI View Layer)

Pure rendering layer. Reads state, outputs ANSI.
NO state mutation. NO side effects. NO I/O.

This is the VIEW. Not the engine.
"""

from typing import Dict, List, Any
from datetime import datetime

# ================================
# ANSI COLOR SYSTEM
# ================================
# Semantic colors only - each encodes meaning

class ANSI:
    """ANSI escape code helpers"""
    
    # Control
    RESET = '\033[0m'
    CLEAR = '\033[2J'
    HOME = '\033[H'
    
    # Grayscale base (256-color palette)
    BLACK = '\033[48;5;0m'           # Background
    DARK_GRAY = '\033[48;5;235m'     # Panel background
    MED_GRAY = '\033[38;5;240m'      # Muted text
    LIGHT_GRAY = '\033[38;5;250m'    # Secondary text
    WHITE = '\033[38;5;255m'         # Primary text
    
    # Semantic accent colors (foreground only)
    ORANGE = '\033[38;5;208m'        # Actions / active mode / decisions
    PINK = '\033[38;5;205m'          # Memory / state / persistence
    PURPLE = '\033[38;5;141m'        # Logic / orchestration / agents
    BLUE = '\033[38;5;75m'           # System / IO / network
    
    # Inverse (for headers)
    INVERSE = '\033[7m'
    
    @staticmethod
    def color_text(text: str, color_code: str) -> str:
        """Wrap text with color code"""
        return f"{color_code}{text}{ANSI.RESET}"
    
    @staticmethod
    def move_cursor(row: int, col: int) -> str:
        """Move cursor to position (1-indexed)"""
        return f'\033[{row};{col}H'

# ================================
# LAYOUT MATH
# ================================
# Terminal grid calculations

class Layout:
    """Layout dimensions and boundaries"""
    
    def __init__(self, width: int, height: int):
        self.width = width
        self.height = height
        
        # Fixed dimensions
        self.top_bar_height = 1
        self.bottom_bar_height = 1
        self.right_panel_width = 30
        
        # Calculated regions
        self.content_height = height - self.top_bar_height - self.bottom_bar_height
        self.main_panel_width = width - self.right_panel_width - 1  # -1 for separator
        
        # Boundaries
        self.main_panel = {
            'x': 0,
            'y': self.top_bar_height,
            'width': self.main_panel_width,
            'height': self.content_height,
        }
        
        self.right_panel = {
            'x': self.main_panel_width + 1,
            'y': self.top_bar_height,
            'width': self.right_panel_width,
            'height': self.content_height,
        }
        
        self.top_bar = {
            'x': 0,
            'y': 0,
            'width': width,
            'height': self.top_bar_height,
        }
        
        self.bottom_bar = {
            'x': 0,
            'y': height - 1,
            'width': width,
            'height': self.bottom_bar_height,
        }

# ================================
# RENDER ENGINE
# ================================
# Pure state → ANSI transformation

def render_top_bar(state: Dict, layout: Layout) -> List[str]:
    """
    Render top status bar
    
    Layout: [SYSTEM_NAME] [center: MODE] [right: TIME]
    Uses inverse video for emphasis
    """
    lines = []
    
    system_name = " BLACKROAD OS "
    mode_text = f" {state['mode'].value.upper()} "
    timestamp = datetime.now().strftime("%H:%M:%S")
    time_text = f" {timestamp} "
    
    # Calculate positions
    center_x = (layout.width - len(mode_text)) // 2
    right_x = layout.width - len(time_text)
    
    # Build line with inverse video
    line = [' '] * layout.width
    
    # System name (left)
    for i, ch in enumerate(system_name):
        if i < layout.width:
            line[i] = ch
    
    # Mode (center) - highlight with orange
    if center_x >= 0 and center_x + len(mode_text) <= layout.width:
        for i, ch in enumerate(mode_text):
            line[center_x + i] = ch
    
    # Time (right)
    if right_x >= 0:
        for i, ch in enumerate(time_text):
            if right_x + i < layout.width:
                line[right_x + i] = ch
    
    # Apply inverse video
    line_str = ''.join(line)
    colored = ANSI.color_text(line_str, ANSI.INVERSE)
    
    lines.append(colored)
    return lines

def render_main_panel(state: Dict, layout: Layout) -> List[str]:
    """
    Render main content panel (left side)
    
    Shows log entries with syntax highlighting:
    - Commands: orange
    - Timestamps: blue
    - System messages: default
    """
    lines = []
    panel = layout.main_panel
    
    # Get visible log entries
    log_entries = state.get('log', [])
    scroll_offset = state.get('cursor', {}).get('scroll_offset', 0)
    visible_count = panel['height']
    
    # Calculate slice
    start_idx = max(0, scroll_offset)
    end_idx = min(len(log_entries), start_idx + visible_count)
    visible_entries = log_entries[start_idx:end_idx]
    
    # Render each entry
    for entry in visible_entries:
        timestamp = entry['time'].strftime("%H:%M:%S")
        level = entry.get('level', 'system')
        msg = entry.get('msg', '')
        
        # Truncate message to fit panel
        max_msg_len = panel['width'] - 15  # Reserve space for timestamp
        if len(msg) > max_msg_len:
            msg = msg[:max_msg_len - 3] + '...'
        
        # Syntax highlighting based on level
        if level == 'command':
            # Commands in orange
            line = ANSI.color_text(f" [{timestamp}] ", ANSI.BLUE) + ANSI.color_text(msg, ANSI.ORANGE)
        elif level == 'agent':
            # Agent messages in purple
            line = ANSI.color_text(f" [{timestamp}] ", ANSI.BLUE) + ANSI.color_text(msg, ANSI.PURPLE)
        elif msg.startswith('$'):
            # Shell commands in orange
            line = " " + ANSI.color_text(msg, ANSI.ORANGE)
        else:
            # Default system messages
            line = ANSI.color_text(f" [{timestamp}] ", ANSI.BLUE) + msg
        
        lines.append(line)
    
    # Fill remaining lines with empty space
    while len(lines) < panel['height']:
        lines.append('')
    
    return lines

def render_separator(layout: Layout) -> List[str]:
    """
    Render vertical separator between panels
    Simple │ character in dark gray
    """
    lines = []
    for _ in range(layout.content_height):
        lines.append(ANSI.color_text('│', ANSI.MED_GRAY))
    return lines

def render_right_panel(state: Dict, layout: Layout) -> List[str]:
    """
    Render agent status panel (right side)
    
    Shows each agent with:
    - Colored status indicator (● or ○)
    - Name
    - Status text
    - Current task
    """
    lines = []
    panel = layout.right_panel
    
    # Panel header
    mode_name = state['mode'].value.upper()
    header = f" {mode_name} AGENTS "
    header_line = ANSI.color_text(header.ljust(panel['width']), ANSI.INVERSE)
    lines.append(header_line)
    lines.append('')  # Blank line
    
    # Agent list
    agents = state.get('agents', {})
    for name, data in agents.items():
        if len(lines) >= panel['height'] - 1:
            break
        
        status = data.get('status')
        task = data.get('task', '')
        color = data.get('color', 'white')
        
        # Choose status indicator
        if hasattr(status, 'value'):
            status_str = status.value
        else:
            status_str = str(status)
        
        indicator = '●' if status_str == 'active' else '○'
        
        # Color based on semantic meaning
        if color == 'orange':
            color_code = ANSI.ORANGE
        elif color == 'pink':
            color_code = ANSI.PINK
        elif color == 'purple':
            color_code = ANSI.PURPLE
        elif color == 'blue':
            color_code = ANSI.BLUE
        else:
            color_code = ANSI.WHITE
        
        # Agent name line
        name_line = ' ' + ANSI.color_text(name, ANSI.WHITE)
        lines.append(name_line[:panel['width']])
        
        # Status line
        status_line = (
            '  ' + 
            ANSI.color_text(indicator, color_code) + 
            ' ' +
            ANSI.color_text(status_str.upper(), ANSI.MED_GRAY) +
            ' · ' +
            ANSI.color_text(task[:15], ANSI.MED_GRAY)
        )
        lines.append(status_line[:panel['width']])
        lines.append('')  # Blank line between agents
    
    # Fill remaining space
    while len(lines) < panel['height']:
        lines.append('')
    
    return lines

def render_bottom_bar(state: Dict, layout: Layout) -> List[str]:
    """
    Render bottom command/status bar
    
    Shows either:
    - Command input (when in command mode)
    - Key shortcuts and palette (when in normal mode)
    """
    lines = []
    
    if state.get('command_mode', False):
        # Command mode - show input buffer
        buffer = state.get('input_buffer', '')
        prompt = f":{buffer}_"
        line = ANSI.color_text(prompt, ANSI.ORANGE)
    else:
        # Normal mode - show keybindings
        bindings = " 1-7:tabs  j/k:scroll  /:cmd  q:quit"
        
        # Color palette indicators
        palette = (
            "  " +
            ANSI.color_text("■", ANSI.ORANGE) + "action  " +
            ANSI.color_text("■", ANSI.PINK) + "memory  " +
            ANSI.color_text("■", ANSI.PURPLE) + "logic  " +
            ANSI.color_text("■", ANSI.BLUE) + "system"
        )
        
        # Calculate spacing
        palette_width = 50  # Approximate visible width
        spacer_width = layout.width - len(bindings) - palette_width
        spacer = ' ' * max(0, spacer_width)
        
        line = ANSI.color_text(bindings, ANSI.LIGHT_GRAY) + spacer + palette
    
    lines.append(line[:layout.width])
    return lines

def render(state: Dict, width: int = 120, height: int = 40) -> str:
    """
    Main render function
    
    Pure function: state → ANSI string
    
    Args:
        state: System state dict (read-only)
        width: Terminal width in characters
        height: Terminal height in lines
    
    Returns:
        ANSI-formatted string ready for terminal output
    """
    # Calculate layout
    layout = Layout(width, height)
    
    # Build screen buffer (2D array)
    screen = []
    
    # Render all regions
    top_lines = render_top_bar(state, layout)
    main_lines = render_main_panel(state, layout)
    sep_lines = render_separator(layout)
    right_lines = render_right_panel(state, layout)
    bottom_lines = render_bottom_bar(state, layout)
    
    # Composite screen
    # Row 0: top bar
    for line in top_lines:
        screen.append(line)
    
    # Rows 1 to height-2: content panels
    for i in range(layout.content_height):
        # Main panel + separator + right panel
        main = main_lines[i] if i < len(main_lines) else ''
        sep = sep_lines[i] if i < len(sep_lines) else ' '
        right = right_lines[i] if i < len(right_lines) else ''
        
        # Pad main panel to correct width (use spaces to fill)
        # Count visible chars (rough approximation)
        import re
        ansi_pattern = re.compile(r'\x1b\[[0-9;]*m')
        main_visible = len(ansi_pattern.sub('', main))
        main_padding = ' ' * max(0, layout.main_panel['width'] - main_visible)
        
        row = main + main_padding + sep + right
        screen.append(row)
    
    # Bottom row: bottom bar
    for line in bottom_lines:
        screen.append(line)
    
    # Join into final output
    output = ANSI.CLEAR + ANSI.HOME + '\n'.join(screen) + ANSI.RESET
    
    return output

# ================================
# UTILITY / INSPECTION
# ================================

def render_to_lines(state: Dict, width: int = 80, height: int = 24) -> List[str]:
    """
    Alternative render that returns list of lines
    Useful for testing and debugging
    """
    output = render(state, width, height)
    # Strip ANSI codes for inspection
    import re
    ansi_escape = re.compile(r'\x1b\[[0-9;]*[mHJ]')
    clean = ansi_escape.sub('', output)
    return clean.split('\n')

def measure_visible_width(text: str) -> int:
    """
    Measure visible width of string (excluding ANSI codes)
    Useful for alignment calculations
    """
    import re
    ansi_escape = re.compile(r'\x1b\[[0-9;]*[mHJ]')
    clean = ansi_escape.sub('', text)
    return len(clean)

# ================================
# EXTENSION NOTES
# ================================
"""
ADDING NEW PANELS:
1. Define region in Layout.__init__
2. Create render_<panel_name> function
3. Composite in render() main function
4. Respect grid boundaries (no overlap)

ADDING COLORS:
1. Define in ANSI class with semantic name
2. Document meaning in comment
3. Use only where meaning applies

SYNTAX HIGHLIGHTING:
1. Add rules in render_main_panel
2. Check entry['level'] or msg prefix
3. Apply color codes consistently

TESTING:
1. Use render_to_lines for unit tests
2. Test with min/max dimensions
3. Verify no ANSI leakage
"""

# ================================
# EXAMPLE USAGE
# ================================

if __name__ == "__main__":
    """
    Standalone example showing renderer in action
    """
    from datetime import datetime
    
    # Mock state (normally comes from engine)
    mock_state = {
        'mode': type('Mode', (), {'value': 'chat'})(),
        'cursor': {'scroll_offset': 0},
        'agents': {
            'lucidia': {'status': type('Status', (), {'value': 'active'})(), 'task': 'Memory sync', 'color': 'purple'},
            'alice': {'status': type('Status', (), {'value': 'idle'})(), 'task': 'Standby', 'color': 'blue'},
            'octavia': {'status': type('Status', (), {'value': 'active'})(), 'task': 'Monitoring', 'color': 'orange'},
        },
        'log': [
            {'time': datetime.now(), 'level': 'system', 'msg': 'System initialized'},
            {'time': datetime.now(), 'level': 'system', 'msg': 'Memory online'},
            {'time': datetime.now(), 'level': 'command', 'msg': '$ test command'},
            {'time': datetime.now(), 'level': 'agent', 'msg': 'lucidia → processing'},
        ],
        'command_mode': False,
        'input_buffer': '',
    }
    
    # Render to terminal
    output = render(mock_state, width=120, height=30)
    print(output)
    
    # Show layout calculations
    print("\n\n--- LAYOUT DEBUG ---")
    layout = Layout(120, 30)
    print(f"Main panel: {layout.main_panel}")
    print(f"Right panel: {layout.right_panel}")
    print(f"Content height: {layout.content_height}")
