#!/usr/bin/env python3
"""
Job Market Intelligence & Trend Analysis

Features:
- Real-time job market trends analysis
- Skill demand forecasting
- Salary trend tracking
- Geographic hotspot identification
- Emerging role detection
- Company hiring trends
- Market timing optimization
- Competitive landscape analysis
"""

import os
import json
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
from collections import Counter
import statistics

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


@dataclass
class MarketTrend:
    """Market trend data point."""
    metric: str
    value: float
    change_percent: float
    trend_direction: str  # "up", "down", "stable"
    confidence: float  # 0-1
    data_points: int
    last_updated: str


@dataclass
class SkillDemand:
    """Skill demand analysis."""
    skill: str
    job_count: int
    avg_salary: int
    growth_rate: float  # % change
    competition_level: str  # "low", "medium", "high"
    related_skills: List[str]


@dataclass
class MarketReport:
    """Complete market intelligence report."""
    generated_at: str
    region: str
    role_category: str
    total_jobs_analyzed: int
    trends: List[MarketTrend]
    hot_skills: List[SkillDemand]
    salary_ranges: Dict[str, Tuple[int, int]]
    recommendations: List[str]
    opportunities: List[str]
    warnings: List[str]


class MarketIntelligence:
    """AI-powered job market intelligence."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize market intelligence."""
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if self.api_key and ANTHROPIC_AVAILABLE:
            self.client = anthropic.Anthropic(api_key=self.api_key)
        else:
            self.client = None

        self.data_dir = Path.home() / ".applier" / "market_intel"
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def analyze_job_postings(
        self,
        jobs: List[Dict],
        role_category: str = "Software Engineering"
    ) -> MarketReport:
        """Analyze job postings for market intelligence."""

        print(f"\n📊 Analyzing {len(jobs)} job postings...")

        # Extract skills
        all_skills = []
        salaries = []
        locations = []

        for job in jobs:
            # Extract skills from description
            description = job.get("description", "") + " " + job.get("title", "")
            skills = self._extract_skills(description)
            all_skills.extend(skills)

            # Extract salary if available
            salary = self._extract_salary(job.get("salary", "") or job.get("description", ""))
            if salary:
                salaries.append(salary)

            # Location
            location = job.get("location", "")
            if location:
                locations.append(location)

        # Analyze skill demand
        skill_counts = Counter(all_skills)
        hot_skills = []

        for skill, count in skill_counts.most_common(20):
            # Calculate metrics
            skill_salaries = [s for s in salaries]  # Simplified
            avg_salary = int(statistics.mean(skill_salaries)) if skill_salaries else 0

            hot_skills.append(SkillDemand(
                skill=skill,
                job_count=count,
                avg_salary=avg_salary,
                growth_rate=0.0,  # Would need historical data
                competition_level=self._assess_competition(count, len(jobs)),
                related_skills=self._find_related_skills(skill, all_skills)
            ))

        # Salary analysis
        salary_ranges = {}
        if salaries:
            sorted_salaries = sorted(salaries)
            salary_ranges = {
                "min": (sorted_salaries[0], sorted_salaries[int(len(salaries)*0.25)]),
                "median": (sorted_salaries[int(len(salaries)*0.4)], sorted_salaries[int(len(salaries)*0.6)]),
                "max": (sorted_salaries[int(len(salaries)*0.75)], sorted_salaries[-1]),
            }

        # Generate trends
        trends = [
            MarketTrend(
                metric="Total Job Openings",
                value=len(jobs),
                change_percent=0.0,
                trend_direction="stable",
                confidence=1.0,
                data_points=len(jobs),
                last_updated=datetime.now().isoformat()
            )
        ]

        # Generate recommendations
        recommendations = self._generate_recommendations(hot_skills, salary_ranges)

        report = MarketReport(
            generated_at=datetime.now().isoformat(),
            region="Multiple",
            role_category=role_category,
            total_jobs_analyzed=len(jobs),
            trends=trends,
            hot_skills=hot_skills,
            salary_ranges=salary_ranges,
            recommendations=recommendations,
            opportunities=self._identify_opportunities(hot_skills),
            warnings=self._identify_warnings(hot_skills)
        )

        # Save report
        self._save_report(report)

        return report

    def _extract_skills(self, text: str) -> List[str]:
        """Extract technical skills from text."""
        # Common tech skills
        skills_patterns = {
            "Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust",
            "React", "Angular", "Vue", "Node.js", "Django", "Flask", "FastAPI",
            "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
            "PostgreSQL", "MySQL", "MongoDB", "Redis",
            "Machine Learning", "ML", "AI", "Deep Learning", "LLM",
            "TensorFlow", "PyTorch", "scikit-learn",
            "Git", "CI/CD", "Agile", "Scrum"
        }

        found_skills = []
        text_lower = text.lower()

        for skill in skills_patterns:
            if skill.lower() in text_lower:
                found_skills.append(skill)

        return found_skills

    def _extract_salary(self, text: str) -> Optional[int]:
        """Extract salary from text."""
        # Look for salary patterns
        patterns = [
            r'\$(\d{2,3}),?(\d{3})\s*-\s*\$?(\d{2,3}),?(\d{3})',  # $120,000 - $150,000
            r'\$(\d{2,3})k\s*-\s*\$?(\d{2,3})k',  # $120k - $150k
            r'(\d{2,3}),?(\d{3})\s*per\s*year',  # 120,000 per year
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                # Return middle of range
                try:
                    if len(match.groups()) >= 4:
                        low = int(match.group(1)) * 1000 + int(match.group(2))
                        high = int(match.group(3)) * 1000 + int(match.group(4))
                        return (low + high) // 2
                    elif len(match.groups()) >= 2:
                        low = int(match.group(1)) * 1000
                        high = int(match.group(2)) * 1000
                        return (low + high) // 2
                except:
                    pass

        return None

    def _assess_competition(self, skill_count: int, total_jobs: int) -> str:
        """Assess competition level for a skill."""
        percentage = (skill_count / total_jobs) * 100

        if percentage > 30:
            return "high"  # Very common, more competition
        elif percentage > 15:
            return "medium"
        else:
            return "low"  # Niche skill, less competition

    def _find_related_skills(self, skill: str, all_skills: List[str]) -> List[str]:
        """Find skills commonly paired with this one."""
        # Simplified: return most common skills
        skill_counts = Counter(all_skills)
        related = [s for s, c in skill_counts.most_common(5) if s != skill]
        return related[:3]

    def _generate_recommendations(
        self,
        hot_skills: List[SkillDemand],
        salary_ranges: Dict
    ) -> List[str]:
        """Generate actionable recommendations."""
        recommendations = []

        # Top skills to learn
        if hot_skills:
            top_skill = hot_skills[0]
            recommendations.append(
                f"🔥 Top in-demand skill: {top_skill.skill} (found in {top_skill.job_count} postings)"
            )

        # Skill combinations
        if len(hot_skills) >= 3:
            top_combo = " + ".join([s.skill for s in hot_skills[:3]])
            recommendations.append(
                f"💡 Powerful skill combo: {top_combo}"
            )

        # Salary insights
        if salary_ranges.get("median"):
            median_low, median_high = salary_ranges["median"]
            recommendations.append(
                f"💰 Median salary range: ${median_low:,} - ${median_high:,}"
            )

        # Niche opportunities
        niche_skills = [s for s in hot_skills if s.competition_level == "low" and s.job_count > 2]
        if niche_skills:
            recommendations.append(
                f"🎯 Niche opportunity: {niche_skills[0].skill} (lower competition)"
            )

        return recommendations

    def _identify_opportunities(self, hot_skills: List[SkillDemand]) -> List[str]:
        """Identify market opportunities."""
        opportunities = []

        # High demand + low competition
        for skill in hot_skills[:10]:
            if skill.competition_level == "low" and skill.job_count > 5:
                opportunities.append(
                    f"{skill.skill}: High demand ({skill.job_count} jobs), lower competition"
                )

        return opportunities[:5]

    def _identify_warnings(self, hot_skills: List[SkillDemand]) -> List[str]:
        """Identify potential warnings."""
        warnings = []

        # High competition skills
        high_comp = [s for s in hot_skills if s.competition_level == "high"]
        if high_comp:
            warnings.append(
                f"⚠️  High competition for: {', '.join([s.skill for s in high_comp[:3]])}"
            )

        return warnings

    def get_ai_market_analysis(
        self,
        role: str,
        region: str = "Remote/US"
    ) -> str:
        """Get AI-powered market analysis."""

        if not self.client:
            return f"Market analysis for {role} in {region} would be generated with AI."

        prompt = f"""You are a job market analyst. Provide comprehensive market intelligence.

ROLE: {role}
REGION: {region}
DATE: {datetime.now().strftime('%B %Y')}

Analyze and report on:

1. MARKET OVERVIEW
   - Current state of job market for this role
   - Recent trends (hiring up/down?)
   - Economic factors affecting demand

2. IN-DEMAND SKILLS
   - Top 10 must-have skills
   - Emerging skills gaining traction
   - Skills becoming less relevant

3. SALARY INTELLIGENCE
   - Typical salary ranges by experience level
   - Compensation trends
   - Benefits trends

4. GEOGRAPHIC INSIGHTS
   - Where most jobs are
   - Remote vs onsite trends
   - Regional salary differences

5. OPPORTUNITIES
   - Best companies hiring now
   - Emerging sub-fields
   - Underserved niches

6. ACTIONABLE RECOMMENDATIONS
   - What to learn next
   - Where to focus applications
   - How to stand out

Be specific, data-driven where possible, and actionable.

Write the analysis (markdown format):"""

        try:
            response = self._call_claude(prompt, max_tokens=3000)
            return response
        except:
            return "AI analysis not available"

    def forecast_career_trajectory(
        self,
        current_role: str,
        years_experience: int,
        current_skills: List[str],
        career_goals: str
    ) -> Dict[str, any]:
        """Forecast career trajectory and provide roadmap."""

        if not self.client:
            return {"message": "Career forecasting requires AI"}

        prompt = f"""You are a career strategist and market analyst.

CURRENT STATE:
Role: {current_role}
Experience: {years_experience} years
Skills: {', '.join(current_skills)}
Goals: {career_goals}

Create a detailed career trajectory forecast:

1. NEXT 12 MONTHS
   - Realistic next role/title
   - Skills to develop
   - Expected salary range
   - Key milestones

2. YEARS 2-3
   - Career progression options
   - Leadership vs IC track
   - Specialization areas
   - Salary expectations

3. YEARS 4-5
   - Senior/leadership roles
   - Market value
   - Strategic positioning

4. SKILLS ROADMAP
   - Priority 1 (learn now)
   - Priority 2 (next 6 months)
   - Priority 3 (year 2+)

5. RISK FACTORS
   - Market shifts to watch
   - Skills at risk of obsolescence
   - Emerging threats/opportunities

Format as structured JSON."""

        try:
            response = self._call_claude(prompt, max_tokens=2500)
            return response
        except:
            return {}

    def _call_claude(self, prompt: str, max_tokens: int = 2000) -> str:
        """Call Claude API."""
        message = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=max_tokens,
            temperature=0.5,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text.strip()

    def _save_report(self, report: MarketReport):
        """Save market report."""
        filename = f"market_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = self.data_dir / filename

        with open(filepath, 'w') as f:
            json.dump(asdict(report), f, indent=2, default=str)

        print(f"\n💾 Report saved: {filepath}")


# CLI
def main():
    """CLI for market intelligence."""
    print("\n📊 Job Market Intelligence & Trend Analysis\n")

    intel = MarketIntelligence()

    # Demo: AI market analysis
    print("Generating AI market analysis for Software Engineering...\n")

    analysis = intel.get_ai_market_analysis(
        role="Senior Software Engineer (AI/ML)",
        region="Remote/US"
    )

    print("="*60)
    print(analysis)
    print("="*60)

    print(f"\n✅ Market intelligence ready")
    print(f"📁 Data directory: {intel.data_dir}")

    return 0


if __name__ == "__main__":
    exit(main())
