#!/usr/bin/env python3
"""
RoadChain Security Scanner — attack yourself to defend yourself.

Scans the BlackRoad fleet, audits hardening, registers device identities,
and generates actionable security reports. All results SHA-2048 signed.

Usage:
    python3 roadchain-security-scan.py                  # Full fleet scan + audit
    python3 roadchain-security-scan.py --local          # Audit local machine only
    python3 roadchain-security-scan.py --scan <host>    # Scan specific host
    python3 roadchain-security-scan.py --discover       # Discover unknown devices
    python3 roadchain-security-scan.py --fleet          # Register + scan fleet
    python3 roadchain-security-scan.py --harden <host>  # Audit remote host
    python3 roadchain-security-scan.py --scores         # Show security scores
    python3 roadchain-security-scan.py --alerts         # Show active alerts
    python3 roadchain-security-scan.py --report         # Full security report

BlackRoad OS, Inc. 2026
"""

import sys
import time

from roadchain.security.scanner import NetworkScanner, FLEET
from roadchain.security.hardening import HardeningAuditor
from roadchain.security.device_identity import DeviceRegistry


# ── Colors ────────────────────────────────────────────────────────────
PINK = "\033[38;5;205m"
AMBER = "\033[38;5;214m"
BLUE = "\033[38;5;69m"
VIOLET = "\033[38;5;135m"
GREEN = "\033[38;5;82m"
WHITE = "\033[1;37m"
DIM = "\033[2m"
RED = "\033[38;5;196m"
YELLOW = "\033[38;5;220m"
CYAN = "\033[38;5;87m"
RESET = "\033[0m"


def banner():
    print(f"""
{PINK}╔══════════════════════════════════════════════════════════════╗{RESET}
{PINK}║{RESET}  {WHITE}ROADCHAIN SECURITY SCANNER{RESET} — {AMBER}SHA-2048{RESET}                     {PINK}║{RESET}
{PINK}║{RESET}  {DIM}attack yourself → defend yourself{RESET}                          {PINK}║{RESET}
{PINK}╚══════════════════════════════════════════════════════════════╝{RESET}
""")


def severity_color(severity: str) -> str:
    return {
        "critical": RED,
        "high": AMBER,
        "medium": YELLOW,
        "low": CYAN,
        "info": DIM,
    }.get(severity, RESET)


def score_color(score: int) -> str:
    if score >= 90:
        return GREEN
    elif score >= 70:
        return YELLOW
    elif score >= 50:
        return AMBER
    return RED


def grade_color(grade: str) -> str:
    return {
        "A": GREEN, "B": GREEN, "C": YELLOW, "D": AMBER, "F": RED,
    }.get(grade, RESET)


# ── Commands ──────────────────────────────────────────────────────────

def cmd_local_audit():
    """Audit local machine security."""
    banner()
    print(f"{WHITE}Auditing local machine...{RESET}\n")

    auditor = HardeningAuditor()
    report = auditor.audit_local()

    gc = grade_color(report.grade)
    sc = score_color(report.score)

    print(f"  {WHITE}Security Score:{RESET} {sc}{report.score}/100{RESET}  Grade: {gc}{report.grade}{RESET}")
    print(f"  Checks: {report.checks_passed}/{report.checks_run} passed")
    print()

    if report.findings:
        print(f"  {WHITE}Findings ({len(report.findings)}):{RESET}")
        print(f"  {'─' * 70}")

        for f in sorted(report.findings, key=lambda x: {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}.get(x.severity, 5)):
            sc2 = severity_color(f.severity)
            print(f"  {sc2}[{f.severity.upper():8}]{RESET} {f.title}")
            print(f"             {DIM}{f.detail}{RESET}")
            print(f"             {CYAN}Fix:{RESET} {f.fix}")
            print()
    else:
        print(f"  {GREEN}No findings — all checks passed{RESET}")

    # Update device registry
    dev_reg = DeviceRegistry()
    dev_reg.register(
        name="alexandria", device_type="mac",
        local_ip="192.168.4.28", tailscale_ip="100.91.90.68",
        hardware="M1 MacBook Pro",
    )
    dev_reg.update_score("alexandria", report.score)
    dev_reg.close()


