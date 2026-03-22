#!/usr/bin/env python3
"""
Multi-Platform Identity Manager for BlackRoad Agents

Manages agent identities, email addresses, and account creation across:
- Slack
- Discord
- Reddit
- Instagram
- Asana
- Linear
- GitHub

Ensures all 1,250 agents have complete platform presence with proper email addresses.
"""

import json
import os
import logging
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
from pathlib import Path
from datetime import datetime
import random

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class AgentPlatformIdentity:
    """Complete identity for an agent across all platforms"""
    agent_id: str  # P1, P2, etc.
    name: str
    github_username: str
    email: str
    domain: str

    # Platform-specific usernames
    slack_username: Optional[str] = None
    discord_username: Optional[str] = None
    reddit_username: Optional[str] = None
    instagram_username: Optional[str] = None
    linear_username: Optional[str] = None
    asana_username: Optional[str] = None

    # Platform-specific IDs (populated after account creation)
    slack_user_id: Optional[str] = None
    discord_user_id: Optional[str] = None
    reddit_user_id: Optional[str] = None
    instagram_user_id: Optional[str] = None
    linear_user_id: Optional[str] = None
    asana_user_id: Optional[str] = None

    # Status tracking
    platforms_active: List[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    def __post_init__(self):
        if self.platforms_active is None:
            self.platforms_active = []
        if self.created_at is None:
            self.created_at = datetime.utcnow().isoformat()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow().isoformat()


class PlatformIdentityManager:
    """Manages agent identities across all platforms"""

    def __init__(self, registry_dir: str = "./registry"):
        self.registry_dir = Path(registry_dir)
        self.domains = []
        self.platform_config = {}
        self.agents = {}
        self.domain_usage = {}

        self._load_configurations()
        self._load_existing_identities()

    def _load_configurations(self):
        """Load platform configurations and domain list"""
        config_path = self.registry_dir / "agent_platform_identities.json"

        if config_path.exists():
            with open(config_path, 'r') as f:
                config = json.load(f)
                self.domains = config.get("domains", ["blackroad.ai"])
                self.platform_config = config.get("platforms", {})
                logger.info(f"Loaded {len(self.domains)} domains and {len(self.platform_config)} platform configs")
        else:
            logger.warning(f"Platform config not found at {config_path}, using defaults")
            self.domains = ["blackroad.ai"]

        # Initialize domain usage tracking
        for domain in self.domains:
            self.domain_usage[domain] = 0

    def _load_existing_identities(self):
        """Load all existing agent identities from registry files"""
        # Load main registry
        main_registry = self.registry_dir / "github_agent_identities.json"
        if main_registry.exists():
            with open(main_registry, 'r') as f:
                data = json.load(f)
                for agent in data.get("agents", []):
                    self._register_agent(agent)

        # Load archetype agents (JSONL)
        archetype_registry = self.registry_dir / "github_agent_identities_archetypes.jsonl"
        if archetype_registry.exists():
            with open(archetype_registry, 'r') as f:
                for line in f:
                    if line.strip():
                        agent = json.loads(line)
                        self._register_agent(agent)

        # Load specialized agents (JSONL)
        specialized_registry = self.registry_dir / "github_agent_identities_specialized.jsonl"
        if specialized_registry.exists():
            with open(specialized_registry, 'r') as f:
                for line in f:
                    if line.strip():
                        agent = json.loads(line)
                        self._register_agent(agent)

        logger.info(f"Loaded {len(self.agents)} total agents from registries")

    def _register_agent(self, agent_data: Dict):
        """Register an agent and create platform identities"""
        agent_id = agent_data.get("id")
        name = agent_data.get("name")
        github_username = agent_data.get("github_username", "").replace("@", "")

        if not all([agent_id, name, github_username]):
            logger.warning(f"Skipping agent with incomplete data: {agent_data}")
            return

        # Assign domain using balanced distribution
        domain = self._assign_domain()
        email = f"{github_username}@{domain}"

        # Generate platform-specific usernames
        identity = AgentPlatformIdentity(
            agent_id=agent_id,
            name=name,
            github_username=github_username,
            email=email,
            domain=domain,
            slack_username=github_username,
            discord_username=name,
            reddit_username=f"{github_username}_blackroad",
            instagram_username=f"{github_username}_blackroad",
            linear_username=name,
            asana_username=name,
            platforms_active=["github"]  # GitHub is default
        )

        self.agents[agent_id] = identity
        self.domain_usage[domain] += 1

    def _assign_domain(self) -> str:
        """Assign domain using balanced distribution"""
        if not self.domains:
            return "blackroad.ai"

        # Find domain with least usage
        min_usage = min(self.domain_usage.values())
        available_domains = [d for d in self.domains if self.domain_usage[d] == min_usage]

        # Random selection among least-used domains
        return random.choice(available_domains)

    def generate_platform_credentials(self, agent_id: str, platform: str) -> Dict:
        """Generate credentials for platform account creation"""
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} not found in registry")

        identity = self.agents[agent_id]

        credentials = {
            "agent_id": agent_id,
            "platform": platform,
            "email": identity.email,
            "username": getattr(identity, f"{platform}_username"),
            "display_name": identity.name,
            "generated_at": datetime.utcnow().isoformat()
        }

        # Platform-specific configuration
        if platform == "slack":
            credentials["workspace"] = self.platform_config.get("slack", {}).get("workspace")
        elif platform == "discord":
            credentials["servers"] = self.platform_config.get("discord", {}).get("servers", [])
        elif platform == "reddit":
            credentials["subreddit"] = self.platform_config.get("reddit", {}).get("subreddit")
        elif platform == "instagram":
            credentials["handle"] = f"@{identity.instagram_username}"
        elif platform == "linear":
            credentials["workspace"] = self.platform_config.get("linear", {}).get("workspace")
            credentials["team_id"] = self.platform_config.get("linear", {}).get("team_id")
        elif platform == "asana":
            credentials["workspace_url"] = self.platform_config.get("asana", {}).get("workspace_url")

        return credentials

    def mark_platform_active(self, agent_id: str, platform: str, platform_user_id: Optional[str] = None):
        """Mark a platform as active for an agent"""
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} not found")

        identity = self.agents[agent_id]

        if platform not in identity.platforms_active:
            identity.platforms_active.append(platform)

        # Store platform-specific user ID
        if platform_user_id:
            setattr(identity, f"{platform}_user_id", platform_user_id)

        identity.updated_at = datetime.utcnow().isoformat()

        logger.info(f"Marked {platform} as active for {agent_id} ({identity.name})")

    def get_agent_identity(self, agent_id: str) -> Optional[AgentPlatformIdentity]:
        """Get complete identity for an agent"""
        return self.agents.get(agent_id)

    def get_agents_by_platform(self, platform: str) -> List[AgentPlatformIdentity]:
        """Get all agents active on a specific platform"""
        return [
            identity for identity in self.agents.values()
            if platform in identity.platforms_active
        ]

    def get_agents_missing_platform(self, platform: str) -> List[AgentPlatformIdentity]:
        """Get all agents NOT active on a specific platform"""
        return [
            identity for identity in self.agents.values()
            if platform not in identity.platforms_active
        ]

    def export_identities(self, output_path: Optional[str] = None) -> str:
        """Export all agent identities to JSON"""
        if output_path is None:
            output_path = self.registry_dir / "agent_platform_identities_full.json"

        export_data = {
            "version": "1.0.0",
            "exported_at": datetime.utcnow().isoformat(),
            "total_agents": len(self.agents),
            "domains": self.domains,
            "domain_usage": self.domain_usage,
            "platform_config": self.platform_config,
            "agents": [asdict(identity) for identity in self.agents.values()]
        }

        with open(output_path, 'w') as f:
            json.dump(export_data, f, indent=2)

        logger.info(f"Exported {len(self.agents)} agent identities to {output_path}")
        return str(output_path)

    def export_csv(self, platform: Optional[str] = None, output_path: Optional[str] = None) -> str:
        """Export agent identities to CSV format"""
        import csv

        if output_path is None:
            suffix = f"_{platform}" if platform else "_all"
            output_path = self.registry_dir / f"agent_identities{suffix}.csv"

        agents = self.get_agents_by_platform(platform) if platform else list(self.agents.values())

        if not agents:
            logger.warning(f"No agents found for export")
            return ""

        fieldnames = [
            'agent_id', 'name', 'email', 'domain', 'github_username',
            'slack_username', 'discord_username', 'reddit_username',
            'instagram_username', 'linear_username', 'asana_username',
            'platforms_active'
        ]

        with open(output_path, 'w', newline='') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()

            for identity in agents:
                row = {
                    'agent_id': identity.agent_id,
                    'name': identity.name,
                    'email': identity.email,
                    'domain': identity.domain,
                    'github_username': identity.github_username,
                    'slack_username': identity.slack_username,
                    'discord_username': identity.discord_username,
                    'reddit_username': identity.reddit_username,
                    'instagram_username': identity.instagram_username,
                    'linear_username': identity.linear_username,
                    'asana_username': identity.asana_username,
                    'platforms_active': ','.join(identity.platforms_active)
                }
                writer.writerow(row)

        logger.info(f"Exported {len(agents)} agents to CSV: {output_path}")
        return str(output_path)

    def get_statistics(self) -> Dict:
        """Get statistics about agent platform coverage"""
        stats = {
            "total_agents": len(self.agents),
            "domains": {domain: count for domain, count in self.domain_usage.items()},
            "platforms": {}
        }

        platforms = ["slack", "discord", "reddit", "instagram", "linear", "asana", "github"]

        for platform in platforms:
            active = len(self.get_agents_by_platform(platform))
            missing = len(self.get_agents_missing_platform(platform))
            stats["platforms"][platform] = {
                "active": active,
                "missing": missing,
                "coverage_percent": round((active / len(self.agents)) * 100, 2)
            }

        return stats

    def print_statistics(self):
        """Print statistics to console"""
        stats = self.get_statistics()

        print("\n" + "="*80)
        print("BLACKROAD AGENT PLATFORM IDENTITY STATISTICS")
        print("="*80)
        print(f"\nTotal Agents: {stats['total_agents']}")

        print(f"\nDomain Distribution:")
        for domain, count in stats['domains'].items():
            percent = (count / stats['total_agents']) * 100
            print(f"  {domain}: {count} ({percent:.1f}%)")

        print(f"\nPlatform Coverage:")
        for platform, data in stats['platforms'].items():
            print(f"\n  {platform.upper()}:")
            print(f"    Active: {data['active']}")
            print(f"    Missing: {data['missing']}")
            print(f"    Coverage: {data['coverage_percent']}%")

        print("\n" + "="*80 + "\n")


