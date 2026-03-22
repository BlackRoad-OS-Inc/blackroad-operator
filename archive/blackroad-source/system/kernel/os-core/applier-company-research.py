#!/usr/bin/env python3
"""
Company Research Automation

Features:
- Auto-scrape company website
- Glassdoor reviews summary
- Funding/revenue data (Crunchbase-style)
- Culture insights
- Red flag detection
- Interview process insights
- Key people research
"""

import os
import json
import re
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse
import asyncio

try:
    from playwright.async_api import async_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


@dataclass
class CompanyProfile:
    """Complete company profile."""
    name: str
    website: str
    industry: str
    size: str  # e.g., "50-200 employees"
    founded: Optional[str] = None
    location: str = ""

    # Financials
    funding_total: Optional[str] = None
    funding_stage: Optional[str] = None  # Seed, Series A, etc.
    latest_valuation: Optional[str] = None
    revenue_range: Optional[str] = None

    # Culture
    mission: str = ""
    values: List[str] = None
    culture_summary: str = ""
    glassdoor_rating: Optional[float] = None
    glassdoor_reviews_count: Optional[int] = None

    # Reviews analysis
    pros: List[str] = None
    cons: List[str] = None
    red_flags: List[str] = None

    # Interview insights
    interview_difficulty: Optional[str] = None  # Easy, Medium, Hard
    interview_process: List[str] = None
    common_questions: List[str] = None

    # Key people
    ceo_name: Optional[str] = None
    key_people: List[Dict[str, str]] = None

    # Additional
    tech_stack: List[str] = None
    benefits: List[str] = None
    remote_policy: Optional[str] = None

    researched_at: str = ""


