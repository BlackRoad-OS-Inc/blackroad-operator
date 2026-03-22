#!/usr/bin/env python3
"""
Personal Brand Builder & Portfolio Generator

Features:
- LinkedIn profile optimization with AI
- GitHub profile README generator
- Personal website builder
- Blog post generator (technical writing)
- Twitter/X thread creator
- Portfolio project showcases
- Open source contribution strategy
- Speaking/conference proposals
"""

import os
import json
import re
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


@dataclass
class BrandProfile:
    """Personal brand profile."""
    name: str
    title: str
    expertise_areas: List[str]
    years_experience: int
    top_skills: List[str]
    achievements: List[str]
    values: List[str]
    target_audience: str
    unique_value_prop: str


class BrandBuilder:
    """AI-powered personal brand builder."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize brand builder."""
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if self.api_key and ANTHROPIC_AVAILABLE:
            self.client = anthropic.Anthropic(api_key=self.api_key)
        else:
            self.client = None

        self.output_dir = Path.home() / ".applier" / "brand"
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def optimize_linkedin_profile(self, profile: BrandProfile) -> Dict[str, str]:
        """Generate optimized LinkedIn profile sections."""

        if not self.client:
            return self._generate_linkedin_templates(profile)

        sections = {}

        # Headline
        headline_prompt = f"""You are a LinkedIn profile optimization expert.

PROFILE:
Name: {profile.name}
Title: {profile.title}
Expertise: {', '.join(profile.expertise_areas)}
Experience: {profile.years_experience} years

Create a compelling LinkedIn headline (120 chars max) that:
1. Shows expertise clearly
2. Includes keywords for searchability
3. Shows value proposition
4. Stands out from generic titles

Examples of good headlines:
- "AI/ML Engineer | Building LLM Applications at Scale | Ex-Google | 50K+ Users Impacted"
- "Full-Stack Developer | React & Node.js Expert | Open Source Contributor | Helping Startups Ship Fast"

Write the headline (just the text, no quotes):"""

        sections["headline"] = self._call_claude(headline_prompt)

        # About/Summary
        summary_prompt = f"""Write a compelling LinkedIn About/Summary section.

PROFILE:
{json.dumps(asdict(profile), indent=2)}

Create a summary that:
1. Opens with a strong hook (your unique angle)
2. Tells your professional story
3. Highlights key achievements with metrics
4. Shows personality (not robotic)
5. Includes relevant keywords naturally
6. Ends with a call-to-action
7. 3-5 short paragraphs, ~250 words

Use "I" voice, be authentic, show passion.

Write it now:"""

        sections["summary"] = self._call_claude(summary_prompt)

        # Featured Section Ideas
        featured_prompt = f"""Suggest 5 items for LinkedIn Featured section.

PROFILE:
Expertise: {', '.join(profile.expertise_areas)}
Achievements: {', '.join(profile.achievements[:3])}

Format each as:
- Item type (article/project/post/media)
- Title
- Why it showcases your expertise

Be specific and impressive."""

        sections["featured_ideas"] = self._call_claude(featured_prompt)

        return sections

    def generate_github_readme(self, profile: BrandProfile) -> str:
        """Generate GitHub profile README."""

        if not self.client:
            return self._generate_github_template(profile)

        prompt = f"""You are a developer advocate helping create an impressive GitHub profile README.

PROFILE:
{json.dumps(asdict(profile), indent=2)}

Create a GitHub profile README that:
1. Eye-catching header with name and title
2. Brief intro (2-3 sentences)
3. Tech stack with icons/badges
4. Current focus/learning
5. Top projects showcase
6. Stats (GitHub stats, contribution graph)
7. How to reach them
8. Fun fact or unique hook

Use markdown, emojis, and GitHub-flavored features.
Make it stand out but professional.

Write the complete README.md:"""

        readme = self._call_claude(prompt, max_tokens=2000)
        return readme

    def generate_portfolio_website(self, profile: BrandProfile) -> Dict[str, str]:
        """Generate personal portfolio website content."""

        if not self.client:
            return {}

        pages = {}

        # Homepage
        home_prompt = f"""Write compelling homepage copy for a personal portfolio website.

PROFILE:
{json.dumps(asdict(profile), indent=2)}

Sections needed:
1. Hero section (headline + subheadline)
2. About section (2-3 paragraphs)
3. What I Do (3-4 key services/skills)
4. Why Work With Me (unique value)

Write in second person ("you"), benefits-focused.
Professional but personable tone.

Format as JSON with keys: hero_headline, hero_subheadline, about, services (list), value_prop"""

        pages["homepage"] = self._call_claude(home_prompt)

        # About page
        about_prompt = f"""Write a detailed About page for a personal website.

PROFILE:
{json.dumps(asdict(profile), indent=2)}

Structure:
1. Opening hook (interesting angle)
2. Professional journey (story format)
3. Current focus and passion
4. Outside of work (hobbies/interests)
5. Values and approach to work

4-6 paragraphs, engaging narrative style."""

        pages["about"] = self._call_claude(about_prompt)

        return pages

    def generate_blog_post(
        self,
        topic: str,
        angle: str,
        target_audience: str,
        length: str = "medium"
    ) -> str:
        """Generate technical blog post."""

        if not self.client:
            return f"# {topic}\n\n[Blog post content would be generated here]"

        length_guide = {
            "short": "800-1000 words (quick read)",
            "medium": "1500-2000 words (comprehensive)",
            "long": "2500-3000 words (deep dive)"
        }

        prompt = f"""You are a technical writer creating a blog post.

TOPIC: {topic}
ANGLE: {angle}
AUDIENCE: {target_audience}
LENGTH: {length_guide.get(length, length_guide["medium"])}

Create a complete blog post with:
1. Compelling title (SEO-optimized)
2. Meta description (155 chars)
3. Hook opening paragraph
4. Clear structure with H2/H3 headings
5. Code examples if relevant
6. Practical takeaways
7. Strong conclusion with CTA

Use markdown formatting.
Be authoritative but accessible.
Include specific examples.

Write the complete post:"""

        post = self._call_claude(prompt, max_tokens=4000)
        return post

    def generate_twitter_thread(
        self,
        topic: str,
        key_points: List[str],
        hook_style: str = "surprising"
    ) -> List[str]:
        """Generate viral Twitter/X thread."""

        if not self.client:
            return [f"Tweet about {topic}"]

        prompt = f"""You are a Twitter/X content strategist. Create a viral thread.

TOPIC: {topic}
KEY POINTS TO COVER:
{chr(10).join('- ' + p for p in key_points)}

HOOK STYLE: {hook_style}

Create a 8-12 tweet thread:
1. Hook tweet (surprising/bold/controversial)
2. Context/setup
3. Main content (numbered insights)
4. Examples/stories
5. Conclusion tweet with CTA

Each tweet:
- Max 280 characters
- Standalone but flows together
- Uses line breaks for readability
- Hooks reader to next tweet
- One emoji max per tweet (if fits)

Format as numbered list:
1. [tweet text]
2. [tweet text]
etc."""

        response = self._call_claude(prompt, max_tokens=2000)

        # Parse into individual tweets
        tweets = []
        for line in response.split('\n'):
            if re.match(r'^\d+\.', line):
                tweet = re.sub(r'^\d+\.\s*', '', line).strip()
                if tweet:
                    tweets.append(tweet)

        return tweets

    def generate_conference_proposal(
        self,
        talk_topic: str,
        expertise: List[str],
        conference_audience: str,
        talk_length: int = 30
    ) -> Dict[str, str]:
        """Generate conference talk proposal."""

        if not self.client:
            return {}

        prompt = f"""You are a conference organizer helping create a winning talk proposal.

TALK TOPIC: {talk_topic}
SPEAKER EXPERTISE: {', '.join(expertise)}
CONFERENCE AUDIENCE: {conference_audience}
TALK LENGTH: {talk_length} minutes

Create a complete proposal with:

1. TITLE (compelling, clear value)
2. ABSTRACT (200-300 words)
   - Hook
   - What attendees will learn
   - Why it matters
   - Takeaways
3. OUTLINE (key sections with timing)
4. SPEAKER BIO (100 words, third person)
5. WHY THIS TALK NOW (relevance)

Format as JSON with keys: title, abstract, outline, bio, relevance

Make it compelling - conference organizers get 100s of proposals."""

        response = self._call_claude(prompt, max_tokens=2000)
        return response

    def create_open_source_strategy(
        self,
        your_expertise: List[str],
        time_available: str,
        goals: List[str]
    ) -> Dict[str, any]:
        """Create open source contribution strategy."""

        strategy = {
            "contribution_types": [],
            "target_projects": [],
            "time_commitment": time_available,
            "goals": goals,
            "action_plan": []
        }

        # Recommend contribution types
        strategy["contribution_types"] = [
            "Code contributions",
            "Documentation improvements",
            "Issue triage and support",
            "Writing tutorials",
            "Creating example projects"
        ]

        # Action plan
        strategy["action_plan"] = [
            "Week 1-2: Find 3-5 projects aligned with expertise",
            "Week 3-4: Start with documentation/small issues",
            "Month 2: Submit first PR to each project",
            "Month 3+: Become regular contributor to 1-2 projects",
            "Ongoing: Share learnings via blog/Twitter"
        ]

        return strategy

    def _call_claude(self, prompt: str, max_tokens: int = 2000) -> str:
        """Call Claude API."""
        message = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=max_tokens,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text.strip()

    def _generate_linkedin_templates(self, profile: BrandProfile) -> Dict[str, str]:
        """Generate template LinkedIn content."""
        return {
            "headline": f"{profile.title} | {' | '.join(profile.expertise_areas[:2])} | {profile.years_experience}+ Years Experience",
            "summary": f"I'm a {profile.title} with {profile.years_experience} years of experience in {', '.join(profile.expertise_areas)}.\n\n{profile.unique_value_prop}",
            "featured_ideas": "1. Your best project\n2. Most popular blog post\n3. Speaking engagement\n4. Open source contribution\n5. Certification"
        }

    def _generate_github_template(self, profile: BrandProfile) -> str:
        """Generate template GitHub README."""
        return f"""# 👋 Hi, I'm {profile.name}

## {profile.title}

{profile.unique_value_prop}

### 🛠️ Tech Stack
{', '.join(profile.top_skills)}

### 🔭 Currently Working On
[Your current focus]

### 📫 How to reach me
[Your contact info]
"""


