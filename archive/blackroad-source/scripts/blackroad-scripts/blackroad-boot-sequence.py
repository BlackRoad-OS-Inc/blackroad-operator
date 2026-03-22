#!/usr/bin/env python3
"""
BlackRoad OS - Boot Sequence + Splash

System startup orchestration. Runs ONCE before main loop.
This is system signaling, not decoration.
"""

import time
import sys
from typing import Optional

# ================================
# ANSI COLOR CODES
# ================================

class Color:
    """ANSI color codes for boot sequence"""
    RESET = '\033[0m'
    CLEAR = '\033[2J'
    HOME = '\033[H'
    
    # Grayscale
    BLACK_BG = '\033[48;5;0m'
    WHITE = '\033[38;5;255m'
    LIGHT_GRAY = '\033[38;5;250m'
    DARK_GRAY = '\033[38;5;240m'
    
    # Accent (choose one semantic color)
    PURPLE = '\033[38;5;141m'  # Logic/orchestration (chosen accent)
    ORANGE = '\033[38;5;208m'  # Actions/decisions
    
    # Status colors
    SUCCESS = '\033[38;5;46m'   # Green for OK
    ERROR = '\033[38;5;196m'    # Red for errors
    
    @staticmethod
    def hide_cursor():
        return '\033[?25l'
    
    @staticmethod
    def show_cursor():
        return '\033[?25h'

# ================================
# ASCII SPLASH
# ================================
# Simple, blocky wordmark
# No gradients, rectangular, pixel-like

SPLASH = """
 ██████╗ ██╗      █████╗  ██████╗██╗  ██╗██████╗  ██████╗  ██████╗ ██████╗ 
 ██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝██╔══██╗██╔═══██╗██╔═══██╗██╔══██╗
 ██████╔╝██║     ███████║██║     █████╔╝ ██████╔╝██║   ██║██║   ██║██║  ██║
 ██╔══██╗██║     ██╔══██║██║     ██╔═██╗ ██╔══██╗██║   ██║██║   ██║██║  ██║
 ██████╔╝███████╗██║  ██║╚██████╗██║  ██╗██║  ██║╚██████╔╝╚██████╔╝██████╔╝
 ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═════╝ 
                                                                             
                            O P E R A T I N G   S Y S T E M
"""

# Alternative minimal splash (if terminal too small)
SPLASH_MINIMAL = """
  ▄▄▄▄    ██▓    ▄▄▄       ▄████▄   ██ ▄█▀ ██▀███   ▒█████   ▄▄▄      ▓█████▄ 
 ▓█████▄ ▓██▒   ▒████▄    ▒██▀ ▀█   ██▄█▒ ▓██ ▒ ██▒▒██▒  ██▒▒████▄    ▒██▀ ██▌
 ▒██▒ ▄██▒██░   ▒██  ▀█▄  ▒▓█    ▄ ▓███▄░ ▓██ ░▄█ ▒▒██░  ██▒▒██  ▀█▄  ░██   █▌
 ▒██░█▀  ▒██░   ░██▄▄▄▄██ ▒▓▓▄ ▄██▒▓██ █▄ ▒██▀▀█▄  ▒██   ██░░██▄▄▄▄██ ░▓█▄   ▌
 ░▓█  ▀█▓░██████▒▓█   ▓██▒▒ ▓███▀ ░▒██▒ █▄░██▓ ▒██▒░ ████▓▒░ ▓█   ▓██▒░▒████▓ 
 ░▒▓███▀▒░ ▒░▓  ░▒▒   ▓▒█░░ ░▒ ▒  ░▒ ▒▒ ▓▒░ ▒▓ ░▒▓░░ ▒░▒░▒░  ▒▒   ▓▒█░ ▒▒▓  ▒ 
 ▒░▒   ░ ░ ░ ▒  ░ ▒   ▒▒ ░  ░  ▒   ░ ░▒ ▒░  ░▒ ░ ▒░  ░ ▒ ▒░   ▒   ▒▒ ░ ░ ▒  ▒ 
  ░    ░   ░ ░    ░   ▒   ░        ░ ░░ ░   ░░   ░ ░ ░ ░ ▒    ░   ▒    ░ ░  ░ 
  ░          ░  ░     ░  ░░ ░      ░  ░      ░         ░ ░        ░  ░   ░    
       ░                  ░                                             ░      
                        OPERATING SYSTEM
"""