class CompanyResearcher:
    """Automated company research."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize researcher."""
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if self.api_key and ANTHROPIC_AVAILABLE:
            self.client = anthropic.Anthropic(api_key=self.api_key)
        else:
            self.client = None

        self.cache_dir = Path.home() / ".applier" / "company_research"
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    async def research_company(
        self,
        company_name: str,
        website: str = None,
        deep_research: bool = True
    ) -> CompanyProfile:
        """
        Research a company comprehensively.

        Args:
            company_name: Company name
            website: Company website URL (optional, will search if not provided)
            deep_research: If True, do detailed scraping and analysis

        Returns:
            CompanyProfile with all gathered information
        """
        print(f"\n🔍 Researching {company_name}...")

        profile = CompanyProfile(
            name=company_name,
            website=website or f"https://www.{company_name.lower().replace(' ', '')}.com",
            industry="",
            size="",
            researched_at=datetime.now().isoformat()
        )

        # Check cache first
        cached = self._load_from_cache(company_name)
        if cached:
            print(f"✅ Loaded from cache (saved {cached['researched_at']})")
            return CompanyProfile(**cached)

        if PLAYWRIGHT_AVAILABLE and deep_research:
            # Scrape company website
            print("🌐 Scraping company website...")
            website_data = await self._scrape_website(profile.website)

            profile.mission = website_data.get("mission", "")
            profile.industry = website_data.get("industry", "")
            profile.location = website_data.get("location", "")

        # Use AI to enhance research
        if self.client:
            print("🤖 Enhancing with AI research...")
            ai_data = self._ai_research(company_name, website or "")

            # Merge AI data
            for key, value in ai_data.items():
                if hasattr(profile, key) and value:
                    setattr(profile, key, value)

        # Save to cache
        self._save_to_cache(company_name, profile)

        return profile

    async def _scrape_website(self, url: str) -> Dict:
        """Scrape company website for information."""
        data = {}

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()

                # Load homepage
                await page.goto(url, wait_until="domcontentloaded", timeout=15000)
                content = await page.content()

                # Extract mission/about
                about_patterns = [
                    r'<h[1-3][^>]*>\s*(?:About|Mission|Who We Are|Our Story)\s*</h[1-3]>(.+?)</(?:p|div)>',
                    r'mission["\']?\s*:\s*["\']([^"\']+)["\']',
                ]

                for pattern in about_patterns:
                    match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
                    if match:
                        mission = re.sub('<[^>]+>', '', match.group(1))
                        mission = re.sub(r'\s+', ' ', mission).strip()
                        data["mission"] = mission[:500]
                        break

                # Try to visit /about or /careers page
                try:
                    about_url = urljoin(url, "/about")
                    await page.goto(about_url, wait_until="domcontentloaded", timeout=10000)
                    about_content = await page.content()

                    # Extract location
                    location_match = re.search(
                        r'(?:located|based|headquarters?)\s+(?:in|at)\s+([A-Z][a-z]+(?:,\s*[A-Z]{2})?)',
                        about_content,
                        re.IGNORECASE
                    )
                    if location_match:
                        data["location"] = location_match.group(1)

                except:
                    pass

                await browser.close()

        except Exception as e:
            print(f"⚠️  Website scraping limited: {e}")

        return data

    def _ai_research(self, company_name: str, website: str) -> Dict:
        """Use AI to research company."""
        if not self.client:
            return {}

        prompt = f"""You are a company research analyst. Research this company and provide a comprehensive profile.

COMPANY: {company_name}
{f"WEBSITE: {website}" if website else ""}

TASK:
Provide detailed information about this company. Use your knowledge up to 2025.

Return as JSON:
{{
  "industry": "Technology / SaaS / etc.",
  "size": "50-200 employees" or "1000+ employees",
  "founded": "2020",
  "location": "San Francisco, CA",
  "funding_total": "$50M",
  "funding_stage": "Series B",
  "latest_valuation": "$200M",
  "revenue_range": "$10M-50M ARR",
  "mission": "Brief mission statement",
  "values": ["value 1", "value 2", "value 3"],
  "culture_summary": "Summary of company culture",
  "glassdoor_rating": 4.2,
  "glassdoor_reviews_count": 150,
  "pros": ["pro 1", "pro 2", "pro 3"],
  "cons": ["con 1", "con 2", "con 3"],
  "red_flags": ["flag 1" if any, or empty list],
  "interview_difficulty": "Medium",
  "interview_process": ["Phone screen", "Technical", "Onsite"],
  "common_questions": ["question 1", "question 2"],
  "ceo_name": "Jane Doe",
  "tech_stack": ["Python", "React", "AWS"],
  "benefits": ["Health insurance", "401k", "Unlimited PTO"],
  "remote_policy": "Fully remote" or "Hybrid" or "In-office"
}}

If you don't have data for a field, use null or empty array. Be accurate and honest.

Return ONLY the JSON."""

        try:
            response = self._call_claude(prompt)
            return json.loads(response)
        except Exception as e:
            print(f"⚠️  AI research limited: {e}")
            return {}

    def generate_research_summary(self, profile: CompanyProfile) -> str:
        """Generate a human-readable summary."""
        if not self.client:
            return self._generate_basic_summary(profile)

        prompt = f"""You are a career advisor. Summarize this company research for a job seeker.

COMPANY PROFILE:
{json.dumps(asdict(profile), indent=2, default=str)}

TASK:
Write a concise, informative summary (3-4 paragraphs) covering:
1. Company overview (what they do, size, stage)
2. Culture and work environment
3. Interview process and difficulty
4. Key considerations (pros, cons, red flags if any)
5. Bottom line recommendation

Be balanced and honest. Help the candidate make an informed decision.

Write the summary now:"""

        try:
            return self._call_claude(prompt)
        except:
            return self._generate_basic_summary(profile)

    def _generate_basic_summary(self, profile: CompanyProfile) -> str:
        """Generate basic summary without AI."""
        lines = [f"# {profile.name}\n"]

        if profile.industry:
            lines.append(f"**Industry:** {profile.industry}")
        if profile.size:
            lines.append(f"**Size:** {profile.size}")
        if profile.location:
            lines.append(f"**Location:** {profile.location}")
        if profile.funding_stage:
            lines.append(f"**Funding:** {profile.funding_stage}")

        lines.append("")

        if profile.mission:
            lines.append(f"**Mission:** {profile.mission}\n")

        if profile.glassdoor_rating:
            lines.append(f"**Glassdoor Rating:** {profile.glassdoor_rating}/5.0 ({profile.glassdoor_reviews_count} reviews)\n")

        if profile.pros:
            lines.append("**Pros:**")
            for pro in profile.pros[:5]:
                lines.append(f"  • {pro}")
            lines.append("")

        if profile.cons:
            lines.append("**Cons:**")
            for con in profile.cons[:5]:
                lines.append(f"  • {con}")
            lines.append("")

        if profile.red_flags:
            lines.append("⚠️  **Red Flags:**")
            for flag in profile.red_flags:
                lines.append(f"  • {flag}")
            lines.append("")

        if profile.interview_process:
            lines.append(f"**Interview Process:** {' → '.join(profile.interview_process)}")
            lines.append(f"**Difficulty:** {profile.interview_difficulty or 'Unknown'}\n")

        if profile.tech_stack:
            lines.append(f"**Tech Stack:** {', '.join(profile.tech_stack[:8])}\n")

        if profile.remote_policy:
            lines.append(f"**Remote Policy:** {profile.remote_policy}\n")

        return "\n".join(lines)

    def _call_claude(self, prompt: str) -> str:
        """Call Claude API."""
        message = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=3000,
            temperature=0.5,
            messages=[{"role": "user", "content": prompt}]
        )

        return message.content[0].text.strip()

    def _load_from_cache(self, company_name: str) -> Optional[Dict]:
        """Load from cache if available and recent."""
        cache_file = self.cache_dir / f"{company_name.lower().replace(' ', '_')}.json"

        if not cache_file.exists():
            return None

        # Check if cache is recent (within 7 days)
        mtime = datetime.fromtimestamp(cache_file.stat().st_mtime)
        age_days = (datetime.now() - mtime).days

        if age_days > 7:
            return None

        with open(cache_file, 'r') as f:
            return json.load(f)

    def _save_to_cache(self, company_name: str, profile: CompanyProfile):
        """Save to cache."""
        cache_file = self.cache_dir / f"{company_name.lower().replace(' ', '_')}.json"

        with open(cache_file, 'w') as f:
            json.dump(asdict(profile), f, indent=2, default=str)


