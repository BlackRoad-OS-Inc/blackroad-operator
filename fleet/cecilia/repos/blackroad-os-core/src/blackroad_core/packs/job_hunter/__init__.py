"""Pack: Job Hunter
Automated job application system with AI-powered customization.

Agents:
- job-scraper: Searches job platforms (LinkedIn, Indeed, ZipRecruiter, Glassdoor)
- application-writer: AI-powered cover letter and response customization
- form-filler: Automated form submission
- tracker: Application status monitoring and follow-ups"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from datetime import datetime, UTC
from enum import Enum


class JobPlatform(Enum):
    """Supported job platforms."""
    LINKEDIN = "linkedin"
    INDEED = "indeed"
    ZIPRECRUITER = "ziprecruiter"
    GLASSDOOR = "glassdoor"
    CUSTOM = "custom"


class ApplicationStatus(Enum):
    """Job application status."""
    PENDING = "pending"
    APPLYING = "applying"
    SUBMITTED = "submitted"
    VIEWED = "viewed"
    INTERVIEWING = "interviewing"
    REJECTED = "rejected"
    ACCEPTED = "accepted"
    WITHDRAWN = "withdrawn"


@dataclass
class JobPosting:
    """Represents a job posting."""
    id: str
    platform: JobPlatform
    title: str
    company: str
    location: str
    url: str
    description: str
    requirements: List[str] = field(default_factory=list)
    salary_range: Optional[str] = None
    posted_date: Optional[datetime] = None
    scraped_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class UserProfile:
    """User profile for job applications."""
    id: str
    full_name: str
    email: str
    phone: str
    location: str

    # Resume data
    resume_url: str
    resume_text: str

    # Profile sections
    summary: str
    skills: List[str] = field(default_factory=list)
    experience: List[Dict[str, Any]] = field(default_factory=list)
    education: List[Dict[str, Any]] = field(default_factory=list)

    # Application preferences
    target_roles: List[str] = field(default_factory=list)
    target_locations: List[str] = field(default_factory=list)
    target_companies: List[str] = field(default_factory=list)
    excluded_companies: List[str] = field(default_factory=list)
    min_salary: Optional[int] = None
    remote_only: bool = False

    # Templates
    cover_letter_template: str = ""
    custom_answers: Dict[str, str] = field(default_factory=dict)


@dataclass
class JobApplication:
    """Represents a job application."""
    id: str
    job_posting_id: str
    user_profile_id: str

    status: ApplicationStatus
    platform: JobPlatform

    # Application content
    cover_letter: str
    custom_answers: Dict[str, str] = field(default_factory=dict)

    # Tracking
    applied_at: Optional[datetime] = None
    last_updated: datetime = field(default_factory=lambda: datetime.now(UTC))
    follow_up_dates: List[datetime] = field(default_factory=list)

    # Results
    response_received: bool = False
    interview_scheduled: bool = False
    notes: str = ""

    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class JobSearchCriteria:
    """Search criteria for job hunting."""
    keywords: List[str] = field(default_factory=list)
    locations: List[str] = field(default_factory=list)
    platforms: List[JobPlatform] = field(default_factory=lambda: [
        JobPlatform.LINKEDIN,
        JobPlatform.INDEED,
        JobPlatform.ZIPRECRUITER,
        JobPlatform.GLASSDOOR
    ])

    # Filters
    remote_only: bool = False
    min_salary: Optional[int] = None
    max_days_old: int = 7
    exclude_companies: List[str] = field(default_factory=list)

    # Application settings
    auto_apply: bool = False
    max_applications_per_day: int = 10
    require_manual_review: bool = True


__all__ = [
    "JobPlatform",
    "ApplicationStatus",
    "JobPosting",
    "UserProfile",
    "JobApplication",
    "JobSearchCriteria"
]
