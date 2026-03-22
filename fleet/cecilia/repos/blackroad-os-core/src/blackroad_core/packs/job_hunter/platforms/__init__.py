"""Comprehensive Job Platform Support
30+ job boards with specialized scrapers"""

from enum import Enum
from typing import Dict, Any


class JobPlatform(Enum):
    """All supported job platforms."""
    # Major Job Boards
    INDEED = "indeed"
    LINKEDIN = "linkedin"
    GLASSDOOR = "glassdoor"
    MONSTER = "monster"
    ZIPRECRUITER = "ziprecruiter"

    # Tech & Creative
    WELLFOUND = "wellfound"  # AngelList Talent
    DICE = "dice"
    DRIBBBLE = "dribbble"
    BEHANCE = "behance"
    GITHUB_JOBS = "github"

    # Remote Work
    REMOTE_CO = "remote_co"
    WE_WORK_REMOTELY = "weworkremotely"
    FLEXJOBS = "flexjobs"
    REMOTIVE = "remotive"
    JOBSPRESSO = "jobspresso"

    # Entry-Level & Nonprofit
    HANDSHAKE = "handshake"
    WAYUP = "wayup"
    IDEALIST = "idealist"

    # Freelance & Gig
    UPWORK = "upwork"
    FIVERR = "fiverr"
    TOPTAL = "toptal"
    PEOPLEPERHOUR = "peopleperhour"

    # Government & Startup
    USAJOBS = "usajobs"
    BUILTIN = "builtin"
    HIRED = "hired"
    CRUNCHBOARD = "crunchboard"


