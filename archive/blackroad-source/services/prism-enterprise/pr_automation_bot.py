"""Automations for keeping pull requests tidy and informative."""

from __future__ import annotations

import csv
import json
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Iterable, List, Mapping, Optional

import requests

ContextMap = Dict[str, str]


@dataclass
class GitHubClient:
    """Thin wrapper around the GitHub REST API for PR operations."""

    repo: str
    token: Optional[str] = None

    def __post_init__(self) -> None:
        if not self.repo:
            raise ValueError("GitHub repository name is required")
        if self.token is None:
            self.token = os.getenv("GITHUB_TOKEN")

    # ------------------------------------------------------------------
    # HTTP helpers
    # ------------------------------------------------------------------
    def _headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "pr-automation-bot",
        }
        if self.token:
            headers["Authorization"] = f"token {self.token}"
        return headers

    def post_comment(self, issue_number: int, body: str) -> Mapping[str, object]:
        """Post an issue comment on the pull request."""

        if not issue_number or not body:
            return {}
        url = f"https://api.github.com/repos/{self.repo}/issues/{issue_number}/comments"
        response = requests.post(url, headers=self._headers(), json={"body": body}, timeout=10)
        response.raise_for_status()
        return response.json()

    def update_pull_request(self, pr_number: int, body: str) -> None:
        """Update the body of a pull request."""

        if not pr_number:
            return
        url = f"https://api.github.com/repos/{self.repo}/pulls/{pr_number}"
        response = requests.patch(url, headers=self._headers(), json={"body": body}, timeout=10)
        response.raise_for_status()


