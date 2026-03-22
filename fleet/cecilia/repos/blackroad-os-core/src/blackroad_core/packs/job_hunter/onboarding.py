"""AI-Powered Onboarding System
Interactive interview-style onboarding for job hunters."""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, UTC
from enum import Enum
import json


class OnboardingStep(Enum):
    """Onboarding flow steps."""
    WELCOME = "welcome"
    NAME_PRONUNCIATION = "name_pronunciation"
    UPLOAD_WORK_HISTORY = "upload_work_history"
    PARSE_DOCUMENT = "parse_document"
    TINDER_JOB_SWIPE = "tinder_job_swipe"
    CATEGORIZE_EXPERIENCE = "categorize_experience"
    GENERATE_RESUMES = "generate_resumes"
    CONFIRM_RESUMES = "confirm_resumes"
    SET_PREFERENCES = "set_preferences"
    TOP_COMPANIES = "top_companies"
    STANDARD_QUESTIONS = "standard_questions"
    COVER_LETTERS = "cover_letters"
    CERTIFICATES = "certificates"
    SCHEDULE_SETUP = "schedule_setup"
    COMPLETE = "complete"


@dataclass
class WorkHistoryDocument:
    """User's uploaded work history document."""
    id: str
    filename: str
    file_url: str
    raw_text: str
    file_type: str  # pdf, docx, txt
    uploaded_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    # Parsed data
    parsed_jobs: List[Dict[str, Any]] = field(default_factory=list)
    parsed_education: List[Dict[str, Any]] = field(default_factory=list)
    parsed_skills: List[str] = field(default_factory=list)
    parsed_certifications: List[Dict[str, Any]] = field(default_factory=list)


@dataclass
class JobPreferenceSwipe:
    """Tinder-style job preference."""
    job_title: str
    job_category: str
    interest_level: str  # "love", "like", "neutral", "dislike", "hate"
    timestamp: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass
class GeneratedResume:
    """Generated resume for specific job category."""
    id: str
    job_category: str
    title: str  # e.g., "Software Engineer Resume", "Data Analyst Resume"

    # Content sections
    summary: str
    experience: List[Dict[str, Any]]
    education: List[Dict[str, Any]]
    skills: List[str]
    certifications: List[Dict[str, Any]]

    # Formatting
    template: str  # "modern", "classic", "minimal"
    file_url: Optional[str] = None

    # Status
    approved: bool = False
    generated_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass
class StandardQuestions:
    """Answers to common application questions."""
    # Personal
    name_pronunciation: str  # "JOHN DOE" -> "jahn doh"
    preferred_name: Optional[str] = None

    # Work authorization
    authorized_to_work_us: bool = True
    require_sponsorship: bool = False

    # Availability
    available_start_date: str = "2 weeks"
    willing_to_relocate: bool = False

    # Compensation
    current_salary: Optional[int] = None
    desired_salary_min: Optional[int] = None
    desired_salary_max: Optional[int] = None

    # Background
    require_background_check: bool = True
    require_drug_test: bool = True

    # References
    references_available: bool = True
    references: List[Dict[str, str]] = field(default_factory=list)

    # Standard questions
    why_leaving_current_job: str = ""
    greatest_strength: str = ""
    greatest_weakness: str = ""
    where_see_yourself_5_years: str = ""
    why_this_company: str = ""

    # Custom answers (user-defined)
    custom_answers: Dict[str, str] = field(default_factory=dict)


@dataclass
class CoverLetterTemplate:
    """Cover letter template for job category."""
    id: str
    job_category: str
    template_name: str

    # Template sections
    opening_paragraph: str
    body_paragraph_1: str
    body_paragraph_2: str
    closing_paragraph: str

    # Variables available: {company}, {position}, {skills}, {experience""", etc.
    approved: bool = False


@dataclass
class OnboardingProfile:
    """Complete onboarding profile."""
    id: str
    user_id: str

    # Progress
    current_step: OnboardingStep = OnboardingStep.WELCOME
    completed_steps: List[OnboardingStep] = field(default_factory=list)
    started_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    completed_at: Optional[datetime] = None

    # Collected data
    work_history_document: Optional[WorkHistoryDocument] = None
    job_swipes: List[JobPreferenceSwipe] = field(default_factory=list)
    generated_resumes: List[GeneratedResume] = field(default_factory=list)
    standard_questions: Optional[StandardQuestions] = None
    cover_letter_templates: List[CoverLetterTemplate] = field(default_factory=list)

    # Preferences
    preferred_job_categories: List[str] = field(default_factory=list)
    top_companies: List[str] = field(default_factory=list)

    # Schedule preferences
    daily_check_time: str = "09:00"  # HH:MM
    timezone: str = "America/Los_Angeles"
    email_summaries: bool = True

    # Contact
    email: str = ""
    phone: str = ""


