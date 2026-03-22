"""Test runner for validating every agent module in the repository.

Execute directly via ``python test_agents.py``. The runner recursively
walks the ``agents/`` directory, imports each Python module to ensure it
is syntactically valid, and can optionally execute ``__main__`` blocks in
an isolated subprocess. Use the following environment variables:

* ``AGENT_TEST_FILTER=<substring>`` — only run files whose relative path
  contains the substring (useful for debugging).
* ``AGENT_TEST_RUN_MAIN=1`` — execute modules that define a
  ``__main__`` block after a successful import. Without this flag, the
  runner performs import validation only to avoid side effects.
"""

from __future__ import annotations

import importlib.util
import os
import subprocess
import sys
from pathlib import Path
from typing import Iterable, List, Sequence, Tuple

AGENTS_DIR = Path(__file__).resolve().parent / "agents"
SKIP_FILE_NAMES = {"AGENTS.md", "__init__.py"}
SKIP_DIR_NAMES = {"__pycache__"}
FILTER_PATTERN = os.environ.get("AGENT_TEST_FILTER")
RUN_MAIN = os.environ.get("AGENT_TEST_RUN_MAIN", "").lower() in {"1", "true", "yes"}
PASS_STATUSES = {"pass", "skipped"}


def _normalize_module_name(module_path: Path) -> str:
    """Build a unique, import-safe module name for ``module_path``."""

    relative_parts = module_path.relative_to(AGENTS_DIR).with_suffix("").parts
    safe = [part.replace("-", "_") for part in relative_parts]
    return "agent_test." + ".".join(safe)


def run_module_main(module_path: Path) -> Tuple[int, str, str]:
    """Execute ``module_path`` in a subprocess and capture its output."""

    completed = subprocess.run(
        [sys.executable, str(module_path)],
        capture_output=True,
        text=True,
        check=False,
    )
    return completed.returncode, completed.stdout, completed.stderr


def import_module_file(module_path: Path) -> Tuple[bool, str]:
    """Import ``module_path`` dynamically and report success."""

    module_name = _normalize_module_name(module_path)
    spec = importlib.util.spec_from_file_location(module_name, module_path)
    if spec is None or spec.loader is None:
        return False, "unable to build module spec"

    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    try:
        spec.loader.exec_module(module)
        return True, ""
    except Exception as exc:  # pragma: no cover - delegated to pytest output
        return False, str(exc)
    finally:
        # Prevent stale references when importing many modules.
        sys.modules.pop(module_name, None)


def iter_agent_modules() -> Iterable[Path]:
    """Yield every Python file under ``agents/`` that should be tested."""

    for path in AGENTS_DIR.rglob("*.py"):
        if path.name in SKIP_FILE_NAMES:
            continue
        if any(part in SKIP_DIR_NAMES for part in path.parts):
            continue
        if FILTER_PATTERN:
            rel = str(path.relative_to(AGENTS_DIR))
            if FILTER_PATTERN not in rel:
                continue
        yield path


def exercise_agent(path: Path) -> Tuple[str, str, str]:
    """Import an agent module and, if applicable, run its main block."""

    ok, err = import_module_file(path)
    if not ok:
        return (str(path.relative_to(AGENTS_DIR)), "import_failed", err)

    source = path.read_text(encoding="utf-8")
    if not RUN_MAIN or 'if __name__ == "__main__"' not in source:
        return (str(path.relative_to(AGENTS_DIR)), "pass", "")

    rc, stdout, stderr = run_module_main(path)
    output = (stdout + stderr).strip()
    if rc == 0:
        return (str(path.relative_to(AGENTS_DIR)), "pass", "")
    if rc == 2 and any(hint in output.lower() for hint in ["usage:", "arguments are required"]):
        return (str(path.relative_to(AGENTS_DIR)), "skipped", "requires CLI arguments")
    return (str(path.relative_to(AGENTS_DIR)), "main_failed", output)


def run_agent_suite() -> List[Tuple[str, str, str]]:
    """Run the validation workflow for every agent module."""

    results: List[Tuple[str, str, str]] = []
    for module_path in sorted(iter_agent_modules()):
        results.append(exercise_agent(module_path))
    return results


def summarize_results(results: Sequence[Tuple[str, str, str]]) -> str:
    """Return a printable summary string for ``results``."""

    lines = ["=== Agent Test Runner ==="]
    failures = []
    for name, status, detail in results:
        lines.append(f"{name}: {status}")
        if status not in PASS_STATUSES:
            failures.append((name, detail))
            if detail:
                lines.append(f"  ↳ {detail}")
    if failures:
        lines.append(f"\n{len(failures)} agent(s) failed.")
    else:
        lines.append("\nAll agents passed.")
    return "\n".join(lines)


def test_agents() -> int:
    """Run the agent validation suite and return an exit code."""

    results = run_agent_suite()
    print(summarize_results(results))
    failures = [r for r in results if r[1] not in PASS_STATUSES]
    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(test_agents())