def cmd_scan_host(host: str):
    """Scan a specific host."""
    banner()
    print(f"{WHITE}Scanning {host}...{RESET}\n")

    scanner = NetworkScanner()
    result = scanner.scan_host(host)
    scanner.close()

    _print_scan_result(result)


def cmd_discover():
    """Discover unknown devices on the network."""
    banner()
    print(f"{WHITE}Discovering devices on 192.168.4.0/24...{RESET}")
    print(f"{DIM}(scanning .1 through .100){RESET}\n")

    scanner = NetworkScanner()
    results = scanner.scan_subnet("192.168.4", 1, 100)
    scanner.close()

    known_ips = {info["local"] for info in FLEET.values()}

    known = [r for r in results if r.hostname in FLEET or r.ip in known_ips]
    unknown = [r for r in results if r.hostname not in FLEET and r.ip not in known_ips]

    print(f"  {GREEN}Known devices ({len(known)}):{RESET}")
    for r in known:
        sc = score_color(r.score)
        name = r.hostname or r.ip
        ports = ", ".join(f"{p.port}/{p.service}" for p in r.open_ports[:5])
        print(f"    {sc}[{r.score:3d}]{RESET} {name:<20} {r.ip:<16} {ports}")

    print()
    if unknown:
        print(f"  {RED}UNKNOWN devices ({len(unknown)}):{RESET}")
        for r in unknown:
            ports = ", ".join(f"{p.port}/{p.service}" for p in r.open_ports[:5])
            print(f"    {AMBER}[???]{RESET} {r.ip:<16} {ports}")
            for note in r.notes:
                print(f"          {DIM}{note}{RESET}")

        print()
        print(f"  {AMBER}Action:{RESET} Investigate unknown devices — they may be:")
        print(f"    - IoT devices (TV, printer, smart home)")
        print(f"    - Unauthorized devices on your network")
        print(f"    - Neighbors' devices on shared wifi")
    else:
        print(f"  {GREEN}No unknown devices detected{RESET}")


