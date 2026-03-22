#!/usr/bin/env python3
"""
LinkedIn Easy Apply Automation

Features:
- Automated Easy Apply submissions
- Form detection and intelligent filling
- Resume selection
- Cover letter auto-upload
- Question answering (work authorization, sponsorship, etc.)
- Multi-page form navigation
- Rate limiting to avoid detection
- Session management
- Application tracking
"""

import asyncio
import json
import os
import time
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from enum import Enum

try:
    from playwright.async_api import async_playwright, Page, Browser
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False


class QuestionType(Enum):
    """LinkedIn Easy Apply question types."""
    TEXT_INPUT = "text"
    TEXTAREA = "textarea"
    SELECT = "select"
    RADIO = "radio"
    CHECKBOX = "checkbox"
    FILE_UPLOAD = "file"
    YES_NO = "yes_no"


@dataclass
class LinkedInProfile:
    """LinkedIn Easy Apply profile."""
    # Contact
    email: str
    phone: str

    # Work Authorization
    us_authorized: bool = True
    require_sponsorship: bool = False

    # Compensation
    desired_salary: int = 0  # Annual

    # Experience
    years_experience: int = 0

    # Education
    highest_degree: str = "Bachelor's Degree"
    university: str = ""
    graduation_year: int = 2020

    # Files
    resume_path: str = ""
    cover_letter_path: str = ""

    # Answers to common questions
    common_answers: Dict[str, str] = None

    # LinkedIn
    linkedin_url: str = ""
    website: str = ""

    def __post_init__(self):
        if self.common_answers is None:
            self.common_answers = {}


@dataclass
class EasyApplyApplication:
    """LinkedIn Easy Apply application."""
    id: str
    job_id: str
    job_url: str
    company: str
    job_title: str
    location: str

    # Application
    submitted: bool = False
    submitted_at: Optional[str] = None

    # Steps completed
    steps_completed: int = 0
    total_steps: int = 0

    # Status
    status: str = "in_progress"  # in_progress, submitted, failed
    error_message: str = ""

    # Questions answered
    questions_answered: List[Dict] = None

    # Metadata
    created_at: str = ""

    def __post_init__(self):
        if self.questions_answered is None:
            self.questions_answered = []
        if not self.created_at:
            self.created_at = datetime.now().isoformat()


