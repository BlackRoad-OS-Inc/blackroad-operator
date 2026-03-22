"""
BlackRoad Security Scanner
Integrates with Trivy + Grype for container and code vulnerability scanning
"""
import subprocess
import json
import sys
from pathlib import Path
from typing import Optional


def run_trivy_fs(target: str, format: str = "json") -> dict:
    """Run Trivy filesystem scan."""
    try:
        result = subprocess.run(
            ["trivy", "fs", "--format", format, "--quiet", target],
            capture_output=True, text=True, timeout=300
        )
        if format == "json":
            return json.loads(result.stdout) if result.stdout else {}
        return {"output": result.stdout, "stderr": result.stderr}
    except FileNotFoundError:
        return {"error": "trivy not installed. Run: brew install trivy"}
    except subprocess.TimeoutExpired:
        return {"error": "Scan timed out"}


def run_grype(target: str) -> list[dict]:
    """Run Grype vulnerability scan."""
    try:
        result = subprocess.run(
            ["grype", target, "-o", "json", "--quiet"],
            capture_output=True, text=True, timeout=300
        )
        data = json.loads(result.stdout) if result.stdout else {}
        return data.get("matches", [])
    except FileNotFoundError:
        return [{"error": "grype not installed. Run: brew tap anchore/grype && brew install grype"}]


def scan_secrets(path: str) -> list[dict]:
    """Scan for exposed secrets using trufflehog/git-secrets pattern."""
    patterns = [
        (r"sk-[a-zA-Z0-9]{48}", "OpenAI API Key"),
        (r"sk-ant-[a-zA-Z0-9-_]{95}", "Anthropic API Key"),
        (r"hf_[a-zA-Z0-9]{36}", "Hugging Face Token"),
        (r"ghp_[a-zA-Z0-9]{36}", "GitHub Personal Access Token"),
        (r"AKIA[0-9A-Z]{16}", "AWS Access Key ID"),
    ]
    findings = []
    p = Path(path)
    files = list(p.rglob("*.py")) + list(p.rglob("*.ts")) + list(p.rglob("*.js")) + list(p.rglob("*.env"))
    
    import re
    for f in files:
        if ".git" in str(f) or "node_modules" in str(f):
            continue
        try:
            content = f.read_text(errors="ignore")
            for pattern, name in patterns:
                matches = re.findall(pattern, content)
                if matches:
                    findings.append({
                        "type": name,
                        "file": str(f.relative_to(p)),
                        "count": len(matches)
                    })
        except Exception:
            pass
    return findings


def generate_report(target: str, output: str = "console") -> dict:
    """Full security report combining multiple scanners."""
    report = {
        "target": target,
        "scanners": {},
        "summary": {"critical": 0, "high": 0, "medium": 0, "low": 0, "secrets": 0}
    }
    
    print(f"🔍 Scanning {target}...")
    
    # Secrets scan
    secrets = scan_secrets(target)
    report["scanners"]["secrets"] = secrets
    report["summary"]["secrets"] = len(secrets)
    print(f"  Secrets: {len(secrets)} found")
    
    # Trivy
    trivy_result = run_trivy_fs(target)
    if "error" not in trivy_result:
        results = trivy_result.get("Results", [])
        for r in results:
            for vuln in r.get("Vulnerabilities", []):
                sev = vuln.get("Severity", "").lower()
                if sev in report["summary"]:
                    report["summary"][sev] += 1
        report["scanners"]["trivy"] = {"results_count": sum(len(r.get("Vulnerabilities",[])) for r in results)}
        print(f"  Trivy: {report['summary']['critical']} critical, {report['summary']['high']} high")
    
    if output == "json":
        print(json.dumps(report, indent=2))
    
    return report


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    generate_report(target)
