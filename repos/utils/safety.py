"""Safety guards for read-only enforcement.

These helpers provide a minimal interface for soft and hard gating of
operations that might mutate state. They rely on a shared environment
variable (``SAFE_MODE`` by default) and an optional panic file flag.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Optional


def _env_value(env_var: str, default: str = "1") -> str:
    """Return the environment variable value or a default."""
    return os.environ.get(env_var, default)


def panic_guard(panic_file: str = ".panic", exit_code: int = 23) -> bool:
    """Abort execution if a panic file is present.

    Parameters
    ----------
    panic_file:
        Relative or absolute path to the panic flag file. Defaults to ``.panic``.
    exit_code:
        Exit status used when the panic file is present. Defaults to ``23``.

    Returns
    -------
    bool
        ``True`` when no panic condition is detected.

    Raises
    ------
    SystemExit
        If the panic file exists.
    """
    flag = Path(panic_file)
    if flag.exists():
        print(f"[panic-guard] Panic file detected at '{flag}'. Aborting.", file=sys.stderr)
        raise SystemExit(exit_code)
    return True


def soft_guard(
    env_var: str = "SAFE_MODE",
    allow: str = "0",
    name: str = "script",
    stream: Optional[object] = None,
) -> bool:
    """Check whether the current environment allows a mutable action.

    Soft guards never exit; they only log whether execution is allowed.

    Parameters
    ----------
    env_var:
        Name of the environment variable that controls access.
    allow:
        Value that permits mutable operations. Defaults to ``"0"``.
    name:
        Identifier used for logging.
    stream:
        Optional stream for log messages. Defaults to ``sys.stderr``.

    Returns
    -------
    bool
        ``True`` when the guard allows execution, ``False`` otherwise.
    """
    stream = stream or sys.stderr
    value = _env_value(env_var)
    if value == allow:
        print(
            f"[soft-guard] {name}: SAFE_MODE='{value}' → proceeding with mutable operations.",
            file=stream,
        )
        return True

    print(
        f"[soft-guard] {name}: SAFE_MODE='{value}' → read-only mode enforced.",
        file=stream,
    )
    return False


def hard_guard(
    env_var: str = "SAFE_MODE",
    allow: str = "0",
    name: str = "script",
    exit_code: int = 24,
    stream: Optional[object] = None,
) -> bool:
    """Enforce guard by exiting when the environment disallows execution.

    Parameters
    ----------
    env_var, allow, name:
        Same semantics as :func:`soft_guard`.
    exit_code:
        Exit status raised when the guard blocks execution. Defaults to ``24``.
    stream:
        Optional stream for log messages. Defaults to ``sys.stderr``.

    Returns
    -------
    bool
        ``True`` when execution is permitted.

    Raises
    ------
    SystemExit
        When the guard blocks execution.
    """
    allowed = soft_guard(env_var=env_var, allow=allow, name=name, stream=stream)
    if not allowed:
        raise SystemExit(exit_code)
    return True
