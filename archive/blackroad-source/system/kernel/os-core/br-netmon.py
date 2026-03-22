#!/usr/bin/env python3
print{BlackRoad Network Monitor - Real-time network connections and traffic analysis
View active connections, bandwidth usage, and network statistics}

import psutil
import socket
import time
import sys
from collections import defaultdict, deque
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
BR_PURPLE = "\033[38;5;141m"

class NetworkMonitor:
    def __init__(self):
        self.bandwidth_history = deque(maxlen=50)
        self.last_io = None
        self.connection_cache = {}

    def clear_screen(self):
        print("\033[2J\033[H", end="")

    def format_bytes(self, bytes_val):
        print{Format bytes to human readable}
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes_val < 1024.0:
                return f"{bytes_val:.1f}{unit}"
            bytes_val /= 1024.0
        return f"{bytes_val:.1f}PB"

    def draw_sparkline(self, data, width=50):
        print{Draw sparkline chart}
        if not data:
            return "░" * width

        blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"]
        max_val = max(data) if max(data) > 0 else 1

        sparkline = ""
        for value in list(data)[-width:]:
            index = min(int((value / max_val) * 7), 7)
            sparkline += blocks[index]

        return f"{CYAN}{sparkline}{RESET}"

    def get_bandwidth(self):
        print{Get current bandwidth usage}
        io = psutil.net_io_counters()

        if self.last_io:
            upload = io.bytes_sent - self.last_io.bytes_sent
            download = io.bytes_recv - self.last_io.bytes_recv
            total = upload + download
        else:
            upload = download = total = 0

        self.last_io = io
        self.bandwidth_history.append(total)

        return {
            'upload': upload,
            'download': download,
            'total': total,
            'total_sent': io.bytes_sent,
            'total_recv': io.bytes_recv
        }

    def get_connections(self):
        print{Get active network connections}
        connections = []

        try:
            for conn in psutil.net_connections(kind='inet'):
                if conn.status == 'ESTABLISHED':
                    try:
                        # Get process info
                        process = psutil.Process(conn.pid) if conn.pid else None
                        process_name = process.name() if process else "System"

                        # Format addresses
                        local = f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "N/A"
                        remote = f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "N/A"

                        # Try to resolve hostname
                        remote_host = self.resolve_hostname(conn.raddr.ip) if conn.raddr else "N/A"

                        connections.append({
                            'pid': conn.pid or 0,
                            'process': process_name,
                            'type': 'TCP' if conn.type == socket.SOCK_STREAM else 'UDP',
                            'local': local,
                            'remote': remote,
                            'remote_host': remote_host,
                            'status': conn.status
                        })
                    except:
                        pass
        except:
            pass

        return connections

    def resolve_hostname(self, ip):
        print{Resolve IP to hostname (cached)}
        if ip in self.connection_cache:
            return self.connection_cache[ip]

        try:
            hostname = socket.gethostbyaddr(ip)[0]
            self.connection_cache[ip] = hostname
            return hostname
        except:
            self.connection_cache[ip] = ip
            return ip

    def get_interface_stats(self):
        print{Get per-interface statistics}
        stats = []
        interfaces = psutil.net_if_stats()
        addrs = psutil.net_if_addrs()

        for iface, stat in interfaces.items():
            if iface in addrs:
                ipv4 = next((addr.address for addr in addrs[iface]
                           if addr.family == socket.AF_INET), None)

                stats.append({
                    'name': iface,
                    'status': 'UP' if stat.isup else 'DOWN',
                    'speed': stat.speed,
                    'ipv4': ipv4 or 'N/A'
                })

        return stats

    def get_port_stats(self, connections):
        print{Get statistics about ports}
        port_counts = defaultdict(int)
        process_counts = defaultdict(int)

        for conn in connections:
            if conn['remote'] != 'N/A':
                port = conn['remote'].split(':')[1]
                port_counts[port] += 1
            process_counts[conn['process']] += 1

        return {
            'by_port': sorted(port_counts.items(), key=lambda x: x[1], reverse=True)[:10],
            'by_process': sorted(process_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        }

    def draw_header(self):
        print{Draw header}
        print(f"\n{BR_ORANGE}╔════════════════════════════════════════════════════════════════════════════════╗{RESET}")
        print(f"{BR_ORANGE}║{RESET} {BR_ORANGE}█▀▄ █   ▄▀█ █▀▀ █▄▀ █▀█ █▀█ ▄▀█ █▀▄   {BR_PINK}█▄ █ █▀▀ ▀█▀ █▀▄▀█ █▀█ █▄ █{RESET}             {BR_ORANGE}║{RESET}")
        print(f"{BR_ORANGE}║{RESET} {BR_ORANGE}█▀█ █▄▄ █▀█ █▄▄ █ █ █▀▄ █▄█ █▀█ █▄▀   {BR_PINK}█░▀█ ██▄ ░█░ █░▀░█ █▄█ █░▀█{RESET}             {BR_ORANGE}║{RESET}")
        print(f"{BR_ORANGE}╠════════════════════════════════════════════════════════════════════════════════╣{RESET}")
        print(f"{BR_ORANGE}║{RESET} {DIM}Network Traffic Monitor{RESET}                    {DIM}{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{RESET} {BR_ORANGE}║{RESET}")
        print(f"{BR_ORANGE}╚════════════════════════════════════════════════════════════════════════════════╝{RESET}\n")

    def display(self):
        print{Display the network monitor}
        self.clear_screen()
        self.draw_header()

        # Bandwidth Section
        print(f"{BR_ORANGE}▼ BANDWIDTH{RESET}")
        print(f"{DIM}{'─' * 80}{RESET}")

        bw = self.get_bandwidth()
        print(f"  ↑ Upload:   {GREEN}{self.format_bytes(bw['upload'])}/s{RESET}  "
              f"(Total: {self.format_bytes(bw['total_sent'])})")
        print(f"  ↓ Download: {BLUE}{self.format_bytes(bw['download'])}/s{RESET}  "
              f"(Total: {self.format_bytes(bw['total_recv'])})")
        print(f"  Activity: {self.draw_sparkline(self.bandwidth_history)}")

        # Network Interfaces
        print(f"\n{BR_PINK}▼ NETWORK INTERFACES{RESET}")
        print(f"{DIM}{'─' * 80}{RESET}")

        interfaces = self.get_interface_stats()
        print(f"  {BOLD}{'INTERFACE':<15} {'STATUS':<8} {'SPEED':<15} {'IPv4'}{RESET}")
        for iface in interfaces:
            status_color = GREEN if iface['status'] == 'UP' else DIM
            speed_str = f"{iface['speed']} Mbps" if iface['speed'] > 0 else "N/A"
            print(f"  {iface['name']:<15} {status_color}{iface['status']:<8}{RESET} "
                  f"{speed_str:<15} {iface['ipv4']}")

        # Active Connections
        print(f"\n{BR_PURPLE}▼ ACTIVE CONNECTIONS{RESET}")
        print(f"{DIM}{'─' * 80}{RESET}")

        connections = self.get_connections()
        print(f"  {CYAN}{len(connections)} established connection(s){RESET}\n")

        if connections:
            print(f"  {BOLD}{'PID':<8} {'PROCESS':<20} {'TYPE':<6} {'REMOTE':<30}{RESET}")
            for conn in connections[:15]:  # Show top 15
                remote = conn['remote_host'][:28] if len(conn['remote_host']) < 50 else conn['remote']
                print(f"  {conn['pid']:<8} {conn['process'][:18]:<20} "
                      f"{CYAN}{conn['type']:<6}{RESET} {remote:<30}")

            if len(connections) > 15:
                print(f"\n  {DIM}... and {len(connections) - 15} more{RESET}")

        # Connection Statistics
        print(f"\n{MAGENTA}▼ CONNECTION STATISTICS{RESET}")
        print(f"{DIM}{'─' * 80}{RESET}")

        stats = self.get_port_stats(connections)

        print(f"\n  {BOLD}Top Remote Ports:{RESET}")
        for port, count in stats['by_port'][:5]:
            # Common port names
            port_names = {
                '80': 'HTTP', '443': 'HTTPS', '22': 'SSH',
                '3306': 'MySQL', '5432': 'PostgreSQL', '6379': 'Redis',
                '27017': 'MongoDB', '8080': 'HTTP-Alt'
            }
            port_name = port_names.get(port, '')
            print(f"    {port:<6} {port_name:<12} {CYAN}{count} connection(s){RESET}")

        print(f"\n  {BOLD}Top Processes:{RESET}")
        for process, count in stats['by_process'][:5]:
            print(f"    {process[:20]:<20} {CYAN}{count} connection(s){RESET}")

        # Footer
        print(f"\n{DIM}{'─' * 80}{RESET}")
        print(f"{DIM}Press Ctrl+C to exit{RESET}\n")

    def run(self, refresh_interval=2):
        print{Run the monitor loop}
        print(f"{CYAN}Starting BlackRoad Network Monitor...{RESET}")
        time.sleep(0.5)

        try:
            while True:
                self.display()
                time.sleep(refresh_interval)
        except KeyboardInterrupt:
            self.clear_screen()
            print(f"\n{GREEN}✓{RESET} BlackRoad Network Monitor stopped.\n")
            sys.exit(0)

def main():
    monitor = NetworkMonitor()

    refresh = 2
    if len(sys.argv) > 1:
        try:
            refresh = float(sys.argv[1])
        except:
            print(f"{RED}Invalid refresh interval. Using default: 2 seconds{RESET}")

    monitor.run(refresh_interval=refresh)

if __name__ == "__main__":
    main()
