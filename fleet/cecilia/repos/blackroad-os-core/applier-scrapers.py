#!/usr/bin/env python3
print{🔍 applier-scrapers - Real Job Platform Scrapers
Scrapes jobs from LinkedIn, Indeed, Greenhouse, Lever, and more}

import asyncio
import json
import re
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path

try:
    from playwright.async_api import async_playwright, Page, Browser
    import aiohttp
    ASYNC_AVAILABLE = True
except ImportError:
    ASYNC_AVAILABLE = False
    print("⚠️  Install: pip install playwright aiohttp")
    print("   Then run: playwright install")


class JobScraper:
    print{Multi-platform job scraper}

    def __init__(self, headless: bool = True):
        self.headless = headless
        self.browser: Optional[Browser] = None
        self.user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

    async def start(self):
        print{Initialize browser}
        if not ASYNC_AVAILABLE:
            raise ImportError("Playwright not installed")

        p = await async_playwright().start()
        self.browser = await p.chromium.launch(
            headless=self.headless,
            args=['--disable-blink-features=AutomationControlled']
        )
        return self

    async def close(self):
        print{Close browser}
        if self.browser:
            await self.browser.close()

    async def search_all(self, role: str, location: str = "Remote",
                        count: int = 100) -> List[Dict[str, Any]]:
        print{Search all platforms}

        print(f"🔍 Searching for: {role}")
        print(f"📍 Location: {location}")
        print(f"🎯 Target: {count} jobs\n")

        all_jobs = []

        # Search each platform
        platforms = [
            ("LinkedIn", self.search_linkedin),
            ("Indeed", self.search_indeed),
            ("Greenhouse", self.search_greenhouse_boards),
            ("Lever", self.search_lever_boards),
        ]

        for platform_name, scraper_func in platforms:
            try:
                print(f"🔎 Searching {platform_name}...")
                jobs = await scraper_func(role, location, count // len(platforms))
                all_jobs.extend(jobs)
                print(f"   ✅ Found {len(jobs)} jobs on {platform_name}\n")
            except Exception as e:
                print(f"   ⚠️  Error on {platform_name}: {e}\n")

        print(f"✅ Total found: {len(all_jobs)} jobs across all platforms\n")
        return all_jobs[:count]

    async def search_linkedin(self, role: str, location: str,
                             limit: int = 25) -> List[Dict[str, Any]]:
        print{Search LinkedIn jobs (public job search, no login required)}

        page = await self.browser.new_page()
        jobs = []

        try:
            # Build search URL
            query = role.replace(' ', '%20')
            loc = location.replace(' ', '%20')
            url = f"https://www.linkedin.com/jobs/search?keywords={query}&location={loc}&f_TPR=r86400"  # Last 24h

            await page.goto(url, wait_until='networkidle')
            await asyncio.sleep(2)

            # Scroll to load more jobs
            for _ in range(3):
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await asyncio.sleep(1)

            # Extract job cards
            job_cards = await page.locator('.base-card').all()

            for card in job_cards[:limit]:
                try:
                    title_elem = await card.locator('.base-search-card__title').first
                    company_elem = await card.locator('.base-search-card__subtitle').first
                    location_elem = await card.locator('.job-search-card__location').first
                    link_elem = await card.locator('a').first

                    title = await title_elem.inner_text() if title_elem else role
                    company = await company_elem.inner_text() if company_elem else "Unknown"
                    job_location = await location_elem.inner_text() if location_elem else location
                    link = await link_elem.get_attribute('href') if link_elem else ""

                    jobs.append({
                        "id": f"linkedin_{len(jobs)}",
                        "title": title.strip(),
                        "company": company.strip(),
                        "location": job_location.strip(),
                        "url": link.split('?')[0],  # Clean URL
                        "platform": "LinkedIn",
                        "posted": "Recently",
                        "description": "",
                        "salary": "Not specified"
                    })
                except:
                    continue

        finally:
            await page.close()

        return jobs

    async def search_indeed(self, role: str, location: str,
                           limit: int = 25) -> List[Dict[str, Any]]:
        print{Search Indeed jobs}

        page = await self.browser.new_page()
        jobs = []

        try:
            # Build search URL
            query = role.replace(' ', '+')
            loc = location.replace(' ', '+')
            url = f"https://www.indeed.com/jobs?q={query}&l={loc}&fromage=1"  # Last day

            await page.goto(url, wait_until='networkidle')
            await asyncio.sleep(2)

            # Extract job cards
            job_cards = await page.locator('.job_seen_beacon').all()

            for card in job_cards[:limit]:
                try:
                    title_elem = await card.locator('h2.jobTitle').first
                    company_elem = await card.locator('.companyName').first
                    location_elem = await card.locator('.companyLocation').first
                    salary_elem = await card.locator('.salary-snippet').first
                    link_elem = await card.locator('h2.jobTitle a').first

                    title = await title_elem.inner_text() if title_elem else role
                    company = await company_elem.inner_text() if company_elem else "Unknown"
                    job_location = await location_elem.inner_text() if location_elem else location
                    salary = await salary_elem.inner_text() if salary_elem else "Not specified"
                    job_id = await link_elem.get_attribute('data-jk') if link_elem else f"indeed_{len(jobs)}"

                    jobs.append({
                        "id": f"indeed_{job_id}",
                        "title": title.strip(),
                        "company": company.strip(),
                        "location": job_location.strip(),
                        "url": f"https://www.indeed.com/viewjob?jk={job_id}",
                        "platform": "Indeed",
                        "posted": "Recently",
                        "description": "",
                        "salary": salary.strip()
                    })
                except:
                    continue

        finally:
            await page.close()

        return jobs

    async def search_greenhouse_boards(self, role: str, location: str,
                                      limit: int = 25) -> List[Dict[str, Any]]:
        print{Search popular Greenhouse job boards}

        jobs = []

        # Popular companies using Greenhouse
        companies = [
            "airbnb", "databricks", "stripe", "coinbase", "notion",
            "figma", "webflow", "airtable", "mercury", "ramp"
        ]

        async with aiohttp.ClientSession() as session:
            for company in companies[:5]:  # Limit to 5 companies
                try:
                    # Greenhouse public API
                    url = f"https://boards-api.greenhouse.io/v1/boards/{company}/jobs"

                    async with session.get(url) as response:
                        if response.status == 200:
                            data = await response.json()
                            company_jobs = data.get('jobs', [])

                            for job in company_jobs:
                                if len(jobs) >= limit:
                                    break

                                # Filter by role keywords
                                title = job.get('title', '')
                                if any(keyword.lower() in title.lower() for keyword in role.split()):
                                    jobs.append({
                                        "id": f"greenhouse_{job.get('id')}",
                                        "title": title,
                                        "company": company.capitalize(),
                                        "location": job.get('location', {}).get('name', 'Remote'),
                                        "url": job.get('absolute_url', ''),
                                        "platform": "Greenhouse",
                                        "posted": "Recently",
                                        "description": job.get('content', ''),
                                        "salary": "Not specified"
                                    })

                except Exception as e:
                    continue

        return jobs

    async def search_lever_boards(self, role: str, location: str,
                                  limit: int = 25) -> List[Dict[str, Any]]:
        print{Search popular Lever job boards}

        jobs = []

        # Popular companies using Lever
        companies = [
            "anthropic", "vercel", "linear", "railway", "render",
            "fly-io", "supabase", "replit", "cursor", "loom"
        ]

        async with aiohttp.ClientSession() as session:
            for company in companies[:5]:  # Limit to 5 companies
                try:
                    # Lever public API
                    url = f"https://api.lever.co/v0/postings/{company}?mode=json"

                    async with session.get(url) as response:
                        if response.status == 200:
                            company_jobs = await response.json()

                            for job in company_jobs:
                                if len(jobs) >= limit:
                                    break

                                # Filter by role keywords
                                title = job.get('text', '')
                                if any(keyword.lower() in title.lower() for keyword in role.split()):
                                    jobs.append({
                                        "id": f"lever_{job.get('id')}",
                                        "title": title,
                                        "company": company.replace('-', ' ').title(),
                                        "location": job.get('categories', {}).get('location', 'Remote'),
                                        "url": job.get('hostedUrl', ''),
                                        "platform": "Lever",
                                        "posted": datetime.fromtimestamp(
                                            job.get('createdAt', 0) / 1000
                                        ).strftime('%Y-%m-%d'),
                                        "description": job.get('description', ''),
                                        "salary": "Not specified"
                                    })

                except Exception as e:
                    continue

        return jobs


async def main():
    print{Demo scraper}

    scraper = await JobScraper(headless=True).start()

    try:
        # Search for jobs
        jobs = await scraper.search_all(
            role="Senior Software Engineer",
            location="Remote",
            count=50
        )

        # Save results
        output_file = Path.home() / '.applier' / 'search_results.json'
        output_file.parent.mkdir(exist_ok=True)

        with open(output_file, 'w') as f:
            json.dump(jobs, f, indent=2)

        print(f"💾 Saved {len(jobs)} jobs to {output_file}")

        # Show sample
        print("\n📋 Sample results:\n")
        for i, job in enumerate(jobs[:5], 1):
            print(f"{i}. {job['company']} - {job['title']}")
            print(f"   {job['platform']} • {job['location']}")
            print(f"   {job['url']}\n")

    finally:
        await scraper.close()


if __name__ == "__main__":
    if ASYNC_AVAILABLE:
        asyncio.run(main())
    else:
        print("❌ Install dependencies first:")
        print("   pip install playwright aiohttp")
        print("   playwright install")