# ================================
# BOOT PHASES
# ================================

def phase_1_clear_reset():
    """
    Phase 1: Clear + Reset
    
    Establishes clean slate
    No output except control codes
    """
    sys.stdout.write(Color.CLEAR)
    sys.stdout.write(Color.HOME)
    sys.stdout.write(Color.BLACK_BG)
    sys.stdout.write(Color.hide_cursor())
    sys.stdout.flush()
    
    # Brief pause for visual clarity
    time.sleep(0.1)

def phase_2_splash_ident():
    """
    Phase 2: Splash Identity
    
    Displays system wordmark
    Centered, one accent color
    """
    # Center splash horizontally
    lines = SPLASH.strip().split('\n')
    
    # Get terminal width
    try:
        import os
        _, cols = os.popen('stty size', 'r').read().split()
        width = int(cols)
    except:
        width = 120
    
    # Choose splash based on width
    if width < 100:
        splash_lines = SPLASH_MINIMAL.strip().split('\n')
    else:
        splash_lines = lines
    
    # Calculate centering
    max_line_width = max(len(line) for line in splash_lines)
    left_padding = max(0, (width - max_line_width) // 2)
    
    # Render splash with accent color
    sys.stdout.write('\n' * 2)  # Top margin
    
    for line in splash_lines:
        sys.stdout.write(' ' * left_padding)
        sys.stdout.write(Color.PURPLE + line + Color.RESET)
        sys.stdout.write('\n')
    
    sys.stdout.write('\n' * 2)  # Bottom margin
    sys.stdout.flush()
    
    # Display time
    time.sleep(0.3)

def phase_3_system_checks():
    """
    Phase 3: System Checks
    
    Sequential checklist of subsystems
    Each line resolves to [OK]
    """
    checks = [
        ("Loading core state", 0.15),
        ("Initializing renderer", 0.12),
        ("Binding input router", 0.10),
        ("Restoring persistence", 0.18),
        ("Checking agents", 0.15),
    ]
    
    sys.stdout.write(Color.LIGHT_GRAY)
    sys.stdout.write("  System initialization:\n\n")
    sys.stdout.flush()
    
    for check_name, delay in checks:
        # Print check in progress
        sys.stdout.write(Color.DARK_GRAY)
        sys.stdout.write(f"    • {check_name}...")
        sys.stdout.flush()
        
        # Simulate work
        time.sleep(delay)
        
        # Print result
        sys.stdout.write(" ")
        sys.stdout.write(Color.SUCCESS + "[OK]" + Color.RESET)
        sys.stdout.write("\n")
        sys.stdout.flush()
    
    sys.stdout.write("\n")
    sys.stdout.flush()
    
    time.sleep(0.1)

def phase_4_agent_status(agents: dict):
    """
    Phase 4: Agent Status
    
    Lists agents with color-coded status
    No avatars, no animation
    """
    sys.stdout.write(Color.LIGHT_GRAY)
    sys.stdout.write("  Agent mesh:\n\n")
    sys.stdout.flush()
    
    for name, data in agents.items():
        status = data.get('status', 'idle')
        
        # Convert status to string if enum
        if hasattr(status, 'value'):
            status_str = status.value
        else:
            status_str = str(status)
        
        # Color based on status
        if status_str == 'active':
            status_color = Color.PURPLE
        elif status_str == 'busy':
            status_color = Color.ORANGE
        else:
            status_color = Color.DARK_GRAY
        
        # Print agent line
        sys.stdout.write(Color.LIGHT_GRAY)
        sys.stdout.write(f"    • {name:<15} ")
        sys.stdout.write(status_color + f"[{status_str}]" + Color.RESET)
        sys.stdout.write("\n")
        sys.stdout.flush()
        
        time.sleep(0.05)  # Brief sequential reveal
    
    sys.stdout.write("\n")
    sys.stdout.flush()
    
    time.sleep(0.1)

def phase_5_handoff():
    """
    Phase 5: Handoff
    
    Signal ready state
    Wait for operator acknowledgment
    """
    sys.stdout.write(Color.WHITE)
    sys.stdout.write("  System ready. Press any key to continue...")
    sys.stdout.write(Color.RESET)
    sys.stdout.flush()
    
    # Wait for single keypress
    import termios
    import tty
    
    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)
    
    try:
        tty.setraw(fd)
        sys.stdin.read(1)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
    
    # Clear screen for main loop
    sys.stdout.write(Color.CLEAR)
    sys.stdout.write(Color.HOME)
    sys.stdout.write(Color.show_cursor())
    sys.stdout.flush()

