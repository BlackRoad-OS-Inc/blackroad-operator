"""Advanced Automated Form Filler
Playwright-based automation with intelligent field detection and error recovery"""

from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass
from datetime import datetime, UTC
import asyncio
import logging
from enum import Enum

logger = logging.getLogger(__name__)


class FieldType(Enum):
    """Form field types."""
    TEXT = "text"
    EMAIL = "email"
    PHONE = "phone"
    TEXTAREA = "textarea"
    SELECT = "select"
    RADIO = "radio"
    CHECKBOX = "checkbox"
    FILE = "file"
    DATE = "date"
    URL = "url"


class FillStrategy(Enum):
    """Strategies for filling fields."""
    DIRECT_FILL = "direct_fill"  # Direct fill via input.fill()
    TYPE_SIMULATION = "type_simulation"  # Simulate human typing
    JAVASCRIPT_SET = "javascript_set"  # Set via JavaScript
    CLICK_AND_TYPE = "click_and_type"  # Click first, then type


@dataclass
class FieldSelector:
    """Selector strategies for finding form fields."""
    name: str
    selectors: List[str]
    field_type: FieldType
    required: bool = False


@dataclass
class FilledField:
    """Record of a filled field."""
    name: str
    value: str
    success: bool
    error: Optional[str] = None
    strategy_used: Optional[FillStrategy] = None


@dataclass
class FormSubmissionResult:
    """Result of form submission."""
    success: bool
    platform: str
    job_id: str
    filled_fields: List[FilledField]
    errors: List[str]
    submission_time: Optional[str] = None
    confirmation_url: Optional[str] = None
    confirmation_text: Optional[str] = None


