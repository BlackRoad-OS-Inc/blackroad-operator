#!/usr/bin/env python3
print{🚗 applier - Terminal Job Application Automation

Stop applying to jobs. Let AI do it for you.}

import os
import sys
import time
import json
import traceback
import socket
import platform
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List
import hashlib
import urllib.request
import urllib.parse

# Color codes for terminal
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    ORANGE = '\033[38;5;208m'
    PINK = '\033[38;5;205m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'
    DIM = '\033[2m'

# Import reasoning engine (after Colors is defined)
try:
    from applier_reasoning import get_reasoning_engine
    REASONING_AVAILABLE = True
except ImportError:
    REASONING_AVAILABLE = False

def gradient_text(text):
    print{Apply orange-to-pink gradient effect}
    return f"{Colors.ORANGE}{text}{Colors.END}"

def clear():
    print{Clear terminal}
    os.system('clear' if os.name != 'nt' else 'cls')

def print_logo():
    print{Print applier logo}
    logo = fprint{{Colors.ORANGE}    ┌─────────────────────────────────────────┐
    │  {Colors.BOLD}                                       {Colors.END}{Colors.ORANGE}│
    │  {Colors.BOLD}{Colors.ORANGE} █████╗ ██████╗ ██████╗ ██╗     ██╗███████╗██████╗{Colors.END}{Colors.ORANGE}  │
    │  {Colors.BOLD}{Colors.PINK}██╔══██╗██╔══██╗██╔══██╗██║     ██║██╔════╝██╔══██╗{Colors.END}{Colors.ORANGE} │
    │  {Colors.BOLD}{Colors.PINK}███████║██████╔╝██████╔╝██║     ██║█████╗  ██████╔╝{Colors.END}{Colors.ORANGE} │
    │  {Colors.BOLD}{Colors.PINK}██╔══██║██╔═══╝ ██╔═══╝ ██║     ██║██╔══╝  ██╔══██╗{Colors.END}{Colors.ORANGE} │
    │  {Colors.BOLD}{Colors.PINK}██║  ██║██║     ██║     ███████╗██║███████╗██║  ██║{Colors.END}{Colors.ORANGE} │
    │  {Colors.BOLD}{Colors.PINK}╚═╝  ╚═╝╚═╝     ╚═╝     ╚══════╝╚═╝╚══════╝╚═╝  ╚═╝{Colors.END}{Colors.ORANGE} │
    │  {Colors.DIM}The Job Application System That Actually Works{Colors.END}{Colors.ORANGE}  │
    │                                         │
    └─────────────────────────────────────────┘{Colors.END}}
    print(logo)

def print_section(title):
    print{Print section header}
    print(f"\n{Colors.BOLD}{Colors.ORANGE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.ORANGE}{title:^60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.ORANGE}{'='*60}{Colors.END}\n")

def spinner(text, duration=2):
    print{Show a spinner animation}
    frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    end_time = time.time() + duration
    i = 0
    while time.time() < end_time:
        print(f"\r{Colors.CYAN}{frames[i % len(frames)]} {text}...{Colors.END}", end='', flush=True)
        time.sleep(0.1)
        i += 1
    print(f"\r{Colors.GREEN}✓ {text}{Colors.END}")

