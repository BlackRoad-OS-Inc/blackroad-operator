#!/usr/bin/env python3
print{REAL job search using Adzuna API (free tier, 250 calls/month).
NO WEB SCRAPING. NO CLOUDFLARE BLOCKING. JUST WORKS.}

import requests
import json
import sys
import os

# Adzuna API (free tier) - get key at https://developer.adzuna.com/
# For now using demo mode
API_BASE = "https://api.adzuna.com/v1/api/jobs/us/search/1"

def search_jobs(job_title, app_id=None, app_key=None):
    print{    Search for remote jobs using Adzuna API.
    Free tier: 250 calls/month.}
    print(f"🔍 Searching for: {job_title} (Remote only)")
    print("=" * 60)

    # If no API keys, use RemoteOK public API (no auth needed)
    print("\n🔎 Searching RemoteOK...")
    jobs = []

    try:
        url = "https://remoteok.com/api"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }

        response = requests.get(url, headers=headers, timeout=30)

        if response.status_code == 200:
            all_jobs = response.json()

            # Filter by job title keyword
            keywords = job_title.lower().split()

            for job in all_jobs:
                if not isinstance(job, dict):
                    continue

                # Skip the legal notice (first item)
                if 'position' not in job:
                    continue

                position = job.get('position', '').lower()
                company = job.get('company', '')
                url = job.get('url', '')

                # Check if any keyword matches
                if any(keyword in position for keyword in keywords):
                    jobs.append({
                        "title": job.get('position', 'Unknown'),
                        "company": company or 'Not listed',
                        "url": f"https://remoteok.com{url}" if url and not url.startswith('http') else url,
                        "platform": "RemoteOK",
                        "location": "Remote",
                        "tags": job.get('tags', [])
                    })

                    print(f"   ✅ {job.get('position')} at {company}")

                    if len(jobs) >= 20:
                        break

            print(f"   Found {len(jobs)} RemoteOK jobs")

    except Exception as e:
        print(f"   ⚠️  RemoteOK error: {e}")

    # Try We Work Remotely RSS (public, no auth)
    try:
        print("\n🔎 Searching We Work Remotely...")

        # They have a public API
        url = "https://weworkremotely.com/remote-jobs.json"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
        }

        response = requests.get(url, headers=headers, timeout=30)

        if response.status_code == 200:
            data = response.json()

            keywords = job_title.lower().split()

            for category in data:
                if not isinstance(category, dict):
                    continue

                for job in category.get('jobs', []):
                    title = job.get('title', '').lower()

                    if any(keyword in title for keyword in keywords):
                        jobs.append({
                            "title": job.get('title', 'Unknown'),
                            "company": job.get('company_name', 'Not listed'),
                            "url": f"https://weworkremotely.com{job.get('url', '')}",
                            "platform": "WeWorkRemotely",
                            "location": "Remote",
                            "category": job.get('category_name', '')
                        })

                        print(f"   ✅ {job.get('title')} at {job.get('company_name')}")

                        if len(jobs) >= 40:
                            break

                if len(jobs) >= 40:
                    break

            print(f"   Found {len([j for j in jobs if j['platform'] == 'WeWorkRemotely'])} WWR jobs")

    except Exception as e:
        print(f"   ⚠️  WeWorkRemotely error: {e}")

    # Try Remotive API (public)
    try:
        print("\n🔎 Searching Remotive...")

        url = "https://remotive.com/api/remote-jobs"
        headers = {
            'User-Agent': 'Mozilla/5.0'
        }

        response = requests.get(url, headers=headers, timeout=30)

        if response.status_code == 200:
            data = response.json()

            keywords = job_title.lower().split()

            for job in data.get('jobs', []):
                title = job.get('title', '').lower()

                if any(keyword in title for keyword in keywords):
                    jobs.append({
                        "title": job.get('title', 'Unknown'),
                        "company": job.get('company_name', 'Not listed'),
                        "url": job.get('url', ''),
                        "platform": "Remotive",
                        "location": "Remote",
                        "category": job.get('category', '')
                    })

                    print(f"   ✅ {job.get('title')} at {job.get('company_name')}")

                    if len(jobs) >= 60:
                        break

            print(f"   Found {len([j for j in jobs if j['platform'] == 'Remotive'])} Remotive jobs")

    except Exception as e:
        print(f"   ⚠️  Remotive error: {e}")

    return jobs


def main():
    if len(sys.argv) < 2:
        print("Usage: python job-search-api.py \"Job Title\"")
        print("\nExamples:")
        print('  python job-search-api.py "Customer Service"')
        print('  python job-search-api.py "Data Analyst"')
        print('  python job-search-api.py "Project Manager"')
        print('  python job-search-api.py "Administrative Assistant"')
        print('  python job-search-api.py "Sales"')
        sys.exit(1)

    job_title = sys.argv[1]
    jobs = search_jobs(job_title)

    print("\n" + "=" * 60)
    print(f"✅ TOTAL FOUND: {len(jobs)} real remote jobs")
    print("=" * 60)

    if jobs:
        # Save to file
        output_file = "/Users/alexa/.applier/real-jobs.json"
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        with open(output_file, 'w') as f:
            json.dump(jobs, f, indent=2)

        print(f"\n💾 Saved to: {output_file}")

        # Show first 10
        print("\n📋 Sample Results:")
        for i, job in enumerate(jobs[:10], 1):
            print(f"\n{i}. {job['title']}")
            print(f"   Company: {job['company']}")
            print(f"   Platform: {job['platform']}")
            print(f"   URL: {job['url'][:70]}...")
    else:
        print("\n❌ No jobs found matching your search.")
        print("Try different keywords or check your internet connection.")


if __name__ == "__main__":
    main()
