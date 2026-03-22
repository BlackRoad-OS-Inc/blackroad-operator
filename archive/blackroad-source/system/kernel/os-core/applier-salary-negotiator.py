#!/usr/bin/env python3
"""
AI Salary Negotiation Assistant

Features:
- Market data analysis (levels.fyi, Glassdoor, Payscale)
- Counter-offer generator with scripts
- Total compensation calculator
- Equity/benefits analyzer
- Negotiation coaching and scripts
- Leverage analysis
"""

import os
import json
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


@dataclass
class SalaryData:
    """Market salary data."""
    job_title: str
    company: str
    location: str
    base_salary_min: int
    base_salary_max: int
    base_salary_median: int
    total_comp_min: int
    total_comp_max: int
    total_comp_median: int
    equity_value: Optional[int] = None
    bonus_percent: Optional[float] = None
    sign_on_bonus: Optional[int] = None
    data_source: str = "estimated"


@dataclass
class OfferDetails:
    """Job offer details."""
    company: str
    job_title: str
    level: str  # e.g., "Senior", "Staff", "L5"
    base_salary: int
    equity_value: Optional[int] = None
    equity_shares: Optional[int] = None
    bonus_percent: Optional[float] = None
    sign_on_bonus: Optional[int] = None
    benefits: List[str] = None
    relocation: Optional[int] = None
    other_perks: List[str] = None


@dataclass
class NegotiationStrategy:
    """Negotiation strategy and scripts."""
    your_ask: int  # Total comp target
    justification: str
    leverage_points: List[str]
    counter_offer_script: str
    response_to_no: str
    minimum_acceptable: int
    ideal_outcome: int