# CLI
async def main():
    """CLI for company research."""
    import argparse

    parser = argparse.ArgumentParser(description="Company Research Tool")
    parser.add_argument("company", help="Company name")
    parser.add_argument("--website", help="Company website URL")
    parser.add_argument("--quick", action="store_true", help="Quick research (no scraping)")
    parser.add_argument("--output", help="Output file for summary")

    args = parser.parse_args()

    researcher = CompanyResearcher()

    try:
        profile = await researcher.research_company(
            company_name=args.company,
            website=args.website,
            deep_research=not args.quick
        )

        # Generate summary
        summary = researcher.generate_research_summary(profile)

        print("\n" + "="*60)
        print(f"📊 COMPANY RESEARCH: {profile.name}")
        print("="*60 + "\n")
        print(summary)
        print("\n" + "="*60 + "\n")

        # Save if requested
        if args.output:
            output_path = Path(args.output).expanduser()
            with open(output_path, 'w') as f:
                f.write(f"# Company Research: {profile.name}\n\n")
                f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
                f.write(summary)
                f.write(f"\n\n---\n\nFull Profile:\n```json\n{json.dumps(asdict(profile), indent=2, default=str)}\n```\n")

            print(f"💾 Saved to: {output_path}\n")

        return 0

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(asyncio.run(main()))
