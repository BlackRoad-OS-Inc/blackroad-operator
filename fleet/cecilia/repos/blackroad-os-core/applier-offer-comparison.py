#!/usr/bin/env python3
"""
Job Offer Comparison & Decision Tool

Features:
- Compare multiple job offers side-by-side
- Calculate total compensation
- Equity valuation (RSUs, stock options)
- Benefits comparison (401k, health, PTO)
- Cost of living adjustments
- Career growth analysis
- Work-life balance scoring
- AI-powered recommendation
"""

import json
import os
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict, field
from datetime import datetime
from pathlib import Path

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


@dataclass
class EquityPackage:
    """Equity compensation."""
    rsu_value: int = 0  # Annual RSU value
    stock_options: int = 0  # Number of options
    strike_price: float = 0.0
    current_stock_price: float = 0.0
    vesting_schedule: str = "4 years, 25% per year"
    
    def calculate_value(self) -> int:
        """Calculate total equity value."""
        rsu = self.rsu_value
        options_value = max(0, (self.current_stock_price - self.strike_price) * self.stock_options)
        return int(rsu + options_value)


@dataclass
class Benefits:
    """Benefits package."""
    health_insurance: bool = True
    dental: bool = True
    vision: bool = True
    
    pto_days: int = 20
    sick_days: int = 10
    holidays: int = 10
    
    retirement_401k_match: float = 0.0  # % match
    retirement_401k_max: int = 0  # Max $ match
    
    signing_bonus: int = 0
    relocation: int = 0
    
    learning_budget: int = 0  # Annual
    gym_membership: bool = False
    meals: bool = False
    commuter_benefits: int = 0  # Monthly
    
    remote_allowed: bool = True
    remote_frequency: str = "Full-time"  # Full-time, Hybrid, Occasional
    
    def calculate_value(self) -> int:
        """Calculate annual benefits value."""
        total = 0
        
        # Health insurance (rough estimate)
        if self.health_insurance:
            total += 6000  # ~$500/month
        if self.dental:
            total += 500
        if self.vision:
            total += 300
        
        # 401k match
        total += self.retirement_401k_max
        
        # One-time bonuses (amortized over 4 years)
        total += (self.signing_bonus + self.relocation) // 4
        
        # Learning & perks
        total += self.learning_budget
        if self.gym_membership:
            total += 600
        if self.meals:
            total += 2000  # ~$8/day
        total += self.commuter_benefits * 12
        
        return total


@dataclass
class JobOffer:
    """Complete job offer."""
    id: str
    company: str
    job_title: str
    level: str  # Junior, Mid, Senior, Staff, Principal
    
    # Compensation
    base_salary: int
    bonus_target: float = 0.0  # % of base
    equity: EquityPackage = field(default_factory=EquityPackage)
    benefits: Benefits = field(default_factory=Benefits)
    
    # Location
    location: str = "Remote"
    city: str = ""
    state: str = ""
    cost_of_living_index: float = 100.0  # 100 = national average
    
    # Work environment
    team_size: int = 0
    manager_quality: int = 8  # 0-10 scale
    culture_fit: int = 8  # 0-10 scale
    work_life_balance: int = 7  # 0-10 scale
    
    # Career growth
    growth_opportunity: int = 7  # 0-10 scale
    learning_opportunity: int = 7  # 0-10 scale
    promotion_timeline: str = "12-18 months"
    
    # Other
    company_stage: str = "Series B"  # Startup, Series A/B/C, Public
    company_trajectory: str = "Growing"  # Growing, Stable, Declining
    
    # Metadata
    received_date: str = ""
    deadline: str = ""
    notes: str = ""
    
    def calculate_total_comp(self) -> int:
        """Calculate total annual compensation."""
        base = self.base_salary
        bonus = int(self.base_salary * (self.bonus_target / 100))
        equity_annual = self.equity.calculate_value()
        benefits_value = self.benefits.calculate_value()
        
        return base + bonus + equity_annual + benefits_value
    
    def calculate_adjusted_comp(self) -> int:
        """Calculate cost-of-living adjusted compensation."""
        total = self.calculate_total_comp()
        # Adjust for cost of living
        adjusted = total * (100 / self.cost_of_living_index)
        return int(adjusted)