@dataclass
class PRAutomation:
    """Implements behaviour for opened and merged pull requests."""

    client: GitHubClient
    context_map: ContextMap = field(default_factory=dict)

    def handle_pull_request(
        self,
        action: str,
        pr_data: Mapping[str, object],
        payload: Mapping[str, object],
        branch: str,
    ) -> List[str]:
        """Execute automation steps for the supplied pull request event."""

        pr_number = int(pr_data.get("number") or 0)
        pr_body = str(pr_data.get("body") or "")
        pr_title = str(pr_data.get("title") or "")
        branch = branch or self._extract_branch(pr_data)
        normalized_branch = self._normalize_branch(branch)

        actions_taken: List[str] = []

        if action in {"opened", "reopened", "synchronize"}:
            if pr_number and normalized_branch:
                if self._ensure_context(pr_number, pr_body, pr_title, normalized_branch):
                    actions_taken.append("context-updated")
            if action in {"opened", "reopened"} and pr_number:
                comment = self._format_open_comment(normalized_branch or branch)
                self.client.post_comment(pr_number, comment)
                actions_taken.append("open-comment")
            return actions_taken

        if action == "closed" and bool(pr_data.get("merged")) and pr_number:
            actor = self._extract_actor(pr_data, payload)
            comment = self._format_merge_comment(normalized_branch or branch, actor)
            self.client.post_comment(pr_number, comment)
            actions_taken.append("merge-comment")

        return actions_taken

    # ------------------------------------------------------------------
    # Open PR helpers
    # ------------------------------------------------------------------
    def _ensure_context(
        self,
        pr_number: int,
        pr_body: str,
        pr_title: str,
        branch: str,
    ) -> bool:
        context = self._derive_context(branch)
        if not context and pr_title:
            context = pr_title.strip()
        if not context:
            context = self._format_branch_summary(branch)
        if not context:
            return False

        updated_body = self._ensure_context_line(pr_body, context)
        if updated_body == pr_body:
            return False

        self.client.update_pull_request(pr_number, updated_body)
        return True

    def _derive_context(self, branch: str) -> str:
        mapping = self._load_context_map()
        return mapping.get(branch, "")

    def _load_context_map(self) -> ContextMap:
        if self.context_map:
            return self.context_map

        repo_root = Path(__file__).resolve().parents[1]
        candidates = [
            repo_root / "prs-200.csv",
            repo_root / "prs.csv",
        ]

        mapping: ContextMap = {}
        for csv_path in candidates:
            if not csv_path.exists():
                continue
            mapping.update(self._read_context_file(csv_path))

        self.context_map = mapping
        return mapping

    def _read_context_file(self, path: Path) -> ContextMap:
        mapping: ContextMap = {}
        with path.open(newline="", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            if not reader.fieldnames:
                return mapping

            branch_field = self._detect_branch_field(reader.fieldnames)
            context_field = self._detect_context_field(reader.fieldnames)
            if not branch_field or not context_field:
                return mapping

            for row in reader:
                branch_name = (row.get(branch_field) or "").strip()
                context_text = (row.get(context_field) or "").strip()
                if not branch_name or not context_text:
                    continue
                normalized = self._normalize_branch(branch_name)
                mapping.setdefault(normalized, context_text)
        return mapping

    @staticmethod
    def _detect_branch_field(fieldnames: Iterable[str]) -> Optional[str]:
        for candidate in ("branch", "head_branch"):
            if candidate in fieldnames:
                return candidate
        return None

    @staticmethod
    def _detect_context_field(fieldnames: Iterable[str]) -> Optional[str]:
        for candidate in ("summary", "body", "title"):
            if candidate in fieldnames:
                return candidate
        return None

    @staticmethod
    def _normalize_branch(branch: str) -> str:
        branch = branch.strip()
        if branch.startswith("refs/heads/"):
            branch = branch[len("refs/heads/"):]
        return branch

    @staticmethod
    def _format_branch_summary(branch: str) -> str:
        if not branch:
            return ""
        parts = [segment for segment in branch.split("/") if segment]
        if not parts:
            return ""
        last_segment = parts[-1].replace("-", " ").strip() or parts[-1]
        summary = " ".join(word.capitalize() for word in last_segment.split())
        summary = summary or branch
        return f"{summary} ({branch})"

    def _ensure_context_line(self, body: str, context: str) -> str:
        marker = "### Context"
        if marker not in body:
            return body

        section_start = body.index(marker) + len(marker)
        section_tail = body[section_start:]
        next_header_index = section_tail.find("\n### ")
        if next_header_index == -1:
            section_body = section_tail
            remainder = ""
        else:
            section_body = section_tail[:next_header_index]
            remainder = section_tail[next_header_index:]

        updated_section = self._insert_context_line(section_body, context)
        if updated_section == section_body:
            return body

        return body[:section_start] + updated_section + remainder

    def _insert_context_line(self, section: str, context: str) -> str:
        lines = section.splitlines(keepends=True)
        newline = "\n"
        for line in lines:
            if line.endswith("\r\n"):
                newline = "\r\n"
                break

        formatted = f"- Context: {context}{newline}"
        new_lines: List[str] = []
        inserted = False

        for line in lines:
            stripped = line.strip()
            if stripped.lower().startswith("- context:"):
                if not inserted:
                    new_lines.append(formatted)
                    inserted = True
                continue
            new_lines.append(line)

        if not inserted:
            insert_at = 0
            while insert_at < len(new_lines) and new_lines[insert_at].strip() == "":
                insert_at += 1
            new_lines.insert(insert_at, formatted)

        if not new_lines:
            new_lines.append(formatted)

        updated = "".join(new_lines)
        if section.endswith(newline) and not updated.endswith(newline):
            updated += newline
        return updated

    # ------------------------------------------------------------------
    # Merge helpers
    # ------------------------------------------------------------------
    @staticmethod
    def _extract_actor(pr_data: Mapping[str, object], payload: Mapping[str, object]) -> str:
        merged_by = pr_data.get("merged_by") or {}
        if isinstance(merged_by, Mapping):
            login = str(merged_by.get("login") or "")
            if login:
                return login
        sender = payload.get("sender") or {}
        if isinstance(sender, Mapping):
            login = str(sender.get("login") or "")
            if login:
                return login
        return ""

    @staticmethod
    def _format_open_comment(branch: str) -> str:
        branch_display = branch or "unknown"
        return (
            f"PR Automation Bot initialized for branch `{branch_display}`. "
            "I'll keep the Context section up to date."
        )

    @staticmethod
    def _format_merge_comment(branch: str, actor: str) -> str:
        branch_display = branch or "the latest changes"
        if actor:
            return (
                f"PR Automation Bot detected a merge of `{branch_display}` by @{actor}. "
                "Thanks for shipping!"
            )
        return (
            f"PR Automation Bot detected a merge of `{branch_display}`. "
            "Thanks for shipping!"
        )

    @staticmethod
    def _extract_branch(pr_data: Mapping[str, object]) -> str:
        head = pr_data.get("head") or {}
        if isinstance(head, Mapping):
            return str(head.get("ref") or "")
        return ""


def main() -> int:
    repo = os.getenv("GITHUB_REPO") or os.getenv("GITHUB_REPOSITORY") or ""
    event_path = os.getenv("GITHUB_EVENT_PATH") or ""
    event_name = os.getenv("GITHUB_EVENT_NAME", "")
    branch = os.getenv("PR_BRANCH", "")

    if not repo:
        print("PR automation bot missing required environment: GITHUB_REPO/GITHUB_REPOSITORY.")
        return 1
    if event_name and event_name != "pull_request":
        print(f"Event `{event_name}` is not handled by the PR automation bot.")
        return 0
    if not event_path:
        print("GitHub event payload path is not set; nothing to do.")
        return 1

    event_file = Path(event_path)
    if not event_file.exists():
        print(f"GitHub event payload not found at {event_file}.")
        return 1

    with event_file.open(encoding="utf-8") as handle:
        payload: Mapping[str, object] = json.load(handle)

    pr_data = payload.get("pull_request") or {}
    if not isinstance(pr_data, Mapping) or not pr_data:
        print("No pull request data found in event payload; skipping automation.")
        return 0

    action = str(payload.get("action") or "")
    branch = branch or PRAutomation._extract_branch(pr_data)

    client = GitHubClient(repo=repo, token=os.getenv("GITHUB_TOKEN"))
    automation = PRAutomation(client=client)
    actions_taken = automation.handle_pull_request(action, pr_data, payload, branch)

    if actions_taken:
        print("PR automation completed:", ", ".join(actions_taken))
    else:
        print("PR automation finished with no actions required.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