def cmd_fleet_scan():
    """Register and scan the entire fleet."""
    banner()
    print(f"{WHITE}Scanning BlackRoad Fleet...{RESET}\n")

    dev_reg = DeviceRegistry()
    scanner = NetworkScanner()
    auditor = HardeningAuditor()

    # Register all fleet devices
    fleet_info = {
        "alexandria": {"type": "mac", "local": "192.168.4.28", "ts": "100.91.90.68", "hw": "M1 MacBook Pro"},
        "alice": {"type": "pi", "local": "192.168.4.49", "ts": "100.77.210.18", "hw": "Pi 5 8GB"},
        "lucidia": {"type": "pi", "local": "192.168.4.81", "ts": "100.83.149.86", "hw": "Pi 5 8GB + Hailo-8"},
        "aria": {"type": "pi", "local": "192.168.4.82", "ts": "100.109.14.17", "hw": "Pi 5 8GB"},
        "cecilia": {"type": "pi", "local": "192.168.4.89", "ts": "100.72.180.98", "hw": "Pi 5 8GB + Hailo-8 + 500GB NVMe"},
        "octavia": {"type": "pi", "local": "192.168.4.38", "ts": "100.66.235.47", "hw": "Pi 5 8GB"},
        "shellfish": {"type": "cloud", "local": "174.138.44.45", "ts": "100.94.33.37", "hw": "DigitalOcean Droplet"},
        "gematria": {"type": "cloud", "local": "159.65.43.12", "ts": "100.108.132.8", "hw": "DigitalOcean Droplet"},
    }

    print(f"  {WHITE}Registering fleet identities (SHA-2048)...{RESET}")
    for name, info in fleet_info.items():
        device = dev_reg.register(
            name=name, device_type=info["type"],
            local_ip=info["local"], tailscale_ip=info["ts"],
            hardware=info["hw"],
        )
        print(f"    {GREEN}REG{RESET} {name:<16} {device.short_id}  ({info['type']})")

    print()
    print(f"  {WHITE}Port scanning fleet (local IPs)...{RESET}")
    print(f"  {'─' * 70}")

    results = []
    for name, info in fleet_info.items():
        ip = info["local"]
        # Skip cloud IPs for local scan (use Tailscale for those)
        if info["type"] == "cloud":
            ip = info["ts"]

        result = scanner.scan_host(ip, use_nmap=True)
        result.hostname = name
        results.append(result)

        alive_str = f"{GREEN}UP{RESET}" if result.alive else f"{RED}DOWN{RESET}"
        sc = score_color(result.score)
        ports = ", ".join(f"{p.port}" for p in result.open_ports[:6])
        vulns = len(result.vulnerabilities)
        vuln_str = f" {RED}{vulns} vulns{RESET}" if vulns else ""
        print(f"    {alive_str} {name:<16} {sc}[{result.score:3d}]{RESET}  ports: {ports or 'none'}{vuln_str}")

        # Update device score
        dev_reg.update_score(name, result.score)
        if not result.alive:
            dev_reg.mark_offline(name)

    # Audit local machine
    print()
    print(f"  {WHITE}Hardening audit (local)...{RESET}")
    local_report = auditor.audit_local()
    gc = grade_color(local_report.grade)
    print(f"    alexandria: {gc}{local_report.grade}{RESET} ({local_report.score}/100) — {local_report.checks_passed}/{local_report.checks_run} checks passed")
    dev_reg.update_score("alexandria", local_report.score)

    # Fleet summary
    print()
    stats = dev_reg.stats()
    fleet_scores = scanner.fleet_score()

    print(f"{PINK}{'═' * 70}{RESET}")
    print(f"{WHITE}FLEET SECURITY SUMMARY{RESET}")
    print(f"{PINK}{'═' * 70}{RESET}")
    print(f"  Devices:       {stats['active']} active / {stats['total']} total")
    print(f"  Avg Score:     {score_color(int(fleet_scores['average']))}{fleet_scores['average']:.0f}/100{RESET}")
    if fleet_scores.get("weakest"):
        w = fleet_scores["weakest"]
        print(f"  Weakest:       {RED}{w.get('hostname', w.get('host', ''))}: {w['score']}{RESET}")
    print(f"  Types:         {stats['types']}")

    # Print critical findings
    all_vulns = []
    for r in results:
        for v in r.vulnerabilities:
            v["host"] = r.hostname
            all_vulns.append(v)

    if all_vulns:
        print()
        print(f"  {RED}Vulnerabilities Found ({len(all_vulns)}):{RESET}")
        for v in sorted(all_vulns, key=lambda x: {"critical": 0, "high": 1, "medium": 2}.get(x.get("severity", ""), 3)):
            sc2 = severity_color(v.get("severity", "info"))
            print(f"    {sc2}[{v.get('severity', 'info').upper():8}]{RESET} {v.get('host', '')}: {v.get('issue', v.get('detail', ''))}")
            if v.get("fix"):
                print(f"               {CYAN}Fix:{RESET} {v['fix']}")

    if local_report.findings:
        print()
        critical = [f for f in local_report.findings if f.severity in ("critical", "high")]
        if critical:
            print(f"  {AMBER}Local hardening issues ({len(critical)} critical/high):{RESET}")
            for f in critical:
                sc2 = severity_color(f.severity)
                print(f"    {sc2}[{f.severity.upper():8}]{RESET} {f.title}")
                print(f"               {CYAN}Fix:{RESET} {f.fix}")

    print()
    print(f"  {DIM}All scans SHA-2048 signed and logged to ~/.roadchain-l1/security-scans.db{RESET}")
    print(f"  {DIM}identity > provider — device identity is permanent{RESET}")

    scanner.close()
    dev_reg.close()


