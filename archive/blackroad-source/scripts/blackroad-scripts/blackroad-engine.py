#!/usr/bin/env python3
"""
BlackRoad OS - Core Engine
Terminal-native operating system state machine

This is the CORE. Not the UI.
Manages state, events, and deterministic transitions.
"""

from datetime import datetime
from typing import Dict, List, Any, Callable
from enum import Enum
import time
import psutil
import os

# ================================
# STATE MODEL
# ================================
# Single source of truth
# Everything the system knows lives here

class AgentStatus(Enum):
    ACTIVE = "active"
    IDLE = "idle"
    BUSY = "busy"
    ERROR = "error"

class Mode(Enum):
    CHAT = "chat"
    GITHUB = "github"
    PROJECTS = "projects"
    SALES = "sales"
    WEB = "web"
    OPS = "ops"
    COUNCIL = "council"

def create_initial_state() -> Dict[str, Any]:
    """
    Initialize system state
    
    This is the ONLY place default state is defined.
    No hidden initialization elsewhere.
    """
    return {
        # Current active mode/tab
        "mode": Mode.CHAT,
        
        # Cursor and focus
        "cursor": {
            "panel": "main",  # main, right, command
            "position": 0,
            "scroll_offset": 0,
        },
        
        # Agent registry with state
        # Color encodes semantic role, not decoration
        "agents": {
            "lucidia": {
                "status": AgentStatus.ACTIVE,
                "color": "purple",  # logic/orchestration
                "task": "Memory sync",
                "last_active": time.time(),
            },
            "alice": {
                "status": AgentStatus.IDLE,
                "color": "blue",  # system/IO
                "task": "Standby",
                "last_active": time.time(),
            },
            "octavia": {
                "status": AgentStatus.ACTIVE,
                "color": "orange",  # actions/decisions
                "task": "Monitoring",
                "last_active": time.time(),
            },
            "cece": {
                "status": AgentStatus.ACTIVE,
                "color": "pink",  # memory/state
                "task": "Coordination",
                "last_active": time.time(),
            },
            "codex-oracle": {
                "status": AgentStatus.ACTIVE,
                "color": "purple",
                "task": "Indexing",
                "last_active": time.time(),
            },
            "deployment": {
                "status": AgentStatus.IDLE,
                "color": "blue",
                "task": "Awaiting",
                "last_active": time.time(),
            },
            "security": {
                "status": AgentStatus.ACTIVE,
                "color": "orange",
                "task": "Scanning",
                "last_active": time.time(),
            },
        },
        
        # System log (immutable append-only)
        "log": [
            {"time": datetime.now(), "level": "system", "msg": "System initialized"},
            {"time": datetime.now(), "level": "system", "msg": "Memory system online"},
            {"time": datetime.now(), "level": "system", "msg": "Agent mesh ready"},
            {"time": datetime.now(), "level": "system", "msg": "7 agents active"},
        ],
        
        # Input state
        "input_buffer": "",
        "command_mode": False,
        
        # Render flag
        # Set to True when state changes, cleared after render
        "dirty": True,
        
        # System metrics (live data)
        "metrics": get_live_metrics(),
        
        # Process monitoring
        "processes": [],
        "process_filter": "",
        
        # Runtime metadata
        "running": True,
        "start_time": time.time(),
        "frame_count": 0,
    }

# ================================
# EVENT SYSTEM
# ================================
# Pure state transitions
# Each handler takes state, returns new state
# NO side effects, NO rendering, NO IO

class EventType(Enum):
    KEY_PRESS = "key_press"
    MODE_SWITCH = "mode_switch"
    INPUT_SUBMIT = "input_submit"
    AGENT_UPDATE = "agent_update"
    SYSTEM_MESSAGE = "system_message"
    QUIT = "quit"