class OfferComparison:
    """Compare multiple job offers."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize offer comparison."""
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if self.api_key and ANTHROPIC_AVAILABLE:
            self.client = anthropic.Anthropic(api_key=self.api_key)
        else:
            self.client = None
        
        self.data_dir = Path.home() / ".applier" / "offers"
        self.data_dir.mkdir(parents=True, exist_ok=True)
    
    def compare_offers(self, offers: List[JobOffer]) -> Dict:
        """Compare multiple offers."""
        
        print(f"\n📊 Comparing {len(offers)} job offers\n")
        print(f"{'='*80}\n")
        
        # Calculate metrics for each offer
        comparison = {
            "offers": [],
            "winner": None,
            "recommendation": "",
            "factors": {}
        }
        
        for offer in offers:
            metrics = {
                "company": offer.company,
                "title": offer.job_title,
                "level": offer.level,
                "total_comp": offer.calculate_total_comp(),
                "adjusted_comp": offer.calculate_adjusted_comp(),
                "base_salary": offer.base_salary,
                "equity_value": offer.equity.calculate_value(),
                "benefits_value": offer.benefits.calculate_value(),
                "wlb_score": offer.work_life_balance,
                "growth_score": offer.growth_opportunity,
                "culture_score": offer.culture_fit,
                "overall_score": self._calculate_overall_score(offer)
            }
            comparison["offers"].append(metrics)
        
        # Find winner
        sorted_by_score = sorted(comparison["offers"], key=lambda x: x["overall_score"], reverse=True)
        comparison["winner"] = sorted_by_score[0]["company"]
        
        # Print comparison table
        self._print_comparison_table(comparison["offers"])
        
        # AI recommendation
        if self.client:
            comparison["recommendation"] = self._get_ai_recommendation(offers)
            print(f"\n🤖 AI RECOMMENDATION:\n")
            print(comparison["recommendation"])
        
        # Save comparison
        self._save_comparison(comparison, offers)
        
        return comparison
    
    def _calculate_overall_score(self, offer: JobOffer) -> float:
        """Calculate overall offer score (0-100)."""
        # Weights for different factors
        weights = {
            "compensation": 0.40,
            "growth": 0.20,
            "work_life_balance": 0.15,
            "culture": 0.15,
            "company_trajectory": 0.10
        }
        
        # Normalize compensation to 0-10 scale
        # Assume $250k is 10/10, $50k is 0/10
        comp_score = min(10, (offer.calculate_total_comp() - 50000) / 20000)
        
        # Company trajectory score
        trajectory_scores = {"Growing": 10, "Stable": 7, "Declining": 4}
        trajectory_score = trajectory_scores.get(offer.company_trajectory, 7)
        
        # Calculate weighted score
        score = (
            (comp_score * weights["compensation"]) +
            (offer.growth_opportunity * weights["growth"]) +
            (offer.work_life_balance * weights["work_life_balance"]) +
            (offer.culture_fit * weights["culture"]) +
            (trajectory_score * weights["company_trajectory"])
        ) * 10  # Scale to 0-100
        
        return round(score, 1)
    
    def _print_comparison_table(self, offers_metrics: List[Dict]):
        """Print comparison table."""
        # Header
        print(f"{'Metric':<25}", end="")
        for offer in offers_metrics:
            print(f"{offer['company'][:15]:>18}", end="")
        print()
        print("=" * (25 + 18 * len(offers_metrics)))
        
        # Rows
        rows = [
            ("Title", "title"),
            ("Level", "level"),
            ("", ""),
            ("Base Salary", "base_salary", "${:,}"),
            ("Equity (annual)", "equity_value", "${:,}"),
            ("Benefits Value", "benefits_value", "${:,}"),
            ("Total Comp", "total_comp", "${:,}"),
            ("Adjusted Comp", "adjusted_comp", "${:,}"),
            ("", ""),
            ("Work-Life Balance", "wlb_score", "{}/10"),
            ("Growth Opportunity", "growth_score", "{}/10"),
            ("Culture Fit", "culture_score", "{}/10"),
            ("", ""),
            ("Overall Score", "overall_score", "{}/100"),
        ]
        
        for label, key, *fmt in rows:
            if not label:
                print()
                continue
            
            format_str = fmt[0] if fmt else "{}"
            print(f"{label:<25}", end="")
            for offer in offers_metrics:
                value = offer.get(key, "")
                if value:
                    print(f"{format_str.format(value):>18}", end="")
                else:
                    print(f"{'':>18}", end="")
            print()
        
        print("=" * (25 + 18 * len(offers_metrics)))
    
    def _get_ai_recommendation(self, offers: List[JobOffer]) -> str:
        """Get AI-powered recommendation."""
        
        offers_summary = "\n\n".join([
            f"""OFFER {i+1}: {offer.company}
Title: {offer.job_title} ({offer.level})
Total Comp: ${offer.calculate_total_comp():,}
Base: ${offer.base_salary:,}
Equity: ${offer.equity.calculate_value():,}/year
Location: {offer.location}
Work-Life Balance: {offer.work_life_balance}/10
Growth Opportunity: {offer.growth_opportunity}/10
Culture Fit: {offer.culture_fit}/10
Company Stage: {offer.company_stage} - {offer.company_trajectory}
Notes: {offer.notes}"""
            for i, offer in enumerate(offers)
        ])
        
        prompt = f"""You are a career advisor helping someone choose between job offers.

OFFERS:

{offers_summary}

Analyze these offers and provide:

1. SUMMARY
   - Quick overview of each offer's strengths/weaknesses

2. RECOMMENDATION
   - Which offer to choose and why
   - Consider: compensation, career growth, work-life balance, company trajectory
   - Think long-term (3-5 years)

3. KEY CONSIDERATIONS
   - Important trade-offs
   - Potential risks
   - Questions to ask before accepting

4. NEGOTIATION TIPS
   - What to negotiate on the recommended offer
   - Realistic targets

Be direct and actionable. Format with markdown."""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2000,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text.strip()
        except:
            return "AI recommendation not available"
    
    def _save_comparison(self, comparison: Dict, offers: List[JobOffer]):
        """Save comparison to file."""
        filename = f"offer_comparison_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = self.data_dir / filename
        
        data = {
            "comparison": comparison,
            "offers": [asdict(o) for o in offers]
        }
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        print(f"\n💾 Comparison saved: {filepath}")


