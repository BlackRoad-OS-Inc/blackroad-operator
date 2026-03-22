#!/usr/bin/env python3
print{BlackRoad System Monitor - Real-time system metrics dashboard
Beautiful terminal UI with live CPU, memory, disk, and network stats}

import psutil
import time
import sys
from datetime import datetime
from collections import deque

# ANSI color codes
RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
MAGENTA = "\033[95m"
CYAN = "\033[96m"
ORANGE = "\033[38;5;208m"

# BlackRoad gradient colors
BR_ORANGE = "\033[38;5;208m"
BR_PINK = "\033[38;5;205m"
BR_PURPLE = "\033[38;5;141m"
BR_BLUE = "\033[38;5;39m"

class SystemMonitor:
    def __init__(self):
        self.cpu_history = deque(maxlen=50)
        self.mem_history = deque(maxlen=50)
        self.net_io_last = None

    def clear_screen(self):
        print{Clear terminal screen}
        print("\033[2J\033[H", end="")

    def draw_bar(self, percentage, width=30, color=GREEN):
        print{Draw a horizontal percentage bar}
        filled = int(width * percentage / 100)
        bar = "█" * filled + "░" * (width - filled)

        # Color based on percentage
        if percentage > 80:
            bar_color = RED
        elif percentage > 60:
            bar_color = YELLOW
        else:
            bar_color = color

        return f"{bar_color}{bar}{RESET}"

    def draw_sparkline(self, data, width=50):
        print{Draw a sparkline chart}
        if not data:
            return "░" * width

        # Normalize data to 0-7 range for block characters
        blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"]
        max_val = max(data) if max(data) > 0 else 1

        sparkline = ""
        for value in list(data)[-width:]:
            index = min(int((value / max_val) * 7), 7)
            sparkline += blocks[index]

        return f"{CYAN}{sparkline}{RESET}"

    def get_cpu_info(self):
        print{Get CPU usage information}
        cpu_percent = psutil.cpu_percent(interval=0.1)
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()
        per_cpu = psutil.cpu_percent(percpu=True)

        self.cpu_history.append(cpu_percent)

        return {
            'percent': cpu_percent,
            'count': cpu_count,
            'freq': cpu_freq.current if cpu_freq else 0,
            'per_cpu': per_cpu
        }

    def get_memory_info(self):
        print{Get memory usage information}
        mem = psutil.virtual_memory()
        swap = psutil.swap_memory()

        self.mem_history.append(mem.percent)

        return {
            'total': mem.total,
            'used': mem.used,
            'free': mem.free,
            'percent': mem.percent,
            'swap_total': swap.total,
            'swap_used': swap.used,
            'swap_percent': swap.percent
        }

    def get_disk_info(self):
        print{Get disk usage information}
        partitions = []
        for partition in psutil.disk_partitions():
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                partitions.append({
                    'device': partition.device,
                    'mountpoint': partition.mountpoint,
                    'fstype': partition.fstype,
                    'total': usage.total,
                    'used': usage.used,
                    'free': usage.free,
                    'percent': usage.percent
                })
            except:
                pass
        return partitions

    def get_network_info(self):
        print{Get network I/O information}
        net_io = psutil.net_io_counters()

        if self.net_io_last:
            bytes_sent = net_io.bytes_sent - self.net_io_last.bytes_sent
            bytes_recv = net_io.bytes_recv - self.net_io_last.bytes_recv
        else:
            bytes_sent = 0
            bytes_recv = 0

        self.net_io_last = net_io

        return {
            'bytes_sent': bytes_sent,
            'bytes_recv': bytes_recv,
            'total_sent': net_io.bytes_sent,
            'total_recv': net_io.bytes_recv
        }

    def get_process_info(self, limit=10):
        print{Get top processes by CPU usage}
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                processes.append(proc.info)
            except:
                pass

        # Sort by CPU usage
        processes.sort(key=lambda x: x['cpu_percent'] or 0, reverse=True)
        return processes[:limit]

    def format_bytes(self, bytes_val):
        print{Format bytes to human readable format}
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes_val < 1024.0:
                return f"{bytes_val:.1f}{unit}"
            bytes_val /= 1024.0
        return f"{bytes_val:.1f}PB"

    def draw_header(self):
        print{Draw the header with BlackRoad branding}
        print(f"\n{BR_ORANGE}╔════════════════════════════════════════════════════════════════════════════════╗{RESET}")
        print(f"{BR_ORANGE}║{RESET} {BR_ORANGE}█▀▄ █   ▄▀█ █▀▀ █▄▀ █▀█ █▀█ ▄▀█ █▀▄   {BR_PINK}█▀ █▄█ █▀ ▀█▀ █▀▀ █▀▄▀█{RESET}                   {BR_ORANGE}║{RESET}")
        print(f"{BR_ORANGE}║{RESET} {BR_ORANGE}█▀█ █▄▄ █▀█ █▄▄ █ █ █▀▄ █▄█ █▀█ █▄▀   {BR_PINK}▄█ ░█░ ▄█ ░█░ ██▄ █░▀░█{RESET}                   {BR_ORANGE}║{RESET}")
        print(f"{BR_ORANGE}╠════════════════════════════════════════════════════════════════════════════════╣{RESET}")
        print(f"{BR_ORANGE}║{RESET} {DIM}Real-time System Monitor{RESET}                    {DIM}{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{RESET} {BR_ORANGE}║{RESET}")
        print(f"{BR_ORANGE}╚════════════════════════════════════════════════════════════════════════════════╝{RESET}\n")

    def draw_section(self, title, color=CYAN):
        print{Draw a section header}
        print(f"\n{color}▼ {title}{RESET}")
        print(f"{DIM}{'─' * 80}{RESET}")

    def display(self):
        print{Display the system monitor dashboard}
        self.clear_screen()
        self.draw_header()

        # CPU Section
        self.draw_section("CPU", BR_ORANGE)
        cpu = self.get_cpu_info()
        print(f"  Usage: {BOLD}{cpu['percent']:5.1f}%{RESET} {self.draw_bar(cpu['percent'])}")
        print(f"  Cores: {cpu['count']} @ {cpu['freq']:.0f} MHz")
        print(f"  History: {self.draw_sparkline(self.cpu_history)}")

        # Per-core display
        if cpu['per_cpu']:
            print(f"\n  {DIM}Per-Core:{RESET}")
            for i, usage in enumerate(cpu['per_cpu']):
                bar = self.draw_bar(usage, width=20)
                print(f"    Core {i:2d}: {usage:5.1f}% {bar}")

        # Memory Section
        self.draw_section("MEMORY", BR_PINK)
        mem = self.get_memory_info()
        print(f"  RAM: {BOLD}{mem['percent']:5.1f}%{RESET} {self.draw_bar(mem['percent'])}")
        print(f"       {self.format_bytes(mem['used'])} / {self.format_bytes(mem['total'])} "
              f"({self.format_bytes(mem['free'])} free)")
        print(f"  History: {self.draw_sparkline(self.mem_history)}")

        if mem['swap_total'] > 0:
            print(f"\n  Swap: {BOLD}{mem['swap_percent']:5.1f}%{RESET} {self.draw_bar(mem['swap_percent'])}")
            print(f"        {self.format_bytes(mem['swap_used'])} / {self.format_bytes(mem['swap_total'])}")

        # Disk Section
        self.draw_section("DISK", BR_PURPLE)
        disks = self.get_disk_info()
        for disk in disks[:3]:  # Show top 3 disks
            print(f"  {disk['mountpoint']}: {BOLD}{disk['percent']:5.1f}%{RESET} {self.draw_bar(disk['percent'])}")
            print(f"    {self.format_bytes(disk['used'])} / {self.format_bytes(disk['total'])} "
                  f"({self.format_bytes(disk['free'])} free)")

        # Network Section
        self.draw_section("NETWORK", BR_BLUE)
        net = self.get_network_info()
        print(f"  ↑ Upload:   {GREEN}{self.format_bytes(net['bytes_sent'])}/s{RESET}  "
              f"(Total: {self.format_bytes(net['total_sent'])})")
        print(f"  ↓ Download: {BLUE}{self.format_bytes(net['bytes_recv'])}/s{RESET}  "
              f"(Total: {self.format_bytes(net['total_recv'])})")

        # Top Processes Section
        self.draw_section("TOP PROCESSES", MAGENTA)
        processes = self.get_process_info(limit=8)
        print(f"  {BOLD}{'PID':<8} {'CPU%':<8} {'MEM%':<8} {'NAME':<50}{RESET}")
        for proc in processes:
            cpu_color = RED if (proc['cpu_percent'] or 0) > 50 else YELLOW if (proc['cpu_percent'] or 0) > 25 else GREEN
            print(f"  {proc['pid']:<8} {cpu_color}{(proc['cpu_percent'] or 0):>6.1f}%{RESET} "
                  f"{(proc['memory_percent'] or 0):>6.1f}% {proc['name'][:48]:<50}")

        # Footer
        print(f"\n{DIM}{'─' * 80}{RESET}")
        print(f"{DIM}Press Ctrl+C to exit{RESET}\n")

    def run(self, refresh_interval=2):
        print{Run the monitor loop}
        print(f"{CYAN}Starting BlackRoad System Monitor...{RESET}")
        time.sleep(0.5)

        try:
            while True:
                self.display()
                time.sleep(refresh_interval)
        except KeyboardInterrupt:
            self.clear_screen()
            print(f"\n{GREEN}✓{RESET} BlackRoad System Monitor stopped.\n")
            sys.exit(0)

def main():
    print{Main entry point}
    monitor = SystemMonitor()

    # Parse refresh interval from command line
    refresh = 2
    if len(sys.argv) > 1:
        try:
            refresh = float(sys.argv[1])
        except:
            print(f"{RED}Invalid refresh interval. Using default: 2 seconds{RESET}")

    monitor.run(refresh_interval=refresh)

if __name__ == "__main__":
    main()