class LinkedInEasyApply:
    """LinkedIn Easy Apply automation."""

    def __init__(self, profile: LinkedInProfile, headless: bool = True):
        """Initialize LinkedIn Easy Apply automation."""
        if not PLAYWRIGHT_AVAILABLE:
            raise ImportError("Playwright not installed. Run: pip install playwright && playwright install")

        self.profile = profile
        self.headless = headless

        self.data_dir = Path.home() / ".applier" / "linkedin"
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.applications_file = self.data_dir / "easy_apply_applications.json"
        self.applications: List[EasyApplyApplication] = self._load_applications()

        # Session
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None

        # Selectors
        self.selectors = {
            "easy_apply_button": "button.jobs-apply-button",
            "next_button": "button[aria-label='Continue to next step']",
            "review_button": "button[aria-label='Review your application']",
            "submit_button": "button[aria-label='Submit application']",
            "form_container": "div.jobs-easy-apply-content",
            "form_fields": "div.jobs-easy-apply-form-section__grouping",
            "text_input": "input[type='text']",
            "textarea": "textarea",
            "select": "select",
            "radio": "input[type='radio']",
            "checkbox": "input[type='checkbox']",
            "file_input": "input[type='file']",
            "error_message": "div.artdeco-inline-feedback--error",
        }

    async def __aenter__(self):
        """Async context manager entry."""
        await self.start_session()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close_session()

    async def start_session(self):
        """Start Playwright session."""
        playwright = await async_playwright().start()

        self.browser = await playwright.chromium.launch(headless=self.headless)

        # Load saved cookies if available
        storage_state_file = self.data_dir / "linkedin_session.json"
        if storage_state_file.exists():
            context = await self.browser.new_context(storage_state=str(storage_state_file))
        else:
            context = await self.browser.new_context()

        self.page = await context.new_page()

    async def close_session(self):
        """Close Playwright session."""
        # Save session
        if self.page:
            storage_state_file = self.data_dir / "linkedin_session.json"
            await self.page.context.storage_state(path=str(storage_state_file))

        if self.browser:
            await self.browser.close()

    async def login(self, email: str, password: str):
        """Login to LinkedIn."""
        print("🔐 Logging in to LinkedIn...")

        await self.page.goto("https://www.linkedin.com/login")

        # Fill login form
        await self.page.fill("input[name='session_key']", email)
        await self.page.fill("input[name='session_password']", password)

        # Submit
        await self.page.click("button[type='submit']")

        # Wait for redirect
        await self.page.wait_for_url("https://www.linkedin.com/feed/*", timeout=10000)

        print("✅ Logged in successfully")

    async def apply_to_job(self, job_url: str) -> EasyApplyApplication:
        """Apply to a job using Easy Apply."""

        print(f"\n🎯 Applying to: {job_url}")

        # Navigate to job
        await self.page.goto(job_url)
        await self.page.wait_for_load_state("networkidle")

        # Extract job details
        company = await self._get_text("span.jobs-unified-top-card__company-name")
        job_title = await self._get_text("h1.jobs-unified-top-card__job-title")
        location = await self._get_text("span.jobs-unified-top-card__bullet")

        # Extract job ID from URL
        job_id = job_url.split("/")[-2] if "/" in job_url else job_url

        # Create application record
        application = EasyApplyApplication(
            id=f"linkedin_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            job_id=job_id,
            job_url=job_url,
            company=company or "Unknown",
            job_title=job_title or "Unknown",
            location=location or "Unknown"
        )

        print(f"   Company: {application.company}")
        print(f"   Title: {application.job_title}")

        # Click Easy Apply button
        try:
            easy_apply_button = await self.page.wait_for_selector(
                self.selectors["easy_apply_button"],
                timeout=5000
            )
            await easy_apply_button.click()
            print("✅ Clicked Easy Apply button")
        except:
            application.status = "failed"
            application.error_message = "Easy Apply button not found"
            self.applications.append(application)
            self._save_applications()
            print("❌ Easy Apply not available for this job")
            return application

        # Wait for form modal
        await self.page.wait_for_selector(self.selectors["form_container"], timeout=5000)

        # Process multi-step form
        try:
            await self._complete_easy_apply_form(application)
            application.status = "submitted"
            application.submitted = True
            application.submitted_at = datetime.now().isoformat()
            print(f"✅ Application submitted successfully!")
        except Exception as e:
            application.status = "failed"
            application.error_message = str(e)
            print(f"❌ Application failed: {e}")

        self.applications.append(application)
        self._save_applications()

        return application

    async def _complete_easy_apply_form(self, application: EasyApplyApplication):
        """Complete the Easy Apply multi-step form."""

        max_steps = 10  # Safety limit
        current_step = 0

        while current_step < max_steps:
            current_step += 1

            print(f"\n📝 Step {current_step}...")

            # Wait for form to load
            await asyncio.sleep(1)

            # Fill current page
            await self._fill_current_page()

            # Check for errors
            errors = await self.page.query_selector_all(self.selectors["error_message"])
            if errors:
                error_texts = []
                for error in errors:
                    text = await error.inner_text()
                    error_texts.append(text)
                raise Exception(f"Form errors: {', '.join(error_texts)}")

            # Check which button is available
            submit_button = await self.page.query_selector(self.selectors["submit_button"])
            review_button = await self.page.query_selector(self.selectors["review_button"])
            next_button = await self.page.query_selector(self.selectors["next_button"])

            if submit_button:
                # Final step - submit
                print("   Submitting application...")
                await submit_button.click()
                await asyncio.sleep(2)

                # Check for confirmation
                application.steps_completed = current_step
                application.total_steps = current_step
                break

            elif review_button:
                # Review step
                print("   Reviewing application...")
                await review_button.click()
                await asyncio.sleep(1)

            elif next_button:
                # Next step
                print("   Moving to next step...")
                await next_button.click()
                await asyncio.sleep(1)

            else:
                # No navigation button found
                raise Exception("No navigation button found (Next/Review/Submit)")

        if current_step >= max_steps:
            raise Exception(f"Form exceeded max steps ({max_steps})")

    async def _fill_current_page(self):
        """Fill all fields on current page."""

        # Get all form sections
        sections = await self.page.query_selector_all(self.selectors["form_fields"])

        for section in sections:
            # Check for label to determine field type
            label_element = await section.query_selector("label")
            if label_element:
                label_text = await label_element.inner_text()
                label_text = label_text.strip().lower()

                # Determine field type and fill
                await self._fill_field_by_label(section, label_text)

    async def _fill_field_by_label(self, container, label: str):
        """Fill a field based on its label."""

        # Phone number
        if "phone" in label:
            input_field = await container.query_selector("input")
            if input_field:
                await input_field.fill(self.profile.phone)
                print(f"   Filled: {label} = {self.profile.phone}")
                return

        # Email
        if "email" in label:
            input_field = await container.query_selector("input")
            if input_field:
                await input_field.fill(self.profile.email)
                print(f"   Filled: {label} = {self.profile.email}")
                return

        # Work authorization
        if "authorized" in label or "legally authorized" in label:
            value = "Yes" if self.profile.us_authorized else "No"
            await self._select_radio_or_dropdown(container, value)
            print(f"   Selected: {label} = {value}")
            return

        # Sponsorship
        if "sponsorship" in label or "visa" in label:
            value = "Yes" if self.profile.require_sponsorship else "No"
            await self._select_radio_or_dropdown(container, value)
            print(f"   Selected: {label} = {value}")
            return

        # Years of experience
        if "years" in label and "experience" in label:
            input_field = await container.query_selector("input")
            if input_field:
                await input_field.fill(str(self.profile.years_experience))
                print(f"   Filled: {label} = {self.profile.years_experience}")
                return

        # Salary
        if "salary" in label or "compensation" in label:
            if self.profile.desired_salary > 0:
                input_field = await container.query_selector("input")
                if input_field:
                    await input_field.fill(str(self.profile.desired_salary))
                    print(f"   Filled: {label} = ${self.profile.desired_salary}")
                    return

        # Resume upload
        if "resume" in label or "cv" in label:
            file_input = await container.query_selector("input[type='file']")
            if file_input and self.profile.resume_path:
                await file_input.set_input_files(self.profile.resume_path)
                print(f"   Uploaded: resume")
                return

        # Cover letter
        if "cover letter" in label:
            file_input = await container.query_selector("input[type='file']")
            if file_input and self.profile.cover_letter_path:
                await file_input.set_input_files(self.profile.cover_letter_path)
                print(f"   Uploaded: cover letter")
                return

        # LinkedIn URL
        if "linkedin" in label:
            input_field = await container.query_selector("input")
            if input_field and self.profile.linkedin_url:
                await input_field.fill(self.profile.linkedin_url)
                print(f"   Filled: {label} = {self.profile.linkedin_url}")
                return

        # Website
        if "website" in label or "portfolio" in label:
            input_field = await container.query_selector("input")
            if input_field and self.profile.website:
                await input_field.fill(self.profile.website)
                print(f"   Filled: {label} = {self.profile.website}")
                return

        # Check common answers
        for key, value in self.profile.common_answers.items():
            if key.lower() in label:
                # Try text input
                input_field = await container.query_selector("input, textarea")
                if input_field:
                    await input_field.fill(value)
                    print(f"   Filled: {label} = {value}")
                    return

                # Try select/radio
                await self._select_radio_or_dropdown(container, value)
                print(f"   Selected: {label} = {value}")
                return

        # If we get here, field wasn't filled
        print(f"   ⚠️  Skipped: {label}")

    async def _select_radio_or_dropdown(self, container, value: str):
        """Select a radio button or dropdown option."""

        # Try dropdown
        select = await container.query_selector("select")
        if select:
            await select.select_option(label=value)
            return

        # Try radio buttons
        radios = await container.query_selector_all("input[type='radio']")
        for radio in radios:
            label = await radio.get_attribute("aria-label")
            if label and value.lower() in label.lower():
                await radio.click()
                return

    async def _get_text(self, selector: str) -> Optional[str]:
        """Get text from element."""
        try:
            element = await self.page.wait_for_selector(selector, timeout=2000)
            return await element.inner_text()
        except:
            return None

    def get_statistics(self) -> Dict:
        """Get application statistics."""

        stats = {
            "total": len(self.applications),
            "submitted": 0,
            "failed": 0,
            "in_progress": 0,
            "by_company": {}
        }

        for app in self.applications:
            if app.status == "submitted":
                stats["submitted"] += 1
            elif app.status == "failed":
                stats["failed"] += 1
            else:
                stats["in_progress"] += 1

            # By company
            company = app.company
            if company not in stats["by_company"]:
                stats["by_company"][company] = 0
            stats["by_company"][company] += 1

        return stats

    def _load_applications(self) -> List[EasyApplyApplication]:
        """Load applications from file."""

        if not self.applications_file.exists():
            return []

        with open(self.applications_file, 'r') as f:
            data = json.load(f)

        return [EasyApplyApplication(**item) for item in data]

    def _save_applications(self):
        """Save applications to file."""

        data = [asdict(app) for app in self.applications]

        with open(self.applications_file, 'w') as f:
            json.dump(data, f, indent=2)