def handle_key_press(state: Dict, key: int) -> Dict:
    """
    Handle raw key input
    Routes to appropriate handler based on current mode
    """
    new_state = state.copy()
    
    if new_state["command_mode"]:
        # Command mode input
        if key == 27:  # ESC
            new_state["command_mode"] = False
            new_state["input_buffer"] = ""
            new_state["dirty"] = True
        elif key == 10:  # Enter
            new_state = handle_input_submit(new_state, new_state["input_buffer"])
            new_state["command_mode"] = False
            new_state["input_buffer"] = ""
        elif key == 127 or key == 8:  # Backspace
            new_state["input_buffer"] = new_state["input_buffer"][:-1]
            new_state["dirty"] = True
        elif 32 <= key <= 126:  # Printable chars
            new_state["input_buffer"] += chr(key)
            new_state["dirty"] = True
    else:
        # Normal mode input
        if key == ord('q'):
            new_state["running"] = False
        elif key == ord('/'):
            new_state["command_mode"] = True
            new_state["input_buffer"] = ""
            new_state["dirty"] = True
        elif ord('1') <= key <= ord('7'):
            mode_idx = key - ord('1')
            modes = list(Mode)
            if mode_idx < len(modes):
                new_state = handle_mode_switch(new_state, modes[mode_idx])
        elif key == ord('j'):
            new_state["cursor"]["scroll_offset"] += 1
            new_state["dirty"] = True
        elif key == ord('k'):
            new_state["cursor"]["scroll_offset"] = max(0, new_state["cursor"]["scroll_offset"] - 1)
            new_state["dirty"] = True
    
    return new_state

def handle_mode_switch(state: Dict, new_mode: Mode) -> Dict:
    """
    Switch active mode/tab
    Resets scroll position to prevent out-of-bounds
    """
    new_state = state.copy()
    new_state["mode"] = new_mode
    new_state["cursor"]["scroll_offset"] = 0
    new_state["dirty"] = True
    
    # Log mode switch
    new_state["log"].append({
        "time": datetime.now(),
        "level": "system",
        "msg": f"Switched to {new_mode.value} mode"
    })
    
    return new_state

def handle_input_submit(state: Dict, command: str) -> Dict:
    """
    Process submitted command
    Simulates agent activation and response
    """
    new_state = state.copy()
    
    # Log command
    new_state["log"].append({
        "time": datetime.now(),
        "level": "command",
        "msg": f"$ {command}"
    })
    
    # Simulate agent processing
    # In real system, this would dispatch to agent logic
    if command.strip():
        # Set lucidia to busy (simulating processing)
        if "lucidia" in new_state["agents"]:
            new_state["agents"]["lucidia"]["status"] = AgentStatus.BUSY
            new_state["agents"]["lucidia"]["task"] = f"Processing: {command[:20]}"
        
        # Log response
        new_state["log"].append({
            "time": datetime.now(),
            "level": "agent",
            "msg": f"Command queued: {command}"
        })
    
    new_state["dirty"] = True
    return new_state

def handle_agent_update(state: Dict, agent_name: str, new_status: AgentStatus, task: str = None) -> Dict:
    """
    Update agent state
    Used for simulating agent lifecycle
    """
    new_state = state.copy()
    
    if agent_name in new_state["agents"]:
        new_state["agents"][agent_name]["status"] = new_status
        new_state["agents"][agent_name]["last_active"] = time.time()
        
        if task:
            new_state["agents"][agent_name]["task"] = task
        
        # Log state change
        new_state["log"].append({
            "time": datetime.now(),
            "level": "agent",
            "msg": f"{agent_name} → {new_status.value}"
        })
        
        new_state["dirty"] = True
    
    return new_state

def handle_system_message(state: Dict, level: str, message: str) -> Dict:
    """
    Add system message to log
    Pure state update, no IO
    """
    new_state = state.copy()
    
    new_state["log"].append({
        "time": datetime.now(),
        "level": level,
        "msg": message
    })
    
    new_state["dirty"] = True
    return new_state

# ================================
# LIVE SYSTEM MONITORING
# ================================
# Real system metrics using psutil

def get_live_metrics() -> Dict[str, Any]:
    """
    Fetch live system metrics
    Returns real CPU, memory, disk, network stats
    """
    try:
        # CPU
        cpu_percent = psutil.cpu_percent(interval=0.1)
        cpu_count = psutil.cpu_count()
        
        # Memory
        mem = psutil.virtual_memory()
        memory_used = mem.used / (1024**3)  # GB
        memory_total = mem.total / (1024**3)  # GB
        memory_percent = mem.percent
        
        # Disk
        disk = psutil.disk_usage('/')
        disk_used = disk.used / (1024**3)  # GB
        disk_total = disk.total / (1024**3)  # GB
        disk_percent = disk.percent
        
        # Network
        net_io = psutil.net_io_counters()
        bytes_sent = net_io.bytes_sent / (1024**2)  # MB
        bytes_recv = net_io.bytes_recv / (1024**2)  # MB
        
        # Load average (Unix only)
        try:
            load_avg = os.getloadavg()
        except (AttributeError, OSError):
            load_avg = (0, 0, 0)
        
        return {
            "cpu_percent": round(cpu_percent, 1),
            "cpu_count": cpu_count,
            "memory_used": round(memory_used, 2),
            "memory_total": round(memory_total, 2),
            "memory_percent": round(memory_percent, 1),
            "disk_used": round(disk_used, 2),
            "disk_total": round(disk_total, 2),
            "disk_percent": round(disk_percent, 1),
            "network_sent_mb": round(bytes_sent, 2),
            "network_recv_mb": round(bytes_recv, 2),
            "load_avg_1m": round(load_avg[0], 2),
            "load_avg_5m": round(load_avg[1], 2),
            "load_avg_15m": round(load_avg[2], 2),
            "timestamp": time.time(),
        }
    except Exception as e:
        # Fallback if psutil fails
        return {
            "cpu_percent": 0,
            "cpu_count": 0,
            "memory_used": 0,
            "memory_total": 0,
            "memory_percent": 0,
            "disk_used": 0,
            "disk_total": 0,
            "disk_percent": 0,
            "network_sent_mb": 0,
            "network_recv_mb": 0,
            "load_avg_1m": 0,
            "load_avg_5m": 0,
            "load_avg_15m": 0,
            "error": str(e),
            "timestamp": time.time(),
        }

