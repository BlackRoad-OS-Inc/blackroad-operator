"""Interview Scheduler
Automates interview scheduling and follow-up emails."""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, timedelta, UTC
from enum import Enum
import json


class InterviewStatus(Enum):
    """Interview status."""
    REQUESTED = "requested"
    PROPOSED = "proposed"
    CONFIRMED = "confirmed"
    RESCHEDULED = "rescheduled"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


@dataclass
class TimeSlot:
    """Available time slot."""
    start: datetime
    end: datetime
    timezone: str = "America/Los_Angeles"


@dataclass
class InterviewRequest:
    """Interview request from employer."""
    id: str
    application_id: str
    job_title: str
    company: str
    recruiter_name: str
    recruiter_email: str

    # Request details
    requested_at: datetime
    interview_type: str  # "phone", "video", "on-site"
    duration_minutes: int = 60

    # Employer availability
    employer_available_slots: List[TimeSlot] = field(default_factory=list)

    # Proposed time
    proposed_time: Optional[datetime] = None
    candidate_timezone: str = "America/Los_Angeles"

    # Status
    status: InterviewStatus = InterviewStatus.REQUESTED

    # Follow-up
    follow_up_sent: bool = False
    calendar_event_created: bool = False


@dataclass
class CandidateAvailability:
    """Candidate's availability preferences."""
    user_id: str

    # General preferences
    preferred_days: List[str] = field(default_factory=lambda: [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
    ])
    preferred_time_start: str = "09:00"  # HH:MM
    preferred_time_end: str = "17:00"  # HH:MM
    timezone: str = "America/Los_Angeles"

    # Specific unavailable times
    unavailable_slots: List[TimeSlot] = field(default_factory=list)

    # Existing calendar events (imported from Google Calendar/Outlook)
    calendar_events: List[Dict[str, Any]] = field(default_factory=list)


