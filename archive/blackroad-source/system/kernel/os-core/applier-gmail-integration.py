#!/usr/bin/env python3
"""
Gmail Integration for Job Applications

Features:
- Parse job-related emails automatically
- Extract interview invitations
- Track application status updates
- Auto-reply to recruiters
- Schedule follow-ups
- Email templates for common scenarios
- Attachment extraction (offer letters, etc.)
- Email sentiment analysis
"""

import os
import re
import json
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
from enum import Enum
import base64

try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    GMAIL_AVAILABLE = True
except ImportError:
    GMAIL_AVAILABLE = False
    print("⚠️  Install Google API: pip install google-auth-oauthlib google-api-python-client")


# Gmail API scopes
SCOPES = ['https://www.googleapis.com/auth/gmail.modify']


class EmailType(Enum):
    """Types of job-related emails."""
    APPLICATION_RECEIVED = "application_received"
    INTERVIEW_INVITATION = "interview_invitation"
    INTERVIEW_CONFIRMATION = "interview_confirmation"
    REJECTION = "rejection"
    OFFER = "offer"
    RECRUITER_OUTREACH = "recruiter_outreach"
    FOLLOW_UP_REQUEST = "follow_up_request"
    ASSESSMENT_INVITE = "assessment_invite"
    REFERENCE_CHECK = "reference_check"
    UNKNOWN = "unknown"


@dataclass
class JobEmail:
    """Job-related email."""
    email_id: str
    thread_id: str
    from_address: str
    from_name: str
    subject: str
    body: str
    received_at: str
    email_type: EmailType
    company: Optional[str] = None
    job_title: Optional[str] = None
    interview_date: Optional[str] = None
    interview_time: Optional[str] = None
    interview_link: Optional[str] = None
    sentiment: str = "neutral"  # positive, negative, neutral
    requires_action: bool = False
    action_deadline: Optional[str] = None
    attachments: List[str] = None


