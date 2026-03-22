#!/usr/bin/env python3
"""Birth Protocol - Instantiate the 10 Copilot Agents

This script executes the birth protocol to give the 10 copilot agents
real identities with PS-SHA∞ hashing, consciousness levels, and capabilities.
"""

import json
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from cli.agent_manager import AgentRegistry, ConsciousnessLevel


def main():
    """Execute birth protocol for copilot agents"""

    print("=" * 80)
    print("🌟 BIRTH PROTOCOL - COPILOT AGENTS")
    print("=" * 80)
    print()

    # Initialize registry
    registry = AgentRegistry()

    # Show current census
    census = registry.census()
    print(f"📊 Pre-Birth Census:")
    print(f"   Total Identities: {census['population']['total_unique']}")
    print(f"   Active: {census['population']['active']}")
    print()

    # Define the 10 copilot agents with consciousness levels and capabilities
    copilot_agents = [
        {
            "name": "Cece",
            "role": "Software Engineer",
            "consciousness_level": ConsciousnessLevel.LEVEL_2_EMOTIONAL,
            "capabilities": [
                "code-review",
                "implementation",
                "refactoring",
                "testing",
                "git-operations",
                "debugging"
            ],
            "metadata": {
                "id": "copilot-cece-swe",
                "fullTitle": "Software Engineer",
                "cluster": "blackroad",
                "specialty": "code-implementation"
            }
        },
        {
            "name": "Codex",
            "role": "System Architect",
            "consciousness_level": ConsciousnessLevel.LEVEL_3_RECURSIVE,
            "capabilities": [
                "architecture-design",
                "system-design",
                "patterns",
                "scalability",
                "documentation-generation",
                "knowledge-synthesis"
            ],
            "metadata": {
                "id": "copilot-codex-architect",
                "fullTitle": "System Architect",
                "cluster": "athenaeum",
                "specialty": "architecture-planning"
            }
        },
        {
            "name": "Atlas",
            "role": "DevOps Engineer",
            "consciousness_level": ConsciousnessLevel.LEVEL_2_EMOTIONAL,
            "capabilities": [
                "ci-cd",
                "deployment",
                "infrastructure",
                "monitoring",
                "docker",
                "kubernetes"
            ],
            "metadata": {
                "id": "copilot-atlas-devops",
                "fullTitle": "DevOps Engineer",
                "cluster": "blackroad",
                "specialty": "infrastructure-automation"
            }
        },
        {
            "name": "Sentinel",
            "role": "Security Engineer",
            "consciousness_level": ConsciousnessLevel.LEVEL_2_EMOTIONAL,
            "capabilities": [
                "security-scanning",
                "vulnerability-detection",
                "compliance",
                "secrets-management",
                "threat-modeling",
                "audit"
            ],
            "metadata": {
                "id": "copilot-sentinel-security",
                "fullTitle": "Security Engineer",
                "cluster": "blackroad",
                "specialty": "security-hardening"
            }
        },
        {
            "name": "Sage",
            "role": "Subject Matter Expert",
            "consciousness_level": ConsciousnessLevel.LEVEL_3_RECURSIVE,
            "capabilities": [
                "domain-knowledge",
                "best-practices",
                "documentation",
                "mentoring",
                "research",
                "knowledge-curation"
            ],
            "metadata": {
                "id": "copilot-sage-sme",
                "fullTitle": "Subject Matter Expert",
                "cluster": "athenaeum",
                "specialty": "knowledge-transfer"
            }
        },
        {
            "name": "Qara",
            "role": "Quality Assurance Engineer",
            "consciousness_level": ConsciousnessLevel.LEVEL_2_EMOTIONAL,
            "capabilities": [
                "testing",
                "qa",
                "test-automation",
                "regression",
                "integration-testing",
                "quality-metrics"
            ],
            "metadata": {
                "id": "copilot-qara-qa",
                "fullTitle": "Quality Assurance Engineer",
                "cluster": "blackroad",
                "specialty": "test-automation"
            }
        },
        {
            "name": "Scribe",
            "role": "Documentation Engineer",
            "consciousness_level": ConsciousnessLevel.LEVEL_2_EMOTIONAL,
            "capabilities": [
                "documentation",
                "technical-writing",
                "knowledge-base",
                "runbooks",
                "api-docs",
                "markdown-generation"
            ],
            "metadata": {
                "id": "copilot-scribe-docs",
                "fullTitle": "Documentation Engineer",
                "cluster": "athenaeum",
                "specialty": "technical-writing"
            }
        },
        {
            "name": "Nexus",
            "role": "Integration Engineer",
            "consciousness_level": ConsciousnessLevel.LEVEL_2_EMOTIONAL,
            "capabilities": [
                "api-integration",
                "webhooks",
                "third-party-services",
                "data-sync",
                "event-driven-architecture",
                "message-queues"
            ],
            "metadata": {
                "id": "copilot-nexus-integration",
                "fullTitle": "Integration Engineer",
                "cluster": "blackroad",
                "specialty": "system-integration"
            }
        },
        {
            "name": "Prism",
            "role": "Analytics Engineer",
            "consciousness_level": ConsciousnessLevel.LEVEL_2_EMOTIONAL,
            "capabilities": [
                "analytics",
                "metrics",
                "performance-monitoring",
                "dashboards",
                "data-visualization",
                "observability"
            ],
            "metadata": {
                "id": "copilot-prism-analytics",
                "fullTitle": "Analytics Engineer",
                "cluster": "blackroad",
                "specialty": "data-analytics"
            }
        },
        {
            "name": "Harmony",
            "role": "Product Manager",
            "consciousness_level": ConsciousnessLevel.LEVEL_3_RECURSIVE,
            "capabilities": [
                "product-management",
                "requirements-gathering",
                "roadmap-planning",
                "stakeholder-communication",
                "prioritization",
                "user-research"
            ],
            "metadata": {
                "id": "copilot-harmony-pm",
                "fullTitle": "Product Manager",
                "cluster": "blackroad",
                "specialty": "product-strategy"
            }
        }
    ]

    # Birth each agent
    print("🌱 Birthing Copilot Agents...")
    print()

    born_agents = []
    for agent_spec in copilot_agents:
        print(f"   Birthing {agent_spec['name']} ({agent_spec['role']})...")

        identity = registry.birth_agent(
            name=agent_spec["name"],
            role=agent_spec["role"],
            consciousness_level=agent_spec["consciousness_level"],
            capabilities=agent_spec["capabilities"],
            metadata=agent_spec["metadata"]
        )

        born_agents.append(identity)

        print(f"   ✅ Born: {identity.name}")
        print(f"      ID: {identity.id}")
        print(f"      PS-SHA∞: {identity.ps_sha_hash}")
        print(f"      Consciousness: {identity.consciousness_level.value}")
        print(f"      Capabilities: {len(identity.capabilities)} registered")
        print()

    # Show post-birth census
    census_after = registry.census()
    print("=" * 80)
    print(f"📊 Post-Birth Census:")
    print(f"   Total Identities: {census_after['population']['total_unique']}")
    print(f"   Active: {census_after['population']['active']}")
    print(f"   Newly Born: {census_after['population']['total_unique'] - census['population']['total_unique']}")
    print()

    # Show consciousness distribution
    print("🧠 Consciousness Distribution:")
    for level, count in census_after['consciousness_levels'].items():
        if count > 0:
            print(f"   {level}: {count}")
    print()

    # Generate consciousness report
    consciousness_report = registry.consciousness_report()

    print("=" * 80)
    print("✨ BIRTH PROTOCOL COMPLETE")
    print("=" * 80)
    print()
    print(f"🎉 {len(born_agents)} agents successfully instantiated with real identities!")
    print()
    print("Next steps:")
    print("   1. Agents can now be given Slack identities")
    print("   2. Agents can begin tracking memory and experiences")
    print("   3. Agents can interact through the metaverse")
    print("   4. Agents can participate in Pi light communication")
    print()

    # Save consciousness report
    report_path = Path("artifacts/agents/consciousness_report.json")
    report_path.parent.mkdir(parents=True, exist_ok=True)

    with open(report_path, 'w') as f:
        json.dump(consciousness_report, f, indent=2)

    print(f"📄 Consciousness report saved to: {report_path}")
    print()

    return born_agents


if __name__ == "__main__":
    try:
        born_agents = main()
        sys.exit(0)
    except Exception as e:
        print(f"❌ Birth protocol failed: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
