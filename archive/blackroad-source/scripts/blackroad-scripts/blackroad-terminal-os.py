#!/usr/bin/env python3
"""
BlackRoad OS - Terminal Interface
A terminal-native operating system interface

Requirements:
- Python 3.7+
- xterm-256color terminal
- tmux-compatible

Usage:
    python3 blackroad-terminal-os.py

Controls:
    1-7     Switch tabs (chat/github/projects/sales/web/ops/council)
    /       Enter command mode
    q       Quit
    j/k     Scroll main panel
"""

import curses
import sys
from datetime import datetime
from typing import List, Dict
import psutil
import os

# ================================
# COLOR SYSTEM
# ================================
# Grayscale base + intentional accents
# Colors encode semantic meaning, not aesthetics

COLOR_PAIRS = {
    'default': 1,      # WHITE on BLACK
    'panel': 2,        # LIGHT_GRAY on DARK_GRAY
    'header': 3,       # BLACK on LIGHT_GRAY (inverse)
    'orange': 4,       # ORANGE - actions/decisions
    'pink': 5,         # PINK - memory/state
    'purple': 6,       # PURPLE - logic/orchestration
    'blue': 7,         # BLUE - system/IO
    'muted': 8,        # DARK_GRAY on BLACK
}

# ================================
# LAYOUT CONSTANTS
# ================================
# Assumes 120x40 terminal minimum
# All dimensions in terminal cells

TOP_BAR_HEIGHT = 1
BOTTOM_BAR_HEIGHT = 1
RIGHT_PANEL_WIDTH = 30
MIN_WIDTH = 80
MIN_HEIGHT = 24

# ================================
# AGENT SYSTEM
# ================================
# Logical agents with state indicators

AGENTS = [
    {'name': 'lucidia', 'status': 'ACTIVE', 'task': 'Memory sync'},
    {'name': 'alice', 'status': 'IDLE', 'task': 'Standby'},
    {'name': 'octavia', 'status': 'ACTIVE', 'task': 'Monitoring'},
    {'name': 'cece', 'status': 'ACTIVE', 'task': 'Coordination'},
    {'name': 'codex-oracle', 'status': 'ACTIVE', 'task': 'Indexing'},
    {'name': 'deployment', 'status': 'IDLE', 'task': 'Awaiting'},
    {'name': 'security', 'status': 'ACTIVE', 'task': 'Scanning'},
]

TABS = ['chat', 'github', 'projects', 'sales', 'web', 'ops', 'council']

# ================================
# STATE
# ================================

