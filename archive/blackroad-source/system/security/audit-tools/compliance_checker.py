#!/usr/bin/env python3
"""
BlackRoad Compliance Checker — automated SOC2/GDPR/CCPA compliance scanning.
"""

import json
import subprocess
import os
from pathlib import Path
from datetime import datetime


CHECKS = {
    "soc2": {
        "CC1.1": {
            "name": "Security Policy Exists",
            "check": lambda: Path("SECURITY.md").exists() or Path("docs/security.md").exists(),
            "remediation": "Create SECURITY.md documenting security policies"
        },
        "CC2.1": {
            "name": "Change Management Process",
            "check": lambda: Path(".github/PULL_REQUEST_TEMPLATE.md").exists(),
            "remediation": "Add .github/PULL_REQUEST_TEMPLATE.md"
        },
        "CC6.1": {
            "name": "Encryption in Transit",
            "check": lambda: _check_https_in_configs(),
            "remediation": "Ensure all service URLs use HTTPS"
        },
        "CC6.7": {
            "name": "No Hardcoded Secrets",
            "check": lambda: not _check_hardcoded_secrets(),
            "remediation": "Remove all hardcoded API keys, tokens, passwords"
        },
        "CC7.1": {
            "name": ".gitignore Exists",
            "check": lambda: Path(".gitignore").exists(),
            "remediation": "Create .gitignore with .env, *.key, secrets/"
        },
    },
    "gdpr": {
        "GDPR-7": {
            "name": "Privacy Policy Linked",
            "check": lambda: any(Path(".").glob("**/PRIVACY*")),
            "remediation": "Add PRIVACY.md or link to privacy policy"
        },
        "GDPR-17": {
            "name": "Data Deletion Process",
            "check": lambda: _check_deletion_in_readme(),
            "remediation": "Document data deletion process in README or PRIVACY.md"
        },
    },
}


def _check_https_in_configs() -> bool:
    """Check that no http:// (non-localhost) URLs exist in config files."""
    for f in Path(".").glob("**/*.{yaml,yml,json,env.example}"):
        content = f.read_text(errors="ignore")
        if "http://" in content and "localhost" not in content and "127.0.0.1" not in content:
            return False
    return True


def _check_hardcoded_secrets() -> bool:
    """Check for patterns that look like hardcoded secrets."""
    patterns = ["api_key =", "secret =", "password =", "token =", "Bearer sk-", "sk-proj-"]
    for f in Path(".").glob("**/*.{py,js,ts,sh}"):
        try:
            content = f.read_text()
            for p in patterns:
                if p in content.lower() and ".env" not in str(f):
                    return True
        except Exception:
            pass
    return False


def _check_deletion_in_readme() -> bool:
    for f in ["README.md", "PRIVACY.md", "docs/privacy.md"]:
        if Path(f).exists():
            content = Path(f).read_text(errors="ignore").lower()
            if "delet" in content or "remov" in content:
                return True
    return False


def run_checks(frameworks: list[str] = None) -> dict:
    results = {"timestamp": datetime.utcnow().isoformat(), "checks": {}, "summary": {}}
    frameworks = frameworks or list(CHECKS.keys())
    
    passed = failed = 0
    
    for framework in frameworks:
        if framework not in CHECKS:
            continue
        results["checks"][framework] = {}
        
        for check_id, check_def in CHECKS[framework].items():
            try:
                ok = check_def["check"]()
            except Exception as e:
                ok = False
            
            status = "PASS" if ok else "FAIL"
            results["checks"][framework][check_id] = {
                "name": check_def["name"],
                "status": status,
                "remediation": check_def["remediation"] if not ok else None,
            }
            
            if ok:
                passed += 1
            else:
                failed += 1
    
    results["summary"] = {
        "passed": passed,
        "failed": failed,
        "total": passed + failed,
        "score": f"{passed/(passed+failed)*100:.0f}%" if (passed+failed) > 0 else "N/A",
    }
    return results


def print_report(results: dict):
    print(f"\n{'='*60}")
    print(f"BlackRoad Compliance Check — {results['timestamp'][:10]}")
    print(f"{'='*60}\n")
    
    for framework, checks in results["checks"].items():
        print(f"[{framework.upper()}]")
        for check_id, check in checks.items():
            icon = "✅" if check["status"] == "PASS" else "❌"
            print(f"  {icon} {check_id}: {check['name']}")
            if check.get("remediation"):
                print(f"     → {check['remediation']}")
        print()
    
    s = results["summary"]
    print(f"Score: {s['score']} ({s['passed']}/{s['total']} passed)\n")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="BlackRoad Compliance Checker")
    parser.add_argument("--framework", choices=["soc2", "gdpr", "ccpa", "all"], default="all")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    
    frameworks = list(CHECKS.keys()) if args.framework == "all" else [args.framework]
    results = run_checks(frameworks)
    
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print_report(results)
