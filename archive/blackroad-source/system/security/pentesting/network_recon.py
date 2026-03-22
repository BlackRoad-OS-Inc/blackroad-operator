#!/usr/bin/env python3
"""
BlackRoad Network Reconnaissance Tool
Authorized use only — internal security assessment

Usage:
    python network_recon.py --target 192.168.4.0/24
    python network_recon.py --target 192.168.4.38 --ports 22,80,443,8080,8787

IMPORTANT: Only use against systems you own or have explicit written permission to test.
"""

import argparse, socket, subprocess, ipaddress, sys, json
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

COMMON_PORTS = [21,22,23,25,53,80,110,143,443,445,993,995,3000,3306,5432,6379,8080,8443,8787,9200]


def ping_host(ip: str) -> bool:
    result = subprocess.run(["ping", "-c", "1", "-W", "1", str(ip)],
                            capture_output=True, timeout=3)
    return result.returncode == 0


def scan_port(ip: str, port: int, timeout: float = 1.0) -> dict:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(timeout)
            result = s.connect_ex((ip, port))
            if result == 0:
                banner = ""
                try:
                    s.send(b"HEAD / HTTP/1.0\r\n\r\n")
                    banner = s.recv(64).decode("utf-8", errors="ignore").split("\n")[0].strip()
                except:
                    pass
                return {"port": port, "state": "open", "banner": banner}
    except:
        pass
    return {"port": port, "state": "closed"}


def resolve_hostname(ip: str) -> str:
    try:
        return socket.gethostbyaddr(str(ip))[0]
    except:
        return ""


def scan_host(ip: str, ports: list) -> dict:
    hostname = resolve_hostname(ip)
    open_ports = []
    with ThreadPoolExecutor(max_workers=50) as ex:
        futures = {ex.submit(scan_port, str(ip), p): p for p in ports}
        for future in as_completed(futures):
            result = future.result()
            if result["state"] == "open":
                open_ports.append(result)
    return {"ip": str(ip), "hostname": hostname, "open_ports": sorted(open_ports, key=lambda x: x["port"])}


def discover_hosts(network: str) -> list:
    net = ipaddress.IPv4Network(network, strict=False)
    alive = []
    with ThreadPoolExecutor(max_workers=50) as ex:
        futures = {ex.submit(ping_host, str(ip)): str(ip) for ip in net.hosts()}
        for future in as_completed(futures):
            ip = futures[future]
            if future.result():
                alive.append(ip)
    return sorted(alive)


def main():
    parser = argparse.ArgumentParser(description="BlackRoad Network Recon")
    parser.add_argument("--target", required=True, help="IP, CIDR, or hostname")
    parser.add_argument("--ports", help="Comma-separated ports (default: common ports)")
    parser.add_argument("--output", choices=["text", "json"], default="text")
    parser.add_argument("--no-ping", action="store_true", help="Skip host discovery")
    args = parser.parse_args()

    ports = [int(p) for p in args.ports.split(",")] if args.ports else COMMON_PORTS

    print(f"[*] BlackRoad Network Recon  {datetime.utcnow().isoformat()}Z")
    print(f"[*] Target: {args.target}  Ports: {len(ports)}")
    print("[*] AUTHORIZED USE ONLY\n")

    # Determine targets
    try:
        net = ipaddress.IPv4Network(args.target, strict=False)
        if not args.no_ping and net.num_addresses > 1:
            print(f"[*] Discovering live hosts in {args.target}...")
            targets = discover_hosts(args.target)
            print(f"[*] {len(targets)} hosts responding to ping\n")
        else:
            targets = [str(ip) for ip in net.hosts()] if net.num_addresses > 1 else [args.target]
    except ValueError:
        targets = [args.target]

    results = []
    for target in targets:
        print(f"[*] Scanning {target}...")
        result = scan_host(target, ports)
        results.append(result)
        if result["open_ports"]:
            hostname = f" ({result[\"hostname\"]})" if result["hostname"] else ""
            print(f"  ● {target}{hostname}")
            for p in result["open_ports"]:
                banner = f" — {p[\"banner\"]}" if p["banner"] else ""
                print(f"    {p[\"port\"]:>5}/tcp  OPEN{banner}")
        else:
            print(f"  ○ {target} — no open ports found")

    if args.output == "json":
        print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()