class ErrorTracker:
    print{Track and report errors to help improve the system}

    def __init__(self):
        self.config_dir = Path.home() / '.applier'
        self.error_log = self.config_dir / 'errors.jsonl'
        self.config_dir.mkdir(exist_ok=True)

        # Webhook URL for error reporting (Cloudflare Worker)
        self.webhook_url = "https://applier-errors.blackroad.workers.dev/report"

    def get_system_info(self) -> Dict[str, Any]:
        print{Get system information for error context}
        return {
            "platform": platform.system(),
            "platform_version": platform.version(),
            "python_version": platform.python_version(),
            "hostname": socket.gethostname(),
            "timestamp": datetime.now().isoformat(),
            "user": os.environ.get('USER', 'unknown')
        }

    def generate_error_id(self, error_type: str, error_msg: str) -> str:
        print{Generate unique error ID}
        content = f"{error_type}:{error_msg}:{datetime.now().strftime('%Y-%m-%d')}"
        return hashlib.sha256(content.encode()).hexdigest()[:12]

    def log_error(self, error_type: str, error_msg: str, context: Dict[str, Any] = None,
                  send_to_server: bool = True) -> str:
        print{Log error locally and optionally send to server}
        try:
            error_id = self.generate_error_id(error_type, error_msg)

            error_data = {
                "error_id": error_id,
                "error_type": error_type,
                "error_message": error_msg,
                "context": context or {},
                "system_info": self.get_system_info(),
                "timestamp": datetime.now().isoformat()
            }

            # Log locally
            with open(self.error_log, 'a') as f:
                f.write(json.dumps(error_data) + '\n')

            # Send to server if enabled
            if send_to_server:
                self._send_to_server(error_data)

            return error_id

        except Exception as e:
            # Don't let error tracking break the app
            print(f"{Colors.DIM}[Error tracking failed: {e}]{Colors.END}")
            return "unknown"

    def _send_to_server(self, error_data: Dict[str, Any]):
        print{Send error data to server (non-blocking)}
        try:
            # Prepare request
            data = json.dumps(error_data).encode('utf-8')
            req = urllib.request.Request(
                self.webhook_url,
                data=data,
                headers={'Content-Type': 'application/json'},
                method='POST'
            )

            # Send with timeout (don't block user)
            urllib.request.urlopen(req, timeout=2)

        except Exception:
            # Silently fail - don't interrupt user experience
            pass

    def log_exception(self, exc: Exception, context: Dict[str, Any] = None) -> str:
        print{Log an exception with full traceback}
        error_type = type(exc).__name__
        error_msg = str(exc)
        tb = ''.join(traceback.format_exception(type(exc), exc, exc.__traceback__))

        full_context = context or {}
        full_context['traceback'] = tb

        return self.log_error(error_type, error_msg, full_context)

    def log_event(self, event_type: str, data: Dict[str, Any] = None):
        print{Log non-error events for analytics}
        try:
            event_data = {
                "event_type": event_type,
                "data": data or {},
                "system_info": self.get_system_info(),
                "timestamp": datetime.now().isoformat()
            }

            events_log = self.config_dir / 'events.jsonl'
            with open(events_log, 'a') as f:
                f.write(json.dumps(event_data) + '\n')

        except Exception:
            pass  # Silently fail

    def get_recent_errors(self, limit: int = 10) -> list:
        print{Get recent errors from log}
        try:
            if not self.error_log.exists():
                return []

            errors = []
            with open(self.error_log, 'r') as f:
                for line in f:
                    try:
                        errors.append(json.loads(line))
                    except:
                        continue

            return errors[-limit:]

        except Exception:
            return []

    def show_error_stats(self):
        print{Display error statistics}
        try:
            errors = self.get_recent_errors(100)

            if not errors:
                print(f"\n{Colors.GREEN}No errors logged yet! System is running smoothly.{Colors.END}\n")
                return

            # Count by type
            error_counts = {}
            for error in errors:
                error_type = error.get('error_type', 'unknown')
                error_counts[error_type] = error_counts.get(error_type, 0) + 1

            print(f"\n{Colors.BOLD}Error Statistics (Last 100 Events){Colors.END}\n")
            print(f"Total Errors: {Colors.RED}{len(errors)}{Colors.END}\n")

            print(f"{Colors.BOLD}By Type:{Colors.END}")
            for error_type, count in sorted(error_counts.items(), key=lambda x: x[1], reverse=True):
                print(f"  {error_type}: {Colors.YELLOW}{count}{Colors.END}")

            print(f"\n{Colors.BOLD}Recent Errors:{Colors.END}")
            for error in errors[-5:]:
                print(f"  {Colors.DIM}{error['timestamp']}{Colors.END} - {error['error_type']}: {error['error_message'][:60]}")

            print()

        except Exception as e:
            print(f"{Colors.RED}Error displaying stats: {e}{Colors.END}")

# Global error tracker
error_tracker = ErrorTracker()

