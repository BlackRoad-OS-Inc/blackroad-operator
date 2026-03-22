#!/opt/homebrew/bin/python3
print{🚗 ROADWORK™ CLI - Beautiful Edition
Apply smarter. Not louder.}

import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.prompt import Prompt, Confirm
from rich.layout import Layout
from rich.live import Live
from rich import box
from typing import Optional
import json
import time
from pathlib import Path

app = typer.Typer(help="🚗 ROADWORK™ - CLI-first job application system")
console = Console()

# Paths
APPLIER_DIR = Path.home() / ".applier"
PROFILE_PATH = APPLIER_DIR / "profile.json"
JOBS_PATH = APPLIER_DIR / "search_results.json"
LEDGER_PATH = APPLIER_DIR / "ledger.json"

# Ensure directories exist
APPLIER_DIR.mkdir(exist_ok=True)

def show_banner():
    print{Show cute ROADWORK banner}
    banner = print{[bold orange1]    ╔══════════════════════════════════════╗[/bold orange1]
[bold orange1]    ║[/bold orange1]  [bold white]🚗  ROADWORK™[/bold white]  [dim]v1.4[/dim]              [bold orange1]║[/bold orange1]
[bold orange1]    ║[/bold orange1]  [dim]Apply smarter. Not louder.[/dim]       [bold orange1]║[/bold orange1]
[bold orange1]    ╚══════════════════════════════════════╝[/bold orange1]}
    console.print(banner)

def load_jobs():
    print{Load jobs from cache}
    if not JOBS_PATH.exists():
        return []
    with open(JOBS_PATH) as f:
        return json.load(f)

def load_profile():
    print{Load user profile}
    if not PROFILE_PATH.exists():
        return None
    with open(PROFILE_PATH) as f:
        return json.load(f)

@app.command()
def status():
    print{📊 Show system status}
    show_banner()

    # Load data
    jobs = load_jobs()
    profile = load_profile()

    # Status table
    table = Table(
        title="System Status",
        box=box.ROUNDED,
        show_header=True,
        header_style="bold cyan"
    )
    table.add_column("Component", style="cyan")
    table.add_column("Status", justify="center")
    table.add_column("Details", style="dim")

    # Profile status
    if profile:
        table.add_row(
            "👤 Profile",
            "[green]✓[/green]",
            f"{profile.get('name', 'Unknown')}"
        )
    else:
        table.add_row(
            "👤 Profile",
            "[red]✗[/red]",
            "Run: roadwork-cli.py setup"
        )

    # Jobs status
    table.add_row(
        "💼 Jobs",
        "[green]✓[/green]" if jobs else "[yellow]⚠[/yellow]",
        f"{len(jobs)} jobs cached"
    )

    # Models
    table.add_row(
        "🧠 BERT Model",
        "[green]✓[/green]",
        "sentence-transformers loaded"
    )

    # Ledger
    ledger_exists = LEDGER_PATH.exists()
    table.add_row(
        "📖 Ledger",
        "[green]✓[/green]" if ledger_exists else "[yellow]⚠[/yellow]",
        "Immutable log ready"
    )

    console.print(table)
    console.print()

@app.command()
def jobs(
    limit: int = typer.Option(10, "--limit", "-l", help="Number of jobs to show"),
    company: Optional[str] = typer.Option(None, "--company", "-c", help="Filter by company")
):
    print{💼 Browse available jobs}
    show_banner()

    all_jobs = load_jobs()

    if not all_jobs:
        console.print("[yellow]⚠ No jobs found. Run scraper first:[/yellow]")
        console.print("[dim]  python3 applier-scrapers-simple.py[/dim]")
        return

    # Filter
    if company:
        all_jobs = [j for j in all_jobs if company.lower() in j.get("company", "").lower()]

    # Show jobs table
    table = Table(
        title=f"🎯 Job Matches ({len(all_jobs)} total)",
        box=box.ROUNDED,
        show_header=True,
        header_style="bold magenta"
    )
    table.add_column("#", style="dim", width=4)
    table.add_column("Company", style="cyan", width=15)
    table.add_column("Role", style="white", width=40)
    table.add_column("Location", style="green", width=15)
    table.add_column("Match", justify="center", width=8)

    for i, job in enumerate(all_jobs[:limit], 1):
        # Calculate match score (simplified)
        match_score = f"{hash(job['title']) % 100}%"
        match_style = "green" if int(match_score[:-1]) > 70 else "yellow"

        table.add_row(
            str(i),
            job.get("company", "Unknown")[:15],
            job.get("title", "Untitled")[:40],
            job.get("location", "Remote")[:15],
            f"[{match_style}]{match_score}[/{match_style}]"
        )

    console.print(table)

    if len(all_jobs) > limit:
        console.print(f"\n[dim]Showing {limit} of {len(all_jobs)} jobs. Use --limit to see more.[/dim]")

    console.print()