def cmd_harden_remote(host: str):
    """Audit a remote host."""
    banner()
    print(f"{WHITE}Hardening audit: {host}...{RESET}\n")

    # Resolve host alias to user@ip
    user = "blackroad"
    target = host
    for name, info in FLEET.items():
        if name == host:
            target = info["local"]
            break

    auditor = HardeningAuditor()
    report = auditor.audit_remote(target, user)

    gc = grade_color(report.grade)
    sc = score_color(report.score)

    print(f"  {WHITE}Security Score:{RESET} {sc}{report.score}/100{RESET}  Grade: {gc}{report.grade}{RESET}")
    print(f"  Checks: {report.checks_passed}/{report.checks_run} passed")
    print()

    if report.findings:
        print(f"  {WHITE}Findings ({len(report.findings)}):{RESET}")
        print(f"  {'─' * 70}")
        for f in sorted(report.findings, key=lambda x: {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}.get(x.severity, 5)):
            sc2 = severity_color(f.severity)
            auto = f" {GREEN}[auto-fix]{RESET}" if f.automated else ""
            print(f"  {sc2}[{f.severity.upper():8}]{RESET} {f.title}{auto}")
            print(f"             {DIM}{f.detail}{RESET}")
            print(f"             {CYAN}Fix:{RESET} {f.fix}")
            print()

        # Show auto-fixable count
        auto_fixable = [f for f in report.findings if f.automated]
        if auto_fixable:
            print(f"  {GREEN}{len(auto_fixable)} findings can be auto-fixed{RESET}")
    else:
        print(f"  {GREEN}All checks passed{RESET}")


def cmd_scores():
    """Show fleet security scores."""
    banner()

    dev_reg = DeviceRegistry()
    devices = dev_reg.list_all()
    stats = dev_reg.stats()
    dev_reg.close()

    if not devices:
        print(f"  {DIM}No devices registered. Run: python3 roadchain-security-scan.py --fleet{RESET}")
        return

    print(f"  {WHITE}Fleet Security Scores{RESET}")
    print(f"  {'─' * 60}")
    print(f"  {'Device':<16} {'Type':<8} {'Score':>6} {'Grade':>6} {'Status':<10} {'SHA-2048 ID'}")
    print(f"  {'─' * 60}")

    for d in sorted(devices, key=lambda x: x.security_score):
        sc = score_color(d.security_score)
        grade = "A" if d.security_score >= 90 else "B" if d.security_score >= 80 else "C" if d.security_score >= 70 else "D" if d.security_score >= 60 else "F"
        gc = grade_color(grade)
        status_color = GREEN if d.status == "active" else RED
        print(f"  {d.name:<16} {d.device_type:<8} {sc}{d.security_score:>5}{RESET}  {gc}{grade:>5}{RESET} {status_color}{d.status:<10}{RESET} {d.short_id}")

    print(f"  {'─' * 60}")
    print(f"  Average: {score_color(int(stats['average_score']))}{stats['average_score']:.0f}/100{RESET}")
    if stats.get("weakest"):
        print(f"  Weakest: {RED}{stats['weakest']['name']}: {stats['weakest']['security_score']}{RESET}")


def cmd_alerts():
    """Show active security alerts."""
    banner()

    scanner = NetworkScanner()
    alerts = scanner.get_alerts(unacknowledged_only=True)
    scanner.close()

    if not alerts:
        print(f"  {GREEN}No active alerts{RESET}")
        return

    print(f"  {RED}Active Security Alerts ({len(alerts)}):{RESET}")
    print(f"  {'─' * 70}")

    for a in alerts:
        sc = severity_color(a["severity"])
        ts = time.strftime("%Y-%m-%d %H:%M", time.localtime(a["created_at"]))
        print(f"  {sc}[{a['severity'].upper():8}]{RESET} {a['host']}: {a['message']}")
        print(f"             {DIM}{ts}{RESET}")
        print()