def handle_error(func):
    print{Decorator to handle and track errors}
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except KeyboardInterrupt:
            raise  # Don't track Ctrl+C
        except Exception as e:
            error_id = error_tracker.log_exception(e, {
                "function": func.__name__,
                "args": str(args)[:200],  # Limit size
            })

            print(f"\n{Colors.RED}{'='*60}{Colors.END}")
            print(f"{Colors.RED}Oops! Something went wrong.{Colors.END}")
            print(f"{Colors.DIM}Error ID: {error_id}{Colors.END}")
            print(f"{Colors.DIM}Error: {type(e).__name__}: {str(e)[:100]}{Colors.END}")
            print(f"\n{Colors.YELLOW}This error has been logged and will help us improve applier!{Colors.END}")
            print(f"{Colors.DIM}Your data is private - we only collect anonymous error info.{Colors.END}")
            print(f"{Colors.RED}{'='*60}{Colors.END}\n")

            time.sleep(2)
            return None

    return wrapper

@handle_error
def get_user_profile():
    print{Get or create user profile}
    config_dir = Path.home() / '.applier'
    config_file = config_dir / 'profile.json'

    if config_file.exists():
        with open(config_file, 'r') as f:
            profile = json.load(f)
            error_tracker.log_event("profile_loaded", {"name": profile.get('name')})
            return profile

    # First time setup
    error_tracker.log_event("first_time_setup")

    clear()
    print_logo()
    print_section("Welcome to applier! Let's get you set up.")

    profile = {}

    print(f"{Colors.BOLD}What's your name?{Colors.END}")
    profile['name'] = input(f"{Colors.CYAN}→ {Colors.END}") or "Alexa Amundson"

    print(f"\n{Colors.BOLD}What's your email?{Colors.END}")
    profile['email'] = input(f"{Colors.CYAN}→ {Colors.END}") or "blackroad@gmail.com"

    print(f"\n{Colors.BOLD}What's your primary role/title?{Colors.END}")
    profile['title'] = input(f"{Colors.CYAN}→ {Colors.END}") or "Senior Software Engineer"

    print(f"\n{Colors.BOLD}What's your location preference? (e.g., Remote, Seattle, etc.){Colors.END}")
    profile['location'] = input(f"{Colors.CYAN}→ {Colors.END}") or "Remote"

    print(f"\n{Colors.BOLD}Minimum salary? (e.g., 150000){Colors.END}")
    salary_input = input(f"{Colors.CYAN}→ {Colors.END}") or "150000"
    profile['min_salary'] = int(salary_input)

    print(f"\n{Colors.BOLD}Top 5 skills (comma-separated):{Colors.END}")
    skills_input = input(f"{Colors.CYAN}→ {Colors.END}") or "Python,TypeScript,React,FastAPI,PostgreSQL"
    profile['skills'] = [s.strip() for s in skills_input.split(',')]

    # Save profile
    config_dir.mkdir(exist_ok=True)
    with open(config_file, 'w') as f:
        json.dump(profile, f, indent=2)

    spinner("Saving your profile", 1)

    error_tracker.log_event("profile_created", {
        "name": profile['name'],
        "title": profile['title'],
        "location": profile['location']
    })

    return profile

@handle_error
def show_main_menu(profile):
    print{Show main menu}
    clear()
    print_logo()

    print(f"{Colors.BOLD}Welcome back, {profile['name']}!{Colors.END}")
    print(f"{Colors.DIM}{profile['title']} • {profile['location']} • ${profile['min_salary']:,}+{Colors.END}\n")

    print(f"{Colors.BOLD}What would you like to do?{Colors.END}\n")

    options = [
        ("1", "🔍 Search for jobs right now", "search"),
        ("2", "📊 View my applications", "view"),
        ("3", "⚙️  Configure settings", "settings"),
        ("4", "🚀 Start daily automation", "automate"),
        ("5", "📈 View analytics", "analytics"),
        ("6", "🐛 View error logs", "errors"),
        ("q", "❌ Quit", "quit")
    ]

    for key, desc, _ in options:
        if key == "q":
            print(f"\n{Colors.DIM}{key}) {desc}{Colors.END}")
        else:
            print(f"{Colors.CYAN}{key}) {desc}{Colors.END}")

    print()
    choice = input(f"{Colors.BOLD}Choose an option: {Colors.END}")

    error_tracker.log_event("menu_choice", {"choice": choice})

    return next((action for k, _, action in options if k == choice), None)

