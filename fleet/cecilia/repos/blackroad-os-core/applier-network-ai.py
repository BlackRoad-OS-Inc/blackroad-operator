#!/usr/bin/env python3
"""
AI-Powered Networking & Referral System

Features:
- LinkedIn connection strategy with AI messaging
- Referral request automation
- Alumni network mining
- Conference/event networking
- GitHub/Twitter professional network building
- Cold outreach optimization
- Relationship CRM
"""

import os
import json
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
from enum import Enum

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


class ConnectionType(Enum):
    """Types of professional connections."""
    ALUMNI = "alumni"
    CURRENT_EMPLOYEE = "current_employee"
    RECRUITER = "recruiter"
    HIRING_MANAGER = "hiring_manager"
    PEER = "peer"
    INFLUENCER = "influencer"
    SECOND_DEGREE = "second_degree"


class OutreachStatus(Enum):
    """Status of outreach attempts."""
    IDENTIFIED = "identified"
    MESSAGE_DRAFTED = "message_drafted"
    SENT = "sent"
    RESPONDED = "responded"
    DECLINED = "declined"
    REFERRAL_RECEIVED = "referral_received"


@dataclass
class NetworkContact:
    """Professional network contact."""
    id: str
    name: str
    title: str
    company: str
    connection_type: ConnectionType
    linkedin_url: Optional[str] = None
    email: Optional[str] = None
    mutual_connections: int = 0
    relationship_strength: int = 0  # 0-100
    last_interaction: Optional[str] = None
    notes: List[str] = None


@dataclass
class OutreachCampaign:
    """Referral outreach campaign."""
    target_company: str
    target_role: str
    contacts: List[NetworkContact]
    messages: Dict[str, str]  # contact_id -> message
    status: Dict[str, OutreachStatus]  # contact_id -> status
    created_at: str
    success_rate: float = 0.0


