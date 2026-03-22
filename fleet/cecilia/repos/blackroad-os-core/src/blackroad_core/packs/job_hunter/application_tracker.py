"""Application Tracker with Retry Logic and Analytics
Tracks application attempts, retries, and generates insights"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from datetime import datetime, UTC, timedelta
from enum import Enum
import asyncio
import logging

logger = logging.getLogger(__name__)


class ApplicationAttemptStatus(Enum):
    """Status of application attempt."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUCCESS = "success"
    FAILED = "failed"
    RETRY_SCHEDULED = "retry_scheduled"
    ABANDONED = "abandoned"


class FailureReason(Enum):
    """Reasons for application failure."""
    CAPTCHA = "captcha"
    FORM_NOT_FOUND = "form_not_found"
    FIELD_MISSING = "field_missing"
    NETWORK_ERROR = "network_error"
    TIMEOUT = "timeout"
    VALIDATION_ERROR = "validation_error"
    PLATFORM_ERROR = "platform_error"
    ALREADY_APPLIED = "already_applied"
    JOB_CLOSED = "job_closed"
    UNKNOWN = "unknown"


@dataclass
class ApplicationAttempt:
    """Single application attempt record."""
    attempt_id: str
    application_id: str
    job_id: str
    user_id: str
    platform: str
    attempt_number: int
    status: ApplicationAttemptStatus
    started_at: str
    completed_at: Optional[str] = None
    duration_seconds: Optional[float] = None
    failure_reason: Optional[FailureReason] = None
    error_message: Optional[str] = None
    fields_filled: int = 0
    fields_failed: int = 0
    retry_after: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ApplicationStats:
    """Statistics for an application."""
    application_id: str
    total_attempts: int
    successful_attempts: int
    failed_attempts: int
    pending_attempts: int
    first_attempt_at: str
    last_attempt_at: str
    total_duration_seconds: float
    average_duration_seconds: float
    success_rate: float
    most_common_failure: Optional[FailureReason] = None


@dataclass
class PlatformStats:
    """Statistics for a platform."""
    platform: str
    total_applications: int
    successful_applications: int
    failed_applications: int
    success_rate: float
    average_duration_seconds: float
    common_failures: List[tuple[FailureReason, int]]
    best_time_to_apply: Optional[str] = None  # Hour of day


@dataclass
class RetryConfig:
    """Configuration for retry logic."""
    max_retries: int = 3
    initial_delay_seconds: float = 60.0
    backoff_multiplier: float = 2.0
    max_delay_seconds: float = 3600.0  # 1 hour
    retry_on_failures: List[FailureReason] = field(default_factory=lambda: [
        FailureReason.NETWORK_ERROR,
        FailureReason.TIMEOUT,
        FailureReason.PLATFORM_ERROR,
    ])
    do_not_retry_on: List[FailureReason] = field(default_factory=lambda: [
        FailureReason.ALREADY_APPLIED,
        FailureReason.JOB_CLOSED,
        FailureReason.CAPTCHA,
    ])