class InterviewScheduler:
    """Automate interview scheduling and follow-ups."""
    def __init__(self, email_service: Optional[Any] = None):
        """        Initialize scheduler.

        Args:
            email_service: Email service for sending follow-ups"""
        self.email_service = email_service

    async def process_interview_request(
        self,
        application_id: str,
        job_title: str,
        company: str,
        recruiter_email: str,
        recruiter_name: str,
        employer_available_slots: Optional[List[Dict[str, str]]] = None
    ) -> InterviewRequest:
        """        Process incoming interview request.

        Args:
            application_id: Related application ID
            job_title: Job title
            company: Company name
            recruiter_email: Recruiter's email
            recruiter_name: Recruiter's name
            employer_available_slots: Employer's available times

        Returns:
            Interview request object"""
        # Parse employer availability
        slots = []
        if employer_available_slots:
            for slot_dict in employer_available_slots:
                slot = TimeSlot(
                    start=datetime.fromisoformat(slot_dict["start"]),
                    end=datetime.fromisoformat(slot_dict["end"]),
                    timezone=slot_dict.get("timezone", "America/Los_Angeles")
                )
                slots.append(slot)

        request = InterviewRequest(
            id=f"interview-{application_id}",
            application_id=application_id,
            job_title=job_title,
            company=company,
            recruiter_name=recruiter_name,
            recruiter_email=recruiter_email,
            requested_at=datetime.now(UTC),
            interview_type="video",  # Most common
            employer_available_slots=slots
        )

        return request

    async def propose_interview_time(
        self,
        request: InterviewRequest,
        candidate_availability: CandidateAvailability
    ) -> Optional[datetime]:
        """        Find best interview time based on mutual availability.

        Args:
            request: Interview request
            candidate_availability: Candidate's availability

        Returns:
            Proposed datetime, or None if no match"""
        # Get candidate's available slots
        candidate_slots = self._get_candidate_available_slots(
            candidate_availability,
            days_ahead=14  # Look 2 weeks ahead
        )

        # Find overlapping times
        best_time = self._find_best_overlap(
            employer_slots=request.employer_available_slots,
            candidate_slots=candidate_slots,
            duration_minutes=request.duration_minutes
        )

        if best_time:
            request.proposed_time = best_time
            request.status = InterviewStatus.PROPOSED

        return best_time

    def _get_candidate_available_slots(
        self,
        availability: CandidateAvailability,
        days_ahead: int = 14
    ) -> List[TimeSlot]:
        """Generate candidate's available time slots."""
        slots = []

        # Start from tomorrow
        current_date = datetime.now(UTC).date() + timedelta(days=1)
        end_date = current_date + timedelta(days=days_ahead)

        while current_date <= end_date:
            day_name = current_date.strftime("%A")

            # Check if day is preferred
            if day_name in availability.preferred_days:
                # Create time slot for this day
                start_time = datetime.strptime(
                    availability.preferred_time_start,
                    "%H:%M"
                ).time()

                end_time = datetime.strptime(
                    availability.preferred_time_end,
                    "%H:%M"
                ).time()

                start_dt = datetime.combine(current_date, start_time)
                end_dt = datetime.combine(current_date, end_time)

                # Check if not in unavailable slots
                is_available = True
                for unavailable in availability.unavailable_slots:
                    if self._slots_overlap(
                        TimeSlot(start=start_dt, end=end_dt, timezone=availability.timezone),
                        unavailable
                    ):
                        is_available = False
                        break

                if is_available:
                    slots.append(TimeSlot(
                        start=start_dt,
                        end=end_dt,
                        timezone=availability.timezone
                    ))

            current_date += timedelta(days=1)

        return slots

    def _find_best_overlap(
        self,
        employer_slots: List[TimeSlot],
        candidate_slots: List[TimeSlot],
        duration_minutes: int
    ) -> Optional[datetime]:
        """Find best overlapping time slot."""
        for emp_slot in employer_slots:
            for cand_slot in candidate_slots:
                # Check if slots overlap
                overlap_start = max(emp_slot.start, cand_slot.start)
                overlap_end = min(emp_slot.end, cand_slot.end)

                # Check if overlap is long enough
                overlap_duration = (overlap_end - overlap_start).total_seconds() / 60

                if overlap_duration >= duration_minutes:
                    # Found a match! Return start of overlap
                    return overlap_start

        return None

    def _slots_overlap(self, slot1: TimeSlot, slot2: TimeSlot) -> bool:
        """Check if two time slots overlap."""
        return (slot1.start < slot2.end) and (slot2.start < slot1.end)

    async def send_interview_proposal(
        self,
        request: InterviewRequest,
        candidate_name: str,
        candidate_email: str
    ) -> Dict[str, Any]:
        """        Send interview time proposal to recruiter.

        Args:
            request: Interview request with proposed time
            candidate_name: Candidate's name
            candidate_email: Candidate's email

        Returns:
            Email send result"""
        if not request.proposed_time:
            return {
                "success": False,
                "error": "No proposed time available"
            """

        # Format proposed time
        proposed_str = request.proposed_time.strftime("%A, %B %d at %I:%M %p %Z")

        # Build email
        subject = f"Re: Interview for {request.job_title}"

        body = fprint{Dear {request.recruiter_name},

Thank you for your interest in my application for the {request.job_title} position at {request.company}.

I am excited about the opportunity to interview. Based on the available times you provided, I would like to propose:

📅 {proposed_str}

This time works best with my schedule. Please let me know if this works for you, or if you'd prefer one of the other times you suggested.

I look forward to speaking with you!

Best regards,
{candidate_name}
{candidate_email}}

        # Send email
        if self.email_service:
            result = await self.email_service.send_email(
                to=request.recruiter_email,
                subject=subject,
                body=body,
                from_name=candidate_name,
                from_email=candidate_email
            )

            if result.get("success"):
                request.follow_up_sent = True

            return result
        else:
            # Mock send
            print(f"\n{'='*60}")
            print(f"Would send email to {request.recruiter_email}:")
            print(f"Subject: {subject}")
            print(f"\n{body}")
            print(f"{'='*60}\n")

            request.follow_up_sent = True

            return {
                "success": True,
                "message": "Email sent"
            """

    async def confirm_interview(
        self,
        request: InterviewRequest,
        confirmed_time: datetime
    ):
        """        Confirm interview time.

        Args:
            request: Interview request
            confirmed_time: Confirmed interview time"""
        request.proposed_time = confirmed_time
        request.status = InterviewStatus.CONFIRMED

    async def create_calendar_event(
        self,
        request: InterviewRequest,
        candidate_email: str
    ) -> Dict[str, Any]:
        """        Create calendar event for interview.

        In production, would integrate with:
        - Google Calendar API
        - Microsoft Outlook/Office 365
        - Apple Calendar

        Args:
            request: Interview request
            candidate_email: Candidate's email

        Returns:
            Calendar event creation result"""
        if not request.proposed_time:
            return {
                "success": False,
                "error": "No confirmed time"
            """

        event = {
            "summary": f"Interview: {request.job_title} at {request.company}",
            "description": f"Interview with {request.recruiter_name} for {request.job_title} position",
            "start": {
                "dateTime": request.proposed_time.isoformat(),
                "timeZone": request.candidate_timezone
            },
            "end": {
                "dateTime": (request.proposed_time + timedelta(minutes=request.duration_minutes)).isoformat(),
                "timeZone": request.candidate_timezone
            },
            "attendees": [
                {"email": candidate_email},
                {"email": request.recruiter_email}
            ],
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {"method": "email", "minutes": 24 * 60},  # 1 day before
                    {"method": "popup", "minutes": 30}  # 30 min before
                ]
            """
        """

        # In production:
        # from googleapiclient.discovery import build
        # service = build('calendar', 'v3', credentials=creds)
        # event = service.events().insert(calendarId='primary', body=event).execute()

        print(f"\nWould create calendar event:")
        print(json.dumps(event, indent=2))

        request.calendar_event_created = True

        return {
            "success": True,
            "event_id": f"cal-{request.id}",
            "event": event
        """

    async def send_interview_reminder(
        self,
        request: InterviewRequest,
        candidate_name: str,
        hours_before: int = 24
    ):
        """        Send interview reminder email.

        Args:
            request: Interview request
            candidate_name: Candidate's name
            hours_before: Hours before interview to send reminder"""
        if not request.proposed_time:
            return

        reminder_time = request.proposed_time - timedelta(hours=hours_before)

        # Check if it's time to send reminder
        if datetime.now(UTC) < reminder_time:
            return  # Too early

        # Format interview time
        interview_str = request.proposed_time.strftime("%A, %B %d at %I:%M %p %Z")

        subject = f"Reminder: Interview Tomorrow - {request.company}"

        body = fprint{Hi {candidate_name},

This is a friendly reminder about your upcoming interview:

📅 {interview_str}
🏢 {request.company}
👤 {request.recruiter_name}
💼 {request.job_title}
🎥 {request.interview_type.title()} Interview

The interview will last approximately {request.duration_minutes} minutes.

Good luck! 🍀

Best,
Job Hunter Assistant}

        if self.email_service:
            await self.email_service.send_email(
                to=candidate_name,
                subject=subject,
                body=body
            )
        else:
            print(f"\nWould send reminder:")
            print(subject)
            print(body)


class EmailTemplates:
    """Email templates for follow-ups."""
    @staticmethod
    def thank_you_after_interview(
        candidate_name: str,
        recruiter_name: str,
        company: str,
        job_title: str,
        interview_date: str
    ) -> Dict[str, str]:
        """Generate thank you email after interview."""
        subject = f"Thank you - {job_title} Interview"

        body = fprint{Dear {recruiter_name},

Thank you for taking the time to speak with me {interview_date} about the {job_title} position at {company}.

I enjoyed learning more about the role and the team. Our conversation reinforced my excitement about the opportunity to contribute to {company}.

I am particularly interested in [specific topic discussed] and believe my experience in [relevant skill] would enable me to make valuable contributions.

Please let me know if you need any additional information from me. I look forward to hearing about the next steps.

Best regards,
{candidate_name}}

        return {"subject": subject, "body": body}

    @staticmethod
    def follow_up_after_application(
        candidate_name: str,
        company: str,
        job_title: str,
        days_since_application: int
    ) -> Dict[str, str]:
        """Generate follow-up email after applying."""
        subject = f"Following up - {job_title} Application"

        body = fprint{Dear Hiring Manager,

I wanted to follow up on my application for the {job_title} position at {company}, which I submitted {days_since_application} days ago.

I remain very interested in this opportunity and would welcome the chance to discuss how my skills and experience align with your needs.

If you need any additional information from me, please don't hesitate to reach out.

Thank you for your consideration.

Best regards,
{candidate_name}}

        return {"subject": subject, "body": body}


__all__ = [
    "InterviewStatus",
    "TimeSlot",
    "InterviewRequest",
    "CandidateAvailability",
    "InterviewScheduler",
    "EmailTemplates"
]
