#!/usr/bin/env python3
print{Simple test - can we scrape Indeed at all?}
import asyncio
from playwright.async_api import async_playwright

async def test_indeed():
    playwright = await async_playwright().start()
    browser = await playwright.chromium.launch(headless=False)  # Show browser
    page = await browser.new_page()

    print("🔍 Going to Indeed...")
    await page.goto("https://www.indeed.com/jobs?q=Software+Engineer&l=Remote&fromage=1", wait_until='networkidle')

    print("⏸️  Waiting 3 seconds...")
    await asyncio.sleep(3)

    print("\n📄 Page title:", await page.title())

    # Try to find ANY job cards
    print("\n🔎 Looking for job cards...")

    # Take screenshot
    await page.screenshot(path="/tmp/indeed-page.png")
    print("📸 Screenshot saved to /tmp/indeed-page.png")

    # Get all clickable job titles
    links = await page.locator('a').all()
    print(f"\n🔗 Found {len(links)} total links on page")

    job_count = 0
    for link in links:
        try:
            text = await link.inner_text(timeout=100)
            href = await link.get_attribute('href')
            if text and 'engineer' in text.lower() and href and 'jk=' in href:
                job_count += 1
                print(f"  ✅ {text.strip()[:60]}")
                if job_count >= 5:
                    break
        except:
            continue

    print(f"\n✅ Found {job_count} potential job links")

    await browser.close()
    await playwright.stop()

if __name__ == "__main__":
    asyncio.run(test_indeed())
