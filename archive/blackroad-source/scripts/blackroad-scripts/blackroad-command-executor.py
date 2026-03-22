#!/usr/bin/env python3
"""
BlackRoad OS - Command Executor (Event → State)

Pure state mutation layer. Takes events, updates state.
NO rendering. NO input. NO I/O.

This is the ONLY place state mutation is allowed.
"""

from typing import Dict, Any
from datetime import datetime
from enum import Enum
import time

# ================================
# EVENT HANDLING
# ================================
# The brainstem of the OS
# Events → State transitions

def handle_event(event: Dict[str, Any], state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main event handler
    
    Takes event, returns updated state
    This is the ONLY function that mutates state
    
    Args:
        event: Event dict with 'type' and 'payload'
        state: Current system state
    
    Returns:
        Updated state dict
    """
    event_type = event.get('type', 'unknown')
    payload = event.get('payload', {})
    
    # Route to appropriate handler
    if event_type == 'mode_switch':
        return handle_mode_switch(state, payload)
    elif event_type == 'key_press':
        return handle_key_press(state, payload)
    elif event_type == 'input_submit':
        return handle_input_submit(state, payload)
    elif event_type == 'scroll':
        return handle_scroll(state, payload)
    elif event_type == 'quit':
        return handle_quit(state, payload)
    elif event_type == 'clear':
        return handle_clear(state, payload)
    elif event_type == 'command_mode':
        return handle_command_mode(state, payload)
    elif event_type == 'agent_update':
        return handle_agent_update(state, payload)
    elif event_type == 'system_message':
        return handle_system_message(state, payload)
    else:
        # Unknown event - log and ignore
        return append_log(state, 'system', f"Unknown event: {event_type}")

# ================================
# MODE SWITCHING
# ================================

def handle_mode_switch(state: Dict, payload: Dict) -> Dict:
    """
    Switch active mode/tab
    
    Mode determines which agents are visible and active
    Resets scroll position to prevent out-of-bounds
    """
    new_mode = payload.get('mode', 'chat')
    
    # Update mode
    # In real implementation, would convert string to Mode enum
    # For now, keep as string for simplicity
    state['mode'] = new_mode
    
    # Reset scroll on mode change
    # Prevents viewing data from previous mode
    if 'cursor' in state:
        state['cursor']['scroll_offset'] = 0
    
    # Log the transition
    state = append_log(state, 'system', f"Switched to {new_mode} mode")
    
    # Mark dirty for redraw
    state['dirty'] = True
    
    return state

# ================================
# KEY PRESS HANDLING
# ================================

def handle_key_press(state: Dict, payload: Dict) -> Dict:
    """
    Handle raw character input
    
    Appends to input buffer if in command mode
    Only printable ASCII chars accepted
    """
    char = payload.get('char', '')
    
    # Handle backspace
    if char == '\x7f' or char == '\x08':
        if state.get('input_buffer', ''):
            state['input_buffer'] = state['input_buffer'][:-1]
            state['dirty'] = True
        return state
    
    # Only accept printable characters in command mode
    if state.get('command_mode', False):
        if 32 <= ord(char) <= 126:  # Printable ASCII
            state['input_buffer'] = state.get('input_buffer', '') + char
            state['dirty'] = True
    
    return state

# ================================
# INPUT SUBMISSION
# ================================

def handle_input_submit(state: Dict, payload: Dict) -> Dict:
    """
    Handle submitted input (command or text)
    
    This is where commands are executed
    Triggers agent state changes
    """
    buffer = state.get('input_buffer', '').strip()
    
    # Clear input buffer and exit command mode
    state['input_buffer'] = ''
    state['command_mode'] = False
    
    if not buffer:
        state['dirty'] = True
        return state
    
    # Log the input
    state = append_log(state, 'command', f"$ {buffer}")
    
    # Parse and execute command
    if buffer.startswith('/'):
        state = execute_command(state, buffer)
    else:
        # Regular text input - simulate agent processing
        state = trigger_agent_processing(state, buffer)
    
    state['dirty'] = True
    return state

def execute_command(state: Dict, command_text: str) -> Dict:
    """
    Execute slash commands
    
    Commands are the user's way to control the system
    Each command has specific state effects
    """
    # Remove leading /
    cmd = command_text[1:].strip()
    tokens = cmd.split()
    
    if not tokens:
        return state
    
    cmd_name = tokens[0].lower()
    args = tokens[1:] if len(tokens) > 1 else []
    
    # Command routing
    if cmd_name == 'help':
        state = append_log(state, 'system', 'Available commands: /help /agents /mode /clear /status /quit')
    
    elif cmd_name == 'agents':
        # List all agents
        agent_list = ', '.join(state.get('agents', {}).keys())
        state = append_log(state, 'system', f"Agents: {agent_list}")
    
    elif cmd_name == 'mode':
        # Switch mode via command
        if args:
            state['mode'] = args[0]
            state = append_log(state, 'system', f"Mode changed to {args[0]}")
        else:
            state = append_log(state, 'system', f"Current mode: {state.get('mode', 'unknown')}")
    
    elif cmd_name == 'clear':
        # Clear log
        state['log'] = []
        state = append_log(state, 'system', 'Log cleared')
    
    elif cmd_name == 'status':
        # Show system status
        metrics = state.get('metrics', {})
        cpu = metrics.get('cpu_percent', 0)
        mem = metrics.get('memory_percent', 0)
        state = append_log(state, 'system', f"CPU: {cpu}%  Memory: {mem}%")
    
    elif cmd_name == 'agent':
        # Show agent details
        if args:
            agent_name = args[0]
            agents = state.get('agents', {})
            if agent_name in agents:
                agent = agents[agent_name]
                status = agent.get('status', 'unknown')
                task = agent.get('task', 'none')
                state = append_log(state, 'system', f"{agent_name}: {status} - {task}")
            else:
                state = append_log(state, 'system', f"Unknown agent: {agent_name}")
        else:
            state = append_log(state, 'system', 'Usage: /agent <name>')
    
    elif cmd_name == 'quit':
        state['running'] = False
        state = append_log(state, 'system', 'Shutting down...')
    
    else:
        state = append_log(state, 'system', f"Unknown command: {cmd_name}")
    
    return state

def trigger_agent_processing(state: Dict, text: str) -> Dict:
    """
    Trigger agent to process input
    
    Simulates agent lifecycle:
    - Agent goes from idle/active → busy
    - Records timestamp for completion check
    - Logs the action
    """
    # Set primary agent (lucidia) to busy
    agents = state.get('agents', {})
    if 'lucidia' in agents:
        agents['lucidia']['status'] = 'busy'
        agents['lucidia']['task'] = f"Processing: {text[:20]}"
        agents['lucidia']['last_active'] = time.time()
        
        state = append_log(state, 'agent', f"lucidia → processing input")
    
    return state

# ================================
# SCROLLING
# ================================

def handle_scroll(state: Dict, payload: Dict) -> Dict:
    """
    Handle scroll navigation (j/k keys)
    
    Updates cursor position within bounds
    Log length determines max scroll
    """
    direction = payload.get('direction', 'down')
    
    if 'cursor' not in state:
        state['cursor'] = {'scroll_offset': 0}
    
    offset = state['cursor']['scroll_offset']
    log_length = len(state.get('log', []))
    
    # Calculate new offset
    if direction == 'down':
        offset += 1
    elif direction == 'up':
        offset -= 1
    
    # Clamp to valid range
    # Max scroll = log length - visible lines (assume 20)
    visible_lines = 20
    max_scroll = max(0, log_length - visible_lines)
    offset = max(0, min(offset, max_scroll))
    
    state['cursor']['scroll_offset'] = offset
    state['dirty'] = True
    
    return state

# ================================
# COMMAND MODE
# ================================

def handle_command_mode(state: Dict, payload: Dict) -> Dict:
    """
    Enter or exit command mode
    
    Command mode changes input behavior:
    - Keystrokes accumulate in buffer
    - Submit executes as command
    - ESC exits mode
    """
    enter = payload.get('enter', True)
    
    state['command_mode'] = enter
    
    if enter:
        state['input_buffer'] = ''
        state = append_log(state, 'system', 'Command mode active (type command, press ESC to cancel)')
    
    state['dirty'] = True
    return state

# ================================
# CLEAR
# ================================

def handle_clear(state: Dict, payload: Dict) -> Dict:
    """
    Clear input buffer
    
    Usually triggered by ESC key
    Exits command mode
    """
    state['input_buffer'] = ''
    state['command_mode'] = False
    state['dirty'] = True
    return state

# ================================
# QUIT
# ================================

def handle_quit(state: Dict, payload: Dict) -> Dict:
    """
    Initiate system shutdown
    
    Sets running flag to False
    Main loop should check this and exit cleanly
    """
    state['running'] = False
    state = append_log(state, 'system', 'Quit signal received')
    state['dirty'] = True
    return state

# ================================
# AGENT UPDATE
# ================================

def handle_agent_update(state: Dict, payload: Dict) -> Dict:
    """
    Update agent state
    
    Used by system or other agents to change agent status
    Maintains agent lifecycle consistency
    """
    agent_name = payload.get('agent', '')
    new_status = payload.get('status', 'idle')
    task = payload.get('task', '')
    
    agents = state.get('agents', {})
    
    if agent_name in agents:
        agents[agent_name]['status'] = new_status
        agents[agent_name]['last_active'] = time.time()
        
        if task:
            agents[agent_name]['task'] = task
        
        state = append_log(state, 'agent', f"{agent_name} → {new_status}")
        state['dirty'] = True
    
    return state

# ================================
# SYSTEM MESSAGE
# ================================

def handle_system_message(state: Dict, payload: Dict) -> Dict:
    """
    Add system message to log
    
    Used for internal logging, errors, warnings
    """
    message = payload.get('message', '')
    level = payload.get('level', 'system')
    
    state = append_log(state, level, message)
    state['dirty'] = True
    
    return state

# ================================
# AGENT LIFECYCLE
# ================================

def update_agent_lifecycle(state: Dict) -> Dict:
    """
    Update agent states based on time
    
    Call this periodically from main loop
    Simulates agent work completion
    
    Rules:
    - Busy agents return to active after work completes
    - Work completion determined by elapsed time
    """
    current_time = time.time()
    agents = state.get('agents', {})
    
    for name, data in agents.items():
        status = data.get('status', 'idle')
        last_active = data.get('last_active', 0)
        
        # If busy for > 2 seconds, mark as complete
        if status == 'busy':
            elapsed = current_time - last_active
            if elapsed > 2.0:
                data['status'] = 'active'
                data['task'] = 'Idle'
                state = append_log(state, 'agent', f"{name} → completed work")
                state['dirty'] = True
    
    return state

# ================================
# LOGGING HELPERS
# ================================

def append_log(state: Dict, level: str, message: str) -> Dict:
    """
    Append entry to log
    
    Logs are append-only, bounded in size
    Each entry has timestamp, level, message
    """
    if 'log' not in state:
        state['log'] = []
    
    entry = {
        'time': datetime.now(),
        'level': level,
        'msg': message,
    }
    
    state['log'].append(entry)
    
    # Enforce max log size (prevent memory growth)
    MAX_LOG_ENTRIES = 1000
    if len(state['log']) > MAX_LOG_ENTRIES:
        state['log'] = state['log'][-MAX_LOG_ENTRIES:]
    
    return state

# ================================
# STATE VALIDATION
# ================================

def validate_state(state: Dict) -> Dict:
    """
    Ensure state has required keys
    
    Call after mutations to prevent errors
    Returns state with defaults filled in
    """
    defaults = {
        'mode': 'chat',
        'cursor': {'scroll_offset': 0},
        'agents': {},
        'log': [],
        'input_buffer': '',
        'command_mode': False,
        'dirty': True,
        'running': True,
    }
    
    for key, value in defaults.items():
        if key not in state:
            state[key] = value
    
    return state

# ================================
# EXAMPLE USAGE
# ================================

if __name__ == "__main__":
    """
    Standalone example showing command executor
    """
    from datetime import datetime
    
    # Create mock state
    state = {
        'mode': 'chat',
        'cursor': {'scroll_offset': 0},
        'agents': {
            'lucidia': {
                'status': 'active',
                'task': 'Memory sync',
                'color': 'purple',
                'last_active': time.time(),
            },
        },
        'log': [
            {'time': datetime.now(), 'level': 'system', 'msg': 'System initialized'},
        ],
        'input_buffer': '',
        'command_mode': False,
        'dirty': True,
        'running': True,
    }
    
    print("BlackRoad OS - Command Executor Demo")
    print("=" * 50)
    print()
    
    # Simulate event sequence
    events = [
        {'type': 'mode_switch', 'payload': {'mode': 'ops'}},
        {'type': 'command_mode', 'payload': {'enter': True}},
        {'type': 'key_press', 'payload': {'char': '/'}},
        {'type': 'key_press', 'payload': {'char': 'h'}},
        {'type': 'key_press', 'payload': {'char': 'e'}},
        {'type': 'key_press', 'payload': {'char': 'l'}},
        {'type': 'key_press', 'payload': {'char': 'p'}},
        {'type': 'input_submit', 'payload': {}},
    ]
    
    for event in events:
        print(f"Event: {event['type']}")
        state = handle_event(event, state)
        print(f"  Mode: {state['mode']}")
        print(f"  Buffer: '{state['input_buffer']}'")
        print(f"  Command mode: {state['command_mode']}")
        if state['log']:
            print(f"  Last log: {state['log'][-1]['msg']}")
        print()
    
    # Show final log
    print("Final log:")
    for entry in state['log']:
        timestamp = entry['time'].strftime("%H:%M:%S")
        print(f"  [{timestamp}] {entry['msg']}")
    
    # Test agent lifecycle
    print("\n" + "=" * 50)
    print("Testing agent lifecycle...")
    
    state['agents']['lucidia']['status'] = 'busy'
    state['agents']['lucidia']['last_active'] = time.time() - 3.0  # 3 seconds ago
    
    print(f"Before: lucidia status = {state['agents']['lucidia']['status']}")
    state = update_agent_lifecycle(state)
    print(f"After: lucidia status = {state['agents']['lucidia']['status']}")