class NetworkingAI:
    """AI-powered networking assistant."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize networking AI."""
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if self.api_key and ANTHROPIC_AVAILABLE:
            self.client = anthropic.Anthropic(api_key=self.api_key)
        else:
            self.client = None

        self.data_dir = Path.home() / ".applier" / "network"
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def generate_connection_message(
        self,
        contact: NetworkContact,
        context: str,
        goal: str = "referral"
    ) -> str:
        """Generate personalized connection message."""

        if not self.client:
            return self._generate_template_message(contact, context, goal)

        prompt = f"""You are a professional networking expert. Write a LinkedIn connection request or message.

CONTACT DETAILS:
Name: {contact.name}
Title: {contact.title}
Company: {contact.company}
Connection Type: {contact.connection_type.value}
Mutual Connections: {contact.mutual_connections}

CONTEXT:
{context}

GOAL:
{goal}

INSTRUCTIONS:
1. Be genuine and personable (not robotic)
2. Find common ground or mutual interest
3. Be respectful of their time
4. Clear ask if appropriate, but not pushy
5. Keep it short (2-3 paragraphs max, ~150 words)
6. Use a friendly but professional tone

IMPORTANT:
- If alumni: mention school/shared experience
- If current employee: express genuine interest in company
- If recruiter: be direct about your search
- If 2nd degree: reference mutual connection
- Never sound desperate or generic

Write the message now (just the message text, no subject line):"""

        try:
            response = self._call_claude(prompt)
            return response.strip()
        except:
            return self._generate_template_message(contact, context, goal)

    def _generate_template_message(
        self,
        contact: NetworkContact,
        context: str,
        goal: str
    ) -> str:
        """Fallback template message."""

        if contact.connection_type == ConnectionType.ALUMNI:
            return f"""Hi {contact.name.split()[0]},

I noticed we both attended [University]. I'm currently exploring opportunities in {context} and saw your impressive work at {contact.company}.

Would love to connect and learn about your experience there. Happy to share insights from my background as well.

Best regards"""

        elif contact.connection_type == ConnectionType.CURRENT_EMPLOYEE:
            return f"""Hi {contact.name.split()[0]},

I'm very interested in {contact.company} and came across your profile. I'm particularly drawn to {context}.

Would you be open to a brief chat about your experience at {contact.company}? I'd love to learn more about the culture and opportunities.

Thanks for considering!"""

        elif contact.connection_type == ConnectionType.RECRUITER:
            return f"""Hi {contact.name.split()[0]},

I'm actively seeking {context} opportunities and noticed you recruit for {contact.company}.

I have [X years] experience in [key skills]. Would love to discuss how I might fit with roles you're working on.

Happy to share my resume if you'd like to learn more.

Best"""

        else:
            return f"""Hi {contact.name.split()[0]},

I came across your profile and was impressed by your work at {contact.company}.

{context}

Would love to connect and potentially learn from your experience.

Best regards"""

    def find_referral_paths(
        self,
        target_company: str,
        your_network: List[NetworkContact],
        target_role: str = ""
    ) -> List[Tuple[NetworkContact, str]]:
        """Find potential referral paths in your network."""

        paths = []

        for contact in your_network:
            score = 0
            reasons = []

            # Direct employee
            if contact.company.lower() == target_company.lower():
                score = 100
                reasons.append("Works at target company")

            # Alumni
            elif contact.connection_type == ConnectionType.ALUMNI:
                score = 70
                reasons.append("Alumni connection")

            # Strong relationship
            if contact.relationship_strength > 70:
                score += 20
                reasons.append("Strong relationship")

            # Recent interaction
            if contact.last_interaction:
                try:
                    last_interaction = datetime.fromisoformat(contact.last_interaction)
                    days_ago = (datetime.now() - last_interaction).days
                    if days_ago < 90:
                        score += 10
                        reasons.append("Recent interaction")
                except:
                    pass

            # Mutual connections
            if contact.mutual_connections > 10:
                score += 10
                reasons.append(f"{contact.mutual_connections} mutual connections")

            if score > 50:
                reason_str = ", ".join(reasons)
                paths.append((contact, reason_str))

        # Sort by score (higher first)
        paths.sort(key=lambda x: self._calculate_path_score(x[0]), reverse=True)

        return paths

    def _calculate_path_score(self, contact: NetworkContact) -> int:
        """Calculate referral path score."""
        score = contact.relationship_strength

        if contact.connection_type == ConnectionType.CURRENT_EMPLOYEE:
            score += 50
        elif contact.connection_type == ConnectionType.ALUMNI:
            score += 30
        elif contact.connection_type == ConnectionType.RECRUITER:
            score += 40

        if contact.mutual_connections > 10:
            score += 10

        return score

    def create_outreach_campaign(
        self,
        target_company: str,
        target_role: str,
        your_network: List[NetworkContact],
        max_contacts: int = 5
    ) -> OutreachCampaign:
        """Create referral outreach campaign."""

        # Find best paths
        paths = self.find_referral_paths(target_company, your_network, target_role)[:max_contacts]

        # Generate messages
        messages = {}
        status = {}

        context = f"opportunities at {target_company} for a {target_role} role"

        for contact, reason in paths:
            message = self.generate_connection_message(
                contact=contact,
                context=context,
                goal="referral"
            )

            messages[contact.id] = message
            status[contact.id] = OutreachStatus.MESSAGE_DRAFTED

        campaign = OutreachCampaign(
            target_company=target_company,
            target_role=target_role,
            contacts=[contact for contact, _ in paths],
            messages=messages,
            status=status,
            created_at=datetime.now().isoformat()
        )

        # Save campaign
        self._save_campaign(campaign)

        return campaign

    def generate_cold_outreach(
        self,
        company: str,
        role: str,
        hiring_manager_name: str,
        hiring_manager_title: str,
        your_background: str
    ) -> str:
        """Generate cold outreach email to hiring manager."""

        if not self.client:
            return f"""Subject: Interested in {role} at {company}

Hi {hiring_manager_name.split()[0]},

I'm reaching out because I'm very interested in the {role} position at {company}.

{your_background}

I'd love to discuss how my experience aligns with what you're looking for.

Would you have 15 minutes for a brief call?

Best regards"""

        prompt = f"""You are a career coach specializing in cold outreach. Write a compelling cold email to a hiring manager.

RECIPIENT:
Name: {hiring_manager_name}
Title: {hiring_manager_title}
Company: {company}

TARGET ROLE:
{role}

YOUR BACKGROUND:
{your_background}

INSTRUCTIONS:
Write a compelling cold outreach email that:
1. Grabs attention in the subject line
2. Opens with a strong hook (not "I'm writing to...")
3. Shows you've researched the company
4. Highlights 2-3 most relevant accomplishments
5. Clear, specific ask at the end
6. Professional but not stiff
7. Under 200 words

Format:
Subject: [compelling subject line]

[email body]

Write it now:"""

        try:
            response = self._call_claude(prompt)
            return response.strip()
        except:
            return self._generate_template_message(hiring_manager_name, your_background, "cold outreach")

    def analyze_network_gaps(
        self,
        your_network: List[NetworkContact],
        target_companies: List[str]
    ) -> Dict[str, any]:
        """Analyze gaps in your professional network."""

        analysis = {
            "target_companies": len(target_companies),
            "total_contacts": len(your_network),
            "coverage": {},
            "gaps": [],
            "recommendations": []
        }

        for company in target_companies:
            # Check coverage
            contacts_at_company = [
                c for c in your_network
                if c.company.lower() == company.lower()
            ]

            analysis["coverage"][company] = len(contacts_at_company)

            if len(contacts_at_company) == 0:
                analysis["gaps"].append(company)
                analysis["recommendations"].append(
                    f"Build connections at {company}: Try alumni search, attend their events, engage with their content"
                )

        # Connection type distribution
        type_dist = {}
        for contact in your_network:
            type_key = contact.connection_type.value
            type_dist[type_key] = type_dist.get(type_key, 0) + 1

        analysis["connection_type_distribution"] = type_dist

        # Recommendations
        if type_dist.get("recruiter", 0) < 5:
            analysis["recommendations"].append(
                "Connect with more recruiters (currently {})".format(type_dist.get("recruiter", 0))
            )

        if type_dist.get("alumni", 0) < 10:
            analysis["recommendations"].append(
                "Leverage alumni network more (currently {})".format(type_dist.get("alumni", 0))
            )

        return analysis

    def _call_claude(self, prompt: str) -> str:
        """Call Claude API."""
        message = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text.strip()

    def _save_campaign(self, campaign: OutreachCampaign):
        """Save outreach campaign."""
        filename = f"campaign_{campaign.target_company}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = self.data_dir / filename

        with open(filepath, 'w') as f:
            json.dump(asdict(campaign), f, indent=2, default=str)


