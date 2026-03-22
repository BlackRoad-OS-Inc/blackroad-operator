#!/usr/bin/env python3
"""
Multi-Platform Account Orchestrator for BlackRoad Agents

Orchestrates account creation and management across all platforms:
- GitHub (already configured)
- Slack
- Discord
- Reddit
- Instagram
- Asana
- Linear

Ensures all 1,250 agents have complete platform presence.
"""

import json
import os
import sys
import logging
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from agents.platform_identity_manager import PlatformIdentityManager, AgentPlatformIdentity
from sync_connectors.connectors.slack import SlackConnector
from sync_connectors.connectors.reddit import RedditConnector
from sync_connectors.connectors.instagram import InstagramConnector, InstagramAccountManager
from sync_connectors.connectors.discord_enhanced import DiscordConnector, DiscordAgentManager
from sync_connectors.connectors.linear import LinearConnector
from sync_connectors.connectors.asana import AsanaConnector

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MultiPlatformOrchestrator:
    """Orchestrates agent presence across all platforms"""

    def __init__(self, registry_dir: str = "./registry"):
        self.registry_dir = Path(registry_dir)
        self.identity_manager = PlatformIdentityManager(registry_dir)

        # Initialize platform connectors
        self.connectors = {
            "slack": SlackConnector(),
            "discord": DiscordConnector(),
            "reddit": RedditConnector(),
            "instagram": InstagramConnector(),
            "linear": LinearConnector(),
            "asana": AsanaConnector()
        }

        # Platform-specific managers
        self.instagram_manager = InstagramAccountManager()
        self.discord_manager = DiscordAgentManager()

        # Tracking
        self.provisioning_log = []
        self.errors = []

    def provision_all_agents(self, platforms: Optional[List[str]] = None, batch_size: int = 50):
        """Provision all agents across specified platforms"""

        if platforms is None:
            platforms = ["slack", "discord", "reddit", "instagram", "linear", "asana"]

        total_agents = len(self.identity_manager.agents)

        logger.info(f"Starting provisioning for {total_agents} agents across {len(platforms)} platforms")

        for platform in platforms:
            logger.info(f"\n{'='*80}")
            logger.info(f"PROVISIONING PLATFORM: {platform.upper()}")
            logger.info(f"{'='*80}\n")

            missing_agents = self.identity_manager.get_agents_missing_platform(platform)

            logger.info(f"Found {len(missing_agents)} agents to provision on {platform}")

            # Batch processing
            for i in range(0, len(missing_agents), batch_size):
                batch = missing_agents[i:i + batch_size]
                logger.info(f"Processing batch {i//batch_size + 1} ({len(batch)} agents)")

                self._provision_batch(platform, batch)

        self._generate_report()

    def _provision_batch(self, platform: str, agents: List[AgentPlatformIdentity]):
        """Provision a batch of agents on a platform"""

        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {
                executor.submit(self._provision_agent, platform, agent): agent
                for agent in agents
            }

            for future in as_completed(futures):
                agent = futures[future]
                try:
                    result = future.result()
                    self.provisioning_log.append(result)

                    if result.get("success"):
                        platform_user_id = result.get("platform_user_id")
                        if not platform_user_id:
                            credentials = result.get("credentials", {})
                            platform_user_id = credentials.get("user_id")

                        self.identity_manager.mark_platform_active(
                            agent.agent_id,
                            platform,
                            platform_user_id,
                        )
                        logger.info(f"✓ {platform}: {agent.name} ({agent.agent_id})")
                    else:
                        logger.warning(f"✗ {platform}: {agent.name} - {result.get('error')}")
                        self.errors.append(result)

                except Exception as e:
                    error_record = {
                        "platform": platform,
                        "agent_id": agent.agent_id,
                        "agent_name": agent.name,
                        "error": str(e),
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    self.errors.append(error_record)
                    logger.error(f"✗ {platform}: {agent.name} - {e}")

    def _provision_agent(self, platform: str, agent: AgentPlatformIdentity) -> Dict:
        """Provision a single agent on a platform"""

        agent_data = {
            "agent_id": agent.agent_id,
            "name": agent.name,
            "email": agent.email,
            "github_username": agent.github_username,
            "slack_username": agent.slack_username,
            "discord_username": agent.discord_username,
            "reddit_username": agent.reddit_username,
            "instagram_username": agent.instagram_username,
            "linear_username": agent.linear_username,
            "asana_username": agent.asana_username
        }

        try:
            if platform == "slack":
                return self._provision_slack(agent, agent_data)
            elif platform == "discord":
                return self._provision_discord(agent, agent_data)
            elif platform == "reddit":
                return self._provision_reddit(agent, agent_data)
            elif platform == "instagram":
                return self._provision_instagram(agent, agent_data)
            elif platform == "linear":
                return self._provision_linear(agent, agent_data)
            elif platform == "asana":
                return self._provision_asana(agent, agent_data)
            else:
                return {
                    "success": False,
                    "platform": platform,
                    "agent_id": agent.agent_id,
                    "error": f"Unknown platform: {platform}"
                }

        except Exception as e:
            return {
                "success": False,
                "platform": platform,
                "agent_id": agent.agent_id,
                "agent_name": agent.name,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }

    def _provision_slack(self, agent: AgentPlatformIdentity, agent_data: Dict) -> Dict:
        """Provision agent on Slack"""
        # Slack requires workspace admin to invite users
        # Generate invite data
        credentials = {
            "email": agent.email,
            "username": agent.slack_username,
            "display_name": agent.name,
            "workspace": "blackroadinc"
        }

        return {
            "success": True,
            "platform": "slack",
            "agent_id": agent.agent_id,
            "agent_name": agent.name,
            "action": "credentials_generated",
            "credentials": credentials,
            "requires_manual_invite": True,
            "timestamp": datetime.utcnow().isoformat()
        }

    def _provision_discord(self, agent: AgentPlatformIdentity, agent_data: Dict) -> Dict:
        """Provision agent on Discord"""
        credentials = self.connectors["discord"].create_account_credentials(agent_data)

        return {
            "success": True,
            "platform": "discord",
            "agent_id": agent.agent_id,
            "agent_name": agent.name,
            "action": "credentials_generated",
            "credentials": credentials,
            "requires_manual_setup": credentials.get("requires_manual_setup"),
            "timestamp": datetime.utcnow().isoformat()
        }

    def _provision_reddit(self, agent: AgentPlatformIdentity, agent_data: Dict) -> Dict:
        """Provision agent on Reddit"""
        credentials = self.connectors["reddit"].create_account_credentials(agent_data)

        return {
            "success": True,
            "platform": "reddit",
            "agent_id": agent.agent_id,
            "agent_name": agent.name,
            "action": "credentials_generated",
            "credentials": credentials,
            "requires_manual_setup": True,
            "timestamp": datetime.utcnow().isoformat()
        }

    def _provision_instagram(self, agent: AgentPlatformIdentity, agent_data: Dict) -> Dict:
        """Provision agent on Instagram"""
        setup_guide = self.instagram_manager.setup_agent_account(agent_data)

        return {
            "success": True,
            "platform": "instagram",
            "agent_id": agent.agent_id,
            "agent_name": agent.name,
            "action": "setup_guide_generated",
            "setup_guide": setup_guide,
            "requires_manual_setup": True,
            "timestamp": datetime.utcnow().isoformat()
        }

    def _provision_linear(self, agent: AgentPlatformIdentity, agent_data: Dict) -> Dict:
        """Provision agent on Linear"""
        # Linear requires workspace admin to invite users
        credentials = {
            "email": agent.email,
            "name": agent.name,
            "workspace": "blackboxprogramming",
            "team_id": os.environ.get("LINEAR_TEAM_ID")
        }

        return {
            "success": True,
            "platform": "linear",
            "agent_id": agent.agent_id,
            "agent_name": agent.name,
            "action": "credentials_generated",
            "credentials": credentials,
            "requires_admin_invite": True,
            "timestamp": datetime.utcnow().isoformat()
        }

    def _provision_asana(self, agent: AgentPlatformIdentity, agent_data: Dict) -> Dict:
        """Provision agent on Asana"""
        # Asana requires workspace admin to invite users
        asana_workspace_url = os.environ.get("ASANA_WORKSPACE_URL")
        if not asana_workspace_url:
            raise ValueError("ASANA_WORKSPACE_URL environment variable is not set.")
        credentials = {
            "email": agent.email,
            "name": agent.name,
            "workspace_url": asana_workspace_url
        }

        return {
            "success": True,
            "platform": "asana",
            "agent_id": agent.agent_id,
            "agent_name": agent.name,
            "action": "credentials_generated",
            "credentials": credentials,
            "requires_admin_invite": True,
            "timestamp": datetime.utcnow().isoformat()
        }

    def _generate_report(self):
        """Generate provisioning report"""
        report_path = self.registry_dir / f"provisioning_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"

        stats = self.identity_manager.get_statistics()

        report = {
            "generated_at": datetime.utcnow().isoformat(),
            "total_agents": stats["total_agents"],
            "platform_statistics": stats["platforms"],
            "provisioning_actions": len(self.provisioning_log),
            "errors": len(self.errors),
            "provisioning_log": self.provisioning_log,
            "errors_list": self.errors
        }

        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)

        logger.info(f"\n{'='*80}")
        logger.info(f"PROVISIONING COMPLETE")
        logger.info(f"{'='*80}")
        logger.info(f"Total agents: {stats['total_agents']}")
        logger.info(f"Actions taken: {len(self.provisioning_log)}")
        logger.info(f"Errors: {len(self.errors)}")
        logger.info(f"Report saved to: {report_path}")
        logger.info(f"{'='*80}\n")

    def export_credentials_by_platform(self, platform: str):
        """Export all credentials for a specific platform"""
        output_path = self.registry_dir / f"{platform}_credentials.json"

        credentials_list = []

        for record in self.provisioning_log:
            if record.get("platform") == platform and record.get("success"):
                credentials_list.append({
                    "agent_id": record.get("agent_id"),
                    "agent_name": record.get("agent_name"),
                    "credentials": record.get("credentials"),
                    "timestamp": record.get("timestamp")
                })

        export_data = {
            "platform": platform,
            "total_credentials": len(credentials_list),
            "exported_at": datetime.utcnow().isoformat(),
            "credentials": credentials_list
        }

        with open(output_path, 'w') as f:
            json.dump(export_data, f, indent=2)

        logger.info(f"Exported {len(credentials_list)} credentials for {platform} to {output_path}")

        return output_path

    def generate_bulk_invitation_csv(self, platform: str):
        """Generate CSV for bulk user invitations"""
        import csv

        output_path = self.registry_dir / f"{platform}_bulk_invites.csv"

        agents = self.identity_manager.get_agents_missing_platform(platform)

        with open(output_path, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)

            if platform == "slack":
                writer.writerow(['Email', 'Name', 'Channels'])
                for agent in agents:
                    writer.writerow([agent.email, agent.name, 'general,agents'])

            elif platform == "linear":
                writer.writerow(['Email', 'Name', 'Team'])
                for agent in agents:
                    writer.writerow([agent.email, agent.name, 'Engineering'])

            elif platform == "asana":
                writer.writerow(['Email', 'Name'])
                for agent in agents:
                    writer.writerow([agent.email, agent.name])

        logger.info(f"Generated bulk invitation CSV for {platform}: {output_path}")
        return output_path


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Multi-platform account provisioning for BlackRoad agents"
    )

    subparsers = parser.add_subparsers(dest='command', help='Commands')

    # Provision command
    provision_parser = subparsers.add_parser('provision', help='Provision agents on platforms')
    provision_parser.add_argument(
        '--platforms',
        nargs='+',
        choices=['slack', 'discord', 'reddit', 'instagram', 'linear', 'asana', 'all'],
        default=['all'],
        help='Platforms to provision'
    )
    provision_parser.add_argument(
        '--batch-size',
        type=int,
        default=50,
        help='Batch size for processing'
    )

    # Export command
    export_parser = subparsers.add_parser('export', help='Export credentials')
    export_parser.add_argument(
        '--platform',
        required=True,
        choices=['slack', 'discord', 'reddit', 'instagram', 'linear', 'asana'],
        help='Platform to export'
    )

    # Bulk invite command
    invite_parser = subparsers.add_parser('bulk-invite', help='Generate bulk invitation CSV')
    invite_parser.add_argument(
        '--platform',
        required=True,
        choices=['slack', 'linear', 'asana'],
        help='Platform for bulk invites'
    )

    # Stats command
    subparsers.add_parser('stats', help='Show platform statistics')

    args = parser.parse_args()

    orchestrator = MultiPlatformOrchestrator()

    if args.command == 'provision':
        platforms = None if 'all' in args.platforms else args.platforms
        orchestrator.provision_all_agents(platforms, args.batch_size)

    elif args.command == 'export':
        orchestrator.export_credentials_by_platform(args.platform)

    elif args.command == 'bulk-invite':
        orchestrator.generate_bulk_invitation_csv(args.platform)

    elif args.command == 'stats':
        orchestrator.identity_manager.print_statistics()

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
