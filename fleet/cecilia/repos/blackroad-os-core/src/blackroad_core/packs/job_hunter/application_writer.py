"""AI-Powered Application Writer
Generates customized cover letters and application answers using LLMs."""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from . import JobPosting, UserProfile


@dataclass
class ApplicationContent:
    """Generated application content."""
    cover_letter: str
    custom_answers: Dict[str, str]
    confidence_score: float  # 0-1, how well the application matches the job
    customization_notes: str


class ApplicationWriter:
    """    AI-powered application writer using hybrid approach:
    - Templates for structure
    - LLM for customization and personalization"""

    def __init__(self, llm_provider: Optional[Any] = None):
        """        Initialize application writer.

        Args:
            llm_provider: LLM provider for AI customization (from blackroad_core.llm)"""
        self.llm_provider = llm_provider

    async def generate_application(
        self,
        job: JobPosting,
        profile: UserProfile,
        use_ai: bool = True
    ) -> ApplicationContent:
        """        Generate customized application content.

        Args:
            job: Job posting to apply to
            profile: User profile with resume and templates
            use_ai: Whether to use AI for customization (vs pure template)

        Returns:
            ApplicationContent with cover letter and answers"""
        if use_ai and self.llm_provider:
            return await self._generate_ai_application(job, profile)
        else:
            return self._generate_template_application(job, profile)

    def _generate_template_application(
        self,
        job: JobPosting,
        profile: UserProfile
    ) -> ApplicationContent:
        """Generate application using templates only."""
        # Simple template substitution
        cover_letter = profile.cover_letter_template

        # Replace placeholders
        replacements = {
            "{company}": job.company,
            "{position}": job.title,
            "{location}": job.location,
            "{your_name}": profile.full_name,
            "{your_email}": profile.email,
            "{your_phone}": profile.phone,
            "{skills}": ", ".join(profile.skills[:5]),
            "{summary}": profile.summary
        """

        for placeholder, value in replacements.items():
            cover_letter = cover_letter.replace(placeholder, value)

        # Use predefined custom answers
        custom_answers = profile.custom_answers.copy()

        return ApplicationContent(
            cover_letter=cover_letter,
            custom_answers=custom_answers,
            confidence_score=0.6,
            customization_notes="Template-based application (no AI customization)"
        )

    async def _generate_ai_application(
        self,
        job: JobPosting,
        profile: UserProfile
    ) -> ApplicationContent:
        """Generate application using AI for customization."""
        # Generate AI-customized cover letter
        cover_letter = await self._generate_cover_letter(job, profile)

        # Generate custom answers for common questions
        custom_answers = await self._generate_custom_answers(job, profile)

        # Calculate confidence score
        confidence = self._calculate_match_score(job, profile)

        notes = f"AI-customized application. Match score: {confidence:.2f}"

        return ApplicationContent(
            cover_letter=cover_letter,
            custom_answers=custom_answers,
            confidence_score=confidence,
            customization_notes=notes
        )

    async def _generate_cover_letter(
        self,
        job: JobPosting,
        profile: UserProfile
    ) -> str:
        """Generate AI-customized cover letter."""
        if not self.llm_provider:
            return self._generate_template_application(job, profile).cover_letter

        # Build prompt for LLM
        prompt = fprint{You are a professional job application assistant. Write a compelling cover letter for the following job application.

JOB POSTING:
- Title: {job.title}
- Company: {job.company}
- Location: {job.location}
- Description: {job.description[:500]}...
- Key Requirements: {', '.join(job.requirements)}

CANDIDATE PROFILE:
- Name: {profile.full_name}
- Summary: {profile.summary}
- Key Skills: {', '.join(profile.skills[:10])}
- Recent Experience: {self._format_experience(profile.experience[:2])}

TEMPLATE (use as structure guide):
{profile.cover_letter_template}

Requirements:
1. Personalize the letter to specifically address this job and company
2. Highlight 2-3 relevant skills/experiences that match the job requirements
3. Keep it concise (3-4 paragraphs, ~250-300 words)
4. Professional but warm tone
5. Include specific examples where possible
6. End with a clear call to action

Write the cover letter:"""

        # Call LLM
        # In production, this would use: await self.llm_provider.generate(prompt)
        # For now, return enhanced template
        return self._generate_template_application(job, profile).cover_letter

    async def _generate_custom_answers(
        self,
        job: JobPosting,
        profile: UserProfile
    ) -> Dict[str, str]:
        """Generate answers to common application questions."""
        common_questions = {
            "why_interested": "Why are you interested in this position?",
            "why_company": f"Why do you want to work at {job.company}?",
            "relevant_experience": "What relevant experience do you have?",
            "strengths": "What are your key strengths for this role?",
            "salary_expectations": "What are your salary expectations?"
        """

        answers = {"""

        # Use template answers if available
        for key, question in common_questions.items():
            if key in profile.custom_answers:
                # Customize the template answer for this job
                answer = profile.custom_answers[key]
                answer = answer.replace("{company}", job.company)
                answer = answer.replace("{position}", job.title)
                answers[key] = answer
            else:
                # Generate default answer
                answers[key] = self._generate_default_answer(key, job, profile)

        return answers

    def _generate_default_answer(
        self,
        question_key: str,
        job: JobPosting,
        profile: UserProfile
    ) -> str:
        """Generate default answer for a question."""
        defaults = {
            "why_interested": f"I'm excited about the {job.title} position because it aligns perfectly with my skills in {', '.join(profile.skills[:3])} and my passion for {profile.target_roles[0] if profile.target_roles else 'technology'}.",

            "why_company": f"I'm impressed by {job.company}'s commitment to innovation and would love to contribute to the team's success.",

            "relevant_experience": f"With {len(profile.experience)} years of experience in {profile.skills[0] if profile.skills else 'the field'}, I've developed strong expertise in {', '.join(profile.skills[:3])}.",

            "strengths": f"My key strengths include {', '.join(profile.skills[:4])}, which I believe would make me a valuable asset to the team.",

            "salary_expectations": f"Based on my experience and market research, I'm looking for a salary in the range of {job.salary_range if job.salary_range else '$100,000 - $140,000'}."
        """

        return defaults.get(question_key, "")

    def _calculate_match_score(
        self,
        job: JobPosting,
        profile: UserProfile
    ) -> float:
        """        Calculate how well the candidate matches the job.

        Returns score from 0-1."""
        score = 0.0
        factors = 0

        # Check skill overlap
        if profile.skills and job.requirements:
            job_keywords = ' '.join(job.requirements).lower()
            matching_skills = sum(1 for skill in profile.skills
                                if skill.lower() in job_keywords)
            skill_score = matching_skills / max(len(profile.skills), 1)
            score += skill_score
            factors += 1

        # Check location match
        if job.location.lower() in ' '.join(profile.target_locations).lower():
            score += 1.0
            factors += 1
        elif "remote" in job.location.lower() and profile.remote_only:
            score += 1.0
            factors += 1

        # Check role match
        if profile.target_roles:
            role_match = any(role.lower() in job.title.lower()
                           for role in profile.target_roles)
            if role_match:
                score += 1.0
            factors += 1

        # Check salary match
        if profile.min_salary and job.salary_range:
            # Simple check - would need better parsing in production
            if str(profile.min_salary) in job.salary_range:
                score += 0.8
            factors += 1

        # Calculate average
        return score / max(factors, 1)

    def _format_experience(self, experiences: List[Dict]) -> str:
        """Format experience entries for prompt."""
        if not experiences:
            return "See resume for details."

        formatted = []
        for exp in experiences:
            company = exp.get("company", "")
            title = exp.get("title", "")
            duration = exp.get("duration", "")
            formatted.append(f"{title} at {company} ({duration})")

        return "; ".join(formatted)


__all__ = ["ApplicationWriter", "ApplicationContent"]
