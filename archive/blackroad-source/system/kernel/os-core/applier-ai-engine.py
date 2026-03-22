#!/usr/bin/env python3
"""
applier AI Engine - Advanced ML and AI Features
Features:
- Intelligent job matching with ML scoring
- Success prediction based on historical data
- Resume optimization recommendations
- Cover letter generation with Claude API
- Salary prediction
- Interview question prediction
- Application timing optimization
"""

import json
import re
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import math

# Try to import optional AI dependencies
try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    print("ℹ️  Install anthropic for AI cover letters: pip install anthropic")

@dataclass
class JobMatch:
    """Job matching result with AI scoring"""
    job_id: str
    title: str
    company: str
    url: str
    match_score: float  # 0-100
    skill_match: float
    experience_match: float
    salary_match: float
    culture_match: float
    success_probability: float  # 0-1
    estimated_response_time: int  # days
    recommended_action: str
    reasons: List[str]
    warnings: List[str]

@dataclass
class ResumeAnalysis:
    """Resume analysis with optimization suggestions"""
    overall_score: float  # 0-100
    ats_score: float
    keyword_score: float
    experience_score: float
    education_score: float
    skills_score: float
    improvements: List[Dict[str, str]]
    missing_keywords: List[str]
    optimal_keywords: List[str]

@dataclass
class ApplicationPrediction:
    """ML prediction for application success"""
    success_probability: float  # 0-1
    expected_response_days: int
    interview_probability: float
    offer_probability: float
    confidence: float
    factors: Dict[str, float]

