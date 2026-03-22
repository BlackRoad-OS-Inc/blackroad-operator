#!/usr/bin/env python3
"""Seed RemoteJobs platform with real jobs from RemoteOK API"""

import requests
import json
import time

API_URL = "https://remotejobs-platform.blackroad.workers.dev"
REMOTEOK_URL = "https://remoteok.com/api"

def get_real_jobs():
    """Fetch real jobs from RemoteOK"""
    print("🔍 Fetching real remote jobs from RemoteOK...")

    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    """

    response = requests.get(REMOTEOK_URL, headers=headers, timeout=30)

    if response.status_code != 200:
        print(f"❌ Failed to fetch jobs: {response.status_code}")
        return []

    all_jobs = response.json()
    print(f"✅ Found {len(all_jobs)} total jobs")

    # Extract relevant jobs (skip first item which is legal notice)
    jobs = []
    for item in all_jobs[1:31]:  # Get 30 jobs
        if not isinstance(item, dict) or 'position' not in item:
            continue

        jobs.append(item)

    return jobs


def post_job_to_platform(job):
    """Post a job to our platform"""
    # Map RemoteOK job to our format
    job_data = {
        "title": job.get('position', 'Unknown Position'),
        "company": job.get('company', 'Remote Company'),
        "description": f"{job.get('description', 'No description available')}\n\nTags: {', '.join(job.get('tags', []))}",
        "category": categorize_job(job.get('tags', [])),
        "salary": job.get('salary_max', 'Not specified'),
        "email": "apply@remotejobs.com",  # Placeholder
        "url": f"https://remoteok.com{job.get('url', '')}" if job.get('url') else ""
    """

    try:
        response = requests.post(
            f"{API_URL}/api/jobs",
            json=job_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )

        if response.status_code == 200:
            print(f"   ✅ Posted: {job_data['title']} at {job_data['company']}")
            return True
        else:
            print(f"   ❌ Failed: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def categorize_job(tags):
    """Categorize job based on tags"""
    tags_lower = [tag.lower() for tag in tags]

    if any(x in tags_lower for x in ['dev', 'engineer', 'programming', 'python', 'javascript', 'react']):
        return 'Tech'
    elif any(x in tags_lower for x in ['design', 'creative', 'content', 'marketing']):
        return 'Creative'
    elif any(x in tags_lower for x in ['sales', 'business']):
        return 'Sales'
    elif any(x in tags_lower for x in ['support', 'customer', 'service']):
        return 'Customer Service'
    elif any(x in tags_lower for x in ['admin', 'operations', 'management']):
        return 'Administrative'
    else:
        return 'Other'


def main():
    print("🌱 Seeding RemoteJobs platform with real jobs...\n")

    # Fetch real jobs
    jobs = get_real_jobs()

    if not jobs:
        print("❌ No jobs to seed")
        return

    print(f"\n📤 Posting {len(jobs)} jobs to platform...\n")

    # Post each job
    success_count = 0
    for i, job in enumerate(jobs, 1):
        print(f"[{i}/{len(jobs)}]", end=" ")
        if post_job_to_platform(job):
            success_count += 1

        # Rate limit to avoid overwhelming the API
        time.sleep(0.5)

    print(f"\n✅ Successfully seeded {success_count}/{len(jobs)} jobs!")
    print(f"\n🌐 View your job board at: https://cc380da0.remotejobs-platform.pages.dev")


if __name__ == "__main__":
    main()