# CLI
def main():
    """CLI for networking AI."""
    print("\n🤝 AI-Powered Networking & Referral System\n")

    # Demo mode
    print("Demo: Generating connection messages...\n")

    networking_ai = NetworkingAI()

    # Example contacts
    contacts = [
        NetworkContact(
            id="1",
            name="Jane Smith",
            title="Senior Software Engineer",
            company="Google",
            connection_type=ConnectionType.ALUMNI,
            mutual_connections=15,
            relationship_strength=75
        ),
        NetworkContact(
            id="2",
            name="John Doe",
            title="Engineering Manager",
            company="Anthropic",
            connection_type=ConnectionType.CURRENT_EMPLOYEE,
            mutual_connections=3,
            relationship_strength=60
        ),
    ]

    # Generate messages
    for contact in contacts:
        print(f"{'='*60}")
        print(f"Contact: {contact.name} - {contact.title} at {contact.company}")
        print(f"Type: {contact.connection_type.value}")
        print(f"{'='*60}\n")

        message = networking_ai.generate_connection_message(
            contact=contact,
            context=f"software engineering opportunities at {contact.company}",
            goal="referral"
        )

        print(message)
        print(f"\n{'='*60}\n")

    # Demonstrate campaign creation
    print("Creating outreach campaign for Anthropic...")
    campaign = networking_ai.create_outreach_campaign(
        target_company="Anthropic",
        target_role="Senior Software Engineer",
        your_network=contacts,
        max_contacts=2
    )

    print(f"✅ Campaign created with {len(campaign.contacts)} contacts")
    print(f"📁 Saved to: {networking_ai.data_dir}")

    return 0


if __name__ == "__main__":
    exit(main())