def cmd_full_report():
    """Generate comprehensive security report."""
    banner()
    print(f"{WHITE}Generating Full Security Report...{RESET}\n")

    # 1. Local audit
    print(f"{WHITE}Phase 1: Local Machine Audit{RESET}")
    print(f"{'─' * 50}")
    auditor = HardeningAuditor()
    local_report = auditor.audit_local()
    gc = grade_color(local_report.grade)
    print(f"  Score: {gc}{local_report.score}/100 ({local_report.grade}){RESET}")
    print(f"  Findings: {len(local_report.findings)}")
    print()

    # 2. Fleet scan
    print(f"{WHITE}Phase 2: Fleet Port Scan{RESET}")
    print(f"{'─' * 50}")
    scanner = NetworkScanner()

    fleet_results = []
    for name, info in FLEET.items():
        # Use local IP for local devices, Tailscale for cloud
        if info["type"] == "cloud":
            ip = info.get("tailscale", info["local"])
        else:
            ip = info["local"]
        result = scanner.scan_host(ip, use_nmap=True)
        result.hostname = name
        fleet_results.append(result)
        alive = f"{GREEN}UP{RESET}" if result.alive else f"{RED}DOWN{RESET}"
        sc = score_color(result.score)
        ports = ", ".join(f"{p.port}/{p.service}" for p in result.open_ports[:6])
        vulns = len(result.vulnerabilities)
        vuln_str = f" {RED}{vulns} vulns{RESET}" if vulns else ""
        print(f"  {alive} {name:<16} {sc}[{result.score:3d}]{RESET}  ports: {ports or 'none'}{vuln_str}")

    print()

    # 2.5. Remote hardening audits for alive fleet devices
    alive_fleet = [r for r in fleet_results if r.alive and r.hostname != "alexandria"]
    harden_reports = {}
    if alive_fleet:
        print(f"{WHITE}Phase 2b: Remote Hardening Audits (SSH){RESET}")
        print(f"{'─' * 50}")
        for r in alive_fleet:
            name = r.hostname
            ip = r.ip
            report_r = auditor.audit_remote(ip, "blackroad")
            harden_reports[name] = report_r
            hc = grade_color(report_r.grade)
            print(f"  {name:<16} {hc}{report_r.grade}{RESET} ({report_r.score}/100)  {report_r.checks_passed}/{report_r.checks_run} checks  {len(report_r.findings)} findings")
        print()

    # 3. Subnet discovery
    print(f"{WHITE}Phase 3: Subnet Discovery (192.168.4.1-100){RESET}")
    print(f"{'─' * 50}")
    subnet_results = scanner.scan_subnet("192.168.4", 1, 100)
    known_ips = {info["local"] for info in FLEET.values()}
    unknown = [r for r in subnet_results if r.ip not in known_ips]
    known_found = [r for r in subnet_results if r.ip in known_ips]
    print(f"  Total hosts found:  {len(subnet_results)}")
    print(f"  Known fleet:        {GREEN}{len(known_found)}{RESET}")
    print(f"  Unknown:            {AMBER}{len(unknown)}{RESET}")
    print()
    if unknown:
        print(f"  {AMBER}Unknown Devices:{RESET}")
        for u in unknown:
            ports = ", ".join(f"{p.port}/{p.service}" for p in u.open_ports[:6])
            risk = RED if u.open_ports else DIM
            label = "SERVICES EXPOSED" if u.open_ports else "stealth/filtered"
            print(f"    {risk}{u.ip:<16}{RESET} {ports or label}")
        print()

    # 4. Comprehensive Summary
    all_vulns = []
    for r in fleet_results:
        for v in r.vulnerabilities:
            v["host"] = r.hostname
            all_vulns.append(v)

    # Include remote hardening findings
    remote_findings = []
    for name, hr in harden_reports.items():
        for f in hr.findings:
            if f.severity in ("critical", "high", "medium"):
                remote_findings.append((name, f))

    total_findings = len(local_report.findings) + len(all_vulns) + len(remote_findings)
    critical = sum(1 for v in all_vulns if v.get("severity") == "critical")
    critical += sum(1 for f in local_report.findings if f.severity == "critical")
    critical += sum(1 for _, f in remote_findings if f.severity == "critical")

    high = sum(1 for v in all_vulns if v.get("severity") == "high")
    high += sum(1 for f in local_report.findings if f.severity == "high")
    high += sum(1 for _, f in remote_findings if f.severity == "high")

    alive_count = sum(1 for r in fleet_results if r.alive)
    dead_count = len(fleet_results) - alive_count
    alive_scores = [r.score for r in fleet_results if r.alive]
    avg_score = sum(alive_scores) / len(alive_scores) if alive_scores else 0

    # Device registry update
    dev_reg = DeviceRegistry()
    for r in fleet_results:
        if r.alive:
            dev_reg.update_score(r.hostname, r.score)
            dev_reg.heartbeat(r.hostname)
        else:
            dev_reg.mark_offline(r.hostname)
    dev_reg.update_score("alexandria", local_report.score)
    dev_reg.heartbeat("alexandria")
    dev_reg.close()

    print(f"{PINK}{'═' * 70}{RESET}")
    print(f"{WHITE}BLACKROAD SECURITY REPORT — {time.strftime('%Y-%m-%d %H:%M')}{RESET}")
    print(f"{PINK}{'═' * 70}{RESET}")
    print()

    # Fleet overview
    print(f"  {WHITE}FLEET STATUS{RESET}")
    print(f"  {'─' * 50}")
    print(f"  Online:         {GREEN}{alive_count}{RESET}/{len(FLEET)} devices")
    print(f"  Offline:        {RED}{dead_count}{RESET} devices")
    for r in fleet_results:
        alive_str = f"{GREEN}UP{RESET}" if r.alive else f"{RED}DOWN{RESET}"
        sc = score_color(r.score) if r.alive else DIM
        ports_str = ", ".join(f"{p.port}" for p in r.open_ports[:6]) if r.open_ports else "---"
        grade_r = harden_reports.get(r.hostname)
        harden_str = f"  harden:{grade_color(grade_r.grade)}{grade_r.grade}{RESET}" if grade_r else ""
        print(f"    {alive_str} {r.hostname:<14} {sc}[{r.score:3d}]{RESET}  ports: {ports_str}{harden_str}")
    print()

    # Local machine
    print(f"  {WHITE}LOCAL MACHINE (alexandria){RESET}")
    print(f"  {'─' * 50}")
    gc = grade_color(local_report.grade)
    print(f"  Score:          {gc}{local_report.score}/100 ({local_report.grade}){RESET}")
    print(f"  Checks:         {local_report.checks_passed}/{local_report.checks_run} passed")
    for f in local_report.findings:
        if f.severity != "info":
            sc2 = severity_color(f.severity)
            print(f"    {sc2}[{f.severity.upper():8}]{RESET} {f.title}")
    print()

    # Network
    print(f"  {WHITE}NETWORK{RESET}")
    print(f"  {'─' * 50}")
    print(f"  Subnet hosts:   {len(subnet_results)} found on 192.168.4.0/24")
    print(f"  Known fleet:    {GREEN}{len(known_found)}{RESET}")
    print(f"  Unknown:        {AMBER}{len(unknown)}{RESET}")
    risky_unknown = [u for u in unknown if u.open_ports]
    if risky_unknown:
        print(f"  Risky unknown:  {RED}{len(risky_unknown)}{RESET} (with open ports)")
        for u in risky_unknown:
            ports = ", ".join(f"{p.port}/{p.service}" for p in u.open_ports)
            print(f"    {RED}>{RESET} {u.ip}: {ports}")
    print()

    # Vulnerabilities
    print(f"  {WHITE}VULNERABILITIES{RESET}")
    print(f"  {'─' * 50}")
    print(f"  Total findings: {total_findings}")
    print(f"  Critical:       {RED}{critical}{RESET}")
    print(f"  High:           {AMBER}{high}{RESET}")
    print()

    if critical > 0 or high > 0:
        print(f"  {RED}ACTION REQUIRED:{RESET}")
        # Port scan vulns
        for v in sorted(all_vulns, key=lambda x: {"critical": 0, "high": 1, "medium": 2}.get(x.get("severity", ""), 3)):
            if v.get("severity") in ("critical", "high"):
                sc2 = severity_color(v["severity"])
                print(f"    {sc2}[{v['severity'].upper():8}]{RESET} {v.get('host', '')}: {v.get('issue', '')}")
                if v.get("fix"):
                    print(f"               {CYAN}Fix:{RESET} {v['fix']}")

        # Remote hardening vulns
        for name, f in sorted(remote_findings, key=lambda x: {"critical": 0, "high": 1, "medium": 2}.get(x[1].severity, 3)):
            if f.severity in ("critical", "high"):
                sc2 = severity_color(f.severity)
                auto = f" {GREEN}[auto-fix]{RESET}" if f.automated else ""
                print(f"    {sc2}[{f.severity.upper():8}]{RESET} {name}: {f.title}{auto}")
                print(f"               {CYAN}Fix:{RESET} {f.fix}")

        # Local vulns
        for f in local_report.findings:
            if f.severity in ("critical", "high"):
                sc2 = severity_color(f.severity)
                print(f"    {sc2}[{f.severity.upper():8}]{RESET} localhost: {f.title}")
                print(f"               {CYAN}Fix:{RESET} {f.fix}")
        print()

    # Overall score
    overall = int((avg_score + local_report.score) / 2) if alive_scores else local_report.score
    oc = score_color(overall)
    og = "A" if overall >= 90 else "B" if overall >= 80 else "C" if overall >= 70 else "D" if overall >= 60 else "F"

    print(f"  {PINK}{'═' * 50}{RESET}")
    print(f"  {WHITE}OVERALL SECURITY GRADE:{RESET}  {grade_color(og)}{og}{RESET}  ({oc}{overall}/100{RESET})")
    print(f"  {PINK}{'═' * 50}{RESET}")
    print()
    print(f"  {DIM}All {len(fleet_results) + len(subnet_results) + 1} scans SHA-2048 signed{RESET}")
    print(f"  {DIM}Stored: ~/.roadchain-l1/security-scans.db{RESET}")
    print(f"  {DIM}Devices: ~/.roadchain-l1/device-identity.db{RESET}")
    print(f"  {DIM}attack yourself → defend yourself{RESET}")

    scanner.close()


