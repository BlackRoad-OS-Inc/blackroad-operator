#!/usr/bin/env python3
"""
AI Cover Letter Generator - Claude-Powered Personalized Cover Letters

Features:
- Analyzes job description + resume for perfect match
- Multiple tones (professional, enthusiastic, technical, creative)
- Company-specific customization
- Highlights most relevant skills
- A/B testing variants
- Integration with applier workflow
"""

import os
import json
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
import hashlib

# Try to import Anthropic
try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    print("⚠️  Install anthropic: pip install anthropic")
    print("    Then set: export ANTHROPIC_API_KEY='your-key'")


@dataclass
class CoverLetterRequest:
    """Request for cover letter generation."""
    job_title: str
    company: str
    job_description: str
    resume_text: str
    your_name: str
    tone: str = "professional"  # professional, enthusiastic, technical, creative
    length: str = "medium"  # short (2 paragraphs), medium (3-4), long (5+)
    highlights: Optional[List[str]] = None  # Skills to emphasize
    company_research: Optional[str] = None  # Company info to incorporate


@dataclass
class CoverLetter:
    """Generated cover letter."""
    content: str
    tone: str
    length: str
    word_count: int
    highlights_used: List[str]
    generation_time: str
    variant_id: str


class AICoverLetterGenerator:
    """Claude-powered cover letter generator."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize generator."""
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not set. Set environment variable or pass api_key.")

        if not ANTHROPIC_AVAILABLE:
            raise ImportError("anthropic package not installed. Run: pip install anthropic")

        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.cache_dir = Path.home() / ".applier" / "cover_letters"
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def generate(
        self,
        request: CoverLetterRequest,
        num_variants: int = 1
    ) -> List[CoverLetter]:
        """
        Generate cover letter(s).

        Args:
            request: Cover letter request
            num_variants: Number of variants to generate (for A/B testing)

        Returns:
            List of cover letters
        """
        cover_letters = []

        for i in range(num_variants):
            # Generate unique variant
            variant_tone = request.tone
            if num_variants > 1:
                tones = ["professional", "enthusiastic", "technical"]
                variant_tone = tones[i % len(tones)]

            prompt = self._build_prompt(request, variant_tone)
            content = self._call_claude(prompt)

            # Parse highlights used
            highlights_used = self._extract_highlights(content, request.resume_text)

            # Calculate word count
            word_count = len(content.split())

            # Generate variant ID
            variant_id = hashlib.md5(
                f"{request.company}{request.job_title}{i}{datetime.now().isoformat()}".encode()
            ).hexdigest()[:8]

            cover_letter = CoverLetter(
                content=content,
                tone=variant_tone,
                length=request.length,
                word_count=word_count,
                highlights_used=highlights_used,
                generation_time=datetime.now().isoformat(),
                variant_id=variant_id
            )

            cover_letters.append(cover_letter)

            # Save to cache
            self._save_to_cache(request, cover_letter)

        return cover_letters

    def _build_prompt(self, request: CoverLetterRequest, tone: str) -> str:
        """Build prompt for Claude."""

        # Extract key skills from resume
        skills = self._extract_skills(request.resume_text)

        # Extract requirements from job description
        requirements = self._extract_requirements(request.job_description)

        # Build company context
        company_context = ""
        if request.company_research:
            company_context = f"\n\nCompany Research:\n{request.company_research}"

        # Tone guidance
        tone_guidance = {
            "professional": "Write in a professional, polished tone. Be confident but not boastful. Focus on value you'll bring.",
            "enthusiastic": "Write with genuine enthusiasm and energy. Show passion for the role and company. Be personable.",
            "technical": "Write in a technical, detail-oriented tone. Emphasize specific technologies and methodologies. Be precise.",
            "creative": "Write in a creative, unique tone that stands out. Show personality while remaining professional. Be memorable."
        }

        # Length guidance
        length_guidance = {
            "short": "Keep it concise - 2 short paragraphs maximum (150-200 words). Every word counts.",
            "medium": "Write 3-4 well-developed paragraphs (300-400 words). Balanced and complete.",
            "long": "Write a comprehensive 5-6 paragraph letter (500-600 words). Tell your full story."
        }

        prompt = f"""You are an expert career coach and professional writer. Write a compelling cover letter for this job application.

JOB DETAILS:
Position: {request.job_title}
Company: {request.company}

JOB DESCRIPTION:
{request.job_description}

APPLICANT'S RESUME:
{request.resume_text}

KEY REQUIREMENTS FROM JOB:
{chr(10).join('- ' + req for req in requirements[:5])}

APPLICANT'S RELEVANT SKILLS:
{chr(10).join('- ' + skill for skill in skills[:10])}

{company_context}

WRITING INSTRUCTIONS:
Tone: {tone_guidance[tone]}
Length: {length_guidance[request.length]}

IMPORTANT GUIDELINES:
1. Start with a strong hook - why you're excited about THIS specific role at THIS company
2. Draw clear connections between job requirements and applicant's experience
3. Use specific examples and metrics from the resume where possible
4. Show you've researched the company (if research provided)
5. Highlight 3-4 most relevant skills/experiences that match the job
6. End with a confident call to action
7. Be authentic and genuine - avoid clichés
8. DO NOT use generic phrases like "I am writing to express my interest"
9. DO NOT simply repeat the resume - add new context
10. Make every sentence count

{f"EMPHASIZE THESE SKILLS: {', '.join(request.highlights)}" if request.highlights else ""}

Write the cover letter now. Return ONLY the cover letter text, no preamble or explanation."""

        return prompt

    def _call_claude(self, prompt: str) -> str:
        """Call Claude API."""
        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",  # Latest Sonnet
                max_tokens=2000,
                temperature=0.7,  # Some creativity
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            return message.content[0].text.strip()

        except Exception as e:
            raise Exception(f"Claude API error: {e}")

    def _extract_skills(self, resume_text: str) -> List[str]:
        """Extract key skills from resume."""
        # Common tech skills
        skill_patterns = [
            r'\b(Python|JavaScript|TypeScript|Java|C\+\+|Ruby|Go|Rust|Swift)\b',
            r'\b(React|Angular|Vue|Node\.js|Django|Flask|FastAPI|Express)\b',
            r'\b(AWS|Azure|GCP|Docker|Kubernetes|Terraform|CI/CD)\b',
            r'\b(PostgreSQL|MySQL|MongoDB|Redis|DynamoDB)\b',
            r'\b(Machine Learning|ML|AI|Deep Learning|NLP|Computer Vision)\b',
            r'\b(TensorFlow|PyTorch|scikit-learn|Keras)\b',
            r'\b(API|REST|GraphQL|gRPC|WebSocket)\b',
            r'\b(Git|GitHub|GitLab|Agile|Scrum|TDD)\b',
        ]

        skills = set()
        for pattern in skill_patterns:
            matches = re.finditer(pattern, resume_text, re.IGNORECASE)
            for match in matches:
                skills.add(match.group(0))

        return sorted(list(skills))[:15]

    def _extract_requirements(self, job_description: str) -> List[str]:
        """Extract key requirements from job description."""
        # Look for requirement sections
        req_patterns = [
            r"(?:Requirements?|Qualifications?|What [Yy]ou['']ll [Nn]eed|Must [Hh]ave):(.+?)(?:\n\n|\Z)",
            r"(?:Responsibilities?|What [Yy]ou['']ll [Dd]o):(.+?)(?:\n\n|\Z)",
        ]

        requirements = []
        for pattern in req_patterns:
            match = re.search(pattern, job_description, re.DOTALL)
            if match:
                section = match.group(1)
                # Extract bullet points
                bullets = re.findall(r'[•\-\*]\s*(.+)', section)
                requirements.extend(bullets[:5])

        return requirements[:8]

    def _extract_highlights(self, cover_letter: str, resume: str) -> List[str]:
        """Extract which skills were highlighted in the cover letter."""
        skills = self._extract_skills(resume)

        highlights = []
        for skill in skills:
            if skill.lower() in cover_letter.lower():
                highlights.append(skill)

        return highlights

    def _save_to_cache(self, request: CoverLetterRequest, letter: CoverLetter):
        """Save cover letter to cache."""
        filename = f"{request.company}_{request.job_title}_{letter.variant_id}.json"
        # Sanitize filename
        filename = re.sub(r'[^\w\-_.]', '_', filename)

        cache_file = self.cache_dir / filename

        data = {
            "request": {
                "job_title": request.job_title,
                "company": request.company,
                "tone": request.tone,
                "length": request.length,
            },
            "letter": asdict(letter),
            "cached_at": datetime.now().isoformat()
        }

        with open(cache_file, 'w') as f:
            json.dump(data, f, indent=2)

    def get_cached_letters(self, company: str = None, job_title: str = None) -> List[Dict]:
        """Get previously generated letters from cache."""
        cached = []

        for cache_file in self.cache_dir.glob("*.json"):
            try:
                with open(cache_file, 'r') as f:
                    data = json.load(f)

                # Filter if requested
                if company and data["request"]["company"].lower() != company.lower():
                    continue
                if job_title and data["request"]["job_title"].lower() != job_title.lower():
                    continue

                cached.append(data)
            except:
                continue

        # Sort by date, newest first
        cached.sort(key=lambda x: x.get("cached_at", ""), reverse=True)

        return cached