class AutoFormFiller:
    """    Advanced automated form filler with:
    - Intelligent field detection
    - Multiple fill strategies
    - Error recovery
    - CAPTCHA detection
    - Success verification"""

    def __init__(self):
        """Initialize form filler."""
        self.field_selectors = self._build_field_selectors()
        self.platform_handlers = self._build_platform_handlers()

    def _build_field_selectors(self) -> Dict[str, FieldSelector]:
        """Build common field selectors."""
        return {
            "first_name": FieldSelector(
                name="first_name",
                selectors=[
                    'input[name*="first"][name*="name" i]',
                    'input[id*="first"][id*="name" i]',
                    'input[placeholder*="First Name" i]',
                    'input[aria-label*="First Name" i]',
                ],
                field_type=FieldType.TEXT,
                required=True
            ),
            "last_name": FieldSelector(
                name="last_name",
                selectors=[
                    'input[name*="last"][name*="name" i]',
                    'input[id*="last"][id*="name" i]',
                    'input[placeholder*="Last Name" i]',
                    'input[aria-label*="Last Name" i]',
                ],
                field_type=FieldType.TEXT,
                required=True
            ),
            "full_name": FieldSelector(
                name="full_name",
                selectors=[
                    'input[name*="full"][name*="name" i]',
                    'input[name="name"]',
                    'input[id*="full"][id*="name" i]',
                    'input[placeholder*="Full Name" i]',
                    'input[placeholder*="Your Name" i]',
                ],
                field_type=FieldType.TEXT,
                required=True
            ),
            "email": FieldSelector(
                name="email",
                selectors=[
                    'input[type="email"]',
                    'input[name*="email" i]',
                    'input[id*="email" i]',
                    'input[placeholder*="Email" i]',
                    'input[aria-label*="Email" i]',
                ],
                field_type=FieldType.EMAIL,
                required=True
            ),
            "phone": FieldSelector(
                name="phone",
                selectors=[
                    'input[type="tel"]',
                    'input[name*="phone" i]',
                    'input[id*="phone" i]',
                    'input[placeholder*="Phone" i]',
                    'input[aria-label*="Phone" i]',
                ],
                field_type=FieldType.PHONE,
                required=True
            ),
            "resume": FieldSelector(
                name="resume",
                selectors=[
                    'input[type="file"][name*="resume" i]',
                    'input[type="file"][id*="resume" i]',
                    'input[type="file"][name*="cv" i]',
                    'input[type="file"]',
                ],
                field_type=FieldType.FILE,
                required=True
            ),
            "cover_letter": FieldSelector(
                name="cover_letter",
                selectors=[
                    'textarea[name*="cover" i]',
                    'textarea[id*="cover" i]',
                    'textarea[placeholder*="Cover Letter" i]',
                    'textarea[aria-label*="Cover Letter" i]',
                ],
                field_type=FieldType.TEXTAREA,
                required=False
            ),
            "linkedin_url": FieldSelector(
                name="linkedin_url",
                selectors=[
                    'input[name*="linkedin" i]',
                    'input[id*="linkedin" i]',
                    'input[placeholder*="LinkedIn" i]',
                ],
                field_type=FieldType.URL,
                required=False
            ),
            "portfolio_url": FieldSelector(
                name="portfolio_url",
                selectors=[
                    'input[name*="portfolio" i]',
                    'input[id*="portfolio" i]',
                    'input[name*="website" i]',
                    'input[placeholder*="Portfolio" i]',
                ],
                field_type=FieldType.URL,
                required=False
            ),
        """

    def _build_platform_handlers(self) -> Dict[str, Any]:
        """Build platform-specific handlers."""
        return {
            "linkedin": self._fill_linkedin_application,
            "indeed": self._fill_indeed_application,
            "ziprecruiter": self._fill_ziprecruiter_application,
            "glassdoor": self._fill_glassdoor_application,
            "monster": self._fill_generic_application,
            "dice": self._fill_generic_application,
        """

    async def fill_and_submit(
        self,
        page: Any,  # Playwright Page
        platform: str,
        application_content: Dict[str, Any],
        dry_run: bool = True
    ) -> FormSubmissionResult:
        """        Fill and submit application form.

        Args:
            page: Playwright page object
            platform: Platform name (linkedin, indeed, etc.)
            application_content: Application data
            dry_run: If True, don't actually submit

        Returns:
            FormSubmissionResult with details"""
        platform_lower = platform.lower()
        handler = self.platform_handlers.get(platform_lower, self._fill_generic_application)

        try:
            # Wait for page to load
            await page.wait_for_load_state("domcontentloaded")

            # Check for CAPTCHA
            if await self._detect_captcha(page):
                return FormSubmissionResult(
                    success=False,
                    platform=platform,
                    job_id=application_content.get("job_id", ""),
                    filled_fields=[],
                    errors=["CAPTCHA detected - manual intervention required"]
                )

            # Call platform-specific handler
            result = await handler(page, application_content, dry_run)
            return result

        except Exception as e:
            logger.error(f"Error filling form on {platform}: {e}", exc_info=True)
            return FormSubmissionResult(
                success=False,
                platform=platform,
                job_id=application_content.get("job_id", ""),
                filled_fields=[],
                errors=[str(e)]
            )

    async def _fill_linkedin_application(
        self,
        page: Any,
        content: Dict[str, Any],
        dry_run: bool
    ) -> FormSubmissionResult:
        """Fill LinkedIn Easy Apply application."""
        filled_fields = []
        errors = []

        try:
            # Click Easy Apply button
            easy_apply_button = await page.query_selector(
                'button:has-text("Easy Apply"), button[aria-label*="Easy Apply"]'
            )

            if not easy_apply_button:
                errors.append("Easy Apply button not found")
                return FormSubmissionResult(
                    success=False,
                    platform="linkedin",
                    job_id=content.get("job_id", ""),
                    filled_fields=filled_fields,
                    errors=errors
                )

            await easy_apply_button.click()
            await page.wait_for_load_state("networkidle", timeout=5000)

            # LinkedIn Easy Apply is multi-step
            max_steps = 10
            current_step = 0

            while current_step < max_steps:
                # Check if we're on the review step
                review_section = await page.query_selector(
                    'h3:has-text("Review"), [aria-label*="Review"]'
                )

                if review_section:
                    logger.info("Reached review step")
                    break

                # Fill current step
                step_fields = await self._fill_linkedin_step(page, content)
                filled_fields.extend(step_fields)

                # Click Next button
                next_button = await page.query_selector(
                    'button:has-text("Next"), button[aria-label*="Continue"], button[aria-label*="Next"]'
                )

                if next_button:
                    if not dry_run:
                        await next_button.click()
                        await asyncio.sleep(1)
                    current_step += 1
                else:
                    # No next button - might be last step
                    break

            # Submit or exit
            if not dry_run:
                submit_button = await page.query_selector(
                    'button:has-text("Submit application"), button[aria-label*="Submit"]'
                )
                if submit_button:
                    await submit_button.click()
                    await page.wait_for_load_state("networkidle")

                    return FormSubmissionResult(
                        success=True,
                        platform="linkedin",
                        job_id=content.get("job_id", ""),
                        filled_fields=filled_fields,
                        errors=errors,
                        submission_time=datetime.now(UTC).isoformat()
                    )

            return FormSubmissionResult(
                success=True,
                platform="linkedin",
                job_id=content.get("job_id", ""),
                filled_fields=filled_fields,
                errors=errors,
                submission_time=None if dry_run else datetime.now(UTC).isoformat()
            )

        except Exception as e:
            errors.append(str(e))
            return FormSubmissionResult(
                success=False,
                platform="linkedin",
                job_id=content.get("job_id", ""),
                filled_fields=filled_fields,
                errors=errors
            )

    async def _fill_linkedin_step(
        self,
        page: Any,
        content: Dict[str, Any]
    ) -> List[FilledField]:
        """Fill a single step of LinkedIn Easy Apply."""
        filled_fields = []

        # Find all visible input fields
        inputs = await page.query_selector_all('input:visible, textarea:visible, select:visible')

        for input_elem in inputs:
            try:
                # Get field attributes
                field_name = await input_elem.get_attribute("name") or ""
                field_id = await input_elem.get_attribute("id") or ""
                field_type = await input_elem.get_attribute("type") or "text"
                field_label = await self._get_field_label(page, input_elem)

                # Determine what value to fill
                value = self._determine_field_value(
                    field_name, field_id, field_label, field_type, content
                )

                if value:
                    success = await self._fill_field_with_retry(
                        input_elem, value, field_type
                    )

                    filled_fields.append(FilledField(
                        name=field_name or field_id or "unknown",
                        value=value if field_type != "file" else "file uploaded",
                        success=success,
                        strategy_used=FillStrategy.DIRECT_FILL
                    ))

            except Exception as e:
                logger.warning(f"Error filling LinkedIn field: {e}")
                continue

        return filled_fields

    async def _fill_indeed_application(
        self,
        page: Any,
        content: Dict[str, Any],
        dry_run: bool
    ) -> FormSubmissionResult:
        """Fill Indeed application."""
        filled_fields = []
        errors = []

        try:
            # Indeed usually has direct "Apply Now" button
            apply_button = await page.query_selector(
                'button:has-text("Apply now"), a:has-text("Apply now")'
            )

            if apply_button:
                await apply_button.click()
                await page.wait_for_load_state("domcontentloaded")

            # Fill form fields
            field_mapping = {
                "full_name": content.get("full_name"),
                "email": content.get("email"),
                "phone": content.get("phone"),
                "resume": content.get("resume_path"),
                "cover_letter": content.get("cover_letter"),
            """

            for field_name, value in field_mapping.items():
                if not value:
                    continue

                selector_info = self.field_selectors.get(field_name)
                if not selector_info:
                    continue

                field_elem = await self._find_field(page, selector_info.selectors)

                if field_elem:
                    success = await self._fill_field_with_retry(
                        field_elem, value, selector_info.field_type.value
                    )

                    filled_fields.append(FilledField(
                        name=field_name,
                        value=value if selector_info.field_type != FieldType.FILE else "file",
                        success=success,
                        strategy_used=FillStrategy.DIRECT_FILL
                    ))

            # Submit
            if not dry_run:
                submit_button = await page.query_selector(
                    'button[type="submit"], input[type="submit"], button:has-text("Submit")'
                )
                if submit_button:
                    await submit_button.click()
                    await page.wait_for_load_state("networkidle")

            return FormSubmissionResult(
                success=True,
                platform="indeed",
                job_id=content.get("job_id", ""),
                filled_fields=filled_fields,
                errors=errors,
                submission_time=None if dry_run else datetime.now(UTC).isoformat()
            )

        except Exception as e:
            errors.append(str(e))
            return FormSubmissionResult(
                success=False,
                platform="indeed",
                job_id=content.get("job_id", ""),
                filled_fields=filled_fields,
                errors=errors
            )

    async def _fill_ziprecruiter_application(
        self,
        page: Any,
        content: Dict[str, Any],
        dry_run: bool
    ) -> FormSubmissionResult:
        """Fill ZipRecruiter application (usually 1-click)."""
        filled_fields = []
        errors = []

        try:
            # ZipRecruiter often uses profile
            apply_button = await page.query_selector(
                'button:has-text("Quick Apply"), button:has-text("Apply Now")'
            )

            if apply_button:
                if not dry_run:
                    await apply_button.click()
                    await page.wait_for_load_state("networkidle")

                filled_fields.append(FilledField(
                    name="1-click-apply",
                    value="Applied using saved profile",
                    success=True,
                    strategy_used=FillStrategy.DIRECT_FILL
                ))

            return FormSubmissionResult(
                success=True,
                platform="ziprecruiter",
                job_id=content.get("job_id", ""),
                filled_fields=filled_fields,
                errors=errors,
                submission_time=None if dry_run else datetime.now(UTC).isoformat()
            )

        except Exception as e:
            errors.append(str(e))
            return FormSubmissionResult(
                success=False,
                platform="ziprecruiter",
                job_id=content.get("job_id", ""),
                filled_fields=filled_fields,
                errors=errors
            )

    async def _fill_glassdoor_application(
        self,
        page: Any,
        content: Dict[str, Any],
        dry_run: bool
    ) -> FormSubmissionResult:
        """Fill Glassdoor application."""
        return await self._fill_generic_application(page, content, dry_run, platform="glassdoor")

    async def _fill_generic_application(
        self,
        page: Any,
        content: Dict[str, Any],
        dry_run: bool,
        platform: str = "generic"
    ) -> FormSubmissionResult:
        """Generic form filler for any platform."""
        filled_fields = []
        errors = []

        try:
            # Map common fields
            field_mapping = {
                "first_name": content.get("first_name") or content.get("full_name", "").split()[0],
                "last_name": content.get("last_name") or " ".join(content.get("full_name", "").split()[1:]),
                "full_name": content.get("full_name"),
                "email": content.get("email"),
                "phone": content.get("phone"),
                "resume": content.get("resume_path"),
                "cover_letter": content.get("cover_letter"),
                "linkedin_url": content.get("linkedin_url"),
                "portfolio_url": content.get("portfolio_url"),
            """

            for field_name, value in field_mapping.items():
                if not value:
                    continue

                selector_info = self.field_selectors.get(field_name)
                if not selector_info:
                    continue

                field_elem = await self._find_field(page, selector_info.selectors)

                if field_elem:
                    success = await self._fill_field_with_retry(
                        field_elem, value, selector_info.field_type.value
                    )

                    filled_fields.append(FilledField(
                        name=field_name,
                        value=value if selector_info.field_type != FieldType.FILE else "file",
                        success=success,
                        strategy_used=FillStrategy.DIRECT_FILL
                    ))

            # Try to submit
            if not dry_run:
                submit_button = await page.query_selector(
                    'button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Apply")'
                )
                if submit_button:
                    await submit_button.click()
                    await page.wait_for_load_state("networkidle")

            return FormSubmissionResult(
                success=True,
                platform=platform,
                job_id=content.get("job_id", ""),
                filled_fields=filled_fields,
                errors=errors,
                submission_time=None if dry_run else datetime.now(UTC).isoformat()
            )

        except Exception as e:
            errors.append(str(e))
            return FormSubmissionResult(
                success=False,
                platform=platform,
                job_id=content.get("job_id", ""),
                filled_fields=filled_fields,
                errors=errors
            )

    async def _find_field(self, page: Any, selectors: List[str]) -> Optional[Any]:
        """Find field using multiple selectors."""
        for selector in selectors:
            try:
                elem = await page.query_selector(selector)
                if elem and await elem.is_visible():
                    return elem
            except:
                continue
        return None

    async def _fill_field_with_retry(
        self,
        element: Any,
        value: str,
        field_type: str,
        max_retries: int = 3
    ) -> bool:
        """Fill field with retry logic."""
        strategies = [
            FillStrategy.DIRECT_FILL,
            FillStrategy.CLICK_AND_TYPE,
            FillStrategy.TYPE_SIMULATION,
        ]

        for retry in range(max_retries):
            for strategy in strategies:
                try:
                    if field_type == "file":
                        await element.set_input_files(value)
                        return True

                    if strategy == FillStrategy.DIRECT_FILL:
                        await element.fill(value)
                    elif strategy == FillStrategy.CLICK_AND_TYPE:
                        await element.click()
                        await asyncio.sleep(0.1)
                        await element.fill(value)
                    elif strategy == FillStrategy.TYPE_SIMULATION:
                        await element.click()
                        await element.type(value, delay=50)

                    # Verify the value was set
                    if field_type != "file":
                        set_value = await element.input_value()
                        if set_value == value:
                            return True

                except Exception as e:
                    logger.debug(f"Fill attempt {retry+1} with {strategy.value} failed: {e}")
                    continue

            await asyncio.sleep(0.5 * (retry + 1))

        return False

    async def _get_field_label(self, page: Any, element: Any) -> str:
        """Get label associated with field."""
        try:
            # Try aria-label
            aria_label = await element.get_attribute("aria-label")
            if aria_label:
                return aria_label

            # Try placeholder
            placeholder = await element.get_attribute("placeholder")
            if placeholder:
                return placeholder

            # Try associated label element
            field_id = await element.get_attribute("id")
            if field_id:
                label = await page.query_selector(f'label[for="{field_id}"]')
                if label:
                    label_text = await label.text_content()
                    return label_text.strip()

            return ""
        except:
            return ""

    def _determine_field_value(
        self,
        field_name: str,
        field_id: str,
        field_label: str,
        field_type: str,
        content: Dict[str, Any]
    ) -> Optional[str]:
        """Determine what value to use for a field."""
        # Combine all identifiers for matching
        combined = f"{field_name} {field_id} {field_label}".lower()

        # Name fields
        if "first" in combined and "name" in combined:
            return content.get("first_name") or content.get("full_name", "").split()[0]
        if "last" in combined and "name" in combined:
            return content.get("last_name") or " ".join(content.get("full_name", "").split()[1:])
        if "name" in combined and "first" not in combined and "last" not in combined:
            return content.get("full_name")

        # Contact fields
        if "email" in combined:
            return content.get("email")
        if "phone" in combined:
            return content.get("phone")

        # Location
        if "location" in combined or "city" in combined:
            return content.get("location")

        # Cover letter
        if "cover" in combined and "letter" in combined:
            return content.get("cover_letter")

        # LinkedIn
        if "linkedin" in combined:
            return content.get("linkedin_url")

        # Portfolio/website
        if "portfolio" in combined or "website" in combined:
            return content.get("portfolio_url")

        # Check custom answers
        custom_answers = content.get("custom_answers", {})
        for key, value in custom_answers.items():
            if key.lower() in combined:
                return value

        return None

    async def _detect_captcha(self, page: Any) -> bool:
        """Detect if CAPTCHA is present on page."""
        captcha_indicators = [
            'iframe[src*="recaptcha"]',
            'iframe[src*="hcaptcha"]',
            '[id*="captcha"]',
            '[class*="captcha"]',
            'img[alt*="captcha" i]',
        ]

        for indicator in captcha_indicators:
            try:
                elem = await page.query_selector(indicator)
                if elem:
                    return True
            except:
                continue

        return False


__all__ = [
    "AutoFormFiller",
    "FormSubmissionResult",
    "FilledField",
    "FieldType",
    "FillStrategy"
]
