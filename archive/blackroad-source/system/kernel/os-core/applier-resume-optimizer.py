#!/usr/bin/env python3
"""
Resume Optimizer & ATS Checker

Features:
- ATS compatibility scoring
- Keyword optimization for job descriptions
- Format checking (ATS-friendly)
- Section completeness analysis
- Action verb strength scoring
- Quantification detection
- AI-powered improvement suggestions
- Multiple resume variants for different roles
- PDF parsing and analysis
"""

import json
import os
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from collections import Counter

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False


@dataclass
class ATSScore:
    """ATS compatibility score."""
    overall_score: int  # 0-100

    # Component scores
    format_score: int = 0
    keyword_score: int = 0
    section_score: int = 0
    readability_score: int = 0

    # Issues
    critical_issues: List[str] = None
    warnings: List[str] = None
    suggestions: List[str] = None

    # Keyword analysis
    matched_keywords: List[str] = None
    missing_keywords: List[str] = None
    keyword_density: float = 0.0

    # Format issues
    has_tables: bool = False
    has_images: bool = False
    has_headers_footers: bool = False
    has_columns: bool = False

    def __post_init__(self):
        if self.critical_issues is None:
            self.critical_issues = []
        if self.warnings is None:
            self.warnings = []
        if self.suggestions is None:
            self.suggestions = []
        if self.matched_keywords is None:
            self.matched_keywords = []
        if self.missing_keywords is None:
            self.missing_keywords = []


@dataclass
class ResumeAnalysis:
    """Complete resume analysis."""
    resume_path: str
    analyzed_at: str

    # Content
    text: str
    word_count: int

    # Sections detected
    sections: Dict[str, str] = None

    # ATS score
    ats_score: ATSScore = None

    # Improvements
    ai_suggestions: str = ""
    optimized_version: str = ""

    # Metadata
    job_title_target: str = ""
    job_description: str = ""

    def __post_init__(self):
        if self.sections is None:
            self.sections = {}


