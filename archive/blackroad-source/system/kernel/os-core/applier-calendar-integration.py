#!/usr/bin/env python3
"""
Calendar Integration for Job Hunting

Features:
- Google Calendar & Outlook integration
- Auto-create events for interviews
- Interview preparation reminders
- Buffer time blocking (prep before, decompression after)
- Timezone handling
- Conflict detection
- Interview availability sharing
- Calendar link generation for scheduling
"""

import json
import os
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
from enum import Enum
import re

try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False


class EventType(Enum):
    """Calendar event type."""
    PHONE_SCREEN = "phone_screen"
    TECHNICAL_INTERVIEW = "technical_interview"
    BEHAVIORAL_INTERVIEW = "behavioral_interview"
    HIRING_MANAGER = "hiring_manager"
    TEAM_INTERVIEW = "team_interview"
    FINAL_INTERVIEW = "final_interview"
    COFFEE_CHAT = "coffee_chat"
    OFFER_CALL = "offer_call"
    PREP_TIME = "prep_time"
    DECOMPRESSION = "decompression"


@dataclass
class InterviewEvent:
    """Interview calendar event."""
    id: str
    company: str
    job_title: str
    event_type: EventType

    # Timing
    start_datetime: str  # ISO format
    end_datetime: str
    timezone: str = "America/Los_Angeles"
    duration_minutes: int = 60

    # Details
    interviewer_names: List[str] = None
    interviewer_emails: List[str] = None
    location: str = ""  # Video link or physical address
    video_link: Optional[str] = None
    dial_in: Optional[str] = None

    # Prep
    prep_notes: str = ""
    prep_time_minutes: int = 30  # Auto-block time before
    decompression_minutes: int = 15  # Auto-block time after

    # Calendar IDs
    google_event_id: Optional[str] = None
    outlook_event_id: Optional[str] = None

    # Metadata
    created_at: str = ""
    reminder_sent: bool = False
    notes: str = ""

    def __post_init__(self):
        if self.interviewer_names is None:
            self.interviewer_names = []
        if self.interviewer_emails is None:
            self.interviewer_emails = []
        if not self.created_at:
            self.created_at = datetime.now().isoformat()