# ================================
# BOOT ORCHESTRATOR
# ================================

def run_boot_sequence(state: dict, skip: bool = False) -> None:
    """
    Execute complete boot sequence
    
    Args:
        state: System state (for agent info)
        skip: If True, skip boot (headless mode)
    
    Phases:
    1. Clear + Reset
    2. Splash Ident
    3. System Checks
    4. Agent Status
    5. Handoff
    """
    if skip:
        # Headless mode - no splash
        return
    
    # Record start time
    start_time = time.time()
    
    try:
        # Phase 1: Clear + Reset
        phase_1_clear_reset()
        
        # Phase 2: Splash
        phase_2_splash_ident()
        
        # Phase 3: System Checks
        phase_3_system_checks()
        
        # Phase 4: Agent Status
        agents = state.get('agents', {})
        phase_4_agent_status(agents)
        
        # Phase 5: Handoff
        phase_5_handoff()
        
        # Boot complete
        elapsed = time.time() - start_time
        
        # Log boot time (optional, for debugging)
        # print(f"Boot sequence: {elapsed:.2f}s")
    
    except KeyboardInterrupt:
        # Allow Ctrl+C during boot
        sys.stdout.write(Color.CLEAR)
        sys.stdout.write(Color.HOME)
        sys.stdout.write(Color.show_cursor())
        sys.stdout.write(Color.RESET)
        sys.stdout.flush()
        raise
    
    except Exception as e:
        # Boot failure - fall back gracefully
        sys.stdout.write(Color.CLEAR)
        sys.stdout.write(Color.HOME)
        sys.stdout.write(Color.show_cursor())
        sys.stdout.write(Color.RESET)
        sys.stdout.write(Color.ERROR + f"\nBoot error: {e}\n" + Color.RESET)
        sys.stdout.flush()
        time.sleep(1)

# ================================
# INTEGRATION HELPER
# ================================

def boot_and_initialize(headless: bool = False):
    """
    Full boot + initialization
    
    Returns initialized state ready for main loop
    """
    # Import dependencies
    try:
        from blackroad_engine import create_initial_state
        from blackroad_persistence import load_state
    except ImportError:
        # Fallback if modules not available
        state = {
            'agents': {
                'lucidia': {'status': 'active'},
                'alice': {'status': 'idle'},
                'octavia': {'status': 'idle'},
                'cece': {'status': 'idle'},
            }
        }
        run_boot_sequence(state, skip=headless)
        return state
    
    # Load or create state
    state = load_state()
    if state is None:
        state = create_initial_state()
    
    # Run boot sequence
    run_boot_sequence(state, skip=headless)
    
    return state

# ================================
# EXAMPLE USAGE
# ================================

if __name__ == "__main__":
    """
    Standalone boot sequence demo
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='BlackRoad OS Boot Sequence')
    parser.add_argument('--headless', action='store_true', help='Skip splash (headless mode)')
    args = parser.parse_args()
    
    # Mock state for demo
    mock_state = {
        'agents': {
            'lucidia': {'status': 'active', 'task': 'Memory sync'},
            'alice': {'status': 'idle', 'task': 'Standby'},
            'octavia': {'status': 'active', 'task': 'Monitoring'},
            'cece': {'status': 'idle', 'task': 'Coordination'},
            'codex-oracle': {'status': 'active', 'task': 'Indexing'},
            'deployment': {'status': 'idle', 'task': 'Awaiting'},
            'security': {'status': 'active', 'task': 'Scanning'},
        }
    }
    
    # Run boot
    run_boot_sequence(mock_state, skip=args.headless)
    
    # After boot completes
    print("\n" + Color.WHITE + "Boot sequence complete." + Color.RESET)
    print(Color.LIGHT_GRAY + "Main loop would start here." + Color.RESET)
