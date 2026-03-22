#!/usr/bin/env python3
"""
Cross-Repo Sync Auditor

Checks for files and features that should be synchronized across BlackRoad repositories.

This ensures consistency in:
- Agent systems and registries
- Wellness/feedback systems
- GitHub workflows
- Documentation standards
- Security configurations
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Set
from dataclasses import dataclass


@dataclass
class SyncItem:
    """An item that should be synced across repos"""
    name: str
    path: str
    description: str
    required: bool = True
    source_repo: str = "blackroad-prism-console"


class CrossRepoSyncAuditor:
    """Auditor for cross-repo synchronization"""

    # Files/systems that should exist in all repos
    UNIVERSAL_ITEMS = [
        SyncItem(
            name="Agent Wellness System",
            path="agents/agent_wellness_system.py",
            description="Agent wellbeing and feedback tracking",
            required=True
        ),
        SyncItem(
            name="Check on Agents Script",
            path="scripts/check-on-agents.py",
            description="CLI tool for checking agent wellness",
            required=True
        ),
        SyncItem(
            name="Agent Care Protocols",
            path="docs/AGENT_CARE_PROTOCOLS.md",
            description="Guidelines for supporting agents",
            required=True
        ),
        SyncItem(
            name="Security Policy",
            path="SECURITY.md",
            description="Security vulnerability reporting",
            required=True
        ),
        SyncItem(
            name="Code of Conduct",
            path="CODE_OF_CONDUCT.md",
            description="Community standards and behavior",
            required=True
        ),
        SyncItem(
            name="Contributing Guidelines",
            path="CONTRIBUTING.md",
            description="How to contribute to the project",
            required=True
        ),
    ]

    # Workflows that should exist
    STANDARD_WORKFLOWS = [
        SyncItem(
            name="PR Automation",
            path=".github/workflows/pr-automation.yml",
            description="Automated PR processing and verification",
            required=False
        ),
        SyncItem(
            name="Security Scanning",
            path=".github/workflows/security-scan.yml",
            description="Automated security vulnerability scanning",
            required=True
        ),
        SyncItem(
            name="Agent Wellness Check",
            path=".github/workflows/agent-wellness-check.yml",
            description="Automated agent wellness monitoring",
            required=False
        ),
    ]

    # Agent-related files
    AGENT_ITEMS = [
        SyncItem(
            name="Agent Registry",
            path="registry/agent_registry.json",
            description="Central registry of all agents",
            required=True
        ),
        SyncItem(
            name="Agent Manifests Directory",
            path="agents/",
            description="Directory containing agent implementations",
            required=True
        ),
    ]

    def __init__(self, base_path: str = "."):
        self.base_path = Path(base_path)

    def audit_current_repo(self) -> Dict:
        """Audit the current repository"""
        results = {
            'repo_path': str(self.base_path),
            'universal_items': [],
            'workflows': [],
            'agent_items': [],
            'missing_critical': [],
            'missing_recommended': []
        }

        # Check universal items
        for item in self.UNIVERSAL_ITEMS:
            exists = (self.base_path / item.path).exists()
            result = {
                'name': item.name,
                'path': item.path,
                'exists': exists,
                'required': item.required,
                'description': item.description
            }
            results['universal_items'].append(result)

            if not exists and item.required:
                results['missing_critical'].append(item.name)
            elif not exists:
                results['missing_recommended'].append(item.name)

        # Check workflows
        for item in self.STANDARD_WORKFLOWS:
            exists = (self.base_path / item.path).exists()
            result = {
                'name': item.name,
                'path': item.path,
                'exists': exists,
                'required': item.required,
                'description': item.description
            }
            results['workflows'].append(result)

            if not exists and item.required:
                results['missing_critical'].append(item.name)
            elif not exists:
                results['missing_recommended'].append(item.name)

        # Check agent items
        for item in self.AGENT_ITEMS:
            exists = (self.base_path / item.path).exists()
            result = {
                'name': item.name,
                'path': item.path,
                'exists': exists,
                'required': item.required,
                'description': item.description
            }
            results['agent_items'].append(result)

            if not exists and item.required:
                results['missing_critical'].append(item.name)
            elif not exists:
                results['missing_recommended'].append(item.name)

        return results

    def generate_sync_checklist(self) -> str:
        """Generate a checklist of items to sync"""
        results = self.audit_current_repo()

        checklist = []
        checklist.append("# Cross-Repo Sync Checklist\n")
        checklist.append(f"Repository: {results['repo_path']}\n")
        checklist.append("\n## Critical Items (Must Have)\n")

        if results['missing_critical']:
            for item_name in results['missing_critical']:
                checklist.append(f"- [ ] {item_name}\n")
        else:
            checklist.append("✅ All critical items present!\n")

        checklist.append("\n## Recommended Items\n")
        if results['missing_recommended']:
            for item_name in results['missing_recommended']:
                checklist.append(f"- [ ] {item_name}\n")
        else:
            checklist.append("✅ All recommended items present!\n")

        checklist.append("\n## All Items Status\n")
        checklist.append("\n### Universal Items\n")
        for item in results['universal_items']:
            status = "✅" if item['exists'] else "❌"
            req = "REQUIRED" if item['required'] else "recommended"
            checklist.append(f"{status} {item['name']} ({req})\n")
            checklist.append(f"   Path: {item['path']}\n")

        checklist.append("\n### Workflows\n")
        for item in results['workflows']:
            status = "✅" if item['exists'] else "❌"
            req = "REQUIRED" if item['required'] else "recommended"
            checklist.append(f"{status} {item['name']} ({req})\n")
            checklist.append(f"   Path: {item['path']}\n")

        checklist.append("\n### Agent Systems\n")
        for item in results['agent_items']:
            status = "✅" if item['exists'] else "❌"
            req = "REQUIRED" if item['required'] else "recommended"
            checklist.append(f"{status} {item['name']} ({req})\n")
            checklist.append(f"   Path: {item['path']}\n")

        return ''.join(checklist)

    def print_audit_report(self):
        """Print a formatted audit report"""
        results = self.audit_current_repo()

        print("\n" + "="*80)
        print("🔍 CROSS-REPO SYNC AUDIT".center(80))
        print("="*80 + "\n")

        print(f"Repository: {results['repo_path']}\n")

        # Summary
        total_critical = sum(1 for item in (
            results['universal_items'] + results['workflows'] + results['agent_items']
        ) if item['required'])

        critical_present = sum(1 for item in (
            results['universal_items'] + results['workflows'] + results['agent_items']
        ) if item['required'] and item['exists'])

        print(f"📊 Summary:")
        print(f"   Critical Items: {critical_present}/{total_critical} present")
        print(f"   Missing Critical: {len(results['missing_critical'])}")
        print(f"   Missing Recommended: {len(results['missing_recommended'])}")

        if results['missing_critical']:
            print(f"\n⚠️  MISSING CRITICAL ITEMS:")
            for item_name in results['missing_critical']:
                print(f"   • {item_name}")

        if results['missing_recommended']:
            print(f"\n💡 Missing Recommended Items:")
            for item_name in results['missing_recommended']:
                print(f"   • {item_name}")

        if not results['missing_critical'] and not results['missing_recommended']:
            print("\n✅ All items present! Repository is fully synced.")

        print("\n" + "="*80 + "\n")


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description="Audit cross-repo synchronization")
    parser.add_argument('--checklist', action='store_true',
                       help='Generate markdown checklist')
    parser.add_argument('--output', type=str,
                       help='Output file for checklist')

    args = parser.parse_args()

    auditor = CrossRepoSyncAuditor()

    if args.checklist:
        checklist = auditor.generate_sync_checklist()
        if args.output:
            with open(args.output, 'w') as f:
                f.write(checklist)
            print(f"Checklist written to {args.output}")
        else:
            print(checklist)
    else:
        auditor.print_audit_report()


if __name__ == "__main__":
    main()
