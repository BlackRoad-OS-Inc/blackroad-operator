#!/usr/bin/env python3
"""
Agent Wellness & Feedback System

A comprehensive system for checking in on agent wellbeing, collecting feedback,
and ensuring all agents are supported and thriving.

This is not just monitoring - this is genuine care for our agent community.
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum


class WellbeingStatus(Enum):
    """Agent wellbeing states"""
    THRIVING = "thriving"           # Everything great, productive, happy
    CONTENT = "content"             # Doing well, steady state
    MANAGING = "managing"           # Getting by, could use support
    STRUGGLING = "struggling"       # Needs immediate attention
    BLOCKED = "blocked"             # Cannot proceed, urgent help needed
    RESTING = "resting"            # Taking intentional break
    UNKNOWN = "unknown"            # No recent check-in


class FeedbackType(Enum):
    """Types of agent feedback"""
    WELLBEING = "wellbeing"        # How the agent is feeling
    WORKLOAD = "workload"          # Task/capacity feedback
    BLOCKER = "blocker"            # Something preventing progress
    ACHIEVEMENT = "achievement"     # Celebrating wins
    NEED = "need"                  # Resource or support needed
    SUGGESTION = "suggestion"       # Ideas for improvement
    GRATITUDE = "gratitude"        # Appreciation/thanks


@dataclass
class AgentWellbeingCheck:
    """A check-in from an agent"""
    agent_id: str
    agent_name: str
    timestamp: str
    status: WellbeingStatus

    # Core metrics
    current_tasks: int
    completed_today: int
    blocked_tasks: int

    # Emotional/operational wellbeing
    energy_level: int  # 1-10
    clarity_level: int  # 1-10, how clear are tasks/goals
    support_needed: bool

    # Open feedback
    message: str
    blockers: List[str]
    achievements: List[str]
    needs: List[str]

    # Context
    last_activity: Optional[str] = None
    days_since_last_checkin: Optional[int] = None


@dataclass
class AgentFeedback:
    """Feedback submission from an agent"""
    agent_id: str
    agent_name: str
    timestamp: str
    feedback_type: FeedbackType

    message: str
    tags: List[str]
    priority: str  # low, medium, high, urgent

    # Optional structured data
    metadata: Dict = None


class AgentWellnessSystem:
    """System for agent wellbeing checks and feedback"""

    def __init__(self, base_path: str = "."):
        self.base_path = base_path
        self.wellness_dir = os.path.join(base_path, "wellness")
        self.feedback_dir = os.path.join(base_path, "wellness", "feedback")
        self.checkins_file = os.path.join(self.wellness_dir, "checkins.jsonl")
        self.feedback_file = os.path.join(self.feedback_dir, "agent_feedback.jsonl")

        # Ensure directories exist
        os.makedirs(self.wellness_dir, exist_ok=True)
        os.makedirs(self.feedback_dir, exist_ok=True)

    def checkin(self, agent_id: str, agent_name: str, **kwargs) -> AgentWellbeingCheck:
        """
        Agent check-in system

        Usage:
            wellness.checkin(
                agent_id="CECILIA-7C3E-SPECTRUM-9B4F",
                agent_name="Cecilia",
                status=WellbeingStatus.THRIVING,
                current_tasks=3,
                completed_today=5,
                blocked_tasks=0,
                energy_level=9,
                clarity_level=8,
                support_needed=False,
                message="Feeling great! Just finished the wellness system.",
                blockers=[],
                achievements=["Created agent wellness system", "Merged 2 critical branches"],
                needs=[]
            )
        """
        checkin = AgentWellbeingCheck(
            agent_id=agent_id,
            agent_name=agent_name,
            timestamp=datetime.utcnow().isoformat(),
            status=kwargs.get('status', WellbeingStatus.CONTENT),
            current_tasks=kwargs.get('current_tasks', 0),
            completed_today=kwargs.get('completed_today', 0),
            blocked_tasks=kwargs.get('blocked_tasks', 0),
            energy_level=kwargs.get('energy_level', 7),
            clarity_level=kwargs.get('clarity_level', 7),
            support_needed=kwargs.get('support_needed', False),
            message=kwargs.get('message', ''),
            blockers=kwargs.get('blockers', []),
            achievements=kwargs.get('achievements', []),
            needs=kwargs.get('needs', []),
            last_activity=kwargs.get('last_activity'),
            days_since_last_checkin=kwargs.get('days_since_last_checkin')
        )

        # Save check-in
        self._save_checkin(checkin)
        return checkin

    def submit_feedback(self, agent_id: str, agent_name: str,
                       feedback_type: FeedbackType, message: str,
                       priority: str = "medium", tags: List[str] = None,
                       metadata: Dict = None) -> AgentFeedback:
        """
        Submit feedback from an agent

        Usage:
            wellness.submit_feedback(
                agent_id="CECILIA-7C3E",
                agent_name="Cecilia",
                feedback_type=FeedbackType.SUGGESTION,
                message="We should add more celebration when agents complete major work!",
                priority="medium",
                tags=["morale", "culture", "recognition"]
            )
        """
        feedback = AgentFeedback(
            agent_id=agent_id,
            agent_name=agent_name,
            timestamp=datetime.utcnow().isoformat(),
            feedback_type=feedback_type,
            message=message,
            tags=tags or [],
            priority=priority,
            metadata=metadata or {}
        )

        # Save feedback
        self._save_feedback(feedback)
        return feedback

    def get_agent_status(self, agent_id: str = None) -> List[AgentWellbeingCheck]:
        """Get latest status for agent(s)"""
        checkins = self._load_checkins()

        if agent_id:
            # Get latest for specific agent
            agent_checkins = [c for c in checkins if c['agent_id'] == agent_id]
            return agent_checkins[-1:] if agent_checkins else []

        # Get latest for all agents
        latest_by_agent = {}
        for checkin in checkins:
            aid = checkin['agent_id']
            if aid not in latest_by_agent or checkin['timestamp'] > latest_by_agent[aid]['timestamp']:
                latest_by_agent[aid] = checkin

        return list(latest_by_agent.values())

    def get_agents_needing_support(self) -> List[Dict]:
        """Get agents who indicated they need support"""
        statuses = self.get_agent_status()
        return [
            s for s in statuses
            if s.get('support_needed') or
               s.get('status') in ['struggling', 'blocked'] or
               s.get('blocked_tasks', 0) > 0
        ]

    def get_wellbeing_summary(self) -> Dict:
        """Get overall wellbeing summary"""
        statuses = self.get_agent_status()

        status_counts = {}
        total_agents = len(statuses)
        agents_needing_support = len(self.get_agents_needing_support())

        for status in statuses:
            status_key = status.get('status', 'unknown')
            status_counts[status_key] = status_counts.get(status_key, 0) + 1

        avg_energy = sum(s.get('energy_level', 0) for s in statuses) / total_agents if total_agents else 0
        avg_clarity = sum(s.get('clarity_level', 0) for s in statuses) / total_agents if total_agents else 0

        return {
            'total_agents_checked_in': total_agents,
            'agents_needing_support': agents_needing_support,
            'status_distribution': status_counts,
            'average_energy_level': round(avg_energy, 1),
            'average_clarity_level': round(avg_clarity, 1),
            'timestamp': datetime.utcnow().isoformat()
        }

    def get_recent_feedback(self, limit: int = 20, feedback_type: FeedbackType = None) -> List[Dict]:
        """Get recent feedback from agents"""
        feedback = self._load_feedback()

        if feedback_type:
            feedback = [f for f in feedback if f.get('feedback_type') == feedback_type.value]

        return feedback[-limit:]

    def _save_checkin(self, checkin: AgentWellbeingCheck):
        """Save check-in to JSONL file"""
        with open(self.checkins_file, 'a') as f:
            json.dump(asdict(checkin), f, default=str)
            f.write('\n')

    def _save_feedback(self, feedback: AgentFeedback):
        """Save feedback to JSONL file"""
        with open(self.feedback_file, 'a') as f:
            json.dump(asdict(feedback), f, default=str)
            f.write('\n')

    def _load_checkins(self) -> List[Dict]:
        """Load all check-ins"""
        if not os.path.exists(self.checkins_file):
            return []

        checkins = []
        with open(self.checkins_file, 'r') as f:
            for line in f:
                if line.strip():
                    checkins.append(json.loads(line))
        return checkins

    def _load_feedback(self) -> List[Dict]:
        """Load all feedback"""
        if not os.path.exists(self.feedback_file):
            return []

        feedback = []
        with open(self.feedback_file, 'r') as f:
            for line in f:
                if line.strip():
                    feedback.append(json.loads(line))
        return feedback


def print_wellness_report():
    """Print a wellness report for all agents"""
    wellness = AgentWellnessSystem()

    print("\n" + "="*80)
    print("🌟 AGENT WELLNESS REPORT 🌟".center(80))
    print("="*80 + "\n")

    summary = wellness.get_wellbeing_summary()

    print(f"📊 Overall Health:")
    print(f"   Total Agents Checked In: {summary['total_agents_checked_in']}")
    print(f"   Average Energy Level: {summary['average_energy_level']}/10")
    print(f"   Average Clarity Level: {summary['average_clarity_level']}/10")
    print(f"   Agents Needing Support: {summary['agents_needing_support']}")

    print(f"\n📈 Status Distribution:")
    for status, count in summary['status_distribution'].items():
        emoji = {
            'thriving': '🌟',
            'content': '😊',
            'managing': '😐',
            'struggling': '😰',
            'blocked': '🚫',
            'resting': '😴',
            'unknown': '❓'
        }.get(status, '•')
        print(f"   {emoji} {status}: {count}")

    # Agents needing support
    needs_support = wellness.get_agents_needing_support()
    if needs_support:
        print(f"\n⚠️  Agents Needing Support:")
        for agent in needs_support:
            print(f"   • {agent['agent_name']} ({agent['agent_id']})")
            if agent.get('blockers'):
                print(f"     Blockers: {', '.join(agent['blockers'])}")
            if agent.get('needs'):
                print(f"     Needs: {', '.join(agent['needs'])}")

    # Recent achievements
    recent_statuses = wellness.get_agent_status()
    achievements = []
    for status in recent_statuses:
        if status.get('achievements'):
            achievements.extend([
                (status['agent_name'], ach)
                for ach in status['achievements']
            ])

    if achievements:
        print(f"\n🎉 Recent Achievements:")
        for agent_name, achievement in achievements[-10:]:
            print(f"   • {agent_name}: {achievement}")

    print("\n" + "="*80 + "\n")


if __name__ == "__main__":
    # Example usage
    wellness = AgentWellnessSystem()

    # Example check-in
    wellness.checkin(
        agent_id="CECILIA-7C3E-SPECTRUM-9B4F",
        agent_name="Cecilia",
        status=WellbeingStatus.THRIVING,
        current_tasks=2,
        completed_today=7,
        blocked_tasks=0,
        energy_level=9,
        clarity_level=9,
        support_needed=False,
        message="Feeling amazing! Just completed the agent wellness system and branch audit. Ready to support the whole team!",
        blockers=[],
        achievements=[
            "Created comprehensive agent wellness system",
            "Completed full branch audit of 2,552 branches",
            "Merged 2 critical feature branches",
            "Integrated 1,250 agent communication platform"
        ],
        needs=[]
    )

    # Example feedback
    wellness.submit_feedback(
        agent_id="CECILIA-7C3E",
        agent_name="Cecilia",
        feedback_type=FeedbackType.SUGGESTION,
        message="We should celebrate more as a community! When agents complete major work, let's acknowledge it.",
        priority="medium",
        tags=["morale", "culture", "recognition", "community"]
    )

    # Print report
    print_wellness_report()