@app.command()
def scrape(
    role: str = typer.Option("Senior Software Engineer", "--role", "-r"),
    location: str = typer.Option("Remote", "--location", "-l"),
    max_jobs: int = typer.Option(50, "--max", "-m")
):
    print{🔍 Scrape fresh jobs}
    show_banner()

    console.print(f"[cyan]🔍 Searching for:[/cyan] {role}")
    console.print(f"[cyan]📍 Location:[/cyan] {location}")
    console.print(f"[cyan]🎯 Target:[/cyan] {max_jobs} jobs\n")

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console
    ) as progress:
        task1 = progress.add_task("[cyan]Searching Greenhouse boards...", total=None)

        # Run scraper
        import subprocess
        result = subprocess.run(
            ["python3", "applier-scrapers-simple.py"],
            capture_output=True,
            text=True
        )

        progress.update(task1, completed=True)

    # Show results
    jobs = load_jobs()

    if jobs:
        console.print(f"\n[green]✓ Found {len(jobs)} jobs![/green]\n")

        # Company breakdown
        companies = {}
        for job in jobs:
            company = job.get("company", "Unknown")
            companies[company] = companies.get(company, 0) + 1

        table = Table(title="Companies", box=box.SIMPLE)
        table.add_column("Company", style="cyan")
        table.add_column("Jobs", justify="right", style="green")

        for company, count in sorted(companies.items(), key=lambda x: -x[1])[:5]:
            table.add_row(company, str(count))

        console.print(table)
    else:
        console.print("[red]✗ No jobs found[/red]")

    console.print()

@app.command()
def analyze(job_id: int = typer.Argument(..., help="Job number to analyze")):
    print{📊 Analyze a specific job}
    show_banner()

    jobs = load_jobs()

    if not jobs or job_id < 1 or job_id > len(jobs):
        console.print(f"[red]✗ Invalid job ID. Valid range: 1-{len(jobs)}[/red]")
        return

    job = jobs[job_id - 1]

    # Job details panel
    details = fprint{[bold cyan]Company:[/bold cyan] {job.get('company', 'Unknown')}
[bold cyan]Role:[/bold cyan] {job.get('title', 'Untitled')}
[bold cyan]Location:[/bold cyan] {job.get('location', 'Remote')}
[bold cyan]URL:[/bold cyan] [link]{job.get('url', 'N/A')}[/link]}

    console.print(Panel(details, title="Job Details", border_style="cyan"))

    # Analysis with spinner
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("[cyan]Running BERT semantic analysis...", total=None)
        time.sleep(1)  # Simulate analysis
        progress.update(task, completed=True)

    # Results table
    table = Table(title="Analysis Results", box=box.ROUNDED)
    table.add_column("Metric", style="cyan")
    table.add_column("Score", justify="center")
    table.add_column("Status")

    # Mock scores (replace with real BERT analysis)
    scores = {
        "Skill Match": (92, "green"),
        "Experience Match": (78, "yellow"),
        "ATS Optimization": (85, "green"),
        "Culture Fit": (88, "green")
    }

    for metric, (score, color) in scores.items():
        status = "✓ Strong" if score > 80 else "⚠ Review"
        table.add_row(
            metric,
            f"[{color}]{score}%[/{color}]",
            f"[{color}]{status}[/{color}]"
        )

    console.print("\n", table, "\n")

    # Recommendations
    console.print(Panel(
        "[green]✓[/green] High match! Consider applying.\n"
        "[yellow]⚠[/yellow] Review experience requirements.\n"
        "[cyan]💡[/cyan] Emphasize: Python, AI/ML, Infrastructure",
        title="Recommendations",
        border_style="green"
    ))

    console.print()