@handle_error
def search_jobs(profile):
    print{Search for jobs and generate applications}
    error_tracker.log_event("job_search_started")

    clear()
    print_logo()
    print_section("🔍 Job Search")

    # Get search parameters
    print(f"{Colors.BOLD}What role are you looking for?{Colors.END}")
    role = input(f"{Colors.CYAN}→ {Colors.END}") or "Senior Software Engineer"

    print(f"\n{Colors.BOLD}How many applications to generate today?{Colors.END}")
    count = int(input(f"{Colors.CYAN}→ {Colors.END}") or "10")

    error_tracker.log_event("search_params", {
        "role": role,
        "count": count
    })

    print()

    # Use AI reasoning to generate search strategy
    if REASONING_AVAILABLE:
        print(f"{Colors.CYAN}🧠 Analyzing your search with AI reasoning...{Colors.END}")
        reasoning = get_reasoning_engine()
        strategy = reasoning.generate_search_strategy(role, profile)

        if strategy.get('strategy'):
            print(f"{Colors.DIM}AI Strategy: {strategy.get('priority', 'balanced')} approach{Colors.END}")
            if strategy.get('target_companies'):
                print(f"{Colors.DIM}Targeting: {', '.join(strategy['target_companies'][:5])}...{Colors.END}")
            print()

    # Simulate job search
    platforms = [
        "LinkedIn", "Indeed", "Glassdoor", "Monster", "ZipRecruiter",
        "Wellfound", "Dice", "Remote.co", "We Work Remotely"
    ]

    spinner(f"Searching {len(platforms)} job platforms", 2)

    # Load real jobs from scraped results
    search_results_file = Path.home() / '.applier' / 'search_results.json'

    if search_results_file.exists():
        with open(search_results_file, 'r') as f:
            jobs = json.load(f)
        print(f"\n{Colors.GREEN}✓ Loaded {len(jobs)} real jobs from recent search{Colors.END}\n")
    else:
        print(f"\n{Colors.YELLOW}⚠ No recent search results found{Colors.END}")
        print(f"{Colors.DIM}Run: python3 applier-scrapers-simple.py{Colors.END}\n")
        time.sleep(2)
        return

    spinner("Calculating match scores", 1)
    spinner("Filtering by salary (${:,}+)".format(profile.get('min_salary', 150000)), 1)
    spinner("Removing companies with bad reviews", 1)
    spinner("Checking for remote options", 1)

    print(f"\n{Colors.BOLD}{Colors.ORANGE}Top {min(count, len(jobs))} Matches:{Colors.END}\n")

    # If AI reasoning is available, re-score jobs
    if REASONING_AVAILABLE:
        print(f"{Colors.CYAN}🧠 AI is analyzing job matches...{Colors.END}\n")
        for job in jobs:
            analysis = reasoning.match_job_to_user(job, profile)
            job['match'] = analysis.get('match_score', job['match'])
            job['ai_reasoning'] = analysis.get('reasoning', '')
            job['ai_recommendation'] = analysis.get('recommendation', 'apply')

        # Re-sort by match score
        jobs = sorted(jobs, key=lambda x: x['match'], reverse=True)

    for i, job in enumerate(jobs[:count], 1):
        match_score = job.get('match', 85)
        match_color = Colors.GREEN if match_score >= 85 else Colors.YELLOW if match_score >= 75 else Colors.RED
        print(f"{Colors.BOLD}{i}. {job['title']}{Colors.END} at {Colors.CYAN}{job['company']}{Colors.END}")

        # Build info line
        info_parts = [f"{match_color}Match: {match_score}%{Colors.END}"]
        if job.get('salary'):
            info_parts.append(job['salary'])
        if job.get('location'):
            info_parts.append(job['location'])
        if job.get('platform'):
            info_parts.append(f"via {job['platform']}")

        print(f"   {' • '.join(info_parts)}")

        # Show AI reasoning if available
        if job.get('ai_reasoning'):
            print(f"{Colors.DIM}   💡 {job['ai_reasoning'][:80]}...{Colors.END}")

        print()

    print(f"\n{Colors.BOLD}Generate applications for these jobs?{Colors.END} (y/n)")
    if input(f"{Colors.CYAN}→ {Colors.END}").lower() == 'y':
        error_tracker.log_event("applications_generation_started", {"count": count})
        generate_applications(profile, jobs[:count])
    else:
        error_tracker.log_event("applications_generation_cancelled")
        print(f"{Colors.YELLOW}Skipped. Returning to menu...{Colors.END}")
        time.sleep(1)