def _print_scan_result(result):
    """Pretty-print a scan result."""
    alive = f"{GREEN}UP{RESET}" if result.alive else f"{RED}DOWN{RESET}"
    sc = score_color(result.score)

    print(f"  Host:      {result.hostname or result.host}")
    print(f"  IP:        {result.ip}")
    print(f"  Status:    {alive}")
    print(f"  Score:     {sc}{result.score}/100{RESET}")
    print(f"  Scan ID:   {result.short_id}")
    print(f"  Time:      {result.scan_time:.2f}s")
    print()

    if result.open_ports:
        print(f"  {WHITE}Open Ports:{RESET}")
        for p in result.open_ports:
            version = f" ({p.version})" if p.version else ""
            banner_info = f" [{p.banner[:40]}]" if p.banner else ""
            print(f"    {p.port:>5}/tcp  {p.service:<12} {p.state}{version}{banner_info}")
        print()

    if result.vulnerabilities:
        print(f"  {RED}Vulnerabilities:{RESET}")
        for v in result.vulnerabilities:
            sc2 = severity_color(v.get("severity", "info"))
            print(f"    {sc2}[{v.get('severity', 'info').upper()}]{RESET} {v.get('issue', v.get('detail', ''))}")
            if v.get("fix"):
                print(f"      {CYAN}Fix:{RESET} {v['fix']}")
        print()

    if result.notes:
        print(f"  {DIM}Notes:{RESET}")
        for n in result.notes:
            print(f"    {DIM}{n}{RESET}")


# ── Main ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    args = sys.argv[1:]

    if "--local" in args:
        cmd_local_audit()
    elif "--scan" in args:
        idx = args.index("--scan")
        host = args[idx + 1] if idx + 1 < len(args) else None
        if not host:
            print("Usage: --scan <host>")
            sys.exit(1)
        cmd_scan_host(host)
    elif "--discover" in args:
        cmd_discover()
    elif "--fleet" in args:
        cmd_fleet_scan()
    elif "--harden" in args:
        idx = args.index("--harden")
        host = args[idx + 1] if idx + 1 < len(args) else None
        if not host:
            print("Usage: --harden <host>")
            sys.exit(1)
        cmd_harden_remote(host)
    elif "--scores" in args:
        cmd_scores()
    elif "--alerts" in args:
        cmd_alerts()
    elif "--report" in args:
        cmd_full_report()
    else:
        # Default: full fleet scan
        cmd_fleet_scan()
