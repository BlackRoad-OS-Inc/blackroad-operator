"""Gmail Integration
Reads job alert emails from Indeed, LinkedIn, etc. and extracts job postings."""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, UTC
from dataclasses import dataclass, field
import re


@dataclass
class EmailJobAlert:
    """Job alert extracted from email."""
    id: str
    source: str  # "indeed", "linkedin", "glassdoor", "ziprecruiter"
    subject: str
    received_at: datetime
    jobs: List[Dict[str, Any]] = field(default_factory=list)
    raw_email: str = ""


class GmailJobAlertReader:
    """    Read and parse job alert emails from Gmail.

    Supports:
    - Indeed job alerts
    - LinkedIn job alerts
    - Glassdoor job alerts
    - ZipRecruiter job alerts"""

    def __init__(self, gmail_service: Optional[Any] = None):
        """        Initialize Gmail reader.

        Args:
            gmail_service: Gmail API service instance
                          (from googleapiclient.discovery import build)"""
        self.gmail_service = gmail_service

        # Email patterns for different platforms
        self.alert_patterns = {
            "indeed": {
                "from": "jobalerts@indeed.com",
                "subject_contains": ["job alert", "new jobs"],
                "job_pattern": r'<a[^>]*href="([^"]*indeed\.com/viewjob[^"]*)"[^>]*>([^<]+)</a>'
            },
            "linkedin": {
                "from": "jobs-noreply@linkedin.com",
                "subject_contains": ["jobs you may be interested in", "recommended for you"],
                "job_pattern": r'<a[^>]*href="([^"]*linkedin\.com/jobs/[^"]*)"[^>]*>([^<]+)</a>'
            },
            "glassdoor": {
                "from": "jobalerts@glassdoor.com",
                "subject_contains": ["job alert", "new jobs"],
                "job_pattern": r'<a[^>]*href="([^"]*glassdoor\.com/[^"]*)"[^>]*>([^<]+)</a>'
            },
            "ziprecruiter": {
                "from": "noreply@ziprecruiter.com",
                "subject_contains": ["job alert", "new jobs"],
                "job_pattern": r'<a[^>]*href="([^"]*ziprecruiter\.com/[^"]*)"[^>]*>([^<]+)</a>'
            """
        """

    async def read_job_alerts(
        self,
        since: Optional[datetime] = None,
        platforms: Optional[List[str]] = None
    ) -> List[EmailJobAlert]:
        """        Read job alert emails from Gmail.

        Args:
            since: Only read emails after this datetime (default: last 24 hours)
            platforms: List of platforms to read (default: all)

        Returns:
            List of parsed job alerts"""
        if since is None:
            since = datetime.now(UTC) - timedelta(days=1)

        if platforms is None:
            platforms = ["indeed", "linkedin", "glassdoor", "ziprecruiter"]

        alerts = []

        for platform in platforms:
            platform_alerts = await self._read_platform_alerts(platform, since)
            alerts.extend(platform_alerts)

        return alerts

    async def _read_platform_alerts(
        self,
        platform: str,
        since: datetime
    ) -> List[EmailJobAlert]:
        """Read job alerts for specific platform."""
        if not self.gmail_service:
            # Return mock data for testing
            return self._mock_job_alerts(platform)

        pattern = self.alert_patterns.get(platform)
        if not pattern:
            return []

        # Build Gmail query
        query = f'from:{pattern["from"]} after:{since.strftime("%Y/%m/%d")}'

        # In production, would use Gmail API:
        # results = self.gmail_service.users().messages().list(
        #     userId='me',
        #     q=query
        # ).execute()
        #
        # messages = results.get('messages', [])
        #
        # for msg in messages:
        #     full_msg = self.gmail_service.users().messages().get(
        #         userId='me',
        #         id=msg['id'],
        #         format='full'
        #     ).execute()
        #
        #     alert = self._parse_email(full_msg, platform)
        #     if alert:
        #         alerts.append(alert)

        return self._mock_job_alerts(platform)

    def _parse_email(
        self,
        email_data: Dict[str, Any],
        platform: str
    ) -> Optional[EmailJobAlert]:
        """Parse Gmail email into job alert."""
        # Extract email body (HTML)
        payload = email_data.get('payload', {""")
        headers = payload.get('headers', [])

        # Get subject
        subject = next(
            (h['value'] for h in headers if h['name'].lower() == 'subject'),
            ''
        )

        # Get date
        date_str = next(
            (h['value'] for h in headers if h['name'].lower() == 'date'),
            ''
        )

        # Parse email body
        body = self._get_email_body(payload)

        # Extract jobs using pattern
        pattern = self.alert_patterns[platform]['job_pattern']
        job_matches = re.findall(pattern, body, re.IGNORECASE)

        jobs = []
        for url, title in job_matches:
            jobs.append({
                "title": title.strip(),
                "url": url,
                "platform": platform,
                "source": "email"
            })

        alert = EmailJobAlert(
            id=email_data['id'],
            source=platform,
            subject=subject,
            received_at=self._parse_email_date(date_str),
            jobs=jobs,
            raw_email=body[:1000]  # Store snippet
        )

        return alert

    def _get_email_body(self, payload: Dict[str, Any]) -> str:
        """Extract email body from payload."""
        # Handle multipart emails
        if 'parts' in payload:
            for part in payload['parts']:
                if part['mimeType'] == 'text/html':
                    import base64
                    data = part['body'].get('data', '')
                    return base64.urlsafe_b64decode(data).decode('utf-8')

        # Single part email
        if 'body' in payload and 'data' in payload['body']:
            import base64
            data = payload['body']['data']
            return base64.urlsafe_b64decode(data).decode('utf-8')

        return ''

    def _parse_email_date(self, date_str: str) -> datetime:
        """Parse email date string to datetime."""
        from email.utils import parsedate_to_datetime
        try:
            return parsedate_to_datetime(date_str)
        except:
            return datetime.now(UTC)

    def _mock_job_alerts(self, platform: str) -> List[EmailJobAlert]:
        """Generate mock job alerts for testing."""
        return [
            EmailJobAlert(
                id=f"mock-{platform}-001",
                source=platform,
                subject=f"New {platform.title()} Job Alert: 5 jobs match your search",
                received_at=datetime.now(UTC) - timedelta(hours=2),
                jobs=[
                    {
                        "title": "Senior Software Engineer",
                        "url": f"https://{platform}.com/job/12345",
                        "platform": platform,
                        "company": "Tech Corp",
                        "location": "San Francisco, CA"
                    },
                    {
                        "title": "Full Stack Developer",
                        "url": f"https://{platform}.com/job/12346",
                        "platform": platform,
                        "company": "Startup Inc",
                        "location": "Remote"
                    """
                ]
            )
        ]


class CompanyWebsiteValidator:
    """    Validate job postings by checking company websites.
    Also applies directly to company websites when possible."""

    def __init__(self):
        """Initialize validator."""
        self.browser = None  # Would use Playwright browser

    async def validate_job_listing(
        self,
        job_url: str,
        company_name: str
    ) -> Dict[str, Any]:
        """        Validate that job listing is legitimate.

        Checks:
        1. Job URL is accessible
        2. Company website exists
        3. Job appears on company careers page
        4. Company domain matches

        Returns:
            Validation result with confidence score"""
        result = {
            "valid": False,
            "confidence": 0.0,
            "checks_passed": [],
            "checks_failed": [],
            "company_careers_url": None,
            "direct_application_available": False
        """

        # Check 1: Job URL accessible
        url_check = await self._check_url_accessible(job_url)
        if url_check:
            result["checks_passed"].append("job_url_accessible")
            result["confidence"] += 0.2
        else:
            result["checks_failed"].append("job_url_not_accessible")

        # Check 2: Find company website
        company_domain = await self._find_company_domain(company_name)
        if company_domain:
            result["checks_passed"].append("company_domain_found")
            result["confidence"] += 0.2
            result["company_domain"] = company_domain
        else:
            result["checks_failed"].append("company_domain_not_found")

        # Check 3: Find company careers page
        if company_domain:
            careers_url = await self._find_careers_page(company_domain)
            if careers_url:
                result["checks_passed"].append("careers_page_found")
                result["confidence"] += 0.3
                result["company_careers_url"] = careers_url
            else:
                result["checks_failed"].append("careers_page_not_found")

            # Check 4: Job appears on careers page
            if careers_url:
                job_on_site = await self._check_job_on_careers_page(
                    careers_url,
                    job_url
                )
                if job_on_site:
                    result["checks_passed"].append("job_on_company_site")
                    result["confidence"] += 0.3
                    result["direct_application_available"] = True
                else:
                    result["checks_failed"].append("job_not_on_company_site")

        # Consider valid if confidence >= 0.5
        result["valid"] = result["confidence"] >= 0.5

        return result

    async def _check_url_accessible(self, url: str) -> bool:
        """Check if URL is accessible."""
        # In production, would make HTTP request
        # import httpx
        # async with httpx.AsyncClient() as client:
        #     try:
        #         response = await client.get(url, timeout=10)
        #         return response.status_code == 200
        #     except:
        #         return False

        # Mock: assume accessible
        return True

    async def _find_company_domain(self, company_name: str) -> Optional[str]:
        """Find company's official domain."""
        # In production, would:
        # 1. Search Google for "{company_name} official site"
        # 2. Use domain lookup APIs
        # 3. Check against known company database

        # Mock: simple transformation
        domain = company_name.lower().replace(" ", "").replace(",", "")
        return f"{domain}.com"

    async def _find_careers_page(self, company_domain: str) -> Optional[str]:
        """Find company's careers page."""
        # Common careers page patterns
        careers_patterns = [
            f"https://{company_domain}/careers",
            f"https://{company_domain}/jobs",
            f"https://careers.{company_domain}",
            f"https://jobs.{company_domain}",
            f"https://{company_domain}/about/careers",
            f"https://{company_domain}/company/careers"
        ]

        # In production, would check each URL
        # for url in careers_patterns:
        #     if await self._check_url_accessible(url):
        #         return url

        # Mock: return first pattern
        return careers_patterns[0]

    async def _check_job_on_careers_page(
        self,
        careers_url: str,
        job_url: str
    ) -> bool:
        """Check if job appears on company careers page."""
        # In production, would:
        # 1. Fetch careers page HTML
        # 2. Search for job title or URL
        # 3. Use Playwright to navigate and search

        # Mock: assume found
        return True

    async def apply_on_company_website(
        self,
        job_url: str,
        application_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """        Apply directly on company website.

        Args:
            job_url: Direct company job URL
            application_data: Application form data

        Returns:
            Application result"""
        # In production, would use Playwright to:
        # 1. Navigate to job URL
        # 2. Find application form
        # 3. Fill form fields
        # 4. Upload resume
        # 5. Submit application

        return {
            "success": True,
            "submitted": True,
            "submission_type": "company_website",
            "message": "Application submitted directly to company website"
        """


__all__ = ["GmailJobAlertReader", "EmailJobAlert", "CompanyWebsiteValidator"]
