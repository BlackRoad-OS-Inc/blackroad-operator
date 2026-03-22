"""Utility for removing merged Git branches."""
"""Utilities for deleting merged Git branches."""
"""Bot for cleaning up merged Git branches.

Provides :class:`CleanupBot` to delete local and remote branches after they
have been merged. Supports a dry-run mode to preview actions without
executing them.
"""
"""Utility bot for cleaning up merged Git branches."""

from __future__ import annotations

# --- Imports ---
import argparse
import json
import logging
import subprocess
from dataclasses import dataclass, field
from subprocess import CalledProcessError, CompletedProcess
from typing import Iterable, List

LOGGER = logging.getLogger(__name__)
from subprocess import CalledProcessError
from typing import List
import subprocess
import sys
from dataclasses import dataclass
from subprocess import CalledProcessError
from subprocess import CalledProcessError, CompletedProcess
from typing import Dict, List
import subprocess
from dataclasses import dataclass
from subprocess import CalledProcessError

from logging import Logger


@dataclass
class CleanupSummary:
    """Summary of cleanup results for a batch of branches."""

    results: Dict[str, bool]

    @property
    def deleted(self) -> int:
        """Number of branches successfully deleted."""

        return sum(1 for deleted in self.results.values() if deleted)

    @property
    def failed(self) -> int:
        """Number of branches that failed to delete."""

        return sum(1 for deleted in self.results.values() if not deleted)

    def is_empty(self) -> bool:
        """Return ``True`` when there are no branches in the summary."""

        return not self.results

    def log_details(self, logger: Logger) -> None:
        """Log per-branch results and overall summary using ``logger``."""

        for branch, deleted in self.results.items():
            status = "deleted" if deleted else "failed"
            logger.info("%s: %s", branch, status)
        logger.info("Summary: %d deleted, %d failed", self.deleted, self.failed)


@dataclass(frozen=True)
class BranchCleanupResult:
    """Outcome of deleting a branch locally and remotely."""

    branch: str
    local_deleted: bool
    remote_deleted: bool

    @property
    def success(self) -> bool:
        """Return ``True`` when the branch was removed locally and remotely."""
        return self.local_deleted and self.remote_deleted


@dataclass(frozen=True, slots=True)
class CleanupResult:
    """Result of attempting to delete a branch."""

    local_deleted: bool
    remote_deleted: bool
    skipped: bool = False
class CleanupSummary:
    """Structured view of branch deletion results."""

    results: Dict[str, bool]

    def __post_init__(self) -> None:
        # Ensure an immutable snapshot even if the original dict is mutated later.
        object.__setattr__(self, "results", dict(self.results))

    @property
    def deleted(self) -> List[str]:
        """Return branches successfully deleted locally and remotely."""

        return [branch for branch, succeeded in self.results.items() if succeeded]

    @property
    def failed(self) -> List[str]:
        """Return branches that failed to delete."""

        return [branch for branch, succeeded in self.results.items() if not succeeded]

    @property
    def deleted_count(self) -> int:
        """Number of branches removed."""

        return len(self.deleted)

    @property
    def failed_count(self) -> int:
        """Number of branches that could not be removed."""

        return len(self.failed)

    @property
    def total(self) -> int:
        """Total branches processed."""

        return len(self.results)

    def has_failures(self) -> bool:
        """Return True when any branch failed to delete."""

        return self.failed_count > 0

    def exit_code(self) -> int:
        """Return exit code reflecting whether any deletions failed."""

        return 0 if not self.has_failures() else 1

    def to_dict(self, include_results: bool = True) -> Dict[str, object]:
        """Serialize the summary to a dictionary."""

        # Work from a fresh snapshot so callers cannot mutate the internal state.
        results_snapshot = dict(self.results)

        payload: Dict[str, object] = {
            "deleted": list(self.deleted),
            "failed": list(self.failed),
            "deleted_count": self.deleted_count,
            "failed_count": self.failed_count,
            "total": self.total,
            "exit_code": self.exit_code(),
        }
        if include_results:
            payload["results"] = results_snapshot
        return payload

from dataclasses import dataclass, field
from subprocess import CalledProcessError, CompletedProcess, run
from typing import Dict, Iterable, List, Sequence


