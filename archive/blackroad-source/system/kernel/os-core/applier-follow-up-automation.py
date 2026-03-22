#!/usr/bin/env python3
"""
Automated Follow-up System

Features:
- Automatic thank-you emails after interviews
- Follow-up scheduling based on application stage
- Timing optimization (24-48 hours post-interview)
- Status-based follow-ups
- Gmail integration for sending
- Follow-up effectiveness tracking
- AI-powered message personalization
"""

import json
import os
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
from enum import Enum

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    import base64
    from email.mime.text import MIMEText
    GMAIL_AVAILABLE = True
except ImportError:
    GMAIL_AVAILABLE = False


class FollowUpType(Enum):
    """Type of follow-up."""
    APPLICATION_SUBMITTED = "application_submitted"
    INTERVIEW_THANK_YOU = "interview_thank_you"
    POST_INTERVIEW_CHECK_IN = "post_interview_check_in"
    OFFER_PENDING = "offer_pending"
    REJECTION_RESPONSE = "rejection_response"
    NETWORKING = "networking"
    REFERRAL_REQUEST = "referral_request"


class FollowUpStatus(Enum):
    """Follow-up status."""
    SCHEDULED = "scheduled"
    SENT = "sent"
    RESPONDED = "responded"
    NO_RESPONSE = "no_response"
    CANCELLED = "cancelled"


@dataclass
class FollowUpSchedule:
    """Follow-up schedule configuration."""
    id: str
    company: str
    job_title: str
    recipient_email: str
    recipient_name: str

    follow_up_type: FollowUpType
    status: FollowUpStatus

    # Timing
    trigger_event: str  # "application_submitted", "interview_completed", etc.
    trigger_date: str
    scheduled_date: str
    sent_date: Optional[str] = None

    # Message
    subject: str = ""
    body: str = ""

    # Context
    interview_date: Optional[str] = None
    interviewer_names: List[str] = None
    key_topics_discussed: List[str] = None
    next_steps_mentioned: str = ""

    # Tracking
    email_id: Optional[str] = None  # Gmail message ID
    thread_id: Optional[str] = None  # Gmail thread ID
    opened: bool = False
    responded: bool = False
    response_date: Optional[str] = None

    # Metadata
    created_at: str = ""
    notes: str = ""

    def __post_init__(self):
        if self.interviewer_names is None:
            self.interviewer_names = []
        if self.key_topics_discussed is None:
            self.key_topics_discussed = []
        if not self.created_at:
            self.created_at = datetime.now().isoformat()