class QuickCoverLetter:
    """Quick cover letter generator without AI (fallback)."""

    @staticmethod
    def generate_template(
        name: str,
        job_title: str,
        company: str,
        top_skills: List[str],
        years_experience: int
    ) -> str:
        """Generate template-based cover letter."""

        skills_str = ", ".join(top_skills[:3])

        template = f"""Dear Hiring Manager,

I'm excited to apply for the {job_title} position at {company}. With {years_experience} years of experience in {skills_str}, I'm confident I can make an immediate impact on your team.

In my current role, I've developed strong expertise in {top_skills[0] if top_skills else 'software development'}, which aligns perfectly with the requirements outlined in your job posting. I'm particularly drawn to {company}'s mission and would love the opportunity to contribute to your continued success.

I'd welcome the chance to discuss how my background in {skills_str} can benefit {company}. Thank you for your consideration.

Best regards,
{name}"""

        return template


# CLI Interface
def main():
    """CLI for cover letter generation."""
    import argparse

    parser = argparse.ArgumentParser(description="AI Cover Letter Generator")
    parser.add_argument("--job-title", required=True, help="Job title")
    parser.add_argument("--company", required=True, help="Company name")
    parser.add_argument("--job-description", required=True, help="Path to job description file")
    parser.add_argument("--resume", default="~/.applier/resume.txt", help="Path to resume")
    parser.add_argument("--name", help="Your name (from config if not provided)")
    parser.add_argument("--tone", default="professional", choices=["professional", "enthusiastic", "technical", "creative"])
    parser.add_argument("--length", default="medium", choices=["short", "medium", "long"])
    parser.add_argument("--variants", type=int, default=1, help="Number of variants to generate")
    parser.add_argument("--output", help="Output file (defaults to stdout)")

    args = parser.parse_args()

    # Load resume
    resume_path = Path(args.resume).expanduser()
    if not resume_path.exists():
        print(f"❌ Resume not found: {resume_path}")
        return 1

    with open(resume_path, 'r') as f:
        resume_text = f.read()

    # Load job description
    jd_path = Path(args.job_description).expanduser()
    if not jd_path.exists():
        print(f"❌ Job description not found: {jd_path}")
        return 1

    with open(jd_path, 'r') as f:
        job_description = f.read()

    # Get name
    name = args.name
    if not name:
        config_path = Path.home() / ".applier" / "config.json"
        if config_path.exists():
            with open(config_path, 'r') as f:
                config = json.load(f)
                name = config.get("name", "Your Name")
        else:
            name = "Your Name"

    # Create request
    request = CoverLetterRequest(
        job_title=args.job_title,
        company=args.company,
        job_description=job_description,
        resume_text=resume_text,
        your_name=name,
        tone=args.tone,
        length=args.length
    )

    # Generate
    try:
        generator = AICoverLetterGenerator()
        print(f"🤖 Generating {args.variants} cover letter(s) with Claude...")
        print(f"   Tone: {args.tone}, Length: {args.length}")

        letters = generator.generate(request, num_variants=args.variants)

        for i, letter in enumerate(letters, 1):
            print(f"\n{'='*60}")
            print(f"VARIANT #{i} ({letter.tone} tone, {letter.word_count} words)")
            print(f"{'='*60}\n")
            print(letter.content)
            print(f"\n✓ Highlighted skills: {', '.join(letter.highlights_used[:5])}")

            # Save if output specified
            if args.output:
                output_path = Path(args.output).expanduser()
                if args.variants > 1:
                    output_path = output_path.parent / f"{output_path.stem}_v{i}{output_path.suffix}"

                with open(output_path, 'w') as f:
                    f.write(letter.content)

                print(f"💾 Saved to: {output_path}")

        print(f"\n✅ Generated {len(letters)} cover letter(s)")
        print(f"📁 Cached in: {generator.cache_dir}")

        return 0

    except Exception as e:
        print(f"❌ Error: {e}")
        return 1


if __name__ == "__main__":
    exit(main())