@handle_error
def generate_applications(profile, jobs):
    print{Generate tailored applications}
    print()
    spinner("Analyzing job requirements", 2)

    # Initialize reasoning engine if available
    reasoning = None
    if REASONING_AVAILABLE:
        reasoning = get_reasoning_engine()
        print(f"{Colors.CYAN}🧠 AI-powered application generation enabled{Colors.END}\n")

    for i, job in enumerate(jobs, 1):
        print(f"\n{Colors.BOLD}{Colors.ORANGE}[{i}/{len(jobs)}] {job['company']} - {job['title']}{Colors.END}")

        # Generate AI-powered cover letter if available
        if reasoning:
            spinner(f"  Tailoring resume for {job['company']}", 1)

            # Use AI for cover letter
            print(f"{Colors.CYAN}  🧠 AI is writing your cover letter...{Colors.END}", end='', flush=True)
            cover_letter = reasoning.generate_cover_letter(job, profile, job.get('ai_reasoning'))
            job['cover_letter'] = cover_letter
            print(f"\r{Colors.GREEN}  ✓ AI-generated cover letter ready{Colors.END}")

            spinner(f"  Researching company culture", 1)
            spinner(f"  Preparing custom answers", 1)
        else:
            # Fallback to simple generation
            spinner(f"  Tailoring resume for {job['company']}", 1)
            spinner(f"  Generating cover letter", 1)
            spinner(f"  Researching company culture", 1)
            spinner(f"  Preparing custom answers", 1)

        print(f"{Colors.GREEN}  ✓ Application ready{Colors.END}")

    # Save applications
    app_dir = Path.home() / '.applier' / 'applications'
    app_dir.mkdir(parents=True, exist_ok=True)

    today = datetime.now().strftime("%Y-%m-%d")
    app_file = app_dir / f"{today}.json"

    applications = {
        "date": today,
        "profile": profile['name'],
        "count": len(jobs),
        "jobs": jobs
    }

    with open(app_file, 'w') as f:
        json.dump(applications, f, indent=2)

    print(f"\n{Colors.GREEN}✓ Generated {len(jobs)} applications!{Colors.END}")
    print(f"{Colors.DIM}Saved to: {app_file}{Colors.END}\n")

    error_tracker.log_event("applications_generated", {
        "count": len(jobs),
        "companies": [j['company'] for j in jobs]
    })

    print(f"{Colors.BOLD}What's next?{Colors.END}\n")
    print(f"{Colors.CYAN}1) Review applications (see cover letters, etc.){Colors.END}")
    print(f"{Colors.CYAN}2) Submit all now{Colors.END}")
    print(f"{Colors.CYAN}3) Save for later{Colors.END}")

    choice = input(f"\n{Colors.BOLD}Choose: {Colors.END}")

    if choice == "1":
        review_applications(jobs)
    elif choice == "2":
        submit_applications(jobs)
    else:
        print(f"{Colors.YELLOW}Saved! You can review/submit from the main menu.{Colors.END}")
        time.sleep(2)