class FollowUpAutomation:
    """Automated follow-up system."""

    # Timing rules (in days)
    TIMING_RULES = {
        FollowUpType.APPLICATION_SUBMITTED: 7,  # 1 week after application
        FollowUpType.INTERVIEW_THANK_YOU: 0,  # Same day (within hours)
        FollowUpType.POST_INTERVIEW_CHECK_IN: 5,  # 5 days after interview
        FollowUpType.OFFER_PENDING: 3,  # 3 days after offer
        FollowUpType.REJECTION_RESPONSE: 1,  # Next day
        FollowUpType.NETWORKING: 14,  # 2 weeks
    }

    def __init__(self, api_key: Optional[str] = None):
        """Initialize follow-up automation."""
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if self.api_key and ANTHROPIC_AVAILABLE:
            self.client = anthropic.Anthropic(api_key=self.api_key)
        else:
            self.client = None

        self.data_dir = Path.home() / ".applier" / "follow_ups"
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.schedule_file = self.data_dir / "follow_up_schedule.json"
        self.schedules: List[FollowUpSchedule] = self._load_schedules()

        # Gmail API
        self.gmail_service = None
        if GMAIL_AVAILABLE:
            self._setup_gmail()

    def _setup_gmail(self):
        """Setup Gmail API."""
        SCOPES = ['https://www.googleapis.com/auth/gmail.send',
                  'https://www.googleapis.com/auth/gmail.modify']

        creds = None
        token_path = self.data_dir / "gmail_token.json"

        if token_path.exists():
            creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                # Need to run OAuth flow
                print("⚠️  Gmail not authenticated. Run: applier-pro gmail --setup")
                return

        self.gmail_service = build('gmail', 'v1', credentials=creds)

    def schedule_follow_up(
        self,
        company: str,
        job_title: str,
        recipient_email: str,
        recipient_name: str,
        follow_up_type: FollowUpType,
        trigger_date: Optional[datetime] = None,
        **context
    ) -> FollowUpSchedule:
        """Schedule a follow-up."""

        if trigger_date is None:
            trigger_date = datetime.now()

        # Calculate scheduled date
        days_delay = self.TIMING_RULES.get(follow_up_type, 1)

        # Interview thank-you: send within 4 hours, not same second
        if follow_up_type == FollowUpType.INTERVIEW_THANK_YOU:
            scheduled_date = trigger_date + timedelta(hours=2)
        else:
            scheduled_date = trigger_date + timedelta(days=days_delay)

        schedule = FollowUpSchedule(
            id=f"followup_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            company=company,
            job_title=job_title,
            recipient_email=recipient_email,
            recipient_name=recipient_name,
            follow_up_type=follow_up_type,
            status=FollowUpStatus.SCHEDULED,
            trigger_event=follow_up_type.value,
            trigger_date=trigger_date.isoformat(),
            scheduled_date=scheduled_date.isoformat(),
            interview_date=context.get("interview_date"),
            interviewer_names=context.get("interviewer_names", []),
            key_topics_discussed=context.get("key_topics_discussed", []),
            next_steps_mentioned=context.get("next_steps_mentioned", ""),
            notes=context.get("notes", "")
        )

        # Generate message
        schedule.subject, schedule.body = self._generate_message(schedule)

        self.schedules.append(schedule)
        self._save_schedules()

        print(f"✅ Scheduled {follow_up_type.value} for {company}")
        print(f"   Will send on: {scheduled_date.strftime('%Y-%m-%d %H:%M')}")

        return schedule

    def _generate_message(self, schedule: FollowUpSchedule) -> tuple[str, str]:
        """Generate follow-up message."""

        # Use AI if available
        if self.client:
            return self._generate_ai_message(schedule)
        else:
            return self._generate_template_message(schedule)

    def _generate_ai_message(self, schedule: FollowUpSchedule) -> tuple[str, str]:
        """Generate personalized message using Claude."""

        context_info = f"""
Company: {schedule.company}
Position: {schedule.job_title}
Recipient: {schedule.recipient_name}
Follow-up Type: {schedule.follow_up_type.value}
"""

        if schedule.interview_date:
            context_info += f"\nInterview Date: {schedule.interview_date}"
        if schedule.interviewer_names:
            context_info += f"\nInterviewers: {', '.join(schedule.interviewer_names)}"
        if schedule.key_topics_discussed:
            context_info += f"\nTopics Discussed: {', '.join(schedule.key_topics_discussed)}"
        if schedule.next_steps_mentioned:
            context_info += f"\nNext Steps Mentioned: {schedule.next_steps_mentioned}"

        prompt = f"""Write a professional follow-up email for a job application.

CONTEXT:
{context_info}

REQUIREMENTS:
1. Keep it concise (3-4 short paragraphs)
2. Express genuine interest
3. Reference specific topics from interview if applicable
4. Be professional but warm
5. Include clear call-to-action
6. Don't be overly formal or robotic

Return ONLY:
SUBJECT: [subject line]
BODY: [email body]

No extra commentary."""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )

            response = message.content[0].text.strip()

            # Parse subject and body
            lines = response.split('\n')
            subject = ""
            body = []
            in_body = False

            for line in lines:
                if line.startswith("SUBJECT:"):
                    subject = line.replace("SUBJECT:", "").strip()
                elif line.startswith("BODY:"):
                    in_body = True
                    body_text = line.replace("BODY:", "").strip()
                    if body_text:
                        body.append(body_text)
                elif in_body:
                    body.append(line)

            return subject, '\n'.join(body)

        except Exception as e:
            print(f"⚠️  AI generation failed: {e}")
            return self._generate_template_message(schedule)

    def _generate_template_message(self, schedule: FollowUpSchedule) -> tuple[str, str]:
        """Generate message from templates."""

        templates = {
            FollowUpType.INTERVIEW_THANK_YOU: {
                "subject": f"Thank you - {schedule.job_title} Interview",
                "body": f"""Dear {schedule.recipient_name},

Thank you for taking the time to meet with me today regarding the {schedule.job_title} position at {schedule.company}. I enjoyed our conversation and learning more about the team and the exciting work you're doing.

I'm very interested in this opportunity and believe my skills would be a great fit. Please let me know if you need any additional information from me.

I look forward to hearing about the next steps.

Best regards"""
            },

            FollowUpType.APPLICATION_SUBMITTED: {
                "subject": f"Following up - {schedule.job_title} Application",
                "body": f"""Dear {schedule.recipient_name},

I wanted to follow up on my application for the {schedule.job_title} position at {schedule.company}, which I submitted on {schedule.trigger_date[:10]}.

I remain very interested in this opportunity and would welcome the chance to discuss how my experience could benefit your team.

Would it be possible to schedule a brief conversation?

Best regards"""
            },

            FollowUpType.POST_INTERVIEW_CHECK_IN: {
                "subject": f"Checking in - {schedule.job_title} Position",
                "body": f"""Dear {schedule.recipient_name},

I wanted to check in regarding the {schedule.job_title} position we discussed. I remain very interested in this opportunity and would be happy to provide any additional information.

Please let me know if there's anything else you need from me.

Best regards"""
            },

            FollowUpType.REJECTION_RESPONSE: {
                "subject": f"Thank you - {schedule.job_title}",
                "body": f"""Dear {schedule.recipient_name},

Thank you for letting me know about your decision regarding the {schedule.job_title} position. While I'm disappointed, I appreciate the time you took to consider my application.

I remain interested in {schedule.company} and would welcome the opportunity to be considered for future openings that match my background.

Best regards"""
            },
        }

        template = templates.get(
            schedule.follow_up_type,
            {
                "subject": f"Following up - {schedule.job_title}",
                "body": f"Dear {schedule.recipient_name},\n\nI wanted to follow up regarding the {schedule.job_title} position at {schedule.company}.\n\nBest regards"
            }
        )

        return template["subject"], template["body"]

    def send_due_follow_ups(self) -> List[FollowUpSchedule]:
        """Send all due follow-ups."""

        now = datetime.now()
        sent = []

        for schedule in self.schedules:
            if schedule.status != FollowUpStatus.SCHEDULED:
                continue

            scheduled_dt = datetime.fromisoformat(schedule.scheduled_date)

            if scheduled_dt <= now:
                success = self._send_email(schedule)
                if success:
                    schedule.status = FollowUpStatus.SENT
                    schedule.sent_date = now.isoformat()
                    sent.append(schedule)
                    print(f"📧 Sent: {schedule.follow_up_type.value} to {schedule.company}")

        if sent:
            self._save_schedules()

        return sent

    def _send_email(self, schedule: FollowUpSchedule) -> bool:
        """Send email via Gmail."""

        if not self.gmail_service:
            print(f"⚠️  Gmail not configured. Email not sent.")
            print(f"\nSUBJECT: {schedule.subject}")
            print(f"TO: {schedule.recipient_email}")
            print(f"\n{schedule.body}\n")
            return False

        try:
            message = MIMEText(schedule.body)
            message['to'] = schedule.recipient_email
            message['subject'] = schedule.subject

            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')

            result = self.gmail_service.users().messages().send(
                userId='me',
                body={'raw': raw_message}
            ).execute()

            schedule.email_id = result['id']
            schedule.thread_id = result['threadId']

            return True

        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            return False

    def check_responses(self) -> List[FollowUpSchedule]:
        """Check for responses to sent follow-ups."""

        if not self.gmail_service:
            return []

        responded = []

        for schedule in self.schedules:
            if schedule.status != FollowUpStatus.SENT:
                continue

            if not schedule.thread_id:
                continue

            # Check if thread has new messages
            try:
                thread = self.gmail_service.users().threads().get(
                    userId='me',
                    id=schedule.thread_id
                ).execute()

                # If thread has more than 1 message, there's a response
                if len(thread['messages']) > 1:
                    schedule.status = FollowUpStatus.RESPONDED
                    schedule.responded = True
                    schedule.response_date = datetime.now().isoformat()
                    responded.append(schedule)
                    print(f"✅ Response received from {schedule.company}")

            except Exception as e:
                print(f"⚠️  Could not check thread {schedule.thread_id}: {e}")

        if responded:
            self._save_schedules()

        return responded

    def get_statistics(self) -> Dict:
        """Get follow-up statistics."""

        stats = {
            "total_scheduled": 0,
            "total_sent": 0,
            "total_responded": 0,
            "response_rate": 0.0,
            "by_type": {},
            "avg_response_time_hours": 0.0
        }

        response_times = []

        for schedule in self.schedules:
            stats["total_scheduled"] += 1

            if schedule.status == FollowUpStatus.SENT:
                stats["total_sent"] += 1

            if schedule.status == FollowUpStatus.RESPONDED:
                stats["total_responded"] += 1

                # Calculate response time
                if schedule.sent_date and schedule.response_date:
                    sent = datetime.fromisoformat(schedule.sent_date)
                    responded = datetime.fromisoformat(schedule.response_date)
                    hours = (responded - sent).total_seconds() / 3600
                    response_times.append(hours)

            # By type
            type_key = schedule.follow_up_type.value
            if type_key not in stats["by_type"]:
                stats["by_type"][type_key] = {"sent": 0, "responded": 0}

            if schedule.status in [FollowUpStatus.SENT, FollowUpStatus.RESPONDED]:
                stats["by_type"][type_key]["sent"] += 1
            if schedule.status == FollowUpStatus.RESPONDED:
                stats["by_type"][type_key]["responded"] += 1

        if stats["total_sent"] > 0:
            stats["response_rate"] = (stats["total_responded"] / stats["total_sent"]) * 100

        if response_times:
            stats["avg_response_time_hours"] = sum(response_times) / len(response_times)

        return stats

    def cancel_follow_up(self, follow_up_id: str) -> bool:
        """Cancel a scheduled follow-up."""

        for schedule in self.schedules:
            if schedule.id == follow_up_id:
                if schedule.status == FollowUpStatus.SCHEDULED:
                    schedule.status = FollowUpStatus.CANCELLED
                    self._save_schedules()
                    print(f"✅ Cancelled follow-up to {schedule.company}")
                    return True
                else:
                    print(f"⚠️  Follow-up already {schedule.status.value}")
                    return False

        print(f"❌ Follow-up {follow_up_id} not found")
        return False

    def list_upcoming(self, days: int = 7) -> List[FollowUpSchedule]:
        """List upcoming follow-ups."""

        now = datetime.now()
        cutoff = now + timedelta(days=days)

        upcoming = []
        for schedule in self.schedules:
            if schedule.status != FollowUpStatus.SCHEDULED:
                continue

            scheduled_dt = datetime.fromisoformat(schedule.scheduled_date)
            if now <= scheduled_dt <= cutoff:
                upcoming.append(schedule)

        # Sort by scheduled date
        upcoming.sort(key=lambda s: s.scheduled_date)

        return upcoming

    def _load_schedules(self) -> List[FollowUpSchedule]:
        """Load schedules from file."""

        if not self.schedule_file.exists():
            return []

        with open(self.schedule_file, 'r') as f:
            data = json.load(f)

        schedules = []
        for item in data:
            # Convert enum strings back to enums
            item['follow_up_type'] = FollowUpType(item['follow_up_type'])
            item['status'] = FollowUpStatus(item['status'])
            schedules.append(FollowUpSchedule(**item))

        return schedules

    def _save_schedules(self):
        """Save schedules to file."""

        data = []
        for schedule in self.schedules:
            schedule_dict = asdict(schedule)
            # Convert enums to strings
            schedule_dict['follow_up_type'] = schedule.follow_up_type.value
            schedule_dict['status'] = schedule.status.value
            data.append(schedule_dict)

        with open(self.schedule_file, 'w') as f:
            json.dump(data, f, indent=2)