class CalendarIntegration:
    """Calendar integration for interviews."""

    # OAuth scopes
    GOOGLE_SCOPES = ['https://www.googleapis.com/auth/calendar']

    def __init__(self):
        """Initialize calendar integration."""
        self.data_dir = Path.home() / ".applier" / "calendar"
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.events_file = self.data_dir / "interview_events.json"
        self.events: List[InterviewEvent] = self._load_events()

        # Google Calendar
        self.google_service = None
        if GOOGLE_AVAILABLE:
            self._setup_google_calendar()

    def _setup_google_calendar(self):
        """Setup Google Calendar API."""
        creds = None
        token_path = self.data_dir / "google_calendar_token.json"
        credentials_path = self.data_dir / "google_calendar_credentials.json"

        if token_path.exists():
            creds = Credentials.from_authorized_user_file(str(token_path), self.GOOGLE_SCOPES)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not credentials_path.exists():
                    print("⚠️  Google Calendar credentials not found")
                    print("   Download from: https://console.cloud.google.com/")
                    print(f"   Save to: {credentials_path}")
                    return

                flow = InstalledAppFlow.from_client_secrets_file(
                    str(credentials_path), self.GOOGLE_SCOPES)
                creds = flow.run_local_server(port=0)

            # Save credentials
            with open(token_path, 'w') as token:
                token.write(creds.to_json())

        self.google_service = build('calendar', 'v3', credentials=creds)

    def create_interview_event(
        self,
        company: str,
        job_title: str,
        start_datetime: datetime,
        event_type: EventType,
        duration_minutes: int = 60,
        **details
    ) -> InterviewEvent:
        """Create an interview event."""

        end_datetime = start_datetime + timedelta(minutes=duration_minutes)

        event = InterviewEvent(
            id=f"interview_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            company=company,
            job_title=job_title,
            event_type=event_type,
            start_datetime=start_datetime.isoformat(),
            end_datetime=end_datetime.isoformat(),
            duration_minutes=duration_minutes,
            interviewer_names=details.get("interviewer_names", []),
            interviewer_emails=details.get("interviewer_emails", []),
            location=details.get("location", ""),
            video_link=details.get("video_link"),
            dial_in=details.get("dial_in"),
            prep_notes=details.get("prep_notes", ""),
            prep_time_minutes=details.get("prep_time_minutes", 30),
            decompression_minutes=details.get("decompression_minutes", 15),
            timezone=details.get("timezone", "America/Los_Angeles"),
            notes=details.get("notes", "")
        )

        # Check for conflicts
        conflicts = self._check_conflicts(start_datetime, end_datetime)
        if conflicts:
            print(f"⚠️  WARNING: Conflicts detected:")
            for conflict in conflicts:
                print(f"   - {conflict.company}: {conflict.start_datetime}")

        # Add to Google Calendar
        if self.google_service:
            self._create_google_events(event)

        self.events.append(event)
        self._save_events()

        print(f"✅ Created interview event: {company} - {event_type.value}")
        print(f"   {start_datetime.strftime('%Y-%m-%d %H:%M')} ({duration_minutes} min)")

        return event

    def _create_google_events(self, event: InterviewEvent):
        """Create events in Google Calendar (main + prep + decompression)."""

        try:
            # Main interview event
            main_event = self._build_google_event(event)
            created = self.google_service.events().insert(
                calendarId='primary',
                body=main_event
            ).execute()

            event.google_event_id = created['id']
            print(f"✅ Added to Google Calendar: {created.get('htmlLink')}")

            # Prep time event
            if event.prep_time_minutes > 0:
                prep_event = self._build_prep_event(event)
                self.google_service.events().insert(
                    calendarId='primary',
                    body=prep_event
                ).execute()
                print(f"   + {event.prep_time_minutes}m prep time blocked")

            # Decompression event
            if event.decompression_minutes > 0:
                decomp_event = self._build_decompression_event(event)
                self.google_service.events().insert(
                    calendarId='primary',
                    body=decomp_event
                ).execute()
                print(f"   + {event.decompression_minutes}m decompression blocked")

        except Exception as e:
            print(f"❌ Failed to create Google Calendar event: {e}")

    def _build_google_event(self, event: InterviewEvent) -> Dict:
        """Build Google Calendar event payload."""

        # Event title
        event_type_names = {
            EventType.PHONE_SCREEN: "📞 Phone Screen",
            EventType.TECHNICAL_INTERVIEW: "💻 Technical Interview",
            EventType.BEHAVIORAL_INTERVIEW: "🗣️ Behavioral Interview",
            EventType.HIRING_MANAGER: "👔 Hiring Manager Interview",
            EventType.TEAM_INTERVIEW: "👥 Team Interview",
            EventType.FINAL_INTERVIEW: "🏆 Final Interview",
            EventType.COFFEE_CHAT: "☕ Coffee Chat",
            EventType.OFFER_CALL: "🎉 Offer Call",
        }

        title = f"{event_type_names.get(event.event_type, '📅')} - {event.company}"

        # Description
        description_parts = [
            f"Position: {event.job_title}",
            f"Company: {event.company}",
            ""
        ]

        if event.interviewer_names:
            description_parts.append(f"Interviewers: {', '.join(event.interviewer_names)}")

        if event.video_link:
            description_parts.append(f"Video Link: {event.video_link}")

        if event.dial_in:
            description_parts.append(f"Dial-in: {event.dial_in}")

        if event.prep_notes:
            description_parts.append(f"\n📝 PREP NOTES:\n{event.prep_notes}")

        description = '\n'.join(description_parts)

        # Attendees
        attendees = []
        for email in event.interviewer_emails:
            attendees.append({'email': email})

        # Build event
        google_event = {
            'summary': title,
            'description': description,
            'location': event.location,
            'start': {
                'dateTime': event.start_datetime,
                'timeZone': event.timezone,
            },
            'end': {
                'dateTime': event.end_datetime,
                'timeZone': event.timezone,
            },
            'attendees': attendees,
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'popup', 'minutes': 60},  # 1 hour before
                    {'method': 'popup', 'minutes': 15},  # 15 min before
                ],
            },
            'colorId': '9',  # Blue color for interviews
        }

        return google_event

    def _build_prep_event(self, event: InterviewEvent) -> Dict:
        """Build prep time event."""

        start = datetime.fromisoformat(event.start_datetime) - timedelta(minutes=event.prep_time_minutes)
        end = datetime.fromisoformat(event.start_datetime)

        return {
            'summary': f"🎯 Prep: {event.company} Interview",
            'description': f"Prepare for {event.event_type.value} with {event.company}\n\n{event.prep_notes}",
            'start': {
                'dateTime': start.isoformat(),
                'timeZone': event.timezone,
            },
            'end': {
                'dateTime': end.isoformat(),
                'timeZone': event.timezone,
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'popup', 'minutes': 0},
                ],
            },
            'colorId': '5',  # Yellow for prep
        }

    def _build_decompression_event(self, event: InterviewEvent) -> Dict:
        """Build decompression event."""

        start = datetime.fromisoformat(event.end_datetime)
        end = start + timedelta(minutes=event.decompression_minutes)

        return {
            'summary': f"😌 Decompression: {event.company}",
            'description': f"Time to decompress after {event.event_type.value}",
            'start': {
                'dateTime': start.isoformat(),
                'timeZone': event.timezone,
            },
            'end': {
                'dateTime': end.isoformat(),
                'timeZone': event.timezone,
            },
            'reminders': {
                'useDefault': False,
                'overrides': [],
            },
            'colorId': '10',  # Green for decompression
        }

    def _check_conflicts(self, start: datetime, end: datetime) -> List[InterviewEvent]:
        """Check for scheduling conflicts."""

        conflicts = []

        for event in self.events:
            event_start = datetime.fromisoformat(event.start_datetime)
            event_end = datetime.fromisoformat(event.end_datetime)

            # Check overlap
            if not (end <= event_start or start >= event_end):
                conflicts.append(event)

        return conflicts

    def get_upcoming_interviews(self, days: int = 7) -> List[InterviewEvent]:
        """Get upcoming interviews."""

        now = datetime.now()
        cutoff = now + timedelta(days=days)

        upcoming = []
        for event in self.events:
            event_start = datetime.fromisoformat(event.start_datetime)
            if now <= event_start <= cutoff:
                upcoming.append(event)

        # Sort by start time
        upcoming.sort(key=lambda e: e.start_datetime)

        return upcoming

    def get_availability_windows(self, days_ahead: int = 14, work_hours_only: bool = True) -> List[Dict]:
        """Get available time windows for scheduling."""

        now = datetime.now()
        windows = []

        for day_offset in range(days_ahead):
            day = now + timedelta(days=day_offset)

            # Skip weekends if work hours only
            if work_hours_only and day.weekday() >= 5:
                continue

            # Define work hours (9 AM - 5 PM)
            if work_hours_only:
                start_hour = 9
                end_hour = 17
            else:
                start_hour = 8
                end_hour = 20

            # Check each hour slot
            for hour in range(start_hour, end_hour):
                slot_start = day.replace(hour=hour, minute=0, second=0, microsecond=0)
                slot_end = slot_start + timedelta(hours=1)

                # Check if slot is free
                conflicts = self._check_conflicts(slot_start, slot_end)
                if not conflicts:
                    windows.append({
                        "start": slot_start.isoformat(),
                        "end": slot_end.isoformat(),
                        "day": slot_start.strftime("%A"),
                        "date": slot_start.strftime("%Y-%m-%d"),
                        "time": slot_start.strftime("%I:%M %p")
                    })

        return windows

    def generate_scheduling_link_text(self, days_ahead: int = 7) -> str:
        """Generate text for sharing availability."""

        windows = self.get_availability_windows(days_ahead=days_ahead)

        # Group by day
        by_day = {}
        for window in windows:
            date = window["date"]
            if date not in by_day:
                by_day[date] = []
            by_day[date].append(window["time"])

        # Build text
        text = "I'm available for interviews at the following times:\n\n"

        for date, times in sorted(by_day.items())[:5]:  # Show next 5 days
            day_name = datetime.fromisoformat(date).strftime("%A, %B %d")
            text += f"{day_name}:\n"
            text += ", ".join(times[:5])  # Show first 5 slots
            if len(times) > 5:
                text += f" (and {len(times) - 5} more)"
            text += "\n\n"

        text += "All times are in Pacific Time (PT). Please let me know what works best for you!"

        return text

    def parse_interview_from_email(self, email_body: str) -> Optional[Dict]:
        """Parse interview details from email."""

        details = {}

        # Extract video links
        zoom_pattern = r'https://[\w-]+\.zoom\.us/j/[\w?=&-]+'
        teams_pattern = r'https://teams\.microsoft\.com/l/meetup-join/[\w/%?=&-]+'
        meet_pattern = r'https://meet\.google\.com/[\w-]+'

        zoom = re.search(zoom_pattern, email_body)
        teams = re.search(teams_pattern, email_body)
        meet = re.search(meet_pattern, email_body)

        if zoom:
            details["video_link"] = zoom.group(0)
            details["location"] = "Zoom"
        elif teams:
            details["video_link"] = teams.group(0)
            details["location"] = "Microsoft Teams"
        elif meet:
            details["video_link"] = meet.group(0)
            details["location"] = "Google Meet"

        # Extract date/time patterns
        date_pattern = r'(\w+day,?\s+\w+\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?)'
        time_pattern = r'(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))'

        date_match = re.search(date_pattern, email_body)
        time_match = re.search(time_pattern, email_body)

        if date_match:
            details["date_string"] = date_match.group(1)
        if time_match:
            details["time_string"] = time_match.group(1)

        return details if details else None

    def update_event(self, event_id: str, **updates) -> bool:
        """Update an existing event."""

        for event in self.events:
            if event.id == event_id:
                # Update fields
                for key, value in updates.items():
                    if hasattr(event, key):
                        setattr(event, key, value)

                # Update in Google Calendar if exists
                if event.google_event_id and self.google_service:
                    try:
                        # Fetch current event
                        google_event = self.google_service.events().get(
                            calendarId='primary',
                            eventId=event.google_event_id
                        ).execute()

                        # Update it
                        updated_event = self._build_google_event(event)
                        self.google_service.events().update(
                            calendarId='primary',
                            eventId=event.google_event_id,
                            body=updated_event
                        ).execute()

                        print(f"✅ Updated Google Calendar event")

                    except Exception as e:
                        print(f"⚠️  Failed to update Google Calendar: {e}")

                self._save_events()
                return True

        return False

    def delete_event(self, event_id: str) -> bool:
        """Delete an event."""

        for i, event in enumerate(self.events):
            if event.id == event_id:
                # Delete from Google Calendar
                if event.google_event_id and self.google_service:
                    try:
                        self.google_service.events().delete(
                            calendarId='primary',
                            eventId=event.google_event_id
                        ).execute()
                        print(f"✅ Deleted from Google Calendar")
                    except Exception as e:
                        print(f"⚠️  Failed to delete from Google Calendar: {e}")

                del self.events[i]
                self._save_events()
                return True

        return False

    def _load_events(self) -> List[InterviewEvent]:
        """Load events from file."""

        if not self.events_file.exists():
            return []

        with open(self.events_file, 'r') as f:
            data = json.load(f)

        events = []
        for item in data:
            item['event_type'] = EventType(item['event_type'])
            events.append(InterviewEvent(**item))

        return events

    def _save_events(self):
        """Save events to file."""

        data = []
        for event in self.events:
            event_dict = asdict(event)
            event_dict['event_type'] = event.event_type.value
            data.append(event_dict)

        with open(self.events_file, 'w') as f:
            json.dump(data, f, indent=2)