class ApplicationTracker:
    """    Tracks application attempts and manages retries.

    Features:
    - Exponential backoff retry logic
    - Application success/failure tracking
    - Platform performance analytics
    - Intelligent retry scheduling"""

    def __init__(self, retry_config: Optional[RetryConfig] = None):
        """        Initialize application tracker.

        Args:
            retry_config: Configuration for retry logic}
        self.retry_config = retry_config or RetryConfig()
        self.attempts: Dict[str, List[ApplicationAttempt]] = {}
        self.application_stats: Dict[str, ApplicationStats] = {}
        self.platform_stats: Dict[str, PlatformStats] = {"""

    def start_attempt(
        self,
        application_id: str,
        job_id: str,
        user_id: str,
        platform: str,
        attempt_number: int = 1
    ) -> ApplicationAttempt:
        """        Start tracking a new application attempt.

        Args:
            application_id: Application ID
            job_id: Job ID
            user_id: User ID
            platform: Platform name
            attempt_number: Attempt number (for retries)

        Returns:
            ApplicationAttempt object"""
        attempt_id = f"{application_id}-attempt-{attempt_number}"

        attempt = ApplicationAttempt(
            attempt_id=attempt_id,
            application_id=application_id,
            job_id=job_id,
            user_id=user_id,
            platform=platform,
            attempt_number=attempt_number,
            status=ApplicationAttemptStatus.IN_PROGRESS,
            started_at=datetime.now(UTC).isoformat()
        )

        if application_id not in self.attempts:
            self.attempts[application_id] = []

        self.attempts[application_id].append(attempt)

        logger.info(f"Started application attempt: {attempt_id}")
        return attempt

    def record_success(
        self,
        attempt: ApplicationAttempt,
        fields_filled: int = 0,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """        Record successful application.

        Args:
            attempt: Application attempt
            fields_filled: Number of fields successfully filled
            metadata: Additional metadata"""
        now = datetime.now(UTC)
        attempt.status = ApplicationAttemptStatus.SUCCESS
        attempt.completed_at = now.isoformat()

        started = datetime.fromisoformat(attempt.started_at.replace('Z', '+00:00'))
        attempt.duration_seconds = (now - started).total_seconds()
        attempt.fields_filled = fields_filled

        if metadata:
            attempt.metadata.update(metadata)

        self._update_stats(attempt)

        logger.info(
            f"Application {attempt.application_id} succeeded "
            f"(attempt {attempt.attempt_number}, {attempt.duration_seconds:.1f}s)"
        )

    def record_failure(
        self,
        attempt: ApplicationAttempt,
        failure_reason: FailureReason,
        error_message: str,
        fields_filled: int = 0,
        fields_failed: int = 0,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[ApplicationAttempt]:
        """        Record failed application and schedule retry if applicable.

        Args:
            attempt: Application attempt
            failure_reason: Reason for failure
            error_message: Error message
            fields_filled: Number of fields filled before failure
            fields_failed: Number of fields that failed
            metadata: Additional metadata

        Returns:
            New ApplicationAttempt if retry is scheduled, None otherwise"""
        now = datetime.now(UTC)
        attempt.status = ApplicationAttemptStatus.FAILED
        attempt.completed_at = now.isoformat()

        started = datetime.fromisoformat(attempt.started_at.replace('Z', '+00:00'))
        attempt.duration_seconds = (now - started).total_seconds()
        attempt.failure_reason = failure_reason
        attempt.error_message = error_message
        attempt.fields_filled = fields_filled
        attempt.fields_failed = fields_failed

        if metadata:
            attempt.metadata.update(metadata)

        self._update_stats(attempt)

        # Check if we should retry
        should_retry = self._should_retry(attempt)

        if should_retry:
            retry_attempt = self._schedule_retry(attempt)
            logger.info(
                f"Application {attempt.application_id} failed "
                f"(attempt {attempt.attempt_number}, retry scheduled)"
            )
            return retry_attempt
        else:
            attempt.status = ApplicationAttemptStatus.ABANDONED
            logger.warning(
                f"Application {attempt.application_id} failed "
                f"(attempt {attempt.attempt_number}, no retry)"
            )
            return None

    def _should_retry(self, attempt: ApplicationAttempt) -> bool:
        """Determine if application should be retried."""
        # Check if we've exceeded max retries
        if attempt.attempt_number >= self.retry_config.max_retries:
            logger.debug(f"Max retries ({self.retry_config.max_retries}) exceeded")
            return False

        # Check if failure reason is in do-not-retry list
        if attempt.failure_reason in self.retry_config.do_not_retry_on:
            logger.debug(f"Failure reason {attempt.failure_reason} in do-not-retry list")
            return False

        # Check if failure reason is in retry list
        if attempt.failure_reason in self.retry_config.retry_on_failures:
            return True

        # Default: don't retry unknown failures
        return False

    def _schedule_retry(self, failed_attempt: ApplicationAttempt) -> ApplicationAttempt:
        """        Schedule a retry for failed application.

        Args:
            failed_attempt: The failed attempt

        Returns:
            New ApplicationAttempt scheduled for retry"""
        # Calculate retry delay with exponential backoff
        delay = min(
            self.retry_config.initial_delay_seconds * (
                self.retry_config.backoff_multiplier ** (failed_attempt.attempt_number - 1)
            ),
            self.retry_config.max_delay_seconds
        )

        retry_after = datetime.now(UTC) + timedelta(seconds=delay)
        failed_attempt.retry_after = retry_after.isoformat()
        failed_attempt.status = ApplicationAttemptStatus.RETRY_SCHEDULED

        # Create new attempt
        new_attempt = ApplicationAttempt(
            attempt_id=f"{failed_attempt.application_id}-attempt-{failed_attempt.attempt_number + 1}",
            application_id=failed_attempt.application_id,
            job_id=failed_attempt.job_id,
            user_id=failed_attempt.user_id,
            platform=failed_attempt.platform,
            attempt_number=failed_attempt.attempt_number + 1,
            status=ApplicationAttemptStatus.PENDING,
            started_at=retry_after.isoformat(),
            metadata={"retrying_from": failed_attempt.attempt_id}
        )

        self.attempts[failed_attempt.application_id].append(new_attempt)

        logger.info(
            f"Scheduled retry for {failed_attempt.application_id} "
            f"in {delay:.0f}s (attempt {new_attempt.attempt_number})"
        )

        return new_attempt

    def get_pending_retries(self) -> List[ApplicationAttempt]:
        """        Get list of retries ready to be executed.

        Returns:
            List of ApplicationAttempt objects ready for retry"""
        now = datetime.now(UTC)
        ready_retries = []

        for attempts_list in self.attempts.values():
            for attempt in attempts_list:
                if attempt.status == ApplicationAttemptStatus.PENDING:
                    scheduled_time = datetime.fromisoformat(
                        attempt.started_at.replace('Z', '+00:00')
                    )
                    if scheduled_time <= now:
                        ready_retries.append(attempt)

        return ready_retries

    def _update_stats(self, attempt: ApplicationAttempt):
        """Update statistics after attempt completion."""
        # Update application stats
        app_id = attempt.application_id

        attempts_list = self.attempts[app_id]
        completed_attempts = [
            a for a in attempts_list
            if a.status in [ApplicationAttemptStatus.SUCCESS, ApplicationAttemptStatus.FAILED]
        ]

        if not completed_attempts:
            return

        successful = [a for a in completed_attempts if a.status == ApplicationAttemptStatus.SUCCESS]
        failed = [a for a in completed_attempts if a.status == ApplicationAttemptStatus.FAILED]
        pending = [a for a in attempts_list if a.status == ApplicationAttemptStatus.PENDING]

        durations = [a.duration_seconds for a in completed_attempts if a.duration_seconds]
        total_duration = sum(durations)
        avg_duration = total_duration / len(durations) if durations else 0

        # Find most common failure
        failure_reasons = [a.failure_reason for a in failed if a.failure_reason]
        most_common_failure = max(
            set(failure_reasons), key=failure_reasons.count
        ) if failure_reasons else None

        self.application_stats[app_id] = ApplicationStats(
            application_id=app_id,
            total_attempts=len(completed_attempts),
            successful_attempts=len(successful),
            failed_attempts=len(failed),
            pending_attempts=len(pending),
            first_attempt_at=attempts_list[0].started_at,
            last_attempt_at=completed_attempts[-1].completed_at or completed_attempts[-1].started_at,
            total_duration_seconds=total_duration,
            average_duration_seconds=avg_duration,
            success_rate=len(successful) / len(completed_attempts) if completed_attempts else 0,
            most_common_failure=most_common_failure
        )

        # Update platform stats
        self._update_platform_stats(attempt.platform)

    def _update_platform_stats(self, platform: str):
        """Update platform statistics."""
        platform_attempts = []
        for attempts_list in self.attempts.values():
            platform_attempts.extend([a for a in attempts_list if a.platform == platform])

        completed = [
            a for a in platform_attempts
            if a.status in [ApplicationAttemptStatus.SUCCESS, ApplicationAttemptStatus.FAILED]
        ]

        if not completed:
            return

        successful = [a for a in completed if a.status == ApplicationAttemptStatus.SUCCESS]
        failed = [a for a in completed if a.status == ApplicationAttemptStatus.FAILED]

        durations = [a.duration_seconds for a in completed if a.duration_seconds]
        avg_duration = sum(durations) / len(durations) if durations else 0

        # Find common failures
        failure_reasons = [a.failure_reason for a in failed if a.failure_reason]
        failure_counts = {"""
        for reason in failure_reasons:
            failure_counts[reason] = failure_counts.get(reason, 0) + 1

        common_failures = sorted(
            failure_counts.items(), key=lambda x: x[1], reverse=True
        )

        # Analyze best time to apply (by hour)
        success_hours = [
            datetime.fromisoformat(a.started_at.replace('Z', '+00:00')).hour
            for a in successful
        ]
        best_hour = max(set(success_hours), key=success_hours.count) if success_hours else None

        self.platform_stats[platform] = PlatformStats(
            platform=platform,
            total_applications=len(set(a.application_id for a in completed)),
            successful_applications=len(set(a.application_id for a in successful)),
            failed_applications=len(set(a.application_id for a in failed)),
            success_rate=len(successful) / len(completed) if completed else 0,
            average_duration_seconds=avg_duration,
            common_failures=common_failures,
            best_time_to_apply=f"{best_hour}:00" if best_hour is not None else None
        )

    def get_application_stats(self, application_id: str) -> Optional[ApplicationStats]:
        """Get statistics for an application."""
        return self.application_stats.get(application_id)

    def get_platform_stats(self, platform: str) -> Optional[PlatformStats]:
        """Get statistics for a platform."""
        return self.platform_stats.get(platform)

    def get_all_platform_stats(self) -> List[PlatformStats]:
        """Get statistics for all platforms."""
        return list(self.platform_stats.values())

    def get_insights(self) -> Dict[str, Any]:
        """        Generate insights from tracked applications.

        Returns:
            Dictionary with various insights and recommendations"""
        insights = {
            "total_applications": len(self.attempts),
            "total_attempts": sum(len(attempts) for attempts in self.attempts.values()),
            "platforms": {},
            "recommendations": []
        """

        # Platform insights
        for platform, stats in self.platform_stats.items():
            insights["platforms"][platform] = {
                "success_rate": f"{stats.success_rate * 100:.1f}%",
                "average_duration": f"{stats.average_duration_seconds:.1f}s",
                "total_applications": stats.total_applications,
                "best_time": stats.best_time_to_apply,
                "common_failures": [
                    f"{reason.value}: {count}" for reason, count in stats.common_failures[:3]
                ]
            """

        # Generate recommendations
        if self.platform_stats:
            # Best platform
            best_platform = max(
                self.platform_stats.values(),
                key=lambda s: s.success_rate
            )
            insights["recommendations"].append(
                f"Best success rate on {best_platform.platform} ({best_platform.success_rate * 100:.1f}%)"
            )

            # Common issues
            all_failures = {}
            for stats in self.platform_stats.values():
                for reason, count in stats.common_failures:
                    all_failures[reason] = all_failures.get(reason, 0) + count

            if all_failures:
                top_failure = max(all_failures.items(), key=lambda x: x[1])
                insights["recommendations"].append(
                    f"Most common failure: {top_failure[0].value} ({top_failure[1]} times)"
                )

        return insights


__all__ = [
    "ApplicationTracker",
    "ApplicationAttempt",
    "ApplicationAttemptStatus",
    "FailureReason",
    "RetryConfig",
    "ApplicationStats",
    "PlatformStats"
]
