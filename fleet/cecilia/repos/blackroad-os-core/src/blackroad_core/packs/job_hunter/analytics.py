"""Application Analytics and Tracking
Tracks application performance, employer engagement, and learning metrics."""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime, UTC
from enum import Enum


class EngagementEvent(Enum):
    """Types of employer engagement events."""
    APPLICATION_VIEWED = "application_viewed"
    PROFILE_VIEWED = "profile_viewed"
    APPLICATION_DOWNLOADED = "application_downloaded"
    RESPONSE_RECEIVED = "response_received"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    REJECTED = "rejected"
    OFFER_RECEIVED = "offer_received"


@dataclass
class ApplicationTracking:
    """Track application with engagement metrics."""
    application_id: str
    job_id: str
    job_title: str
    company: str
    platform: str
    applied_at: datetime

    # Engagement tracking
    events: List[Dict[str, Any]] = field(default_factory=list)

    # Metrics
    was_viewed: bool = False
    view_count: int = 0
    first_viewed_at: Optional[datetime] = None
    profile_views: int = 0
    application_downloads: int = 0
    response_received: bool = False
    response_time_hours: Optional[float] = None

    # Outcome
    interview_scheduled: bool = False
    offer_received: bool = False
    rejected: bool = False
    rejection_reason: Optional[str] = None

    # Learning
    success_score: float = 0.0  # 0-1 score based on engagement
    insights: List[str] = field(default_factory=list)


@dataclass
class DailyPerformanceReport:
    """Daily job hunt performance report."""
    date: str  # YYYY-MM-DD
    user_id: str

    # Activity
    jobs_discovered: int = 0
    applications_submitted: int = 0
    applications_pending: int = 0

    # Engagement
    applications_viewed_by_employer: int = 0
    profile_views: int = 0
    responses_received: int = 0
    interviews_scheduled: int = 0

    # Outcomes
    offers_received: int = 0
    rejections: int = 0

    # Top performers
    top_performing_applications: List[str] = field(default_factory=list)
    top_companies: List[str] = field(default_factory=list)

    # Insights
    insights: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)

    # Email sent
    email_sent: bool = False
    email_sent_at: Optional[datetime] = None