# CLI
def main():
    """CLI for brand builder."""
    print("\n✨ Personal Brand Builder & Portfolio Generator\n")

    # Demo profile
    profile = BrandProfile(
        name="Alexa Amundson",
        title="Senior Software Engineer",
        expertise_areas=["AI/ML", "Full-Stack Development", "System Design"],
        years_experience=5,
        top_skills=["Python", "TypeScript", "React", "ML/AI", "Cloud Architecture"],
        achievements=[
            "Built AI system used by 50K+ users",
            "Reduced API latency by 60%",
            "Open source contributor (1K+ stars)"
        ],
        values=["Innovation", "Quality", "Continuous Learning"],
        target_audience="Startups and tech companies building AI products",
        unique_value_prop="I build AI systems that actually ship and scale in production"
    )

    builder = BrandBuilder()

    print("Generating LinkedIn profile optimization...")
    linkedin = builder.optimize_linkedin_profile(profile)

    print("\n" + "="*60)
    print("LINKEDIN HEADLINE:")
    print("="*60)
    print(linkedin.get("headline", ""))

    print("\n" + "="*60)
    print("LINKEDIN SUMMARY:")
    print("="*60)
    print(linkedin.get("summary", ""))

    print("\n✅ Brand building content generated!")
    print(f"📁 Output directory: {builder.output_dir}")

    return 0


if __name__ == "__main__":
    exit(main())