def get_live_processes(limit: int = 20, sort_by: str = "cpu") -> List[Dict]:
    """
    Get top processes by CPU or memory
    Returns list of process info dicts
    """
    processes = []
    
    try:
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'status']):
            try:
                pinfo = proc.info
                processes.append({
                    "pid": pinfo['pid'],
                    "name": pinfo['name'][:30],  # Truncate long names
                    "cpu": round(pinfo['cpu_percent'] or 0, 1),
                    "memory": round(pinfo['memory_percent'] or 0, 1),
                    "status": pinfo['status'],
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        # Sort by requested metric
        if sort_by == "cpu":
            processes.sort(key=lambda x: x['cpu'], reverse=True)
        elif sort_by == "memory":
            processes.sort(key=lambda x: x['memory'], reverse=True)
        
        return processes[:limit]
    except Exception as e:
        return [{"pid": 0, "name": f"Error: {e}", "cpu": 0, "memory": 0, "status": "error"}]

def update_live_metrics(state: Dict) -> Dict:
    """
    Update state with fresh system metrics
    Called periodically by main loop
    """
    new_state = state.copy()
    new_state["metrics"] = get_live_metrics()
    new_state["processes"] = get_live_processes()
    new_state["dirty"] = True
    return new_state

# ================================
# AGENT SIMULATION
# ================================
# Simulates agent lifecycle for demo
# In production, this would be real agent orchestration

def simulate_agent_activity(state: Dict) -> Dict:
    """
    Simulate agent status changes
    This mimics what real agents would do
    
    Real implementation would:
    - Check task queues
    - Update based on actual work
    - Handle errors and retries
    """
    new_state = state.copy()
    current_time = time.time()
    
    # For each busy agent, check if work should complete
    for agent_name, agent_data in new_state["agents"].items():
        if agent_data["status"] == AgentStatus.BUSY:
            # Simulate work completion after 2 seconds
            time_since_active = current_time - agent_data["last_active"]
            if time_since_active > 2.0:
                new_state = handle_agent_update(
                    new_state,
                    agent_name,
                    AgentStatus.ACTIVE,
                    "Idle"
                )
    
    return new_state

# ================================
# RENDER CONTRACT
# ================================
# Rendering is separate from state
# This function signature is what UI layer must implement

def render_to_string(state: Dict) -> str:
    """
    Pure render function
    Takes state, returns ANSI string representation
    
    This is a MINIMAL example.
    Real UI layer would be more sophisticated.
    """
    lines = []
    
    # Header
    lines.append("=" * 80)
    lines.append(f"BLACKROAD OS - {state['mode'].value.upper()}")
    lines.append("=" * 80)
    lines.append("")
    
    # Live system metrics
    m = state["metrics"]
    lines.append("SYSTEM METRICS (LIVE):")
    lines.append(f"  CPU:     {m['cpu_percent']}% ({m['cpu_count']} cores)  Load: {m.get('load_avg_1m', 0):.2f}")
    lines.append(f"  Memory:  {m['memory_used']:.1f} GB / {m['memory_total']:.1f} GB ({m['memory_percent']}%)")
    lines.append(f"  Disk:    {m['disk_used']:.1f} GB / {m['disk_total']:.1f} GB ({m['disk_percent']}%)")
    lines.append(f"  Network: ↑{m['network_sent_mb']:.1f} MB  ↓{m['network_recv_mb']:.1f} MB")
    lines.append("")
    
    # Top processes
    lines.append("TOP PROCESSES:")
    for proc in state["processes"][:10]:
        lines.append(f"  {proc['pid']:<8} {proc['name']:<30} CPU:{proc['cpu']:>5.1f}%  MEM:{proc['memory']:>5.1f}%")
    lines.append("")
    
    # Agents
    lines.append("AGENTS:")
    for name, data in state["agents"].items():
        status_indicator = "●" if data["status"] == AgentStatus.ACTIVE else "○"
        lines.append(f"  {status_indicator} {name:<15} {data['status'].value:<10} {data['task']}")
    lines.append("")
    
    # Recent log
    lines.append("RECENT LOG:")
    for entry in state["log"][-5:]:
        timestamp = entry["time"].strftime("%H:%M:%S")
        lines.append(f"  [{timestamp}] {entry['msg']}")
    lines.append("")
    
    # Input
    if state["command_mode"]:
        lines.append(f":{state['input_buffer']}_")
    else:
        lines.append("Press / for command, q to quit, 1-7 to switch modes")
    
    lines.append("=" * 80)
    
    return "\n".join(lines)

# ================================
# MAIN LOOP
# ================================
# Event loop example
# Real implementation would integrate with curses or direct terminal control

def run_event_loop(
    state: Dict,
    get_input: Callable[[], int],
    render_fn: Callable[[Dict], None],
    tick_rate: float = 0.1
) -> None:
    """
    Main event loop
    
    Args:
        state: Initial system state
        get_input: Function that returns key code (non-blocking)
        render_fn: Function that renders state to screen
        tick_rate: Seconds between ticks
    
    This is the heart of the OS.
    Every iteration:
    1. Check for input
    2. Update state
    3. Update metrics
    4. Simulate agents
    5. Render if dirty
    6. Clear dirty flag
    """
    last_metric_update = time.time()
    metric_update_interval = 1.0  # Update metrics every second
    
    while state["running"]:
        # Increment frame counter
        state["frame_count"] += 1
        
        # Process input (non-blocking)
        key = get_input()
        if key != -1:
            state = handle_key_press(state, key)
        
        # Update live metrics periodically
        current_time = time.time()
        if current_time - last_metric_update >= metric_update_interval:
            state = update_live_metrics(state)
            last_metric_update = current_time
        
        # Simulate agent activity
        state = simulate_agent_activity(state)
        
        # Render if state changed
        if state["dirty"]:
            render_fn(state)
            state["dirty"] = False
        
        # Tick
        time.sleep(tick_rate)

# ================================
# UTILITY / INSPECTION
# ================================

def dump_state(state: Dict) -> str:
    """
    Serialize state for debugging
    Makes entire system state inspectable
    """
    import json
    
    # Convert enums and datetime for JSON
    def serialize(obj):
        if isinstance(obj, (Mode, AgentStatus)):
            return obj.value
        elif isinstance(obj, datetime):
            return obj.isoformat()
        return str(obj)
    
    return json.dumps(state, default=serialize, indent=2)

def get_metrics(state: Dict) -> Dict:
    """
    Extract runtime metrics
    Useful for monitoring and debugging
    """
    uptime = time.time() - state["start_time"]
    
    return {
        "uptime_seconds": uptime,
        "frame_count": state["frame_count"],
        "fps": state["frame_count"] / uptime if uptime > 0 else 0,
        "log_entries": len(state["log"]),
        "active_agents": sum(1 for a in state["agents"].values() if a["status"] == AgentStatus.ACTIVE),
        "current_mode": state["mode"].value,
    }

# ================================
# EXAMPLE INTEGRATION
# ================================

if __name__ == "__main__":
    """
    Standalone example
    Shows how to wire engine to simple text output
    
    For real terminal UI, replace render_to_string with curses renderer
    """
    import sys
    import select
    
    # Initialize
    state = create_initial_state()
    
    print("BlackRoad OS Engine Demo")
    print("(Non-interactive mode - press Ctrl+C to quit)")
    print()
    
    # Simple render function for demo
    def simple_render(s):
        output = render_to_string(s)
        # In terminal, would clear screen here
        print("\n" + output)
    
    # Simulate some activity
    state = handle_system_message(state, "system", "Engine started")
    state = handle_mode_switch(state, Mode.CHAT)
    state = handle_input_submit(state, "test command")
    
    # Render final state
    simple_render(state)
    
    print("\n--- STATE DUMP ---")
    print(dump_state(state))
    
    print("\n--- METRICS ---")
    metrics = get_metrics(state)
    for key, value in metrics.items():
        print(f"{key}: {value}")
