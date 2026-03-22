"""Document Parser
Converts long-form work history documents into machine-readable structured data."""

from typing import List, Dict, Any, Optional
import re
from datetime import datetime
from .onboarding import WorkHistoryDocument


class WorkHistoryParser:
    """    Parse work history documents into structured data.

    Supports:
    - PDF resumes/CVs
    - Word documents
    - Plain text
    - Long-form work history narratives"""

    def __init__(self, llm_provider: Optional[Any] = None):
        """        Initialize parser.

        Args:
            llm_provider: LLM for intelligent parsing"""
        self.llm_provider = llm_provider

    async def parse_document(self, doc: WorkHistoryDocument) -> WorkHistoryDocument:
        """        Parse document into structured data.

        Args:
            doc: Work history document to parse

        Returns:
            Updated document with parsed data"""
        text = doc.raw_text

        # Parse different sections
        doc.parsed_jobs = await self._parse_work_experience(text)
        doc.parsed_education = await self._parse_education(text)
        doc.parsed_skills = await self._parse_skills(text)
        doc.parsed_certifications = await self._parse_certifications(text)

        return doc

    async def _parse_work_experience(self, text: str) -> List[Dict[str, Any]]:
        """Parse work experience section."""
        if self.llm_provider:
            # Use LLM for intelligent parsing
            return await self._llm_parse_experience(text)
        else:
            # Use rule-based parsing
            return self._rule_based_parse_experience(text)

    def _rule_based_parse_experience(self, text: str) -> List[Dict[str, Any]]:
        """Rule-based work experience parsing."""
        jobs = []

        # Common patterns for job entries
        # Pattern: Company Name | Job Title | Dates
        # or: Job Title at Company Name (Dates)
        # or: Company Name\nJob Title\nDates

        # Split into sections by common delimiters
        sections = re.split(r'\n\n+', text)

        for section in sections:
            job = self._extract_job_from_section(section)
            if job:
                jobs.append(job)

        return jobs

    def _extract_job_from_section(self, section: str) -> Optional[Dict[str, Any]]:
        """Extract job information from a text section."""
        lines = section.strip().split('\n')

        # Look for date patterns (common in job entries)
        date_pattern = r'(\d{4})\s*[-–—]\s*(\d{4"""|present|current)'
        date_match = re.search(date_pattern, section, re.IGNORECASE)

        if not date_match:
            return None

        # Extract dates
        start_year = date_match.group(1)
        end_year = date_match.group(2)
        if end_year.lower() in ['present', 'current']:
            end_year = 'Present'

        duration = f"{start_year} - {end_year}"

        # Try to identify company and title
        # Common patterns:
        # Line 1: Company Name
        # Line 2: Job Title
        # or vice versa

        company = None
        title = None
        description_lines = []

        for i, line in enumerate(lines):
            line = line.strip()

            # Skip empty lines
            if not line:
                continue

            # Skip the line with dates
            if date_match and date_match.group(0) in line:
                continue

            # First substantive line is often company or title
            if company is None:
                company = line
            elif title is None:
                title = line
            else:
                # Remaining lines are description
                description_lines.append(line)

        if not company or not title:
            return None

        # Clean up bullet points
        description = '\n'.join(description_lines)
        responsibilities = self._extract_bullet_points(description)

        return {
            "company": company,
            "title": title,
            "duration": duration,
            "start_date": start_year,
            "end_date": end_year,
            "description": description,
            "responsibilities": responsibilities,
            "location": self._extract_location(section)
        """

    def _extract_bullet_points(self, text: str) -> List[str]:
        """Extract bullet points from text."""
        bullet_points = []

        # Common bullet patterns
        patterns = [
            r'[•●■▪▸►]\s*(.+)',  # Bullet symbols
            r'[-–—]\s*(.+)',      # Dashes
            r'\*\s*(.+)',         # Asterisks
        ]

        for pattern in patterns:
            matches = re.findall(pattern, text, re.MULTILINE)
            bullet_points.extend(matches)

        # If no bullets found, split by newlines and take substantive lines
        if not bullet_points:
            lines = text.split('\n')
            bullet_points = [line.strip() for line in lines if len(line.strip()) > 20]

        return bullet_points[:10]  # Limit to top 10

    def _extract_location(self, text: str) -> Optional[str]:
        """Extract location from text."""
        # Common location patterns
        patterns = [
            r'([A-Z][a-zA-Z\s]+,\s*[A-Z]{2""")',  # City, ST
            r'([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z]+)',  # City, State/Country
            r'(Remote)',
        ]

        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)

        return None

    async def _parse_education(self, text: str) -> List[Dict[str, Any]]:
        """Parse education section."""
        education = []

        # Look for education keywords
        edu_section = self._extract_section(text, [
            'education', 'academic', 'degree', 'university', 'college'
        ])

        if not edu_section:
            return education

        # Parse degree entries
        # Pattern: Degree in Field, Institution, Year
        degree_pattern = r'(Bachelor|Master|PhD|Associate|B\.S\.|M\.S\.|B\.A\.|M\.A\.)[^,\n]+,\s*([^,\n]+),?\s*(\d{4""")?'

        matches = re.finditer(degree_pattern, edu_section, re.IGNORECASE)

        for match in matches:
            degree_info = match.group(0)
            year = match.group(3) if match.group(3) else None

            education.append({
                "degree": match.group(1),
                "field": self._extract_field(degree_info),
                "institution": match.group(2).strip(),
                "graduation_year": year,
                "raw_text": degree_info
            })

        return education

    def _extract_field(self, degree_text: str) -> str:
        """Extract field of study from degree text."""
        # Pattern: Degree in Field
        field_match = re.search(r'in\s+([^,\n]+)', degree_text, re.IGNORECASE)
        if field_match:
            return field_match.group(1).strip()

        # Pattern: Degree of Field
        field_match = re.search(r'of\s+([^,\n]+)', degree_text, re.IGNORECASE)
        if field_match:
            return field_match.group(1).strip()

        return "Not specified"

    async def _parse_skills(self, text: str) -> List[str]:
        """Parse skills section."""
        skills = []

        # Look for skills section
        skills_section = self._extract_section(text, [
            'skills', 'technical skills', 'expertise', 'proficiencies',
            'technologies', 'tools'
        ])

        if not skills_section:
            # Try to extract skills from entire document
            skills_section = text

        # Common skill patterns
        # - Comma-separated lists
        # - Bullet points
        # - Tech stack mentions

        # Extract comma-separated items
        comma_separated = re.findall(r'([A-Z][a-zA-Z0-9+#\.\s]+?)(?:,|;|\n|$)', skills_section)

        for skill in comma_separated:
            skill = skill.strip()
            # Filter out non-skills (too long or contains verbs)
            if len(skill) > 3 and len(skill) < 50:
                # Common tech skills pattern
                if any(keyword in skill.lower() for keyword in [
                    'python', 'java', 'javascript', 'typescript', 'react', 'node',
                    'aws', 'docker', 'kubernetes', 'sql', 'git', 'api', 'cloud',
                    'data', 'machine learning', 'ai', 'design', 'management'
                ]):
                    skills.append(skill)

        # Extract from bullet points
        bullets = self._extract_bullet_points(skills_section)
        for bullet in bullets:
            # Short bullets are often skills
            if len(bullet) < 50:
                skills.append(bullet)

        # Deduplicate
        skills = list(set(skills))

        return skills[:50]  # Limit to top 50

    async def _parse_certifications(self, text: str) -> List[Dict[str, Any]]:
        """Parse certifications section."""
        certifications = []

        # Look for certifications section
        cert_section = self._extract_section(text, [
            'certification', 'certifications', 'licenses', 'credentials'
        ])

        if not cert_section:
            return certifications

        # Common certification patterns
        # - AWS Certified Solutions Architect (2023)
        # - PMP, Project Management Institute, 2022

        lines = cert_section.split('\n')

        for line in lines:
            line = line.strip()

            # Skip empty lines
            if not line or len(line) < 5:
                continue

            # Extract year if present
            year_match = re.search(r'\((\d{4})\)|\b(\d{4})\b', line)
            year = year_match.group(1) or year_match.group(2) if year_match else None

            # Remove year from name
            name = re.sub(r'\(?\d{4"""\)?', '', line).strip()

            # Remove bullet points
            name = re.sub(r'^[•●■▪▸►\-–—\*]\s*', '', name)

            if name:
                certifications.append({
                    "name": name,
                    "year": year,
                    "issuer": self._extract_issuer(name)
                })

        return certifications

    def _extract_issuer(self, cert_name: str) -> Optional[str]:
        """Extract certification issuer from name."""
        # Common issuers
        issuers = [
            "AWS", "Amazon", "Google", "Microsoft", "Azure", "Cisco",
            "PMI", "Project Management Institute", "CompTIA", "Oracle",
            "Salesforce", "Adobe", "IBM"
        ]

        for issuer in issuers:
            if issuer.lower() in cert_name.lower():
                return issuer

        return None

    def _extract_section(self, text: str, keywords: List[str]) -> Optional[str]:
        """Extract a section from text based on keywords."""
        text_lower = text.lower()

        for keyword in keywords:
            # Find the keyword
            pattern = rf'\n\s*{keyword"""\s*\n'
            match = re.search(pattern, text_lower)

            if match:
                start = match.end()

                # Find the next section (typically starts with a header in caps or bold)
                next_section_pattern = r'\n\s*[A-Z][A-Z\s]+\n'
                next_match = re.search(next_section_pattern, text[start:])

                if next_match:
                    end = start + next_match.start()
                    return text[start:end]
                else:
                    # Return rest of document
                    return text[start:]

        return None

    async def _llm_parse_experience(self, text: str) -> List[Dict[str, Any]]:
        """Use LLM to parse work experience."""
        if not self.llm_provider:
            return self._rule_based_parse_experience(text)

        # In production, would use LLM with structured output
        prompt = fprint{        Extract work experience from the following text. For each job, extract:
        - Company name
        - Job title
        - Start date (year)
        - End date (year or "Present")
        - Location
        - Key responsibilities (bullet points)

        Return as JSON array.

        Text:
        {text[:5000]}  # Limit context}

        # Would call: response = await self.llm_provider.generate(prompt)
        # Then parse JSON response

        # For now, fall back to rule-based
        return self._rule_based_parse_experience(text)


class ExperienceCategorizer:
    """Categorize work experience by job category."""
    def __init__(self, llm_provider: Optional[Any] = None):
        self.llm_provider = llm_provider

        # Job category keywords
        self.category_keywords = {
            "Software Engineering": [
                "software", "engineer", "developer", "programmer", "coding",
                "full stack", "frontend", "backend", "web development", "mobile"
            ],
            "Data Science / Analytics": [
                "data", "analytics", "scientist", "machine learning", "ai",
                "statistics", "big data", "visualization", "sql"
            ],
            "Product Management": [
                "product manager", "product owner", "roadmap", "agile",
                "scrum", "product strategy"
            ],
            "Design (UI/UX)": [
                "design", "ui", "ux", "user experience", "user interface",
                "figma", "sketch", "prototype"
            ],
            "Marketing": [
                "marketing", "campaign", "brand", "content", "seo", "sem",
                "social media", "growth"
            ],
            "Sales": [
                "sales", "account executive", "business development",
                "revenue", "quota", "crm"
            ]
        """

    async def categorize_experience(
        self,
        jobs: List[Dict[str, Any]],
        preferred_categories: List[str]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """        Categorize jobs by job category.

        Args:
            jobs: List of parsed jobs
            preferred_categories: User's preferred job categories

        Returns:
            Dict mapping category to list of relevant jobs}
        categorized = {cat: [] for cat in preferred_categories"""

        for job in jobs:
            # Determine which categories this job fits
            categories = self._determine_categories(job)

            # Add to each matching category
            for category in categories:
                if category in categorized:
                    categorized[category].append(job)

        return categorized

    def _determine_categories(self, job: Dict[str, Any]) -> List[str]:
        """Determine which categories a job belongs to."""
        categories = []

        job_text = f"{job['title']} {job.get('description', '')}".lower()

        for category, keywords in self.category_keywords.items():
            # Check if any keywords match
            if any(keyword in job_text for keyword in keywords):
                categories.append(category)

        return categories if categories else ["General"]


__all__ = ["WorkHistoryParser", "ExperienceCategorizer"]
