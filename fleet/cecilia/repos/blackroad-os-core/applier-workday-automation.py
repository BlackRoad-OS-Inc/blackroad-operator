#!/usr/bin/env python3
"""
Workday Application Automation

Features:
- Automated Workday form filling
- Resume auto-upload
- Job preference management
- Demographic questionnaire automation
- EEO/Voluntary self-identification handling
- Multi-step application tracking
- Session persistence across applications
- Workday-specific optimizations
"""

import asyncio
import json
import re
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
    print("⚠️  Install playwright: pip install playwright && playwright install")


class WorkdayFieldType(Enum):
    """Types of Workday form fields."""
    TEXT_INPUT = "text_input"
    DROPDOWN = "dropdown"
    CHECKBOX = "checkbox"
    RADIO = "radio"
    FILE_UPLOAD = "file_upload"
    TEXTAREA = "textarea"
    DATE_PICKER = "date_picker"
    AUTOCOMPLETE = "autocomplete"


@dataclass
class WorkdayProfile:
    """User profile for Workday applications."""
    # Personal Info
    first_name: str
    last_name: str
    email: str
    phone: str
    
    # Address
    address_line1: str
    city: str
    state: str
    zip_code: str
    country: str = "United States"
    
    # Work Authorization
    us_authorized: bool = True
    require_sponsorship: bool = False
    
    # Education
    highest_degree: str = "Bachelor's Degree"
    university: str = ""
    graduation_year: int = 2020
    
    # Professional
    years_experience: int = 5
    current_company: str = ""
    current_title: str = ""
    linkedin_url: str = ""
    github_url: str = ""
    portfolio_url: str = ""
    
    # Files
    resume_path: str = ""
    cover_letter_path: str = ""
    
    # EEO (optional - can leave blank)
    gender: str = "Prefer not to say"
    ethnicity: str = "Prefer not to say"
    veteran_status: str = "I am not a protected veteran"
    disability_status: str = "I don't wish to answer"


@dataclass
class WorkdayApplication:
    """Workday application session."""
    job_id: str
    company: str
    job_title: str
    job_url: str
    status: str  # "started", "in_progress", "submitted", "failed"
    current_step: int = 0
    total_steps: int = 0
    started_at: str = ""
    completed_at: Optional[str] = None
    error: Optional[str] = None


