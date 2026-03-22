"""Programmatic entry point to run pytest within the lab."""
from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Sequence


def run_pytest(args: Sequence[str] | None = None, cwd: Path | None = None) -> subprocess.CompletedProcess[bytes]:
    command = ["pytest"]
    if args:
        command.extend(args)
    return subprocess.run(command, cwd=cwd, check=False, capture_output=True)