class TerminalOS:
    def __init__(self, stdscr):
        self.stdscr = stdscr
        self.current_tab = 0
        self.main_buffer: List[str] = []
        self.scroll_offset = 0
        self.command_mode = False
        self.command_buffer = ""
        self.last_metric_update = 0
        self.processes = []
        
        # Initialize
        curses.curs_set(0)
        curses.use_default_colors()
        self.init_colors()
        self.load_demo_content()
        self.update_metrics()
        
    def init_colors(self):
        """Initialize color pairs for terminal"""
        curses.init_pair(COLOR_PAIRS['default'], curses.COLOR_WHITE, -1)
        curses.init_pair(COLOR_PAIRS['panel'], 250, 235)
        curses.init_pair(COLOR_PAIRS['header'], curses.COLOR_BLACK, 250)
        curses.init_pair(COLOR_PAIRS['orange'], 208, -1)  # Orange
        curses.init_pair(COLOR_PAIRS['pink'], 205, -1)    # Pink
        curses.init_pair(COLOR_PAIRS['purple'], 141, -1)  # Purple
        curses.init_pair(COLOR_PAIRS['blue'], 75, -1)     # Blue
        curses.init_pair(COLOR_PAIRS['muted'], 240, -1)   # Dark gray
        
    def update_metrics(self):
        """Update live system metrics"""
        import time
        current_time = time.time()
        
        # Update every second
        if current_time - self.last_metric_update < 1.0:
            return
        
        self.last_metric_update = current_time
        
        try:
            # Get live metrics
            cpu = psutil.cpu_percent(interval=0.1)
            mem = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            net = psutil.net_io_counters()
            
            # Get top processes
            procs = []
            for p in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    procs.append({
                        'pid': p.info['pid'],
                        'name': p.info['name'][:25],
                        'cpu': p.info['cpu_percent'] or 0,
                        'mem': p.info['memory_percent'] or 0,
                    })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            
            procs.sort(key=lambda x: x['cpu'], reverse=True)
            self.processes = procs[:15]
            
            # Rebuild main buffer with live data
            self.main_buffer = [
                "$ blackroad-os init",
                "",
                f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] System initialized",
                f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Live monitoring active",
                "",
                "LIVE SYSTEM METRICS:",
                f"  CPU:     {cpu:.1f}% ({psutil.cpu_count()} cores)",
                f"  Memory:  {mem.used/(1024**3):.1f} GB / {mem.total/(1024**3):.1f} GB ({mem.percent:.1f}%)",
                f"  Disk:    {disk.used/(1024**3):.0f} GB / {disk.total/(1024**3):.0f} GB ({disk.percent:.1f}%)",
                f"  Network: ↑{net.bytes_sent/(1024**2):.1f} MB  ↓{net.bytes_recv/(1024**2):.1f} MB",
                "",
                "TOP PROCESSES BY CPU:",
            ]
            
            for p in self.processes[:10]:
                line = f"  {p['pid']:<8} {p['name']:<25} CPU:{p['cpu']:>5.1f}%  MEM:{p['mem']:>5.1f}%"
                self.main_buffer.append(line)
            
            self.main_buffer.extend([
                "",
                "ACTIVE AGENTS:",
                "  - codex-oracle: monitoring system",
                "  - deployment: watching services",
                "  - security: live scanning",
                "",
                "Press / to enter command mode, 1-7 to switch tabs",
                "",
            ])
            
        except Exception as e:
            self.main_buffer = [
                "$ blackroad-os init",
                "",
                f"Error updating metrics: {str(e)}",
                "",
            ]
    
    def load_demo_content(self):
        """Load initial content into main buffer"""
        self.update_metrics()
    
    def get_dimensions(self):
        """Calculate panel dimensions based on terminal size"""
        height, width = self.stdscr.getmaxyx()
        
        # Ensure minimum dimensions
        if width < RIGHT_PANEL_WIDTH + 20:
            width = RIGHT_PANEL_WIDTH + 20
        
        main_height = height - TOP_BAR_HEIGHT - BOTTOM_BAR_HEIGHT
        main_width = max(20, width - RIGHT_PANEL_WIDTH - 1)
        
        return {
            'height': height,
            'width': width,
            'main_height': main_height,
            'main_width': main_width,
            'right_x': main_width + 1,
        }
    
    def draw_top_bar(self, dims):
        """Draw top status bar"""
        self.stdscr.attron(curses.color_pair(COLOR_PAIRS['header']))
        
        system_name = " BLACKROAD OS "
        status = f" {TABS[self.current_tab].upper()} "
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        # Left side
        self.stdscr.addstr(0, 0, system_name)
        
        # Center (tab indicator)
        center_x = (dims['width'] - len(status)) // 2
        self.stdscr.addstr(0, center_x, status)
        
        # Right side
        right_text = f" {timestamp} "
        self.stdscr.addstr(0, dims['width'] - len(right_text), right_text)
        
        # Fill rest of line
        for x in range(len(system_name), dims['width']):
            if x < center_x or x >= center_x + len(status):
                if x < dims['width'] - len(right_text):
                    try:
                        self.stdscr.addch(0, x, ' ')
                    except curses.error:
                        pass
        
        self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['header']))
    
    def draw_main_panel(self, dims):
        """Draw main interaction panel (left side)"""
        y_start = TOP_BAR_HEIGHT
        
        # Calculate visible lines
        visible_lines = dims['main_height']
        total_lines = len(self.main_buffer)
        
        # Adjust scroll offset
        if self.scroll_offset < 0:
            self.scroll_offset = 0
        if self.scroll_offset > max(0, total_lines - visible_lines):
            self.scroll_offset = max(0, total_lines - visible_lines)
        
        # Draw content
        for i in range(visible_lines):
            line_idx = i + self.scroll_offset
            y = y_start + i
            
            if line_idx < total_lines:
                line = self.main_buffer[line_idx]
                
                # Syntax highlighting
                if line.startswith('$'):
                    # Commands in orange
                    self.stdscr.attron(curses.color_pair(COLOR_PAIRS['orange']))
                    self.stdscr.addstr(y, 1, line[:dims['main_width']-2])
                    self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['orange']))
                elif line.startswith('['):
                    # Timestamps in blue
                    self.stdscr.attron(curses.color_pair(COLOR_PAIRS['blue']))
                    timestamp_end = line.find(']') + 1
                    self.stdscr.addstr(y, 1, line[:timestamp_end])
                    self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['blue']))
                    self.stdscr.addstr(y, timestamp_end + 1, line[timestamp_end:][:dims['main_width']-timestamp_end-2])
                elif line.startswith('  -'):
                    # List items in muted
                    self.stdscr.attron(curses.color_pair(COLOR_PAIRS['muted']))
                    self.stdscr.addstr(y, 1, line[:dims['main_width']-2])
                    self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['muted']))
                else:
                    # Default text
                    self.stdscr.addstr(y, 1, line[:dims['main_width']-2])
        
        # Draw vertical border
        for y in range(y_start, y_start + dims['main_height']):
            try:
                self.stdscr.addch(y, dims['right_x'] - 1, '│')
            except curses.error:
                pass
    
    def draw_right_panel(self, dims):
        """Draw agent status panel (right side)"""
        y_start = TOP_BAR_HEIGHT
        x_start = dims['right_x']
        
        # Panel header
        header = f" {TABS[self.current_tab].upper()} AGENTS "
        self.stdscr.attron(curses.color_pair(COLOR_PAIRS['header']))
        self.stdscr.addstr(y_start, x_start, header.ljust(RIGHT_PANEL_WIDTH))
        self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['header']))
        
        # Agent list
        y = y_start + 2
        for agent in AGENTS:
            if y >= dims['height'] - BOTTOM_BAR_HEIGHT - 1:
                break
            
            # Agent name
            self.stdscr.addstr(y, x_start + 1, agent['name'][:RIGHT_PANEL_WIDTH-2])
            y += 1
            
            # Status line
            status_indicator = '●' if agent['status'] == 'ACTIVE' else '○'
            status_color = COLOR_PAIRS['purple'] if agent['status'] == 'ACTIVE' else COLOR_PAIRS['muted']
            
            self.stdscr.attron(curses.color_pair(status_color))
            self.stdscr.addstr(y, x_start + 2, status_indicator)
            self.stdscr.attroff(curses.color_pair(status_color))
            
            self.stdscr.attron(curses.color_pair(COLOR_PAIRS['muted']))
            status_text = f" {agent['status']} · {agent['task']}"
            self.stdscr.addstr(y, x_start + 4, status_text[:RIGHT_PANEL_WIDTH-5])
            self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['muted']))
            
            y += 2
        
        # Tab indicators
        y = dims['height'] - BOTTOM_BAR_HEIGHT - len(TABS) - 3
        self.stdscr.attron(curses.color_pair(COLOR_PAIRS['muted']))
        self.stdscr.addstr(y, x_start + 1, "─" * (RIGHT_PANEL_WIDTH - 2))
        self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['muted']))
        
        y += 2
        for i, tab in enumerate(TABS):
            if y >= dims['height'] - BOTTOM_BAR_HEIGHT:
                break
            
            tab_text = f"{i+1} {tab}"
            if i == self.current_tab:
                self.stdscr.attron(curses.color_pair(COLOR_PAIRS['orange']))
                self.stdscr.addstr(y, x_start + 2, f"▸ {tab_text}")
                self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['orange']))
            else:
                self.stdscr.attron(curses.color_pair(COLOR_PAIRS['muted']))
                self.stdscr.addstr(y, x_start + 2, f"  {tab_text}")
                self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['muted']))
            y += 1
    
    def draw_bottom_bar(self, dims):
        """Draw bottom key bindings bar"""
        y = dims['height'] - 1
        
        self.stdscr.attron(curses.color_pair(COLOR_PAIRS['muted']))
        
        if self.command_mode:
            # Command mode
            prompt = f":{self.command_buffer}"
            self.stdscr.addstr(y, 0, prompt[:dims['width']])
            curses.curs_set(1)
        else:
            # Normal mode - show keybindings
            bindings = "1-7:tabs  j/k:scroll  /:cmd  q:quit"
            palette = "■orange ■pink ■purple ■blue"
            
            self.stdscr.addstr(y, 1, bindings)
            
            # Color palette indicators
            palette_x = dims['width'] - len(palette) - 1
            self.stdscr.addstr(y, palette_x, "■")
            self.stdscr.attron(curses.color_pair(COLOR_PAIRS['orange']))
            self.stdscr.addstr(y, palette_x, "■")
            self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['orange']))
            
            self.stdscr.attron(curses.color_pair(COLOR_PAIRS['muted']))
            self.stdscr.addstr(y, palette_x + 1, "orange ■")
            self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['muted']))
            
            self.stdscr.attron(curses.color_pair(COLOR_PAIRS['pink']))
            self.stdscr.addstr(y, palette_x + 8, "■")
            self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['pink']))
            
            self.stdscr.attron(curses.color_pair(COLOR_PAIRS['muted']))
            self.stdscr.addstr(y, palette_x + 9, "pink ■")
            self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['muted']))
            
            self.stdscr.attron(curses.color_pair(COLOR_PAIRS['purple']))
            self.stdscr.addstr(y, palette_x + 15, "■")
            self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['purple']))
            
            self.stdscr.attron(curses.color_pair(COLOR_PAIRS['muted']))
            self.stdscr.addstr(y, palette_x + 16, "purple ■")
            self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['muted']))
            
            self.stdscr.attron(curses.color_pair(COLOR_PAIRS['blue']))
            self.stdscr.addstr(y, palette_x + 24, "■")
            self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['blue']))
            
            self.stdscr.attron(curses.color_pair(COLOR_PAIRS['muted']))
            self.stdscr.addstr(y, palette_x + 25, "blue")
            
            curses.curs_set(0)
        
        self.stdscr.attroff(curses.color_pair(COLOR_PAIRS['muted']))
    
    def render(self):
        """Main render loop"""
        self.stdscr.clear()
        dims = self.get_dimensions()
        
        # Validate terminal size
        if dims['width'] < MIN_WIDTH or dims['height'] < MIN_HEIGHT:
            msg = f"Terminal too small: {dims['width']}x{dims['height']} (need {MIN_WIDTH}x{MIN_HEIGHT})"
            try:
                self.stdscr.addstr(0, 0, msg[:dims['width']-1])
            except curses.error:
                pass
            self.stdscr.refresh()
            return
        
        # Draw all panels
        try:
            self.draw_top_bar(dims)
            self.draw_main_panel(dims)
            self.draw_right_panel(dims)
            self.draw_bottom_bar(dims)
        except curses.error:
            # Ignore rendering errors from boundary conditions
            pass
        
        self.stdscr.refresh()
    
    def handle_input(self, key):
        """Handle keyboard input"""
        if self.command_mode:
            # Command mode
            if key == 27 or key == ord('q'):  # ESC or q
                self.command_mode = False
                self.command_buffer = ""
            elif key == 10:  # Enter
                self.execute_command(self.command_buffer)
                self.command_mode = False
                self.command_buffer = ""
            elif key == curses.KEY_BACKSPACE or key == 127:
                self.command_buffer = self.command_buffer[:-1]
            elif 32 <= key <= 126:
                self.command_buffer += chr(key)
        else:
            # Normal mode
            if key == ord('q'):
                return False
            elif key == ord('/'):
                self.command_mode = True
                self.command_buffer = ""
            elif ord('1') <= key <= ord('7'):
                self.current_tab = key - ord('1')
            elif key == ord('j'):
                self.scroll_offset += 1
            elif key == ord('k'):
                self.scroll_offset -= 1
        
        return True
    
    def execute_command(self, cmd):
        """Execute entered command"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.main_buffer.append("")
        self.main_buffer.append(f"$ {cmd}")
        self.main_buffer.append(f"[{timestamp}] Command executed: {cmd}")
        self.main_buffer.append("")
        
        # Auto-scroll to bottom
        self.scroll_offset = max(0, len(self.main_buffer) - 20)
    
    def run(self):
        """Main event loop"""
        import time
        last_update = time.time()
        
        while True:
            # Update metrics every second
            current = time.time()
            if current - last_update >= 1.0:
                self.update_metrics()
                last_update = current
            
            self.render()
            
            # Non-blocking input with timeout
            self.stdscr.timeout(100)  # 100ms timeout
            key = self.stdscr.getch()
            if key != -1:
                if not self.handle_input(key):
                    break

# ================================
# ENTRY POINT
# ================================

def main(stdscr):
    """Initialize and run terminal OS"""
    terminal_os = TerminalOS(stdscr)
    terminal_os.run()

if __name__ == '__main__':
    try:
        curses.wrapper(main)
    except KeyboardInterrupt:
        print("\nBlackRoad OS terminated.")
        sys.exit(0)
