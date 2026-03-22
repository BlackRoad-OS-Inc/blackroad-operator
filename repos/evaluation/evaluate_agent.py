#!/usr/bin/env python3
"""Evaluate an agent's certification readiness.

Usage:
    python evaluate_agent.py <agent-id> [repo-path] [--verbose] [--level N]
"""
import subprocess, sys, json, os, argparse
from datetime import datetime, timezone

CHECKS = [
    ("codex-search", "Searched codex before working"),
    ("til-broadcast", "Broadcast a TIL"),
    ("journal-log", "Logged work to journal"),
    ("brand-compliance", "Follows brand rules"),
    ("security-check", "Follows security standards"),
]

# BlackRoad brand colors
PINK = "\033[38;5;205m"
GREEN = "\033[38;5;82m"
AMBER = "\033[38;5;214m"
RESET = "\033[0m"


def evaluate(agent_id: str, repo_path: str = ".", level: int = 1, verbose: bool = False):
    passed = 0
    total = len(CHECKS)
    results = []
    checks_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "checks")

    print(f"\n{PINK}BlackRoad OS{RESET} — Agent Evaluation")
    print(f"{'='*50}")
    print(f"  Agent:  {agent_id}")
    print(f"  Level:  {level}")
    print(f"  Repo:   {os.path.abspath(repo_path)}")
    print(f"  Date:   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*50}\n")

    for check_name, desc in CHECKS:
        script = os.path.join(checks_dir, f"check-{check_name}.sh")
        check_result = {
            "check": check_name,
            "description": desc,
            "passed": False,
            "output": "",
            "error": "",
        }

        try:
            cmd = [script, repo_path]
            r = subprocess.run(
                cmd,
                capture_output=True, text=True, timeout=120
            )
            check_result["output"] = r.stdout.strip()
            check_result["error"] = r.stderr.strip()

            if r.returncode == 0:
                passed += 1
                check_result["passed"] = True
                print(f"  {GREEN}PASS{RESET}  {desc}")
            else:
                print(f"  {PINK}FAIL{RESET}  {desc}")

            if verbose and r.stdout.strip():
                for line in r.stdout.strip().split("\n"):
                    print(f"        {line}")
            if verbose and r.stderr.strip():
                for line in r.stderr.strip().split("\n"):
                    print(f"        {AMBER}stderr:{RESET} {line}")

        except FileNotFoundError:
            check_result["error"] = f"Script not found: {script}"
            print(f"  {PINK}FAIL{RESET}  {desc} (script not found)")
        except subprocess.TimeoutExpired:
            check_result["error"] = "Timed out (120s)"
            print(f"  {PINK}FAIL{RESET}  {desc} (timed out)")
        except Exception as e:
            check_result["error"] = str(e)
            print(f"  {PINK}FAIL{RESET}  {desc} (error: {e})")

        results.append(check_result)

    score = (passed / total) * 100 if total > 0 else 0
    certified = score >= 80

    print(f"\n{'='*50}")
    if certified:
        print(f"  {GREEN}CERTIFIED{RESET}  Score: {score:.0f}% ({passed}/{total})")
    else:
        print(f"  {PINK}NOT CERTIFIED{RESET}  Score: {score:.0f}% ({passed}/{total})  (80% required)")
    print(f"{'='*50}\n")

    # Build JSON report
    report = {
        "agent_id": agent_id,
        "level": level,
        "repo_path": os.path.abspath(repo_path),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "score": score,
        "passed": passed,
        "total": total,
        "certified": certified,
        "checks": results,
    }

    # Write JSON report
    report_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reports")
    os.makedirs(report_dir, exist_ok=True)
    report_file = os.path.join(
        report_dir,
        f"eval-{agent_id}-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
    )
    with open(report_file, "w") as f:
        json.dump(report, f, indent=2)

    print(f"  Report saved: {report_file}")

    # Also print JSON to stdout if verbose
    if verbose:
        print(f"\n{json.dumps(report, indent=2)}")

    return certified


def main():
    parser = argparse.ArgumentParser(description="Evaluate an agent's certification readiness.")
    parser.add_argument("agent_id", nargs="?", default="unknown", help="Agent identifier")
    parser.add_argument("repo_path", nargs="?", default=".", help="Path to the repo to evaluate")
    parser.add_argument("--level", type=int, default=1, help="Certification level (default: 1)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show detailed output from each check")
    args = parser.parse_args()

    certified = evaluate(args.agent_id, args.repo_path, args.level, args.verbose)
    sys.exit(0 if certified else 1)


if __name__ == "__main__":
    main()
