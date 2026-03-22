"""Job Hunter Pack - Demo Script
Demonstrates automated job hunting with BlackRoad OS agents."""

import asyncio
from datetime import datetime, UTC

# Import job hunter pack
from blackroad_core.packs.job_hunter import (
    UserProfile,
    JobSearchCriteria,
    JobPlatform,
    ApplicationStatus
)
from blackroad_core.packs.job_hunter.orchestrator import JobHunterAgent


async def main():
    """Run job hunter demo."""

    print("=" * 60)
    print("🎯 BlackRoad Job Hunter - Automated Job Application Demo")
    print("=" * 60)
    print()

    # Step 1: Create user profile
    print("📋 Creating user profile...")

    profile = UserProfile(
        id="user-001",
        full_name="Alex Johnson",
        email="alex.johnson@example.com",
        phone="+1-555-0123",
        location="San Francisco, CA",

        # Resume
        resume_url="https://example.com/resume.pdf",
        resume_text="Experienced software engineer with 5+ years in full-stack development...",

        # Profile
        summary="Passionate software engineer specializing in web technologies and cloud infrastructure. "
                "Experienced in TypeScript, Python, React, and AWS. Seeking opportunities to build "
                "scalable applications and lead technical initiatives.",

        skills=[
            "TypeScript", "Python", "React", "Node.js", "AWS",
            "PostgreSQL", "Docker", "Kubernetes", "CI/CD",
            "System Design", "API Design", "Agile"
        ],

        experience=[
            {
                "company": "Tech Corp",
                "title": "Senior Software Engineer",
                "duration": "2021 - Present",
                "location": "Remote",
                "description": "Lead engineer for cloud infrastructure",
                "highlights": [
                    "Built microservices architecture serving 1M+ users",
                    "Reduced API latency by 40%",
                    "Mentored junior engineers"
                ]
            },
            {
                "company": "Startup Inc",
                "title": "Full Stack Developer",
                "duration": "2019 - 2021",
                "location": "San Francisco, CA",
                "description": "Full-stack development for SaaS product"
            """
        ],

        education=[
            {
                "institution": "University of Technology",
                "degree": "Bachelor of Science",
                "field": "Computer Science",
                "graduation_date": "2019",
                "gpa": "3.8"
            """
        ],

        # Preferences
        target_roles=["Software Engineer", "Senior Engineer", "Tech Lead", "Full Stack Developer"],
        target_locations=["San Francisco", "Remote", "Bay Area"],
        target_companies=[],
        excluded_companies=["Company X", "Bad Corp"],
        min_salary=140000,
        remote_only=False,

        # Templates
        cover_letter_template=print{Dear Hiring Manager,

I am writing to express my strong interest in the {position} position at {company}. With my background in {skills} and proven track record of building scalable applications, I am confident I would be a valuable addition to your team.

{summary}

I am particularly excited about this opportunity at {company} because of your commitment to innovation and technical excellence. I would welcome the chance to discuss how my experience aligns with your needs.

Thank you for your consideration.

Best regards,
{your_name}
{your_email}
{your_phone}}
        cover_letter_template=,

        custom_answers={
            "why_interested": "I'm excited about the {position} role because it combines my passion for {skills} with the opportunity to work on challenging problems at scale.",
            "why_company": "{company} has always impressed me with its technical innovation and company culture.",
            "relevant_experience": "In my current role, I've built production systems serving millions of users, which has given me deep expertise in scalable architecture and cloud infrastructure.",
            "strengths": "My key strengths are system design, full-stack development, and cross-functional collaboration. I excel at translating business requirements into technical solutions.",
            "availability": "I can start within 2-4 weeks of accepting an offer."
        """
    )

    print(f"✅ Profile created for {profile.full_name}")
    print(f"   Skills: {', '.join(profile.skills[:5])}...")
    print(f"   Target roles: {', '.join(profile.target_roles)}")
    print()

    # Step 2: Configure search criteria
    print("🔍 Configuring job search criteria...")

    criteria = JobSearchCriteria(
        keywords=["Software Engineer", "Full Stack Developer", "Senior Engineer"],
        locations=["San Francisco", "Remote", "Bay Area"],
        platforms=[
            JobPlatform.LINKEDIN,
            JobPlatform.INDEED,
            JobPlatform.ZIPRECRUITER,
            JobPlatform.GLASSDOOR
        ],

        # Filters
        remote_only=False,
        min_salary=140000,
        max_days_old=7,
        exclude_companies=["Company X", "Bad Corp"],

        # Application settings
        auto_apply=False,  # Require manual review
        max_applications_per_day=10,
        require_manual_review=True
    )

    print(f"✅ Searching {len(criteria.platforms)} platforms")
    print(f"   Keywords: {', '.join(criteria.keywords)}")
    print(f"   Locations: {', '.join(criteria.locations)}")
    print(f"   Max applications/day: {criteria.max_applications_per_day}")
    print()

    # Step 3: Initialize job hunter agent
    print("🤖 Initializing Job Hunter agent...")

    # In production, would pass actual LLM provider and event bus
    agent = JobHunterAgent(
        user_profile=profile,
        llm_provider=None,  # Would use actual LLM provider
        event_bus=None  # Would use actual event bus
    )

    print("✅ Agent initialized")
    print()

    # Step 4: Start job hunt
    print("🚀 Starting automated job hunt...")
    print()

    session = await agent.start_job_hunt(
        criteria=criteria,
        auto_apply=False  # Don't auto-submit, require review
    )

    # Display results
    print()
    print("=" * 60)
    print("📊 Job Hunt Session Results")
    print("=" * 60)
    print()
    print(f"Session ID: {session['session_id']}")
    print(f"Duration: {session['duration_seconds']:.1f} seconds")
    print()
    print(f"Jobs found: {session['jobs_found']}")
    print(f"Applications generated: {session['applications_generated']}")
    print(f"Applications submitted: {session['applications_submitted']}")
    print(f"Pending review: {session['pending_review']}")
    print()

    # Show top matches
    if session['top_matches']:
        print("🎯 Top Job Matches:")
        print()
        for i, match in enumerate(session['top_matches'], 1):
            print(f"{i}. {match['title']} at {match['company']}")
            print(f"   Platform: {match['platform']}")
            print(f"   Match Score: {match['match_score']:.0%}")
            print(f"   URL: {match['url']}")
            print()

    # Step 5: Review pending applications
    if agent.pending_applications:
        print("=" * 60)
        print("📝 Reviewing Pending Applications")
        print("=" * 60)
        print()

        for i, app in enumerate(agent.pending_applications, 1):
            print(f"Application {i}/{len(agent.pending_applications)}")
            print(f"ID: {app.id}")
            print(f"Status: {app.status.value}")
            print(f"Match Score: {app.metadata.get('match_score', 0):.0%}")
            print()
            print("Cover Letter Preview:")
            print("-" * 60)
            preview = app.cover_letter[:300] + "..." if len(app.cover_letter) > 300 else app.cover_letter
            print(preview)
            print("-" * 60)
            print()

            # In a real application, would prompt user for approval
            # For demo, we'll just show what would happen

            print("Options:")
            print("  1. Approve and submit")
            print("  2. Edit and submit")
            print("  3. Reject")
            print()

    # Step 6: Show final stats
    stats = agent.get_stats()

    print("=" * 60)
    print("📈 Final Statistics")
    print("=" * 60)
    print()
    print(f"Total jobs discovered: {stats['total_jobs_discovered']}")
    print(f"Applications generated: {stats['applications_generated']}")
    print(f"Applications submitted: {stats['applications_submitted']}")
    print(f"Pending review: {stats['pending_applications']}")
    print()

    print("=" * 60)
    print("✅ Demo completed successfully!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Review pending applications in the web dashboard")
    print("2. Approve applications to submit automatically")
    print("3. Track application status and schedule follow-ups")
    print("4. Configure automated daily job searches")
    print()


if __name__ == "__main__":
    asyncio.run(main())
