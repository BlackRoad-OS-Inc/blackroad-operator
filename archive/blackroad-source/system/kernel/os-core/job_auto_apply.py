#!/usr/bin/env python3
print{Terminal-first job applier for BlackRoad OS.

- Loads a user profile JSON and optional resume text file
- Uses JobHunterAgent to scrape mock jobs, rank them, and generate applications
- Supports optional auto-submit (dry-run by default) and exports results to JSONL

Example:
    python scripts/job_auto_apply.py \
      --profile profiles/alex.json \
      --keywords "Senior Engineer" "AI" \
      --locations "Remote" "San Francisco" \
      --max-apps 5 \
      --export job_runs/output.jsonl}

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path
from typing import Any, Dict, List

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.blackroad_core.packs.job_hunter import (  # type: ignore
    JobPlatform,
    JobSearchCriteria,
    UserProfile,
)
from src.blackroad_core.packs.job_hunter.orchestrator import JobHunterAgent  # type: ignore


def load_profile(path: Path) -> UserProfile:
    data = json.loads(path.read_text())

    resume_text = data.get("resume_text")
    resume_text_path = data.get("resume_text_path")
    if not resume_text and resume_text_path:
        resume_text = Path(resume_text_path).expanduser().read_text()

    required = [
        "id",
        "full_name",
        "email",
        "phone",
        "location",
        "resume_url",
    ]
    missing = [key for key in required if not data.get(key)]
    if missing:
        raise ValueError(f"Missing required profile fields: {', '.join(missing)}")

    if not resume_text:
        raise ValueError("Profile must include 'resume_text' or 'resume_text_path'.")

    return UserProfile(
        id=data["id"],
        full_name=data["full_name"],
        email=data["email"],
        phone=data["phone"],
        location=data["location"],
        resume_url=data["resume_url"],
        resume_text=resume_text,
        summary=data.get("summary", ""),
        skills=data.get("skills", []),
        experience=data.get("experience", []),
        education=data.get("education", []),
        target_roles=data.get("target_roles", []),
        target_locations=data.get("target_locations", []),
        target_companies=data.get("target_companies", []),
        excluded_companies=data.get("excluded_companies", []),
        min_salary=data.get("min_salary"),
        remote_only=bool(data.get("remote_only", False)),
        cover_letter_template=data.get("cover_letter_template", ""),
        custom_answers=data.get("custom_answers", {}),
    )


def parse_platforms(values: List[str] | None) -> List[JobPlatform]:
    if not values:
        return [
            JobPlatform.LINKEDIN,
            JobPlatform.INDEED,
            JobPlatform.ZIPRECRUITER,
            JobPlatform.GLASSDOOR,
        ]

    value_map = {p.value: p for p in JobPlatform}
    platforms: List[JobPlatform] = []
    for value in values:
        key = value.lower()
        if key not in value_map:
            raise ValueError(
                f"Unsupported platform '{value}'. Choose from: {', '.join(value_map.keys())}"
            )
        platforms.append(value_map[key])
    return platforms


def build_criteria(args: argparse.Namespace, profile: UserProfile) -> JobSearchCriteria:
    keywords = args.keywords or profile.target_roles
    if not keywords:
        keywords = ["Software Engineer"]

    locations = args.locations or profile.target_locations
    platforms = parse_platforms(args.platforms)

    criteria = JobSearchCriteria(
        keywords=keywords,
        locations=locations or [profile.location],
        platforms=platforms,
        remote_only=args.remote_only or profile.remote_only,
        min_salary=args.min_salary or profile.min_salary,
        max_days_old=args.max_days_old,
        exclude_companies=args.exclude_companies,
        auto_apply=args.auto_submit,
        max_applications_per_day=args.max_apps,
        require_manual_review=not args.auto_submit,
    )

    return criteria


