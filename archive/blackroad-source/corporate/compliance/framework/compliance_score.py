#!/usr/bin/env python3
"""BlackRoad Gov — Compliance Scorer.

Scores a repository or artifact against GDPR/CCPA/SOC2/BlackRoad governance policies.
"""

from __future__ import annotations
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


@dataclass
class Finding:
    severity: str  # critical | high | medium | low
    rule: str
    description: str
    file: Optional[str] = None
    line: Optional[int] = None


@dataclass
class ComplianceReport:
    score: int = 100  # 0–100
    findings: list[Finding] = field(default_factory=list)
    passed: list[str] = field(default_factory=list)

    def add_finding(self, finding: Finding):
        self.findings.append(finding)
        deductions = {"critical": 25, "high": 10, "medium": 5, "low": 1}
        self.score = max(0, self.score - deductions.get(finding.severity, 0))

    def add_pass(self, rule: str):
        self.passed.append(rule)

    def to_dict(self) -> dict:
        return {
            "score": self.score,
            "grade": self._grade(),
            "findings": [
                {"severity": f.severity, "rule": f.rule, "description": f.description,
                 "file": f.file, "line": f.line}
                for f in self.findings
            ],
            "passed": self.passed,
        }

    def _grade(self) -> str:
        if self.score >= 90: return "A"
        if self.score >= 80: return "B"
        if self.score >= 70: return "C"
        if self.score >= 60: return "D"
        return "F"


PII_PATTERNS = [
    (re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'), "email"),
    (re.compile(r'\b\d{3}-\d{2}-\d{4}\b'), "ssn"),
    (re.compile(r'\b4[0-9]{12}(?:[0-9]{3})?\b'), "credit_card"),
]

SECRET_PATTERNS = [
    (re.compile(r'(?i)(api[_-]?key|secret|password|token)\s*=\s*["\'][^"\']{8,}["\']'), "hardcoded_secret"),
    (re.compile(r'(?i)sk-[a-zA-Z0-9]{20,}'), "openai_key"),
    (re.compile(r'(?i)ghp_[a-zA-Z0-9]{36}'), "github_pat"),
]


def scan_file(path: Path) -> list[Finding]:
    findings = []
    try:
        text = path.read_text(errors="ignore")
        for i, line in enumerate(text.splitlines(), 1):
            for pattern, name in PII_PATTERNS:
                if pattern.search(line):
                    findings.append(Finding("high", f"pii-{name}", f"Possible {name} in source", str(path), i))
            for pattern, name in SECRET_PATTERNS:
                if pattern.search(line):
                    findings.append(Finding("critical", f"secret-{name}", f"Possible {name}", str(path), i))
    except Exception:
        pass
    return findings


def score_directory(directory: Path) -> ComplianceReport:
    report = ComplianceReport()

    # Check for required governance files
    for required in ["README.md", "LICENSE", "CONTRIBUTING.md"]:
        if (directory / required).exists():
            report.add_pass(f"has-{required.lower()}")
        else:
            report.add_finding(Finding("medium", f"missing-{required.lower()}", f"{required} not found"))

    # Scan source files for PII/secrets
    for ext in ["*.py", "*.js", "*.ts", "*.json", "*.env", "*.yml", "*.yaml"]:
        for f in directory.rglob(ext):
            if ".git" in str(f):
                continue
            for finding in scan_file(f):
                report.add_finding(finding)

    # Check for .env files committed
    for env_file in directory.rglob(".env"):
        if ".git" not in str(env_file):
            report.add_finding(Finding("critical", "env-committed", f".env file committed: {env_file}"))

    return report


def main():
    import argparse
    parser = argparse.ArgumentParser(description="BlackRoad Compliance Scorer")
    parser.add_argument("path", nargs="?", default=".", help="Directory to scan")
    parser.add_argument("--json", action="store_true", help="JSON output")
    args = parser.parse_args()

    report = score_directory(Path(args.path))

    if args.json:
        print(json.dumps(report.to_dict(), indent=2))
    else:
        d = report.to_dict()
        print(f"\n🏛️  BlackRoad Compliance Score: {d['score']}/100 (Grade {d['grade']})")
        print(f"✅ Passed: {len(d['passed'])} checks")
        if d['findings']:
            print(f"⚠️  Findings: {len(d['findings'])}")
            for f in d['findings']:
                icon = "🔴" if f['severity'] == "critical" else "🟡"
                loc = f" [{f['file']}:{f['line']}]" if f.get('file') else ""
                print(f"  {icon} [{f['severity'].upper()}] {f['rule']}: {f['description']}{loc}")
        print()


if __name__ == "__main__":
    main()
