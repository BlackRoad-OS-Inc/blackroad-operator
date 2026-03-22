"""Comprehensive tests for Job Applier system
Tests application generation, form filling, and submission"""

import pytest
from datetime import datetime, UTC
from typing import Dict, Any

# Import job hunter components
from src.blackroad_core.packs.job_hunter import (
    JobPosting,
    UserProfile,
    JobApplication,
    ApplicationStatus,
    JobPlatform
)
from src.blackroad_core.packs.job_hunter.application_writer import (
    ApplicationWriter,
    ApplicationContent
)
from src.blackroad_core.packs.job_hunter.form_filler import (
    FormFiller,
    FormField,
    ApplicationForm
)


# Fixtures
@pytest.fixture
def sample_profile():
    """Sample user profile for testing."""
    return UserProfile(
        user_id="user-123",
        full_name="Jane Smith",
        email="jane.smith@example.com",
        phone="+1-555-0123",
        location="San Francisco, CA",
        resume_url="https://example.com/resume.pdf",
        summary="Experienced software engineer with 5+ years in full-stack development.",
        skills=["Python", "JavaScript", "React", "PostgreSQL", "AWS", "Docker"],
        experience=[
            {
                "title": "Senior Software Engineer",
                "company": "Tech Corp",
                "duration": "2020-2023",
                "description": "Led development of microservices architecture"
            },
            {
                "title": "Software Engineer",
                "company": "StartupXYZ",
                "duration": "2018-2020",
                "description": "Built RESTful APIs and React frontends"
            """
        ],
        education=[
            {
                "degree": "BS Computer Science",
                "school": "University of California",
                "year": 2018
            """
        ],
        target_roles=["Software Engineer", "Full Stack Developer", "Backend Engineer"],
        target_locations=["San Francisco", "Remote"],
        min_salary=120000,
        remote_only=False,
        cover_letter_template=(
            "Dear Hiring Manager,\n\n"
            "I am writing to apply for the {position} position at {company}. "
            "With expertise in {skills}, I believe I would be a strong fit for your team.\n\n"
            "{summary}\n\n"
            "I look forward to discussing this opportunity.\n\n"
            "Sincerely,\n{your_name}"
        ),
        custom_answers={
            "why_interested": "I'm passionate about {company}'s mission and excited to contribute to {position}.",
            "why_company": "I admire {company}'s innovative approach to technology.",
            "strengths": "Problem-solving, team collaboration, and full-stack development"
        """
    )


@pytest.fixture
def sample_job():
    """Sample job posting for testing."""
    return JobPosting(
        id="job-456",
        platform=JobPlatform.LINKEDIN,
        title="Senior Full Stack Engineer",
        company="Acme Corporation",
        location="San Francisco, CA (Hybrid)",
        url="https://linkedin.com/jobs/view/12345",
        description=(
            "We're looking for a Senior Full Stack Engineer to join our growing team. "
            "You'll work on cutting-edge web applications using React, Node.js, and PostgreSQL."
        ),
        requirements=[
            "5+ years of software engineering experience",
            "Strong proficiency in JavaScript and Python",
            "Experience with React and Node.js",
            "PostgreSQL or similar database experience",
            "AWS cloud experience"
        ],
        salary_range="$140,000 - $180,000",
        job_type="Full-time",
        posted_date="2025-12-10",
        scraped_at=datetime.now(UTC).isoformat()
    )


@pytest.fixture
def sample_application(sample_job, sample_profile):
    """Sample job application for testing."""
    return JobApplication(
        id="app-789",
        user_id=sample_profile.user_id,
        job_id=sample_job.id,
        status=ApplicationStatus.DRAFT,
        cover_letter=(
            "Dear Hiring Manager,\n\n"
            "I am writing to apply for the Senior Full Stack Engineer position at Acme Corporation. "
            "With expertise in Python, JavaScript, React, PostgreSQL, AWS, Docker, "
            "I believe I would be a strong fit for your team.\n\n"
            "Experienced software engineer with 5+ years in full-stack development.\n\n"
            "I look forward to discussing this opportunity.\n\n"
            "Sincerely,\nJane Smith"
        ),
        resume_version="latest",
        custom_answers={
            "why_interested": "I'm passionate about Acme Corporation's mission and excited to contribute to Senior Full Stack Engineer.",
            "why_company": "I admire Acme Corporation's innovative approach to technology.",
            "strengths": "Problem-solving, team collaboration, and full-stack development"
        },
        created_at=datetime.now(UTC).isoformat()
    )


# Application Writer Tests
class TestApplicationWriter:
    """Tests for AI-powered application writer."""

    @pytest.mark.asyncio
    async def test_generate_template_application(self, sample_job, sample_profile):
        """Test template-based application generation."""
        writer = ApplicationWriter(llm_provider=None)

        result = await writer.generate_application(
            job=sample_job,
            profile=sample_profile,
            use_ai=False
        )

        assert isinstance(result, ApplicationContent)
        assert result.cover_letter
        assert "Acme Corporation" in result.cover_letter
        assert "Senior Full Stack Engineer" in result.cover_letter
        assert "Jane Smith" in result.cover_letter
        assert result.confidence_score > 0
        assert result.custom_answers

    @pytest.mark.asyncio
    async def test_match_score_calculation(self, sample_job, sample_profile):
        """Test job match score calculation."""
        writer = ApplicationWriter()

        score = writer._calculate_match_score(sample_job, sample_profile)

        assert 0 <= score <= 1
        # Should have high match (skills align, location matches)
        assert score > 0.5

    @pytest.mark.asyncio
    async def test_match_score_poor_fit(self, sample_profile):
        """Test match score for poorly fitting job."""
        writer = ApplicationWriter()

        bad_job = JobPosting(
            id="job-999",
            platform=JobPlatform.INDEED,
            title="Sales Manager",
            company="Sales Corp",
            location="New York, NY",
            url="https://example.com/job",
            description="Looking for experienced sales professional",
            requirements=["Sales experience", "Customer relations", "CRM expertise"],
            salary_range="$60,000 - $80,000",
            job_type="Full-time",
            posted_date="2025-12-10"
        )

        score = writer._calculate_match_score(bad_job, sample_profile)

        # Should have low match (no skill overlap, different role)
        assert score < 0.5

    def test_generate_default_answer(self, sample_job, sample_profile):
        """Test default answer generation."""
        writer = ApplicationWriter()

        answer = writer._generate_default_answer("why_interested", sample_job, sample_profile)

        assert answer
        assert "Senior Full Stack Engineer" in answer or sample_profile.skills[0] in answer

    def test_custom_answer_substitution(self, sample_profile):
        """Test custom answer template substitution."""
        writer = ApplicationWriter()

        job = JobPosting(
            id="job-123",
            platform=JobPlatform.LINKEDIN,
            title="Backend Engineer",
            company="TechCo",
            location="Remote",
            url="https://example.com/job"
        )

        # Generate custom answers (sync version for testing)
        import asyncio
        answers = asyncio.run(writer._generate_custom_answers(job, sample_profile))

        # Check that placeholders were replaced
        assert "TechCo" in answers["why_interested"]
        assert "Backend Engineer" in answers["why_interested"]


# Form Filler Tests
class TestFormFiller:
    """Tests for automated form filler."""

    @pytest.mark.asyncio
    async def test_fill_linkedin_form(self, sample_application, sample_job, sample_profile):
        """Test LinkedIn Easy Apply form filling."""
        filler = FormFiller()

        result = await filler.fill_and_submit(
            application=sample_application,
            job=sample_job,
            profile=sample_profile,
            dry_run=True
        )

        assert result["success"]
        assert result["dry_run"]
        assert "steps" in result

        # Check all steps are present
        steps = result["steps"]
        step_names = [s["step"] for s in steps]
        assert "contact_info" in step_names
        assert "resume" in step_names
        assert "additional_questions" in step_names
        assert "review" in step_names

    @pytest.mark.asyncio
    async def test_fill_indeed_form(self, sample_job, sample_profile):
        """Test Indeed form filling."""
        sample_job.platform = JobPlatform.INDEED

        application = JobApplication(
            id="app-123",
            user_id=sample_profile.user_id,
            job_id=sample_job.id,
            status=ApplicationStatus.DRAFT,
            cover_letter="Test cover letter",
            custom_answers={"question1": "answer1""""
        )

        filler = FormFiller()
        result = await filler.fill_and_submit(
            application=application,
            job=sample_job,
            profile=sample_profile,
            dry_run=True
        )

        assert result["success"]
        assert result["form_data"]["name"] == sample_profile.full_name
        assert result["form_data"]["email"] == sample_profile.email

    @pytest.mark.asyncio
    async def test_unsupported_platform(self, sample_profile):
        """Test handling of unsupported platform."""
        job = JobPosting(
            id="job-123",
            platform=JobPlatform.CAREERBUILDER,
            title="Test Job",
            company="Test Corp",
            location="Remote",
            url="https://example.com/job"
        )

        application = JobApplication(
            id="app-123",
            user_id=sample_profile.user_id,
            job_id=job.id,
            status=ApplicationStatus.DRAFT,
            cover_letter="Test"
        )

        filler = FormFiller()
        result = await filler.fill_and_submit(
            application=application,
            job=job,
            profile=sample_profile,
            dry_run=True
        )

        assert not result["success"]
        assert "error" in result

    def test_map_profile_to_form(self, sample_profile, sample_application):
        """Test intelligent form field mapping."""
        filler = FormFiller()

        form = ApplicationForm(
            platform=JobPlatform.LINKEDIN,
            job_id="job-123",
            submit_url="https://example.com/submit",
            fields=[
                FormField(name="first_name", field_type="text", label="First Name", required=True),
                FormField(name="last_name", field_type="text", label="Last Name", required=True),
                FormField(name="email", field_type="email", label="Email Address", required=True),
                FormField(name="phone", field_type="tel", label="Phone Number", required=True),
                FormField(name="resume", field_type="file", label="Resume", required=True),
                FormField(name="cover", field_type="textarea", label="Cover Letter", required=False),
            ]
        )

        field_values = filler.map_profile_to_form(form, sample_profile, sample_application)

        assert field_values["first_name"] == "Jane"
        assert field_values["last_name"] == "Smith"
        assert field_values["email"] == sample_profile.email
        assert field_values["phone"] == sample_profile.phone
        assert field_values["resume"] == sample_profile.resume_url
        assert field_values["cover"] == sample_application.cover_letter

    def test_field_value_extraction_edge_cases(self, sample_profile):
        """Test field value extraction with various label formats."""
        filler = FormFiller()
        application = JobApplication(
            id="app-123",
            user_id=sample_profile.user_id,
            job_id="job-123",
            status=ApplicationStatus.DRAFT,
            cover_letter="Test cover"
        )

        # Test various label formats
        test_cases = [
            (FormField(name="fname", field_type="text", label="First Name"), "Jane"),
            (FormField(name="lname", field_type="text", label="Last Name"), "Smith"),
            (FormField(name="user_email", field_type="email", label="Your Email"), sample_profile.email),
            (FormField(name="contact_phone", field_type="tel", label="Phone Number"), sample_profile.phone),
            (FormField(name="city", field_type="text", label="City/Location"), sample_profile.location),
        ]

        for field, expected in test_cases:
            value = filler._get_field_value(field, sample_profile, application)
            assert value == expected


# Integration Tests
class TestJobApplierIntegration:
    """Integration tests for complete application flow."""

    @pytest.mark.asyncio
    async def test_end_to_end_application_flow(self, sample_job, sample_profile):
        """Test complete application flow from generation to submission."""
        # Step 1: Generate application
        writer = ApplicationWriter()
        application_content = await writer.generate_application(
            job=sample_job,
            profile=sample_profile,
            use_ai=False
        )

        assert application_content.cover_letter
        assert application_content.custom_answers

        # Step 2: Create application object
        application = JobApplication(
            id="app-integration",
            user_id=sample_profile.user_id,
            job_id=sample_job.id,
            status=ApplicationStatus.DRAFT,
            cover_letter=application_content.cover_letter,
            custom_answers=application_content.custom_answers,
            created_at=datetime.now(UTC).isoformat()
        )

        # Step 3: Fill and submit form
        filler = FormFiller()
        result = await filler.fill_and_submit(
            application=application,
            job=sample_job,
            profile=sample_profile,
            dry_run=True
        )

        assert result["success"]
        assert result["dry_run"]

    @pytest.mark.asyncio
    async def test_multiple_platform_applications(self, sample_profile):
        """Test applying to jobs across multiple platforms."""
        platforms = [
            (JobPlatform.LINKEDIN, "https://linkedin.com/jobs/1"),
            (JobPlatform.INDEED, "https://indeed.com/jobs/2"),
            (JobPlatform.ZIPRECRUITER, "https://ziprecruiter.com/jobs/3"),
            (JobPlatform.GLASSDOOR, "https://glassdoor.com/jobs/4"),
        ]

        writer = ApplicationWriter()
        filler = FormFiller()
        results = []

        for platform, url in platforms:
            # Create job for platform
            job = JobPosting(
                id=f"job-{platform.value}",
                platform=platform,
                title="Software Engineer",
                company=f"{platform.value.title()} Corp",
                location="San Francisco, CA",
                url=url,
                description="Test job description",
                requirements=["Python", "JavaScript"],
                salary_range="$120k - $150k",
                job_type="Full-time",
                posted_date="2025-12-10"
            )

            # Generate and submit application
            content = await writer.generate_application(job, sample_profile, use_ai=False)

            application = JobApplication(
                id=f"app-{platform.value}",
                user_id=sample_profile.user_id,
                job_id=job.id,
                status=ApplicationStatus.DRAFT,
                cover_letter=content.cover_letter,
                custom_answers=content.custom_answers
            )

            result = await filler.fill_and_submit(application, job, sample_profile, dry_run=True)
            results.append((platform, result))

        # All platforms should succeed
        for platform, result in results:
            assert result["success"], f"{platform.value} application failed"


# Error Handling Tests
class TestErrorHandling:
    """Tests for error handling and edge cases."""

    @pytest.mark.asyncio
    async def test_missing_required_fields(self):
        """Test handling of missing required profile fields."""
        incomplete_profile = UserProfile(
            user_id="user-incomplete",
            full_name="John Doe",
            email="",  # Missing email
            phone="",  # Missing phone
            location="San Francisco",
            resume_url=""  # Missing resume
        )

        job = JobPosting(
            id="job-test",
            platform=JobPlatform.LINKEDIN,
            title="Test Job",
            company="Test Corp",
            location="Remote",
            url="https://example.com/job"
        )

        writer = ApplicationWriter()

        # Should still generate application, but with lower confidence
        result = await writer.generate_application(job, incomplete_profile, use_ai=False)

        assert result.cover_letter
        # Confidence should be lower with incomplete profile
        assert result.confidence_score < 0.8

    @pytest.mark.asyncio
    async def test_form_submission_error_handling(self, sample_profile):
        """Test error handling during form submission."""
        filler = FormFiller()

        # Create invalid application (missing required data)
        job = JobPosting(
            id="job-invalid",
            platform=JobPlatform.LINKEDIN,
            title="Test Job",
            company="Test Corp",
            location="Remote",
            url=""  # Invalid empty URL
        )

        application = JobApplication(
            id="app-invalid",
            user_id=sample_profile.user_id,
            job_id=job.id,
            status=ApplicationStatus.DRAFT,
            cover_letter="Test"
        )

        # Should handle gracefully
        result = await filler.fill_and_submit(application, job, sample_profile, dry_run=True)

        # Should succeed in dry run despite invalid URL
        assert result["success"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
