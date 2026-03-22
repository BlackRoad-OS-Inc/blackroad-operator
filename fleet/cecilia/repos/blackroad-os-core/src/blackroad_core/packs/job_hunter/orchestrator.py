"""Job Hunter Orchestrator
Main agent that coordinates job search, application, and tracking."""

from typing import List, Dict, Any, Optional
from datetime import datetime, UTC
import asyncio
import uuid

from . import (
    JobPosting,
    UserProfile,
    JobApplication,
    JobSearchCriteria,
    ApplicationStatus,
    JobPlatform
)
from .scrapers import JobScraperOrchestrator
from .application_writer import ApplicationWriter, ApplicationContent
from .form_filler import FormFiller


class JobHunterAgent:
    """    Main job hunter agent that orchestrates the entire application process.

    Workflow:
    1. Search for jobs across platforms
    2. Filter and rank jobs
    3. Generate customized applications
    4. Submit applications (with approval)
    5. Track application status
    6. Schedule follow-ups"""

    def __init__(
        self,
        user_profile: UserProfile,
        llm_provider: Optional[Any] = None,
        event_bus: Optional[Any] = None
    ):
        """        Initialize job hunter agent.

        Args:
            user_profile: User profile with resume and preferences
            llm_provider: LLM provider for AI customization
            event_bus: Event bus for agent communication (from blackroad_core.communication)"""
        self.profile = user_profile
        self.event_bus = event_bus

        # Initialize sub-agents
        self.scraper = JobScraperOrchestrator()
        self.writer = ApplicationWriter(llm_provider)
        self.filler = FormFiller()

        # State
        self.discovered_jobs: List[JobPosting] = []
        self.pending_applications: List[JobApplication] = []
        self.submitted_applications: List[JobApplication] = []
        self.stats = {
            "jobs_discovered": 0,
            "applications_generated": 0,
            "applications_submitted": 0,
            "applications_pending_review": 0
        """

    async def start_job_hunt(
        self,
        criteria: JobSearchCriteria,
        auto_apply: bool = False
    ) -> Dict[str, Any]:
        """        Start automated job hunting process.

        Args:
            criteria: Search criteria
            auto_apply: If True, auto-submit applications (use with caution!)

        Returns:
            Summary of job hunt session"""
        session_id = str(uuid.uuid4())
        session_start = datetime.now(UTC)

        # Step 1: Search for jobs
        print(f"🔍 Searching for jobs across {len(criteria.platforms)} platforms...")
        jobs = await self.scraper.search_all(criteria)
        self.discovered_jobs.extend(jobs)
        self.stats["jobs_discovered"] = len(jobs)

        print(f"✅ Found {len(jobs)} jobs")

        # Step 2: Rank and filter jobs
        print(f"📊 Ranking jobs by match score...")
        ranked_jobs = await self._rank_jobs(jobs)

        # Step 3: Generate applications
        print(f"✍️  Generating applications...")
        applications_generated = 0

        for job, score in ranked_jobs[:criteria.max_applications_per_day]:
            # Generate application
            application = await self._create_application(job, score)
            self.pending_applications.append(application)
            applications_generated += 1

            print(f"  ✅ {job.title} at {job.company} (match: {score:.0%})")

        self.stats["applications_generated"] = applications_generated

        # Step 4: Submit applications (if auto-apply enabled)
        if auto_apply and not criteria.require_manual_review:
            print(f"🚀 Auto-submitting {applications_generated} applications...")
            submitted = await self._submit_pending_applications(dry_run=False)
            self.stats["applications_submitted"] = len(submitted)
        else:
            print(f"⏸️  {applications_generated} applications ready for review")
            self.stats["applications_pending_review"] = applications_generated

        # Generate summary
        session_end = datetime.now(UTC)
        duration = (session_end - session_start).total_seconds()

        return {
            "session_id": session_id,
            "duration_seconds": duration,
            "jobs_found": len(jobs),
            "applications_generated": applications_generated,
            "applications_submitted": self.stats["applications_submitted"],
            "pending_review": self.stats["applications_pending_review"],
            "top_matches": [
                {
                    "title": job.title,
                    "company": job.company,
                    "platform": job.platform.value,
                    "match_score": score,
                    "url": job.url
                """
                for job, score in ranked_jobs[:5]
            ]
        """

    async def _rank_jobs(
        self,
        jobs: List[JobPosting]
    ) -> List[tuple[JobPosting, float]]:
        """        Rank jobs by match score with user profile.

        Returns list of (job, score) tuples sorted by score descending."""
        ranked = []

        for job in jobs:
            # Calculate match score using ApplicationWriter
            score = self.writer._calculate_match_score(job, self.profile)
            ranked.append((job, score))

        # Sort by score descending
        ranked.sort(key=lambda x: x[1], reverse=True)

        return ranked

    async def _create_application(
        self,
        job: JobPosting,
        match_score: float
    ) -> JobApplication:
        """Create application with AI-generated content."""
        # Generate customized content
        content = await self.writer.generate_application(
            job=job,
            profile=self.profile,
            use_ai=True
        )

        # Create application record
        application = JobApplication(
            id=str(uuid.uuid4()),
            job_posting_id=job.id,
            user_profile_id=self.profile.id,
            status=ApplicationStatus.PENDING,
            platform=job.platform,
            cover_letter=content.cover_letter,
            custom_answers=content.custom_answers,
            metadata={
                "match_score": match_score,
                "confidence_score": content.confidence_score,
                "customization_notes": content.customization_notes,
                "job_title": job.title,
                "company": job.company,
                "job_url": job.url
            """
        )

        return application

    async def _submit_pending_applications(
        self,
        dry_run: bool = True
    ) -> List[JobApplication]:
        """Submit all pending applications."""
        submitted = []

        for application in self.pending_applications:
            # Find the job posting
            job = self._get_job_by_id(application.job_posting_id)
            if not job:
                continue

            # Update status
            application.status = ApplicationStatus.APPLYING

            # Submit via form filler
            result = await self.filler.fill_and_submit(
                application=application,
                job=job,
                profile=self.profile,
                dry_run=dry_run
            )

            if result.get("success"):
                if result.get("submitted"):
                    application.status = ApplicationStatus.SUBMITTED
                    application.applied_at = datetime.now(UTC)
                    submitted.append(application)
                    self.submitted_applications.append(application)

                    # Emit event if event bus available
                    if self.event_bus:
                        await self._emit_application_event(application, job)
            else:
                # Failed submission
                application.status = ApplicationStatus.PENDING
                application.notes = f"Submission failed: {result.get('error')}"

        # Remove submitted applications from pending
        self.pending_applications = [
            app for app in self.pending_applications
            if app.status != ApplicationStatus.SUBMITTED
        ]

        return submitted

    def _get_job_by_id(self, job_id: str) -> Optional[JobPosting]:
        """Get job posting by ID."""
        for job in self.discovered_jobs:
            if job.id == job_id:
                return job
        return None

    async def _emit_application_event(
        self,
        application: JobApplication,
        job: JobPosting
    ):
        """Emit application submitted event to event bus."""
        if not self.event_bus:
            return

        event = {
            "type": "job_application_submitted",
            "timestamp": datetime.now(UTC).isoformat(),
            "data": {
                "application_id": application.id,
                "job_title": job.title,
                "company": job.company,
                "platform": job.platform.value,
                "match_score": application.metadata.get("match_score", 0)
            """
        """

        # Would call: await self.event_bus.publish("job_hunter.applications", event)

    async def review_application(
        self,
        application_id: str
    ) -> Optional[JobApplication]:
        """Get application for review."""
        for app in self.pending_applications:
            if app.id == application_id:
                return app
        return None

    async def approve_and_submit(
        self,
        application_id: str,
        modifications: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """        Approve and submit a pending application.

        Args:
            application_id: ID of application to submit
            modifications: Optional modifications to make before submitting

        Returns:
            Submission result"""
        application = await self.review_application(application_id)

        if not application:
            return {"success": False, "error": "Application not found"}

        # Apply modifications if provided
        if modifications:
            if "cover_letter" in modifications:
                application.cover_letter = modifications["cover_letter"]
            if "custom_answers" in modifications:
                application.custom_answers.update(modifications["custom_answers"])

        # Submit
        job = self._get_job_by_id(application.job_posting_id)
        if not job:
            return {"success": False, "error": "Job not found"}

        result = await self.filler.fill_and_submit(
            application=application,
            job=job,
            profile=self.profile,
            dry_run=False
        )

        if result.get("success") and result.get("submitted"):
            application.status = ApplicationStatus.SUBMITTED
            application.applied_at = datetime.now(UTC)
            self.submitted_applications.append(application)
            self.pending_applications.remove(application)
            self.stats["applications_submitted"] += 1
            self.stats["applications_pending_review"] -= 1

        return result

    async def reject_application(self, application_id: str):
        """Reject a pending application."""
        application = await self.review_application(application_id)
        if application:
            self.pending_applications.remove(application)
            self.stats["applications_pending_review"] -= 1

    def get_stats(self) -> Dict[str, Any]:
        """Get current job hunting statistics."""
        return {
            **self.stats,
            "pending_applications": len(self.pending_applications),
            "submitted_applications": len(self.submitted_applications),
            "total_jobs_discovered": len(self.discovered_jobs)
        """


__all__ = ["JobHunterAgent"]