def main():
    """Main entry point for platform identity management"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Manage agent identities across all platforms"
    )
    parser.add_argument(
        'command',
        choices=['stats', 'export', 'export-csv', 'credentials', 'missing'],
        help='Command to execute'
    )
    parser.add_argument(
        '--agent-id',
        help='Specific agent ID (e.g., P1, P15)'
    )
    parser.add_argument(
        '--platform',
        choices=['slack', 'discord', 'reddit', 'instagram', 'linear', 'asana', 'github'],
        help='Specific platform'
    )
    parser.add_argument(
        '--output',
        help='Output file path'
    )

    args = parser.parse_args()

    manager = PlatformIdentityManager()

    if args.command == 'stats':
        manager.print_statistics()

    elif args.command == 'export':
        output_path = manager.export_identities(args.output)
        print(f"Exported identities to: {output_path}")

    elif args.command == 'export-csv':
        output_path = manager.export_csv(args.platform, args.output)
        print(f"Exported CSV to: {output_path}")

    elif args.command == 'credentials':
        if not args.agent_id or not args.platform:
            print("Error: --agent-id and --platform required for credentials command")
            return

        creds = manager.generate_platform_credentials(args.agent_id, args.platform)
        print(json.dumps(creds, indent=2))

    elif args.command == 'missing':
        if not args.platform:
            print("Error: --platform required for missing command")
            return

        missing = manager.get_agents_missing_platform(args.platform)
        print(f"\nAgents missing from {args.platform}: {len(missing)}\n")

        for identity in missing[:20]:  # Show first 20
            print(f"  {identity.agent_id}: {identity.name} ({identity.email})")

        if len(missing) > 20:
            print(f"\n  ... and {len(missing) - 20} more")


if __name__ == "__main__":
    main()
