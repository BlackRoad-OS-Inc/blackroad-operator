#!/usr/bin/env python3
"""Run the quick pulse checklist for AutoNovelAgent related changes."""

from __future__ import annotations

import re
import subprocess
from pathlib import Path
from typing import Iterable, Sequence

PROJECT_ROOT = Path(__file__).resolve().parents[1]

COMMANDS: Sequence[Sequence[str]] = (
    ("python", "-m", "py_compile", "agents/auto_novel_agent.py", "agents/cleanup_bot.py"),
    ("python", "agents/auto_novel_agent.py"),
    ("pytest", "tests/test_auto_novel_agent.py", "tests/test_cleanup_bot.py"),
)

SECRET_PATTERNS: dict[str, re.Pattern[str]] = {
    "openai": re.compile(r"sk-[a-zA-Z0-9]{20,}"),
    "google": re.compile(r"AIza[0-9A-Za-z-_]{35}"),
    "aws": re.compile(r"AKIA[0-9A-Z]{16}"),
}

FILES_TO_SCAN: Sequence[Path] = (
    PROJECT_ROOT / "agents" / "auto_novel_agent.py",
    PROJECT_ROOT / "agents" / "cleanup_bot.py",
    PROJECT_ROOT / "tests" / "test_auto_novel_agent.py",
    PROJECT_ROOT / "tests" / "test_cleanup_bot.py",
)


def _run_command(cmd: Sequence[str]) -> bool:
    print(f"\n→ Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout.strip())
    if result.stderr:
        print(result.stderr.strip())
    if result.returncode == 0:
        print("✓ Success")
        return True
    print(f"✗ Failed with exit code {result.returncode}")
    return False


def _scan_for_secrets(paths: Iterable[Path]) -> bool:
    print("\n→ Running: secret scan (quick heuristic)")
    findings: list[str] = []
    for path in paths:
        try:
            content = path.read_text()
        except FileNotFoundError:
            continue
        for label, pattern in SECRET_PATTERNS.items():
            for match in pattern.findall(content):
                findings.append(f"{label} token candidate in {path}: {match[:6]}…")
    if not findings:
        print("✓ No obvious secrets found in targeted files")
        return True
    print("✗ Potential secrets detected:")
    for finding in findings:
        print(f"  - {finding}")
    return False


def main() -> int:
    all_passed = True
    for cmd in COMMANDS:
        all_passed &= _run_command(cmd)
    all_passed &= _scan_for_secrets(FILES_TO_SCAN)
    if all_passed:
        print("\nQuick pulse complete: all checks passed.")
        return 0
    print("\nQuick pulse completed with issues; see output above.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