# CLI
async def main_async():
    """Async main function."""

    # Demo profile
    profile = LinkedInProfile(
        email="your.email@gmail.com",
        phone="+1 (555) 123-4567",
        us_authorized=True,
        require_sponsorship=False,
        years_experience=5,
        desired_salary=150000,
        resume_path=str(Path.home() / ".applier" / "resume.pdf"),
        linkedin_url="https://linkedin.com/in/yourprofile",
        common_answers={
            "start date": "2 weeks notice",
            "relocation": "No",
        }
    )

    async with LinkedInEasyApply(profile, headless=False) as easy_apply:
        # Note: You'll need to login first or have saved session
        # await easy_apply.login("your_email@gmail.com", "your_password")

        # Apply to jobs
        job_urls = [
            # "https://www.linkedin.com/jobs/view/1234567890",
        ]

        for job_url in job_urls:
            application = await easy_apply.apply_to_job(job_url)
            print(f"\nStatus: {application.status}")

            # Rate limiting
            await asyncio.sleep(5)

        # Stats
        stats = easy_apply.get_statistics()
        print(f"\n📊 STATISTICS:")
        print(f"Total: {stats['total']}")
        print(f"Submitted: {stats['submitted']}")
        print(f"Failed: {stats['failed']}")


def main():
    """CLI entry point."""
    print("""
LinkedIn Easy Apply Automation

SETUP:
1. Create profile in ~/.applier/linkedin/profile.json
2. Login first time: Set headless=False
3. Run batch applications

USAGE:
    python applier-linkedin-easy-apply.py

Note: This is a demo. Integrate with applier-pro for full functionality.
""")

    asyncio.run(main_async())


if __name__ == "__main__":
    main()