# CLI
def main():
    """CLI for follow-up automation."""

    import argparse

    parser = argparse.ArgumentParser(description="Automated Follow-up System")
    parser.add_argument("action", choices=["schedule", "send", "check", "stats", "list", "cancel"],
                        help="Action to perform")
    parser.add_argument("--company", help="Company name")
    parser.add_argument("--job-title", help="Job title")
    parser.add_argument("--email", help="Recipient email")
    parser.add_argument("--name", help="Recipient name")
    parser.add_argument("--type", choices=[t.value for t in FollowUpType],
                        help="Follow-up type")
    parser.add_argument("--id", help="Follow-up ID (for cancel)")
    parser.add_argument("--days", type=int, default=7, help="Days to look ahead (for list)")

    args = parser.parse_args()

    automation = FollowUpAutomation()

    if args.action == "schedule":
        if not all([args.company, args.job_title, args.email, args.name, args.type]):
            print("❌ Missing required arguments for schedule")
            return 1

        follow_up_type = FollowUpType(args.type)
        schedule = automation.schedule_follow_up(
            company=args.company,
            job_title=args.job_title,
            recipient_email=args.email,
            recipient_name=args.name,
            follow_up_type=follow_up_type
        )

        print(f"\n📧 PREVIEW:")
        print(f"Subject: {schedule.subject}")
        print(f"\n{schedule.body}\n")

    elif args.action == "send":
        sent = automation.send_due_follow_ups()
        print(f"\n✅ Sent {len(sent)} follow-up(s)")

    elif args.action == "check":
        responded = automation.check_responses()
        print(f"\n✅ Found {len(responded)} new response(s)")

    elif args.action == "stats":
        stats = automation.get_statistics()

        print("\n📊 FOLLOW-UP STATISTICS\n")
        print(f"Total Scheduled: {stats['total_scheduled']}")
        print(f"Total Sent: {stats['total_sent']}")
        print(f"Total Responded: {stats['total_responded']}")
        print(f"Response Rate: {stats['response_rate']:.1f}%")

        if stats['avg_response_time_hours'] > 0:
            print(f"Avg Response Time: {stats['avg_response_time_hours']:.1f} hours")

        print("\n📈 BY TYPE:\n")
        for type_name, type_stats in stats['by_type'].items():
            sent = type_stats['sent']
            responded = type_stats['responded']
            rate = (responded / sent * 100) if sent > 0 else 0
            print(f"{type_name:30} {sent:3} sent, {responded:3} responded ({rate:.0f}%)")

    elif args.action == "list":
        upcoming = automation.list_upcoming(days=args.days)

        print(f"\n📅 UPCOMING FOLLOW-UPS (next {args.days} days)\n")

        if not upcoming:
            print("No upcoming follow-ups scheduled")
        else:
            for schedule in upcoming:
                scheduled_dt = datetime.fromisoformat(schedule.scheduled_date)
                print(f"{scheduled_dt.strftime('%Y-%m-%d %H:%M')} - {schedule.company} - {schedule.follow_up_type.value}")

    elif args.action == "cancel":
        if not args.id:
            print("❌ Missing --id argument")
            return 1

        automation.cancel_follow_up(args.id)

    return 0


if __name__ == "__main__":
    exit(main())