class WorkdayAutomation:
    """Workday application automation."""

    def __init__(self, profile: WorkdayProfile):
        """Initialize Workday automation."""
        self.profile = profile
        self.data_dir = Path.home() / ".applier" / "workday"
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Common Workday selectors
        self.selectors = {
            # Navigation
            "next_button": "button[data-automation-id='bottom-navigation-next-button']",
            "submit_button": "button[data-automation-id='bottom-navigation-submit-button']",
            "apply_button": "a[data-automation-id='applyButton']",
            
            # Form fields
            "text_input": "input[type='text']",
            "email_input": "input[type='email']",
            "tel_input": "input[type='tel']",
            "textarea": "textarea",
            "dropdown": "select",
            "file_upload": "input[type='file']",
            
            # Common field IDs (vary by company)
            "first_name": "input[data-automation-id*='firstName'], input[name*='firstName']",
            "last_name": "input[data-automation-id*='lastName'], input[name*='lastName']",
            "email": "input[data-automation-id*='email'], input[type='email']",
            "phone": "input[data-automation-id*='phone'], input[type='tel']",
            "address": "input[data-automation-id*='address']",
            "city": "input[data-automation-id*='city']",
            "state": "select[data-automation-id*='state']",
            "zip": "input[data-automation-id*='zip'], input[data-automation-id*='postal']",
            "resume": "input[data-automation-id*='resume'], input[type='file']",
        }

    async def apply_to_job(
        self,
        job_url: str,
        company: str,
        job_title: str,
        custom_answers: Dict[str, str] = None
    ) -> WorkdayApplication:
        """Apply to a Workday job."""
        
        if not PLAYWRIGHT_AVAILABLE:
            raise ImportError("Playwright not available")

        print(f"\n🚀 Starting Workday application")
        print(f"   Company: {company}")
        print(f"   Role: {job_title}")
        print(f"   URL: {job_url}")

        application = WorkdayApplication(
            job_id=self._extract_job_id(job_url),
            company=company,
            job_title=job_title,
            job_url=job_url,
            status="started",
            started_at=datetime.now().isoformat()
        )

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)  # Show browser for debugging
            context = await browser.new_context()
            page = await context.new_page()

            try:
                # Navigate to job posting
                await page.goto(job_url, wait_until="networkidle", timeout=30000)
                await asyncio.sleep(2)

                # Click "Apply" button
                await self._click_apply_button(page)
                application.status = "in_progress"

                # Fill application steps
                step = 1
                while True:
                    print(f"\n📝 Processing step {step}...")
                    
                    # Detect step type
                    step_type = await self._detect_step_type(page)
                    print(f"   Step type: {step_type}")

                    # Handle step
                    if step_type == "personal_info":
                        await self._fill_personal_info(page)
                    elif step_type == "work_experience":
                        await self._fill_work_experience(page)
                    elif step_type == "education":
                        await self._fill_education(page)
                    elif step_type == "resume_upload":
                        await self._upload_resume(page)
                    elif step_type == "questions":
                        await self._answer_questions(page, custom_answers or {})
                    elif step_type == "eeo":
                        await self._fill_eeo(page)
                    elif step_type == "review":
                        await self._review_application(page)
                    else:
                        # Generic form filling
                        await self._fill_generic_form(page)

                    # Check if we're done
                    if await self._is_final_step(page):
                        print("\n✅ Final step - submitting application")
                        await self._submit_application(page)
                        application.status = "submitted"
                        application.completed_at = datetime.now().isoformat()
                        break

                    # Go to next step
                    await self._click_next(page)
                    step += 1
                    application.current_step = step
                    
                    # Safety limit
                    if step > 20:
                        raise Exception("Too many steps - possible infinite loop")

            except Exception as e:
                print(f"\n❌ Error: {e}")
                application.status = "failed"
                application.error = str(e)
            finally:
                # Save application record
                self._save_application(application)
                await browser.close()

        return application

    async def _click_apply_button(self, page: Page):
        """Click the initial Apply button."""
        try:
            apply_button = await page.wait_for_selector(
                self.selectors["apply_button"],
                timeout=5000
            )
            await apply_button.click()
            await asyncio.sleep(2)
        except:
            print("   Apply button not found - may already be on application page")

    async def _detect_step_type(self, page: Page) -> str:
        """Detect the type of current step."""
        # Check page content for clues
        content = await page.content()
        
        if "resume" in content.lower() or "cv" in content.lower():
            return "resume_upload"
        elif "personal information" in content.lower() or "contact" in content.lower():
            return "personal_info"
        elif "experience" in content.lower() or "employment" in content.lower():
            return "work_experience"
        elif "education" in content.lower() or "degree" in content.lower():
            return "education"
        elif "equal employment" in content.lower() or "eeo" in content.lower():
            return "eeo"
        elif "review" in content.lower() or "confirm" in content.lower():
            return "review"
        elif "question" in content.lower():
            return "questions"
        else:
            return "unknown"

    async def _fill_personal_info(self, page: Page):
        """Fill personal information step."""
        print("   Filling personal information...")

        # Name
        await self._safe_fill(page, self.selectors["first_name"], self.profile.first_name)
        await self._safe_fill(page, self.selectors["last_name"], self.profile.last_name)

        # Contact
        await self._safe_fill(page, self.selectors["email"], self.profile.email)
        await self._safe_fill(page, self.selectors["phone"], self.profile.phone)

        # Address
        await self._safe_fill(page, self.selectors["address"], self.profile.address_line1)
        await self._safe_fill(page, self.selectors["city"], self.profile.city)
        await self._safe_select(page, self.selectors["state"], self.profile.state)
        await self._safe_fill(page, self.selectors["zip"], self.profile.zip_code)

        # LinkedIn/GitHub
        if self.profile.linkedin_url:
            await self._safe_fill(page, "input[data-automation-id*='linkedin']", self.profile.linkedin_url)
        if self.profile.github_url:
            await self._safe_fill(page, "input[data-automation-id*='github']", self.profile.github_url)

    async def _fill_work_experience(self, page: Page):
        """Fill work experience step."""
        print("   Filling work experience...")
        
        # Usually Workday has "Add" button for work experience
        # We can fill current company or skip if resume is uploaded
        if self.profile.current_company:
            await self._safe_fill(page, "input[data-automation-id*='company']", self.profile.current_company)
            await self._safe_fill(page, "input[data-automation-id*='title']", self.profile.current_title)

    async def _fill_education(self, page: Page):
        """Fill education step."""
        print("   Filling education...")
        
        if self.profile.university:
            await self._safe_fill(page, "input[data-automation-id*='school']", self.profile.university)
        
        # Degree dropdown
        await self._safe_select(page, "select[data-automation-id*='degree']", self.profile.highest_degree)

    async def _upload_resume(self, page: Page):
        """Upload resume."""
        print("   Uploading resume...")
        
        if not self.profile.resume_path or not Path(self.profile.resume_path).exists():
            print("   ⚠️  No resume path provided or file not found")
            return

        try:
            file_input = await page.wait_for_selector(self.selectors["resume"], timeout=5000)
            await file_input.set_input_files(self.profile.resume_path)
            await asyncio.sleep(2)  # Wait for upload
            print("   ✅ Resume uploaded")
        except Exception as e:
            print(f"   ⚠️  Resume upload failed: {e}")

    async def _answer_questions(self, page: Page, custom_answers: Dict[str, str]):
        """Answer application questions."""
        print("   Answering questions...")

        # Work authorization questions
        await self._answer_yes_no(page, "authorized to work", self.profile.us_authorized)
        await self._answer_yes_no(page, "require sponsorship", self.profile.require_sponsorship)

        # Custom questions
        for question_pattern, answer in custom_answers.items():
            await self._safe_fill(page, f"input:has-text('{question_pattern}')", answer)

    async def _fill_eeo(self, page: Page):
        """Fill EEO/voluntary self-identification."""
        print("   Filling EEO information...")

        # Gender
        await self._safe_select(page, "select[data-automation-id*='gender']", self.profile.gender)

        # Ethnicity
        await self._safe_select(page, "select[data-automation-id*='ethnicity'], select[data-automation-id*='race']", self.profile.ethnicity)

        # Veteran status
        await self._safe_select(page, "select[data-automation-id*='veteran']", self.profile.veteran_status)

        # Disability
        await self._safe_select(page, "select[data-automation-id*='disability']", self.profile.disability_status)

    async def _review_application(self, page: Page):
        """Review application before submission."""
        print("   Reviewing application...")
        # Just wait a moment for user to see
        await asyncio.sleep(1)

    async def _fill_generic_form(self, page: Page):
        """Fill unknown form fields generically."""
        print("   Filling generic fields...")
        
        # Try to fill any empty text inputs with reasonable defaults
        inputs = await page.query_selector_all("input[type='text']:not([value])")
        for input_elem in inputs[:5]:  # Limit to first 5 to avoid spam
            placeholder = await input_elem.get_attribute("placeholder")
            if placeholder:
                print(f"   Found empty field: {placeholder}")

    async def _is_final_step(self, page: Page) -> bool:
        """Check if this is the final step."""
        # Look for submit button instead of next button
        submit_button = await page.query_selector(self.selectors["submit_button"])
        return submit_button is not None

    async def _click_next(self, page: Page):
        """Click next button."""
        next_button = await page.wait_for_selector(
            self.selectors["next_button"],
            timeout=5000
        )
        await next_button.click()
        await asyncio.sleep(2)

    async def _submit_application(self, page: Page):
        """Submit the final application."""
        submit_button = await page.wait_for_selector(
            self.selectors["submit_button"],
            timeout=5000
        )
        await submit_button.click()
        await asyncio.sleep(3)
        print("   ✅ Application submitted!")

    async def _answer_yes_no(self, page: Page, question_text: str, answer: bool):
        """Answer yes/no question."""
        try:
            # Find question containing text
            question_elem = await page.query_selector(f"text=/{question_text}/i")
            if question_elem:
                # Find associated radio buttons
                parent = await question_elem.evaluate_handle("el => el.closest('div')")
                yes_radio = await parent.query_selector("input[value='yes'], input[value='Yes']")
                no_radio = await parent.query_selector("input[value='no'], input[value='No']")
                
                if answer and yes_radio:
                    await yes_radio.click()
                elif not answer and no_radio:
                    await no_radio.click()
        except:
            pass  # Question not found

    async def _safe_fill(self, page: Page, selector: str, value: str):
        """Safely fill a form field."""
        try:
            elem = await page.wait_for_selector(selector, timeout=2000)
            await elem.fill(value)
        except:
            pass  # Field not found

    async def _safe_select(self, page: Page, selector: str, value: str):
        """Safely select from dropdown."""
        try:
            await page.select_option(selector, value, timeout=2000)
        except:
            pass  # Dropdown not found

    def _extract_job_id(self, url: str) -> str:
        """Extract job ID from Workday URL."""
        # Workday URLs usually have format: .../job/Job-Title/JOB_ID
        match = re.search(r'/([A-Z0-9_-]+)/?$', url)
        if match:
            return match.group(1)
        return url.split("/")[-1]

    def _save_application(self, application: WorkdayApplication):
        """Save application record."""
        filename = f"workday_{application.company}_{application.job_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = self.data_dir / filename

        with open(filepath, 'w') as f:
            json.dump(asdict(application), f, indent=2)

        print(f"\n💾 Application saved: {filepath}")