# CLI
def main():
    """CLI for offer comparison."""
    
    # Demo offers
    offer1 = JobOffer(
        id="1",
        company="Google",
        job_title="Senior Software Engineer",
        level="L5",
        base_salary=180000,
        bonus_target=15,
        equity=EquityPackage(
            rsu_value=100000,
            vesting_schedule="4 years, 25% per year"
        ),
        benefits=Benefits(
            pto_days=20,
            retirement_401k_match=50,
            retirement_401k_max=9000,
            signing_bonus=50000,
            learning_budget=3000,
            meals=True,
            remote_allowed=True,
            remote_frequency="Hybrid"
        ),
        location="Mountain View, CA",
        city="Mountain View",
        state="CA",
        cost_of_living_index=190,
        team_size=8,
        manager_quality=9,
        culture_fit=8,
        work_life_balance=7,
        growth_opportunity=9,
        learning_opportunity=10,
        company_stage="Public",
        company_trajectory="Stable",
        notes="FAANG prestige, great learning, but high cost of living"
    )
    
    offer2 = JobOffer(
        id="2",
        company="Anthropic",
        job_title="Senior Software Engineer",
        level="Senior",
        base_salary=200000,
        bonus_target=10,
        equity=EquityPackage(
            stock_options=50000,
            strike_price=5.0,
            current_stock_price=20.0,
            vesting_schedule="4 years, 25% per year"
        ),
        benefits=Benefits(
            pto_days=25,
            retirement_401k_match=50,
            retirement_401k_max=10000,
            signing_bonus=75000,
            learning_budget=5000,
            remote_allowed=True,
            remote_frequency="Full-time"
        ),
        location="Remote",
        city="San Francisco",
        state="CA",
        cost_of_living_index=100,  # Remote, so national average
        team_size=6,
        manager_quality=10,
        culture_fit=10,
        work_life_balance=8,
        growth_opportunity=10,
        learning_opportunity=10,
        company_stage="Series C",
        company_trajectory="Growing",
        notes="Cutting-edge AI, amazing team, high equity upside"
    )
    
    offer3 = JobOffer(
        id="3",
        company="Local Startup",
        job_title="Senior Software Engineer",
        level="Senior",
        base_salary=160000,
        bonus_target=10,
        equity=EquityPackage(
            stock_options=100000,
            strike_price=0.50,
            current_stock_price=0.50,
            vesting_schedule="4 years, 25% per year"
        ),
        benefits=Benefits(
            pto_days=15,
            retirement_401k_match=50,
            retirement_401k_max=5000,
            signing_bonus=20000,
            learning_budget=1000,
            remote_allowed=True,
            remote_frequency="Hybrid"
        ),
        location="Austin, TX",
        city="Austin",
        state="TX",
        cost_of_living_index=95,
        team_size=4,
        manager_quality=7,
        culture_fit=9,
        work_life_balance=9,
        growth_opportunity=8,
        learning_opportunity=7,
        company_stage="Series A",
        company_trajectory="Growing",
        notes="High risk/high reward, great WLB, early employee"
    )
    
    # Compare
    comparer = OfferComparison()
    comparison = comparer.compare_offers([offer1, offer2, offer3])
    
    print(f"\n🏆 WINNER: {comparison['winner']}")
    
    return 0


if __name__ == "__main__":
    exit(main())
