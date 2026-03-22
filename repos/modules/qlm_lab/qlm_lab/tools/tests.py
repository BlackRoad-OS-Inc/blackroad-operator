"""Programmatic test runner."""
from __future__ import annotations

import subprocess
from typing import Sequence


def run_pytest(paths: Sequence[str] | None = None) -> int:
    """Run pytest for the given paths and return the exit code."""

    cmd = ["pytest", "-q"]
    if paths:
        cmd.extend(paths)
    result = subprocess.run(cmd, check=False)
    return result.returncode


__all__ = ["run_pytest"]
