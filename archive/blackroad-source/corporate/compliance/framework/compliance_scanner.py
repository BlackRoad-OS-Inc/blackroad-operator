#!/usr/bin/env python3
"""
Compliance Scanner — GDPR, HIPAA, and SOC2 automated assessment CLI.
Scans code/config directories for compliance signals, tracks scan history
in SQLite, generates reports, and suggests remediation steps.
"""
import argparse
import ast
import json
import os
import re
import sqlite3
import sys
import uuid
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple

DB_PATH = Path.home() / ".blackroad" / "compliance_scanner.db"

# ── Compliance Rule Definitions ───────────────────────────────────────────────

GDPR_RULES: Dict[str, dict] = {
    "GDPR-ART5-1A": {
        "article": "Art. 5(1)(a)", "name": "Lawfulness, Fairness, Transparency",
        "description": "Personal data must be processed lawfully, fairly, and transparently.",
        "check": "privacy_notice", "severity": "HIGH",
        "remediation": "Add clear privacy notices and consent mechanisms.",
    },
    "GDPR-ART5-1E": {
        "article": "Art. 5(1)(e)", "name": "Storage Limitation",
        "description": "Data must not be kept longer than necessary.",
        "check": "data_retention", "severity": "HIGH",
        "remediation": "Implement data retention policies and scheduled deletion.",
    },
    "GDPR-ART5-1F": {
        "article": "Art. 5(1)(f)", "name": "Integrity and Confidentiality",
        "description": "Data must be secured against unauthorised access.",
        "check": "encryption", "severity": "CRITICAL",
        "remediation": "Encrypt data at rest and in transit. Use TLS 1.2+.",
    },
    "GDPR-ART13": {
        "article": "Art. 13", "name": "Information to be Provided",
        "description": "Data subjects must be informed at collection time.",
        "check": "data_subject_info", "severity": "MEDIUM",
        "remediation": "Provide privacy policy URL and contact details at all collection points.",
    },
    "GDPR-ART17": {
        "article": "Art. 17", "name": "Right to Erasure",
        "description": "Data subjects have the right to request deletion.",
        "check": "erasure_mechanism", "severity": "HIGH",
        "remediation": "Implement a user data deletion endpoint or process.",
    },
    "GDPR-ART25": {
        "article": "Art. 25", "name": "Data Protection by Design",
        "description": "Privacy must be built into systems by default.",
        "check": "privacy_by_design", "severity": "MEDIUM",
        "remediation": "Minimise data collection; use pseudonymisation where possible.",
    },
    "GDPR-ART32": {
        "article": "Art. 32", "name": "Security of Processing",
        "description": "Appropriate technical and organisational measures required.",
        "check": "access_control", "severity": "CRITICAL",
        "remediation": "Implement role-based access control, MFA, and audit logging.",
    },
    "GDPR-ART33": {
        "article": "Art. 33", "name": "Breach Notification",
        "description": "Must notify supervisory authority within 72 hours of breach.",
        "check": "breach_process", "severity": "HIGH",
        "remediation": "Document and test a breach notification procedure.",
    },
}

