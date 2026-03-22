#!/usr/bin/env python3
"""
Background Check Preparation Tool

Features:
- Document checklist (ID, references, etc.)
- Reference preparation
- Employment history verification
- Education verification
- Criminal record check info
- Credit check preparation (if required)
- Timeline estimation
- Common issues and solutions
"""

import json
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path


@dataclass
class Reference:
    """Professional reference."""
    name: str
    title: str
    company: str
    relationship: str  # Manager, Colleague, etc.
    email: str
    phone: str
    years_known: int
    can_contact: bool = True
    contacted: bool = False
    notes: str = ""


@dataclass
class Employment:
    """Employment history entry."""
    company: str
    title: str
    start_date: str
    end_date: str
    manager_name: str
    manager_contact: str
    hr_contact: str
    can_verify: bool = True
    notes: str = ""


@dataclass
class BackgroundCheckPrep:
    """Background check preparation."""
    id: str
    company: str
    job_title: str

    # Documents
    documents_needed: List[str] = None
    documents_collected: List[str] = None

    # References
    references: List[Reference] = None

    # Employment history
    employment_history: List[Employment] = None

    # Education
    degrees: List[Dict[str, str]] = None

    # Checks to expect
    criminal_check: bool = True
    credit_check: bool = False
    drug_test: bool = False
    professional_licenses: List[str] = None

    # Timeline
    estimated_days: int = 7
    started_date: str = ""
    completed_date: str = ""

    # Status
    status: str = "pending"  # pending, in_progress, completed
    issues: List[str] = None

    # Metadata
    created_at: str = ""

    def __post_init__(self):
        if self.documents_needed is None:
            self.documents_needed = []
        if self.documents_collected is None:
            self.documents_collected = []
        if self.references is None:
            self.references = []
        if self.employment_history is None:
            self.employment_history = []
        if self.degrees is None:
            self.degrees = []
        if self.professional_licenses is None:
            self.professional_licenses = []
        if self.issues is None:
            self.issues = []
        if not self.created_at:
            self.created_at = datetime.now().isoformat()


