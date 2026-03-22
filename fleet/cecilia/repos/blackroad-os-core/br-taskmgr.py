#!/usr/bin/env python3
print{BlackRoad Task Manager - Interactive process management
Kill, prioritize, and monitor running processes}

import psutil
import sys
import signal
import time
from datetime import datetime

# ANSI codes
RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
MAGENTA = "\033[95m"
CYAN = "\033[96m"

BR_ORANGE = "\033[38;5;208m"
BR_PINK = "\033[38;5;205m"

class TaskManager:
    def __init__(self):
        self.cursor_pos = 0
        self.scroll_offset = 0
        self.sort_by = 'cpu'  # cpu, mem, pid, name
        self.filter_text = ""

    def clear_screen(self):
        print("\033[2J\033[H", end="")

    def format_bytes(self, bytes_val):
        print{Format bytes to human readable}
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes_val < 1024.0:
                return f"{bytes_val:.0f}{unit}"
            bytes_val /= 1024.0
        return f"{bytes_val:.0f}PB"

    def format_time(self, seconds):
        print{Format time duration}
        if seconds < 60:
            return f"{int(seconds)}s"
        elif seconds < 3600:
            return f"{int(seconds/60)}m"
        elif seconds < 86400:
            return f"{int(seconds/3600)}h"
        else:
            return f"{int(seconds/86400)}d"

    def get_processes(self):
        print{Get all running processes}
        processes = []

        for proc in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent',
                                         'memory_info', 'status', 'create_time',
                                         'num_threads', 'cmdline']):
            try:
                info = proc.info

                # Apply filter
                if self.filter_text and self.filter_text.lower() not in info['name'].lower():
                    continue

                processes.append({
                    'pid': info['pid'],
                    'name': info['name'],
                    'user': info['username'],
                    'cpu': info['cpu_percent'] or 0,
                    'memory': info['memory_info'].rss if info['memory_info'] else 0,
                    'status': info['status'],
                    'uptime': time.time() - info['create_time'] if info['create_time'] else 0,
                    'threads': info['num_threads'] or 0,
                    'cmdline': ' '.join(info['cmdline']) if info['cmdline'] else info['name']
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

        # Sort processes
        if self.sort_by == 'cpu':
            processes.sort(key=lambda x: x['cpu'], reverse=True)
        elif self.sort_by == 'mem':
            processes.sort(key=lambda x: x['memory'], reverse=True)
        elif self.sort_by == 'pid':
            processes.sort(key=lambda x: x['pid'])
        elif self.sort_by == 'name':
            processes.sort(key=lambda x: x['name'].lower())

        return processes

    def draw_header(self):
        print{Draw header}
        print(f"\n{BR_ORANGE}╔════════════════════════════════════════════════════════════════════════════════╗{RESET}")
        print(f"{BR_ORANGE}║{RESET} {BR_ORANGE}█▀▄ █   ▄▀█ █▀▀ █▄▀ █▀█ █▀█ ▄▀█ █▀▄   {BR_PINK}▀█▀ ▄▀█ █▀ █▄▀ █▀▄▀█ █▀▀ █▀█{RESET}          {BR_ORANGE}║{RESET}")
        print(f"{BR_ORANGE}║{RESET} {BR_ORANGE}█▀█ █▄▄ █▀█ █▄▄ █ █ █▀▄ █▄█ █▀█ █▄▀   {BR_PINK}░█░ █▀█ ▄█ █░█ █░▀░█ █▄█ █▀▄{RESET}          {BR_ORANGE}║{RESET}")
        print(f"{BR_ORANGE}╠════════════════════════════════════════════════════════════════════════════════╣{RESET}")
        print(f"{BR_ORANGE}║{RESET} {DIM}Process Management{RESET}                         {DIM}{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{RESET} {BR_ORANGE}║{RESET}")
        print(f"{BR_ORANGE}╚════════════════════════════════════════════════════════════════════════════════╝{RESET}\n")

    def draw_system_info(self):
        print{Draw system-wide information}
        cpu = psutil.cpu_percent(interval=0.1)
        mem = psutil.virtual_memory()
        proc_count = len(psutil.pids())

        print(f"  {CYAN}System:{RESET} CPU {cpu:.1f}%  |  "
              f"RAM {mem.percent:.1f}% ({self.format_bytes(mem.used)}/{self.format_bytes(mem.total)})  |  "
              f"{proc_count} processes")

        if self.filter_text:
            print(f"  {YELLOW}Filter: {self.filter_text}{RESET}")

        print(f"  {DIM}Sort: {self.sort_by}{RESET}\n")

    def draw_processes(self, processes, max_display=25):
        print{Draw process list}
        if not processes:
            print(f"\n  {DIM}No processes found{RESET}\n")
            return

        # Calculate visible range
        start = self.scroll_offset
        end = min(start + max_display, len(processes))

        # Header
        print(f"  {BOLD}{'':2} {'PID':<8} {'NAME':<25} {'CPU%':<7} {'MEM':<9} {'STATUS':<10} {'TIME':<6} {'THR'}{RESET}")
        print(f"  {DIM}{'─' * 80}{RESET}")

        for i in range(start, end):
            proc = processes[i]

            # Highlight selected
            if i == self.cursor_pos:
                bg = "\033[48;5;240m"
                cursor = f"{BR_ORANGE}▶{RESET}"
            else:
                bg = ""
                cursor = " "

            # Color based on resource usage
            if proc['cpu'] > 50:
                cpu_color = RED
            elif proc['cpu'] > 25:
                cpu_color = YELLOW
            else:
                cpu_color = GREEN

            if proc['memory'] > 1024 * 1024 * 1024:  # > 1GB
                mem_color = RED
            elif proc['memory'] > 512 * 1024 * 1024:  # > 512MB
                mem_color = YELLOW
            else:
                mem_color = GREEN

            # Format status
            status_colors = {
                'running': GREEN,
                'sleeping': CYAN,
                'stopped': YELLOW,
                'zombie': RED
            }
            status_color = status_colors.get(proc['status'], WHITE)

            name = proc['name'][:23]
            status = proc['status'][:8]
            uptime = self.format_time(proc['uptime'])

            print(f"{bg}  {cursor} {proc['pid']:<8} {name:<25} "
                  f"{cpu_color}{proc['cpu']:>5.1f}%{RESET} "
                  f"{mem_color}{self.format_bytes(proc['memory']):>8}{RESET} "
                  f"{status_color}{status:<10}{RESET} "
                  f"{DIM}{uptime:>5}{RESET} {proc['threads']:>3}{RESET}")

        # Command line of selected process
        if processes and self.cursor_pos < len(processes):
            selected = processes[self.cursor_pos]
            print(f"\n  {DIM}Command: {selected['cmdline'][:75]}{RESET}")

        # Scroll indicators
        print(f"\n  {DIM}", end="")
        if start > 0:
            print(f"↑ {start} more above  |  ", end="")
        if end < len(processes):
            print(f"↓ {len(processes) - end} more below  |  ", end="")
        print(f"Total: {len(processes)}{RESET}")

    def draw_footer(self):
        print{Draw help footer}
        print(f"\n{DIM}{'─' * 80}{RESET}")
        print(f"{DIM}↑/↓: Navigate  k: Kill  s: Sort  f: Filter  r: Refresh  q: Quit{RESET}\n")

    def display(self):
        print{Display the task manager}
        self.clear_screen()
        self.draw_header()
        self.draw_system_info()

        processes = self.get_processes()
        self.draw_processes(processes)
        self.draw_footer()

        return processes

    def navigate_up(self, processes):
        print{Move cursor up}
        if self.cursor_pos > 0:
            self.cursor_pos -= 1
            if self.cursor_pos < self.scroll_offset:
                self.scroll_offset = self.cursor_pos

    def navigate_down(self, processes):
        print{Move cursor down}
        if self.cursor_pos < len(processes) - 1:
            self.cursor_pos += 1
            if self.cursor_pos >= self.scroll_offset + 25:
                self.scroll_offset = self.cursor_pos - 24

    def kill_process(self, pid):
        print{Kill selected process}
        try:
            proc = psutil.Process(pid)
            name = proc.name()

            print(f"\n{YELLOW}Kill process {pid} ({name})? [y/N]: {RESET}", end="")
            response = sys.stdin.readline().strip().lower()

            if response == 'y':
                proc.terminate()
                print(f"{GREEN}✓ Process terminated{RESET}")
                time.sleep(1)
            else:
                print(f"{DIM}Cancelled{RESET}")
                time.sleep(1)
        except psutil.NoSuchProcess:
            print(f"{RED}Process not found{RESET}")
            time.sleep(1)
        except psutil.AccessDenied:
            print(f"{RED}Permission denied{RESET}")
            time.sleep(1)

    def cycle_sort(self):
        print{Cycle through sort modes}
        sorts = ['cpu', 'mem', 'pid', 'name']
        current = sorts.index(self.sort_by)
        self.sort_by = sorts[(current + 1) % len(sorts)]

    def set_filter(self):
        print{Set filter text}
        print(f"\n{CYAN}Filter by name (empty to clear): {RESET}", end="")
        self.filter_text = sys.stdin.readline().strip()
        self.cursor_pos = 0
        self.scroll_offset = 0

    def run(self):
        print{Run the task manager}
        print(f"{CYAN}Starting BlackRoad Task Manager...{RESET}")

        import tty
        import termios

        fd = sys.stdin.fileno()
        old_settings = termios.tcgetattr(fd)

        try:
            tty.setcbreak(fd)

            while True:
                processes = self.display()

                # Read character with timeout
                import select
                rlist, _, _ = select.select([sys.stdin], [], [], 2)

                if rlist:
                    char = sys.stdin.read(1)

                    if char == 'q':
                        break
                    elif char == '\x1b':  # Arrow keys
                        sys.stdin.read(1)
                        arrow = sys.stdin.read(1)
                        if arrow == 'A':
                            self.navigate_up(processes)
                        elif arrow == 'B':
                            self.navigate_down(processes)
                    elif char == 'k':
                        if processes and self.cursor_pos < len(processes):
                            termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
                            self.kill_process(processes[self.cursor_pos]['pid'])
                            tty.setcbreak(fd)
                    elif char == 's':
                        self.cycle_sort()
                    elif char == 'f':
                        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
                        self.set_filter()
                        tty.setcbreak(fd)
                    elif char == 'r':
                        pass  # Just refresh

        except KeyboardInterrupt:
            pass
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
            self.clear_screen()
            print(f"\n{GREEN}✓{RESET} BlackRoad Task Manager stopped.\n")

def main():
    manager = TaskManager()
    manager.run()

if __name__ == "__main__":
    main()