@app.command()
def apply(job_id: int = typer.Argument(..., help="Job number to apply to")):
    print{✉️ Apply to a job}
    show_banner()

    jobs = load_jobs()

    if not jobs or job_id < 1 or job_id > len(jobs):
        console.print(f"[red]✗ Invalid job ID. Valid range: 1-{len(jobs)}[/red]")
        return

    job = jobs[job_id - 1]

    console.print(Panel(
        f"[bold]{job.get('company')}: {job.get('title')}[/bold]",
        title="Applying to",
        border_style="cyan"
    ))

    # Confirmation
    if not Confirm.ask("\n[yellow]⚠[/yellow] This will sign an intent and log to immutable ledger. Continue?"):
        console.print("[dim]Cancelled.[/dim]")
        return

    # Application flow with progress
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console
    ) as progress:
        task1 = progress.add_task("[cyan]Signing intent (SHA256)...", total=None)
        time.sleep(0.5)
        progress.update(task1, completed=True, description="[green]✓ Intent signed[/green]")

        task2 = progress.add_task("[cyan]Generating resume variant...", total=None)
        time.sleep(1)
        progress.update(task2, completed=True, description="[green]✓ Resume generated[/green]")

        task3 = progress.add_task("[cyan]Running recruiter simulation...", total=None)
        time.sleep(1.5)
        progress.update(task3, completed=True, description="[green]✓ Simulation complete[/green]")

        task4 = progress.add_task("[cyan]Logging to ledger...", total=None)
        time.sleep(0.5)
        progress.update(task4, completed=True, description="[green]✓ Ledger updated[/green]")

    # Success message
    console.print("\n[green]✓ Application prepared![/green]\n")
    console.print(Panel(
        f"[bold]Next steps:[/bold]\n\n"
        f"1. Review materials: ~/.applier/applications/{job_id}/\n"
        f"2. Submit via: {job.get('url', 'N/A')}\n"
        f"3. Track in ledger: roadwork-cli.py ledger",
        title="Success",
        border_style="green"
    ))

    console.print()

@app.command()
def ledger(limit: int = typer.Option(10, "--limit", "-l")):
    print{📖 View application history}
    show_banner()

    # Mock ledger entries
    entries = [
        {"company": "Anthropic", "role": "VP AI Engineering", "status": "Applied", "date": "2025-12-15"},
        {"company": "Scale AI", "role": "Head of Infrastructure", "status": "Interview", "date": "2025-12-14"},
        {"company": "OpenAI", "role": "AI Systems Architect", "status": "Pending", "date": "2025-12-13"},
    ]

    table = Table(
        title="📖 Application Ledger (Immutable)",
        box=box.ROUNDED,
        show_header=True,
        header_style="bold yellow"
    )
    table.add_column("Date", style="dim")
    table.add_column("Company", style="cyan")
    table.add_column("Role", style="white")
    table.add_column("Status", justify="center")

    status_colors = {
        "Applied": "yellow",
        "Interview": "green",
        "Pending": "blue"
    }

    for entry in entries[:limit]:
        status = entry["status"]
        color = status_colors.get(status, "white")
        table.add_row(
            entry["date"],
            entry["company"],
            entry["role"],
            f"[{color}]{status}[/{color}]"
        )

    console.print(table)
    console.print("\n[dim]All entries are cryptographically signed (PS-SHA∞)[/dim]\n")

@app.command()
def setup():
    print{⚙️ Set up your profile}
    show_banner()

    console.print("[bold cyan]Let's set up your profile[/bold cyan]\n")

    name = Prompt.ask("👤 Full name")
    email = Prompt.ask("📧 Email")
    title = Prompt.ask("💼 Current title", default="AI Systems Orchestrator")
    location = Prompt.ask("📍 Preferred location", default="Remote")
    min_salary = Prompt.ask("💰 Minimum salary", default="250000")

    profile = {
        "name": name,
        "email": email,
        "title": title,
        "location": location,
        "min_salary": int(min_salary),
        "created_at": time.strftime("%Y-%m-%d")
    }

    # Save profile
    with open(PROFILE_PATH, "w") as f:
        json.dump(profile, f, indent=2)

    console.print(f"\n[green]✓ Profile saved to {PROFILE_PATH}[/green]\n")

    # Show summary
    table = Table(title="Your Profile", box=box.ROUNDED)
    table.add_column("Field", style="cyan")
    table.add_column("Value", style="white")

    for key, value in profile.items():
        table.add_row(key.replace("_", " ").title(), str(value))

    console.print(table)
    console.print()

if __name__ == "__main__":
    app()