HIPAA_RULES: Dict[str, dict] = {
    "HIPAA-164.312a": {
        "safeguard": "Technical — Access Control",
        "description": "Assign unique user IDs, implement emergency access, auto-logoff.",
        "check": "unique_user_ids", "severity": "CRITICAL",
        "remediation": "Ensure all users have unique credentials; implement session timeouts.",
    },
    "HIPAA-164.312b": {
        "safeguard": "Technical — Audit Controls",
        "description": "Hardware/software activity in systems containing ePHI must be recorded.",
        "check": "audit_logging", "severity": "HIGH",
        "remediation": "Enable comprehensive audit logging for all PHI access events.",
    },
    "HIPAA-164.312c1": {
        "safeguard": "Technical — Integrity",
        "description": "ePHI must not be improperly altered or destroyed.",
        "check": "data_integrity", "severity": "HIGH",
        "remediation": "Implement checksums or digital signatures for ePHI records.",
    },
    "HIPAA-164.312e1": {
        "safeguard": "Technical — Transmission Security",
        "description": "ePHI transmitted over networks must be protected.",
        "check": "tls_in_transit", "severity": "CRITICAL",
        "remediation": "Use TLS 1.2+ for all ePHI transmission. Reject HTTP.",
    },
    "HIPAA-164.308a1": {
        "safeguard": "Administrative — Security Management Process",
        "description": "Risk analysis and risk management must be documented.",
        "check": "risk_assessment", "severity": "HIGH",
        "remediation": "Conduct and document annual risk assessments.",
    },
    "HIPAA-164.308a3": {
        "safeguard": "Administrative — Workforce Security",
        "description": "Authorisation and supervision of workforce members.",
        "check": "access_control", "severity": "HIGH",
        "remediation": "Enforce least-privilege access and regular access reviews.",
    },
    "HIPAA-164.308a5": {
        "safeguard": "Administrative — Security Awareness",
        "description": "Training for all workforce members who access ePHI.",
        "check": "security_training", "severity": "MEDIUM",
        "remediation": "Document annual HIPAA training completion for all staff.",
    },
    "HIPAA-164.310a1": {
        "safeguard": "Physical — Facility Access",
        "description": "Limit physical access to electronic information systems.",
        "check": "physical_security", "severity": "MEDIUM",
        "remediation": "Document physical access policies for server rooms and workstations.",
    },
}

SOC2_RULES: Dict[str, dict] = {
    "SOC2-CC1": {
        "category": "CC1 — Control Environment",
        "description": "Management commitment to integrity and ethical values.",
        "check": "security_policy", "severity": "HIGH",
        "remediation": "Document and publish a formal security policy.",
    },
    "SOC2-CC2": {
        "category": "CC2 — Communication & Information",
        "description": "Relevant information is identified, captured, and communicated.",
        "check": "incident_response", "severity": "HIGH",
        "remediation": "Maintain an incident response plan with defined communication channels.",
    },
    "SOC2-CC3": {
        "category": "CC3 — Risk Assessment",
        "description": "Identifies and analyses risks to achieving objectives.",
        "check": "risk_assessment", "severity": "HIGH",
        "remediation": "Conduct formal risk assessments and document mitigations.",
    },
    "SOC2-CC6": {
        "category": "CC6 — Logical and Physical Access",
        "description": "Logical access security is implemented.",
        "check": "access_control", "severity": "CRITICAL",
        "remediation": "Implement least-privilege, MFA, and regular access reviews.",
    },
    "SOC2-CC7": {
        "category": "CC7 — System Operations",
        "description": "Monitors for indicators of compromise and vulnerabilities.",
        "check": "vulnerability_management", "severity": "HIGH",
        "remediation": "Enable CVE scanning and patch management processes.",
    },
    "SOC2-CC8": {
        "category": "CC8 — Change Management",
        "description": "Controls the lifecycle of system changes.",
        "check": "change_management", "severity": "MEDIUM",
        "remediation": "Use pull requests, code reviews, and change approval processes.",
    },
    "SOC2-A1": {
        "category": "A1 — Availability",
        "description": "System is available for operation and use as agreed.",
        "check": "monitoring", "severity": "HIGH",
        "remediation": "Implement uptime monitoring, SLAs, and alerting.",
    },
    "SOC2-C1": {
        "category": "C1 — Confidentiality",
        "description": "Confidential information is protected during its lifecycle.",
        "check": "encryption", "severity": "CRITICAL",
        "remediation": "Encrypt confidential data at rest and in transit.",
    },
}

ALL_FRAMEWORKS: Dict[str, dict] = {
    "gdpr": GDPR_RULES,
    "hipaa": HIPAA_RULES,
    "soc2": SOC2_RULES,
}

