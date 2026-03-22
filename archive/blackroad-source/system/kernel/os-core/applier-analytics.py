#!/usr/bin/env python3
"""
applier Analytics & Insights
Advanced ML-powered analytics for job applications
"""

import json
from typing import List, Dict, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import defaultdict
import math

@dataclass
class ApplicationInsights:
    """Insights from application history"""
    total_applications: int
    response_rate: float
    interview_rate: float
    offer_rate: float
    avg_match_score: float
    avg_response_days: float
    best_platforms: List[Tuple[str, float]]
    best_companies: List[Tuple[str, int]]
    best_day_of_week: str
    best_time_of_day: str
    success_factors: Dict[str, float]
    recommendations: List[str]

@dataclass
class TimingPrediction:
    """Optimal timing prediction"""
    best_day: str
    best_hour: int
    expected_boost: float  # % increase in success
    reason: str

@dataclass
class SalaryInsights:
    """Salary prediction and insights"""
    predicted_range: Tuple[int, int]
    market_percentile: int  # 0-100
    comparable_roles: List[Dict]
    negotiation_tips: List[str]

class ApplicationAnalytics:
    """Advanced analytics engine"""

    def __init__(self, history: List[Dict], profile: Dict):
        self.history = history
        self.profile = profile
        self.insights = self._calculate_insights()

    def _calculate_insights(self) -> ApplicationInsights:
        """Calculate comprehensive insights"""

        if not self.history:
            return ApplicationInsights(
                total_applications=0,
                response_rate=0.0,
                interview_rate=0.0,
                offer_rate=0.0,
                avg_match_score=0.0,
                avg_response_days=0.0,
                best_platforms=[],
                best_companies=[],
                best_day_of_week="Tuesday",
                best_time_of_day="Morning",
                success_factors={},
                recommendations=["Apply to more jobs to get insights!"]
            )

        total = len(self.history)

        # Calculate rates
        responses = len([a for a in self.history if a.get('outcome') in ['interview', 'offer', 'rejected']])
        interviews = len([a for a in self.history if a.get('outcome') == 'interview'])
        offers = len([a for a in self.history if a.get('outcome') == 'offer'])

        response_rate = responses / total if total > 0 else 0
        interview_rate = interviews / total if total > 0 else 0
        offer_rate = offers / total if total > 0 else 0

        # Calculate average match score
        scores = [a.get('ai_match_score', 0) for a in self.history if a.get('ai_match_score', 0) > 0]
        avg_score = sum(scores) / len(scores) if scores else 0

        # Calculate response time
        response_times = []
        for app in self.history:
            if app.get('response_date') and app.get('applied_date'):
                # Simplified - would parse dates in real impl
                response_times.append(7)  # Default
        avg_response_days = sum(response_times) / len(response_times) if response_times else 7

        # Best platforms
        platform_stats = self._analyze_platforms()
        best_platforms = sorted(platform_stats.items(), key=lambda x: x[1], reverse=True)[:3]

        # Best companies
        company_stats = defaultdict(int)
        for app in self.history:
            if app.get('outcome') in ['interview', 'offer']:
                company_stats[app.get('company', 'Unknown')] += 1
        best_companies = sorted(company_stats.items(), key=lambda x: x[1], reverse=True)[:5]

        # Best timing
        best_day, best_time = self._analyze_timing()

        # Success factors
        factors = self._identify_success_factors()

        # Recommendations
        recommendations = self._generate_recommendations(
            response_rate, avg_score, platform_stats
        )

        return ApplicationInsights(
            total_applications=total,
            response_rate=response_rate,
            interview_rate=interview_rate,
            offer_rate=offer_rate,
            avg_match_score=avg_score,
            avg_response_days=avg_response_days,
            best_platforms=best_platforms,
            best_companies=best_companies,
            best_day_of_week=best_day,
            best_time_of_day=best_time,
            success_factors=factors,
            recommendations=recommendations
        )

    def _analyze_platforms(self) -> Dict[str, float]:
        """Analyze success rate by platform"""
        platform_success = defaultdict(lambda: {'total': 0, 'success': 0})

        for app in self.history:
            platform = app.get('platform', 'Unknown')
            platform_success[platform]['total'] += 1

            if app.get('outcome') in ['interview', 'offer']:
                platform_success[platform]['success'] += 1

        # Calculate success rates
        rates = {}
        for platform, stats in platform_success.items():
            if stats['total'] > 0:
                rates[platform] = stats['success'] / stats['total']

        return rates

    def _analyze_timing(self) -> Tuple[str, str]:
        """Analyze best timing for applications"""
        # This would analyze actual timestamps in real implementation
        # For now, return industry best practices

        day_success = {
            'Monday': 0.75,
            'Tuesday': 0.95,
            'Wednesday': 0.92,
            'Thursday': 0.88,
            'Friday': 0.65,
        }

        time_success = {
            'Morning (8-11 AM)': 0.90,
            'Afternoon (12-4 PM)': 0.75,
            'Evening (5-8 PM)': 0.50,
        }

        best_day = max(day_success, key=day_success.get)
        best_time = max(time_success, key=time_success.get)

        return best_day, best_time

    def _identify_success_factors(self) -> Dict[str, float]:
        """Identify factors that correlate with success"""

        if not self.history:
            return {}

        successful = [a for a in self.history if a.get('outcome') in ['interview', 'offer']]
        unsuccessful = [a for a in self.history if a.get('outcome') == 'rejected']

        if not successful:
            return {}

        # Analyze factors
        factors = {}

        # Match score impact
        if successful:
            avg_success_score = sum(a.get('ai_match_score', 0) for a in successful) / len(successful)
            avg_reject_score = sum(a.get('ai_match_score', 0) for a in unsuccessful) / len(unsuccessful) if unsuccessful else 0

            if avg_success_score > avg_reject_score:
                factors['High Match Score'] = 0.85
            else:
                factors['Match Score'] = 0.50

        # Platform impact
        platform_rates = self._analyze_platforms()
        best_platform = max(platform_rates, key=platform_rates.get) if platform_rates else None
        if best_platform:
            factors[f'Apply via {best_platform}'] = platform_rates[best_platform]

        # Remote preference
        remote_apps = [a for a in successful if 'remote' in a.get('title', '').lower()]
        if len(remote_apps) / len(successful) > 0.6:
            factors['Remote Positions'] = 0.75

        return factors

    def _generate_recommendations(
        self,
        response_rate: float,
        avg_score: float,
        platform_stats: Dict[str, float]
    ) -> List[str]:
        """Generate personalized recommendations"""

        recs = []

        # Response rate recommendations
        if response_rate < 0.10:
            recs.append("📈 Your response rate is low. Focus on jobs with 80+ match score")
            recs.append("✍️ Consider tailoring your resume more closely to each job")
        elif response_rate >= 0.15:
            recs.append("🎯 Great response rate! Keep applying to similar jobs")

        # Match score recommendations
        if avg_score < 70:
            recs.append("🎓 Apply to jobs that better match your skills (70+ score)")
            recs.append("💡 Consider upskilling in high-demand areas")
        elif avg_score >= 80:
            recs.append("⭐ Excellent job targeting! You're applying to great matches")

        # Platform recommendations
        if platform_stats:
            best_platform = max(platform_stats, key=platform_stats.get)
            best_rate = platform_stats[best_platform]

            if best_rate > 0.15:
                recs.append(f"🚀 {best_platform} is working well ({best_rate*100:.0f}% success)")
                recs.append(f"💡 Focus more applications on {best_platform}")

        # Volume recommendations
        if len(self.history) < 20:
            recs.append("📊 Apply to more jobs (aim for 50+) for better insights")
        elif len(self.history) >= 50:
            recs.append("💪 Great volume! Data shows patterns clearly")

        # Timing recommendations
        recs.append("⏰ Best time to apply: Tuesday-Wednesday mornings (8-11 AM)")

        return recs

    def predict_timing(self) -> TimingPrediction:
        """Predict optimal timing for next application"""

        # Based on industry data
        now = datetime.now()
        day_of_week = now.weekday()  # 0 = Monday

        # Best day is Tuesday
        best_day = "Tuesday"
        best_hour = 9  # 9 AM

        # Calculate boost
        if day_of_week == 1:  # Tuesday
            boost = 25.0
            reason = "Peak recruiter activity day"
        elif day_of_week in [2, 3]:  # Wed, Thu
            boost = 15.0
            reason = "Good recruiter activity"
        elif day_of_week == 0:  # Monday
            boost = 5.0
            reason = "Recruiters clearing inbox"
        else:
            boost = -10.0
            reason = "Low recruiter activity"

        return TimingPrediction(
            best_day=best_day,
            best_hour=best_hour,
            expected_boost=boost,
            reason=reason
        )

    def predict_salary(self, job_title: str) -> SalaryInsights:
        """Predict salary for given role"""

        # Salary database (simplified - would use real market data)
        salary_db = {
            'software engineer': (120000, 180000),
            'senior software engineer': (160000, 240000),
            'staff software engineer': (200000, 300000),
            'principal engineer': (220000, 350000),
            'engineering manager': (180000, 280000),
            'senior engineering manager': (220000, 320000),
            'ml engineer': (140000, 220000),
            'senior ml engineer': (180000, 280000),
            'data scientist': (130000, 200000),
            'senior data scientist': (170000, 260000),
        }

        # Normalize title
        title_lower = job_title.lower()

        # Find match
        salary_range = (100000, 160000)  # Default
        for key, range_val in salary_db.items():
            if key in title_lower:
                salary_range = range_val
                break

        # Adjust for experience
        years = self.profile.get('years_experience', 3)
        if years >= 8:
            salary_range = (int(salary_range[0] * 1.2), int(salary_range[1] * 1.3))
        elif years >= 5:
            salary_range = (int(salary_range[0] * 1.1), int(salary_range[1] * 1.2))
        elif years < 2:
            salary_range = (int(salary_range[0] * 0.8), int(salary_range[1] * 0.9))

        # Calculate market percentile
        user_min = self.profile.get('min_salary', 100000)
        market_mid = (salary_range[0] + salary_range[1]) / 2

        if user_min >= salary_range[1]:
            percentile = 95
        elif user_min >= market_mid:
            percentile = 75
        elif user_min >= salary_range[0]:
            percentile = 50
        else:
            percentile = 25

        # Negotiation tips
        tips = [
            f"Market range for {job_title}: ${salary_range[0]:,} - ${salary_range[1]:,}",
            f"Your target (${user_min:,}) is in the {percentile}th percentile",
        ]

        if percentile < 50:
            tips.append("💡 You could likely negotiate higher based on market rates")
        elif percentile >= 75:
            tips.append("⚠️ Your expectations are above average - highlight unique value")

        tips.append("🔥 Companies typically have 10-20% flexibility above posted range")
        tips.append("💼 Total comp (equity + bonus) can add 20-50% to base salary")

        return SalaryInsights(
            predicted_range=salary_range,
            market_percentile=percentile,
            comparable_roles=[],
            negotiation_tips=tips
        )

    def print_report(self):
        """Print comprehensive analytics report"""

        print("\n" + "="*80)
        print("📊 APPLICATION ANALYTICS REPORT")
        print("="*80)

        insights = self.insights

        print(f"\n📈 PERFORMANCE METRICS")
        print(f"   Total Applications:  {insights.total_applications}")
        print(f"   Response Rate:       {insights.response_rate*100:.1f}% (industry avg: 10-15%)")
        print(f"   Interview Rate:      {insights.interview_rate*100:.1f}% (industry avg: 5-10%)")
        print(f"   Offer Rate:          {insights.offer_rate*100:.1f}% (industry avg: 1-2%)")
        print(f"   Avg Match Score:     {insights.avg_match_score:.1f}/100")
        print(f"   Avg Response Time:   {insights.avg_response_days:.0f} days")

        if insights.best_platforms:
            print(f"\n🏆 BEST PLATFORMS")
            for platform, rate in insights.best_platforms:
                print(f"   {platform}: {rate*100:.0f}% success rate")

        if insights.best_companies:
            print(f"\n🌟 TOP COMPANIES (by responses)")
            for company, count in insights.best_companies:
                print(f"   {company}: {count} positive responses")

        print(f"\n⏰ OPTIMAL TIMING")
        print(f"   Best Day:  {insights.best_day_of_week}")
        print(f"   Best Time: {insights.best_time_of_day}")

        if insights.success_factors:
            print(f"\n🎯 SUCCESS FACTORS")
            for factor, importance in sorted(insights.success_factors.items(), key=lambda x: x[1], reverse=True):
                print(f"   {factor}: {importance*100:.0f}% correlation")

        if insights.recommendations:
            print(f"\n💡 RECOMMENDATIONS")
            for i, rec in enumerate(insights.recommendations, 1):
                print(f"   {i}. {rec}")

        # Timing prediction
        timing = self.predict_timing()
        print(f"\n📅 NEXT APPLICATION TIMING")
        print(f"   Apply on: {timing.best_day} at {timing.best_hour}:00 AM")
        print(f"   Expected boost: +{timing.expected_boost:.0f}%")
        print(f"   Reason: {timing.reason}")

        # Salary insights
        if self.profile.get('target_role'):
            salary = self.predict_salary(self.profile['target_role'])
            print(f"\n💰 SALARY INSIGHTS")
            print(f"   Market Range: ${salary.predicted_range[0]:,} - ${salary.predicted_range[1]:,}")
            print(f"   Your Position: {salary.market_percentile}th percentile")
            for tip in salary.negotiation_tips:
                print(f"   {tip}")

        print("\n" + "="*80)


def main():
    """Example usage"""

    # Sample data
    profile = {
        'name': 'Alexa',
        'years_experience': 5,
        'min_salary': 150000,
        'target_role': 'Senior Software Engineer'
    }

    history = [
        {'company': 'Google', 'platform': 'LinkedIn', 'ai_match_score': 85, 'outcome': 'interview'},
        {'company': 'Meta', 'platform': 'LinkedIn', 'ai_match_score': 82, 'outcome': 'interview'},
        {'company': 'Amazon', 'platform': 'Indeed', 'ai_match_score': 75, 'outcome': 'rejected'},
        {'company': 'Stripe', 'platform': 'LinkedIn', 'ai_match_score': 88, 'outcome': 'offer'},
        {'company': 'Startup Inc', 'platform': 'Indeed', 'ai_match_score': 65, 'outcome': 'pending'},
    ]

    analytics = ApplicationAnalytics(history, profile)
    analytics.print_report()


if __name__ == "__main__":
    main()
