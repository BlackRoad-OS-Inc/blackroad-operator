#!/usr/bin/env python3
"""
BlackRoad SSL/TLS Certificate Auditor
Checks certificate validity, expiry, cipher strength

Usage: python ssl_audit.py --hosts hosts.txt
       python ssl_audit.py --host api.blackroad.io
"""

import argparse, ssl, socket, json
from datetime import datetime, timezone

def check_ssl(host: str, port: int = 443) -> dict:
    ctx = ssl.create_default_context()
    result = {"host": host, "port": port}
    try:
        with ctx.wrap_socket(socket.socket(), server_hostname=host) as s:
            s.settimeout(10)
            s.connect((host, port))
            cert = s.getpeercert()
            cipher = s.cipher()

            not_after = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
            not_before = datetime.strptime(cert["notBefore"], "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            days_left = (not_after - now).days

            result.update({
                "status": "ok" if days_left > 30 else ("warning" if days_left > 0 else "expired"),
                "subject": dict(x[0] for x in cert.get("subject", [])),
                "issuer": dict(x[0] for x in cert.get("issuer", [])),
                "not_before": not_before.isoformat(),
                "not_after": not_after.isoformat(),
                "days_left": days_left,
                "cipher": {"name": cipher[0], "protocol": cipher[1], "bits": cipher[2]},
                "san": [v for _, v in cert.get("subjectAltName", [])],
            })
    except ssl.CertificateError as e:
        result.update({"status": "invalid", "error": str(e)})
    except Exception as e:
        result.update({"status": "error", "error": str(e)})
    return result

def grade_result(r: dict) -> str:
    if r["status"] == "error": return "F"
    if r["status"] == "expired": return "F"
    if r["status"] == "invalid": return "D"
    bits = r.get("cipher", {}).get("bits", 0)
    days = r.get("days_left", 0)
    proto = r.get("cipher", {}).get("protocol", "")
    if days > 90 and bits >= 256 and "TLSv1.3" in proto: return "A+"
    if days > 30 and bits >= 128: return "A"
    if days > 14: return "B"
    return "C"

def main():
    parser = argparse.ArgumentParser(description="BlackRoad SSL Auditor")
    parser.add_argument("--host", help="Single host to check")
    parser.add_argument("--hosts", help="File with one host per line")
    parser.add_argument("--port", type=int, default=443)
    args = parser.parse_args()

    hosts = []
    if args.host:
        hosts = [args.host]
    elif args.hosts:
        hosts = [l.strip() for l in open(args.hosts) if l.strip()]

    print(f"{Host:<35} {Grade:<6} {Days