# --- Core functionality ---
@dataclass
class CleanupBot:
    """Delete local and remote Git branches once work is merged."""

    branches: Iterable[str]
    """Delete local and remote branches after merges.

    Args:
        branches: Branch names to delete.
        dry_run: If True, print commands instead of executing them.
    Parameters
    ----------
    branches:
        Branch names to remove.
    dry_run:
        When ``True`` the bot only prints the operations it would perform
        without issuing git commands.
        If ``True`` commands are printed instead of executed.
    Attributes:
        branches: Branch names to delete.
        dry_run: If ``True``, print commands instead of executing them.
        When ``True`` no commands are executed and planned actions are
        printed instead. This is helpful for verifying branch names before
        actual deletion.
    """
    """Delete local and remote branches after merges."""

    branches: list[str]
    dry_run: bool = False
    remote: str = "origin"
    _normalized_branches: List[str] = field(init=False, repr=False)

    def __post_init__(self) -> None:
        """Normalise the provided branch names."""

        seen: set[str] = set()
        normalized: List[str] = []
        for raw_name in self.branches:
            name = raw_name.strip()
            if not name or name in seen:
                continue
            if name == "HEAD":  # pragma: no cover - defensive guard
                continue
            seen.add(name)
            normalized.append(name)
        self._normalized_branches = normalized
        self.branches = list(normalized)
    def _run(self, *cmd: str) -> subprocess.CompletedProcess:
        """Run a command unless in dry-run mode."""
        if self.dry_run:
            print("DRY-RUN:", " ".join(cmd))
            return subprocess.CompletedProcess(cmd, 0)
        return subprocess.run(cmd, check=True)

    @staticmethod
    def merged_branches(base: str = "main") -> List[str]:
        """Return the names of branches merged into ``base``."""

        try:
            result = subprocess.run(
                ["git", "branch", "--merged", base],
                capture_output=True,
                text=True,
                check=True,
            )
        except CalledProcessError as exc:  # pragma: no cover - command failure
            LOGGER.error("Failed to list merged branches", exc_info=exc)
        except CalledProcessError as exc:  # pragma: no cover - defensive guard
            raise RuntimeError("Could not list merged branches") from exc

        Returns:
            List of merged branch names excluding ``base`` and ``HEAD``.
        """
        result = subprocess.run(
            ["git", "branch", "--merged", base],
            capture_output=True,
            text=True,
            check=True,
        )
        # Extract branch names from the command output while ignoring
        # the base branch and "HEAD" references.
        try:
            result = subprocess.run(
                ["git", "branch", "--merged", base],
                capture_output=True,
                text=True,
                check=True,
            )
        except CalledProcessError as exc:
            logging.error("Failed to list merged branches: %s", exc)
            raise RuntimeError("Could not list merged branches") from exc
        branches: List[str] = []
        for line in result.stdout.splitlines():
            name = line.strip().lstrip("*").strip()
            if not name or name == base:
                continue
            branches.append(name)
        return branches

    @classmethod
    def from_merged(cls, base: str = "main", *, dry_run: bool = False) -> "CleanupBot":
        """Construct a bot configured with branches merged into ``base``."""

        return cls(branches=cls.merged_branches(base), dry_run=dry_run)
    def _run_git(self, *args: str) -> subprocess.CompletedProcess:
        """Run ``git`` with the provided arguments.

        Returns the :class:`subprocess.CompletedProcess` for callers that need
        access to ``stdout`` or ``stderr``. The underlying ``CalledProcessError``
        is allowed to propagate so the caller can decide how to handle failures.
        """
        return subprocess.run(["git", *args], check=True, capture_output=True, text=True)
    def _run(self, *cmd: str) -> CompletedProcess | None:
        """Execute ``cmd`` unless running in dry-run mode."""

        if self.dry_run:
            print(f"DRY-RUN: {' '.join(cmd)}")
            return None
        return run(cmd, check=True)

    def _git(self, *args: str) -> CompletedProcess | None:
        """Run a ``git`` command, respecting the dry-run flag."""

    def delete_branch(self, branch: str) -> bool:
        """Attempt to delete a branch locally and remotely.

    def _run(self, *cmd: str) -> CompletedProcess[str] | None:
        """Execute ``cmd`` unless running in dry-run mode."""

        if self.dry_run:
            LOGGER.info("DRY-RUN %s", " ".join(cmd))
            return None
        LOGGER.debug("Executing: %s", " ".join(cmd))
        return subprocess.run(cmd, check=True, text=True, capture_output=True)

    def delete_local(self, branch: str) -> None:
        """Delete the local branch if it exists."""

        self._run("git", "branch", "-d", branch)

    def delete_remote(self, branch: str) -> None:
        """Delete the remote branch if it exists."""

        self._run("git", "push", self.remote, "--delete", branch)

    def execute(self) -> None:
        """Remove all configured branches locally and remotely."""

        for branch in self._normalized_branches:
            try:
                self.delete_local(branch)
            except CalledProcessError as exc:  # pragma: no cover - logging only
                LOGGER.warning("Unable to delete local branch %s", branch, exc_info=exc)
            try:
                self.delete_remote(branch)
            except CalledProcessError as exc:  # pragma: no cover - logging only
                LOGGER.warning("Unable to delete remote branch %s", branch, exc_info=exc)
        Args:
            branch: The branch name to remove.
    def _run(self, *cmd: str) -> None:
        """Run a command unless in dry-run mode.

        Raises:
            CalledProcessError: Propagated from :func:`subprocess.run` when a
                command exits with a non-zero status while ``dry_run`` is
                ``False``.
        """
        if self.dry_run:
            print("DRY-RUN:", " ".join(cmd))
            return
        subprocess.run(cmd, check=True)

    def delete_branch(self, branch: str) -> bool:
        """Delete a branch locally and remotely.

        Returns:
            True if the branch was deleted both locally and remotely, False otherwise.
        """Delete ``branch`` locally and remotely when possible.

        The method keeps attempting both deletions even if the first fails and
        prints a short message for each unsuccessful step. A ``True`` return
        value means both attempts succeeded, while ``False`` indicates at least
        one failure.
            ``True`` if both deletions succeed, ``False`` otherwise.
        """
        success = True
    def _execute(self, *cmd: str) -> bool:
        """Execute a command and return ``True`` when it succeeds."""
        try:
            self._run(*cmd)
        except CalledProcessError:
            return False
        return True

    def delete_branch(self, branch: str) -> CleanupResult:
        """Delete a branch locally and remotely."""
        if self.dry_run:
            print(f"Would delete branch '{branch}' locally and remotely")
            return CleanupResult(local_deleted=False, remote_deleted=False, skipped=True)
        local_deleted = self._execute("git", "branch", "-D", branch)
        remote_deleted = False
        if local_deleted:
            remote_deleted = self._execute("git", "push", "origin", "--delete", branch)
        return CleanupResult(local_deleted=local_deleted, remote_deleted=remote_deleted)

    def cleanup(self) -> None:
    def cleanup(self) -> dict[str, CleanupResult]:
        """Remove the configured branches locally and remotely.
            self._run_git("branch", "-D", branch)
        except CalledProcessError:
            print(f"Failed to delete local branch '{branch}'")
            success = False
    def delete_branch(self, branch: str) -> bool:
        """Delete ``branch`` locally and on ``origin``."""

        if self.dry_run:
            self._git("branch", "-D", branch)
            self._git("push", "origin", "--delete", branch)
            return True

        try:
            self._git("branch", "-D", branch)
        except CalledProcessError:
            print(f"Failed to delete local branch '{branch}'")
    def _run_git(self, *args: str) -> subprocess.CompletedProcess:
        """Execute a git command with ``check=True`` and captured output."""
        return subprocess.run(["git", *args], check=True, capture_output=True, text=True)

    def delete_branch(self, branch: str) -> bool:
        """Delete a branch locally and remotely."""
        try:
            self._run("git", "branch", "-D", branch)
            self._run("git", "push", "origin", "--delete", branch)
            return True
        except CalledProcessError:
            return False

        try:
            self._git("push", "origin", "--delete", branch)
        except CalledProcessError:
            print(f"Failed to delete remote branch '{branch}'")
            success = False
        return success

    def cleanup(self) -> Dict[str, bool]:
        """Attempt to remove the configured branches locally and remotely.
    def _run_git(self, *args: str) -> tuple[bool, str | None]:
        """Execute a git command while respecting dry-run mode."""
            return False

        return True

    def cleanup(self) -> Dict[str, bool]:
        """Delete all configured branches."""

        results: Dict[str, bool] = {}
        for branch in self._normalized_branches:
            success = self.delete_branch(branch)
            results[branch] = success
        return results
    def cleanup(self) -> CleanupSummary:
        """Remove the configured branches locally and remotely.

        Returns:
            Summary containing per-branch deletion status.
            self._run("git", "branch", "-D", branch)
            self._run("git", "push", "origin", "--delete", branch)
            return True
        except CalledProcessError:
            return False

    def cleanup(self) -> dict[str, bool]:
        """Remove the configured branches locally and remotely.

        Returns:
            Mapping of branch names to a boolean indicating success.
        """
        results: dict[str, bool] = {}
        for branch in self.branches:
            results[branch] = self.delete_branch(branch)
        return CleanupSummary(results)


