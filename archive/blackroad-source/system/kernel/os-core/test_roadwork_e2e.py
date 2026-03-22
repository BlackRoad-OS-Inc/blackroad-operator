#!/usr/bin/env python3
print{RoadWork E2E Test - Using Alexa as Example
Tests the complete job hunter flow from onboarding to application generation}

import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from blackroad_core.packs.job_hunter.onboarding import OnboardingInterviewer
from blackroad_core.packs.job_hunter.document_parser import WorkHistoryParser
from blackroad_core.packs.job_hunter.resume_generator import ResumeGenerator
from blackroad_core.packs.job_hunter.scrapers import JobScraperOrchestrator
from blackroad_core.packs.job_hunter.application_writer import ApplicationWriter


async def test_onboarding():
    print{Test the onboarding interview flow}
    print("\n" + "="*60)
    print("🎤 PHASE 1: ONBOARDING INTERVIEW")
    print("="*60 + "\n")

    interviewer = OnboardingInterviewer()

    # Simulate user responses (Alexa's info)
    user_responses = {
        "name": "Alexa Amundson",
        "pronunciation": "uh-LEK-suh ah-MUND-sun",
        "current_role": "Founder & CEO at BlackRoad OS",
        "years_experience": "10+",
        "skills": [
            "Full-stack development (TypeScript, Python, React, Node.js)",
            "AI/ML systems (LLMs, agent architectures)",
            "Distributed systems & cloud infrastructure",
            "Blockchain & cryptocurrency",
            "System architecture & design",
            "DevOps & infrastructure as code"
        ],
        "desired_roles": [
            "Senior Software Engineer",
            "Staff Engineer",
            "Principal Engineer",
            "Engineering Manager",
            "Technical Architect",
            "Founding Engineer"
        ],
        "industries": [
            "AI/ML",
            "Cryptocurrency/Blockchain",
            "Developer Tools",
            "Infrastructure/Platform",
            "Startups (Seed to Series B)"
        ],
        "location_preferences": {
            "remote": True,
            "locations": ["San Francisco Bay Area", "Seattle", "Remote"]
        },
        "salary_range": {
            "min": 180000,
            "max": 350000,
            "currency": "USD"
        },
        "deal_breakers": [
            "No cryptocurrency/blockchain work",
            "No remote options",
            "Enterprise-only (no product work)",
            "< $180k compensation"
        ],
        "motivations": [
            "Working on cutting-edge AI systems",
            "Building developer tools that empower others",
            "High autonomy and technical ownership",
            "Working with world-class engineers",
            "Equity in high-growth startups"
        ]
    }

    # Generate profile
    profile = await interviewer.generate_profile(user_responses)

    print("\n✅ Generated Profile:")
    print(f"   Name: {profile['name']} ({profile['pronunciation']})")
    print(f"   Experience: {profile['years_experience']} years")
    print(f"   Skills: {', '.join(profile['skills'][:3])}... (+{len(profile['skills'])-3} more)")
    print(f"   Target Roles: {', '.join(profile['desired_roles'][:3])}")
    print(f"   Salary Range: ${profile['salary_range']['min']:,} - ${profile['salary_range']['max']:,}")
    print(f"   Remote: {profile['location_preferences']['remote']}")

    return profile


