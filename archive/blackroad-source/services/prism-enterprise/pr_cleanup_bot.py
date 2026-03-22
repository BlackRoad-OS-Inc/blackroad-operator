"""Utilities to close stale pull requests and prune old comments."""

from __future__ import annotations

import argparse
import os
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import List, Optional

import requests


@dataclass
class PullRequestCleanupBot:
    """Close stale pull requests and delete aged comments.

    Attributes:
        repo: Repository in ``owner/name`` format.
        token: GitHub token with repo scope. Uses ``GITHUB_TOKEN`` env var if omitted.
        days: Items with no updates for this many days are considered stale.
        max_pull_requests: Cap on how many open PRs are inspected per run. Defaults to
            the first 20 so that smaller bursts are handled quickly but can be
            increased (up to 2000) when a backlog builds up.
        page_size: GitHub API page size (1–100) used while paging through open PRs.
    """

    repo: str
    token: Optional[str] = None
    days: int = 30
    max_pull_requests: int = 20
    page_size: int = 50

    def __post_init__(self) -> None:
        if self.token is None:
            self.token = os.getenv("GITHUB_TOKEN")
        if not 1 <= self.max_pull_requests <= 2000:
            raise ValueError("max_pull_requests must be between 1 and 2000")
        if not 1 <= self.page_size <= 100:
            raise ValueError("page_size must be between 1 and 100")

    def _headers(self) -> dict:
        headers = {
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
        }
        if self.token:
            headers["Authorization"] = f"token {self.token}"
        return headers

    def get_open_pull_requests(self, limit: Optional[int] = None) -> List[dict]:
        """Return open pull requests for the repository up to ``limit``."""

        limit = limit or self.max_pull_requests
        if limit <= 0:
            return []

        pulls: List[dict] = []
        page = 1
        per_page = min(self.page_size, 100)
        while len(pulls) < limit:
            params = {"state": "open", "per_page": per_page, "page": page}
            url = f"https://api.github.com/repos/{self.repo}/pulls"
            response = requests.get(url, params=params, headers=self._headers(), timeout=10)
            response.raise_for_status()
            data = response.json()
            if not data:
                break
            pulls.extend(data)
            if len(data) < per_page:
                break
            page += 1
        return pulls[:limit]

    def close_pull_request(self, number: int) -> dict:
        """Close a pull request by number."""

        url = f"https://api.github.com/repos/{self.repo}/pulls/{number}"
        payload = {"state": "closed"}
        response = requests.patch(url, json=payload, headers=self._headers(), timeout=10)
        response.raise_for_status()
        return response.json()

    def close_stale_pull_requests(self) -> List[int]:
        """Close pull requests with no updates for ``days`` days."""

        cutoff = datetime.now(timezone.utc) - timedelta(days=self.days)
        closed: List[int] = []
        for pr in self.get_open_pull_requests():
            updated = datetime.fromisoformat(pr["updated_at"].replace("Z", "+00:00"))
            if updated < cutoff:
                self.close_pull_request(pr["number"])
                closed.append(pr["number"])
        return closed

    def _get_comments(self, number: int) -> List[dict]:
        """Return comments for a pull request."""

        url = f"https://api.github.com/repos/{self.repo}/issues/{number}/comments"
        response = requests.get(url, headers=self._headers(), timeout=10)
        response.raise_for_status()
        return response.json()

    def _delete_comment(self, comment_id: int) -> None:
        """Delete a comment by ``comment_id``."""

        url = f"https://api.github.com/repos/{self.repo}/issues/comments/{comment_id}"
        response = requests.delete(url, headers=self._headers(), timeout=10)
        response.raise_for_status()

    def cleanup_stale_comments(self) -> List[int]:
        """Remove comments on open pull requests stale for ``days`` days."""

        cutoff = datetime.now(timezone.utc) - timedelta(days=self.days)
        deleted: List[int] = []
        for pr in self.get_open_pull_requests():
            for comment in self._get_comments(pr["number"]):
                updated = datetime.fromisoformat(comment["updated_at"].replace("Z", "+00:00"))
                if updated < cutoff:
                    self._delete_comment(comment["id"])
                    deleted.append(comment["id"])
        return deleted


def main(argv: List[str] | None = None) -> int:
    """CLI entry point to close stale pull requests."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repo", help="Repository in owner/name format")
    parser.add_argument("--days", type=int, default=30, help="Days to consider stale")
    parser.add_argument(
        "--max-open",
        type=int,
        default=20,
        help="Maximum number of open pull requests to inspect (1-2000)",
    )
    parser.add_argument(
        "--page-size",
        type=int,
        default=50,
        help="GitHub API page size for pull request listing (1-100)",
    )
    args = parser.parse_args(argv)

    if not 1 <= args.max_open <= 2000:
        parser.error("--max-open must be between 1 and 2000")
    if not 1 <= args.page_size <= 100:
        parser.error("--page-size must be between 1 and 100")

    bot = PullRequestCleanupBot(
        repo=args.repo,
        days=args.days,
        max_pull_requests=args.max_open,
        page_size=args.page_size,
    )
    closed = bot.close_stale_pull_requests()
    for pr_number in closed:
        print(f"Closed pull request #{pr_number}")
    if not closed:
        print("No stale pull requests found.")

    deleted = bot.cleanup_stale_comments()
    for comment_id in deleted:
        print(f"Deleted comment {comment_id}")
    if not deleted:
        print("No stale comments found.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