# ── Filesystem Signal Detectors ───────────────────────────────────────────────

_SIGNAL_PATTERNS: Dict[str, List[str]] = {
    "encryption": [
        r"ssl", r"tls", r"https", r"AES", r"RSA", r"encrypt", r"decrypt",
        r"cipher", r"hashlib", r"cryptography", r"fernet", r"bcrypt",
    ],
    "access_control": [
        r"@login_required", r"@auth", r"permission", r"role", r"rbac",
        r"jwt", r"oauth", r"authorize", r"authenticate", r"require_auth",
    ],
    "audit_logging": [
        r"audit", r"log\.info", r"log\.warning", r"log\.error", r"logging",
        r"audit_trail", r"event_log", r"syslog",
    ],
    "data_retention": [
        r"retention", r"ttl", r"expires_at", r"delete_after", r"purge", r"archive",
    ],
    "privacy_notice": [
        r"privacy_policy", r"privacy-policy", r"gdpr", r"consent", r"terms_of_service",
    ],
    "breach_process": [
        r"breach", r"incident_response", r"notify", r"alert_security", r"pagerduty",
    ],
    "data_subject_info": [
        r"privacy_policy", r"data_controller", r"dpo", r"contact.*privacy",
    ],
    "erasure_mechanism": [
        r"delete_account", r"delete_user", r"remove_data", r"right_to_erasure",
        r"account_deletion", r"gdpr_delete",
    ],
    "privacy_by_design": [
        r"pseudonymis", r"anonymis", r"mask", r"redact", r"minimal.*data",
    ],
    "unique_user_ids": [
        r"uuid", r"user_id", r"userid", r"unique.*user", r"user.*unique",
    ],
    "data_integrity": [
        r"checksum", r"hash", r"sha256", r"md5", r"signature", r"integrity",
    ],
    "tls_in_transit": [
        r"ssl_context", r"verify=True", r"certifi", r"https://", r"TLSContext",
    ],
    "risk_assessment": [
        r"risk_assessment", r"threat_model", r"security_review", r"pentest",
    ],
    "security_training": [
        r"training", r"awareness", r"phishing", r"security_policy",
    ],
    "physical_security": [
        r"physical_access", r"keycard", r"badging", r"cctv",
    ],
    "security_policy": [
        r"SECURITY\.md", r"security_policy", r"information_security",
    ],
    "incident_response": [
        r"incident_response", r"runbook", r"playbook", r"on_call",
    ],
    "vulnerability_management": [
        r"dependabot", r"snyk", r"trivy", r"cve", r"nvd", r"pip.audit",
    ],
    "change_management": [
        r"pull_request", r"code_review", r"CHANGELOG", r"CODEOWNERS",
    ],
    "monitoring": [
        r"prometheus", r"grafana", r"datadog", r"cloudwatch", r"healthcheck",
        r"uptime", r"alert", r"monitor",
    ],
}


def _scan_path_for_signal(path: Path, check: str) -> Tuple[bool, List[str]]:
    """Return (found, [matched_files]) for a given signal check in a directory."""
    patterns = _SIGNAL_PATTERNS.get(check, [])
    if not patterns:
        return False, []
    matched = []
    exts = {".py", ".js", ".ts", ".yaml", ".yml", ".json", ".env", ".cfg",
            ".ini", ".toml", ".sh", ".md", ".txt"}
    for fpath in path.rglob("*"):
        if fpath.suffix.lower() not in exts:
            continue
        if any(skip in str(fpath) for skip in [".git", "node_modules", "__pycache__"]):
            continue
        try:
            text = fpath.read_text(errors="replace")
            for pat in patterns:
                if re.search(pat, text, re.IGNORECASE):
                    matched.append(str(fpath.relative_to(path)))
                    break
        except (PermissionError, OSError):
            continue
    return len(matched) > 0, matched


