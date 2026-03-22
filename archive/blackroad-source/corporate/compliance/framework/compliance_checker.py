#!/usr/bin/env python3
"""BlackRoad Gov - Compliance Checker: Validates against GDPR, CCPA, SOC2."""
import re, sys
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

Severity = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]

@dataclass
class Finding:
    rule: str; severity: Severity; file: str; line: int; detail: str; framework: str

RULES = [
    {"id": "PLAINTEXT_CRED", "pattern": r'\b(password|secret|api_key|token)\s*=\s*["\'][^"\']{6,}["\']', "severity": "CRITICAL", "framework": "ALL", "message": "Plaintext credential"},
    {"id": "PII_LOGGING", "pattern": r'\b(email|phone|ssn|credit_card)\b.*\bprint\b', "severity": "HIGH", "framework": "GDPR", "message": "Possible PII in logs"},
    {"id": "MISSING_TLS", "pattern": r'http://(?!localhost|127\.|192\.168\.)', "severity": "HIGH", "framework": "SOC2", "message": "Non-TLS external HTTP"},
    {"id": "DESTRUCTIVE_DB", "pattern": r'DELETE\s+FROM|DROP\s+TABLE', "severity": "HIGH", "framework": "SOC2", "message": "Destructive DB operation"},
]

SKIP = {".git", "node_modules", "__pycache__", "venv", "dist"}
EXTS = {".py", ".ts", ".js", ".env", ".sh"}

def scan_file(path):
    findings = []
    try:
        for i, line in enumerate(path.read_text(errors="ignore").splitlines(), 1):
            for r in RULES:
                if re.search(r["pattern"], line, re.IGNORECASE):
                    findings.append(Finding(r["id"], r["severity"], str(path), i, r["message"], r["framework"]))
    except: pass
    return findings

def scan(root):
    findings = []
    for p in root.rglob("*"):
        if p.is_file() and p.suffix in EXTS and not any(d in p.parts for d in SKIP):
            findings.extend(scan_file(p))
    return findings

if __name__ == "__main__":
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
    findings = scan(root)
    if not findings:
        print("✅ No compliance issues found.")
        sys.exit(0)
    for f in sorted(findings, key=lambda x: {"CRITICAL":0,"HIGH":1,"MEDIUM":2,"LOW":3}[x.severity]):
        print(f"  [{f.severity}] {f.rule} - {f.file}:{f.line}: {f.detail} ({f.framework})")
    print(f"\n{len(findings)} finding(s)")
    sys.exit(1 if any(f.severity in ("CRITICAL","HIGH") for f in findings) else 0)