# CLI
async def main():
    """CLI for Workday automation."""
    import argparse

    parser = argparse.ArgumentParser(description="Workday Application Automation")
    parser.add_argument("--profile", help="Path to profile JSON")
    parser.add_argument("--job-url", required=True, help="Workday job URL")
    parser.add_argument("--company", required=True, help="Company name")
    parser.add_argument("--job-title", required=True, help="Job title")

    args = parser.parse_args()

    # Load profile
    if args.profile and Path(args.profile).exists():
        with open(args.profile) as f:
            profile_data = json.load(f)
            profile = WorkdayProfile(**profile_data)
    else:
        # Demo profile
        profile = WorkdayProfile(
            first_name="Alexa",
            last_name="Amundson",
            email="blackroad@gmail.com",
            phone="555-0100",
            address_line1="123 Main St",
            city="San Francisco",
            state="CA",
            zip_code="94102",
            country="United States",
            us_authorized=True,
            require_sponsorship=False,
            highest_degree="Bachelor's Degree",
            university="UC Berkeley",
            graduation_year=2020,
            years_experience=5,
            current_company="Tech Startup",
            current_title="Software Engineer",
            linkedin_url="https://linkedin.com/in/alexaamundson",
            resume_path=str(Path.home() / ".applier" / "resume.pdf")
        )

    # Run automation
    automation = WorkdayAutomation(profile)
    application = await automation.apply_to_job(
        job_url=args.job_url,
        company=args.company,
        job_title=args.job_title
    )

    print(f"\n{'='*60}")
    print(f"Application Status: {application.status}")
    if application.status == "submitted":
        print(f"✅ Successfully applied to {args.company}!")
    else:
        print(f"❌ Application failed: {application.error}")
    print(f"{'='*60}")

    return 0


if __name__ == "__main__":
    exit(asyncio.run(main()))