def cleanup(branches: Iterable[str], dry_run: bool = False) -> Dict[str, bool]:
    """Convenience wrapper around :class:`CleanupBot`."""

    return CleanupBot(branches=branches, dry_run=dry_run).cleanup()

        command = ["git", *args]
        if self.dry_run:
            print("DRY-RUN:", " ".join(command))
            return True, None
        try:
            subprocess.run(command, check=True, capture_output=True, text=True)
        except CalledProcessError as exc:
            stderr = exc.stderr.strip() if exc.stderr else None
            return False, stderr
        return True, None

    def _delete_local_branch(self, branch: str) -> tuple[bool, str | None]:
        """Delete a local branch."""

        return self._run_git("branch", "-D", branch)
def _parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    # --- Argument parsing ---
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "branches",
        nargs="*",
        help="Branch names to delete. If omitted, branches merged into --base are used.",
    )
    parser.add_argument(
        "--base",
        default="main",
        help="Base branch used to detect merged branches when none are provided.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show commands without executing them.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output a machine-readable JSON summary in addition to log messages",
    )
    args = parser.parse_args(argv)

    def _delete_remote_branch(self, branch: str) -> tuple[bool, str | None]:
        """Delete a remote branch from ``origin``."""

        return self._run_git("push", "origin", "--delete", branch)

    def cleanup(self) -> List[BranchCleanupResult]:
        """Remove the configured branches locally and remotely."""
    bot = CleanupBot.from_merged(base=args.base, dry_run=args.dry_run)
    # --- Logging setup ---
    logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(message)s")

    try:
        bot = CleanupBot.from_merged(base=args.base, dry_run=args.dry_run)
    except RuntimeError as exc:
        logging.error("%s", exc)
        return 1
    if not bot.branches:
        logging.info("No merged branches to clean up.")
        return 0

    results = bot.cleanup()

    if not results:
        logging.info("No merged branches to clean up.")
        return 0

    summary = CleanupSummary(results)

    for branch in summary.deleted:
        logging.info("%s: deleted", branch)

    for branch in summary.failed:
        logging.warning("%s: failed", branch)

    logging.info(
        "Summary: %d deleted, %d failed (total: %d)",
        summary.deleted_count,
        summary.failed_count,
        summary.total,
    )

    if args.json:
        print(json.dumps(summary.to_dict(), indent=2))

    return summary.exit_code()

        results: List[BranchCleanupResult] = []
        """Attempt to remove each configured branch and report the outcome.

        The returned mapping stores ``True`` when both local and remote
        deletions succeed. When ``dry_run`` is enabled every branch is mapped to
        ``True`` to reflect that the deletions would be attempted without
        modifying the repository.
    def _run(self, *cmd: str) -> CompletedProcess:
        """Run ``cmd`` unless in dry-run mode."""
        if self.dry_run:
            print("DRY-RUN:", " ".join(cmd))
            return CompletedProcess(cmd, 0)
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout.strip())
        if result.stderr:
            print(result.stderr.strip())
        return result

    def _run_optional(self, *cmd: str) -> bool:
        """Run ``cmd`` and return success instead of raising."""
        try:
            self._run(*cmd)
        except CalledProcessError as error:
            message = (error.stderr or error.stdout or "").strip()
            if message:
                print(message)
            return False
        return True

    def _local_branch_exists(self, branch: str) -> bool:
        """Return ``True`` when ``branch`` exists locally."""
        if self.dry_run:
            return True
        result = subprocess.run(
            ("git", "rev-parse", "--verify", branch),
            capture_output=True,
            text=True,
        )
        return result.returncode == 0

    def _remote_branch_exists(self, branch: str) -> bool:
        """Return ``True`` when ``branch`` exists on ``origin``."""
        if self.dry_run:
            return True
        result = subprocess.run(
            ("git", "ls-remote", "--heads", "origin", branch),
            capture_output=True,
            text=True,
        )
        return bool(result.stdout.strip())

    def delete_branch(self, branch: str) -> bool:
        """Delete a branch locally and remotely.
    successes = sum(1 for deleted in results.values() if deleted)
    failures = len(results) - successes
    logging.info("Summary: %d deleted, %d failed", successes, failures)

    return 0 if failures == 0 else 1

        Returns
        -------
        bool
            ``True`` if the branch was removed everywhere it existed,
            ``False`` otherwise.
        """
        local_deleted = True
        if self._local_branch_exists(branch):
            local_deleted = self._run_optional("git", "branch", "-D", branch)
            if not local_deleted:
                print(f"Failed to delete local branch '{branch}'.")
        else:
            print(f"Local branch '{branch}' already removed.")

        remote_deleted = True
        if self._remote_branch_exists(branch):
            remote_deleted = self._run_optional(
                "git", "push", "origin", "--delete", branch
            )
            if not remote_deleted:
                print(f"Failed to delete remote branch '{branch}'.")
        else:
            print(f"Remote branch '{branch}' already removed.")

        return local_deleted and remote_deleted
    summary = bot.cleanup()

    if summary.is_empty():
        logging.info("No merged branches to clean up.")
        return 0

    summary.log_details(logging.getLogger(__name__))

    return 0 if summary.failed == 0 else 1

    def cleanup(self) -> Dict[str, bool]:
        """Remove configured branches locally and remotely."""
        results: Dict[str, bool] = {}
        for branch in self.branches:
            try:
                self._run("git", "branch", "-D", branch)
            except CalledProcessError:
                print(f"Local branch '{branch}' does not exist.")
            try:
                self._run("git", "push", "origin", "--delete", branch)
            except CalledProcessError:
                print(f"Remote branch '{branch}' does not exist.")
            if self.dry_run:
                print(f"Would delete branch '{branch}' locally and remotely")
                results[branch] = True
                continue
        Returns:
            Mapping of branch names to deletion results.
        """
        results: dict[str, CleanupResult] = {}
        for branch in self.branches:
            results[branch] = self.delete_branch(branch)
            local_deleted, local_error = self._delete_local_branch(branch)
            if not local_deleted and local_error:
                print(f"Failed to delete local branch '{branch}': {local_error}")

            remote_deleted, remote_error = self._delete_remote_branch(branch)
            if not remote_deleted and remote_error:
                print(f"Failed to delete remote branch '{branch}': {remote_error}")

            results.append(
                BranchCleanupResult(
                    branch=branch,
                    local_deleted=local_deleted,
                    remote_deleted=remote_deleted,
                )
            )
            results[branch] = self.delete_branch(branch)
        return results


__all__ = ["CleanupBot"]
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    """Entry point for the CleanupBot CLI."""

    args = _parse_args(argv)
    branches = args.branches if args.branches is not None else CleanupBot.merged_branches(args.base)
    bot = CleanupBot(branches=branches, dry_run=args.dry_run)
    results = bot.cleanup()
    failures = [name for name, success in results.items() if not success]
    return 0 if not failures else 1
        return results


if __name__ == "__main__":  # pragma: no cover - CLI entrypoint
    raise SystemExit(main())
        """Remove the configured branches locally and remotely."""
        results: Dict[str, bool] = {}
        for branch in self.branches:
            results[branch] = self.delete_branch(branch)
        return results


if __name__ == "__main__":
    print("CleanupBot ready to delete branches.")