def serialize_application(application) -> Dict[str, Any]:
    return {
        "id": application.id,
        "job_posting_id": application.job_posting_id,
        "platform": application.platform.value,
        "status": application.status.value,
        "cover_letter": application.cover_letter,
        "custom_answers": application.custom_answers,
        "metadata": application.metadata,
        "applied_at": getattr(application, "applied_at", None),
    }


def render_summary(summary: Dict[str, Any], agent: JobHunterAgent) -> None:
    print("\n=== Job Hunt Summary ===")
    print(f"Session: {summary['session_id']}")
    print(f"Duration: {summary['duration_seconds']:.2f}s")
    print(
        f"Jobs found: {summary['jobs_found']} | Generated: {summary['applications_generated']} | "
        f"Submitted: {summary['applications_submitted']} | Pending review: {summary['pending_review']}"
    )
    print("Top matches:")
    for match in summary.get("top_matches", []):
        print(
            f"  - {match['title']} @ {match['company']} [{match['platform']}] "
            f"match={match['match_score']:.0%} ({match['url']})"
        )
    print("Pending applications:")
    for app in agent.pending_applications:
        meta = app.metadata
        print(
            f"  - {meta.get('job_title')} @ {meta.get('company')} "
            f"match={meta.get('match_score', 0):.0%} status={app.status.value}"
        )
    if agent.submitted_applications:
        print("Submitted applications:")
        for app in agent.submitted_applications:
            meta = app.metadata
            print(
                f"  - {meta.get('job_title')} @ {meta.get('company')} "
                f"match={meta.get('match_score', 0):.0%} status={app.status.value}"
            )


async def run(args: argparse.Namespace) -> None:
    profile = load_profile(Path(args.profile).expanduser())
    criteria = build_criteria(args, profile)

    agent = JobHunterAgent(user_profile=profile)

    summary = await agent.start_job_hunt(criteria, auto_apply=False)

    submitted = []
    if args.auto_submit:
        submitted = await agent._submit_pending_applications(dry_run=not args.live)
        summary["applications_submitted"] = len(submitted)
        summary["pending_review"] = len(agent.pending_applications)

    render_summary(summary, agent)

    export_path = Path(args.export).expanduser()
    export_path.parent.mkdir(parents=True, exist_ok=True)
    with export_path.open("w", encoding="utf-8") as fh:
        for app in agent.submitted_applications or agent.pending_applications:
            fh.write(json.dumps(serialize_application(app)) + "\n")

    print(f"\n📦 Saved applications to {export_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Automate job applications from the terminal.")
    parser.add_argument("--profile", required=True, help="Path to profile JSON.")
    parser.add_argument("--keywords", nargs="*", help="Keywords/roles to search (defaults to profile targets).")
    parser.add_argument("--locations", nargs="*", help="Preferred locations (defaults to profile targets).")
    parser.add_argument(
        "--platforms",
        nargs="*",
        help="Platforms to search: linkedin indeed ziprecruiter glassdoor",
    )
    parser.add_argument("--remote-only", action="store_true", help="Only include remote-friendly jobs.")
    parser.add_argument("--min-salary", type=int, help="Minimum salary filter.")
    parser.add_argument("--max-days-old", type=int, default=7, help="Maximum age of postings.")
    parser.add_argument("--exclude-companies", nargs="*", default=[], help="Companies to skip.")
    parser.add_argument("--max-apps", type=int, default=5, help="Max applications per run.")
    parser.add_argument(
        "--auto-submit",
        action="store_true",
        help="Auto-submit after generation (respects dry-run unless --live is set).",
    )
    parser.add_argument("--live", action="store_true", help="Attempt live submission (disable dry-run).")
    parser.add_argument("--export", default="job_applier_results.jsonl", help="Where to write JSONL output.")

    args = parser.parse_args()

    try:
        asyncio.run(run(args))
    except KeyboardInterrupt:
        print("Interrupted by user.")
    except Exception as exc:  # pragma: no cover - CLI safety
        print(f"❌ Error: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
