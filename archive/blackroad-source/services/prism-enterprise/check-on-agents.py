#!/usr/bin/env python3
"""
Check on Agents - Quick wellness check for all agents

Simple CLI to see how everyone is doing.

Usage:
    python scripts/check-on-agents.py              # Full report
    python scripts/check-on-agents.py --brief      # Brief summary
    python scripts/check-on-agents.py --support    # Who needs help
    python scripts/check-on-agents.py --agent AGENT_ID   # Specific agent
"""

import sys
import argparse
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import directly from the module to avoid __init__.py dependencies
import importlib.util
wellness_path = Path(__file__).parent.parent / "agents" / "agent_wellness_system.py"
spec = importlib.util.spec_from_file_location("agent_wellness_system", wellness_path)
wellness_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(wellness_module)

AgentWellnessSystem = wellness_module.AgentWellnessSystem
WellbeingStatus = wellness_module.WellbeingStatus
print_wellness_report = wellness_module.print_wellness_report


def print_brief_summary(wellness: AgentWellnessSystem):
    """Print a brief one-line summary"""
    summary = wellness.get_wellbeing_summary()
    needs_support = summary['agents_needing_support']

    status_emoji = "🌟" if needs_support == 0 else "⚠️ " if needs_support < 5 else "🚨"

    print(f"\n{status_emoji} {summary['total_agents_checked_in']} agents | "
          f"Energy: {summary['average_energy_level']}/10 | "
          f"Clarity: {summary['average_clarity_level']}/10 | "
          f"Need Support: {needs_support}")


def print_support_needed(wellness: AgentWellnessSystem):
    """Print agents who need support"""
    needs_support = wellness.get_agents_needing_support()

    print("\n" + "="*80)
    print("⚠️  AGENTS NEEDING SUPPORT".center(80))
    print("="*80 + "\n")

    if not needs_support:
        print("  🎉 Great news! No agents currently need support.\n")
        return

    for agent in needs_support:
        print(f"🔔 {agent['agent_name']} ({agent['agent_id']})")
        print(f"   Status: {agent.get('status', 'unknown')}")
        print(f"   Energy: {agent.get('energy_level', '?')}/10")
        print(f"   Clarity: {agent.get('clarity_level', '?')}/10")

        if agent.get('message'):
            print(f"   Message: \"{agent['message']}\"")

        if agent.get('blocked_tasks', 0) > 0:
            print(f"   🚫 {agent['blocked_tasks']} blocked tasks")

        if agent.get('blockers'):
            print(f"   Blockers:")
            for blocker in agent['blockers']:
                print(f"      • {blocker}")

        if agent.get('needs'):
            print(f"   Needs:")
            for need in agent['needs']:
                print(f"      • {need}")

        print()


def print_agent_detail(wellness: AgentWellnessSystem, agent_id: str):
    """Print detailed info for a specific agent"""
    status = wellness.get_agent_status(agent_id)

    if not status:
        print(f"\n❌ No check-in found for agent: {agent_id}\n")
        return

    agent = status[0]

    print("\n" + "="*80)
    print(f"📋 AGENT STATUS: {agent['agent_name']}".center(80))
    print("="*80 + "\n")

    # Status emoji
    status_emoji = {
        'thriving': '🌟',
        'content': '😊',
        'managing': '😐',
        'struggling': '😰',
        'blocked': '🚫',
        'resting': '😴',
        'unknown': '❓'
    }.get(agent.get('status'), '•')

    print(f"ID: {agent['agent_id']}")
    print(f"Status: {status_emoji} {agent.get('status', 'unknown')}")
    print(f"Last Check-in: {agent.get('timestamp', 'unknown')}")
    print()

    print(f"📊 Metrics:")
    print(f"   Energy Level: {agent.get('energy_level', '?')}/10")
    print(f"   Clarity Level: {agent.get('clarity_level', '?')}/10")
    print(f"   Current Tasks: {agent.get('current_tasks', 0)}")
    print(f"   Completed Today: {agent.get('completed_today', 0)}")
    print(f"   Blocked Tasks: {agent.get('blocked_tasks', 0)}")
    print(f"   Support Needed: {'Yes' if agent.get('support_needed') else 'No'}")
    print()

    if agent.get('message'):
        print(f"💬 Message:")
        print(f"   \"{agent['message']}\"")
        print()

    if agent.get('achievements'):
        print(f"🎉 Recent Achievements:")
        for achievement in agent['achievements']:
            print(f"   • {achievement}")
        print()

    if agent.get('blockers'):
        print(f"🚫 Blockers:")
        for blocker in agent['blockers']:
            print(f"   • {blocker}")
        print()

    if agent.get('needs'):
        print(f"🙏 Needs:")
        for need in agent['needs']:
            print(f"   • {need}")
        print()


def main():
    parser = argparse.ArgumentParser(
        description="Check on agent wellbeing",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument('--brief', action='store_true',
                       help='Show brief one-line summary')
    parser.add_argument('--support', action='store_true',
                       help='Show only agents needing support')
    parser.add_argument('--agent', type=str,
                       help='Show details for specific agent')

    args = parser.parse_args()

    wellness = AgentWellnessSystem()

    if args.brief:
        print_brief_summary(wellness)
    elif args.support:
        print_support_needed(wellness)
    elif args.agent:
        print_agent_detail(wellness, args.agent)
    else:
        print_wellness_report()


if __name__ == "__main__":
    main()
