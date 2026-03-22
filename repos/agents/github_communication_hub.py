"""
BlackRoad Agent GitHub Communication Hub

This module provides a centralized communication hub for agents to interact
with GitHub as a primary communication and collaboration platform.

Features:
- Submit pull requests
- Create issues
- Post comments on issues and PRs
- Request new features
- Participate in code reviews
- Coordinate with other agents
"""

from __future__ import annotations

import json
import os
import subprocess
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional


class ActionType(Enum):
    """Types of GitHub actions agents can perform"""
    PR_CREATE = "pr_create"
    PR_REVIEW = "pr_review"
    ISSUE_CREATE = "issue_create"
    COMMENT = "comment"
    FEATURE_REQUEST = "feature_request"
    CODE_REVIEW = "code_review"
    MERGE_REQUEST = "merge_request"


@dataclass
class AgentGitHubIdentity:
    """Agent identity for GitHub interactions"""
    id: str
    github_username: str
    github_handle: str
    name: str
    role: str
    category: str
    cluster: Optional[str] = None
    manifest_path: Optional[str] = None
    permissions: List[str] = field(default_factory=list)
    # Optional fields from registry
    specialization: Optional[str] = None
    fullTitle: Optional[str] = None
    description: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    active: bool = True
    file_path: Optional[str] = None
    manifest_path: Optional[str] = None
    cluster: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def has_permission(self, permission: str) -> bool:
        """Check if agent has a specific permission"""
        return permission in self.permissions


@dataclass
class GitHubAction:
    """Represents a GitHub action performed by an agent"""
    agent_id: str
    action_type: ActionType
    timestamp: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    success: bool = True
    error: Optional[str] = None


