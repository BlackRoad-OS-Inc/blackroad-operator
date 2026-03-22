#!/usr/bin/env python3
"""Coordinate git and deploy actions across Prism-adjacent repositories.

The tool is intentionally conservative: it wraps a handful of shell commands
(`git status`, `git add`, `git pull --rebase`, etc.) so we can run the same
ritual for every repository that participates in the Prism console ecosystem.

Configuration lives in ``codex/tools/prism_repo_integrations.json`` and can be
overridden with ``--config``. Each entry specifies a ``name`` and ``path`` plus
optional ``tests`` and ``deploy`` commands.  All paths are relative to the repo
root unless ``--root`` points somewhere else.
"""
from __future__ import annotations

import argparse
import json
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Sequence

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CONFIG = ROOT / "codex" / "tools" / "prism_repo_integrations.json"


@dataclass
class RepoTarget:
    """Represents a repository managed by the integrator."""

    name: str
    path: Path
    tests: str | None = None
    deploy: str | None = None

    @property
    def exists(self) -> bool:
        return self.path.exists()


class Integrator:
    """High-level operations spanning multiple repositories."""

    def __init__(self, repos: List[RepoTarget], dry_run: bool = False) -> None:
        self.repos = repos
        self.dry_run = dry_run

    def _run(self, cmd: Sequence[str], cwd: Path) -> subprocess.CompletedProcess | None:
        printable = " ".join(cmd)
        print(f"[{cwd}] $ {printable}")
        if self.dry_run:
            return None
        return subprocess.run(cmd, cwd=cwd, check=True)

    def status(self) -> None:
        for repo in self.repos:
            if not repo.exists:
                print(f"[skip] {repo.name} (missing at {repo.path})")
                continue
            print(f"\n## {repo.name}")
            self._run(["git", "status", "-sb"], repo.path)

    def sync(self, message: str) -> None:
        for repo in self.repos:
            if not repo.exists:
                print(f"[skip] {repo.name} (missing at {repo.path})")
                continue
            print(f"\n## syncing {repo.name}")
            dirty = self._run_capture(["git", "status", "--porcelain"], repo.path)
            self._run(["git", "add", "-A"], repo.path)
            if dirty.strip():
                self._run(["git", "commit", "-m", message], repo.path)
            else:
                print("no local changes to commit")
            self._run(["git", "pull", "--rebase"], repo.path)
            self._run(["git", "push", "origin", "HEAD"], repo.path)

    def run_tests(self) -> None:
        for repo in self.repos:
            if not repo.exists:
                print(f"[skip] {repo.name} (missing at {repo.path})")
                continue
            if not repo.tests:
                print(f"[skip] {repo.name} (tests not configured)")
                continue
            print(f"\n## tests {repo.name}")
            self._run(["sh", "-c", repo.tests], repo.path)

    def deploy(self) -> None:
        for repo in self.repos:
            if not repo.exists:
                print(f"[skip] {repo.name} (missing at {repo.path})")
                continue
            if not repo.deploy:
                print(f"[skip] {repo.name} (deploy not configured)")
                continue
            print(f"\n## deploy {repo.name}")
            self._run(["sh", "-c", repo.deploy], repo.path)

    def _run_capture(self, cmd: Sequence[str], cwd: Path) -> str:
        printable = " ".join(cmd)
        print(f"[{cwd}] $ {printable}")
        if self.dry_run:
            return ""
        out = subprocess.run(cmd, cwd=cwd, check=True, capture_output=True, text=True)
        return out.stdout


def load_config(path: Path, root: Path) -> List[RepoTarget]:
    if not path.exists():
        raise FileNotFoundError(f"config not found: {path}")
    raw = json.loads(path.read_text())
    repos: List[RepoTarget] = []
    for entry in raw.get("repos", []):
        repo_path = (root / entry["path"]).resolve()
        repos.append(
            RepoTarget(
                name=entry["name"],
                path=repo_path,
                tests=entry.get("tests"),
                deploy=entry.get("deploy"),
            )
        )
    return repos


def filter_repos(repos: List[RepoTarget], names: Iterable[str]) -> List[RepoTarget]:
    wanted = {name.lower() for name in names}
    if not wanted:
        return repos
    filtered = [repo for repo in repos if repo.name.lower() in wanted]
    missing = wanted - {repo.name.lower() for repo in filtered}
    for name in sorted(missing):
        print(f"[warn] no repo configured for '{name}'")
    return filtered


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["status", "sync", "test", "deploy"], help="Action to execute")
    parser.add_argument("repos", nargs="*", help="Limit the action to these repo names")
    parser.add_argument("--config", default=str(DEFAULT_CONFIG), help="Path to repo configuration JSON")
    parser.add_argument("--root", default=str(ROOT), help="Root directory for relative repo paths")
    parser.add_argument("--message", default="chore: sync via integrator", help="Commit message for sync")
    parser.add_argument("--dry-run", action="store_true", help="Print commands without executing them")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    config_path = Path(args.config).expanduser()
    root = Path(args.root).expanduser()
    repos = load_config(config_path, root)
    repos = filter_repos(repos, args.repos)
    integrator = Integrator(repos, dry_run=args.dry_run)

    if args.command == "status":
        integrator.status()
    elif args.command == "sync":
        integrator.sync(args.message)
    elif args.command == "test":
        integrator.run_tests()
    elif args.command == "deploy":
        integrator.deploy()
    else:  # pragma: no cover - argparse guards
        parser.error(f"unknown command {args.command}")
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
