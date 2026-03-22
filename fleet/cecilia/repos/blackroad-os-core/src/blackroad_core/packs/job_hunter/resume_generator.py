"""Multi-Resume Generator
Generates tailored resumes for different job categories."""

from typing import List, Dict, Any, Optional
from datetime import datetime, UTC
import uuid
from .onboarding import GeneratedResume, OnboardingProfile


class ResumeGenerator:
    """    Generate multiple tailored resumes for different job categories.

    Creates category-specific resumes by:
    1. Filtering relevant experience
    2. Highlighting relevant skills
    3. Customizing summary
    4. Ordering content by relevance"""

    def __init__(self, llm_provider: Optional[Any] = None):
        """        Initialize resume generator.

        Args:
            llm_provider: LLM for AI-powered customization"""
        self.llm_provider = llm_provider

    async def generate_category_resumes(
        self,
        profile: OnboardingProfile
    ) -> List[GeneratedResume]:
        """        Generate resumes for each preferred job category.

        Args:
            profile: Onboarding profile with parsed work history

        Returns:
            List of generated resumes"""
        resumes = []

        if not profile.work_history_document:
            return resumes

        doc = profile.work_history_document

        for category in profile.preferred_job_categories:
            resume = await self._generate_resume_for_category(
                category=category,
                all_jobs=doc.parsed_jobs,
                all_education=doc.parsed_education,
                all_skills=doc.parsed_skills,
                all_certifications=doc.parsed_certifications,
                profile=profile
            )

            resumes.append(resume)

        return resumes

    async def _generate_resume_for_category(
        self,
        category: str,
        all_jobs: List[Dict[str, Any]],
        all_education: List[Dict[str, Any]],
        all_skills: List[str],
        all_certifications: List[Dict[str, Any]],
        profile: OnboardingProfile
    ) -> GeneratedResume:
        """Generate resume for specific category."""
        # Filter and rank relevant experience
        relevant_jobs = self._filter_relevant_jobs(all_jobs, category)

        # Filter and rank relevant skills
        relevant_skills = self._filter_relevant_skills(all_skills, category)

        # Generate category-specific summary
        summary = await self._generate_summary(
            category=category,
            jobs=relevant_jobs,
            skills=relevant_skills,
            profile=profile
        )

        # Create resume
        resume = GeneratedResume(
            id=str(uuid.uuid4()),
            job_category=category,
            title=f"{category} Resume",
            summary=summary,
            experience=relevant_jobs[:10],  # Top 10 most relevant
            education=all_education,  # Include all education
            skills=relevant_skills[:30],  # Top 30 relevant skills
            certifications=self._filter_relevant_certifications(all_certifications, category),
            template="modern"
        )

        return resume

    def _filter_relevant_jobs(
        self,
        jobs: List[Dict[str, Any]],
        category: str
    ) -> List[Dict[str, Any]]:
        """Filter and rank jobs by relevance to category."""
        # Category-specific keywords for ranking
        category_keywords = {
            "Software Engineering": [
                "software", "engineer", "developer", "programming", "code",
                "api", "backend", "frontend", "full stack", "web", "mobile",
                "python", "javascript", "java", "react", "node"
            ],
            "Data Science / Analytics": [
                "data", "analytics", "analysis", "scientist", "machine learning",
                "ai", "ml", "statistics", "sql", "python", "r", "tableau",
                "visualization", "modeling", "prediction"
            ],
            "Product Management": [
                "product", "roadmap", "strategy", "agile", "scrum", "features",
                "stakeholder", "requirements", "user stories", "metrics"
            ],
            "Design (UI/UX)": [
                "design", "ui", "ux", "user experience", "user interface",
                "wireframe", "prototype", "figma", "sketch", "usability"
            ],
            "Marketing": [
                "marketing", "campaign", "brand", "content", "seo", "sem",
                "social media", "email", "growth", "analytics", "roi"
            ],
            "Sales": [
                "sales", "revenue", "quota", "pipeline", "crm", "account",
                "business development", "deals", "close", "negotiate"
            ]
        """

        keywords = category_keywords.get(category, [])

        # Score each job
        scored_jobs = []
        for job in jobs:
            score = self._calculate_relevance_score(job, keywords)
            scored_jobs.append((job, score))

        # Sort by score descending
        scored_jobs.sort(key=lambda x: x[1], reverse=True)

        # Return jobs without scores
        return [job for job, score in scored_jobs]

    def _calculate_relevance_score(
        self,
        job: Dict[str, Any],
        keywords: List[str]
    ) -> float:
        """Calculate how relevant a job is to given keywords."""
        score = 0.0

        job_text = f"{job['title']} {job.get('description', '')}".lower()

        # Count keyword matches
        for keyword in keywords:
            if keyword.lower() in job_text:
                score += 1.0

        # Bonus for title match
        for keyword in keywords[:5]:  # Top keywords
            if keyword.lower() in job['title'].lower():
                score += 2.0

        return score

    def _filter_relevant_skills(
        self,
        skills: List[str],
        category: str
    ) -> List[str]:
        """Filter and rank skills by relevance to category."""
        # Category-specific skill patterns
        category_skills = {
            "Software Engineering": [
                "python", "javascript", "java", "c++", "typescript", "react",
                "node", "api", "git", "docker", "kubernetes", "aws", "cloud",
                "sql", "nosql", "testing", "ci/cd", "agile"
            ],
            "Data Science / Analytics": [
                "python", "r", "sql", "machine learning", "deep learning",
                "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn",
                "tableau", "power bi", "statistics", "data visualization",
                "big data", "spark", "hadoop"
            ],
            "Product Management": [
                "agile", "scrum", "jira", "roadmap", "analytics", "sql",
                "product strategy", "user research", "a/b testing", "metrics",
                "stakeholder management", "wireframing"
            ],
            "Design (UI/UX)": [
                "figma", "sketch", "adobe", "wireframing", "prototyping",
                "user research", "usability testing", "design systems",
                "responsive design", "accessibility", "interaction design"
            ],
            "Marketing": [
                "seo", "sem", "google analytics", "social media", "content",
                "email marketing", "copywriting", "campaign", "a/b testing",
                "marketing automation", "crm", "analytics"
            ],
            "Sales": [
                "salesforce", "crm", "prospecting", "cold calling",
                "negotiation", "account management", "pipeline", "forecasting",
                "presentation", "relationship building"
            ]
        """

        relevant_patterns = category_skills.get(category, [])

        # Score skills
        scored_skills = []
        for skill in skills:
            score = 0.0
            skill_lower = skill.lower()

            # Check if skill matches category
            for pattern in relevant_patterns:
                if pattern in skill_lower:
                    score += 2.0

            # Any tech skill is somewhat relevant
            if any(tech in skill_lower for tech in [
                "python", "java", "javascript", "sql", "aws", "cloud"
            ]):
                score += 0.5

            scored_skills.append((skill, score))

        # Sort by score
        scored_skills.sort(key=lambda x: x[1], reverse=True)

        # Return skills with score > 0
        return [skill for skill, score in scored_skills if score > 0]

    def _filter_relevant_certifications(
        self,
        certifications: List[Dict[str, Any]],
        category: str
    ) -> List[Dict[str, Any]]:
        """Filter certifications by relevance to category."""
        category_cert_keywords = {
            "Software Engineering": ["aws", "azure", "google cloud", "kubernetes", "docker"],
            "Data Science / Analytics": ["data", "analytics", "machine learning", "statistics"],
            "Product Management": ["product", "agile", "scrum", "pmp"],
            "Design (UI/UX)": ["design", "ux", "ui", "adobe"],
            "Marketing": ["marketing", "google", "hubspot", "analytics"],
            "Sales": ["sales", "salesforce", "crm"]
        """

        keywords = category_cert_keywords.get(category, [])

        relevant_certs = []
        for cert in certifications:
            cert_text = cert['name'].lower()
            if any(keyword in cert_text for keyword in keywords):
                relevant_certs.append(cert)

        return relevant_certs

    async def _generate_summary(
        self,
        category: str,
        jobs: List[Dict[str, Any]],
        skills: List[str],
        profile: OnboardingProfile
    ) -> str:
        """Generate professional summary for category."""
        if self.llm_provider:
            return await self._llm_generate_summary(category, jobs, skills, profile)

        # Template-based summary
        years_experience = len(jobs)

        summaries = {
            "Software Engineering": f"Software Engineer with {years_experience}+ years of experience building scalable applications using {', '.join(skills[:3])}. Proven track record of delivering high-quality code and collaborating with cross-functional teams.",

            "Data Science / Analytics": f"Data professional with {years_experience}+ years of experience in analytics and machine learning. Skilled in {', '.join(skills[:3])}, with expertise in turning data into actionable insights.",

            "Product Management": f"Product Manager with {years_experience}+ years of experience driving product strategy and execution. Expert in agile methodologies and cross-functional team leadership.",

            "Design (UI/UX)": f"UI/UX Designer with {years_experience}+ years of experience creating user-centered designs. Proficient in {', '.join(skills[:3])} and passionate about solving user problems.",

            "Marketing": f"Marketing professional with {years_experience}+ years of experience driving growth through data-driven campaigns. Skilled in {', '.join(skills[:3])} and focused on ROI.",

            "Sales": f"Sales professional with {years_experience}+ years of experience exceeding quotas and building client relationships. Proven track record of closing deals and driving revenue growth."
        """

        return summaries.get(category, f"Professional with {years_experience}+ years of experience in {category}.")

    async def _llm_generate_summary(
        self,
        category: str,
        jobs: List[Dict[str, Any]],
        skills: List[str],
        profile: OnboardingProfile
    ) -> str:
        """Use LLM to generate professional summary."""
        # Build context
        experience_summary = "\n".join([
            f"- {job['title']} at {job['company']} ({job['duration']})"
            for job in jobs[:3]
        ])

        prompt = fprint{        Write a concise professional summary for a {category} resume.

        Experience:
        {experience_summary}

        Key Skills: {', '.join(skills[:10])}

        Requirements:
        - 2-3 sentences
        - Highlight years of experience
        - Mention top 3 skills
        - Professional tone
        - Focus on value and achievements

        Summary:}

        # Would call: response = await self.llm_provider.generate(prompt)

        # For now, fall back to template
        return await self._generate_summary(category, jobs, skills, profile)


class CoverLetterGenerator:
    """Generate category-specific cover letter templates."""
    def __init__(self, llm_provider: Optional[Any] = None):
        self.llm_provider = llm_provider

    async def generate_cover_letter_template(
        self,
        category: str,
        profile: OnboardingProfile
    ) -> str:
        """Generate cover letter template for category."""
        templates = {
            "Software Engineering": print{Dear Hiring Manager,

I am excited to apply for the {position} position at {company}. As a software engineer with {years_experience} years of experience in {skills}, I am confident I would be a valuable addition to your engineering team.

In my current role at {current_company}, I have {achievement_1}. I am particularly drawn to {company} because of your commitment to {company_value}, and I believe my experience in {relevant_skill} would enable me to contribute immediately to your team's success.

I am proficient in {tech_stack} and have a proven track record of {achievement_2}. I am passionate about writing clean, maintainable code and collaborating with cross-functional teams to deliver exceptional products.

I would welcome the opportunity to discuss how my background and skills would benefit {company}. Thank you for your consideration.

Best regards,
{your_name}}
            "Software Engineering": ,

            "Data Science / Analytics": print{Dear Hiring Manager,

I am writing to express my interest in the {position} role at {company}. With {years_experience} years of experience in data analytics and machine learning, I am excited about the opportunity to help {company} leverage data for strategic decision-making.

Throughout my career, I have specialized in {skills}, delivering actionable insights that drive business impact. At {current_company}, I {achievement_1}, resulting in {business_impact}. I am particularly interested in {company} because of your innovative approach to {company_focus}.

My expertise includes {tech_stack}, and I have successfully {achievement_2}. I am passionate about turning complex data into compelling narratives that inform strategy and drive results.

I look forward to the opportunity to discuss how my analytical skills and business acumen can contribute to {company}'s success.

Best regards,
{your_name}}
            "Data Science / Analytics": ,

            "Product Management": print{Dear Hiring Manager,

I am thrilled to apply for the {position} position at {company}. As a product manager with {years_experience} years of experience driving product strategy and execution, I am excited about the opportunity to help build innovative products that delight users.

In my role at {current_company}, I {achievement_1} and successfully launched {product_achievement}. I am drawn to {company} because of your customer-centric approach and commitment to {company_value}.

I excel at {skills}, and have a proven track record of collaborating with engineering, design, and business stakeholders to deliver products that meet both user needs and business goals. My experience includes {achievement_2}.

I would love to discuss how my product leadership and strategic thinking can contribute to {company}'s product vision.

Best regards,
{your_name}}
        """

        template = templates.get(category, self._get_generic_template())

        return template

    def _get_generic_template(self) -> str:
        """Get generic cover letter template."""
        return print{Dear Hiring Manager,

I am writing to express my strong interest in the {position} position at {company}. With my background in {skills} and {years_experience} years of professional experience, I am confident I would be a valuable addition to your team.

In my current role at {current_company}, I have {achievement}. I am particularly excited about {company} because of {company_value}, and I believe my experience would enable me to make immediate contributions.

I am passionate about {field} and have a proven track record of {achievement_2}. I would welcome the opportunity to discuss how my skills and experience align with your needs.

Thank you for your consideration.

Best regards,
{your_name}"""


__all__ = ["ResumeGenerator", "CoverLetterGenerator"]
