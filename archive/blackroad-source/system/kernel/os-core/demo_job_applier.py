#!/usr/bin/env python3
"""Job Applier Demo Script
Demonstrates the complete job application automation system"""

import asyncio
import sys
import os
from datetime import datetime, UTC

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.blackroad_core.packs.job_hunter import (
    JobPosting,
    UserProfile,
    JobApplication,
    ApplicationStatus,
    JobPlatform
)
from src.blackroad_core.packs.job_hunter.application_writer import ApplicationWriter
from src.blackroad_core.packs.job_hunter.form_filler import FormFiller
from src.blackroad_core.packs.job_hunter.application_tracker import (
    ApplicationTracker,
    FailureReason,
    RetryConfig
)


def create_sample_profile() -> UserProfile:
    """Create a sample user profile."""
    return UserProfile(
        user_id="demo-user-123",
        full_name="Alex Johnson",
        email="alex.johnson@example.com",
        phone="+1-555-0199",
        location="San Francisco, CA",
        resume_url="https://example.com/resume.pdf",
        summary=(
            "Experienced Full Stack Software Engineer with 6 years of experience "
            "building scalable web applications. Expert in Python, JavaScript/TypeScript, "
            "React, and cloud technologies."
        ),
        skills=[
            "Python", "JavaScript", "TypeScript", "React", "Node.js",
            "PostgreSQL", "MongoDB", "AWS", "Docker", "Kubernetes",
            "FastAPI", "Django", "GraphQL", "Redis", "CI/CD"
        ],
        experience=[
            {
                "title": "Senior Software Engineer",
                "company": "TechCorp Inc",
                "duration": "2021-2024",
                "description": "Led development of microservices architecture serving 1M+ users"
            },
            {
                "title": "Software Engineer",
                "company": "StartupXYZ",
                "duration": "2019-2021",
                "description": "Built RESTful APIs and React frontends for B2B SaaS platform"
            },
            {
                "title": "Junior Developer",
                "company": "WebDev Agency",
                "duration": "2018-2019",
                "description": "Developed custom websites and web applications for clients"
            """
        ],
        education=[
            {
                "degree": "BS Computer Science",
                "school": "University of California, Berkeley",
                "year": 2018
            """
        ],
        target_roles=[
            "Senior Software Engineer",
            "Full Stack Engineer",
            "Backend Engineer",
            "Software Architect"
        ],
        target_locations=["San Francisco", "Remote", "Bay Area"],
        min_salary=150000,
        remote_only=False,
        cover_letter_template=(
            "Dear Hiring Manager,\n\n"
            "I am excited to apply for the {position} position at {company}. "
            "With {years} years of experience in software engineering and expertise in {skills}, "
            "I am confident I would be a valuable addition to your team.\n\n"
            "{summary}\n\n"
            "I am particularly drawn to {company}'s innovative approach to {industry}. "
            "My experience in {relevant_tech} aligns well with the requirements outlined in the job posting.\n\n"
            "I would welcome the opportunity to discuss how my skills and experience can contribute "
            "to {company}'s continued success.\n\n"
            "Thank you for your consideration.\n\n"
            "Sincerely,\n{your_name}"
        ),
        custom_answers={
            "why_interested": (
                "I'm passionate about solving complex technical problems and building products "
                "that make a real impact. {company}'s mission to {mission} resonates deeply with me."
            ),
            "why_company": (
                "I admire {company}'s commitment to innovation and engineering excellence. "
                "The opportunity to work with cutting-edge technologies and talented engineers "
                "is exactly what I'm looking for in my next role."
            ),
            "strengths": (
                "My key strengths include: (1) strong problem-solving and system design skills, "
                "(2) ability to mentor junior engineers and lead technical initiatives, "
                "(3) experience with full-stack development and cloud infrastructure"
            ),
            "availability": "I can start within 2-3 weeks of accepting an offer."
        """
    )


def create_sample_jobs() -> list[JobPosting]:
    """Create sample job postings."""
    return [
        JobPosting(
            id="job-linkedin-1",
            platform=JobPlatform.LINKEDIN,
            title="Senior Full Stack Engineer",
            company="Acme Corporation",
            location="San Francisco, CA (Hybrid)",
            url="https://linkedin.com/jobs/view/12345",
            description=(
                "We're seeking a Senior Full Stack Engineer to join our Platform team. "
                "You'll work on cutting-edge microservices architecture using Python, React, "
                "and Kubernetes. This role offers the opportunity to shape our technical direction "
                "and mentor junior engineers."
            ),
            requirements=[
                "5+ years of software engineering experience",
                "Strong proficiency in Python and JavaScript/TypeScript",
                "Experience with React and modern frontend frameworks",
                "PostgreSQL or similar database experience",
                "AWS or GCP cloud experience",
                "Strong system design skills"
            ],
            salary_range="$160,000 - $200,000",
            job_type="Full-time",
            posted_date="2025-12-14",
            scraped_at=datetime.now(UTC).isoformat()
        ),
        JobPosting(
            id="job-indeed-1",
            platform=JobPlatform.INDEED,
            title="Backend Engineer - Python",
            company="DataFlow Systems",
            location="Remote",
            url="https://indeed.com/viewjob?jk=67890",
            description=(
                "Join our backend team building high-performance data processing pipelines. "
                "You'll work with Python, FastAPI, PostgreSQL, and Redis to handle millions "
                "of events per day."
            ),
            requirements=[
                "4+ years of Python development",
                "Experience with FastAPI or Django",
                "Strong understanding of database optimization",
                "Experience with Redis or similar caching solutions",
                "Familiarity with Docker and CI/CD"
            ],
            salary_range="$140,000 - $170,000",
            job_type="Full-time",
            posted_date="2025-12-13",
            scraped_at=datetime.now(UTC).isoformat()
        ),
        JobPosting(
            id="job-glassdoor-1",
            platform=JobPlatform.GLASSDOOR,
            title="Software Architect",
            company="Enterprise Tech Solutions",
            location="San Francisco, CA",
            url="https://glassdoor.com/job-listing/98765",
            description=(
                "We're looking for an experienced Software Architect to lead technical design "
                "and architecture decisions for our enterprise platform. You'll work closely "
                "with engineering teams to design scalable, maintainable systems."
            ),
            requirements=[
                "8+ years of software engineering experience",
                "3+ years in architecture or technical leadership role",
                "Expertise in distributed systems design",
                "Strong knowledge of cloud architecture (AWS/GCP/Azure)",
                "Experience with microservices and event-driven architectures"
            ],
            salary_range="$180,000 - $220,000",
            job_type="Full-time",
            posted_date="2025-12-12",
            scraped_at=datetime.now(UTC).isoformat()
        )
    ]


async def demo_application_generation():
    """Demo: Generate customized applications."""
    print("\n" + "="*80)
    print("DEMO 1: Application Generation")
    print("="*80 + "\n")

    profile = create_sample_profile()
    jobs = create_sample_jobs()
    writer = ApplicationWriter()

    for job in jobs:
        print(f"\n📝 Generating application for: {job.title} at {job.company}")
        print(f"   Platform: {job.platform.value}")
        print(f"   Location: {job.location}")

        # Generate application
        content = await writer.generate_application(
            job=job,
            profile=profile,
            use_ai=False  # Using template for demo
        )

        print(f"\n   ✅ Generated application:")
        print(f"   - Cover letter: {len(content.cover_letter)} chars")
        print(f"   - Custom answers: {len(content.custom_answers)} fields")
        print(f"   - Match score: {content.confidence_score:.2%}")
        print(f"   - Notes: {content.customization_notes}")

        # Show preview of cover letter
        preview = content.cover_letter[:200] + "..." if len(content.cover_letter) > 200 else content.cover_letter
        print(f"\n   Cover Letter Preview:")
        print(f"   {preview}")


async def demo_form_filling():
    """Demo: Form filling simulation."""
    print("\n" + "="*80)
    print("DEMO 2: Form Filling (Dry Run)")
    print("="*80 + "\n")

    profile = create_sample_profile()
    jobs = create_sample_jobs()
    writer = ApplicationWriter()
    filler = FormFiller()

    for job in jobs[:2]:  # Just first 2 for demo
        print(f"\n🤖 Filling application form: {job.title} at {job.company}")

        # Generate content
        content = await writer.generate_application(job, profile, use_ai=False)

        # Create application object
        application = JobApplication(
            id=f"app-{job.id}",
            user_id=profile.user_id,
            job_id=job.id,
            status=ApplicationStatus.DRAFT,
            cover_letter=content.cover_letter,
            custom_answers=content.custom_answers,
            created_at=datetime.now(UTC).isoformat()
        )

        # Fill form (dry run)
        result = await filler.fill_and_submit(
            application=application,
            job=job,
            profile=profile,
            dry_run=True
        )

        if result["success"]:
            print(f"   ✅ Form filled successfully!")
            if "steps" in result:
                print(f"   - Steps completed: {len(result['steps'])}")
                for step in result["steps"]:
                    print(f"     • {step['step']}")
            print(f"   - Message: {result['message']}")
        else:
            print(f"   ❌ Form filling failed: {result.get('error')}")


async def demo_retry_tracking():
    """Demo: Application tracking with retry logic."""
    print("\n" + "="*80)
    print("DEMO 3: Application Tracking & Retry Logic")
    print("="*80 + "\n")

    # Create tracker with retry config
    retry_config = RetryConfig(
        max_retries=3,
        initial_delay_seconds=10.0,
        backoff_multiplier=2.0
    )
    tracker = ApplicationTracker(retry_config)

    # Simulate multiple application attempts
    print("📊 Simulating application attempts...\n")

    # Successful application
    attempt1 = tracker.start_attempt(
        application_id="app-001",
        job_id="job-linkedin-1",
        user_id="demo-user-123",
        platform="linkedin"
    )
    await asyncio.sleep(0.1)  # Simulate processing time
    tracker.record_success(attempt1, fields_filled=12)

    # Failed application with retry
    attempt2 = tracker.start_attempt(
        application_id="app-002",
        job_id="job-indeed-1",
        user_id="demo-user-123",
        platform="indeed",
        attempt_number=1
    )
    await asyncio.sleep(0.1)
    retry_attempt = tracker.record_failure(
        attempt2,
        failure_reason=FailureReason.NETWORK_ERROR,
        error_message="Connection timeout",
        fields_filled=3,
        fields_failed=1
    )

    if retry_attempt:
        print(f"   🔄 Retry scheduled: attempt #{retry_attempt.attempt_number}")
        print(f"   - Scheduled for: {retry_attempt.started_at}")

    # Failed application - no retry (CAPTCHA)
    attempt3 = tracker.start_attempt(
        application_id="app-003",
        job_id="job-glassdoor-1",
        user_id="demo-user-123",
        platform="glassdoor"
    )
    await asyncio.sleep(0.1)
    no_retry = tracker.record_failure(
        attempt3,
        failure_reason=FailureReason.CAPTCHA,
        error_message="CAPTCHA detected",
        fields_filled=5,
        fields_failed=0
    )

    if not no_retry:
        print(f"   ⛔ No retry scheduled (reason: {attempt3.failure_reason.value})")

    # Get insights
    print("\n📈 Application Insights:")
    insights = tracker.get_insights()

    print(f"\n   Total Applications: {insights['total_applications']}")
    print(f"   Total Attempts: {insights['total_attempts']}")

    print("\n   Platform Performance:")
    for platform, stats in insights["platforms"].items():
        print(f"   - {platform.upper()}:")
        print(f"     • Success rate: {stats['success_rate']}")
        print(f"     • Avg duration: {stats['average_duration']}")
        if stats['common_failures']:
            print(f"     • Common failures: {', '.join(stats['common_failures'][:2])}")

    if insights["recommendations"]:
        print("\n   💡 Recommendations:")
        for rec in insights["recommendations"]:
            print(f"   - {rec}")


async def demo_multi_platform_batch():
    """Demo: Batch application across multiple platforms."""
    print("\n" + "="*80)
    print("DEMO 4: Multi-Platform Batch Application")
    print("="*80 + "\n")

    profile = create_sample_profile()
    jobs = create_sample_jobs()
    writer = ApplicationWriter()
    filler = FormFiller()
    tracker = ApplicationTracker()

    print(f"🚀 Applying to {len(jobs)} jobs across {len(set(j.platform for j in jobs))} platforms\n")

    results = []

    for i, job in enumerate(jobs, 1):
        print(f"[{i}/{len(jobs)}] Processing: {job.title} ({job.platform.value})")

        # Start tracking
        attempt = tracker.start_attempt(
            application_id=f"batch-app-{i}",
            job_id=job.id,
            user_id=profile.user_id,
            platform=job.platform.value
        )

        try:
            # Generate application
            content = await writer.generate_application(job, profile, use_ai=False)

            # Create application
            application = JobApplication(
                id=f"batch-app-{i}",
                user_id=profile.user_id,
                job_id=job.id,
                status=ApplicationStatus.DRAFT,
                cover_letter=content.cover_letter,
                custom_answers=content.custom_answers
            )

            # Submit (dry run)
            result = await filler.fill_and_submit(
                application, job, profile, dry_run=True
            )

            if result["success"]:
                tracker.record_success(attempt, fields_filled=10)
                print(f"   ✅ Success - {result['message']}\n")
            else:
                tracker.record_failure(
                    attempt,
                    FailureReason.FORM_NOT_FOUND,
                    result.get("error", "Unknown error")
                )
                print(f"   ❌ Failed - {result.get('error')}\n")

            results.append((job, result["success"]))

        except Exception as e:
            tracker.record_failure(
                attempt,
                FailureReason.UNKNOWN,
                str(e)
            )
            print(f"   ❌ Error: {e}\n")
            results.append((job, False))

    # Summary
    print("\n" + "="*80)
    print("BATCH APPLICATION SUMMARY")
    print("="*80 + "\n")

    successful = sum(1 for _, success in results if success)
    print(f"✅ Successful: {successful}/{len(results)}")
    print(f"❌ Failed: {len(results) - successful}/{len(results)}")

    # Platform breakdown
    platform_results = {}
    for job, success in results:
        platform = job.platform.value
        if platform not in platform_results:
            platform_results[platform] = {"success": 0, "failed": 0}

        if success:
            platform_results[platform]["success"] += 1
        else:
            platform_results[platform]["failed"] += 1

    print("\nPlatform Breakdown:")
    for platform, counts in platform_results.items():
        total = counts["success"] + counts["failed"]
        rate = counts["success"] / total if total > 0 else 0
        print(f"  {platform.upper()}: {counts['success']}/{total} ({rate:.0%})")


async def main():
    """Run all demos."""
    print("\n" + "🎯"*40)
    print("JOB APPLIER SYSTEM - COMPLETE DEMONSTRATION")
    print("🎯"*40)

    try:
        await demo_application_generation()
        await asyncio.sleep(1)

        await demo_form_filling()
        await asyncio.sleep(1)

        await demo_retry_tracking()
        await asyncio.sleep(1)

        await demo_multi_platform_batch()

        print("\n" + "="*80)
        print("✨ ALL DEMOS COMPLETED SUCCESSFULLY!")
        print("="*80 + "\n")

    except KeyboardInterrupt:
        print("\n\n⚠️  Demo interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Demo error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