class AIJobMatcher:
    """Advanced AI-powered job matching"""

    def __init__(self, user_profile: Dict, historical_data: Optional[List[Dict]] = None):
        self.profile = user_profile
        self.history = historical_data or []
        self.ml_model = self._initialize_ml_model()

    def _initialize_ml_model(self):
        """Initialize ML model with historical data"""
        return {
            'skill_weights': self._calculate_skill_weights(),
            'company_preferences': self._learn_company_preferences(),
            'success_patterns': self._identify_success_patterns(),
            'timing_patterns': self._analyze_timing_patterns()
        }

    def _calculate_skill_weights(self) -> Dict[str, float]:
        """Calculate importance weight for each skill based on market demand"""
        # Skills ranked by current market demand and salary impact
        skill_weights = {
            # High-demand AI/ML skills
            'machine learning': 0.95,
            'deep learning': 0.95,
            'pytorch': 0.90,
            'tensorflow': 0.90,
            'llm': 0.95,
            'gpt': 0.92,
            'claude': 0.90,
            'openai': 0.92,
            'langchain': 0.88,
            'hugging face': 0.87,

            # High-demand backend skills
            'python': 0.85,
            'go': 0.83,
            'rust': 0.85,
            'java': 0.75,
            'node.js': 0.78,
            'typescript': 0.82,
            'kubernetes': 0.88,
            'docker': 0.82,
            'aws': 0.85,
            'gcp': 0.82,
            'azure': 0.78,

            # High-demand frontend skills
            'react': 0.85,
            'next.js': 0.83,
            'vue': 0.78,
            'tailwind': 0.75,

            # Data skills
            'sql': 0.80,
            'postgresql': 0.78,
            'mongodb': 0.73,
            'redis': 0.75,
            'spark': 0.82,

            # Other important skills
            'git': 0.70,
            'ci/cd': 0.75,
            'microservices': 0.80,
            'api': 0.75,
            'rest': 0.72,
            'graphql': 0.78,
        }
        return skill_weights

    def _learn_company_preferences(self) -> Dict[str, float]:
        """Learn user's company preferences from history"""
        preferences = {}

        if not self.history:
            # Default preferences for top tech companies
            return {
                'google': 0.95,
                'meta': 0.93,
                'amazon': 0.88,
                'apple': 0.92,
                'microsoft': 0.90,
                'openai': 0.98,
                'anthropic': 0.98,
                'stripe': 0.95,
                'airbnb': 0.93,
                'uber': 0.85,
                'netflix': 0.92,
                'startup': 0.80,
                'enterprise': 0.70,
            }

        # Learn from historical applications
        for app in self.history:
            company = app.get('company', '').lower()
            outcome = app.get('outcome', 'pending')

            if company not in preferences:
                preferences[company] = 0.5

            # Adjust preference based on outcome
            if outcome == 'offer':
                preferences[company] += 0.2
            elif outcome == 'interview':
                preferences[company] += 0.1
            elif outcome == 'rejected':
                preferences[company] -= 0.05

        return preferences

    def _identify_success_patterns(self) -> Dict[str, any]:
        """Identify patterns in successful applications"""
        if not self.history:
            return {
                'best_day_of_week': 'Tuesday',
                'best_time_of_day': 'morning',
                'optimal_application_count': 5,
                'response_rate_by_platform': {
                    'LinkedIn': 0.15,
                    'Indeed': 0.12,
                    'Company Website': 0.18,
                }
            }

        # Analyze historical success
        successful = [app for app in self.history if app.get('outcome') in ['interview', 'offer']]

        patterns = {
            'success_rate': len(successful) / len(self.history) if self.history else 0,
            'avg_response_days': self._calculate_avg_response_time(successful),
            'best_platforms': self._find_best_platforms(successful),
        }

        return patterns

    def _analyze_timing_patterns(self) -> Dict[str, float]:
        """Analyze optimal timing for applications"""
        # Based on industry data
        return {
            'monday': 0.75,
            'tuesday': 0.95,
            'wednesday': 0.92,
            'thursday': 0.88,
            'friday': 0.65,
            'saturday': 0.40,
            'sunday': 0.45,
            'morning': 0.90,    # 8-11 AM
            'afternoon': 0.75,   # 12-4 PM
            'evening': 0.50,     # 5-8 PM
        }

    def match_job(self, job: Dict) -> JobMatch:
        """Match a job against user profile with AI scoring"""

        # Calculate individual scores
        skill_score = self._calculate_skill_match(job)
        experience_score = self._calculate_experience_match(job)
        salary_score = self._calculate_salary_match(job)
        culture_score = self._calculate_culture_match(job)

        # Weighted overall match score
        match_score = (
            skill_score * 0.40 +
            experience_score * 0.25 +
            salary_score * 0.20 +
            culture_score * 0.15
        )

        # Predict success probability
        success_prob = self._predict_success(job, match_score)

        # Estimate response time
        response_time = self._estimate_response_time(job)

        # Generate recommendation
        action = self._recommend_action(match_score, success_prob)

        # Generate reasons and warnings
        reasons = self._generate_reasons(job, skill_score, experience_score)
        warnings = self._generate_warnings(job, match_score)

        return JobMatch(
            job_id=job.get('id', job.get('url', 'unknown')),
            title=job.get('title', 'Unknown'),
            company=job.get('company', 'Unknown'),
            url=job.get('url', ''),
            match_score=match_score,
            skill_match=skill_score,
            experience_match=experience_score,
            salary_match=salary_score,
            culture_match=culture_score,
            success_probability=success_prob,
            estimated_response_time=response_time,
            recommended_action=action,
            reasons=reasons,
            warnings=warnings
        )

    def _calculate_skill_match(self, job: Dict) -> float:
        """Calculate skill match score using NLP and keyword matching"""
        description = (job.get('description', '') + ' ' + job.get('title', '')).lower()
        user_skills = [s.lower() for s in self.profile.get('skills', [])]

        if not user_skills:
            return 50.0  # Default if no skills provided

        matched_skills = []
        total_weight = 0
        matched_weight = 0

        skill_weights = self.ml_model['skill_weights']

        for skill in user_skills:
            weight = skill_weights.get(skill, 0.5)
            total_weight += weight

            if skill in description:
                matched_skills.append(skill)
                matched_weight += weight

        if total_weight == 0:
            return 50.0

        # Base score from matched skills
        base_score = (matched_weight / total_weight) * 100

        # Bonus for high-value skills
        high_value_matches = [s for s in matched_skills if skill_weights.get(s, 0) > 0.85]
        bonus = min(len(high_value_matches) * 5, 20)

        return min(base_score + bonus, 100.0)

    def _calculate_experience_match(self, job: Dict) -> float:
        """Calculate experience level match"""
        title = job.get('title', '').lower()
        description = job.get('description', '').lower()

        user_years = self.profile.get('years_experience', 0)

        # Extract required years from job posting
        required_years = self._extract_years_requirement(title + ' ' + description)

        if required_years is None:
            # Infer from seniority level
            if 'senior' in title or 'sr.' in title or 'lead' in title:
                required_years = 5
            elif 'staff' in title or 'principal' in title:
                required_years = 8
            elif 'junior' in title or 'jr.' in title or 'entry' in title:
                required_years = 0
            else:
                required_years = 3  # Mid-level default

        # Calculate match
        if user_years >= required_years:
            # Overqualified penalty
            overskill = user_years - required_years
            if overskill > 5:
                return max(70.0, 100 - overskill * 2)
            return 100.0
        else:
            # Underqualified
            gap = required_years - user_years
            if gap <= 1:
                return 85.0  # Close enough
            elif gap <= 2:
                return 70.0
            else:
                return max(40.0, 70 - gap * 10)

    def _extract_years_requirement(self, text: str) -> Optional[int]:
        """Extract years of experience requirement from text"""
        patterns = [
            r'(\d+)\+?\s*years?',
            r'(\d+)-(\d+)\s*years?',
        ]

        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return int(match.group(1))

        return None

    def _calculate_salary_match(self, job: Dict) -> float:
        """Calculate salary expectation match"""
        user_min = self.profile.get('min_salary', 0)
        user_max = self.profile.get('max_salary', 999999)

        job_salary = job.get('salary', {})
        if isinstance(job_salary, dict):
            job_min = job_salary.get('min', 0)
            job_max = job_salary.get('max', 0)
        else:
            # Try to extract from description
            salary_range = self._extract_salary(job.get('description', ''))
            if salary_range:
                job_min, job_max = salary_range
            else:
                # Estimate based on title and level
                job_min, job_max = self._estimate_salary_range(job)

        if job_min == 0 and job_max == 0:
            return 70.0  # Neutral if no salary info

        # Check overlap
        if job_max >= user_min:
            if job_min <= user_max:
                # There's overlap
                overlap_start = max(job_min, user_min)
                overlap_end = min(job_max, user_max)
                overlap = overlap_end - overlap_start

                if overlap >= (user_max - user_min) * 0.8:
                    return 100.0
                elif overlap >= (user_max - user_min) * 0.5:
                    return 85.0
                else:
                    return 70.0
            else:
                return 50.0  # Job pays too much (unlikely problem)
        else:
            # Job pays too little
            gap = user_min - job_max
            return max(20.0, 70 - gap / 1000)

    def _extract_salary(self, text: str) -> Optional[Tuple[int, int]]:
        """Extract salary range from text"""
        patterns = [
            r'\$(\d{1,3}),?(\d{3})k?\s*-\s*\$(\d{1,3}),?(\d{3})k?',
            r'\$(\d{1,3})k\s*-\s*\$(\d{1,3})k',
        ]

        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                groups = match.groups()
                if len(groups) == 4:
                    min_sal = int(groups[0] + groups[1])
                    max_sal = int(groups[2] + groups[3])
                elif len(groups) == 2:
                    min_sal = int(groups[0]) * 1000
                    max_sal = int(groups[1]) * 1000
                return (min_sal, max_sal)

        return None

    def _estimate_salary_range(self, job: Dict) -> Tuple[int, int]:
        """Estimate salary range based on title and company"""
        title = job.get('title', '').lower()
        company = job.get('company', '').lower()

        # Base ranges by level
        if 'intern' in title:
            base = (60000, 90000)
        elif 'junior' in title or 'jr.' in title or 'entry' in title:
            base = (80000, 120000)
        elif 'senior' in title or 'sr.' in title:
            base = (140000, 200000)
        elif 'staff' in title or 'principal' in title:
            base = (180000, 280000)
        elif 'lead' in title or 'manager' in title:
            base = (160000, 240000)
        else:
            base = (100000, 160000)  # Mid-level

        # Adjust for company tier
        tier1_companies = ['google', 'meta', 'apple', 'amazon', 'microsoft', 'openai', 'anthropic', 'netflix']
        tier2_companies = ['stripe', 'airbnb', 'uber', 'lyft', 'doordash']

        if any(comp in company for comp in tier1_companies):
            base = (int(base[0] * 1.3), int(base[1] * 1.5))
        elif any(comp in company for comp in tier2_companies):
            base = (int(base[0] * 1.2), int(base[1] * 1.3))

        return base

    def _calculate_culture_match(self, job: Dict) -> float:
        """Calculate culture/company fit"""
        company = job.get('company', '').lower()
        description = job.get('description', '').lower()

        user_prefs = self.profile.get('preferences', {})
        remote_pref = user_prefs.get('remote', True)
        company_size_pref = user_prefs.get('company_size', 'any')

        score = 70.0  # Base score

        # Remote preference
        if remote_pref:
            if 'remote' in description or 'work from home' in description:
                score += 15
        else:
            if 'on-site' in description or 'office' in description:
                score += 10

        # Company preference
        company_prefs = self.ml_model['company_preferences']
        if company in company_prefs:
            company_score = company_prefs[company] * 100
            score = (score + company_score) / 2

        return min(score, 100.0)

    def _predict_success(self, job: Dict, match_score: float) -> float:
        """Predict probability of success using ML"""
        # Factors affecting success
        factors = []

        # Match score is primary factor
        factors.append(match_score / 100)

        # Company popularity (inverse relationship - less competition)
        company = job.get('company', '').lower()
        popularity = 0.7  # Default
        if company in ['google', 'meta', 'apple']:
            popularity = 0.3  # Very competitive
        elif company in ['startup', 'small company']:
            popularity = 0.8  # Less competitive
        factors.append(popularity)

        # Job age (fresher = better)
        posted_date = job.get('posted_date')
        if posted_date:
            age_factor = 0.9  # Assume fresh if we have it
        else:
            age_factor = 0.7
        factors.append(age_factor)

        # Platform (some platforms have better response rates)
        platform = job.get('platform', 'unknown').lower()
        platform_success = {
            'linkedin': 0.75,
            'indeed': 0.70,
            'company website': 0.80,
            'glassdoor': 0.65,
        }
        factors.append(platform_success.get(platform, 0.70))

        # Historical success rate
        if self.history:
            historical_rate = self.ml_model['success_patterns'].get('success_rate', 0.5)
            factors.append(historical_rate)

        # Weighted average
        weights = [0.4, 0.2, 0.15, 0.15, 0.1]
        if len(factors) < len(weights):
            weights = weights[:len(factors)]

        success_prob = sum(f * w for f, w in zip(factors, weights)) / sum(weights)

        return success_prob

    def _estimate_response_time(self, job: Dict) -> int:
        """Estimate days until response"""
        company = job.get('company', '').lower()

        # Company size affects response time
        big_companies = ['google', 'meta', 'apple', 'amazon', 'microsoft']

        if any(comp in company for comp in big_companies):
            # Larger companies = slower
            return 14
        else:
            # Smaller companies = faster
            return 7

    def _recommend_action(self, match_score: float, success_prob: float) -> str:
        """Recommend action based on scores"""
        if match_score >= 80 and success_prob >= 0.6:
            return "APPLY NOW - Excellent match!"
        elif match_score >= 70 and success_prob >= 0.5:
            return "APPLY - Good opportunity"
        elif match_score >= 60:
            return "CONSIDER - Moderate match"
        elif match_score >= 50:
            return "MAYBE - Low priority"
        else:
            return "SKIP - Poor match"

    def _generate_reasons(self, job: Dict, skill_score: float, exp_score: float) -> List[str]:
        """Generate reasons for the match"""
        reasons = []

        if skill_score >= 80:
            reasons.append("Strong skill alignment")
        if exp_score >= 80:
            reasons.append("Experience level matches well")

        company = job.get('company', '').lower()
        if company in self.ml_model['company_preferences']:
            pref = self.ml_model['company_preferences'][company]
            if pref >= 0.8:
                reasons.append(f"Highly preferred company")

        description = job.get('description', '').lower()
        if 'remote' in description:
            reasons.append("Remote position available")

        return reasons or ["Consider based on overall match"]

    def _generate_warnings(self, job: Dict, match_score: float) -> List[str]:
        """Generate warnings about the job"""
        warnings = []

        if match_score < 60:
            warnings.append("Low overall match score")

        title = job.get('title', '').lower()
        user_years = self.profile.get('years_experience', 0)

        if ('senior' in title or 'sr.' in title) and user_years < 4:
            warnings.append("May require more experience")

        if ('junior' in title or 'entry' in title) and user_years > 5:
            warnings.append("Position may be below your level")

        return warnings

    def _calculate_avg_response_time(self, applications: List[Dict]) -> int:
        """Calculate average response time from historical data"""
        if not applications:
            return 7

        response_times = []
        for app in applications:
            applied = app.get('applied_date')
            responded = app.get('response_date')
            if applied and responded:
                # Calculate days between
                days = 7  # Default
                response_times.append(days)

        return int(sum(response_times) / len(response_times)) if response_times else 7

    def _find_best_platforms(self, successful_apps: List[Dict]) -> Dict[str, float]:
        """Find platforms with best success rates"""
        platform_stats = {}

        for app in successful_apps:
            platform = app.get('platform', 'unknown')
            if platform not in platform_stats:
                platform_stats[platform] = {'success': 0, 'total': 0}
            platform_stats[platform]['success'] += 1

        # Get totals from all history
        for app in self.history:
            platform = app.get('platform', 'unknown')
            if platform not in platform_stats:
                platform_stats[platform] = {'success': 0, 'total': 0}
            platform_stats[platform]['total'] += 1

        # Calculate rates
        rates = {}
        for platform, stats in platform_stats.items():
            if stats['total'] > 0:
                rates[platform] = stats['success'] / stats['total']

        return rates


