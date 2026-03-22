"""Daily Job Hunt Scheduler
Runs automated job hunts at scheduled times and sends email summaries."""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, time, UTC
import asyncio
from enum import Enum

from .analytics import DailyPerformanceReport, ApplicationAnalytics


class SubscriptionTier(Enum):
    """Subscription tiers."""
    FREE = "free"  # 10 applications/day
    PRO = "pro"  # 100 applications/day ($20/month)
    PREMIUM = "premium"  # Unlimited ($50/month max)


@dataclass
class SubscriptionLimits:
    """Usage limits by subscription tier."""
    tier: SubscriptionTier
    max_applications_per_day: int
    max_searches_per_day: int
    priority_support: bool
    advanced_analytics: bool
    custom_branding: bool
    monthly_cost: float


@dataclass
class UsageTracking:
    """Track daily usage for billing."""
    user_id: str
    date: str  # YYYY-MM-DD
    subscription_tier: SubscriptionTier

    # Usage counts
    applications_submitted: int = 0
    searches_performed: int = 0

    # Limits
    daily_application_limit: int = 10
    applications_remaining: int = 10

    # Billing
    overage_applications: int = 0
    estimated_cost: float = 0.0


class SubscriptionManager:
    """Manage subscriptions and usage limits."""
    TIER_LIMITS = {
        SubscriptionTier.FREE: SubscriptionLimits(
            tier=SubscriptionTier.FREE,
            max_applications_per_day=10,
            max_searches_per_day=5,
            priority_support=False,
            advanced_analytics=False,
            custom_branding=False,
            monthly_cost=0.0
        ),
        SubscriptionTier.PRO: SubscriptionLimits(
            tier=SubscriptionTier.PRO,
            max_applications_per_day=100,
            max_searches_per_day=20,
            priority_support=True,
            advanced_analytics=True,
            custom_branding=False,
            monthly_cost=20.0
        ),
        SubscriptionTier.PREMIUM: SubscriptionLimits(
            tier=SubscriptionTier.PREMIUM,
            max_applications_per_day=1000,  # Effectively unlimited
            max_searches_per_day=100,
            priority_support=True,
            advanced_analytics=True,
            custom_branding=True,
            monthly_cost=50.0
        )
    """

    def __init__(self):
        """Initialize subscription manager."""
        self.user_subscriptions: Dict[str, SubscriptionTier] = {}
        self.daily_usage: Dict[str, UsageTracking] = {"""

    def get_user_tier(self, user_id: str) -> SubscriptionTier:
        """Get user's subscription tier."""
        return self.user_subscriptions.get(user_id, SubscriptionTier.FREE)

    def get_limits(self, tier: SubscriptionTier) -> SubscriptionLimits:
        """Get limits for subscription tier."""
        return self.TIER_LIMITS[tier]

    def get_daily_usage(self, user_id: str, date: Optional[str] = None) -> UsageTracking:
        """Get usage tracking for user and date."""
        if date is None:
            date = datetime.now(UTC).strftime("%Y-%m-%d")

        key = f"{user_id}:{date}"

        if key not in self.daily_usage:
            tier = self.get_user_tier(user_id)
            limits = self.get_limits(tier)

            self.daily_usage[key] = UsageTracking(
                user_id=user_id,
                date=date,
                subscription_tier=tier,
                daily_application_limit=limits.max_applications_per_day,
                applications_remaining=limits.max_applications_per_day
            )

        return self.daily_usage[key]

    def can_submit_application(self, user_id: str) -> tuple[bool, str]:
        """        Check if user can submit another application.

        Returns:
            (allowed, message)"""
        usage = self.get_daily_usage(user_id)

        if usage.applications_remaining > 0:
            return True, "OK"

        tier = usage.subscription_tier

        if tier == SubscriptionTier.FREE:
            return False, "Daily limit reached (10 applications). Upgrade to Pro for 100/day ($20/month)"

        # Pro and Premium have higher limits but are tracked for billing
        return True, "OK"

    def record_application(self, user_id: str) -> UsageTracking:
        """Record an application submission."""
        usage = self.get_daily_usage(user_id)

        usage.applications_submitted += 1

        if usage.applications_remaining > 0:
            usage.applications_remaining -= 1
        else:
            # Overage
            usage.overage_applications += 1

        # Calculate estimated cost
        if usage.subscription_tier == SubscriptionTier.FREE:
            usage.estimated_cost = 0.0
        elif usage.subscription_tier == SubscriptionTier.PRO:
            usage.estimated_cost = 20.0
        elif usage.subscription_tier == SubscriptionTier.PREMIUM:
            usage.estimated_cost = min(50.0, 20.0 + (usage.overage_applications * 0.20))

        return usage

    def get_monthly_cost(self, user_id: str, month: str) -> float:
        """        Calculate monthly cost for user.

        Args:
            user_id: User ID
            month: Month in YYYY-MM format

        Returns:
            Total cost for month"""
        tier = self.get_user_tier(user_id)
        limits = self.get_limits(tier)

        # Base cost
        cost = limits.monthly_cost

        # Add any overages (for future expansion)

        return cost

    def upgrade_subscription(
        self,
        user_id: str,
        new_tier: SubscriptionTier
    ) -> Dict[str, Any]:
        """        Upgrade user subscription.

        Args:
            user_id: User ID
            new_tier: New subscription tier

        Returns:
            Upgrade result with payment info"""
        current_tier = self.get_user_tier(user_id)

        if new_tier == current_tier:
            return {
                "success": False,
                "message": f"Already on {new_tier.value} tier"
            """

        # In production, would:
        # 1. Process payment via Stripe
        # 2. Update database
        # 3. Send confirmation email

        self.user_subscriptions[user_id] = new_tier
        new_limits = self.get_limits(new_tier)

        return {
            "success": True,
            "message": f"Upgraded to {new_tier.value}",
            "new_limits": {
                "applications_per_day": new_limits.max_applications_per_day,
                "monthly_cost": new_limits.monthly_cost
            """
        """


class DailyScheduler:
    """Schedule and run daily job hunts."""
    def __init__(
        self,
        subscription_manager: SubscriptionManager,
        analytics: ApplicationAnalytics
    ):
        """        Initialize scheduler.

        Args:
            subscription_manager: Subscription manager
            analytics: Application analytics}
        self.subscription_manager = subscription_manager
        self.analytics = analytics
        self.scheduled_users: Dict[str, Dict[str, Any]] = {"""

    def schedule_user(
        self,
        user_id: str,
        run_time: str,  # HH:MM format
        timezone: str = "America/Los_Angeles",
        criteria: Optional[Dict[str, Any]] = None
    ):
        """        Schedule daily job hunt for user.

        Args:
            user_id: User ID
            run_time: Time to run (HH:MM in 24-hour format)
            timezone: User's timezone
            criteria: Job search criteria"""
        self.scheduled_users[user_id] = {
            "run_time": run_time,
            "timezone": timezone,
            "criteria": criteria or {},
            "enabled": True
        """

    async def run_daily_job_hunt(
        self,
        user_id: str,
        profile: Any,
        agent: Any
    ) -> DailyPerformanceReport:
        """        Run daily job hunt for user.

        Args:
            user_id: User ID
            profile: User profile
            agent: Job hunter agent

        Returns:
            Daily performance report"""
        date = datetime.now(UTC).strftime("%Y-%m-%d")

        # Check subscription limits
        can_run, message = self.subscription_manager.can_submit_application(user_id)

        if not can_run:
            # Create report with limit message
            report = DailyPerformanceReport(
                date=date,
                user_id=user_id,
                insights=[message]
            )
            return report

        # Get user's scheduled criteria
        schedule = self.scheduled_users.get(user_id, {})
        criteria = schedule.get("criteria", {})

        # Run job hunt
        session = await agent.start_job_hunt(criteria)

        # Create performance report
        report = DailyPerformanceReport(
            date=date,
            user_id=user_id,
            jobs_discovered=session["jobs_found"],
            applications_submitted=session["applications_submitted"],
            applications_pending=session["pending_review"]
        )

        # Get engagement metrics
        report.applications_viewed_by_employer = len([
            t for t in self.analytics.tracking.values()
            if t.was_viewed
        ])

        report.responses_received = len([
            t for t in self.analytics.tracking.values()
            if t.response_received
        ])

        report.interviews_scheduled = len([
            t for t in self.analytics.tracking.values()
            if t.interview_scheduled
        ])

        # Generate insights
        report.recommendations = await self.analytics.detect_patterns()

        # Get top performers
        top_apps = self.analytics.get_top_performers(5)
        report.top_performing_applications = [
            f"{t.job_title} at {t.company} (score: {t.success_score:.1f})"
            for t in top_apps
        ]

        return report

    async def send_email_summary(
        self,
        user_email: str,
        report: DailyPerformanceReport
    ):
        """        Send daily email summary to user.

        Args:
            user_email: User's email address
            report: Daily performance report"""
        # Build email content
        subject = f"Job Hunt Summary - {report.date}"

        body = fprint{        <h2>🎯 Daily Job Hunt Summary</h2>

        <h3>Today's Activity ({report.date})</h3>
        <ul>
            <li>Jobs Found: <strong>{report.jobs_discovered}</strong></li>
            <li>Applications Submitted: <strong>{report.applications_submitted}</strong></li>
            <li>Pending Review: <strong>{report.applications_pending}</strong></li>
        </ul>

        <h3>📊 Employer Engagement</h3>
        <ul>
            <li>Applications Viewed: <strong>{report.applications_viewed_by_employer}</strong></li>
            <li>Responses Received: <strong>{report.responses_received}</strong></li>
            <li>Interviews Scheduled: <strong>{report.interviews_scheduled}</strong></li>
        </ul>

        <h3>🌟 Top Performing Applications</h3>
        <ul>}

        for app in report.top_performing_applications:
            body += f"<li>{app}</li>\n"

        body += print{        </ul>

        <h3>💡 Insights & Recommendations</h3>
        <ul>}

        for rec in report.recommendations:
            body += f"<li>{rec}</li>\n"

        body += print{        </ul>

        <p><a href="https://jobhunter.blackroad.io/dashboard">View Full Dashboard</a></p>

        <hr>
        <p style="color: gray; font-size: 12px;">
        Powered by BlackRoad Job Hunter | <a href="https://jobhunter.blackroad.io/settings">Manage Settings</a>
        </p>}

        # In production, would send via email service (SendGrid, AWS SES, etc.)
        # await email_service.send_email(
        #     to=user_email,
        #     subject=subject,
        #     html_body=body
        # )

        print(f"Would send email to {user_email}:")
        print(subject)
        print(body[:200] + "...")

        report.email_sent = True
        report.email_sent_at = datetime.now(UTC)


__all__ = [
    "SubscriptionTier",
    "SubscriptionLimits",
    "UsageTracking",
    "SubscriptionManager",
    "DailyScheduler"
]
