#!/usr/bin/env python3
"""
Job Application Status Dashboard

Features:
- Visual pipeline tracking (Applied → Interview → Offer)
- Real-time status updates
- Statistics and analytics
- Timeline visualization
- Company tracking
- Success rate analysis
- Next actions recommended
- Export to CSV/JSON
"""

import json
import os
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
from enum import Enum
from collections import defaultdict


class ApplicationStatus(Enum):
    """Application status stages."""
    INTERESTED = "interested"
    APPLIED = "applied"
    SCREENING = "screening"
    PHONE_SCREEN = "phone_screen"
    TECHNICAL = "technical"
    ONSITE = "onsite"
    OFFER = "offer"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


@dataclass
class StatusChange:
    """Status change event."""
    from_status: str
    to_status: str
    changed_at: str
    notes: str = ""


@dataclass
class Application:
    """Job application."""
    id: str
    company: str
    job_title: str
    location: str
    job_url: str

    # Status
    status: ApplicationStatus
    status_history: List[StatusChange] = None

    # Dates
    applied_date: str = ""
    last_updated: str = ""
    deadline: str = ""

    # Contact
    recruiter_name: str = ""
    recruiter_email: str = ""

    # Metrics
    days_in_pipeline: int = 0
    response_time_days: Optional[int] = None

    # Salary
    salary_min: int = 0
    salary_max: int = 0

    # Notes
    notes: str = ""
    next_action: str = ""

    # Metadata
    source: str = ""  # LinkedIn, Indeed, etc.
    created_at: str = ""

    def __post_init__(self):
        if self.status_history is None:
            self.status_history = []
        if not self.created_at:
            self.created_at = datetime.now().isoformat()
        if not self.last_updated:
            self.last_updated = self.created_at