# CLI
def main():
    """CLI for calendar integration."""

    import argparse

    parser = argparse.ArgumentParser(description="Calendar Integration for Job Hunting")
    parser.add_argument("action", choices=["create", "list", "availability", "parse"],
                        help="Action to perform")
    parser.add_argument("--company", help="Company name")
    parser.add_argument("--job-title", help="Job title")
    parser.add_argument("--datetime", help="Interview datetime (YYYY-MM-DD HH:MM)")
    parser.add_argument("--type", choices=[t.value for t in EventType],
                        default="phone_screen", help="Event type")
    parser.add_argument("--duration", type=int, default=60, help="Duration in minutes")
    parser.add_argument("--video-link", help="Video conference link")
    parser.add_argument("--days", type=int, default=7, help="Days to look ahead")
    parser.add_argument("--email-file", help="Email file to parse")

    args = parser.parse_args()

    calendar = CalendarIntegration()

    if args.action == "create":
        if not all([args.company, args.job_title, args.datetime]):
            print("❌ Missing required arguments: --company, --job-title, --datetime")
            return 1

        # Parse datetime
        dt = datetime.strptime(args.datetime, "%Y-%m-%d %H:%M")

        event = calendar.create_interview_event(
            company=args.company,
            job_title=args.job_title,
            start_datetime=dt,
            event_type=EventType(args.type),
            duration_minutes=args.duration,
            video_link=args.video_link
        )

        print(f"\n✅ Event created: {event.id}")

    elif args.action == "list":
        upcoming = calendar.get_upcoming_interviews(days=args.days)

        print(f"\n📅 UPCOMING INTERVIEWS (next {args.days} days)\n")

        if not upcoming:
            print("No upcoming interviews scheduled")
        else:
            for event in upcoming:
                dt = datetime.fromisoformat(event.start_datetime)
                print(f"{dt.strftime('%Y-%m-%d %H:%M')} - {event.company}")
                print(f"   {event.event_type.value} - {event.duration_minutes} min")
                if event.video_link:
                    print(f"   Link: {event.video_link}")
                print()

    elif args.action == "availability":
        text = calendar.generate_scheduling_link_text(days_ahead=args.days)
        print(f"\n{text}")

    elif args.action == "parse":
        if not args.email_file:
            print("❌ Missing --email-file argument")
            return 1

        with open(args.email_file, 'r') as f:
            email_body = f.read()

        details = calendar.parse_interview_from_email(email_body)

        if details:
            print("\n📧 PARSED INTERVIEW DETAILS:\n")
            print(json.dumps(details, indent=2))
        else:
            print("\n⚠️  No interview details found in email")

    return 0


if __name__ == "__main__":
    exit(main())
