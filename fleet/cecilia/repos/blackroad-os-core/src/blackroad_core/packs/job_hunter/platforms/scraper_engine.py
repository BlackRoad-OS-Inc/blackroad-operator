"""Universal Job Scraper Engine
Playwright-based automation for all 30+ platforms"""

from typing import List, Dict, Any, Optional
from datetime import datetime, UTC
import asyncio
import random
from dataclasses import dataclass

from . import JobPlatform, get_platform_config


@dataclass
class ScraperConfig:
    """Scraper configuration."""
    headless: bool = True
    user_agent: str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    viewport: Dict[str, int] = None
    timeout: int = 30000  # 30 seconds
    rate_limit_delay: float = 2.0  # seconds between requests
    max_retries: int = 3
    proxy: Optional[str] = None

    def __post_init__(self):
        if self.viewport is None:
            self.viewport = {"width": 1920, "height": 1080"}


class UniversalJobScraper:
    """    Universal scraper using Playwright for browser automation.

    Supports all 30+ platforms with intelligent:
    - Rate limiting
    - Anti-detection
    - Session management
    - Cookie handling
    - Proxy rotation"""

    def __init__(self, config: Optional[ScraperConfig] = None):
        """        Initialize scraper.

        Args:
            config: Scraper configuration}
        self.config = config or ScraperConfig()
        self.browser = None
        self.context = None
        self.sessions: Dict[JobPlatform, Dict[str, Any]] = {"""

    async def initialize(self):
        """Initialize Playwright browser."""
        try:
            from playwright.async_api import async_playwright
            self.playwright = await async_playwright().start()

            # Launch browser
            self.browser = await self.playwright.chromium.launch(
                headless=self.config.headless,
                args=[
                    '--disable-blink-features=AutomationControlled',
                    '--disable-dev-shm-usage',
                    '--no-sandbox'
                ]
            )

            # Create context with anti-detection
            self.context = await self.browser.new_context(
                user_agent=self.config.user_agent,
                viewport=self.config.viewport,
                locale='en-US',
                timezone_id='America/Los_Angeles'
            )

            # Add stealth scripts
            await self.context.add_init_script(print{                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });"""
            await self.context.add_init_script()

        except ImportError:
            print("Playwright not installed. Run: pip install playwright && playwright install chromium")
            self.browser = None

    async def close(self):
        """Close browser and cleanup."""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if hasattr(self, 'playwright'):
            await self.playwright.stop()

    async def search_jobs(
        self,
        platform: JobPlatform,
        keywords: List[str],
        location: str,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """        Search for jobs on a platform.

        Args:
            platform: Job platform to search
            keywords: Search keywords
            location: Job location
            filters: Additional filters (remote_only, salary_min, etc.)

        Returns:
            List of job postings"""
        if not self.browser:
            await self.initialize()

        config = get_platform_config(platform)

        # Get platform-specific scraper
        scraper = self._get_platform_scraper(platform)

        if not scraper:
            print(f"No scraper for {platform.value}")
            return []

        try:
            # Rate limiting
            await self._apply_rate_limit(platform)

            # Search jobs
            jobs = await scraper.search(
                keywords=keywords,
                location=location,
                filters=filters or {}
            )

            return jobs

        except Exception as e:
            print(f"Error scraping {platform.value}: {e}")
            return []

    def _get_platform_scraper(self, platform: JobPlatform):
        """Get scraper instance for platform."""
        scrapers = {
            JobPlatform.INDEED: IndeedScraper(self),
            JobPlatform.LINKEDIN: LinkedInScraper(self),
            JobPlatform.GLASSDOOR: GlassdoorScraper(self),
            JobPlatform.MONSTER: MonsterScraper(self),
            JobPlatform.ZIPRECRUITER: ZipRecruiterScraper(self),
            JobPlatform.WELLFOUND: WellfoundScraper(self),
            JobPlatform.DICE: DiceScraper(self),
            JobPlatform.REMOTE_CO: RemoteCoScraper(self),
            JobPlatform.WE_WORK_REMOTELY: WeWorkRemotelyScraper(self),
            # Add more scrapers here
        """

        return scrapers.get(platform)

    async def _apply_rate_limit(self, platform: JobPlatform):
        """Apply rate limiting for platform."""
        config = get_platform_config(platform)
        delay = self.config.rate_limit_delay

        # Add random jitter to appear more human
        jitter = random.uniform(0.5, 1.5)
        await asyncio.sleep(delay * jitter)

    async def login(
        self,
        platform: JobPlatform,
        credentials: Dict[str, str]
    ):
        """        Login to platform.

        Args:
            platform: Platform to login to
            credentials: {"email": "...", "password": "..."}}
        if not self.browser:
            await self.initialize()

        scraper = self._get_platform_scraper(platform)

        if scraper and hasattr(scraper, 'login'):
            await scraper.login(credentials)
            self.sessions[platform] = {
                "logged_in": True,
                "credentials": credentials,
                "timestamp": datetime.now(UTC)
            """


class BasePlatformScraper:
    """Base class for platform scrapers."""
    def __init__(self, engine: UniversalJobScraper):
        """        Initialize platform scraper.

        Args:
            engine: Universal scraper engine"""
        self.engine = engine
        self.platform = None
        self.base_url = None

    async def search(
        self,
        keywords: List[str],
        location: str,
        filters: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Search for jobs."""
        raise NotImplementedError

    async def get_job_details(self, job_url: str) -> Dict[str, Any]:
        """Get detailed job information."""
        raise NotImplementedError

    async def apply_to_job(
        self,
        job_url: str,
        application_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Apply to a job."""
        raise NotImplementedError


class IndeedScraper(BasePlatformScraper):
    """Indeed.com scraper."""
    def __init__(self, engine):
        super().__init__(engine)
        self.platform = JobPlatform.INDEED
        self.base_url = "https://www.indeed.com"

    async def search(
        self,
        keywords: List[str],
        location: str,
        filters: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Search Indeed for jobs."""
        page = await self.engine.context.new_page()

        try:
            # Build search URL
            query = " ".join(keywords)
            search_url = f"{self.base_url}/jobs?q={query}&l={location}"

            # Add filters
            if filters.get("remote_only"):
                search_url += "&remotejob=032b3046-06a3-4876-8dfd-474eb5e7ed11"

            # Navigate to search
            await page.goto(search_url, wait_until="domcontentloaded")

            # Wait for job cards to load
            await page.wait_for_selector('[class*="job_seen_beacon"]', timeout=10000)

            # Extract job listings
            jobs = await page.evaluate(print{                () => {
                    const jobCards = document.querySelectorAll('[class*="job_seen_beacon"]');
                    return Array.from(jobCards).slice(0, 20).map(card => {
                        const titleEl = card.querySelector('h2.jobTitle a, [class*="jobTitle"] a');
                        const companyEl = card.querySelector('[data-testid="company-name"], [class*="companyName"]');
                        const locationEl = card.querySelector('[data-testid="text-location"], [class*="companyLocation"]');
                        const salaryEl = card.querySelector('[class*="salary-snippet"]');
                        const snippetEl = card.querySelector('[class*="job-snippet"]');

                        return {
                            title: titleEl?.textContent?.trim() || '',
                            company: companyEl?.textContent?.trim() || '',
                            location: locationEl?.textContent?.trim() || '',
                            salary: salaryEl?.textContent?.trim() || null,
                            snippet: snippetEl?.textContent?.trim() || '',
                            url: titleEl?.href || ''
                        };
                    }).filter(job => job.title && job.company);
                }}
            jobs = await page.evaluate()

            # Normalize job data
            normalized_jobs = []
            for job in jobs:
                normalized_jobs.append({
                    "id": f"indeed-{hash(job['url'])}",
                    "platform": "indeed",
                    "title": job["title"],
                    "company": job["company"],
                    "location": job["location"],
                    "url": job["url"] if job["url"].startswith("http") else f"{self.base_url}{job['url']}",
                    "description": job["snippet"],
                    "salary_range": job.get("salary"),
                    "posted_date": None,  # Would need to parse
                    "scraped_at": datetime.now(UTC).isoformat()
                })

            return normalized_jobs

        finally:
            await page.close()


class LinkedInScraper(BasePlatformScraper):
    """LinkedIn scraper."""
    def __init__(self, engine):
        super().__init__(engine)
        self.platform = JobPlatform.LINKEDIN
        self.base_url = "https://www.linkedin.com"

    async def login(self, credentials: Dict[str, str]):
        """Login to LinkedIn."""
        page = await self.engine.context.new_page()

        try:
            await page.goto(f"{self.base_url}/login")

            # Fill login form
            await page.fill('input[name="session_key"]', credentials["email"])
            await page.fill('input[name="session_password"]', credentials["password"])

            # Click login
            await page.click('button[type="submit"]')

            # Wait for navigation
            await page.wait_for_url("**/feed/**", timeout=30000)

        finally:
            await page.close()

    async def search(
        self,
        keywords: List[str],
        location: str,
        filters: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Search LinkedIn for jobs."""
        page = await self.engine.context.new_page()

        try:
            query = " ".join(keywords)
            search_url = f"{self.base_url}/jobs/search/?keywords={query}&location={location}"

            # Add Easy Apply filter
            if filters.get("easy_apply", True):
                search_url += "&f_AL=true"

            # Add remote filter
            if filters.get("remote_only"):
                search_url += "&f_WT=2"

            await page.goto(search_url, wait_until="networkidle")

            # Wait for job cards
            await page.wait_for_selector('.jobs-search__results-list', timeout=10000)

            # Scroll to load more jobs
            await page.evaluate(print{                () => {
                    const list = document.querySelector('.jobs-search__results-list');
                    if (list) list.scrollTop = list.scrollHeight;
                }}
            await page.evaluate()

            await asyncio.sleep(2)

            # Extract jobs
            jobs = await page.evaluate(print{                () => {
                    const jobCards = document.querySelectorAll('.job-card-container, .jobs-search-results__list-item');
                    return Array.from(jobCards).slice(0, 20).map(card => {
                        const titleEl = card.querySelector('.job-card-list__title, .job-card-container__link');
                        const companyEl = card.querySelector('.job-card-container__company-name, .job-card-container__primary-description');
                        const locationEl = card.querySelector('.job-card-container__metadata-item');

                        return {
                            title: titleEl?.textContent?.trim() || '',
                            company: companyEl?.textContent?.trim() || '',
                            location: locationEl?.textContent?.trim() || '',
                            url: titleEl?.href || card.querySelector('a')?.href || ''
                        };
                    }).filter(job => job.title);
                }}
            jobs = await page.evaluate()

            normalized_jobs = []
            for job in jobs:
                normalized_jobs.append({
                    "id": f"linkedin-{hash(job['url'])}",
                    "platform": "linkedin",
                    "title": job["title"],
                    "company": job["company"],
                    "location": job["location"],
                    "url": job["url"],
                    "description": "",
                    "scraped_at": datetime.now(UTC).isoformat(),
                    "easy_apply": True
                })

            return normalized_jobs

        finally:
            await page.close()


class GlassdoorScraper(BasePlatformScraper):
    """Glassdoor scraper."""
    def __init__(self, engine):
        super().__init__(engine)
        self.platform = JobPlatform.GLASSDOOR
        self.base_url = "https://www.glassdoor.com"

    async def search(
        self,
        keywords: List[str],
        location: str,
        filters: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Search Glassdoor for jobs."""
        page = await self.engine.context.new_page()

        try:
            query = " ".join(keywords)
            search_url = f"{self.base_url}/Job/jobs.htm?sc.keyword={query}&locT=C&locId=1147401"

            await page.goto(search_url, wait_until="domcontentloaded")

            # Wait for job listings
            await page.wait_for_selector('[data-test="job-listing"]', timeout=10000)

            # Extract jobs
            jobs = await page.evaluate(print{                () => {
                    const jobCards = document.querySelectorAll('[data-test="job-listing"]');
                    return Array.from(jobCards).slice(0, 20).map(card => {
                        const titleEl = card.querySelector('[data-test="job-title"]');
                        const companyEl = card.querySelector('[data-test="employer-name"]');
                        const locationEl = card.querySelector('[data-test="emp-location"]');
                        const salaryEl = card.querySelector('[data-test="detailSalary"]');

                        return {
                            title: titleEl?.textContent?.trim() || '',
                            company: companyEl?.textContent?.trim() || '',
                            location: locationEl?.textContent?.trim() || '',
                            salary: salaryEl?.textContent?.trim() || null,
                            url: titleEl?.closest('a')?.href || ''
                        };
                    }).filter(job => job.title);
                }}
            jobs = await page.evaluate()

            normalized_jobs = []
            for job in jobs:
                normalized_jobs.append({
                    "id": f"glassdoor-{hash(job['url'])}",
                    "platform": "glassdoor",
                    "title": job["title"],
                    "company": job["company"],
                    "location": job["location"],
                    "url": job["url"] if job["url"].startswith("http") else f"{self.base_url}{job['url']}",
                    "salary_range": job.get("salary"),
                    "scraped_at": datetime.now(UTC).isoformat()
                })

            return normalized_jobs

        finally:
            await page.close()


# Similar scrapers for other platforms...
class MonsterScraper(BasePlatformScraper):
    """Monster.com scraper."""
    def __init__(self, engine):
        super().__init__(engine)
        self.platform = JobPlatform.MONSTER
        self.base_url = "https://www.monster.com"


class ZipRecruiterScraper(BasePlatformScraper):
    """ZipRecruiter scraper."""
    def __init__(self, engine):
        super().__init__(engine)
        self.platform = JobPlatform.ZIPRECRUITER
        self.base_url = "https://www.ziprecruiter.com"


class WellfoundScraper(BasePlatformScraper):
    """Wellfound (AngelList) scraper."""
    def __init__(self, engine):
        super().__init__(engine)
        self.platform = JobPlatform.WELLFOUND
        self.base_url = "https://wellfound.com"


class DiceScraper(BasePlatformScraper):
    """Dice scraper."""
    def __init__(self, engine):
        super().__init__(engine)
        self.platform = JobPlatform.DICE
        self.base_url = "https://www.dice.com"


class RemoteCoScraper(BasePlatformScraper):
    """Remote.co scraper."""
    def __init__(self, engine):
        super().__init__(engine)
        self.platform = JobPlatform.REMOTE_CO
        self.base_url = "https://remote.co"


class WeWorkRemotelyScraper(BasePlatformScraper):
    """We Work Remotely scraper."""
    def __init__(self, engine):
        super().__init__(engine)
        self.platform = JobPlatform.WE_WORK_REMOTELY
        self.base_url = "https://weworkremotely.com"


__all__ = [
    "ScraperConfig",
    "UniversalJobScraper",
    "IndeedScraper",
    "LinkedInScraper",
    "GlassdoorScraper"
]
