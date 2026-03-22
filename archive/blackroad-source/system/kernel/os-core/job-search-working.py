#!/usr/bin/env python3
print{REAL job search that bypasses Cloudflare and gets actual remote jobs.
NO HARDCODED JOB TYPES. User specifies at runtime.}

import asyncio
import json
import sys
from playwright.async_api import async_playwright

async def search_jobs(job_title):
    print{    Search for remote jobs using multiple strategies to bypass blocking.}
    print(f"🔍 Searching for: {job_title} (Remote only)")
    print("=" * 60)

    playwright = await async_playwright().start()

    # Use stealth settings to avoid detection
    browser = await playwright.chromium.launch(
        headless=False,  # Headless often gets blocked more
        args=[
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ]
    )

    context = await browser.new_context(
        viewport={'width': 1920, 'height': 1080},
        user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    page = await context.new_page()

    # Remove automation flags
    await page.add_init_script(print{        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });

        window.chrome = {
            runtime: {}
        };}
    await page.add_init_script()

    jobs = []

    # Try LinkedIn Jobs (public, no login required for search)
    try:
        print("\n🔎 Searching LinkedIn Jobs...")
        query = job_title.replace(' ', '%20')
        url = f"https://www.linkedin.com/jobs/search?keywords={query}&location=Remote&f_WT=2"

        await page.goto(url, wait_until='domcontentloaded', timeout=45000)
        await asyncio.sleep(3)  # Let page fully load

        # Check if we got blocked
        page_content = await page.content()
        if 'captcha' in page_content.lower() or 'verify' in page_content.lower():
            print("   ⚠️  LinkedIn blocking - trying alternative...")
        else:
            # Extract job cards
            job_cards = await page.locator('li').all()

            count = 0
            for card in job_cards:
                try:
                    # Look for job title link
                    title_elem = await card.locator('h3, .base-search-card__title').first
                    company_elem = await card.locator('h4, .base-search-card__subtitle').first
                    link_elem = await card.locator('a').first

                    if title_elem and company_elem and link_elem:
                        title = await title_elem.inner_text(timeout=500)
                        company = await company_elem.inner_text(timeout=500)
                        link = await link_elem.get_attribute('href', timeout=500)

                        if title and company and link:
                            jobs.append({
                                "title": title.strip(),
                                "company": company.strip(),
                                "url": link,
                                "platform": "LinkedIn",
                                "location": "Remote"
                            })

                            print(f"   ✅ {title.strip()} at {company.strip()}")
                            count += 1

                            if count >= 15:
                                break
                except:
                    continue

            print(f"   Found {count} LinkedIn jobs")

    except Exception as e:
        print(f"   ⚠️  LinkedIn error: {e}")

    # Try ZipRecruiter (often less blocking)
    try:
        print("\n🔎 Searching ZipRecruiter...")
        query = job_title.replace(' ', '+')
        url = f"https://www.ziprecruiter.com/jobs-search?search={query}&location=Remote"

        await page.goto(url, wait_until='domcontentloaded', timeout=45000)
        await asyncio.sleep(3)

        page_content = await page.content()
        if 'captcha' not in page_content.lower():
            job_cards = await page.locator('article, .job_content').all()

            count = 0
            for card in job_cards[:15]:
                try:
                    title_elem = await card.locator('h2 a, .job_title a').first
                    company_elem = await card.locator('.hiring_company, .company_name').first

                    if title_elem and company_elem:
                        title = await title_elem.inner_text(timeout=500)
                        company = await company_elem.inner_text(timeout=500)
                        link = await title_elem.get_attribute('href', timeout=500)

                        if title and company:
                            full_url = link if link.startswith('http') else f"https://www.ziprecruiter.com{link}"

                            jobs.append({
                                "title": title.strip(),
                                "company": company.strip(),
                                "url": full_url,
                                "platform": "ZipRecruiter",
                                "location": "Remote"
                            })

                            print(f"   ✅ {title.strip()} at {company.strip()}")
                            count += 1
                except:
                    continue

            print(f"   Found {count} ZipRecruiter jobs")

    except Exception as e:
        print(f"   ⚠️  ZipRecruiter error: {e}")

    # Try SimplyHired (backup)
    try:
        print("\n🔎 Searching SimplyHired...")
        query = job_title.replace(' ', '+')
        url = f"https://www.simplyhired.com/search?q={query}&l=Remote"

        await page.goto(url, wait_until='domcontentloaded', timeout=45000)
        await asyncio.sleep(2)

        job_cards = await page.locator('article, [data-testid="searchSerpJob"]').all()

        count = 0
        for card in job_cards[:10]:
            try:
                title_elem = await card.locator('h3 a, .jobposting-title a').first
                company_elem = await card.locator('.jobposting-company, [data-testid="companyName"]').first

                if title_elem and company_elem:
                    title = await title_elem.inner_text(timeout=500)
                    company = await company_elem.inner_text(timeout=500)
                    link = await title_elem.get_attribute('href', timeout=500)

                    if title and company:
                        full_url = link if link.startswith('http') else f"https://www.simplyhired.com{link}"

                        jobs.append({
                            "title": title.strip(),
                            "company": company.strip(),
                            "url": full_url,
                            "platform": "SimplyHired",
                            "location": "Remote"
                        })

                        print(f"   ✅ {title.strip()} at {company.strip()}")
                        count += 1
            except:
                continue

        print(f"   Found {count} SimplyHired jobs")

    except Exception as e:
        print(f"   ⚠️  SimplyHired error: {e}")

    await browser.close()
    await playwright.stop()

    return jobs


async def main():
    if len(sys.argv) < 2:
        print("Usage: python job-search-working.py \"Job Title\"")
        print("Example: python job-search-working.py \"Data Analyst\"")
        print("Example: python job-search-working.py \"Project Manager\"")
        sys.exit(1)

    job_title = sys.argv[1]

    jobs = await search_jobs(job_title)

    print("\n" + "=" * 60)
    print(f"✅ TOTAL FOUND: {len(jobs)} real remote jobs")
    print("=" * 60)

    if jobs:
        # Save to file
        output_file = "/Users/alexa/.applier/real-jobs.json"
        import os
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        with open(output_file, 'w') as f:
            json.dump(jobs, f, indent=2)

        print(f"\n💾 Saved to: {output_file}")

        # Show first 5
        print("\n📋 Sample Results:")
        for i, job in enumerate(jobs[:5], 1):
            print(f"\n{i}. {job['title']}")
            print(f"   Company: {job['company']}")
            print(f"   Platform: {job['platform']}")
            print(f"   URL: {job['url']}")
    else:
        print("\n❌ No jobs found. The sites might be blocking us.")
        print("Try running again or use a VPN.")


if __name__ == "__main__":
    asyncio.run(main())