# ── Database ─────────────────────────────────────────────────────────────────

def get_db(path: Path = DB_PATH) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS scans (
            id          TEXT PRIMARY KEY,
            target_path TEXT NOT NULL,
            framework   TEXT NOT NULL,
            score       REAL,
            passed      INTEGER,
            failed      INTEGER,
            scanned_at  TEXT NOT NULL,
            summary     TEXT
        );
        CREATE TABLE IF NOT EXISTS findings (
            id          TEXT PRIMARY KEY,
            scan_id     TEXT NOT NULL,
            rule_id     TEXT NOT NULL,
            status      TEXT NOT NULL,
            severity    TEXT NOT NULL,
            matched_files TEXT,
            note        TEXT,
            FOREIGN KEY(scan_id) REFERENCES scans(id)
        );
    """)
    conn.commit()


# ── Core Scanner ─────────────────────────────────────────────────────────────

@dataclass
class Finding:
    rule_id: str
    name: str
    status: str        # PASS | FAIL | WARN
    severity: str
    description: str
    remediation: str
    matched_files: List[str]


@dataclass
class ScanResult:
    scan_id: str
    target_path: str
    framework: str
    score: float
    passed: int
    failed: int
    findings: List[Finding]
    scanned_at: str


def scan(
    target: str,
    framework: str = "gdpr",
    db_path: Path = DB_PATH,
) -> ScanResult:
    """Scan a directory against a compliance framework."""
    framework = framework.lower()
    if framework not in ALL_FRAMEWORKS:
        raise ValueError(f"Unknown framework '{framework}'. Valid: {list(ALL_FRAMEWORKS)}")
    rules = ALL_FRAMEWORKS[framework]
    target_path = Path(target).resolve()
    if not target_path.exists():
        raise ValueError(f"Target path '{target}' does not exist.")

    findings: List[Finding] = []
    for rule_id, rule in rules.items():
        found, matched_files = _scan_path_for_signal(target_path, rule["check"])
        status = "PASS" if found else "FAIL"
        findings.append(Finding(
            rule_id=rule_id,
            name=rule.get("article") or rule.get("safeguard") or rule.get("category", rule_id),
            status=status,
            severity=rule["severity"],
            description=rule["description"],
            remediation=rule["remediation"],
            matched_files=matched_files,
        ))

    passed = sum(1 for f in findings if f.status == "PASS")
    failed = len(findings) - passed
    score = round(100 * passed / len(findings), 1) if findings else 0.0
    scan_id = str(uuid.uuid4())[:8]
    scanned_at = datetime.now(timezone.utc).isoformat()

    conn = get_db(db_path)
    init_db(conn)
    conn.execute(
        "INSERT INTO scans VALUES (?,?,?,?,?,?,?,?)",
        (scan_id, str(target_path), framework, score, passed, failed, scanned_at,
         json.dumps({"passed": passed, "failed": failed, "score": score})),
    )
    for f in findings:
        conn.execute(
            "INSERT INTO findings VALUES (?,?,?,?,?,?,?)",
            (str(uuid.uuid4())[:8], scan_id, f.rule_id, f.status, f.severity,
             json.dumps(f.matched_files), ""),
        )
    conn.commit()
    conn.close()

    return ScanResult(
        scan_id=scan_id,
        target_path=str(target_path),
        framework=framework,
        score=score,
        passed=passed,
        failed=failed,
        findings=findings,
        scanned_at=scanned_at,
    )


def generate_report(scan_result: ScanResult, fmt: str = "text") -> str:
    """Generate a human-readable or JSON compliance report."""
    if fmt == "json":
        return json.dumps({
            "scan_id": scan_result.scan_id,
            "framework": scan_result.framework.upper(),
            "target": scan_result.target_path,
            "score": f"{scan_result.score}%",
            "passed": scan_result.passed,
            "failed": scan_result.failed,
            "scanned_at": scan_result.scanned_at,
            "findings": [asdict(f) for f in scan_result.findings],
        }, indent=2)

    sev_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    sorted_findings = sorted(
        scan_result.findings,
        key=lambda f: (0 if f.status == "FAIL" else 1, sev_order.get(f.severity, 9)),
    )

    lines = [
        "=" * 70,
        f"  COMPLIANCE REPORT — {scan_result.framework.upper()}",
        "=" * 70,
        f"  Target:    {scan_result.target_path}",
        f"  Scan ID:   {scan_result.scan_id}",
        f"  Date:      {scan_result.scanned_at}",
        f"  Score:     {scan_result.score}% ({scan_result.passed} passed / {scan_result.failed} failed)",
        "=" * 70,
        "",
    ]
    for f in sorted_findings:
        icon = "✅" if f.status == "PASS" else "❌"
        lines.append(f"{icon} [{f.severity}] {f.rule_id} — {f.name}")
        lines.append(f"   {f.description}")
        if f.status == "FAIL":
            lines.append(f"   💡 Remediation: {f.remediation}")
        if f.matched_files:
            lines.append(f"   📁 Matched in: {', '.join(f.matched_files[:3])}"
                         + (" …" if len(f.matched_files) > 3 else ""))
        lines.append("")

    lines += [
        "=" * 70,
        f"  Overall: {'✅ COMPLIANT' if scan_result.score == 100.0 else '⚠️  NON-COMPLIANT'}",
        "=" * 70,
    ]
    return "\n".join(lines)


def fix_report(scan_result: ScanResult) -> str:
    """Generate a remediation action plan for all failing checks."""
    failed = [f for f in scan_result.findings if f.status == "FAIL"]
    if not failed:
        return "✅ No failing checks. Nothing to fix."
    sev_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    failed.sort(key=lambda f: sev_order.get(f.severity, 9))
    lines = [
        f"🔧 REMEDIATION PLAN — {scan_result.framework.upper()}",
        f"   {len(failed)} action(s) required",
        "",
    ]
    for i, f in enumerate(failed, 1):
        lines.append(f"  {i}. [{f.severity}] {f.rule_id} — {f.name}")
        lines.append(f"     Problem:    {f.description}")
        lines.append(f"     Fix:        {f.remediation}")
        lines.append("")
    return "\n".join(lines)


def list_scan_history(framework: Optional[str] = None, db_path: Path = DB_PATH) -> List[dict]:
    conn = get_db(db_path)
    init_db(conn)
    if framework:
        rows = conn.execute(
            "SELECT id, target_path, framework, score, passed, failed, scanned_at "
            "FROM scans WHERE framework=? ORDER BY scanned_at DESC",
            (framework,),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT id, target_path, framework, score, passed, failed, scanned_at "
            "FROM scans ORDER BY scanned_at DESC"
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── CLI ───────────────────────────────────────────────────────────────────────

def cmd_scan(args):
    for fw in args.framework:
        result = scan(args.path, framework=fw)
        report = generate_report(result, fmt=args.format)
        print(report)
        if args.format == "text" and result.score < 100:
            sys.exit(2)


def cmd_report(args):
    conn = get_db()
    init_db(conn)
    row = conn.execute("SELECT * FROM scans WHERE id=?", (args.scan_id,)).fetchone()
    if not row:
        print(f"Scan '{args.scan_id}' not found.", file=sys.stderr)
        sys.exit(1)
    findings_rows = conn.execute(
        "SELECT rule_id, status, severity, matched_files FROM findings WHERE scan_id=?",
        (args.scan_id,),
    ).fetchall()
    conn.close()
    fw = row["framework"]
    rules = ALL_FRAMEWORKS.get(fw, {})
    findings = []
    for fr in findings_rows:
        rule = rules.get(fr["rule_id"], {})
        findings.append(Finding(
            rule_id=fr["rule_id"],
            name=rule.get("article") or rule.get("safeguard") or rule.get("category", fr["rule_id"]),
            status=fr["status"],
            severity=fr["severity"],
            description=rule.get("description", ""),
            remediation=rule.get("remediation", ""),
            matched_files=json.loads(fr["matched_files"] or "[]"),
        ))
    result = ScanResult(
        scan_id=row["id"], target_path=row["target_path"],
        framework=fw, score=row["score"],
        passed=row["passed"], failed=row["failed"],
        findings=findings, scanned_at=row["scanned_at"],
    )
    print(generate_report(result, fmt=args.format))


def cmd_fix(args):
    conn = get_db()
    init_db(conn)
    row = conn.execute("SELECT * FROM scans ORDER BY scanned_at DESC LIMIT 1").fetchone()
    if args.scan_id:
        row = conn.execute("SELECT * FROM scans WHERE id=?", (args.scan_id,)).fetchone()
    if not row:
        print("No scans found.", file=sys.stderr)
        sys.exit(1)
    findings_rows = conn.execute(
        "SELECT rule_id, status, severity, matched_files FROM findings WHERE scan_id=?",
        (row["id"],),
    ).fetchall()
    conn.close()
    fw = row["framework"]
    rules = ALL_FRAMEWORKS.get(fw, {})
    findings = []
    for fr in findings_rows:
        rule = rules.get(fr["rule_id"], {})
        findings.append(Finding(
            rule_id=fr["rule_id"],
            name=rule.get("article") or rule.get("safeguard") or rule.get("category", fr["rule_id"]),
            status=fr["status"], severity=fr["severity"],
            description=rule.get("description", ""),
            remediation=rule.get("remediation", ""),
            matched_files=[],
        ))
    result = ScanResult(
        scan_id=row["id"], target_path=row["target_path"],
        framework=fw, score=row["score"],
        passed=row["passed"], failed=row["failed"],
        findings=findings, scanned_at=row["scanned_at"],
    )
    print(fix_report(result))


def cmd_list(args):
    history = list_scan_history(framework=args.framework or None)
    if not history:
        print("No scan history.")
        return
    for h in history:
        score_icon = "✅" if h["score"] == 100 else ("⚠️ " if h["score"] >= 70 else "❌")
        print(f"{score_icon} [{h['id']}] {h['framework'].upper():<6} "
              f"Score: {h['score']:>5.1f}% | "
              f"Passed: {h['passed']} Failed: {h['failed']} | "
              f"{h['target_path']}")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="compliance_scanner",
        description="🔍  Compliance Scanner — GDPR / HIPAA / SOC2 automated assessment",
    )
    sub = p.add_subparsers(dest="command", required=True)

    # scan
    sc = sub.add_parser("scan", help="Scan a directory for compliance signals")
    sc.add_argument("path", help="Directory to scan")
    sc.add_argument(
        "--framework", nargs="+",
        choices=list(ALL_FRAMEWORKS.keys()),
        default=["gdpr"],
        help="Framework(s) to scan against (default: gdpr)",
    )
    sc.add_argument("--format", choices=["text", "json"], default="text")
    sc.set_defaults(func=cmd_scan)

    # report
    rp = sub.add_parser("report", help="Show report for a previous scan")
    rp.add_argument("scan_id")
    rp.add_argument("--format", choices=["text", "json"], default="text")
    rp.set_defaults(func=cmd_report)

    # fix
    fx = sub.add_parser("fix", help="Show remediation plan for latest (or given) scan")
    fx.add_argument("--scan-id", dest="scan_id", default=None)
    fx.set_defaults(func=cmd_fix)

    # list
    ls = sub.add_parser("list", help="List scan history")
    ls.add_argument("--framework", choices=list(ALL_FRAMEWORKS.keys()))
    ls.set_defaults(func=cmd_list)

    return p


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    try:
        args.func(args)
    except (ValueError, RuntimeError) as exc:
        print(f"❌ Error: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