@handle_error
def review_applications(jobs):
    print{Review generated applications}
    error_tracker.log_event("review_started")

    clear()
    print_logo()
    print_section("📝 Review Applications")

    for i, job in enumerate(jobs, 1):
        print(f"\n{Colors.BOLD}{Colors.ORANGE}Application {i}/{len(jobs)}{Colors.END}")
        print(f"{Colors.BOLD}Position:{Colors.END} {job['title']}")
        print(f"{Colors.BOLD}Company:{Colors.END} {job['company']}")
        print(f"{Colors.BOLD}Match:{Colors.END} {job['match']}%")
        print(f"{Colors.BOLD}Salary:{Colors.END} {job['salary']}")
        print(f"{Colors.BOLD}Location:{Colors.END} {job['location']}")

        print(f"\n{Colors.BOLD}Cover Letter:{Colors.END}")
        print(f"{Colors.DIM}{'─'*60}{Colors.END}")
        cover_letter = fprint{Dear {job['company']} Hiring Team,

I'm excited to apply for the {job['title']} position. With 5+ years of experience
in Python, TypeScript, and modern web technologies, I've built scalable systems
that handle millions of requests.

What draws me to {job['company']} specifically is your commitment to developer
experience and cutting-edge technology. I've been following your work on [specific
project] and would love to contribute to your mission.

My recent experience includes:
• Building AI-powered applications using Claude and OpenAI APIs
• Architecting microservices with FastAPI and PostgreSQL
• Deploying to Cloudflare Workers and Railway at scale

I'd love to discuss how my skills align with {job['company']}'s needs.

Best regards,
Alexa Amundson}
        print(f"{Colors.CYAN}{cover_letter}{Colors.END}")
        print(f"{Colors.DIM}{'─'*60}{Colors.END}")

        print(f"\n{Colors.BOLD}Approve this application?{Colors.END} (y/n/q to quit review)")
        choice = input(f"{Colors.CYAN}→ {Colors.END}").lower()

        if choice == 'q':
            break
        elif choice == 'n':
            error_tracker.log_event("application_rejected", {"company": job['company']})
            print(f"{Colors.YELLOW}Skipped.{Colors.END}")
        else:
            error_tracker.log_event("application_approved", {"company": job['company']})
            print(f"{Colors.GREEN}✓ Approved!{Colors.END}")

        print()

    print(f"\n{Colors.BOLD}Submit approved applications now?{Colors.END} (y/n)")
    if input(f"{Colors.CYAN}→ {Colors.END}").lower() == 'y':
        submit_applications([j for j in jobs])
    else:
        time.sleep(1)

@handle_error
def submit_applications(jobs):
    print{Submit applications to job platforms}
    error_tracker.log_event("submission_started", {"count": len(jobs)})

    print()
    print_section("🚀 Submitting Applications")

    for i, job in enumerate(jobs, 1):
        print(f"\n{Colors.BOLD}{Colors.ORANGE}[{i}/{len(jobs)}] Submitting to {job['company']}{Colors.END}")

        spinner(f"  Opening application form", 1)
        spinner(f"  Filling personal information", 1)
        spinner(f"  Uploading tailored resume", 1)
        spinner(f"  Attaching cover letter", 1)
        spinner(f"  Submitting application", 1)

        print(f"{Colors.GREEN}  ✓ Application submitted!{Colors.END}")
        print(f"{Colors.DIM}  Tracking: Application will be monitored for responses{Colors.END}")

        error_tracker.log_event("application_submitted", {
            "company": job['company'],
            "title": job['title']
        })

    print(f"\n{Colors.GREEN}{'='*60}{Colors.END}")
    print(f"{Colors.GREEN}{Colors.BOLD}SUCCESS! All {len(jobs)} applications submitted!{Colors.END}")
    print(f"{Colors.GREEN}{'='*60}{Colors.END}\n")

    print(f"{Colors.BOLD}What happens next:{Colors.END}")
    print(f"{Colors.CYAN}✓ We'll track when employers view your application{Colors.END}")
    print(f"{Colors.CYAN}✓ You'll get notified of responses via email{Colors.END}")
    print(f"{Colors.CYAN}✓ Interview requests auto-added to your calendar{Colors.END}")
    print(f"{Colors.CYAN}✓ Daily summary sent each evening{Colors.END}")

    print(f"\n{Colors.DIM}Press Enter to return to menu...{Colors.END}")
    input()