class ResumeOptimizer:
    """Resume optimizer and ATS checker."""

    # Strong action verbs
    STRONG_ACTION_VERBS = {
        "achieved", "accelerated", "accomplished", "acquired", "advanced",
        "analyzed", "architected", "automated", "built", "created",
        "delivered", "designed", "developed", "drove", "enhanced",
        "engineered", "established", "executed", "expanded", "generated",
        "grew", "implemented", "improved", "increased", "innovated",
        "launched", "led", "managed", "optimized", "orchestrated",
        "pioneered", "produced", "reduced", "resolved", "scaled",
        "spearheaded", "streamlined", "strengthened", "transformed"
    }

    # Weak verbs to avoid
    WEAK_VERBS = {
        "did", "made", "worked", "helped", "responsible for",
        "duties included", "was", "were", "am", "is"
    }

    # Required sections
    REQUIRED_SECTIONS = [
        "experience", "education", "skills"
    ]

    # Optional but recommended sections
    RECOMMENDED_SECTIONS = [
        "summary", "projects", "certifications", "awards"
    ]

    def __init__(self, api_key: Optional[str] = None):
        """Initialize resume optimizer."""
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if self.api_key and ANTHROPIC_AVAILABLE:
            self.client = anthropic.Anthropic(api_key=self.api_key)
        else:
            self.client = None

        self.data_dir = Path.home() / ".applier" / "resume_optimizer"
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def analyze_resume(
        self,
        resume_path: str,
        job_description: str = "",
        job_title: str = ""
    ) -> ResumeAnalysis:
        """Analyze resume for ATS compatibility."""

        print(f"📄 Analyzing resume: {resume_path}")

        # Parse resume
        text = self._parse_resume(resume_path)

        if not text:
            raise ValueError("Could not parse resume. Ensure it's a .txt or .pdf file")

        # Detect sections
        sections = self._detect_sections(text)

        # Calculate ATS score
        ats_score = self._calculate_ats_score(text, sections, job_description)

        # Create analysis
        analysis = ResumeAnalysis(
            resume_path=resume_path,
            analyzed_at=datetime.now().isoformat(),
            text=text,
            word_count=len(text.split()),
            sections=sections,
            ats_score=ats_score,
            job_title_target=job_title,
            job_description=job_description
        )

        # Get AI suggestions
        if self.client:
            analysis.ai_suggestions = self._get_ai_suggestions(analysis)
            analysis.optimized_version = self._generate_optimized_resume(analysis)

        # Save analysis
        self._save_analysis(analysis)

        return analysis

    def _parse_resume(self, resume_path: str) -> str:
        """Parse resume from file."""

        path = Path(resume_path)

        if not path.exists():
            raise FileNotFoundError(f"Resume not found: {resume_path}")

        # Text file
        if path.suffix == ".txt":
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()

        # PDF file
        elif path.suffix == ".pdf":
            if not PDF_AVAILABLE:
                raise ImportError("PyPDF2 not installed. Run: pip install PyPDF2")

            text = ""
            with open(path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text()

            return text

        else:
            raise ValueError(f"Unsupported file format: {path.suffix}")

    def _detect_sections(self, text: str) -> Dict[str, str]:
        """Detect resume sections."""

        sections = {}

        # Common section headers
        section_patterns = {
            "summary": r"(?:summary|profile|objective)",
            "experience": r"(?:experience|employment|work history)",
            "education": r"(?:education|academic)",
            "skills": r"(?:skills|technical skills|core competencies)",
            "projects": r"(?:projects|portfolio)",
            "certifications": r"(?:certifications|licenses)",
            "awards": r"(?:awards|honors|achievements)",
        }

        lines = text.split('\n')
        current_section = None
        current_content = []

        for line in lines:
            line_lower = line.lower().strip()

            # Check if this is a section header
            is_header = False
            for section_name, pattern in section_patterns.items():
                if re.match(pattern, line_lower):
                    # Save previous section
                    if current_section:
                        sections[current_section] = '\n'.join(current_content)

                    # Start new section
                    current_section = section_name
                    current_content = []
                    is_header = True
                    break

            # Add to current section
            if not is_header and current_section:
                current_content.append(line)

        # Save last section
        if current_section:
            sections[current_section] = '\n'.join(current_content)

        return sections

    def _calculate_ats_score(
        self,
        text: str,
        sections: Dict[str, str],
        job_description: str
    ) -> ATSScore:
        """Calculate ATS compatibility score."""

        score = ATSScore(overall_score=0)

        # 1. Format score (0-25 points)
        score.format_score = self._check_format(text, score)

        # 2. Section score (0-25 points)
        score.section_score = self._check_sections(sections, score)

        # 3. Keyword score (0-25 points)
        if job_description:
            score.keyword_score = self._check_keywords(text, job_description, score)
        else:
            score.keyword_score = 20  # Default if no JD

        # 4. Readability score (0-25 points)
        score.readability_score = self._check_readability(text, score)

        # Overall score
        score.overall_score = (
            score.format_score +
            score.section_score +
            score.keyword_score +
            score.readability_score
        )

        return score

    def _check_format(self, text: str, score: ATSScore) -> int:
        """Check format compatibility (0-25 points)."""

        points = 25

        # Check for tables (bad for ATS)
        if re.search(r'\|.*\|', text):
            score.has_tables = True
            score.critical_issues.append("Tables detected - ATS cannot parse tables")
            points -= 10

        # Check for special characters that might indicate images/graphics
        special_char_ratio = len(re.findall(r'[^\w\s\-\.,;:()\[\]{}]', text)) / len(text)
        if special_char_ratio > 0.05:
            score.warnings.append("High special character count - may indicate formatting issues")
            points -= 5

        # Check length (1-2 pages ideal)
        word_count = len(text.split())
        if word_count < 200:
            score.warnings.append("Resume too short (< 200 words)")
            points -= 5
        elif word_count > 1000:
            score.warnings.append("Resume too long (> 1000 words)")
            points -= 3

        # Check for bullet points
        if not re.search(r'[•\-\*]', text):
            score.suggestions.append("Add bullet points for better readability")
            points -= 2

        return max(0, points)

    def _check_sections(self, sections: Dict[str, str], score: ATSScore) -> int:
        """Check section completeness (0-25 points)."""

        points = 25

        # Required sections
        for section in self.REQUIRED_SECTIONS:
            if section not in sections:
                score.critical_issues.append(f"Missing required section: {section}")
                points -= 8

        # Recommended sections
        for section in self.RECOMMENDED_SECTIONS:
            if section not in sections:
                score.suggestions.append(f"Consider adding: {section} section")

        # Check if sections have content
        for section_name, content in sections.items():
            if len(content.strip()) < 20:
                score.warnings.append(f"{section_name} section is very short")
                points -= 2

        return max(0, points)

    def _check_keywords(
        self,
        text: str,
        job_description: str,
        score: ATSScore
    ) -> int:
        """Check keyword matching (0-25 points)."""

        # Extract keywords from job description
        jd_words = re.findall(r'\b[a-zA-Z]{3,}\b', job_description.lower())
        jd_counter = Counter(jd_words)

        # Filter to important keywords (appear 2+ times)
        important_keywords = [
            word for word, count in jd_counter.items()
            if count >= 2 and word not in {'the', 'and', 'for', 'with', 'you', 'our', 'will', 'are'}
        ]

        # Check resume for keywords
        resume_lower = text.lower()

        for keyword in important_keywords[:20]:  # Check top 20 keywords
            if keyword in resume_lower:
                score.matched_keywords.append(keyword)
            else:
                score.missing_keywords.append(keyword)

        # Calculate match rate
        if important_keywords:
            match_rate = len(score.matched_keywords) / len(important_keywords[:20])
            score.keyword_density = match_rate
            points = int(match_rate * 25)
        else:
            points = 20  # Default

        # Add suggestions for missing keywords
        if score.missing_keywords[:5]:
            score.suggestions.append(
                f"Add these keywords: {', '.join(score.missing_keywords[:5])}"
            )

        return points

    def _check_readability(self, text: str, score: ATSScore) -> int:
        """Check readability and impact (0-25 points)."""

        points = 25

        # Check for action verbs
        text_lower = text.lower()
        strong_verb_count = sum(
            1 for verb in self.STRONG_ACTION_VERBS
            if verb in text_lower
        )

        weak_verb_count = sum(
            1 for verb in self.WEAK_VERBS
            if verb in text_lower
        )

        if strong_verb_count < 5:
            score.warnings.append("Use more strong action verbs")
            points -= 5

        if weak_verb_count > 3:
            score.warnings.append("Avoid weak verbs like 'did', 'made', 'helped'")
            points -= 3

        # Check for quantification (numbers)
        numbers = re.findall(r'\d+', text)
        if len(numbers) < 3:
            score.suggestions.append("Add more quantifiable achievements (numbers, percentages)")
            points -= 5

        # Check for buzzwords without substance
        buzzwords = ['innovative', 'dynamic', 'results-driven', 'team player']
        buzzword_count = sum(1 for word in buzzwords if word in text_lower)
        if buzzword_count > 3:
            score.warnings.append("Too many buzzwords - focus on concrete achievements")
            points -= 3

        return max(0, points)

    def _get_ai_suggestions(self, analysis: ResumeAnalysis) -> str:
        """Get AI-powered improvement suggestions."""

        prompt = f"""Analyze this resume and provide specific, actionable improvement suggestions.

RESUME:
{analysis.text[:3000]}

ATS SCORE: {analysis.ats_score.overall_score}/100

ISSUES:
{chr(10).join('- ' + issue for issue in analysis.ats_score.critical_issues + analysis.ats_score.warnings)}

TARGET ROLE: {analysis.job_title_target or 'General'}

Provide:
1. TOP 3 IMPROVEMENTS - Most impactful changes
2. KEYWORD OPTIMIZATION - Specific keywords to add
3. BULLET POINT REWRITES - Rewrite 2-3 weak bullet points using STAR method
4. FORMATTING FIXES - Specific formatting changes

Be specific and actionable. Format with markdown."""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2000,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text.strip()
        except Exception as e:
            return f"AI suggestions not available: {e}"

    def _generate_optimized_resume(self, analysis: ResumeAnalysis) -> str:
        """Generate optimized resume version."""

        if not self.client:
            return ""

        prompt = f"""Optimize this resume for ATS systems and the target role.

ORIGINAL RESUME:
{analysis.text[:4000]}

TARGET ROLE: {analysis.job_title_target or 'General'}
JOB DESCRIPTION: {analysis.job_description[:1000] if analysis.job_description else 'N/A'}

Create an optimized version that:
1. Uses ATS-friendly formatting (no tables, clean structure)
2. Includes relevant keywords naturally
3. Uses strong action verbs
4. Quantifies achievements
5. Follows this structure:
   - Summary (2-3 sentences)
   - Experience (with strong bullets)
   - Skills
   - Education

Return ONLY the optimized resume text, no commentary."""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=3000,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text.strip()
        except Exception as e:
            return f"Optimization failed: {e}"

    def _save_analysis(self, analysis: ResumeAnalysis):
        """Save analysis to file."""

        filename = f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = self.data_dir / filename

        # Convert to dict
        data = asdict(analysis)
        data['ats_score'] = asdict(analysis.ats_score)

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

        print(f"\n💾 Analysis saved: {filepath}")

    def print_report(self, analysis: ResumeAnalysis):
        """Print analysis report."""

        score = analysis.ats_score

        # Color code score
        if score.overall_score >= 80:
            score_color = '\033[92m'  # Green
            rating = "EXCELLENT"
        elif score.overall_score >= 60:
            score_color = '\033[93m'  # Yellow
            rating = "GOOD"
        else:
            score_color = '\033[91m'  # Red
            rating = "NEEDS WORK"

        print(f"""
{'='*60}
📊 ATS COMPATIBILITY REPORT
{'='*60}

{score_color}OVERALL SCORE: {score.overall_score}/100 - {rating}\033[0m

BREAKDOWN:
  Format:      {score.format_score}/25
  Sections:    {score.section_score}/25
  Keywords:    {score.keyword_score}/25
  Readability: {score.readability_score}/25

{'='*60}
""")

        # Critical issues
        if score.critical_issues:
            print("🚨 CRITICAL ISSUES (fix immediately):\n")
            for issue in score.critical_issues:
                print(f"  ❌ {issue}")
            print()

        # Warnings
        if score.warnings:
            print("⚠️  WARNINGS:\n")
            for warning in score.warnings:
                print(f"  ⚠️  {warning}")
            print()

        # Suggestions
        if score.suggestions:
            print("💡 SUGGESTIONS:\n")
            for suggestion in score.suggestions:
                print(f"  💡 {suggestion}")
            print()

        # Keyword analysis
        if score.matched_keywords:
            print(f"✅ MATCHED KEYWORDS ({len(score.matched_keywords)}):")
            print(f"  {', '.join(score.matched_keywords[:10])}")
            if len(score.matched_keywords) > 10:
                print(f"  ... and {len(score.matched_keywords) - 10} more")
            print()

        if score.missing_keywords:
            print(f"❌ MISSING KEYWORDS ({len(score.missing_keywords)}):")
            print(f"  {', '.join(score.missing_keywords[:10])}")
            if len(score.missing_keywords) > 10:
                print(f"  ... and {len(score.missing_keywords) - 10} more")
            print()

        # AI suggestions
        if analysis.ai_suggestions:
            print("🤖 AI IMPROVEMENT SUGGESTIONS:\n")
            print(analysis.ai_suggestions)
            print()

        print("="*60)


# CLI
def main():
    """CLI for resume optimizer."""

    import argparse

    parser = argparse.ArgumentParser(description="Resume Optimizer & ATS Checker")
    parser.add_argument("resume", help="Path to resume (.txt or .pdf)")
    parser.add_argument("--job-description", help="Job description file")
    parser.add_argument("--job-title", help="Target job title")
    parser.add_argument("--save-optimized", action="store_true",
                        help="Save optimized version")

    args = parser.parse_args()

    # Load job description
    job_description = ""
    if args.job_description:
        with open(args.job_description, 'r') as f:
            job_description = f.read()

    # Analyze
    optimizer = ResumeOptimizer()
    analysis = optimizer.analyze_resume(
        resume_path=args.resume,
        job_description=job_description,
        job_title=args.job_title or ""
    )

    # Print report
    optimizer.print_report(analysis)

    # Save optimized version
    if args.save_optimized and analysis.optimized_version:
        output_path = Path(args.resume).parent / "resume_optimized.txt"
        with open(output_path, 'w') as f:
            f.write(analysis.optimized_version)
        print(f"\n✅ Optimized resume saved: {output_path}")

    return 0


if __name__ == "__main__":
    exit(main())