class SalaryNegotiator:
    """AI-powered salary negotiation assistant."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize negotiator."""
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")

        if not ANTHROPIC_AVAILABLE:
            raise ImportError("anthropic package not installed")

        self.client = anthropic.Anthropic(api_key=self.api_key)

        # Market data (simplified - in production, integrate with APIs)
        self.market_data_cache = Path.home() / ".applier" / "salary_data.json"

    def get_market_data(
        self,
        job_title: str,
        company: str = None,
        location: str = "Remote",
        years_experience: int = 5
    ) -> SalaryData:
        """
        Get market salary data.

        In production, this would call:
        - levels.fyi API
        - Glassdoor API
        - Payscale API
        - H1B salary database
        """

        # For now, use AI to estimate based on knowledge
        prompt = f"""You are a compensation analyst. Provide salary data for this role.

JOB DETAILS:
Title: {job_title}
{"Company: " + company if company else ""}
Location: {location}
Years of Experience: {years_experience}

TASK:
Estimate the market compensation for this role. Provide:
- Base salary range (min, max, median)
- Total compensation range (base + equity + bonus)
- Typical equity value
- Bonus percentage
- Sign-on bonus range

Consider:
- Market rates for {location}
- Company tier (FAANG vs startup vs mid-size)
- Experience level
- Current market (2025)

Format as JSON:
{{
  "base_salary_min": 150000,
  "base_salary_max": 220000,
  "base_salary_median": 180000,
  "total_comp_min": 200000,
  "total_comp_max": 350000,
  "total_comp_median": 270000,
  "equity_value": 50000,
  "bonus_percent": 15,
  "sign_on_bonus": 25000
}}

Return ONLY the JSON."""

        response = self._call_claude(prompt)

        try:
            data = json.loads(response)
            return SalaryData(
                job_title=job_title,
                company=company or "Market Average",
                location=location,
                base_salary_min=data["base_salary_min"],
                base_salary_max=data["base_salary_max"],
                base_salary_median=data["base_salary_median"],
                total_comp_min=data["total_comp_min"],
                total_comp_max=data["total_comp_max"],
                total_comp_median=data["total_comp_median"],
                equity_value=data.get("equity_value"),
                bonus_percent=data.get("bonus_percent"),
                sign_on_bonus=data.get("sign_on_bonus"),
                data_source="AI estimate (verify with levels.fyi)"
            )
        except:
            # Fallback to safe defaults
            return SalaryData(
                job_title=job_title,
                company=company or "Unknown",
                location=location,
                base_salary_min=120000,
                base_salary_max=200000,
                base_salary_median=160000,
                total_comp_min=150000,
                total_comp_max=300000,
                total_comp_median=220000,
                data_source="fallback estimate"
            )

    def analyze_offer(
        self,
        offer: OfferDetails,
        market_data: SalaryData,
        your_requirements: Dict[str, any]
    ) -> Dict[str, any]:
        """Analyze an offer against market and your requirements."""

        # Calculate total comp
        total_comp = offer.base_salary
        if offer.equity_value:
            total_comp += offer.equity_value
        if offer.bonus_percent:
            total_comp += int(offer.base_salary * offer.bonus_percent / 100)
        if offer.sign_on_bonus:
            total_comp += offer.sign_on_bonus

        # Calculate percentiles
        base_percentile = self._calculate_percentile(
            offer.base_salary,
            market_data.base_salary_min,
            market_data.base_salary_max
        )

        total_percentile = self._calculate_percentile(
            total_comp,
            market_data.total_comp_min,
            market_data.total_comp_max
        )

        # Determine if competitive
        is_competitive = total_comp >= market_data.total_comp_median

        # Calculate room for negotiation (typically 10-20%)
        negotiation_room = int(offer.base_salary * 0.15)

        analysis = {
            "offer_total_comp": total_comp,
            "market_median": market_data.total_comp_median,
            "difference": total_comp - market_data.total_comp_median,
            "base_percentile": base_percentile,
            "total_percentile": total_percentile,
            "is_competitive": is_competitive,
            "negotiation_room": negotiation_room,
            "recommended_ask": offer.base_salary + negotiation_room,
            "verdict": self._get_verdict(total_percentile)
        }

        return analysis

    def generate_negotiation_strategy(
        self,
        offer: OfferDetails,
        market_data: SalaryData,
        your_background: str,
        your_target: int,
        competing_offers: List[str] = None
    ) -> NegotiationStrategy:
        """Generate personalized negotiation strategy."""

        prompt = f"""You are an expert salary negotiation coach. Create a negotiation strategy.

OFFER DETAILS:
Company: {offer.company}
Title: {offer.job_title}
Level: {offer.level}
Base Salary: ${offer.base_salary:,}
Equity: ${offer.equity_value or 0:,}
Bonus: {offer.bonus_percent or 0}%
Sign-on: ${offer.sign_on_bonus or 0:,}

MARKET DATA:
Base Salary Range: ${market_data.base_salary_min:,} - ${market_data.base_salary_max:,}
Median: ${market_data.base_salary_median:,}
Total Comp Range: ${market_data.total_comp_min:,} - ${market_data.total_comp_max:,}

YOUR BACKGROUND:
{your_background}

YOUR TARGET:
${your_target:,} total compensation

{f"COMPETING OFFERS: {chr(10).join(competing_offers)}" if competing_offers else ""}

TASK:
Create a comprehensive negotiation strategy including:

1. Your ask (specific number)
2. Justification (why you deserve it)
3. Leverage points (what strengthens your position)
4. Counter-offer script (exact words to use)
5. Response if they say no (next steps)
6. Minimum acceptable (walk-away point)
7. Ideal outcome (best case)

Format as JSON:
{{
  "your_ask": 200000,
  "justification": "...",
  "leverage_points": ["point 1", "point 2"],
  "counter_offer_script": "...",
  "response_to_no": "...",
  "minimum_acceptable": 180000,
  "ideal_outcome": 210000
}}

Make the scripts natural, confident, and professional. Focus on value, not demands."""

        response = self._call_claude(prompt)

        try:
            data = json.loads(response)
            return NegotiationStrategy(
                your_ask=data["your_ask"],
                justification=data["justification"],
                leverage_points=data["leverage_points"],
                counter_offer_script=data["counter_offer_script"],
                response_to_no=data["response_to_no"],
                minimum_acceptable=data["minimum_acceptable"],
                ideal_outcome=data["ideal_outcome"]
            )
        except:
            # Fallback
            return NegotiationStrategy(
                your_ask=your_target,
                justification="Based on my experience and market data",
                leverage_points=["Market rates", "Your skills"],
                counter_offer_script="I appreciate the offer. Based on my research and experience, I was hoping for $X.",
                response_to_no="I understand. Could we explore other components like equity or bonus?",
                minimum_acceptable=int(your_target * 0.9),
                ideal_outcome=int(your_target * 1.1)
            )

    def calculate_total_comp(
        self,
        base: int,
        equity_value: int = 0,
        bonus_percent: float = 0,
        sign_on: int = 0,
        years: int = 4  # Typical vesting period
    ) -> Dict[str, int]:
        """Calculate total compensation breakdown."""

        annual_equity = equity_value // years if equity_value else 0
        annual_bonus = int(base * bonus_percent / 100) if bonus_percent else 0

        # Year 1 (includes sign-on)
        year_1 = base + annual_equity + annual_bonus + sign_on

        # Subsequent years
        year_n = base + annual_equity + annual_bonus

        # 4-year total
        total_4_year = base * 4 + equity_value + (annual_bonus * 4) + sign_on

        return {
            "year_1_total": year_1,
            "year_2_4_total": year_n,
            "average_annual": total_4_year // 4,
            "total_4_year": total_4_year,
            "base_annual": base,
            "equity_annual": annual_equity,
            "bonus_annual": annual_bonus
        }

    def _calculate_percentile(self, value: int, min_val: int, max_val: int) -> float:
        """Calculate percentile position."""
        if max_val == min_val:
            return 50.0

        percentile = ((value - min_val) / (max_val - min_val)) * 100
        return max(0, min(100, percentile))

    def _get_verdict(self, percentile: float) -> str:
        """Get verdict on offer quality."""
        if percentile >= 75:
            return "Excellent - top tier offer"
        elif percentile >= 60:
            return "Good - above market average"
        elif percentile >= 40:
            return "Fair - at market rate"
        elif percentile >= 25:
            return "Below average - negotiate up"
        else:
            return "Low - significant negotiation needed"

    def _call_claude(self, prompt: str) -> str:
        """Call Claude API."""
        message = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=3000,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}]
        )

        return message.content[0].text.strip()


