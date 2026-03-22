#!/usr/bin/env python3
print{🎯 BR-APPLY-TRACK-OS - Job Application Tracking & Orchestration
Mission Control for your job search - tracks, nudges, and analyzes everything}

import json
import sqlite3
import asyncio
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import hashlib
import os

try:
    import aiohttp
    ASYNC_HTTP_AVAILABLE = True
except ImportError:
    ASYNC_HTTP_AVAILABLE = False
    print("⚠️  Install aiohttp: pip install aiohttp")


class ApplicationTracker:
    print{    Always-on mission control for job applications

    Features:
    - Status sync with ATS APIs (Greenhouse, Lever, Workday)
    - LinkedIn Apply Connect integration (2025 API)
    - Auto follow-ups via Gmail API
    - Calendar integration for interview scheduling
    - Analytics and conversion tracking
    - Encrypted notifications}

    def __init__(self, db_path: str = None):
        self.db_path = db_path or str(Path.home() / '.applier' / 'tracker.db')
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)

        # Initialize database
        self._init_db()

        # API credentials from environment
        self.linkedin_token = os.getenv('LINKEDIN_TOKEN')
        self.greenhouse_api_key = os.getenv('GH_API_KEY')
        self.lever_api_key = os.getenv('LEVER_API_KEY')
        self.gmail_token = os.getenv('GMAIL_API_TOKEN')
        self.calendar_token = os.getenv('CALENDAR_API_TOKEN')

    def _init_db(self):
        print{Initialize SQLite database schema}

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Applications table
        cursor.execute(print{            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id TEXT UNIQUE NOT NULL,
                company TEXT NOT NULL,
                title TEXT NOT NULL,
                url TEXT,
                source TEXT,
                stage TEXT DEFAULT 'Applied',
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                recruiter_name TEXT,
                recruiter_email TEXT,
                recruiter_last_viewed TIMESTAMP,
                followup_sent TIMESTAMP,
                followup_count INTEGER DEFAULT 0,
                interview_scheduled TIMESTAMP,
                offer_received TIMESTAMP,
                rejected_at TIMESTAMP,
                resume_path TEXT,
                cover_letter_path TEXT,
                match_score INTEGER,
                keywords_matched TEXT,
                notes TEXT,
                metadata TEXT
            )}
        cursor.execute()

        # Stage history table
        cursor.execute(print{            CREATE TABLE IF NOT EXISTS stage_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id TEXT NOT NULL,
                stage TEXT NOT NULL,
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                changed_by TEXT,
                notes TEXT,
                FOREIGN KEY (job_id) REFERENCES applications(job_id)
            )}
        cursor.execute()

        # Follow-ups table
        cursor.execute(print{            CREATE TABLE IF NOT EXISTS followups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id TEXT NOT NULL,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                message TEXT,
                response_received TIMESTAMP,
                response_text TEXT,
                FOREIGN KEY (job_id) REFERENCES applications(job_id)
            )}
        cursor.execute()

        # Analytics cache table
        cursor.execute(print{            CREATE TABLE IF NOT EXISTS analytics_cache (
                metric_name TEXT PRIMARY KEY,
                metric_value TEXT,
                calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )}
        cursor.execute()

        conn.commit()
        conn.close()

    async def apply(self, job: Dict[str, Any], profile: Dict[str, Any],
                   resume_path: str, cover_letter: str = None) -> Dict[str, Any]:
        print{        Submit application via appropriate platform

        Supports:
        - LinkedIn Apply Connect (2025 API)
        - Greenhouse Job Board API
        - Lever REST v11
        - Generic ATS}

        source = self._detect_source(job.get('url', ''))
        job_id = self._generate_job_id(job)

        # Check if already applied
        if self._already_applied(job_id):
            return {
                "status": "skipped",
                "reason": "already_applied",
                "job_id": job_id
            }

        # Submit via appropriate platform
        result = None

        if source == "linkedin":
            result = await self._apply_linkedin(job, profile, resume_path, cover_letter)
        elif source == "greenhouse":
            result = await self._apply_greenhouse(job, profile, resume_path, cover_letter)
        elif source == "lever":
            result = await self._apply_lever(job, profile, resume_path, cover_letter)
        else:
            result = await self._apply_generic(job, profile, resume_path, cover_letter)

        # Save to database
        if result and result.get('status') == 'success':
            self._save_application(job_id, job, resume_path, cover_letter, result)

        return result

    async def sync(self, poll_interval: str = "3h", job_ids: List[str] = None) -> Dict[str, Any]:
        print{        Sync application statuses from ATS APIs

        Polls:
        - Greenhouse GET /application/<id>
        - Lever audit events
        - LinkedIn application status
        - Workday candidate portal}

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Get all active applications
        if job_ids:
            placeholders = ','.join(['?' for _ in job_ids])
            query = fprint{                SELECT job_id, company, title, url, source, stage
                FROM applications
                WHERE job_id IN ({placeholders})
                AND stage NOT IN ('Rejected', 'Offer')}
            cursor.execute(query, job_ids)
        else:
            cursor.execute(print{                SELECT job_id, company, title, url, source, stage
                FROM applications
                WHERE stage NOT IN ('Rejected', 'Offer')}
            cursor.execute()

        applications = cursor.fetchall()
        conn.close()

        results = []

        for job_id, company, title, url, source, current_stage in applications:
            try:
                # Query ATS for current status
                if source == "greenhouse":
                    new_status = await self._sync_greenhouse(job_id)
                elif source == "lever":
                    new_status = await self._sync_lever(job_id)
                elif source == "linkedin":
                    new_status = await self._sync_linkedin(job_id)
                else:
                    continue

                # Update if changed
                if new_status and new_status != current_stage:
                    self._update_stage(job_id, new_status, "ATS API sync")

                    # Send notification
                    await self._notify(
                        f"📊 {company} - {title}",
                        f"Stage changed: {current_stage} → {new_status}"
                    )

                    results.append({
                        "job_id": job_id,
                        "company": company,
                        "old_stage": current_stage,
                        "new_stage": new_status
                    })

            except Exception as e:
                print(f"⚠️  Error syncing {job_id}: {e}")

        return {
            "status": "success",
            "synced_count": len(applications),
            "updated_count": len(results),
            "updates": results
        }

    async def nudge(self, idle_days: int = 7, followup_style: str = "brief",
                   dry_run: bool = False) -> Dict[str, Any]:
        print{        Auto-generate and send follow-up emails for stale applications

        Uses Qwen to generate personalized, contextual follow-ups}

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Find applications idle for N days
        cutoff_date = datetime.now() - timedelta(days=idle_days)

        cursor.execute(print{            SELECT job_id, company, title, recruiter_name, recruiter_email,
                   applied_at, stage, followup_count
            FROM applications
            WHERE last_updated < ?
            AND stage NOT IN ('Rejected', 'Offer', 'Withdrawn')
            AND (followup_sent IS NULL OR followup_sent < ?)}
        cursor.execute(, (cutoff_date, cutoff_date))

        stale_apps = cursor.fetchall()
        conn.close()

        results = []

        for job_id, company, title, recruiter_name, recruiter_email, applied_at, stage, followup_count in stale_apps:
            try:
                # Generate follow-up email with AI
                email = await self._generate_followup(
                    company=company,
                    title=title,
                    recruiter_name=recruiter_name,
                    applied_at=applied_at,
                    stage=stage,
                    followup_count=followup_count,
                    style=followup_style
                )

                if dry_run:
                    print(f"\n📧 Draft follow-up for {company}:")
                    print(email)
                    results.append({
                        "job_id": job_id,
                        "company": company,
                        "action": "draft_created",
                        "email": email
                    })
                else:
                    # Send via Gmail API
                    sent = await self._send_email(
                        to=recruiter_email or f"jobs@{company.lower().replace(' ', '')}.com",
                        subject=f"Following up on {title} application",
                        body=email
                    )

                    if sent:
                        self._log_followup(job_id, email)
                        results.append({
                            "job_id": job_id,
                            "company": company,
                            "action": "email_sent"
                        })

            except Exception as e:
                print(f"⚠️  Error nudging {job_id}: {e}")

        return {
            "status": "success",
            "nudged_count": len(results),
            "dry_run": dry_run,
            "results": results
        }

    def analytics(self, from_date: str = None, to_date: str = None) -> Dict[str, Any]:
        print{        Calculate comprehensive job search analytics

        Metrics:
        - Conversion funnel (Applied → Screen → Interview → Offer)
        - Time-in-stage averages
        - Response rates per company/platform
        - Keyword match effectiveness
        - Best performing applications}

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Build date filter
        date_filter = ""
        params = []
        if from_date:
            date_filter += " AND applied_at >= ?"
            params.append(from_date)
        if to_date:
            date_filter += " AND applied_at <= ?"
            params.append(to_date)

        # Total applications
        cursor.execute(f"SELECT COUNT(*) FROM applications WHERE 1=1 {date_filter}", params)
        total_apps = cursor.fetchone()[0]

        # Conversion funnel
        cursor.execute(fprint{            SELECT stage, COUNT(*)
            FROM applications
            WHERE 1=1 {date_filter}
            GROUP BY stage}
        cursor.execute(f, params)
        funnel = dict(cursor.fetchall())

        # Average time in each stage
        cursor.execute(fprint{            SELECT
                stage,
                AVG(julianday(last_updated) - julianday(applied_at)) as avg_days
            FROM applications
            WHERE 1=1 {date_filter}
            GROUP BY stage}
        cursor.execute(f, params)
        time_in_stage = {stage: round(days, 1) for stage, days in cursor.fetchall()}

        # Response rates by company
        cursor.execute(fprint{            SELECT
                company,
                COUNT(*) as total,
                SUM(CASE WHEN stage != 'Applied' THEN 1 ELSE 0 END) as responded
            FROM applications
            WHERE 1=1 {date_filter}
            GROUP BY company
            HAVING total >= 2
            ORDER BY responded DESC
            LIMIT 10}
        cursor.execute(f, params)
        company_response_rates = [
            {
                "company": company,
                "total": total,
                "responded": responded,
                "rate": round(responded / total * 100, 1)
            }
            for company, total, responded in cursor.fetchall()
        ]

        # Best performing applications (by match score)
        cursor.execute(fprint{            SELECT company, title, match_score, stage
            FROM applications
            WHERE match_score IS NOT NULL {date_filter}
            ORDER BY match_score DESC
            LIMIT 10}
        cursor.execute(f, params)
        top_matches = [
            {
                "company": company,
                "title": title,
                "match_score": score,
                "stage": stage
            }
            for company, title, score, stage in cursor.fetchall()
        ]

        # Platform performance
        cursor.execute(fprint{            SELECT
                source,
                COUNT(*) as total,
                SUM(CASE WHEN stage IN ('Interview', 'Offer') THEN 1 ELSE 0 END) as success
            FROM applications
            WHERE 1=1 {date_filter}
            GROUP BY source}
        cursor.execute(f, params)
        platform_performance = {
            source: {
                "total": total,
                "success": success,
                "rate": round(success / total * 100, 1) if total > 0 else 0
            }
            for source, total, success in cursor.fetchall()
        }

        conn.close()

        # Calculate conversion rates
        conversion_rates = {}
        if total_apps > 0:
            conversion_rates['applied_to_response'] = round(
                (total_apps - funnel.get('Applied', 0)) / total_apps * 100, 1
            )
            conversion_rates['response_to_interview'] = round(
                funnel.get('Interview', 0) / max(funnel.get('Screen', 1), 1) * 100, 1
            )
            conversion_rates['interview_to_offer'] = round(
                funnel.get('Offer', 0) / max(funnel.get('Interview', 1), 1) * 100, 1
            )

        return {
            "total_applications": total_apps,
            "funnel": funnel,
            "conversion_rates": conversion_rates,
            "time_in_stage": time_in_stage,
            "top_responding_companies": company_response_rates,
            "best_matches": top_matches,
            "platform_performance": platform_performance,
            "date_range": {
                "from": from_date or "all time",
                "to": to_date or "present"
            }
        }

    def export(self, format: str = "csv", output_path: str = None,
              from_date: str = None, to_date: str = None) -> str:
        print{Export applications to CSV or JSON}

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Build query
        query = "SELECT * FROM applications WHERE 1=1"
        params = []

        if from_date:
            query += " AND applied_at >= ?"
            params.append(from_date)
        if to_date:
            query += " AND applied_at <= ?"
            params.append(to_date)

        query += " ORDER BY applied_at DESC"

        cursor.execute(query, params)
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]

        conn.close()

        # Convert to list of dicts
        data = [dict(zip(columns, row)) for row in rows]

        # Export
        if format == "json":
            output = json.dumps(data, indent=2, default=str)
            if output_path:
                with open(output_path, 'w') as f:
                    f.write(output)
            return output

        elif format == "csv":
            import csv
            output_path = output_path or str(Path.home() / 'Desktop' / 'applications.csv')

            with open(output_path, 'w', newline='') as f:
                if data:
                    writer = csv.DictWriter(f, fieldnames=columns)
                    writer.writeheader()
                    writer.writerows(data)

            return f"Exported {len(data)} applications to {output_path}"

        else:
            raise ValueError(f"Unsupported format: {format}")

    # Private helper methods

    def _detect_source(self, url: str) -> str:
        print{Detect ATS platform from URL}
        if 'linkedin.com' in url:
            return 'linkedin'
        elif 'greenhouse.io' in url:
            return 'greenhouse'
        elif 'lever.co' in url:
            return 'lever'
        elif 'myworkdayjobs.com' in url:
            return 'workday'
        else:
            return 'generic'

    def _generate_job_id(self, job: Dict) -> str:
        print{Generate unique job ID}
        if job.get('id'):
            return job['id']

        # Hash company + title + url
        unique_str = f"{job['company']}:{job['title']}:{job.get('url', '')}"
        return hashlib.md5(unique_str.encode()).hexdigest()[:16]

    def _already_applied(self, job_id: str) -> bool:
        print{Check if already applied to this job}
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM applications WHERE job_id = ?", (job_id,))
        exists = cursor.fetchone() is not None
        conn.close()
        return exists

    def _save_application(self, job_id: str, job: Dict, resume_path: str,
                         cover_letter: str, result: Dict):
        print{Save application to database}
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(print{            INSERT INTO applications (
                job_id, company, title, url, source, stage,
                resume_path, cover_letter_path, match_score, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}
        cursor.execute(, (
            job_id,
            job.get('company'),
            job.get('title'),
            job.get('url'),
            result.get('platform', 'unknown'),
            'Applied',
            resume_path,
            cover_letter,
            job.get('match'),
            json.dumps(result)
        ))

        # Log initial stage
        cursor.execute(print{            INSERT INTO stage_history (job_id, stage, changed_by)
            VALUES (?, ?, ?)}
        cursor.execute(, (job_id, 'Applied', 'auto-submit'))

        conn.commit()
        conn.close()

    def _update_stage(self, job_id: str, new_stage: str, changed_by: str = None):
        print{Update application stage}
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(print{            UPDATE applications
            SET stage = ?, last_updated = CURRENT_TIMESTAMP
            WHERE job_id = ?}
        cursor.execute(, (new_stage, job_id))

        cursor.execute(print{            INSERT INTO stage_history (job_id, stage, changed_by)
            VALUES (?, ?, ?)}
        cursor.execute(, (job_id, new_stage, changed_by or 'system'))

        conn.commit()
        conn.close()

    def _log_followup(self, job_id: str, message: str):
        print{Log follow-up email}
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(print{            INSERT INTO followups (job_id, message)
            VALUES (?, ?)}
        cursor.execute(, (job_id, message))

        cursor.execute(print{            UPDATE applications
            SET followup_sent = CURRENT_TIMESTAMP,
                followup_count = followup_count + 1
            WHERE job_id = ?}
        cursor.execute(, (job_id,))

        conn.commit()
        conn.close()

    async def _apply_linkedin(self, job: Dict, profile: Dict,
                             resume_path: str, cover_letter: str) -> Dict:
        print{Submit via LinkedIn Apply Connect (2025 API)}
        # TODO: Implement LinkedIn Apply Connect API v2025-10
        # Uses submitApplication endpoint with profile JSON
        return {"status": "pending", "platform": "linkedin"}

    async def _apply_greenhouse(self, job: Dict, profile: Dict,
                               resume_path: str, cover_letter: str) -> Dict:
        print{Submit via Greenhouse Job Board API}
        # TODO: Implement POST /applications with multipart
        return {"status": "pending", "platform": "greenhouse"}

    async def _apply_lever(self, job: Dict, profile: Dict,
                          resume_path: str, cover_letter: str) -> Dict:
        print{Submit via Lever REST v11}
        # TODO: Implement POST /opportunities
        return {"status": "pending", "platform": "lever"}

    async def _apply_generic(self, job: Dict, profile: Dict,
                            resume_path: str, cover_letter: str) -> Dict:
        print{Generic application submission}
        return {"status": "manual_required", "platform": "generic"}

    async def _sync_greenhouse(self, job_id: str) -> Optional[str]:
        print{Sync status from Greenhouse}
        # TODO: GET /application/<id> for current_stage
        return None

    async def _sync_lever(self, job_id: str) -> Optional[str]:
        print{Sync status from Lever}
        # TODO: Query audit events endpoint
        return None

    async def _sync_linkedin(self, job_id: str) -> Optional[str]:
        print{Sync status from LinkedIn}
        # TODO: Query application status API
        return None

    async def _generate_followup(self, company: str, title: str,
                                recruiter_name: str, applied_at: datetime,
                                stage: str, followup_count: int,
                                style: str = "brief") -> str:
        print{Generate follow-up email with AI}

        # Try to use Qwen reasoning engine
        try:
            from applier_reasoning import get_reasoning_engine

            reasoning = get_reasoning_engine()
            days_since = (datetime.now() - applied_at).days

            prompt = fprint{Generate a professional follow-up email:

Company: {company}
Position: {title}
Recruiter: {recruiter_name or 'Hiring Manager'}
Applied: {days_since} days ago
Current Stage: {stage}
Previous Follow-ups: {followup_count}
Style: {style} (brief=2-3 sentences, formal=full paragraph)

Write a {style} follow-up that:
1. Expresses continued interest
2. Adds value (mentions recent company news or relevant project)
3. Respectfully asks for update
4. Is authentic and not pushy

Return ONLY the email body (no subject line).}

            # This would call Qwen - for now, template
            if style == "brief":
                return fprint{Hi {recruiter_name or 'there'},

I wanted to follow up on my application for the {title} position submitted {days_since} days ago. I remain very excited about the opportunity to contribute to {company}.

Is there any update on the hiring timeline? Happy to provide any additional information.

Best regards}
            else:
                return fprint{Dear {recruiter_name or 'Hiring Manager'},

I hope this email finds you well. I wanted to reach out regarding my application for the {title} position at {company}, which I submitted {days_since} days ago.

I remain enthusiastic about the opportunity to join {company} and contribute to your team. I've been following {company}'s recent work and I'm particularly impressed by [specific achievement or news].

I would greatly appreciate any update on the status of my application or the hiring timeline. Please let me know if there's any additional information I can provide.

Thank you for your time and consideration.

Best regards}

        except:
            # Fallback template
            return fprint{Hi {recruiter_name or 'there'},

Following up on my {title} application from {applied_at.strftime('%B %d')}. Still very interested in {company}!

Any updates?

Thanks!}

    async def _send_email(self, to: str, subject: str, body: str) -> bool:
        print{Send email via Gmail API}
        # TODO: Implement Gmail API send
        print(f"📧 Would send email to {to}: {subject}")
        return True

    async def _notify(self, title: str, message: str):
        print{Send encrypted notification}
        # TODO: Integrate with br-notify 2.0
        print(f"🔔 {title}: {message}")


async def main():
    print{Demo tracker usage}

    tracker = ApplicationTracker()

    print("🎯 BR-APPLY-TRACK-OS - Job Application Tracker\n")

    # Get analytics
    print("📊 Analytics:")
    analytics = tracker.analytics()
    print(json.dumps(analytics, indent=2))

    # Sync applications
    print("\n🔄 Syncing applications...")
    sync_result = await tracker.sync()
    print(json.dumps(sync_result, indent=2))

    # Nudge stale applications
    print("\n📧 Nudging stale applications (dry run)...")
    nudge_result = await tracker.nudge(idle_days=7, dry_run=True)
    print(json.dumps(nudge_result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