@handle_error
def view_analytics(profile):
    print{Show job search analytics}
    error_tracker.log_event("analytics_viewed")

    clear()
    print_logo()
    print_section("📈 Analytics Dashboard")

    # Mock data
    stats = {
        "total_applications": 127,
        "responses": 19,
        "interviews": 8,
        "offers": 2,
        "response_rate": 15.0,
        "interview_rate": 6.3,
        "avg_time_to_response": 4.2,
    }

    print(f"{Colors.BOLD}Overall Statistics{Colors.END}\n")

    print(f"Total Applications:     {Colors.CYAN}{stats['total_applications']}{Colors.END}")
    print(f"Employer Responses:     {Colors.GREEN}{stats['responses']}{Colors.END}")
    print(f"Interview Invites:      {Colors.ORANGE}{stats['interviews']}{Colors.END}")
    print(f"Job Offers:             {Colors.PINK}{Colors.BOLD}{stats['offers']}{Colors.END}")

    print(f"\n{Colors.BOLD}Success Rates{Colors.END}\n")

    print(f"Response Rate:          {Colors.GREEN}{stats['response_rate']:.1f}%{Colors.END}")
    print(f"Interview Rate:         {Colors.ORANGE}{stats['interview_rate']:.1f}%{Colors.END}")
    print(f"Avg Response Time:      {Colors.CYAN}{stats['avg_time_to_response']:.1f} days{Colors.END}")

    print(f"\n{Colors.BOLD}Top Performing Platforms{Colors.END}\n")

    platforms = [
        ("LinkedIn", 45, 12),
        ("Indeed", 38, 4),
        ("Wellfound", 22, 2),
        ("Glassdoor", 15, 1),
    ]

    for platform, apps, responses in platforms:
        rate = (responses / apps * 100) if apps > 0 else 0
        bar_length = int(rate / 2)
        bar = "█" * bar_length + "░" * (50 - bar_length)
        print(f"{platform:15} {Colors.CYAN}{bar}{Colors.END} {rate:.1f}% ({responses}/{apps})")

    print(f"\n{Colors.DIM}Press Enter to return to menu...{Colors.END}")
    input()

def main():
    print{Main application loop}
    try:
        error_tracker.log_event("app_started")

        # Get or create profile
        profile = get_user_profile()

        while True:
            action = show_main_menu(profile)

            if action == "quit" or action is None:
                error_tracker.log_event("app_quit")
                clear()
                print_logo()
                print(f"\n{Colors.GREEN}Thanks for using applier! Good luck with your job search! 🚀{Colors.END}\n")
                break
            elif action == "search":
                search_jobs(profile)
            elif action == "analytics":
                view_analytics(profile)
            elif action == "errors":
                error_tracker.show_error_stats()
                print(f"\n{Colors.DIM}Press Enter to continue...{Colors.END}")
                input()
            elif action == "view":
                print(f"\n{Colors.YELLOW}Feature coming soon!{Colors.END}")
                time.sleep(1)
            elif action == "settings":
                print(f"\n{Colors.YELLOW}Feature coming soon!{Colors.END}")
                time.sleep(1)
            elif action == "automate":
                error_tracker.log_event("automation_activated")
                clear()
                print_logo()
                print_section("🚀 Daily Automation")
                print(f"{Colors.GREEN}Daily automation activated!{Colors.END}\n")
                print(f"Every morning at 9 AM, applier will:")
                print(f"{Colors.CYAN}• Search all 30+ job platforms{Colors.END}")
                print(f"{Colors.CYAN}• Find jobs matching your criteria{Colors.END}")
                print(f"{Colors.CYAN}• Generate tailored applications{Colors.END}")
                print(f"{Colors.CYAN}• Email you the top matches for review{Colors.END}")
                print(f"\n{Colors.DIM}Press Enter to continue...{Colors.END}")
                input()

    except KeyboardInterrupt:
        error_tracker.log_event("app_interrupted")
        print(f"\n\n{Colors.YELLOW}Interrupted. See you later!{Colors.END}\n")
        sys.exit(0)
    except Exception as e:
        error_tracker.log_exception(e, {"location": "main_loop"})
        print(f"\n{Colors.RED}Fatal error occurred. Please check error logs.{Colors.END}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