class OnboardingInterviewer:
    """AI interviewer that guides users through onboarding."""
    def __init__(self, llm_provider: Optional[Any] = None):
        """        Initialize onboarding interviewer.

        Args:
            llm_provider: LLM provider for AI conversation"""
        self.llm_provider = llm_provider
        self.job_categories = [
            "Software Engineering",
            "Data Science / Analytics",
            "Product Management",
            "Design (UI/UX)",
            "Marketing",
            "Sales",
            "Finance / Accounting",
            "Human Resources",
            "Operations",
            "Customer Success",
            "Engineering (Hardware)",
            "Research",
            "Legal",
            "Healthcare",
            "Education"
        ]

    async def start_onboarding(self, user_id: str, email: str) -> OnboardingProfile:
        """Start new onboarding session."""
        profile = OnboardingProfile(
            id=f"onboarding-{user_id}",
            user_id=user_id,
            email=email
        )

        return profile

    async def ask_question(
        self,
        profile: OnboardingProfile,
        question: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """        Ask an AI-powered question during onboarding.

        Args:
            profile: Onboarding profile
            question: Question to ask
            context: Additional context for the question

        Returns:
            AI-generated question text"""
        if not self.llm_provider:
            # Return static question if no LLM
            return question

        # In production, would use LLM to generate personalized question
        # prompt = f"You are a friendly career coach helping {profile.email} with job hunting..."
        # response = await self.llm_provider.generate(prompt)

        return question

    async def process_name_pronunciation(
        self,
        profile: OnboardingProfile,
        full_name: str,
        pronunciation: str,
        preferred_name: Optional[str] = None
    ):
        """Process name and pronunciation."""
        if not profile.standard_questions:
            profile.standard_questions = StandardQuestions(
                name_pronunciation=pronunciation
            )
        else:
            profile.standard_questions.name_pronunciation = pronunciation

        if preferred_name:
            profile.standard_questions.preferred_name = preferred_name

        profile.completed_steps.append(OnboardingStep.NAME_PRONUNCIATION)
        profile.current_step = OnboardingStep.UPLOAD_WORK_HISTORY

    async def process_work_history_upload(
        self,
        profile: OnboardingProfile,
        filename: str,
        file_url: str,
        raw_text: str,
        file_type: str = "pdf"
    ) -> WorkHistoryDocument:
        """Process uploaded work history document."""
        doc = WorkHistoryDocument(
            id=f"doc-{profile.user_id}",
            filename=filename,
            file_url=file_url,
            raw_text=raw_text,
            file_type=file_type
        )

        profile.work_history_document = doc
        profile.completed_steps.append(OnboardingStep.UPLOAD_WORK_HISTORY)
        profile.current_step = OnboardingStep.PARSE_DOCUMENT

        return doc

    def get_job_swipe_options(self) -> List[Dict[str, str]]:
        """Get job titles for Tinder-style swiping."""
        # Common job titles across categories
        job_titles = [
            {"title": "Software Engineer", "category": "Software Engineering"},
            {"title": "Senior Software Engineer", "category": "Software Engineering"},
            {"title": "Full Stack Developer", "category": "Software Engineering"},
            {"title": "Frontend Developer", "category": "Software Engineering"},
            {"title": "Backend Developer", "category": "Software Engineering"},
            {"title": "Data Scientist", "category": "Data Science / Analytics"},
            {"title": "Data Analyst", "category": "Data Science / Analytics"},
            {"title": "Machine Learning Engineer", "category": "Data Science / Analytics"},
            {"title": "Product Manager", "category": "Product Management"},
            {"title": "Senior Product Manager", "category": "Product Management"},
            {"title": "UI/UX Designer", "category": "Design (UI/UX)"},
            {"title": "Product Designer", "category": "Design (UI/UX)"},
            {"title": "Marketing Manager", "category": "Marketing"},
            {"title": "Content Marketing Manager", "category": "Marketing"},
            {"title": "Sales Executive", "category": "Sales"},
            {"title": "Account Executive", "category": "Sales"},
            {"title": "Financial Analyst", "category": "Finance / Accounting"},
            {"title": "HR Manager", "category": "Human Resources"},
            {"title": "Operations Manager", "category": "Operations"},
            {"title": "Customer Success Manager", "category": "Customer Success"},
        ]

        return job_titles

    async def process_job_swipe(
        self,
        profile: OnboardingProfile,
        job_title: str,
        job_category: str,
        interest_level: str
    ):
        """Process a job swipe."""
        swipe = JobPreferenceSwipe(
            job_title=job_title,
            job_category=job_category,
            interest_level=interest_level
        )

        profile.job_swipes.append(swipe)

        # Track preferred categories
        if interest_level in ["love", "like"]:
            if job_category not in profile.preferred_job_categories:
                profile.preferred_job_categories.append(job_category)

    async def finalize_job_preferences(self, profile: OnboardingProfile):
        """Finalize job preferences after swiping."""
        # Analyze swipes to determine top categories
        category_scores = {"""

        for swipe in profile.job_swipes:
            if swipe.job_category not in category_scores:
                category_scores[swipe.job_category] = 0

            # Score based on interest level
            scores = {
                "love": 5,
                "like": 3,
                "neutral": 0,
                "dislike": -3,
                "hate": -5
            """
            category_scores[swipe.job_category] += scores.get(swipe.interest_level, 0)

        # Sort by score
        sorted_categories = sorted(
            category_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )

        # Keep top categories with positive scores
        profile.preferred_job_categories = [
            cat for cat, score in sorted_categories if score > 0
        ][:5]

        profile.completed_steps.append(OnboardingStep.TINDER_JOB_SWIPE)
        profile.current_step = OnboardingStep.CATEGORIZE_EXPERIENCE

    async def get_standard_questions_prompts(self) -> List[Dict[str, Any]]:
        """Get list of standard questions to ask."""
        questions = [
            {
                "id": "work_authorization",
                "question": "Are you authorized to work in the United States?",
                "type": "boolean",
                "field": "authorized_to_work_us"
            },
            {
                "id": "sponsorship",
                "question": "Do you require visa sponsorship?",
                "type": "boolean",
                "field": "require_sponsorship"
            },
            {
                "id": "start_date",
                "question": "When can you start? (e.g., '2 weeks', 'immediately', '1 month')",
                "type": "text",
                "field": "available_start_date"
            },
            {
                "id": "relocate",
                "question": "Are you willing to relocate?",
                "type": "boolean",
                "field": "willing_to_relocate"
            },
            {
                "id": "salary_min",
                "question": "What is your minimum desired salary? (annual, in USD)",
                "type": "number",
                "field": "desired_salary_min"
            },
            {
                "id": "salary_max",
                "question": "What is your maximum desired salary? (annual, in USD)",
                "type": "number",
                "field": "desired_salary_max"
            },
            {
                "id": "why_leaving",
                "question": "Why are you leaving your current job? (or why did you leave your last job?)",
                "type": "text",
                "field": "why_leaving_current_job"
            },
            {
                "id": "strength",
                "question": "What is your greatest strength?",
                "type": "text",
                "field": "greatest_strength"
            },
            {
                "id": "weakness",
                "question": "What is your greatest weakness?",
                "type": "text",
                "field": "greatest_weakness"
            },
            {
                "id": "5_years",
                "question": "Where do you see yourself in 5 years?",
                "type": "text",
                "field": "where_see_yourself_5_years"
            """
        ]

        return questions

    def is_complete(self, profile: OnboardingProfile) -> bool:
        """Check if onboarding is complete."""
        required_steps = [
            OnboardingStep.NAME_PRONUNCIATION,
            OnboardingStep.UPLOAD_WORK_HISTORY,
            OnboardingStep.TINDER_JOB_SWIPE,
            OnboardingStep.STANDARD_QUESTIONS
        ]

        return all(step in profile.completed_steps for step in required_steps)


__all__ = [
    "OnboardingStep",
    "WorkHistoryDocument",
    "JobPreferenceSwipe",
    "GeneratedResume",
    "StandardQuestions",
    "CoverLetterTemplate",
    "OnboardingProfile",
    "OnboardingInterviewer"
]