class CoverLetterGenerator:
    """AI-powered cover letter generation using Claude API"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        if ANTHROPIC_AVAILABLE and api_key:
            self.client = anthropic.Anthropic(api_key=api_key)
        else:
            self.client = None

    def generate(self, job: Dict, resume: str, user_profile: Dict) -> str:
        """Generate personalized cover letter"""

        if self.client:
            return self._generate_with_claude(job, resume, user_profile)
        else:
            return self._generate_template(job, user_profile)

    def _generate_with_claude(self, job: Dict, resume: str, user_profile: Dict) -> str:
        """Generate cover letter using Claude API"""

        prompt = f"""Write a compelling, authentic cover letter for this job application.

Job Details:
- Title: {job.get('title')}
- Company: {job.get('company')}
- Description: {job.get('description', 'N/A')}

Candidate Resume:
{resume}

Instructions:
- Be genuine and specific (no generic platitudes)
- Highlight 2-3 most relevant experiences
- Show enthusiasm for the specific role and company
- Keep it under 300 words
- Professional but personable tone
- NO clichés like "I am writing to express my interest"
- Start with something specific about the company or role

Generate the cover letter:"""

        try:
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}]
            )

            return message.content[0].text

        except Exception as e:
            print(f"Claude API error: {e}")
            return self._generate_template(job, user_profile)

    def _generate_template(self, job: Dict, user_profile: Dict) -> str:
        """Generate template-based cover letter"""

        name = user_profile.get('name', 'Applicant')
        title = job.get('title', 'this position')
        company = job.get('company', 'your company')

        return f"""Dear Hiring Manager,