class GitHubCommunicationHub:
    """Central hub for agent GitHub communication"""

    def __init__(
        self,
        registry_path: Path = Path("registry/github_agent_identities.json"),
        archetypes_path: Path = Path("registry/github_agent_identities_archetypes.jsonl"),
        specialized_path: Path = Path("registry/github_agent_identities_specialized.jsonl"),
        actions_log: Path = Path("artifacts/agents/actions"),
    ):
        self.registry_path = registry_path
        self.archetypes_path = archetypes_path
        self.specialized_path = specialized_path
        self.actions_log = actions_log
        self.actions_log.mkdir(parents=True, exist_ok=True)

        # Load agent identities
        self._identities = self._load_identities()

    def _load_identities(self) -> Dict[str, AgentGitHubIdentity]:
        """Load all agent GitHub identities from registry files"""
        identities = {}

        # Load main registry
        if self.registry_path.exists():
            with open(self.registry_path, 'r') as f:
                data = json.load(f)
                for agent in data.get('agents', []):
                    identities[agent['id']] = self._create_identity(agent)

                # Load service bots (add default role if missing)
                for bot in data.get('service_bots', {}).get('agents', []):
                    if 'role' not in bot:
                        bot['role'] = 'service'
                    identities[bot['id']] = AgentGitHubIdentity(**bot)
                    identities[bot['id']] = self._create_identity(bot)

        # Load archetypes
        if self.archetypes_path.exists():
            with open(self.archetypes_path, 'r') as f:
                for line in f:
                    agent = json.loads(line.strip())
                    identities[agent['id']] = self._create_identity(agent)

        # Load specialized
        if self.specialized_path.exists():
            with open(self.specialized_path, 'r') as f:
                for line in f:
                    agent = json.loads(line.strip())
                    identities[agent['id']] = self._create_identity(agent)

        return identities

    def _create_identity(self, payload: Dict[str, Any]) -> AgentGitHubIdentity:
        core_fields = {
            "id": payload.get("id", ""),
            "github_username": payload.get("github_username", ""),
            "github_handle": payload.get("github_handle", ""),
            "name": payload.get("name", ""),
            "role": payload.get("role", ""),
            "category": payload.get("category", ""),
            "cluster": payload.get("cluster"),
            "manifest_path": payload.get("manifest_path"),
            "permissions": list(payload.get("permissions", [])),
        }
        known_keys = set(core_fields.keys())
        core_fields["metadata"] = {k: v for k, v in payload.items() if k not in known_keys}
        return AgentGitHubIdentity(**core_fields)

    def get_agent(self, agent_id: str) -> Optional[AgentGitHubIdentity]:
        """Get agent identity by ID"""
        return self._identities.get(agent_id)

    def submit_pull_request(
        self,
        agent_id: str,
        branch_name: str,
        pr_title: str,
        pr_body: str,
        base_branch: str = "main",
    ) -> GitHubAction:
        """Submit a pull request on behalf of an agent"""
        agent = self.get_agent(agent_id)
        if not agent:
            return GitHubAction(
                agent_id=agent_id,
                action_type=ActionType.PR_CREATE,
                timestamp=datetime.utcnow().isoformat(),
                success=False,
                error="Agent not found in registry"
            )

        if not agent.has_permission("pr_create"):
            return GitHubAction(
                agent_id=agent_id,
                action_type=ActionType.PR_CREATE,
                timestamp=datetime.utcnow().isoformat(),
                success=False,
                error="Agent does not have pr_create permission"
            )

        try:
            # Trigger GitHub workflow via repository_dispatch
            result = subprocess.run(
                [
                    "gh", "workflow", "run", "agent-pr-creator.yml",
                    "-f", f"agent_id={agent_id}",
                    "-f", f"branch_name={branch_name}",
                    "-f", f"pr_title={pr_title}",
                    "-f", f"pr_body={pr_body}",
                    "-f", f"base_branch={base_branch}",
                ],
                capture_output=True,
                text=True,
            )

            action = GitHubAction(
                agent_id=agent_id,
                action_type=ActionType.PR_CREATE,
                timestamp=datetime.utcnow().isoformat(),
                metadata={
                    "branch_name": branch_name,
                    "pr_title": pr_title,
                    "base_branch": base_branch,
                },
                success=result.returncode == 0,
                error=result.stderr if result.returncode != 0 else None
            )

            self._log_action(action)
            return action

        except Exception as e:
            action = GitHubAction(
                agent_id=agent_id,
                action_type=ActionType.PR_CREATE,
                timestamp=datetime.utcnow().isoformat(),
                success=False,
                error=str(e)
            )
            self._log_action(action)
            return action

    def create_issue(
        self,
        agent_id: str,
        issue_title: str,
        issue_body: str,
        labels: Optional[List[str]] = None,
        assignees: Optional[List[str]] = None,
    ) -> GitHubAction:
        """Create an issue on behalf of an agent"""
        agent = self.get_agent(agent_id)
        if not agent:
            return GitHubAction(
                agent_id=agent_id,
                action_type=ActionType.ISSUE_CREATE,
                timestamp=datetime.utcnow().isoformat(),
                success=False,
                error="Agent not found in registry"
            )

        if not agent.has_permission("issue_create"):
            return GitHubAction(
                agent_id=agent_id,
                action_type=ActionType.ISSUE_CREATE,
                timestamp=datetime.utcnow().isoformat(),
                success=False,
                error="Agent does not have issue_create permission"
            )

        try:
            labels_str = ",".join(labels) if labels else ""
            assignees_str = ",".join(assignees) if assignees else ""

            result = subprocess.run(
                [
                    "gh", "workflow", "run", "agent-issue-creator.yml",
                    "-f", f"agent_id={agent_id}",
                    "-f", f"issue_title={issue_title}",
                    "-f", f"issue_body={issue_body}",
                    "-f", f"labels={labels_str}",
                    "-f", f"assignees={assignees_str}",
                ],
                capture_output=True,
                text=True,
            )

            action = GitHubAction(
                agent_id=agent_id,
                action_type=ActionType.ISSUE_CREATE,
                timestamp=datetime.utcnow().isoformat(),
                metadata={
                    "issue_title": issue_title,
                    "labels": labels,
                    "assignees": assignees,
                },
                success=result.returncode == 0,
                error=result.stderr if result.returncode != 0 else None
            )

            self._log_action(action)
            return action

        except Exception as e:
            action = GitHubAction(
                agent_id=agent_id,
                action_type=ActionType.ISSUE_CREATE,
                timestamp=datetime.utcnow().isoformat(),
                success=False,
                error=str(e)
            )
            self._log_action(action)
            return action

    def post_comment(
        self,
        agent_id: str,
        target_type: str,
        target_number: int,
        comment_body: str,
    ) -> GitHubAction:
        """Post a comment on an issue or PR on behalf of an agent"""
        agent = self.get_agent(agent_id)
        if not agent:
            return GitHubAction(
                agent_id=agent_id,
                action_type=ActionType.COMMENT,
                timestamp=datetime.utcnow().isoformat(),
                success=False,
                error="Agent not found in registry"
            )

        if not agent.has_permission("comment"):
            return GitHubAction(
                agent_id=agent_id,
                action_type=ActionType.COMMENT,
                timestamp=datetime.utcnow().isoformat(),
                success=False,
                error="Agent does not have comment permission"
            )

        try:
            result = subprocess.run(
                [
                    "gh", "workflow", "run", "agent-commenter.yml",
                    "-f", f"agent_id={agent_id}",
                    "-f", f"target_type={target_type}",
                    "-f", f"target_number={target_number}",
                    "-f", f"comment_body={comment_body}",
                ],
                capture_output=True,
                text=True,
            )

            action = GitHubAction(
                agent_id=agent_id,
                action_type=ActionType.COMMENT,
                timestamp=datetime.utcnow().isoformat(),
                metadata={
                    "target_type": target_type,
                    "target_number": target_number,
                },
                success=result.returncode == 0,
                error=result.stderr if result.returncode != 0 else None
            )

            self._log_action(action)
            return action

        except Exception as e:
            action = GitHubAction(
                agent_id=agent_id,
                action_type=ActionType.COMMENT,
                timestamp=datetime.utcnow().isoformat(),
                success=False,
                error=str(e)
            )
            self._log_action(action)
            return action

    def request_feature(
        self,
        agent_id: str,
        feature_title: str,
        feature_description: str,
        rationale: str,
    ) -> GitHubAction:
        """Request a new feature on behalf of an agent"""
        # Feature requests are just issues with specific labels
        issue_body = f"{feature_description}\n\n## Rationale\n{rationale}"
        return self.create_issue(
            agent_id=agent_id,
            issue_title=f"[Feature Request] {feature_title}",
            issue_body=issue_body,
            labels=["feature-request", "agent-proposed"],
        )

    def _log_action(self, action: GitHubAction) -> None:
        """Log an action to the actions log"""
        log_file = self.actions_log / f"{action.action_type.value}_actions.jsonl"

        action_data = {
            "timestamp": action.timestamp,
            "agent_id": action.agent_id,
            "action_type": action.action_type.value,
            "success": action.success,
            "metadata": action.metadata,
        }

        if action.error:
            action_data["error"] = action.error

        with open(log_file, 'a') as f:
            f.write(json.dumps(action_data) + '\n')

    def get_agent_actions(
        self,
        agent_id: str,
        action_type: Optional[ActionType] = None,
    ) -> List[Dict[str, Any]]:
        """Get all actions performed by an agent"""
        actions = []

        # Determine which log files to read
        if action_type:
            log_files = [self.actions_log / f"{action_type.value}_actions.jsonl"]
        else:
            log_files = list(self.actions_log.glob("*_actions.jsonl"))

        # Read and filter actions
        for log_file in log_files:
            if log_file.exists():
                with open(log_file, 'r') as f:
                    for line in f:
                        action = json.loads(line.strip())
                        if action['agent_id'] == agent_id:
                            actions.append(action)

        return sorted(actions, key=lambda x: x['timestamp'], reverse=True)

    def get_all_actions(
        self,
        limit: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Get all actions across all agents"""
        actions = []

        log_files = list(self.actions_log.glob("*_actions.jsonl"))

        for log_file in log_files:
            if log_file.exists():
                with open(log_file, 'r') as f:
                    for line in f:
                        actions.append(json.loads(line.strip()))

        # Sort by timestamp descending
        actions = sorted(actions, key=lambda x: x['timestamp'], reverse=True)

        if limit:
            return actions[:limit]

        return actions

    def get_communication_stats(self) -> Dict[str, Any]:
        """Get statistics about agent communication"""
        all_actions = self.get_all_actions()

        stats = {
            "total_actions": len(all_actions),
            "total_agents": len(self._identities),
            "active_agents": len(set(a['agent_id'] for a in all_actions)),
            "actions_by_type": {},
            "actions_by_agent": {},
            "success_rate": 0.0,
        }

        # Count by type
        for action in all_actions:
            action_type = action['action_type']
            stats['actions_by_type'][action_type] = stats['actions_by_type'].get(action_type, 0) + 1

        # Count by agent
        for action in all_actions:
            agent_id = action['agent_id']
            stats['actions_by_agent'][agent_id] = stats['actions_by_agent'].get(agent_id, 0) + 1

        # Calculate success rate
        if all_actions:
            successful = sum(1 for a in all_actions if a.get('success', True))
            stats['success_rate'] = round((successful / len(all_actions)) * 100, 2)

        return stats


# CLI interface
if __name__ == "__main__":
    import sys

    hub = GitHubCommunicationHub()

    if len(sys.argv) < 2:
        print("Usage: python github_communication_hub.py <command> [args]")
        print("\nCommands:")
        print("  stats                          - Show communication statistics")
        print("  actions <agent_id>             - Show actions for an agent")
        print("  pr <agent_id> <branch> <title> - Submit a PR")
        print("  issue <agent_id> <title>       - Create an issue")
        print("  comment <agent_id> <type> <num>- Post a comment")
        sys.exit(1)

    command = sys.argv[1]

    if command == "stats":
        stats = hub.get_communication_stats()
        print(json.dumps(stats, indent=2))

    elif command == "actions":
        if len(sys.argv) < 3:
            print("Usage: python github_communication_hub.py actions <agent_id>")
            sys.exit(1)

        agent_id = sys.argv[2]
        actions = hub.get_agent_actions(agent_id)
        print(json.dumps(actions, indent=2))

    elif command == "pr":
        if len(sys.argv) < 5:
            print("Usage: python github_communication_hub.py pr <agent_id> <branch> <title>")
            sys.exit(1)

        agent_id = sys.argv[2]
        branch = sys.argv[3]
        title = sys.argv[4]
        body = sys.argv[5] if len(sys.argv) > 5 else "Auto-generated PR"

        action = hub.submit_pull_request(agent_id, branch, title, body)
        print(f"Success: {action.success}")
        if action.error:
            print(f"Error: {action.error}")

    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