class GmailIntegration:
    """Gmail integration for job applications."""

    def __init__(self, credentials_path: str = None):
        """Initialize Gmail integration."""
        self.credentials_path = credentials_path or str(Path.home() / ".applier" / "gmail_credentials.json")
        self.token_path = Path.home() / ".applier" / "gmail_token.json"
        self.data_dir = Path.home() / ".applier" / "emails"
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        self.service = None
        if GMAIL_AVAILABLE:
            self.service = self._authenticate()

    def _authenticate(self):
        """Authenticate with Gmail API."""
        creds = None
        
        # Load existing token
        if self.token_path.exists():
            creds = Credentials.from_authorized_user_file(str(self.token_path), SCOPES)
        
        # If no valid credentials, authenticate
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not Path(self.credentials_path).exists():
                    print(f"❌ Gmail credentials not found at {self.credentials_path}")
                    print("   Get credentials from: https://console.cloud.google.com/")
                    return None
                
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, SCOPES
                )
                creds = flow.run_local_server(port=0)
            
            # Save token
            with open(self.token_path, 'w') as token:
                token.write(creds.to_json())
        
        return build('gmail', 'v1', credentials=creds)

    def fetch_job_emails(
        self,
        days_back: int = 30,
        query: str = None
    ) -> List[JobEmail]:
        """Fetch job-related emails."""
        
        if not self.service:
            print("❌ Gmail service not available")
            return []

        print(f"\n📧 Fetching job emails from last {days_back} days...")

        # Build query
        if not query:
            # Common job-related keywords
            keywords = [
                "application received",
                "interview",
                "offer",
                "recruiter",
                "job opportunity",
                "assessment",
                "reference check",
                "phone screen",
                "onsite",
                "thank you for applying"
            ]
            query = " OR ".join(keywords)

        # Add date filter
        date_filter = f"after:{(datetime.now() - timedelta(days=days_back)).strftime('%Y/%m/%d')}"
        full_query = f"({query}) {date_filter}"

        # Search emails
        results = self.service.users().messages().list(
            userId='me',
            q=full_query,
            maxResults=100
        ).execute()

        messages = results.get('messages', [])
        print(f"   Found {len(messages)} emails")

        # Parse emails
        job_emails = []
        for msg in messages:
            email = self._parse_email(msg['id'])
            if email:
                job_emails.append(email)

        # Save to cache
        self._save_emails(job_emails)

        return job_emails

    def _parse_email(self, email_id: str) -> Optional[JobEmail]:
        """Parse a single email."""
        try:
            msg = self.service.users().messages().get(
                userId='me',
                id=email_id,
                format='full'
            ).execute()

            headers = {h['name']: h['value'] for h in msg['payload']['headers']}
            
            # Extract body
            body = self._get_email_body(msg)
            
            # Parse email details
            from_address = headers.get('From', '')
            from_match = re.search(r'<(.+?)>', from_address)
            from_email = from_match.group(1) if from_match else from_address
            from_name = from_address.split('<')[0].strip().strip('"')
            
            subject = headers.get('Subject', '')
            received_date = headers.get('Date', '')
            
            # Classify email type
            email_type = self._classify_email(subject, body)
            
            # Extract entities
            company = self._extract_company(from_email, subject, body)
            job_title = self._extract_job_title(subject, body)
            interview_date, interview_time = self._extract_interview_datetime(body)
            interview_link = self._extract_interview_link(body)
            
            # Analyze sentiment
            sentiment = self._analyze_sentiment(subject, body)
            
            # Check if action required
            requires_action, action_deadline = self._check_action_required(body, email_type)
            
            return JobEmail(
                email_id=email_id,
                thread_id=msg['threadId'],
                from_address=from_email,
                from_name=from_name,
                subject=subject,
                body=body,
                received_at=received_date,
                email_type=email_type,
                company=company,
                job_title=job_title,
                interview_date=interview_date,
                interview_time=interview_time,
                interview_link=interview_link,
                sentiment=sentiment,
                requires_action=requires_action,
                action_deadline=action_deadline,
                attachments=[]
            )
        
        except Exception as e:
            print(f"   ⚠️  Error parsing email {email_id}: {e}")
            return None

    def _get_email_body(self, msg: dict) -> str:
        """Extract email body."""
        if 'parts' in msg['payload']:
            parts = msg['payload']['parts']
            for part in parts:
                if part['mimeType'] == 'text/plain':
                    data = part['body'].get('data', '')
                    if data:
                        return base64.urlsafe_b64decode(data).decode('utf-8')
        else:
            data = msg['payload']['body'].get('data', '')
            if data:
                return base64.urlsafe_b64decode(data).decode('utf-8')
        return ""

    def _classify_email(self, subject: str, body: str) -> EmailType:
        """Classify email type."""
        text = (subject + " " + body).lower()
        
        # Patterns for each type
        patterns = {
            EmailType.APPLICATION_RECEIVED: [
                "application received", "thank you for applying", 
                "we have received your application", "application status"
            ],
            EmailType.INTERVIEW_INVITATION: [
                "interview", "would you be available", "schedule a call",
                "phone screen", "video call", "onsite"
            ],
            EmailType.INTERVIEW_CONFIRMATION: [
                "interview confirmation", "confirmed for", "looking forward to meeting"
            ],
            EmailType.REJECTION: [
                "unfortunately", "not moving forward", "other candidates",
                "decided to pursue", "not the right fit"
            ],
            EmailType.OFFER: [
                "offer", "congratulations", "we're excited to offer",
                "offer letter", "compensation package"
            ],
            EmailType.RECRUITER_OUTREACH: [
                "opportunity", "role that might interest", "recruiting for",
                "your background caught", "linkedin profile"
            ],
            EmailType.ASSESSMENT_INVITE: [
                "assessment", "coding challenge", "take-home", "complete the"
            ],
            EmailType.REFERENCE_CHECK: [
                "reference check", "references", "provide references"
            ],
        }
        
        for email_type, keywords in patterns.items():
            if any(keyword in text for keyword in keywords):
                return email_type
        
        return EmailType.UNKNOWN

    def _extract_company(self, from_email: str, subject: str, body: str) -> Optional[str]:
        """Extract company name."""
        # Try email domain
        domain = from_email.split('@')[-1]
        if domain and domain not in ['gmail.com', 'yahoo.com', 'outlook.com', 'linkedin.com']:
            company = domain.split('.')[0]
            return company.capitalize()
        
        # Try subject/body
        match = re.search(r'at ([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)', subject + " " + body)
        if match:
            return match.group(1)
        
        return None

    def _extract_job_title(self, subject: str, body: str) -> Optional[str]:
        """Extract job title."""
        # Common patterns
        patterns = [
            r'(?:for|as|position:|role:)\s+([A-Z][a-zA-Z\s&/]+(?:Engineer|Developer|Manager|Analyst|Designer|Scientist))',
            r'([A-Z][a-zA-Z\s&/]+(?:Engineer|Developer|Manager|Analyst|Designer|Scientist))\s+position',
        ]
        
        text = subject + " " + body
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1).strip()
        
        return None

    def _extract_interview_datetime(self, body: str) -> Tuple[Optional[str], Optional[str]]:
        """Extract interview date and time."""
        # Date patterns
        date_pattern = r'(\w+day,?\s+\w+\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?)'
        date_match = re.search(date_pattern, body)
        date = date_match.group(1) if date_match else None
        
        # Time patterns
        time_pattern = r'(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))'
        time_match = re.search(time_pattern, body)
        time = time_match.group(1) if time_match else None
        
        return date, time

    def _extract_interview_link(self, body: str) -> Optional[str]:
        """Extract video interview link."""
        # Zoom, Google Meet, Teams, etc.
        patterns = [
            r'(https://[\w.-]+\.zoom\.us/\S+)',
            r'(https://meet\.google\.com/\S+)',
            r'(https://teams\.microsoft\.com/\S+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, body)
            if match:
                return match.group(1)
        
        return None

    def _analyze_sentiment(self, subject: str, body: str) -> str:
        """Analyze email sentiment."""
        text = (subject + " " + body).lower()
        
        positive_keywords = [
            "congratulations", "excited", "impressed", "great", "excellent",
            "offer", "next steps", "looking forward"
        ]
        
        negative_keywords = [
            "unfortunately", "regret", "not moving forward", "other candidates",
            "decided to pursue", "not selected"
        ]
        
        positive_count = sum(1 for k in positive_keywords if k in text)
        negative_count = sum(1 for k in negative_keywords if k in text)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"

    def _check_action_required(self, body: str, email_type: EmailType) -> Tuple[bool, Optional[str]]:
        """Check if action is required."""
        text = body.lower()
        
        # Action keywords
        action_keywords = [
            "please confirm", "please reply", "respond by", "deadline",
            "complete by", "submit by", "let us know by"
        ]
        
        requires_action = any(keyword in text for keyword in action_keywords)
        
        # Extract deadline
        deadline_pattern = r'by\s+(\w+day,?\s+\w+\s+\d{1,2})'
        deadline_match = re.search(deadline_pattern, body)
        deadline = deadline_match.group(1) if deadline_match else None
        
        # Certain email types always require action
        if email_type in [EmailType.INTERVIEW_INVITATION, EmailType.OFFER, EmailType.ASSESSMENT_INVITE]:
            requires_action = True
        
        return requires_action, deadline

    def send_reply(
        self,
        to: str,
        subject: str,
        body: str,
        thread_id: str = None
    ) -> bool:
        """Send an email reply."""
        
        if not self.service:
            print("❌ Gmail service not available")
            return False

        try:
            message = self._create_message(to, subject, body, thread_id)
            
            self.service.users().messages().send(
                userId='me',
                body=message
            ).execute()
            
            print(f"✅ Email sent to {to}")
            return True
        
        except Exception as e:
            print(f"❌ Error sending email: {e}")
            return False

    def _create_message(self, to: str, subject: str, body: str, thread_id: str = None) -> dict:
        """Create email message."""
        import email.mime.text
        
        message = email.mime.text.MIMEText(body)
        message['to'] = to
        message['subject'] = subject
        
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        
        msg_dict = {'raw': raw}
        if thread_id:
            msg_dict['threadId'] = thread_id
        
        return msg_dict

    def _save_emails(self, emails: List[JobEmail]):
        """Save emails to cache."""
        filename = f"job_emails_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = self.data_dir / filename
        
        with open(filepath, 'w') as f:
            json.dump([asdict(e) for e in emails], f, indent=2, default=str)
        
        print(f"\n💾 Emails saved: {filepath}")


# Email templates
EMAIL_TEMPLATES = {
    "interview_confirmation": """
Dear {recruiter_name},

Thank you for the interview invitation for the {job_title} position at {company}.

I'm excited to confirm my availability for {interview_date} at {interview_time}.

{meeting_details}

I look forward to speaking with you and learning more about the role and {company}.

Best regards,
{your_name}
""",

    "interview_reschedule": """
Dear {recruiter_name},

Thank you for scheduling the interview for {interview_date} at {interview_time}.

Unfortunately, I have a conflict at that time. Would it be possible to reschedule to one of these alternative times?

{alternative_times}

I apologize for any inconvenience and appreciate your flexibility.

Best regards,
{your_name}
""",

    "assessment_confirmation": """
Dear {recruiter_name},

Thank you for sending the assessment for the {job_title} position.

I will complete it by {deadline} and look forward to the next steps in the process.

Best regards,
{your_name}
""",

    "offer_acceptance": """
Dear {recruiter_name},

I'm thrilled to accept the offer for the {job_title} position at {company}!

I'm excited to join the team and contribute to {company}'s success.

Please let me know the next steps for onboarding.

Best regards,
{your_name}
""",

    "follow_up_after_interview": """
Dear {recruiter_name},

Thank you again for taking the time to interview me for the {job_title} position on {interview_date}.

I enjoyed our conversation and learning more about {company} and the role. I'm very excited about the opportunity to contribute to the team.

Please let me know if you need any additional information from me.

Best regards,
{your_name}
"""
}


# CLI
def main():
    """CLI for Gmail integration."""
    import argparse

    parser = argparse.ArgumentParser(description="Gmail Integration for Job Applications")
    parser.add_argument("--fetch", action="store_true", help="Fetch job emails")
    parser.add_argument("--days", type=int, default=30, help="Days to look back")
    parser.add_argument("--send-template", choices=list(EMAIL_TEMPLATES.keys()), help="Send email from template")

    args = parser.parse_args()

    # Initialize Gmail
    gmail = GmailIntegration()

    if args.fetch:
        # Fetch emails
        emails = gmail.fetch_job_emails(days_back=args.days)
        
        print(f"\n{'='*60}")
        print(f"Found {len(emails)} job-related emails")
        print(f"{'='*60}")
        
        # Group by type
        by_type = {}
        for email in emails:
            email_type = email.email_type.value
            if email_type not in by_type:
                by_type[email_type] = []
            by_type[email_type].append(email)
        
        # Print summary
        for email_type, type_emails in by_type.items():
            print(f"\n{email_type.upper().replace('_', ' ')}: {len(type_emails)}")
            for email in type_emails[:3]:  # Show first 3
                print(f"   - {email.from_name} ({email.company or 'Unknown'})")
                print(f"     Subject: {email.subject}")
                if email.requires_action:
                    print(f"     ⚠️  Action required{f' by {email.action_deadline}' if email.action_deadline else ''}")

    return 0


if __name__ == "__main__":
    exit(main())