class StatusDashboard:
    """Job application status dashboard."""

    # Status pipeline order
    STATUS_PIPELINE = [
        ApplicationStatus.INTERESTED,
        ApplicationStatus.APPLIED,
        ApplicationStatus.SCREENING,
        ApplicationStatus.PHONE_SCREEN,
        ApplicationStatus.TECHNICAL,
        ApplicationStatus.ONSITE,
        ApplicationStatus.OFFER,
        ApplicationStatus.ACCEPTED,
    ]

    # Terminal statuses
    TERMINAL_STATUSES = {
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN
    }

    def __init__(self):
        """Initialize dashboard."""
        self.data_dir = Path.home() / ".applier" / "dashboard"
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.applications_file = self.data_dir / "applications.json"
        self.applications: List[Application] = self._load_applications()

    def add_application(
        self,
        company: str,
        job_title: str,
        location: str,
        job_url: str,
        **details
    ) -> Application:
        """Add new application."""

        app = Application(
            id=f"app_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            company=company,
            job_title=job_title,
            location=location,
            job_url=job_url,
            status=ApplicationStatus.INTERESTED,
            applied_date=details.get("applied_date", ""),
            recruiter_name=details.get("recruiter_name", ""),
            recruiter_email=details.get("recruiter_email", ""),
            salary_min=details.get("salary_min", 0),
            salary_max=details.get("salary_max", 0),
            source=details.get("source", ""),
            notes=details.get("notes", "")
        )

        self.applications.append(app)
        self._save_applications()

        print(f"✅ Added: {company} - {job_title}")

        return app

    def update_status(
        self,
        app_id: str,
        new_status: ApplicationStatus,
        notes: str = ""
    ) -> bool:
        """Update application status."""

        for app in self.applications:
            if app.id == app_id:
                # Record status change
                change = StatusChange(
                    from_status=app.status.value,
                    to_status=new_status.value,
                    changed_at=datetime.now().isoformat(),
                    notes=notes
                )
                app.status_history.append(change)

                # Update status
                app.status = new_status
                app.last_updated = datetime.now().isoformat()

                # Auto-set applied_date
                if new_status == ApplicationStatus.APPLIED and not app.applied_date:
                    app.applied_date = datetime.now().isoformat()

                # Calculate days in pipeline
                if app.applied_date:
                    applied = datetime.fromisoformat(app.applied_date)
                    now = datetime.now()
                    app.days_in_pipeline = (now - applied).days

                self._save_applications()

                print(f"✅ Updated {app.company}: {app.status.value}")
                return True

        print(f"❌ Application {app_id} not found")
        return False

    def get_by_status(self, status: ApplicationStatus) -> List[Application]:
        """Get applications by status."""
        return [app for app in self.applications if app.status == status]

    def get_active_applications(self) -> List[Application]:
        """Get active (non-terminal) applications."""
        return [
            app for app in self.applications
            if app.status not in self.TERMINAL_STATUSES
        ]

    def get_statistics(self) -> Dict:
        """Get dashboard statistics."""

        stats = {
            "total": len(self.applications),
            "active": len(self.get_active_applications()),
            "by_status": {},
            "by_company": {},
            "conversion_rates": {},
            "average_response_time": 0,
            "offers": 0,
            "rejections": 0,
            "acceptance_rate": 0.0,
        }

        # By status
        for status in ApplicationStatus:
            count = len(self.get_by_status(status))
            stats["by_status"][status.value] = count

        # By company
        company_counts = defaultdict(int)
        for app in self.applications:
            company_counts[app.company] += 1
        stats["by_company"] = dict(company_counts)

        # Conversion rates
        applied_count = len(self.get_by_status(ApplicationStatus.APPLIED))
        if applied_count > 0:
            phone_screen_count = sum(
                1 for app in self.applications
                if app.status.value in ["phone_screen", "technical", "onsite", "offer", "accepted"]
            )
            stats["conversion_rates"]["applied_to_screen"] = (phone_screen_count / applied_count) * 100

        # Offers
        stats["offers"] = len(self.get_by_status(ApplicationStatus.OFFER))

        # Rejections
        stats["rejections"] = len(self.get_by_status(ApplicationStatus.REJECTED))

        # Acceptance rate
        accepted = len(self.get_by_status(ApplicationStatus.ACCEPTED))
        total_final = accepted + stats["rejections"]
        if total_final > 0:
            stats["acceptance_rate"] = (accepted / total_final) * 100

        # Average response time
        response_times = []
        for app in self.applications:
            if app.applied_date and app.status_history:
                applied = datetime.fromisoformat(app.applied_date)
                first_response = datetime.fromisoformat(app.status_history[0].changed_at)
                days = (first_response - applied).days
                if days >= 0:
                    response_times.append(days)

        if response_times:
            stats["average_response_time"] = sum(response_times) / len(response_times)

        return stats

    def print_dashboard(self):
        """Print dashboard to console."""

        print("\n" + "="*80)
        print("📊 JOB APPLICATION DASHBOARD")
        print("="*80 + "\n")

        stats = self.get_statistics()

        # Summary
        print(f"📈 SUMMARY:")
        print(f"   Total Applications: {stats['total']}")
        print(f"   Active: {stats['active']}")
        print(f"   Offers: {stats['offers']}")
        print(f"   Rejections: {stats['rejections']}")
        if stats['acceptance_rate'] > 0:
            print(f"   Acceptance Rate: {stats['acceptance_rate']:.1f}%")
        print()

        # Pipeline visualization
        print("🚀 PIPELINE:\n")

        for status in self.STATUS_PIPELINE:
            if status in self.TERMINAL_STATUSES:
                continue

            count = stats['by_status'].get(status.value, 0)
            bar_length = min(count, 20)
            bar = "█" * bar_length

            status_label = status.value.replace('_', ' ').title()
            print(f"   {status_label:20} {bar:20} {count}")

        print()

        # Recent activity
        print("📅 RECENT ACTIVITY (last 7 days):\n")

        recent_apps = sorted(
            [app for app in self.applications if self._is_recent(app.last_updated, days=7)],
            key=lambda a: a.last_updated,
            reverse=True
        )[:10]

        if not recent_apps:
            print("   No recent activity")
        else:
            for app in recent_apps:
                updated = datetime.fromisoformat(app.last_updated)
                days_ago = (datetime.now() - updated).days
                time_str = f"{days_ago}d ago" if days_ago > 0 else "today"

                print(f"   {app.company:30} {app.status.value:15} ({time_str})")

        print()

        # Next actions
        print("✅ NEXT ACTIONS:\n")

        actions = self._get_next_actions()
        if not actions:
            print("   No pending actions")
        else:
            for action in actions[:5]:
                print(f"   • {action}")

        print("\n" + "="*80 + "\n")

    def _is_recent(self, date_str: str, days: int = 7) -> bool:
        """Check if date is recent."""
        if not date_str:
            return False

        date = datetime.fromisoformat(date_str)
        cutoff = datetime.now() - timedelta(days=days)
        return date >= cutoff

    def _get_next_actions(self) -> List[str]:
        """Get recommended next actions."""

        actions = []

        # Follow up on pending applications
        for app in self.applications:
            if app.status == ApplicationStatus.APPLIED:
                if app.applied_date:
                    applied = datetime.fromisoformat(app.applied_date)
                    days_waiting = (datetime.now() - applied).days

                    if days_waiting >= 7:
                        actions.append(
                            f"Follow up with {app.company} (applied {days_waiting} days ago)"
                        )

            # Prepare for upcoming interviews
            elif app.status in [ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL]:
                actions.append(f"Prepare for {app.status.value.replace('_', ' ')} at {app.company}")

            # Send thank you after recent interviews
            if app.status_history:
                last_change = app.status_history[-1]
                if last_change.to_status in ["phone_screen", "technical", "onsite"]:
                    changed = datetime.fromisoformat(last_change.changed_at)
                    hours_ago = (datetime.now() - changed).total_seconds() / 3600
                    if hours_ago <= 24:
                        actions.append(f"Send thank-you email for {app.company} interview")

        return actions

    def export_to_csv(self, output_path: str):
        """Export applications to CSV."""

        import csv

        with open(output_path, 'w', newline='') as f:
            writer = csv.writer(f)

            # Header
            writer.writerow([
                "Company", "Job Title", "Location", "Status",
                "Applied Date", "Days in Pipeline", "Salary Range",
                "Recruiter", "Notes", "URL"
            ])

            # Data
            for app in self.applications:
                salary_range = ""
                if app.salary_min and app.salary_max:
                    salary_range = f"${app.salary_min:,}-${app.salary_max:,}"

                writer.writerow([
                    app.company,
                    app.job_title,
                    app.location,
                    app.status.value,
                    app.applied_date[:10] if app.applied_date else "",
                    app.days_in_pipeline,
                    salary_range,
                    app.recruiter_name,
                    app.notes,
                    app.job_url
                ])

        print(f"✅ Exported to: {output_path}")

    def search(self, query: str) -> List[Application]:
        """Search applications."""

        query_lower = query.lower()

        results = []
        for app in self.applications:
            if (query_lower in app.company.lower() or
                query_lower in app.job_title.lower() or
                query_lower in app.location.lower()):
                results.append(app)

        return results

    def _load_applications(self) -> List[Application]:
        """Load applications from file."""

        if not self.applications_file.exists():
            return []

        with open(self.applications_file, 'r') as f:
            data = json.load(f)

        applications = []
        for item in data:
            # Convert status
            item['status'] = ApplicationStatus(item['status'])

            # Convert status history
            history = []
            for change_dict in item.get('status_history', []):
                history.append(StatusChange(**change_dict))
            item['status_history'] = history

            applications.append(Application(**item))

        return applications

    def _save_applications(self):
        """Save applications to file."""

        data = []
        for app in self.applications:
            app_dict = asdict(app)
            app_dict['status'] = app.status.value

            # Convert status history
            history = []
            for change in app.status_history:
                history.append(asdict(change))
            app_dict['status_history'] = history

            data.append(app_dict)

        with open(self.applications_file, 'w') as f:
            json.dump(data, f, indent=2)


