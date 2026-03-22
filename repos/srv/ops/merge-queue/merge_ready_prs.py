#!/usr/bin/env python3
"""Merge queue helper that lands ready pull requests.

This script reads `merge_plan.json` (or any JSON file using the same
schema) and attempts to merge the pull requests whose `state` is "open".
It relies on the GitHub REST API so it can run anywhere a token is
available (local laptop, CI runner, or a cron job on an infra host).

Usage examples:

    export GITHUB_TOKEN=ghp_***
    python srv/ops/merge-queue/merge_ready_prs.py --repo blackroad-ai/blackroad-prism-console

    # Dry run (no GitHub calls) showing what would happen:
    python srv/ops/merge-queue/merge_ready_prs.py --dry-run

    # Require a custom label before merging
    python srv/ops/merge-queue/merge_ready_prs.py --label queue:ready
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.error import HTTPError
from urllib.request import Request, urlopen

API_ROOT = "https://api.github.com"
DEFAULT_LABEL = os.environ.get("MERGE_READY_LABEL", "ready-to-merge")
DEFAULT_METHOD = os.environ.get("MERGE_METHOD", "squash")
DEFAULT_PLAN = "merge_plan.json"
MERGE_TITLE_PREFIX = os.environ.get("MERGE_COMMIT_TITLE_PREFIX", "Merge")


class MergeError(RuntimeError):
    """Raised when a GitHub merge attempt fails."""


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Merge pull requests from the queue when they are ready.")
    parser.add_argument("--plan", default=DEFAULT_PLAN, help="Path to merge plan JSON (default: %(default)s)")
    parser.add_argument("--repo", default=os.environ.get("GITHUB_REPOSITORY"), help="<owner>/<repo> name.")
    parser.add_argument("--token", help="GitHub token (falls back to GITHUB_TOKEN env var).")
    parser.add_argument("--method", default=DEFAULT_METHOD, choices=("merge", "squash", "rebase"),
                        help="Merge method used for GitHub merges (default: %(default)s).")
    parser.add_argument("--label", default=DEFAULT_LABEL,
                        help="Label that must be present before merging (default: %(default)s). Use '' to disable.")
    parser.add_argument("--skip-label-check", action="store_true",
                        help="Merge even when the label is missing.")
    parser.add_argument("--max", type=int, default=None,
                        help="Maximum number of pull requests to merge in this run.")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print actions without calling the GitHub API.")
    parser.add_argument("--wait", type=float, default=2.0,
                        help="Seconds to wait between mergeable_state polls (default: %(default)s).")
    parser.add_argument("--retries", type=int, default=5,
                        help="How many times to poll mergeable_state before giving up (default: %(default)s).")
    return parser


def load_plan(path: Path) -> Dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Merge plan not found: {path}")
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if "queue" not in data or not isinstance(data["queue"], list):
        raise ValueError("Plan file must contain a 'queue' array")
    return data


def save_plan(path: Path, data: Dict[str, Any]) -> None:
    serialized = json.dumps(data, indent=2, sort_keys=False) + "\n"
    path.write_text(serialized, encoding="utf-8")


def github_request(method: str, url: str, token: str, body: Optional[Dict[str, Any]] = None) -> Any:
    payload: Optional[bytes] = None
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "merge-ready-prs"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if body is not None:
        payload = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = Request(url, data=payload, headers=headers, method=method)
    try:
        with urlopen(req) as resp:
            if resp.status == 204:
                return {}
            text = resp.read().decode("utf-8")
            return json.loads(text) if text else {}
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise MergeError(f"GitHub request failed ({exc.code}): {detail}") from exc


def fetch_pull_request(repo: str, token: str, number: int, retries: int, wait: float) -> Dict[str, Any]:
    url = f"{API_ROOT}/repos/{repo}/pulls/{number}"
    last: Dict[str, Any] = {}
    for attempt in range(retries):
        last = github_request("GET", url, token)
        mergeable_state = str(last.get("mergeable_state") or "").lower()
        if mergeable_state and mergeable_state != "unknown":
            return last
        time.sleep(wait)
    return last


def merge_pull_request(repo: str, token: str, number: int, method: str, sha: str, title: str) -> Dict[str, Any]:
    url = f"{API_ROOT}/repos/{repo}/pulls/{number}/merge"
    body = {
        "merge_method": method,
        "sha": sha,
        "commit_title": title
    }
    return github_request("PUT", url, token, body)


def format_commit_title(number: int, title: str) -> str:
    if MERGE_TITLE_PREFIX:
        return f"{MERGE_TITLE_PREFIX} PR #{number}: {title}"
    return title


def has_label(pr: Dict[str, Any], required: str) -> bool:
    labels = pr.get("labels") or []
    return any(isinstance(label, dict) and label.get("name", "").lower() == required.lower() for label in labels)


def process_queue(args: argparse.Namespace) -> int:
    plan_path = Path(args.plan)
    plan = load_plan(plan_path)
    queue: List[Dict[str, Any]] = plan.get("queue", [])
    repo = args.repo
    if not repo:
        raise SystemExit("--repo or GITHUB_REPOSITORY must be set")
    token = args.token or os.environ.get("GITHUB_TOKEN")
    skip_remote = args.dry_run and not token
    if not token and not skip_remote:
        raise SystemExit("GITHUB_TOKEN is required (set env var or pass --token).")
    if skip_remote:
        print("[dry-run] No token supplied; skipping GitHub API calls.")
    merged = 0
    updated_plan = False
    for entry in queue:
        if args.max is not None and merged >= args.max:
            break
        if entry.get("state") != "open":
            continue
        number = entry.get("number")
        title = entry.get("title", "")
        if not isinstance(number, int):
            print(f"Skipping invalid queue entry: {entry}")
            continue
        print(f"→ Evaluating PR #{number}: {title}")
        pr_data: Optional[Dict[str, Any]] = None
        if not skip_remote:
            try:
                pr_data = fetch_pull_request(repo, token, number, args.retries, args.wait)
            except MergeError as err:
                print(f"  ! Failed to load PR #{number}: {err}")
                continue
        if pr_data is not None:
            gh_state = pr_data.get("state")
            if gh_state and gh_state != "open":
                print(f"  • PR state is '{gh_state}', updating plan entry.")
                entry["state"] = gh_state
                updated_plan = True
                continue
            if pr_data.get("draft"):
                print("  • Draft PR; waiting for ready-for-review.")
                continue
            required_label = (args.label or DEFAULT_LABEL).strip()
            if not args.skip_label_check and required_label:
                if not has_label(pr_data, required_label):
                    print(f"  • Missing required label '{required_label}'.")
                    continue
            mergeable = str(pr_data.get("mergeable_state") or "").lower()
            if mergeable != "clean":
                print(f"  • mergeable_state is '{mergeable or 'unknown'}'; skipping for now.")
                continue
            sha = pr_data.get("head", {}).get("sha")
            if not sha:
                print("  • Missing head SHA; cannot merge safely.")
                continue
            commit_title = format_commit_title(number, pr_data.get("title", title or "Pull request"))
            if args.dry_run:
                print(f"  ✓ [dry-run] Would merge via {args.method} using {commit_title!r}.")
                continue
            try:
                result = merge_pull_request(repo, token, number, args.method, sha, commit_title)
            except MergeError as err:
                print(f"  ! Merge failed: {err}")
                continue
            if not result.get("merged"):
                print(f"  ! GitHub refused the merge: {result}")
                continue
            print(f"  ✓ Merged PR #{number} at {result.get('sha')}")
            entry["state"] = "merged"
            if result.get("merged_at"):
                entry["merged_at"] = result["merged_at"]
            merged += 1
            updated_plan = True
        else:
            print("  • No GitHub data (offline dry-run); nothing else to do.")
    if updated_plan:
        save_plan(plan_path, plan)
        print(f"Updated {plan_path} with new states.")
    return merged


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    try:
        merged = process_queue(args)
    except (FileNotFoundError, ValueError) as err:
        parser.error(str(err))
    except MergeError as err:
        print(f"Merge error: {err}")
        sys.exit(1)
    if args.dry_run:
        print(f"Dry run complete. {merged} pull request(s) would have been merged.")
    else:
        print(f"Done. {merged} pull request(s) merged.")


if __name__ == "__main__":
    main()