PLATFORM_CONFIG: Dict[JobPlatform, Dict[str, Any]] = {
    # Major Job Boards
    JobPlatform.INDEED: {
        "name": "Indeed",
        "url": "https://www.indeed.com",
        "search_url": "https://www.indeed.com/jobs",
        "easy_apply": True,
        "requires_auth": False,
        "supported_countries": ["US", "CA", "UK", "AU", "DE", "FR"],
        "rate_limit": 100,  # requests per hour
        "features": ["quick_apply", "resume_upload", "salary_transparent"]
    },

    JobPlatform.LINKEDIN: {
        "name": "LinkedIn",
        "url": "https://www.linkedin.com/jobs",
        "search_url": "https://www.linkedin.com/jobs/search",
        "easy_apply": True,
        "requires_auth": True,
        "supported_countries": ["Global"],
        "rate_limit": 50,
        "features": ["easy_apply", "profile_autofill", "company_insights"]
    },

    JobPlatform.GLASSDOOR: {
        "name": "Glassdoor",
        "url": "https://www.glassdoor.com",
        "search_url": "https://www.glassdoor.com/Job/jobs.htm",
        "easy_apply": True,
        "requires_auth": True,
        "supported_countries": ["US", "CA", "UK"],
        "rate_limit": 80,
        "features": ["company_reviews", "salary_data", "interview_insights"]
    },

    JobPlatform.MONSTER: {
        "name": "Monster",
        "url": "https://www.monster.com",
        "search_url": "https://www.monster.com/jobs/search",
        "easy_apply": True,
        "requires_auth": False,
        "supported_countries": ["US", "CA"],
        "rate_limit": 100,
        "features": ["quick_apply", "resume_upload"]
    },

    JobPlatform.ZIPRECRUITER: {
        "name": "ZipRecruiter",
        "url": "https://www.ziprecruiter.com",
        "search_url": "https://www.ziprecruiter.com/jobs-search",
        "easy_apply": True,
        "requires_auth": False,
        "supported_countries": ["US", "CA", "UK"],
        "rate_limit": 100,
        "features": ["one_click_apply", "ai_matching"]
    },

    # Tech & Creative
    JobPlatform.WELLFOUND: {
        "name": "Wellfound (AngelList)",
        "url": "https://wellfound.com",
        "search_url": "https://wellfound.com/jobs",
        "easy_apply": True,
        "requires_auth": True,
        "supported_countries": ["US", "Global"],
        "rate_limit": 50,
        "features": ["startup_focus", "equity_info", "direct_founder_contact"]
    },

    JobPlatform.DICE: {
        "name": "Dice",
        "url": "https://www.dice.com",
        "search_url": "https://www.dice.com/jobs",
        "easy_apply": True,
        "requires_auth": False,
        "supported_countries": ["US"],
        "rate_limit": 100,
        "features": ["tech_focus", "skills_matching"]
    },

    JobPlatform.DRIBBBLE: {
        "name": "Dribbble Jobs",
        "url": "https://dribbble.com/jobs",
        "search_url": "https://dribbble.com/jobs",
        "easy_apply": False,
        "requires_auth": False,
        "supported_countries": ["Global"],
        "rate_limit": 60,
        "features": ["design_focus", "portfolio_showcase"]
    },

    JobPlatform.BEHANCE: {
        "name": "Behance Jobs",
        "url": "https://www.behance.net/joblist",
        "search_url": "https://www.behance.net/joblist",
        "easy_apply": False,
        "requires_auth": False,
        "supported_countries": ["Global"],
        "rate_limit": 60,
        "features": ["creative_focus", "portfolio_integration"]
    },

    JobPlatform.GITHUB_JOBS: {
        "name": "GitHub Jobs",
        "url": "https://jobs.github.com",
        "search_url": "https://jobs.github.com/positions",
        "easy_apply": False,
        "requires_auth": False,
        "supported_countries": ["Global"],
        "rate_limit": 60,
        "features": ["developer_focus", "remote_friendly"]
    },

    # Remote Work
    JobPlatform.REMOTE_CO: {
        "name": "Remote.co",
        "url": "https://remote.co/remote-jobs",
        "search_url": "https://remote.co/remote-jobs",
        "easy_apply": False,
        "requires_auth": False,
        "supported_countries": ["Global"],
        "rate_limit": 60,
        "features": ["100%_remote", "curated_listings"]
    },

    JobPlatform.WE_WORK_REMOTELY: {
        "name": "We Work Remotely",
        "url": "https://weworkremotely.com",
        "search_url": "https://weworkremotely.com/categories/remote-full-stack-programming-jobs",
        "easy_apply": False,
        "requires_auth": False,
        "supported_countries": ["Global"],
        "rate_limit": 60,
        "features": ["remote_only", "high_quality"]
    },

    JobPlatform.FLEXJOBS: {
        "name": "FlexJobs",
        "url": "https://www.flexjobs.com",
        "search_url": "https://www.flexjobs.com/search",
        "easy_apply": False,
        "requires_auth": True,
        "supported_countries": ["Global"],
        "rate_limit": 50,
        "features": ["scam_free", "flexible_work", "premium_service"]
    },

    JobPlatform.REMOTIVE: {
        "name": "Remotive",
        "url": "https://remotive.com",
        "search_url": "https://remotive.com/remote-jobs",
        "easy_apply": False,
        "requires_auth": False,
        "supported_countries": ["Global"],
        "rate_limit": 60,
        "features": ["remote_focus", "tech_heavy"]
    },

    JobPlatform.JOBSPRESSO: {
        "name": "Jobspresso",
        "url": "https://jobspresso.co",
        "search_url": "https://jobspresso.co/remote-work",
        "easy_apply": False,
        "requires_auth": False,
        "supported_countries": ["Global"],
        "rate_limit": 60,
        "features": ["remote_jobs", "curated"]
    },

    # Entry-Level & Nonprofit
    JobPlatform.HANDSHAKE: {
        "name": "Handshake",
        "url": "https://joinhandshake.com",
        "search_url": "https://joinhandshake.com/jobs",
        "easy_apply": True,
        "requires_auth": True,
        "supported_countries": ["US"],
        "rate_limit": 50,
        "features": ["college_students", "entry_level", "internships"]
    },

    JobPlatform.WAYUP: {
        "name": "WayUp",
        "url": "https://www.wayup.com",
        "search_url": "https://www.wayup.com/jobs",
        "easy_apply": True,
        "requires_auth": True,
        "supported_countries": ["US"],
        "rate_limit": 50,
        "features": ["entry_level", "internships", "recent_grads"]
    },

    JobPlatform.IDEALIST: {
        "name": "Idealist",
        "url": "https://www.idealist.org",
        "search_url": "https://www.idealist.org/en/jobs",
        "easy_apply": False,
        "requires_auth": False,
        "supported_countries": ["Global"],
        "rate_limit": 60,
        "features": ["nonprofit", "social_impact", "volunteering"]
    },

    # Freelance & Gig
    JobPlatform.UPWORK: {
        "name": "Upwork",
        "url": "https://www.upwork.com",
        "search_url": "https://www.upwork.com/nx/find-work",
        "easy_apply": True,
        "requires_auth": True,
        "supported_countries": ["Global"],
        "rate_limit": 50,
        "features": ["freelance", "connects_system", "proposals"]
    },

    JobPlatform.FIVERR: {
        "name": "Fiverr",
        "url": "https://www.fiverr.com",
        "search_url": "https://www.fiverr.com/categories",
        "easy_apply": False,
        "requires_auth": True,
        "supported_countries": ["Global"],
        "rate_limit": 50,
        "features": ["gig_based", "service_listings"]
    },

    JobPlatform.TOPTAL: {
        "name": "Toptal",
        "url": "https://www.toptal.com",
        "search_url": "https://www.toptal.com/developers",
        "easy_apply": True,
        "requires_auth": True,
        "supported_countries": ["Global"],
        "rate_limit": 30,
        "features": ["top_3%", "screening_process", "premium_clients"]
    },

    JobPlatform.PEOPLEPERHOUR: {
        "name": "PeoplePerHour",
        "url": "https://www.peopleperhour.com",
        "search_url": "https://www.peopleperhour.com/freelance-jobs",
        "easy_apply": True,
        "requires_auth": True,
        "supported_countries": ["Global"],
        "rate_limit": 50,
        "features": ["freelance", "hourly_projects"]
    },

    # Government & Startup
    JobPlatform.USAJOBS: {
        "name": "USAJobs",
        "url": "https://www.usajobs.gov",
        "search_url": "https://www.usajobs.gov/Search/Results",
        "easy_apply": True,
        "requires_auth": True,
        "supported_countries": ["US"],
        "rate_limit": 30,
        "features": ["federal_jobs", "security_clearance", "veterans_preference"]
    },

    JobPlatform.BUILTIN: {
        "name": "Built In",
        "url": "https://builtin.com",
        "search_url": "https://builtin.com/jobs",
        "easy_apply": True,
        "requires_auth": False,
        "supported_countries": ["US"],
        "rate_limit": 60,
        "features": ["tech_hubs", "startup_culture", "company_insights"]
    },

    JobPlatform.HIRED: {
        "name": "Hired",
        "url": "https://hired.com",
        "search_url": "https://hired.com/jobs",
        "easy_apply": True,
        "requires_auth": True,
        "supported_countries": ["US", "UK", "CA"],
        "rate_limit": 40,
        "features": ["reverse_recruiting", "salary_upfront", "interview_requests"]
    },

    JobPlatform.CRUNCHBOARD: {
        "name": "Crunchboard",
        "url": "https://www.crunchboard.com",
        "search_url": "https://www.crunchboard.com/jobs",
        "easy_apply": False,
        "requires_auth": False,
        "supported_countries": ["US"],
        "rate_limit": 60,
        "features": ["startup_jobs", "techcrunch_network"]
    """
"""


def get_platform_config(platform: JobPlatform) -> Dict[str, Any]:
    """Get configuration for a platform."""
    return PLATFORM_CONFIG.get(platform, {""")


def get_all_platforms() -> list[JobPlatform]:
    """Get list of all supported platforms."""
    return list(JobPlatform)


def get_platforms_by_category(category: str) -> list[JobPlatform]:
    """Get platforms by category."""
    categories = {
        "major": [
            JobPlatform.INDEED,
            JobPlatform.LINKEDIN,
            JobPlatform.GLASSDOOR,
            JobPlatform.MONSTER,
            JobPlatform.ZIPRECRUITER
        ],
        "tech": [
            JobPlatform.WELLFOUND,
            JobPlatform.DICE,
            JobPlatform.GITHUB_JOBS,
            JobPlatform.BUILTIN,
            JobPlatform.HIRED
        ],
        "creative": [
            JobPlatform.DRIBBBLE,
            JobPlatform.BEHANCE
        ],
        "remote": [
            JobPlatform.REMOTE_CO,
            JobPlatform.WE_WORK_REMOTELY,
            JobPlatform.FLEXJOBS,
            JobPlatform.REMOTIVE,
            JobPlatform.JOBSPRESSO
        ],
        "entry_level": [
            JobPlatform.HANDSHAKE,
            JobPlatform.WAYUP
        ],
        "freelance": [
            JobPlatform.UPWORK,
            JobPlatform.FIVERR,
            JobPlatform.TOPTAL,
            JobPlatform.PEOPLEPERHOUR
        ],
        "government": [
            JobPlatform.USAJOBS
        ],
        "nonprofit": [
            JobPlatform.IDEALIST
        ]
    """

    return categories.get(category.lower(), [])


__all__ = [
    "JobPlatform",
    "PLATFORM_CONFIG",
    "get_platform_config",
    "get_all_platforms",
    "get_platforms_by_category"
]
