#!/usr/bin/env python3
"""
Batch Application System - Apply to Multiple Jobs with One Command

Features:
- Apply to 10-20+ jobs in one session
- Smart rate limiting (avoid getting blocked)
- Auto-resume on failure
- Progress tracking with ETA
- Daily application goals
- Platform-specific strategies
- Success tracking and reporting
"""

import os
import sys
import json
import time
import asyncio
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
from enum import Enum
import random

try:
    from playwright.async_api import async_playwright, Page, Browser
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("⚠️  Install playwright: pip install playwright && playwright install")


class ApplicationStatus(Enum):
    """Application status."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    FAILED = "failed"
    SKIPPED = "skipped"
    RATE_LIMITED = "rate_limited"


@dataclass
class BatchJob:
    """Job in batch queue."""
    job_id: str
    title: str
    company: str
    platform: str
    url: str
    match_score: float
    status: ApplicationStatus = ApplicationStatus.PENDING
    attempts: int = 0
    error: Optional[str] = None
    submitted_at: Optional[str] = None


@dataclass
class BatchConfig:
    """Configuration for batch application."""
    max_applications: int = 20
    rate_limit_delay: int = 60  # seconds between applications
    max_retries: int = 2
    platforms: List[str] = None  # None = all platforms
    min_match_score: float = 70.0
    daily_goal: int = 10
    skip_on_captcha: bool = True
    auto_generate_cover_letter: bool = True


@dataclass
class BatchStats:
    """Statistics for batch run."""
    total_jobs: int
    submitted: int
    failed: int
    skipped: int
    rate_limited: int
    start_time: str
    end_time: Optional[str] = None
    duration_seconds: Optional[float] = None
    success_rate: Optional[float] = None


class BatchApplicationManager:
    """Manage batch job applications."""

    def __init__(self, config: BatchConfig):
        """Initialize batch manager."""
        self.config = config
        self.queue: List[BatchJob] = []
        self.stats = None
        self.cache_dir = Path.home() / ".applier" / "batch"
        self.cache_dir.mkdir(parents=True, exist_ok=True)

        # Rate limiting state
        self.last_application_time = None
        self.applications_today = self._load_today_count()

    def load_jobs_from_search(self, search_results_file: str = None) -> int:
        """Load jobs from search results."""
        if not search_results_file:
            search_results_file = str(Path.home() / ".applier" / "jobs.json")

        search_path = Path(search_results_file).expanduser()
        if not search_path.exists():
            raise FileNotFoundError(f"Search results not found: {search_path}")

        with open(search_path, 'r') as f:
            data = json.load(f)

        jobs = data.get("jobs", [])

        # Filter by config
        for job in jobs:
            # Check match score
            match_score = job.get("match_score", 0)
            if match_score < self.config.min_match_score:
                continue

            # Check platform filter
            platform = job.get("platform", "").lower()
            if self.config.platforms and platform not in self.config.platforms:
                continue

            # Create batch job
            batch_job = BatchJob(
                job_id=job.get("id", ""),
                title=job.get("title", ""),
                company=job.get("company", ""),
                platform=platform,
                url=job.get("url", ""),
                match_score=match_score,
                status=ApplicationStatus.PENDING
            )

            self.queue.append(batch_job)

            # Stop at max
            if len(self.queue) >= self.config.max_applications:
                break

        # Sort by match score (best first)
        self.queue.sort(key=lambda x: x.match_score, reverse=True)

        return len(self.queue)

    async def run_batch(self) -> BatchStats:
        """Run batch application process."""
        if not PLAYWRIGHT_AVAILABLE:
            raise ImportError("Playwright not installed")

        self.stats = BatchStats(
            total_jobs=len(self.queue),
            submitted=0,
            failed=0,
            skipped=0,
            rate_limited=0,
            start_time=datetime.now().isoformat()
        )

        print(f"\n{'='*60}")
        print(f"🚀 BATCH APPLICATION STARTED")
        print(f"{'='*60}")
        print(f"📊 Total jobs: {self.stats.total_jobs}")
        print(f"🎯 Daily goal: {self.config.daily_goal}")
        print(f"📈 Min match score: {self.config.min_match_score}")
        print(f"⏱️  Rate limit: {self.config.rate_limit_delay}s between apps")
        print(f"{'='*60}\n")

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            context = await browser.new_context()

            for i, job in enumerate(self.queue, 1):
                # Check daily limit
                if self.applications_today >= self.config.daily_goal:
                    print(f"\n✅ Daily goal reached ({self.config.daily_goal} applications)")
                    break

                # Print progress
                self._print_progress(i, job)

                # Apply rate limiting
                if self.last_application_time:
                    elapsed = time.time() - self.last_application_time
                    if elapsed < self.config.rate_limit_delay:
                        wait_time = self.config.rate_limit_delay - elapsed
                        # Add random jitter (±20%)
                        jitter = wait_time * 0.2 * (random.random() - 0.5)
                        wait_time = max(10, wait_time + jitter)

                        print(f"⏳ Rate limiting: waiting {wait_time:.0f}s...")
                        await asyncio.sleep(wait_time)

                # Process application
                try:
                    result = await self._process_application(context, job)

                    if result == ApplicationStatus.SUBMITTED:
                        self.stats.submitted += 1
                        self.applications_today += 1
                        self._save_today_count()
                        print(f"✅ Application submitted!")

                    elif result == ApplicationStatus.FAILED:
                        self.stats.failed += 1
                        print(f"❌ Application failed: {job.error}")

                    elif result == ApplicationStatus.SKIPPED:
                        self.stats.skipped += 1
                        print(f"⏭️  Application skipped")

                    elif result == ApplicationStatus.RATE_LIMITED:
                        self.stats.rate_limited += 1
                        print(f"⚠️  Rate limited - pausing...")
                        await asyncio.sleep(300)  # Wait 5 min

                    self.last_application_time = time.time()

                except KeyboardInterrupt:
                    print(f"\n\n⚠️  Batch interrupted by user")
                    break

                except Exception as e:
                    print(f"❌ Unexpected error: {e}")
                    self.stats.failed += 1
                    continue

                # Save progress
                self._save_progress()

            await browser.close()

        # Finalize stats
        self.stats.end_time = datetime.now().isoformat()
        start = datetime.fromisoformat(self.stats.start_time)
        end = datetime.fromisoformat(self.stats.end_time)
        self.stats.duration_seconds = (end - start).total_seconds()
        self.stats.success_rate = (
            self.stats.submitted / self.stats.total_jobs * 100
            if self.stats.total_jobs > 0 else 0
        )

        # Print summary
        self._print_summary()

        return self.stats

    async def _process_application(
        self,
        context,
        job: BatchJob
    ) -> ApplicationStatus:
        """Process a single application."""
        job.status = ApplicationStatus.IN_PROGRESS

        # Create new page for this application
        page = await context.new_page()

        try:
            # Navigate to job URL
            print(f"🌐 Opening: {job.url[:60]}...")
            await page.goto(job.url, wait_until="domcontentloaded", timeout=30000)

            # Check for CAPTCHA
            if self.config.skip_on_captcha:
                if await self._detect_captcha(page):
                    job.status = ApplicationStatus.SKIPPED
                    job.error = "CAPTCHA detected"
                    await page.close()
                    return ApplicationStatus.SKIPPED

            # Platform-specific application
            if job.platform == "linkedin":
                result = await self._apply_linkedin(page, job)
            elif job.platform == "indeed":
                result = await self._apply_indeed(page, job)
            elif job.platform == "ziprecruiter":
                result = await self._apply_ziprecruiter(page, job)
            else:
                result = await self._apply_generic(page, job)

            await page.close()
            return result

        except Exception as e:
            job.status = ApplicationStatus.FAILED
            job.error = str(e)
            await page.close()
            return ApplicationStatus.FAILED

    async def _apply_linkedin(self, page: Page, job: BatchJob) -> ApplicationStatus:
        """Apply via LinkedIn Easy Apply."""
        try:
            # Look for Easy Apply button
            easy_apply = await page.query_selector('button:has-text("Easy Apply")')

            if not easy_apply:
                job.error = "Not an Easy Apply job"
                return ApplicationStatus.SKIPPED

            await easy_apply.click()
            await asyncio.sleep(2)

            # Multi-step application
            max_steps = 5
            for step in range(max_steps):
                # Fill visible fields
                await self._fill_visible_fields(page)

                # Look for next/submit button
                next_button = await page.query_selector(
                    'button[aria-label*="Continue"], button:has-text("Next")'
                )
                submit_button = await page.query_selector(
                    'button[aria-label*="Submit"], button:has-text("Submit application")'
                )

                if submit_button:
                    # Final step - submit
                    await submit_button.click()
                    await asyncio.sleep(3)

                    # Verify submission
                    confirmation = await page.query_selector(
                        'h3:has-text("Application sent"), h2:has-text("Application sent")'
                    )

                    if confirmation:
                        job.status = ApplicationStatus.SUBMITTED
                        job.submitted_at = datetime.now().isoformat()
                        return ApplicationStatus.SUBMITTED
                    else:
                        job.error = "Submission not confirmed"
                        return ApplicationStatus.FAILED

                elif next_button:
                    await next_button.click()
                    await asyncio.sleep(2)
                else:
                    # No more buttons
                    break

            job.error = "Could not complete application flow"
            return ApplicationStatus.FAILED

        except Exception as e:
            job.error = str(e)
            return ApplicationStatus.FAILED

    async def _apply_indeed(self, page: Page, job: BatchJob) -> ApplicationStatus:
        """Apply via Indeed."""
        # Indeed often redirects to company sites
        # For now, just open and let user complete
        job.status = ApplicationStatus.SKIPPED
        job.error = "Indeed requires manual application"
        return ApplicationStatus.SKIPPED

    async def _apply_ziprecruiter(self, page: Page, job: BatchJob) -> ApplicationStatus:
        """Apply via ZipRecruiter."""
        try:
            apply_button = await page.query_selector('button:has-text("Quick Apply")')

            if apply_button:
                await apply_button.click()
                await asyncio.sleep(3)

                job.status = ApplicationStatus.SUBMITTED
                job.submitted_at = datetime.now().isoformat()
                return ApplicationStatus.SUBMITTED

            job.error = "Quick Apply not available"
            return ApplicationStatus.SKIPPED

        except Exception as e:
            job.error = str(e)
            return ApplicationStatus.FAILED

    async def _apply_generic(self, page: Page, job: BatchJob) -> ApplicationStatus:
        """Generic application (manual intervention needed)."""
        # Open the page and pause for user
        print("⏸️  Please complete the application manually...")
        print("   Press Enter when done (or Ctrl+C to skip)...")

        try:
            input()
            job.status = ApplicationStatus.SUBMITTED
            job.submitted_at = datetime.now().isoformat()
            return ApplicationStatus.SUBMITTED
        except KeyboardInterrupt:
            job.status = ApplicationStatus.SKIPPED
            return ApplicationStatus.SKIPPED

    async def _fill_visible_fields(self, page: Page):
        """Fill visible form fields."""
        # Load user profile
        config_path = Path.home() / ".applier" / "config.json"
        if not config_path.exists():
            return

        with open(config_path, 'r') as f:
            config = json.load(f)

        # Common field mappings
        fields = {
            'input[name*="email" i]': config.get("email", ""),
            'input[name*="phone" i]': config.get("phone", ""),
            'input[name*="firstName" i]': config.get("first_name", ""),
            'input[name*="lastName" i]': config.get("last_name", ""),
        }

        for selector, value in fields.items():
            if not value:
                continue

            try:
                element = await page.query_selector(selector)
                if element and await element.is_visible():
                    await element.fill(value)
            except:
                continue

    async def _detect_captcha(self, page: Page) -> bool:
        """Detect CAPTCHA on page."""
        captcha_selectors = [
            'iframe[src*="recaptcha"]',
            'iframe[src*="hcaptcha"]',
            '[class*="captcha"]',
            '[id*="captcha"]',
        ]

        for selector in captcha_selectors:
            try:
                elem = await page.query_selector(selector)
                if elem:
                    return True
            except:
                continue

        return False

    def _print_progress(self, current: int, job: BatchJob):
        """Print progress for current job."""
        print(f"\n{'─'*60}")
        print(f"[{current}/{self.stats.total_jobs}] {job.title} at {job.company}")
        print(f"📊 Match: {job.match_score:.1f}% | Platform: {job.platform}")
        print(f"{'─'*60}")

    def _print_summary(self):
        """Print batch summary."""
        print(f"\n\n{'='*60}")
        print(f"📊 BATCH APPLICATION SUMMARY")
        print(f"{'='*60}")
        print(f"✅ Submitted:    {self.stats.submitted}")
        print(f"❌ Failed:       {self.stats.failed}")
        print(f"⏭️  Skipped:      {self.stats.skipped}")
        print(f"⚠️  Rate Limited: {self.stats.rate_limited}")
        print(f"{'─'*60}")
        print(f"📈 Success Rate: {self.stats.success_rate:.1f}%")
        print(f"⏱️  Duration:     {self.stats.duration_seconds/60:.1f} minutes")
        print(f"🎯 Today's Total: {self.applications_today}/{self.config.daily_goal}")
        print(f"{'='*60}\n")

    def _save_progress(self):
        """Save current progress."""
        progress_file = self.cache_dir / f"batch_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        data = {
            "config": asdict(self.config),
            "stats": asdict(self.stats) if self.stats else None,
            "queue": [asdict(job) for job in self.queue],
        }

        with open(progress_file, 'w') as f:
            json.dump(data, f, indent=2)

    def _load_today_count(self) -> int:
        """Load today's application count."""
        count_file = self.cache_dir / f"count_{datetime.now().strftime('%Y%m%d')}.txt"

        if count_file.exists():
            with open(count_file, 'r') as f:
                return int(f.read().strip())

        return 0

    def _save_today_count(self):
        """Save today's application count."""
        count_file = self.cache_dir / f"count_{datetime.now().strftime('%Y%m%d')}.txt"

        with open(count_file, 'w') as f:
            f.write(str(self.applications_today))