# CLI
def main():
    """CLI for salary negotiation."""
    print("\n" + "="*60)
    print("💰 AI SALARY NEGOTIATION ASSISTANT")
    print("="*60 + "\n")

    # Get offer details
    company = input("Company name: ").strip()
    job_title = input("Job title: ").strip()
    level = input("Level (e.g., Senior, L5): ").strip()
    base_salary = int(input("Base salary offered ($): ").strip())

    equity = input("Equity value ($ or shares, press Enter to skip): ").strip()
    equity_value = int(equity) if equity else None

    bonus = input("Bonus percentage (e.g., 15, press Enter to skip): ").strip()
    bonus_percent = float(bonus) if bonus else None

    sign_on = input("Sign-on bonus ($ or Enter to skip): ").strip()
    sign_on_bonus = int(sign_on) if sign_on else None

    your_target = int(input("\nYour total comp target ($): ").strip())

    # Create offer
    offer = OfferDetails(
        company=company,
        job_title=job_title,
        level=level,
        base_salary=base_salary,
        equity_value=equity_value,
        bonus_percent=bonus_percent,
        sign_on_bonus=sign_on_bonus
    )

    # Initialize negotiator
    try:
        negotiator = SalaryNegotiator()
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

    # Get market data
    print("\n📊 Analyzing market data...")
    market_data = negotiator.get_market_data(job_title, company)

    # Analyze offer
    analysis = negotiator.analyze_offer(
        offer=offer,
        market_data=market_data,
        your_requirements={"target": your_target}
    )

    # Print analysis
    print("\n" + "="*60)
    print("📊 OFFER ANALYSIS")
    print("="*60)
    print(f"Your Offer Total Comp: ${analysis['offer_total_comp']:,}")
    print(f"Market Median:         ${analysis['market_median']:,}")
    print(f"Difference:            ${analysis['difference']:,}")
    print(f"Base Percentile:       {analysis['base_percentile']:.1f}%")
    print(f"Total Comp Percentile: {analysis['total_percentile']:.1f}%")
    print(f"\nVerdict: {analysis['verdict']}")
    print(f"Recommended Ask:       ${analysis['recommended_ask']:,}")
    print("="*60 + "\n")

    # Get total comp breakdown
    comp_breakdown = negotiator.calculate_total_comp(
        base=base_salary,
        equity_value=equity_value or 0,
        bonus_percent=bonus_percent or 0,
        sign_on=sign_on_bonus or 0
    )

    print("💵 TOTAL COMPENSATION BREAKDOWN")
    print("─"*60)
    print(f"Year 1 Total:     ${comp_breakdown['year_1_total']:,}")
    print(f"Years 2-4 Total:  ${comp_breakdown['year_2_4_total']:,}")
    print(f"Average Annual:   ${comp_breakdown['average_annual']:,}")
    print(f"4-Year Total:     ${comp_breakdown['total_4_year']:,}")
    print("─"*60 + "\n")

    # Load resume for context
    resume_path = Path.home() / ".applier" / "resume.txt"
    background = ""
    if resume_path.exists():
        with open(resume_path, 'r') as f:
            background = f.read()[:1000]  # First 1000 chars

    # Generate strategy
    print("🎯 Generating negotiation strategy...")
    strategy = negotiator.generate_negotiation_strategy(
        offer=offer,
        market_data=market_data,
        your_background=background,
        your_target=your_target
    )

    print("\n" + "="*60)
    print("🎯 NEGOTIATION STRATEGY")
    print("="*60)
    print(f"\nYOUR ASK: ${strategy.your_ask:,}")
    print(f"\nJUSTIFICATION:\n{strategy.justification}")
    print(f"\nLEVERAGE POINTS:")
    for point in strategy.leverage_points:
        print(f"  • {point}")
    print(f"\n📝 COUNTER-OFFER SCRIPT:")
    print("─"*60)
    print(strategy.counter_offer_script)
    print("─"*60)
    print(f"\n🔄 IF THEY SAY NO:")
    print("─"*60)
    print(strategy.response_to_no)
    print("─"*60)
    print(f"\n💡 MINIMUM ACCEPTABLE: ${strategy.minimum_acceptable:,}")
    print(f"🎯 IDEAL OUTCOME: ${strategy.ideal_outcome:,}")
    print("="*60 + "\n")

    # Save analysis
    output_file = Path.home() / ".applier" / f"negotiation_{company}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    output_file.parent.mkdir(exist_ok=True)

    with open(output_file, 'w') as f:
        json.dump({
            "offer": asdict(offer),
            "market_data": asdict(market_data),
            "analysis": analysis,
            "strategy": asdict(strategy),
            "comp_breakdown": comp_breakdown
        }, f, indent=2)

    print(f"💾 Analysis saved: {output_file}\n")

    return 0


if __name__ == "__main__":
    exit(main())