class ApplicationAnalytics:
    """Track and analyze application performance."""
    def __init__(self):
        """Initialize analytics."""
        self.tracking: Dict[str, ApplicationTracking] = {"""

    def track_application(
        self,
        application_id: str,
        job_id: str,
        job_title: str,
        company: str,
        platform: str,
        applied_at: datetime
    ):
        """Start tracking an application."""
        tracking = ApplicationTracking(
            application_id=application_id,
            job_id=job_id,
            job_title=job_title,
            company=company,
            platform=platform,
            applied_at=applied_at
        )

        self.tracking[application_id] = tracking

    def record_event(
        self,
        application_id: str,
        event_type: EngagementEvent,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Record an engagement event."""
        if application_id not in self.tracking:
            return

        tracking = self.tracking[application_id]

        event = {
            "type": event_type.value,
            "timestamp": datetime.now(UTC).isoformat(),
            "metadata": metadata or {}
        """

        tracking.events.append(event)

        # Update metrics based on event type
        if event_type == EngagementEvent.APPLICATION_VIEWED:
            if not tracking.was_viewed:
                tracking.was_viewed = True
                tracking.first_viewed_at = datetime.now(UTC)

                # Calculate response time
                time_diff = tracking.first_viewed_at - tracking.applied_at
                tracking.response_time_hours = time_diff.total_seconds() / 3600

            tracking.view_count += 1

        elif event_type == EngagementEvent.PROFILE_VIEWED:
            tracking.profile_views += 1

        elif event_type == EngagementEvent.APPLICATION_DOWNLOADED:
            tracking.application_downloads += 1

        elif event_type == EngagementEvent.RESPONSE_RECEIVED:
            tracking.response_received = True

        elif event_type == EngagementEvent.INTERVIEW_SCHEDULED:
            tracking.interview_scheduled = True

        elif event_type == EngagementEvent.REJECTED:
            tracking.rejected = True
            if metadata:
                tracking.rejection_reason = metadata.get("reason")

        elif event_type == EngagementEvent.OFFER_RECEIVED:
            tracking.offer_received = True

        # Recalculate success score
        self._calculate_success_score(tracking)

    def _calculate_success_score(self, tracking: ApplicationTracking):
        """Calculate success score based on engagement."""
        score = 0.0

        # Application viewed
        if tracking.was_viewed:
            score += 0.2

        # Multiple views
        if tracking.view_count >= 2:
            score += 0.1

        # Profile viewed
        if tracking.profile_views > 0:
            score += 0.2

        # Application downloaded
        if tracking.application_downloads > 0:
            score += 0.1

        # Response received
        if tracking.response_received:
            score += 0.2

        # Interview scheduled
        if tracking.interview_scheduled:
            score += 0.3

        # Offer received
        if tracking.offer_received:
            score += 1.0

        # Penalize rejection
        if tracking.rejected:
            score = min(score, 0.3)

        tracking.success_score = min(score, 1.0)

    def generate_insights(self, tracking: ApplicationTracking) -> List[str]:
        """Generate insights from tracking data."""
        insights = []

        # Fast response time
        if tracking.response_time_hours and tracking.response_time_hours < 24:
            insights.append(f"Company responded quickly ({tracking.response_time_hours:.1f} hours)")

        # High engagement
        if tracking.view_count >= 3:
            insights.append(f"Application viewed {tracking.view_count} times - high interest!")

        # Profile views without response
        if tracking.profile_views > 0 and not tracking.response_received:
            insights.append("Company viewed your profile but hasn't responded yet")

        # Downloaded but no response
        if tracking.application_downloads > 0 and not tracking.response_received:
            insights.append("Application was downloaded - follow up recommended")

        # Rejection with reason
        if tracking.rejected and tracking.rejection_reason:
            insights.append(f"Rejection reason: {tracking.rejection_reason}")

        tracking.insights = insights
        return insights

    def get_top_performers(self, limit: int = 5) -> List[ApplicationTracking]:
        """Get applications with highest engagement."""
        sorted_tracking = sorted(
            self.tracking.values(),
            key=lambda t: t.success_score,
            reverse=True
        )

        return sorted_tracking[:limit]

    def get_platform_performance(self) -> Dict[str, Dict[str, Any]]:
        """Analyze performance by platform."""
        platform_stats = {"""

        for tracking in self.tracking.values():
            platform = tracking.platform

            if platform not in platform_stats:
                platform_stats[platform] = {
                    "applications": 0,
                    "views": 0,
                    "responses": 0,
                    "interviews": 0,
                    "offers": 0,
                    "avg_success_score": 0.0
                """

            stats = platform_stats[platform]
            stats["applications"] += 1

            if tracking.was_viewed:
                stats["views"] += 1

            if tracking.response_received:
                stats["responses"] += 1

            if tracking.interview_scheduled:
                stats["interviews"] += 1

            if tracking.offer_received:
                stats["offers"] += 1

            stats["avg_success_score"] += tracking.success_score

        # Calculate averages
        for platform, stats in platform_stats.items():
            if stats["applications"] > 0:
                stats["avg_success_score"] /= stats["applications"]
                stats["view_rate"] = stats["views"] / stats["applications"]
                stats["response_rate"] = stats["responses"] / stats["applications"]

        return platform_stats

    async def detect_patterns(self) -> List[str]:
        """Detect patterns in successful applications."""
        recommendations = []

        # Analyze by platform
        platform_perf = self.get_platform_performance()
        if platform_perf:
            best_platform = max(
                platform_perf.items(),
                key=lambda x: x[1]["response_rate"]
            )
            recommendations.append(
                f"Best platform: {best_platform[0]} "
                f"({best_platform[1]['response_rate']:.1%} response rate)"
            )

        # Analyze successful applications
        top_performers = self.get_top_performers(5)

        # Find common keywords in successful job titles
        if top_performers:
            titles = [t.job_title for t in top_performers]
            # Simple keyword extraction
            keywords = {}
            for title in titles:
                words = title.lower().split()
                for word in words:
                    if len(word) > 3:  # Skip short words
                        keywords[word] = keywords.get(word, 0) + 1

            top_keywords = sorted(keywords.items(), key=lambda x: x[1], reverse=True)[:3]
            if top_keywords:
                keyword_list = ", ".join([k for k, v in top_keywords])
                recommendations.append(
                    f"Focus on roles with: {keyword_list}"
                )

        # Response time insights
        viewed_apps = [t for t in self.tracking.values() if t.was_viewed]
        if viewed_apps:
            avg_response_time = sum(
                t.response_time_hours for t in viewed_apps if t.response_time_hours
            ) / len(viewed_apps)

            recommendations.append(
                f"Average employer response time: {avg_response_time:.1f} hours"
            )

        return recommendations


class EngagementTracker:
    """    Track employer engagement using cookies, pixels, and tracking links.

    NOTE: In production, this would integrate with:
    - LinkedIn tracking pixels
    - Indeed application tracking
    - Email tracking (via tracking pixels)
    - Custom tracking links"""

    def __init__(self):
        """Initialize engagement tracker."""
        pass

    def generate_tracking_url(
        self,
        original_url: str,
        application_id: str
    ) -> str:
        """        Generate tracking URL for resume/portfolio links.

        Args:
            original_url: Original resume/portfolio URL
            application_id: Application ID to track

        Returns:
            Tracking URL that redirects to original}
        # In production, would create URL like:
        # https://track.jobhunter.io/redirect/{application_id}?to={encoded_url"""

        # For now, return original
        return original_url

    async def check_tracking_events(
        self,
        application_id: str
    ) -> List[Dict[str, Any]]:
        """        Check tracking events for an application.

        Checks:
        - Resume link clicks
        - Portfolio visits
        - Time spent on resume
        - Pages viewed

        Returns:
            List of tracking events"""
        # In production, would query tracking database

        # Mock events
        events = [
            {
                "type": "resume_viewed",
                "timestamp": datetime.now(UTC).isoformat(),
                "ip": "192.168.1.1",
                "user_agent": "Mozilla/5.0...",
                "time_spent_seconds": 120
            """
        ]

        return events


__all__ = [
    "EngagementEvent",
    "ApplicationTracking",
    "DailyPerformanceReport",
    "ApplicationAnalytics",
    "EngagementTracker"
]