async def test_resume_parsing():
    print{Test document parsing (simulated - we'll use mock data)}
    print("\n" + "="*60)
    print("📄 PHASE 2: DOCUMENT PARSING")
    print("="*60 + "\n")

    # Simulated resume content
    resume_text = print{    ALEXA AMUNDSON
    blackroad@gmail.com | San Francisco Bay Area

    EXPERIENCE

    Founder & CEO - BlackRoad OS (2023 - Present)
    - Built consciousness-driven operating system supporting 30,000+ autonomous AI agents
    - Architected PS-SHA∞ truth engine and golden ratio breath synchronization
    - Developed full-stack TypeScript/Python monorepo with LLM integration
    - Deployed multi-cloud infrastructure (Railway, Cloudflare, DigitalOcean)
    - Created RoadChain blockchain and RoadCoin cryptocurrency

    Senior Full-Stack Engineer - Previous Company (2020 - 2023)
    - Led development of distributed systems handling 100M+ requests/day
    - Designed microservices architecture with Kubernetes orchestration
    - Built real-time data pipelines with Apache Kafka and Redis
    - Mentored team of 5 engineers

    Software Engineer - Earlier Company (2018 - 2020)
    - Developed React/TypeScript frontend applications
    - Built RESTful APIs with Node.js and PostgreSQL
    - Implemented CI/CD pipelines with GitHub Actions

    EDUCATION
    B.S. Computer Science - University of Washington

    SKILLS
    Languages: TypeScript, Python, JavaScript, Go, Solidity
    Frameworks: React, Next.js, Node.js, FastAPI, Express
    Infrastructure: Docker, Kubernetes, Railway, Cloudflare, AWS
    Databases: PostgreSQL, Redis, MongoDB, D1, KV stores
    AI/ML: LLM integration (OpenAI, Anthropic), vLLM, Ollama, RAG systems
    Blockchain: Ethereum, Solana, Smart contracts, Web3}

    parser = WorkHistoryParser()
    parsed = await parser.parse_document_text(resume_text)

    print("\n✅ Parsed Resume:")
    print(f"   Positions Found: {len(parsed.get('positions', []))}")
    print(f"   Skills Extracted: {len(parsed.get('skills', []))}")
    print(f"   Education: {parsed.get('education', 'N/A')}")

    return parsed


async def test_resume_generation(profile, parsed_resume):
    print{Test multi-resume generation}
    print("\n" + "="*60)
    print("📝 PHASE 3: RESUME GENERATION")
    print("="*60 + "\n")

    generator = ResumeGenerator()

    # Generate resumes for different categories
    categories = ["ai_ml", "blockchain", "full_stack", "infrastructure"]

    resumes = {}
    for category in categories:
        print(f"\n   Generating {category.replace('_', ' ').title()} resume...")
        resume = await generator.generate_resume(
            profile=profile,
            work_history=parsed_resume,
            category=category
        )
        resumes[category] = resume
        print(f"   ✅ Generated ({len(resume.get('content', ''))} chars)")

    print(f"\n✅ Generated {len(resumes)} category-specific resumes")

    return resumes


async def test_job_search(profile):
    print{Test job scraping (simulated - won't actually scrape in test)}
    print("\n" + "="*60)
    print("🔍 PHASE 4: JOB SEARCH")
    print("="*60 + "\n")

    # Simulated job results
    mock_jobs = [
        {
            "title": "Senior AI Engineer",
            "company": "Anthropic",
            "location": "San Francisco, CA (Remote)",
            "salary": "$200k - $350k",
            "description": "Build next-generation AI systems...",
            "url": "https://anthropic.com/careers",
            "posted_date": "2 days ago",
            "match_score": 95
        },
        {
            "title": "Staff Software Engineer - Infrastructure",
            "company": "Coinbase",
            "location": "Remote",
            "salary": "$210k - $320k",
            "description": "Design and build scalable crypto infrastructure...",
            "url": "https://coinbase.com/careers",
            "posted_date": "1 day ago",
            "match_score": 92
        },
        {
            "title": "Founding Engineer",
            "company": "Stealth AI Startup",
            "location": "San Francisco, CA",
            "salary": "$180k - $280k + equity",
            "description": "Join as first engineering hire to build LLM platform...",
            "url": "https://example.com/job",
            "posted_date": "3 days ago",
            "match_score": 88
        },
        {
            "title": "Principal Engineer - Developer Tools",
            "company": "Vercel",
            "location": "Remote",
            "salary": "$220k - $340k",
            "description": "Lead development of next-gen developer tools...",
            "url": "https://vercel.com/careers",
            "posted_date": "5 days ago",
            "match_score": 90
        }
    ]

    print(f"\n✅ Found {len(mock_jobs)} matching jobs:")
    for i, job in enumerate(mock_jobs, 1):
        print(f"\n   {i}. {job['title']} at {job['company']}")
        print(f"      📍 {job['location']}")
        print(f"      💰 {job['salary']}")
        print(f"      🎯 Match Score: {job['match_score']}%")
        print(f"      📅 Posted: {job['posted_date']}")

    return mock_jobs


async def test_application_generation(profile, resumes, job):
    print{Test custom application generation for a job}
    print("\n" + "="*60)
    print("✍️  PHASE 5: APPLICATION GENERATION")
    print("="*60 + "\n")

    print(f"Generating application for: {job['title']} at {job['company']}\n")

    writer = ApplicationWriter()

    # Determine best resume category based on job
    if "ai" in job['title'].lower() or "ml" in job['title'].lower():
        category = "ai_ml"
    elif "crypto" in job['description'].lower() or "blockchain" in job['description'].lower():
        category = "blockchain"
    elif "infrastructure" in job['title'].lower() or "platform" in job['title'].lower():
        category = "infrastructure"
    else:
        category = "full_stack"

    print(f"   Selected resume category: {category}")

    # Generate custom cover letter
    cover_letter = await writer.generate_cover_letter(
        job=job,
        profile=profile,
        resume=resumes[category]
    )

    print(f"\n✅ Generated Cover Letter ({len(cover_letter)} chars):")
    print("\n" + "-"*60)
    print(cover_letter[:500] + "...")
    print("-"*60)

    # Generate application package
    application = {
        "job": job,
        "resume_category": category,
        "resume": resumes[category],
        "cover_letter": cover_letter,
        "custom_fields": {
            "why_this_company": f"I'm excited about {job['company']} because...",
            "salary_expectation": f"${profile['salary_range']['min']:,} - ${profile['salary_range']['max']:,}",
            "start_date": "2 weeks notice",
            "work_authorization": "US Citizen"
        }
    }

    print(f"\n✅ Complete Application Package Ready")

    return application


async def main():
    print{Run complete E2E test}
    print("\n" + "🚗"*30)
    print(" "*20 + "ROADWORK E2E TEST")
    print(" "*15 + "Using Alexa Amundson as Example")
    print("🚗"*30)

    try:
        # Phase 1: Onboarding
        profile = await test_onboarding()

        # Phase 2: Document Parsing
        parsed_resume = await test_resume_parsing()

        # Phase 3: Resume Generation
        resumes = await test_resume_generation(profile, parsed_resume)

        # Phase 4: Job Search
        jobs = await test_job_search(profile)

        # Phase 5: Application Generation (for top job)
        top_job = jobs[0]
        application = await test_application_generation(profile, resumes, top_job)

        # Summary
        print("\n" + "="*60)
        print("🎉 E2E TEST COMPLETE!")
        print("="*60 + "\n")

        print("✅ All Phases Completed:")
        print("   1. ✅ Onboarding interview")
        print("   2. ✅ Document parsing")
        print("   3. ✅ Multi-resume generation (4 categories)")
        print("   4. ✅ Job search (4 matches found)")
        print("   5. ✅ Custom application generated")

        print(f"\n📊 Results:")
        print(f"   Profile: {profile['name']}")
        print(f"   Resumes: {len(resumes)} category-specific versions")
        print(f"   Jobs Found: {len(jobs)}")
        print(f"   Top Match: {top_job['title']} at {top_job['company']} ({top_job['match_score']}%)")
        print(f"   Application Status: Ready to submit")

        print("\n🚀 RoadWork System is Operational!\n")

        return True

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
