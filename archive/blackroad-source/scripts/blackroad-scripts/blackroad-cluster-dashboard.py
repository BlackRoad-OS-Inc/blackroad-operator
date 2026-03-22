#!/usr/bin/env python3
"""
BlackRoad Pi Cluster Dashboard
Monitors: alice@alice, shellfish, lucidia@lucidia, aria64, pi@192.168.4.74 (octavia)
"""

import subprocess
import time
import sys
from datetime import datetime

# BlackRoad color palette
COLORS = {
    'red': '\033[38;2;255;0;102m',
    'orange': '\033[38;2;255;107;0m',
    'yellow': '\033[38;2;255;157;0m',
    'green': '\033[38;2;0;255;0m',
    'blue': '\033[38;2;0;102;255m',
    'purple': '\033[38;2;119;0;255m',
    'reset': '\033[0m',
    'bold': '\033[1m',
}

NODES = [
    {'host': 'alice@alice', 'name': 'alice', 'arch': 'aarch64'},
    {'host': 'shellfish', 'name': 'shellfish', 'arch': 'x86_64'},
    {'host': 'lucidia@lucidia', 'name': 'lucidia', 'arch': 'aarch64'},
    {'host': 'aria64', 'name': 'aria', 'arch': 'aarch64'},
    {'host': 'pi@192.168.4.74', 'name': 'octavia', 'arch': 'aarch64'},
]

def run_ssh(host, command, timeout=2):
    """Run SSH command on remote host"""
    try:
        result = subprocess.run(
            ['ssh', '-o', 'ConnectTimeout=2', '-o', 'StrictHostKeyChecking=no',
             host, command],
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result.stdout.strip() if result.returncode == 0 else None
    except Exception:
        return None

def get_node_info(node):
    """Get detailed info from a node"""
    host = node['host']

    info = {
        'online': False,
        'uptime': 'N/A',
        'temp': 'N/A',
        'cpu_freq': 'N/A',
        'mem_usage': 'N/A',
        'load': 'N/A',
        'pironman': False,
        'octokit': False,
    }

    # Check if online
    uptime = run_ssh(host, 'uptime')
    if not uptime:
        return info

    info['online'] = True

    # Parse uptime
    if 'up' in uptime:
        parts = uptime.split('up')[1].split(',')
        info['uptime'] = parts[0].strip() if parts else 'N/A'

    # Get load
    if 'load average:' in uptime:
        load = uptime.split('load average:')[1].strip()
        info['load'] = load.split(',')[0].strip()

    # Get temperature (Pi-specific)
    if node['arch'] == 'aarch64':
        temp = run_ssh(host, 'vcgencmd measure_temp 2>/dev/null')
        if temp:
            info['temp'] = temp.replace('temp=', '')

        # Get CPU frequency
        freq = run_ssh(host, 'vcgencmd measure_clock arm 2>/dev/null')
        if freq and 'frequency' in freq:
            mhz = int(freq.split('=')[1]) / 1_000_000
            info['cpu_freq'] = f"{mhz:.0f} MHz"

    # Get memory usage
    mem = run_ssh(host, "free -h | grep Mem | awk '{print $3\"/\"$2}'")
    if mem:
        info['mem_usage'] = mem

    # Check for Pironman
    pironman = run_ssh(host, 'which pironman5 2>/dev/null')
    info['pironman'] = bool(pironman)

    # Check for Octokit
    octokit = run_ssh(host, 'test -d ~/octokit && echo yes || echo no')
    info['octokit'] = octokit == 'yes'

    return info

def print_dashboard():
    """Print the cluster dashboard"""
    print(f"\n{COLORS['bold']}🖤🛣️  BlackRoad Pi Cluster Dashboard{COLORS['reset']}")
    print(f"{COLORS['purple']}{'='*80}{COLORS['reset']}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    for node in NODES:
        info = get_node_info(node)

        # Status indicator
        if info['online']:
            status = f"{COLORS['green']}●{COLORS['reset']}"
        else:
            status = f"{COLORS['red']}●{COLORS['reset']}"

        # Node header
        print(f"{status} {COLORS['bold']}{node['name']:<12}{COLORS['reset']} "
              f"({node['arch']:<8}) @ {node['host']}")

        if info['online']:
            print(f"   {COLORS['blue']}Uptime:{COLORS['reset']} {info['uptime']:<15} "
                  f"{COLORS['orange']}Load:{COLORS['reset']} {info['load']:<8} "
                  f"{COLORS['yellow']}Temp:{COLORS['reset']} {info['temp']:<10}")
            print(f"   {COLORS['purple']}CPU:{COLORS['reset']} {info['cpu_freq']:<15} "
                  f"{COLORS['green']}Mem:{COLORS['reset']} {info['mem_usage']:<15}")

            # Feature badges
            badges = []
            if info['pironman']:
                badges.append(f"{COLORS['green']}[Pironman]{COLORS['reset']}")
            if info['octokit']:
                badges.append(f"{COLORS['blue']}[Octokit]{COLORS['reset']}")

            if badges:
                print(f"   {' '.join(badges)}")
        else:
            print(f"   {COLORS['red']}OFFLINE{COLORS['reset']}")

        print()

def main():
    """Main loop"""
    try:
        while True:
            subprocess.run(['clear'])
            print_dashboard()
            print(f"\n{COLORS['purple']}Press Ctrl+C to exit{COLORS['reset']}")
            time.sleep(5)
    except KeyboardInterrupt:
        print(f"\n\n{COLORS['purple']}Dashboard stopped.{COLORS['reset']}\n")
        sys.exit(0)

if __name__ == '__main__':
    main()