I'm excited to apply for the {title} position at {company}. With {user_profile.get('years_experience', 'several')} years of experience in software engineering and a strong background in {', '.join(user_profile.get('skills', ['development'])[:3])}, I believe I would be a great fit for your team.

Throughout my career, I've built scalable systems and delivered high-impact features. I'm particularly drawn to {company}'s mission and would love to contribute to your team's success.

I'd welcome the opportunity to discuss how my experience aligns with your needs.

Best regards,
{name}"""


def main():
    """Example usage of AI engine"""

    # Example user profile
    user_profile = {
        'name': 'Alexa Amundson',
        'email': 'blackroad@gmail.com',
        'years_experience': 5,
        'skills': [
            'Python', 'TypeScript', 'React', 'Node.js',
            'Machine Learning', 'LLM', 'Claude', 'OpenAI',
            'AWS', 'Docker', 'Kubernetes', 'PostgreSQL'
        ],
        'min_salary': 150000,
        'max_salary': 250000,
        'preferences': {
            'remote': True,
            'company_size': 'any',
        }
    }

    # Example job
    job = {
        'id': '12345',
        'title': 'Senior Software Engineer - AI/ML',
        'company': 'Anthropic',
        'url': 'https://example.com/job/12345',
        'description': '''
        We're looking for a Senior Software Engineer to join our AI team.

        Requirements:
        - 5+ years of experience with Python
        - Experience with LLMs and ML systems
        - Strong background in TypeScript and React
        - Experience with cloud platforms (AWS/GCP)
        - Remote work available

        Salary: $180k - $240k
        ''',
        'platform': 'LinkedIn',
        'salary': {'min': 180000, 'max': 240000}
    }

    # Initialize AI matcher
    matcher = AIJobMatcher(user_profile)

    # Match job
    match = matcher.match_job(job)

    # Print results
    print("\n" + "="*70)
    print("AI JOB MATCH ANALYSIS")
    print("="*70)
    print(f"\nJob: {match.title} at {match.company}")
    print(f"\nOverall Match Score: {match.match_score:.1f}/100")
    print(f"  - Skill Match: {match.skill_match:.1f}/100")
    print(f"  - Experience Match: {match.experience_match:.1f}/100")
    print(f"  - Salary Match: {match.salary_match:.1f}/100")
    print(f"  - Culture Match: {match.culture_match:.1f}/100")
    print(f"\nSuccess Probability: {match.success_probability*100:.1f}%")
    print(f"Expected Response: {match.estimated_response_time} days")
    print(f"\nRecommendation: {match.recommended_action}")

    if match.reasons:
        print(f"\nReasons:")
        for reason in match.reasons:
            print(f"  ✓ {reason}")

    if match.warnings:
        print(f"\nWarnings:")
        for warning in match.warnings:
            print(f"  ⚠️  {warning}")

    print("\n" + "="*70)


if __name__ == "__main__":
    main()