# CLI
def main():
    """CLI for status dashboard."""

    import argparse

    parser = argparse.ArgumentParser(description="Job Application Status Dashboard")
    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # Add application
    add_parser = subparsers.add_parser("add", help="Add new application")
    add_parser.add_argument("--company", required=True)
    add_parser.add_argument("--job-title", required=True)
    add_parser.add_argument("--location", default="Remote")
    add_parser.add_argument("--url", default="")
    add_parser.add_argument("--salary-min", type=int, default=0)
    add_parser.add_argument("--salary-max", type=int, default=0)

    # Update status
    update_parser = subparsers.add_parser("update", help="Update application status")
    update_parser.add_argument("app_id")
    update_parser.add_argument("status", choices=[s.value for s in ApplicationStatus])
    update_parser.add_argument("--notes", default="")

    # Show dashboard
    subparsers.add_parser("show", help="Show dashboard")

    # List applications
    list_parser = subparsers.add_parser("list", help="List applications")
    list_parser.add_argument("--status", choices=[s.value for s in ApplicationStatus])

    # Export
    export_parser = subparsers.add_parser("export", help="Export to CSV")
    export_parser.add_argument("output", help="Output CSV file")

    # Search
    search_parser = subparsers.add_parser("search", help="Search applications")
    search_parser.add_argument("query")

    args = parser.parse_args()

    dashboard = StatusDashboard()

    if args.command == "add":
        dashboard.add_application(
            company=args.company,
            job_title=args.job_title,
            location=args.location,
            job_url=args.url,
            salary_min=args.salary_min,
            salary_max=args.salary_max
        )

    elif args.command == "update":
        status = ApplicationStatus(args.status)
        dashboard.update_status(args.app_id, status, args.notes)

    elif args.command == "show":
        dashboard.print_dashboard()

    elif args.command == "list":
        if args.status:
            status = ApplicationStatus(args.status)
            apps = dashboard.get_by_status(status)
        else:
            apps = dashboard.applications

        print(f"\n📋 APPLICATIONS ({len(apps)}):\n")
        for app in apps:
            print(f"{app.company:30} {app.job_title:40} {app.status.value:15}")

    elif args.command == "export":
        dashboard.export_to_csv(args.output)

    elif args.command == "search":
        results = dashboard.search(args.query)
        print(f"\n🔍 SEARCH RESULTS ({len(results)}):\n")
        for app in results:
            print(f"{app.company:30} {app.job_title:40} {app.status.value:15}")

    else:
        # Default: show dashboard
        dashboard.print_dashboard()

    return 0


if __name__ == "__main__":
    exit(main())