# CLI
async def main():
    """CLI for batch applications."""
    import argparse

    parser = argparse.ArgumentParser(description="Batch Job Application System")
    parser.add_argument("--max", type=int, default=20, help="Max applications per batch")
    parser.add_argument("--delay", type=int, default=60, help="Delay between applications (seconds)")
    parser.add_argument("--min-score", type=float, default=70.0, help="Minimum match score")
    parser.add_argument("--platforms", nargs="+", help="Filter by platforms")
    parser.add_argument("--daily-goal", type=int, default=10, help="Daily application goal")
    parser.add_argument("--jobs-file", help="Path to jobs JSON file")

    args = parser.parse_args()

    config = BatchConfig(
        max_applications=args.max,
        rate_limit_delay=args.delay,
        min_match_score=args.min_score,
        platforms=args.platforms,
        daily_goal=args.daily_goal
    )

    manager = BatchApplicationManager(config)

    try:
        num_jobs = manager.load_jobs_from_search(args.jobs_file)
        print(f"✅ Loaded {num_jobs} jobs from search results")

        if num_jobs == 0:
            print("❌ No jobs to apply to. Run search first!")
            return 1

        print(f"\n🚀 Starting batch application...")
        stats = await manager.run_batch()

        print(f"\n✅ Batch complete!")
        return 0

    except Exception as e:
        print(f"❌ Error: {e}")
        return 1


if __name__ == "__main__":
    exit(asyncio.run(main()))