class BackgroundCheckPrepTool:
    """Background check preparation tool."""

    # Standard documents
    STANDARD_DOCUMENTS = [
        "Government-issued ID (Driver's License or Passport)",
        "Social Security Card or Number",
        "Proof of address (utility bill, lease)",
        "Resume/CV",
        "Education transcripts or diplomas",
        "Professional certifications (if applicable)",
        "Previous employment contact information",
    ]

    def __init__(self):
        """Initialize background check prep tool."""
        self.data_dir = Path.home() / ".applier" / "background_check"
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def create_prep(
        self,
        company: str,
        job_title: str,
        **options
    ) -> BackgroundCheckPrep:
        """Create background check preparation."""

        prep = BackgroundCheckPrep(
            id=f"bgcheck_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            company=company,
            job_title=job_title,
            criminal_check=options.get("criminal_check", True),
            credit_check=options.get("credit_check", False),
            drug_test=options.get("drug_test", False),
        )

        # Set standard documents
        prep.documents_needed = self.STANDARD_DOCUMENTS.copy()

        # Add additional documents based on checks
        if prep.credit_check:
            prep.documents_needed.append("Authorization for credit check")

        if prep.drug_test:
            prep.documents_needed.append("Drug test authorization form")

        # Estimate timeline
        prep.estimated_days = self._estimate_timeline(prep)

        self._save_prep(prep)

        print(f"✅ Created background check prep for {company}")
        print(f"   Estimated timeline: {prep.estimated_days} days")

        return prep

    def add_reference(
        self,
        prep: BackgroundCheckPrep,
        name: str,
        title: str,
        company: str,
        relationship: str,
        email: str,
        phone: str,
        years_known: int
    ) -> Reference:
        """Add a reference."""

        ref = Reference(
            name=name,
            title=title,
            company=company,
            relationship=relationship,
            email=email,
            phone=phone,
            years_known=years_known
        )

        prep.references.append(ref)
        self._save_prep(prep)

        print(f"✅ Added reference: {name}")

        return ref

    def add_employment(
        self,
        prep: BackgroundCheckPrep,
        company: str,
        title: str,
        start_date: str,
        end_date: str,
        manager_name: str,
        manager_contact: str,
        hr_contact: str = ""
    ) -> Employment:
        """Add employment history."""

        emp = Employment(
            company=company,
            title=title,
            start_date=start_date,
            end_date=end_date,
            manager_name=manager_name,
            manager_contact=manager_contact,
            hr_contact=hr_contact
        )

        prep.employment_history.append(emp)
        self._save_prep(prep)

        print(f"✅ Added employment: {company}")

        return emp

    def generate_reference_email(self, reference: Reference, company: str) -> str:
        """Generate email to send to reference."""

        email = f"""Subject: Reference Request for {company}

Dear {reference.name},

I hope this email finds you well! I'm reaching out because I'm in the final stages of the interview process for a {company} position, and they've requested professional references.

Would you be willing to serve as a reference for me? The company may contact you to verify:
- Our working relationship
- My responsibilities and contributions
- My professional strengths

Please let me know if you're comfortable with this. I'm happy to provide any additional context about the role or company.

Thank you so much for your support!

Best regards"""

        return email

    def prepare_reference(self, reference: Reference, job_title: str) -> Dict[str, str]:
        """Generate preparation materials for reference."""

        prep = {
            "talking_points": f"""REFERENCE PREP - Talking Points

Thank you for agreeing to be a reference!

THE ROLE:
- Title: {job_title}
- Focus areas: [Fill in key areas]

KEY POINTS TO MENTION:
1. Our working relationship (how we worked together)
2. My key strengths and achievements
3. How I handle challenges
4. Why I'd be good for this role

POTENTIAL QUESTIONS:
- How did you work together?
- What are their strengths?
- What are areas for improvement?
- Would you hire them again?
- Anything else we should know?

TIMELINE:
- They may contact you in the next 1-2 weeks
- Call typically takes 10-15 minutes

CONTACT:
- {reference.email}
- {reference.phone}

Thank you again for your support!""",

            "quick_facts": f"""Quick Facts About Our Work Together:

- Relationship: {reference.relationship}
- Company: {reference.company}
- Duration: {reference.years_known} years
- Projects: [List 2-3 key projects]
- Achievements: [List 2-3 achievements]
"""
        }

        return prep

    def check_document_status(self, prep: BackgroundCheckPrep) -> Dict[str, any]:
        """Check document collection status."""

        status = {
            "total_needed": len(prep.documents_needed),
            "collected": len(prep.documents_collected),
            "missing": [],
            "progress": 0
        }

        for doc in prep.documents_needed:
            if doc not in prep.documents_collected:
                status["missing"].append(doc)

        if status["total_needed"] > 0:
            status["progress"] = (status["collected"] / status["total_needed"]) * 100

        return status

    def _estimate_timeline(self, prep: BackgroundCheckPrep) -> int:
        """Estimate background check timeline."""

        days = 3  # Base

        if prep.criminal_check:
            days += 2

        if prep.credit_check:
            days += 1

        if prep.drug_test:
            days += 1

        if len(prep.employment_history) > 3:
            days += 2

        return days

    def print_checklist(self, prep: BackgroundCheckPrep):
        """Print background check checklist."""

        print("\n" + "="*80)
        print(f"📋 BACKGROUND CHECK PREPARATION - {prep.company}")
        print("="*80 + "\n")

        print(f"Role: {prep.job_title}")
        print(f"Estimated Timeline: {prep.estimated_days} days")
        print(f"Status: {prep.status}")
        print()

        # Checks to expect
        print("🔍 CHECKS TO EXPECT:\n")
        if prep.criminal_check:
            print("  ✓ Criminal background check")
        if prep.credit_check:
            print("  ✓ Credit check")
        if prep.drug_test:
            print("  ✓ Drug screening")
        print("  ✓ Employment verification")
        print("  ✓ Education verification")
        print()

        # Documents
        doc_status = self.check_document_status(prep)
        print(f"📄 DOCUMENTS ({doc_status['collected']}/{doc_status['total_needed']}):\n")

        for doc in prep.documents_needed:
            if doc in prep.documents_collected:
                print(f"  ✅ {doc}")
            else:
                print(f"  ⬜ {doc}")
        print()

        # References
        print(f"👥 REFERENCES ({len(prep.references)} added):\n")
        if not prep.references:
            print("  ⚠️  No references added yet")
            print("  Recommendation: Add 3-5 professional references")
        else:
            for ref in prep.references:
                status_icon = "✅" if ref.contacted else "⬜"
                print(f"  {status_icon} {ref.name} - {ref.title} at {ref.company}")
        print()

        # Employment history
        print(f"💼 EMPLOYMENT HISTORY ({len(prep.employment_history)} entries):\n")
        if not prep.employment_history:
            print("  ⚠️  No employment history added")
            print("  Recommendation: Add your recent employers (last 5-7 years)")
        else:
            for emp in prep.employment_history:
                verify_icon = "✅" if emp.can_verify else "⚠️"
                print(f"  {verify_icon} {emp.company} - {emp.title} ({emp.start_date} to {emp.end_date})")
        print()

        # Issues
        if prep.issues:
            print("⚠️  POTENTIAL ISSUES:\n")
            for issue in prep.issues:
                print(f"  • {issue}")
            print()

        # Next steps
        print("✅ NEXT STEPS:\n")
        next_steps = []

        if doc_status["missing"]:
            next_steps.append(f"Collect {len(doc_status['missing'])} missing documents")

        if len(prep.references) < 3:
            next_steps.append("Add more references (aim for 3-5)")

        if not prep.employment_history:
            next_steps.append("Add employment history")

        if not next_steps:
            next_steps.append("All set! Wait for background check company to contact you")

        for i, step in enumerate(next_steps, 1):
            print(f"  {i}. {step}")

        print("\n" + "="*80 + "\n")

    def _save_prep(self, prep: BackgroundCheckPrep):
        """Save prep to file."""

        filename = f"{prep.company}_{prep.id}.json"
        filepath = self.data_dir / filename

        # Convert to dict
        data = asdict(prep)

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)


# CLI
def main():
    """CLI for background check prep."""

    import argparse

    parser = argparse.ArgumentParser(description="Background Check Preparation Tool")
    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # Create prep
    create_parser = subparsers.add_parser("create", help="Create new background check prep")
    create_parser.add_argument("--company", required=True)
    create_parser.add_argument("--job-title", required=True)
    create_parser.add_argument("--credit-check", action="store_true")
    create_parser.add_argument("--drug-test", action="store_true")

    # Show checklist
    subparsers.add_parser("show", help="Show checklist")

    args = parser.parse_args()

    tool = BackgroundCheckPrepTool()

    if args.command == "create":
        prep = tool.create_prep(
            company=args.company,
            job_title=args.job_title,
            credit_check=args.credit_check,
            drug_test=args.drug_test
        )
        tool.print_checklist(prep)

    else:
        print("Use 'create' command to get started")

    return 0


if __name__ == "__main__":
    exit(main())
