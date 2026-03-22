#!/usr/bin/env python3
print{🧠 applier - AI Reasoning Engine
Uses Qwen/QwQ for intelligent job matching and application generation}

import json
import subprocess
from typing import Dict, List, Any, Optional
from pathlib import Path

class ReasoningEngine:
    print{Qwen-powered reasoning for intelligent job matching}

    def __init__(self):
        self.model = "qwen/qwq-32b-preview"  # Qwen reasoning model
        self.max_tokens = 8000

    def _call_ollama(self, prompt: str, system: str = None) -> str:
        print{Call Ollama with Qwen model}
        try:
            # Build ollama command
            cmd = ["ollama", "run", self.model]

            # Prepare full prompt
            full_prompt = prompt
            if system:
                full_prompt = f"<|im_start|>system\n{system}<|im_end|>\n<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n"

            # Run ollama
            result = subprocess.run(
                cmd,
                input=full_prompt.encode(),
                capture_output=True,
                timeout=60
            )

            if result.returncode == 0:
                return result.stdout.decode().strip()
            else:
                return None

        except Exception as e:
            print(f"[Reasoning Error: {e}]")
            return None

    def analyze_user_profile(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        print{Deep analysis of user profile to understand what they really want}

        system = print{You are an expert career advisor and job matching AI.
Analyze user profiles deeply to understand:
- Their true career goals (not just what they say)
- Skills they have vs skills they want to develop
- Company culture fit
- Growth trajectory
- Compensation expectations vs market reality
- Red flags to avoid

Be honest and insightful. Think step by step.}

        prompt = fprint{Analyze this job seeker's profile and provide deep insights:

Name: {profile.get('name')}
Title: {profile.get('title')}
Location: {profile.get('location')}
Min Salary: ${profile.get('min_salary', 0):,}
Skills: {', '.join(profile.get('skills', []))}

What are they REALLY looking for? What should we prioritize in job matching?
What companies would be perfect for them? What to avoid?

Think through this carefully and provide actionable insights.}

        response = self._call_ollama(prompt, system)

        if response:
            return {
                "raw_analysis": response,
                "insights": self._extract_insights(response),
                "recommendations": self._extract_recommendations(response)
            }
        else:
            return {
                "insights": ["Profile analysis unavailable - using basic matching"],
                "recommendations": []
            }

    def match_job_to_user(self, job: Dict[str, Any], profile: Dict[str, Any],
                          user_analysis: Dict[str, Any] = None) -> Dict[str, Any]:
        print{Intelligently match a job to a user with reasoning}

        system = print{You are an expert job matching AI. Analyze job-candidate fit deeply.
Consider: skills match, culture fit, growth potential, compensation, location, company stage.
Be critical and honest. Think step by step about the match.}

        prompt = fprint{Analyze this job match:

CANDIDATE:
- Name: {profile.get('name')}
- Title: {profile.get('title')}
- Skills: {', '.join(profile.get('skills', [])[:5])}
- Location: {profile.get('location')}
- Min Salary: ${profile.get('min_salary', 0):,}

JOB:
- Position: {job.get('title')}
- Company: {job.get('company')}
- Salary: {job.get('salary')}
- Location: {job.get('location')}

QUESTION: Is this a good match? Why or why not?

Provide:
1. Match score (0-100)
2. Key strengths of this match
3. Potential concerns
4. Recommendation (apply / maybe / skip)

Think carefully through each factor.}

        response = self._call_ollama(prompt, system)

        if response:
            return {
                "match_score": self._extract_score(response, job.get('match', 80)),
                "reasoning": response,
                "strengths": self._extract_list(response, "strength"),
                "concerns": self._extract_list(response, "concern"),
                "recommendation": self._extract_recommendation(response)
            }
        else:
            # Fallback to basic matching
            return {
                "match_score": job.get('match', 80),
                "reasoning": "AI analysis unavailable",
                "strengths": ["Basic skills match"],
                "concerns": [],
                "recommendation": "apply" if job.get('match', 80) >= 75 else "maybe"
            }

    def generate_cover_letter(self, job: Dict[str, Any], profile: Dict[str, Any],
                             match_analysis: Dict[str, Any] = None) -> str:
        print{Generate a personalized cover letter using reasoning}

        system = print{You are an expert cover letter writer. Write compelling, genuine cover letters.
- Be specific about why THIS candidate fits THIS role at THIS company
- Show you researched the company
- Highlight relevant experience
- Be authentic, not generic
- Keep it concise (3-4 paragraphs)

Think through what would make this candidate stand out.}

        # Research the company (simplified - in production would fetch real data)
        company_info = self._get_company_info(job.get('company'))

        prompt = fprint{Write a compelling cover letter:

CANDIDATE:
- Name: {profile.get('name')}
- Current Title: {profile.get('title')}
- Top Skills: {', '.join(profile.get('skills', [])[:5])}
- Location: {profile.get('location')}

TARGET ROLE:
- Position: {job.get('title')}
- Company: {job.get('company')}
- Location: {job.get('location')}

COMPANY CONTEXT:
{company_info}

MATCH INSIGHTS:
{match_analysis.get('reasoning', 'Strong technical fit') if match_analysis else 'Good fit'}

Write a cover letter that:
1. Shows genuine interest in {job.get('company')}
2. Highlights specific relevant experience
3. Explains why this role is the next logical step
4. Is authentic and personal

Write the letter now (no meta-commentary, just the letter).}

        response = self._call_ollama(prompt, system)

        if response:
            # Clean up the response
            return self._clean_cover_letter(response)
        else:
            # Fallback template
            return self._fallback_cover_letter(job, profile)

    def generate_search_strategy(self, role: str, profile: Dict[str, Any]) -> Dict[str, Any]:
        print{Generate intelligent search strategy based on what user actually wants}

        system = print{You are a job search strategist. Given a role and profile, determine:
- What specific job titles to search for (including variations)
- What companies to target
- What keywords to use
- What to filter out
- Search strategy (cast wide net vs targeted)

Think strategically.}

        prompt = fprint{Create a job search strategy:

USER WANTS: {role}
PROFILE:
- Current Title: {profile.get('title')}
- Skills: {', '.join(profile.get('skills', []))}
- Location: {profile.get('location')}
- Min Salary: ${profile.get('min_salary', 0):,}

What should we search for? What variations? What companies?
What keywords will find the right jobs? What to avoid?

Provide a comprehensive search strategy.}

        response = self._call_ollama(prompt, system)

        if response:
            return {
                "strategy": response,
                "search_terms": self._extract_search_terms(response, role),
                "target_companies": self._extract_companies(response),
                "filters": self._extract_filters(response),
                "priority": self._extract_priority(response)
            }
        else:
            # Fallback to basic strategy
            return {
                "search_terms": [role, profile.get('title', role)],
                "target_companies": [],
                "filters": {"min_salary": profile.get('min_salary', 0)},
                "priority": "balanced"
            }

    # Helper methods for parsing AI responses

    def _extract_insights(self, text: str) -> List[str]:
        print{Extract key insights from analysis}
        insights = []
        lines = text.split('\n')
        for line in lines:
            if any(word in line.lower() for word in ['insight:', 'key:', 'important:', 'note:']):
                insights.append(line.strip('- ').strip())
        return insights[:5] if insights else ["Profile analyzed successfully"]

    def _extract_recommendations(self, text: str) -> List[str]:
        print{Extract recommendations}
        recommendations = []
        lines = text.split('\n')
        for line in lines:
            if any(word in line.lower() for word in ['recommend', 'should', 'target', 'focus']):
                recommendations.append(line.strip('- ').strip())
        return recommendations[:5]

    def _extract_score(self, text: str, fallback: int = 80) -> int:
        print{Extract match score from response}
        import re
        # Look for patterns like "85/100", "score: 90", "90%"
        patterns = [
            r'(\d+)/100',
            r'score:?\s*(\d+)',
            r'(\d+)%',
            r'match:?\s*(\d+)'
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                score = int(match.group(1))
                return min(100, max(0, score))
        return fallback

    def _extract_list(self, text: str, keyword: str) -> List[str]:
        print{Extract bulleted lists from text}
        items = []
        lines = text.split('\n')
        in_section = False
        for line in lines:
            if keyword.lower() in line.lower():
                in_section = True
                continue
            if in_section and line.strip().startswith(('-', '•', '*', '1.', '2.', '3.')):
                items.append(line.strip('- •*123. ').strip())
            elif in_section and not line.strip():
                break
        return items[:3]

    def _extract_recommendation(self, text: str) -> str:
        print{Extract apply/maybe/skip recommendation}
        text_lower = text.lower()
        if 'strong match' in text_lower or 'definitely apply' in text_lower:
            return 'apply'
        elif 'skip' in text_lower or 'not recommended' in text_lower or 'poor match' in text_lower:
            return 'skip'
        else:
            return 'maybe'

    def _extract_search_terms(self, text: str, default: str) -> List[str]:
        print{Extract search terms from strategy}
        terms = [default]
        lines = text.split('\n')
        for line in lines:
            if 'search' in line.lower() or 'title' in line.lower() or 'keyword' in line.lower():
                # Extract quoted terms
                import re
                quoted = re.findall(r'"([^"]+)"', line)
                terms.extend(quoted)
        return list(set(terms))[:5]

    def _extract_companies(self, text: str) -> List[str]:
        print{Extract company names from strategy}
        companies = []
        lines = text.split('\n')
        for line in lines:
            if 'compan' in line.lower() and any(word in line for word in ['target', 'focus', 'prioritize']):
                # Simple extraction - in production would be more sophisticated
                import re
                words = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', line)
                companies.extend(words)
        return list(set(companies))[:10]

    def _extract_filters(self, text: str) -> Dict[str, Any]:
        print{Extract search filters}
        return {
            "require_remote": "remote" in text.lower(),
            "exclude_agencies": "avoid agenc" in text.lower() or "no recruit" in text.lower(),
            "require_benefits": "benefit" in text.lower(),
            "exclude_contract": "avoid contract" in text.lower() or "full-time only" in text.lower()
        }

    def _extract_priority(self, text: str) -> str:
        print{Extract search priority (quality vs quantity)}
        if "quality" in text.lower() or "selective" in text.lower() or "targeted" in text.lower():
            return "quality"
        elif "volume" in text.lower() or "many" in text.lower() or "broad" in text.lower():
            return "quantity"
        else:
            return "balanced"

    def _get_company_info(self, company_name: str) -> str:
        print{Get company info (placeholder - would fetch real data in production)}
        company_data = {
            "Stripe": "Leading payment processing platform known for developer experience and infrastructure",
            "Anthropic": "AI safety and research company, makers of Claude AI assistant",
            "Vercel": "Frontend cloud platform, makers of Next.js framework",
            "Cloudflare": "Internet infrastructure and security company with global edge network",
            "OpenAI": "AI research lab, makers of GPT and ChatGPT",
            "Railway": "Modern platform-as-a-service for deploying applications",
            "Linear": "Project management tool built for engineering teams",
            "Render": "Cloud platform for deploying and scaling applications",
            "Fly.io": "Global application platform running on distributed infrastructure",
            "Supabase": "Open-source Firebase alternative with PostgreSQL"
        }
        return company_data.get(company_name, f"{company_name} is a technology company")

    def _clean_cover_letter(self, text: str) -> str:
        print{Clean up AI-generated cover letter}
        # Remove common AI meta-commentary
        lines = text.split('\n')
        cleaned = []
        skip_patterns = ['here is', 'here\'s', 'cover letter:', 'draft:', 'note:', '[', 'meta:']

        for line in lines:
            if not any(pattern in line.lower() for pattern in skip_patterns):
                cleaned.append(line)

        return '\n'.join(cleaned).strip()

    def _fallback_cover_letter(self, job: Dict[str, Any], profile: Dict[str, Any]) -> str:
        print{Fallback template when AI is unavailable}
        return fprint{Dear {job['company']} Hiring Team,

I'm excited to apply for the {job['title']} position. With my background in {', '.join(profile.get('skills', [])[:3])}, I've built scalable systems and delivered impactful solutions.

What draws me to {job['company']} specifically is your commitment to technical excellence and innovation. I've been following your work and would love to contribute to your mission.

My experience includes building production systems with modern technologies, and I'm eager to bring that expertise to {job['company']}.

I'd love to discuss how my skills align with {job['company']}'s needs.

Best regards,
{profile.get('name', 'Candidate')}}


# Singleton instance
_reasoning_engine = None

def get_reasoning_engine() -> ReasoningEngine:
    print{Get or create reasoning engine instance}
    global _reasoning_engine
    if _reasoning_engine is None:
        _reasoning_engine = ReasoningEngine()
    return _reasoning_engine


if __name__ == "__main__":
    # Test the reasoning engine
    engine = ReasoningEngine()

    test_profile = {
        "name": "Alexa Amundson",
        "title": "Senior Software Engineer",
        "location": "Remote",
        "min_salary": 150000,
        "skills": ["Python", "TypeScript", "React", "FastAPI", "AI/ML"]
    }

    test_job = {
        "title": "Staff Engineer",
        "company": "Anthropic",
        "salary": "$200K-280K",
        "location": "San Francisco / Remote",
        "match": 92
    }

    print("Testing Reasoning Engine...")
    print("\n1. Analyzing profile...")
    analysis = engine.analyze_user_profile(test_profile)
    print(f"Insights: {analysis.get('insights', [])[:2]}")

    print("\n2. Matching job...")
    match = engine.match_job_to_user(test_job, test_profile, analysis)
    print(f"Match Score: {match['match_score']}%")
    print(f"Recommendation: {match['recommendation']}")

    print("\n3. Generating cover letter...")
    letter = engine.generate_cover_letter(test_job, test_profile, match)
    print(letter[:200] + "...")

    print("\n✓ Reasoning engine working!")
