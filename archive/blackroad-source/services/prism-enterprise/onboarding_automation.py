#!/usr/bin/env python3
"""
Platform Onboarding Automation for BlackRoad Agents

Automated onboarding workflows for:
- Email account creation
- Platform account setup
- Invitation management
- Credentials storage
- Access verification
"""

import json
import os
import sys
import logging
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import time

sys.path.insert(0, str(Path(__file__).parent.parent))

from agents.platform_identity_manager import PlatformIdentityManager
from agents.multi_platform_orchestrator import MultiPlatformOrchestrator

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class OnboardingAutomation:
    """Automated onboarding for agent accounts"""

    def __init__(self, registry_dir: str = "./registry"):
        self.registry_dir = Path(registry_dir)
        self.identity_manager = PlatformIdentityManager(registry_dir)
        self.orchestrator = MultiPlatformOrchestrator(registry_dir)

        self.onboarding_queue = []
        self.completed_onboardings = []
        self.failed_onboardings = []

    def create_onboarding_workflow(self, agent_ids: Optional[List[str]] = None,
                                   platforms: Optional[List[str]] = None) -> Dict:
        """
        Create complete onboarding workflow for agents.

        Steps:
        1. Generate email accounts
        2. Create platform credentials
        3. Queue invitation requests
        4. Generate setup documentation
        5. Track completion status
        """

        if agent_ids is None:
            # Get all agents
            agent_ids = list(self.identity_manager.agents.keys())

        if platforms is None:
            platforms = ["slack", "discord", "reddit", "instagram", "linear", "asana"]

        logger.info(f"Creating onboarding workflow for {len(agent_ids)} agents across {len(platforms)} platforms")

        workflow = {
            "workflow_id": f"onboard_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "created_at": datetime.utcnow().isoformat(),
            "total_agents": len(agent_ids),
            "platforms": platforms,
            "steps": [],
            "estimated_duration_minutes": len(agent_ids) * len(platforms) * 0.5
        }

        # Step 1: Email Setup
        workflow["steps"].append({
            "step": 1,
            "name": "Email Account Setup",
            "action": "verify_email_domains",
            "status": "pending"
        })

        # Step 2: Credentials Generation
        workflow["steps"].append({
            "step": 2,
            "name": "Generate Platform Credentials",
            "action": "generate_credentials",
            "status": "pending"
        })

        # Step 3: Platform Provisioning
        workflow["steps"].append({
            "step": 3,
            "name": "Platform Provisioning",
            "action": "provision_accounts",
            "platforms": platforms,
            "status": "pending"
        })

        # Step 4: Invitation Management
        workflow["steps"].append({
            "step": 4,
            "name": "Send Invitations",
            "action": "send_invitations",
            "status": "pending"
        })

        # Step 5: Verification
        workflow["steps"].append({
            "step": 5,
            "name": "Verify Access",
            "action": "verify_access",
            "status": "pending"
        })

        # Step 6: Documentation
        workflow["steps"].append({
            "step": 6,
            "name": "Generate Documentation",
            "action": "generate_docs",
            "status": "pending"
        })

        # Save workflow
        workflow_path = self.registry_dir / f"onboarding_workflow_{workflow['workflow_id']}.json"
        with open(workflow_path, 'w') as f:
            json.dump(workflow, f, indent=2)

        logger.info(f"Onboarding workflow created: {workflow_path}")

        return workflow

    def execute_workflow(self, workflow_id: str):
        """Execute onboarding workflow"""

        workflow_path = self.registry_dir / f"onboarding_workflow_{workflow_id}.json"

        if not workflow_path.exists():
            logger.error(f"Workflow not found: {workflow_id}")
            return

        with open(workflow_path, 'r') as f:
            workflow = json.load(f)

        logger.info(f"Executing workflow: {workflow_id}")
        logger.info(f"Total agents: {workflow['total_agents']}")
        logger.info(f"Platforms: {', '.join(workflow['platforms'])}")

        for step in workflow["steps"]:
            logger.info(f"\nStep {step['step']}: {step['name']}")

            step["status"] = "in_progress"
            step["started_at"] = datetime.utcnow().isoformat()

            try:
                if step["action"] == "verify_email_domains":
                    self._verify_email_domains()

                elif step["action"] == "generate_credentials":
                    self._generate_all_credentials(workflow["platforms"])

                elif step["action"] == "provision_accounts":
                    self.orchestrator.provision_all_agents(workflow["platforms"])

                elif step["action"] == "send_invitations":
                    self._send_platform_invitations(workflow["platforms"])

                elif step["action"] == "verify_access":
                    self._verify_platform_access(workflow["platforms"])

                elif step["action"] == "generate_docs":
                    self._generate_onboarding_docs(workflow_id)

                step["status"] = "completed"
                step["completed_at"] = datetime.utcnow().isoformat()

                logger.info(f"✓ Step {step['step']} completed")

            except Exception as e:
                step["status"] = "failed"
                step["error"] = str(e)
                logger.error(f"✗ Step {step['step']} failed: {e}")

            # Save progress
            with open(workflow_path, 'w') as f:
                json.dump(workflow, f, indent=2)

        logger.info(f"\nWorkflow execution completed: {workflow_id}")

    def _verify_email_domains(self):
        """Verify email domain configuration"""
        logger.info("Verifying email domain configuration...")

        domains_config = Path("./mdm/domains_config.json")

        if not domains_config.exists():
            raise FileNotFoundError(f"Domain configuration not found: {domains_config}")

        with open(domains_config, 'r') as f:
            config = json.load(f)

        total_capacity = config.get("total_capacity", 0)
        total_agents = len(self.identity_manager.agents)

        if total_capacity < total_agents:
            logger.warning(f"Domain capacity ({total_capacity}) less than total agents ({total_agents})")

        for domain in config.get("domains", []):
            logger.info(f"  ✓ {domain['domain']} - Status: {domain['status']}, Limit: {domain['usage_limit']}")

        logger.info(f"Email domains verified. Total capacity: {total_capacity}")

    def _generate_all_credentials(self, platforms: List[str]):
        """Generate credentials for all platforms"""
        logger.info("Generating platform credentials...")

        for platform in platforms:
            logger.info(f"  Generating {platform} credentials...")
            self.orchestrator.export_credentials_by_platform(platform)

        logger.info("Credentials generation completed")

    def _send_platform_invitations(self, platforms: List[str]):
        """Send platform invitations"""
        logger.info("Preparing platform invitations...")

        for platform in platforms:
            if platform in ["slack", "linear", "asana"]:
                csv_path = self.orchestrator.generate_bulk_invitation_csv(platform)
                logger.info(f"  ✓ {platform} bulk invitation CSV: {csv_path}")

        logger.info("Invitation files generated")

    def _verify_platform_access(self, platforms: List[str]):
        """Verify platform access for agents"""
        logger.info("Verifying platform access...")

        stats = self.identity_manager.get_statistics()

        for platform in platforms:
            coverage = stats["platforms"].get(platform, {}).get("coverage_percent", 0)
            logger.info(f"  {platform}: {coverage}% coverage")

        logger.info("Access verification completed")

    def _generate_onboarding_docs(self, workflow_id: str):
        """Generate onboarding documentation"""
        logger.info("Generating onboarding documentation...")

        docs = {
            "workflow_id": workflow_id,
            "generated_at": datetime.utcnow().isoformat(),
            "overview": "BlackRoad Agent Platform Onboarding",
            "sections": []
        }

        # Email Setup
        docs["sections"].append({
            "title": "Email Account Setup",
            "content": "All agents have been assigned email addresses across available domains.",
            "resources": [
                "mdm/domains_config.json",
                "registry/agent_platform_identities_full.json"
            ]
        })

        # Platform Credentials
        docs["sections"].append({
            "title": "Platform Credentials",
            "content": "Platform-specific credentials have been generated for all agents.",
            "resources": [
                "registry/slack_credentials.json",
                "registry/discord_credentials.json",
                "registry/reddit_credentials.json",
                "registry/instagram_credentials.json",
                "registry/linear_credentials.json",
                "registry/asana_credentials.json"
            ]
        })

        # Invitation Instructions
        docs["sections"].append({
            "title": "Platform Invitations",
            "content": "Use the bulk invitation CSVs to invite agents to platforms.",
            "instructions": [
                "1. Slack: Upload slack_bulk_invites.csv to workspace admin panel",
                "2. Linear: Import linear_bulk_invites.csv via team settings",
                "3. Asana: Use asana_bulk_invites.csv for workspace invitations",
                "4. Discord: Use bot invitations or manual account creation",
                "5. Reddit: Manual account creation required (API limitations)",
                "6. Instagram: Manual account creation required (API limitations)"
            ]
        })

        # Next Steps
        docs["sections"].append({
            "title": "Next Steps",
            "content": "Post-onboarding verification and activation.",
            "steps": [
                "1. Verify email deliverability for all domains",
                "2. Test platform access for sample agents",
                "3. Configure webhooks and integrations",
                "4. Set up monitoring and alerting",
                "5. Begin agent activation and assignment"
            ]
        })

        docs_path = self.registry_dir / f"onboarding_docs_{workflow_id}.json"
        with open(docs_path, 'w') as f:
            json.dump(docs, f, indent=2)

        # Also create markdown version
        md_path = self.registry_dir / f"onboarding_docs_{workflow_id}.md"
        with open(md_path, 'w') as f:
            f.write(f"# {docs['overview']}\n\n")
            f.write(f"**Generated:** {docs['generated_at']}  \n")
            f.write(f"**Workflow ID:** {workflow_id}\n\n")

            for section in docs["sections"]:
                f.write(f"## {section['title']}\n\n")
                f.write(f"{section['content']}\n\n")

                if "resources" in section:
                    f.write("**Resources:**\n")
                    for resource in section["resources"]:
                        f.write(f"- `{resource}`\n")
                    f.write("\n")

                if "instructions" in section:
                    f.write("**Instructions:**\n")
                    for instruction in section["instructions"]:
                        f.write(f"{instruction}\n")
                    f.write("\n")

                if "steps" in section:
                    f.write("**Steps:**\n")
                    for step in section["steps"]:
                        f.write(f"{step}\n")
                    f.write("\n")

        logger.info(f"Documentation generated:")
        logger.info(f"  JSON: {docs_path}")
        logger.info(f"  Markdown: {md_path}")


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Platform onboarding automation for BlackRoad agents"
    )

    subparsers = parser.add_subparsers(dest='command')

    # Create workflow
    create_parser = subparsers.add_parser('create', help='Create onboarding workflow')
    create_parser.add_argument(
        '--platforms',
        nargs='+',
        default=['slack', 'discord', 'reddit', 'instagram', 'linear', 'asana'],
        help='Platforms to onboard'
    )

    # Execute workflow
    execute_parser = subparsers.add_parser('execute', help='Execute onboarding workflow')
    execute_parser.add_argument('workflow_id', help='Workflow ID to execute')

    args = parser.parse_args()

    automation = OnboardingAutomation()

    if args.command == 'create':
        workflow = automation.create_onboarding_workflow(platforms=args.platforms)
        print(f"\nWorkflow created: {workflow['workflow_id']}")
        print(f"Agents: {workflow['total_agents']}")
        print(f"Platforms: {', '.join(workflow['platforms'])}")
        print(f"Estimated duration: {workflow['estimated_duration_minutes']} minutes")
        print(f"\nTo execute: python onboarding_automation.py execute {workflow['workflow_id']}")

    elif args.command == 'execute':
        automation.execute_workflow(args.workflow_id)

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
