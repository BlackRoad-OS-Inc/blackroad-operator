#!/usr/bin/env python3
"""
Phone Screen Preparation Tool

Features:
- Common phone screen questions with answers
- Company research summary
- STAR method answer generator
- Salary discussion preparation
- Question list for recruiter
- Red flag detection
- Mock phone screen with AI
- Voice notes and talking points
"""

import json
import os
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


@dataclass
class PhoneScreenPrep:
    """Phone screen preparation."""
    id: str
    company: str
    job_title: str
    recruiter_name: str
    scheduled_date: str

    # Prep materials
    company_summary: str = ""
    role_summary: str = ""

    # Common questions & answers
    qa_pairs: List[Dict[str, str]] = None

    # Talking points
    talking_points: List[str] = None

    # Questions to ask
    questions_to_ask: List[str] = None

    # Salary prep
    salary_min: int = 0
    salary_max: int = 0
    salary_talking_points: str = ""

    # Red flags
    red_flags: List[str] = None

    # Mock interview
    mock_interview_completed: bool = False
    mock_interview_feedback: str = ""

    # Metadata
    created_at: str = ""

    def __post_init__(self):
        if self.qa_pairs is None:
            self.qa_pairs = []
        if self.talking_points is None:
            self.talking_points = []
        if self.questions_to_ask is None:
            self.questions_to_ask = []
        if self.red_flags is None:
            self.red_flags = []
        if not self.created_at:
            self.created_at = datetime.now().isoformat()


class PhoneScreenPrepTool:
    """Phone screen preparation tool."""

    # Common phone screen questions
    COMMON_QUESTIONS = [
        "Tell me about yourself",
        "Why are you interested in this role?",
        "Why do you want to work at our company?",
        "What are your salary expectations?",
        "When can you start?",
        "Why are you leaving your current role?",
        "What are your strengths?",
        "What are your weaknesses?",
        "Where do you see yourself in 5 years?",
        "Do you have any questions for me?",
    ]

    # Red flags to watch for
    RED_FLAG_KEYWORDS = [
        "fast-paced environment",
        "wear many hats",
        "work hard play hard",
        "like a family",
        "unlimited PTO",
        "equity instead of salary",
        "unpaid trial period",
        "we're still figuring things out",
        "high turnover",
        "long hours",
    ]

    def __init__(self, api_key: Optional[str] = None):
        """Initialize phone screen prep tool."""
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if self.api_key and ANTHROPIC_AVAILABLE:
            self.client = anthropic.Anthropic(api_key=self.api_key)
        else:
            self.client = None

        self.data_dir = Path.home() / ".applier" / "phone_screen_prep"
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def create_prep(
        self,
        company: str,
        job_title: str,
        recruiter_name: str,
        scheduled_date: str,
        **details
    ) -> PhoneScreenPrep:
        """Create phone screen preparation."""

        print(f"📞 Creating phone screen prep for {company}")

        prep = PhoneScreenPrep(
            id=f"prep_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            company=company,
            job_title=job_title,
            recruiter_name=recruiter_name,
            scheduled_date=scheduled_date,
            salary_min=details.get("salary_min", 0),
            salary_max=details.get("salary_max", 0)
        )

        # Generate prep materials
        if self.client:
            self._generate_prep_materials(prep, details)

        # Save
        self._save_prep(prep)

        return prep

    def _generate_prep_materials(self, prep: PhoneScreenPrep, details: Dict):
        """Generate preparation materials using AI."""

        job_description = details.get("job_description", "")
        resume = details.get("resume", "")

        # Company & role summary
        prep.company_summary, prep.role_summary = self._generate_summaries(
            prep.company, prep.job_title, job_description
        )

        # Q&A pairs
        prep.qa_pairs = self._generate_qa_pairs(
            prep.company, prep.job_title, job_description, resume
        )

        # Talking points
        prep.talking_points = self._generate_talking_points(
            prep.company, prep.job_title, resume
        )

        # Questions to ask
        prep.questions_to_ask = self._generate_questions_to_ask(
            prep.company, prep.job_title
        )

        # Salary prep
        if prep.salary_min and prep.salary_max:
            prep.salary_talking_points = self._generate_salary_talking_points(
                prep.salary_min, prep.salary_max
            )

    def _generate_summaries(
        self,
        company: str,
        job_title: str,
        job_description: str
    ) -> tuple[str, str]:
        """Generate company and role summaries."""

        prompt = f"""Create concise summaries for a phone screen preparation.

COMPANY: {company}
JOB TITLE: {job_title}
JOB DESCRIPTION: {job_description[:1000] if job_description else 'Not provided'}

Provide:
1. COMPANY SUMMARY (2-3 sentences) - What they do, recent news, why they're interesting
2. ROLE SUMMARY (2-3 sentences) - Key responsibilities, what they're looking for

Be concise and actionable."""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=500,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )

            response = message.content[0].text.strip()

            # Parse response
            parts = response.split("ROLE SUMMARY")
            company_summary = parts[0].replace("COMPANY SUMMARY", "").strip()
            role_summary = parts[1].strip() if len(parts) > 1 else ""

            return company_summary, role_summary

        except Exception as e:
            return f"Company summary unavailable: {e}", f"Role summary unavailable: {e}"

    def _generate_qa_pairs(
        self,
        company: str,
        job_title: str,
        job_description: str,
        resume: str
    ) -> List[Dict[str, str]]:
        """Generate Q&A pairs."""

        prompt = f"""Generate answers to common phone screen questions.

COMPANY: {company}
JOB TITLE: {job_title}
YOUR BACKGROUND: {resume[:1000] if resume else 'Not provided'}

For each question, provide a 30-second answer using STAR method where applicable:

Questions:
1. Tell me about yourself
2. Why are you interested in this role?
3. Why {company}?
4. What are your strengths?
5. Why are you leaving your current role?

Format as:
Q: Question
A: Answer

Keep answers concise and authentic."""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1500,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )

            response = message.content[0].text.strip()

            # Parse Q&A pairs
            pairs = []
            lines = response.split('\n')
            current_q = ""
            current_a = []

            for line in lines:
                if line.startswith("Q:"):
                    # Save previous pair
                    if current_q:
                        pairs.append({
                            "question": current_q,
                            "answer": '\n'.join(current_a).strip()
                        })
                    current_q = line.replace("Q:", "").strip()
                    current_a = []
                elif line.startswith("A:"):
                    current_a.append(line.replace("A:", "").strip())
                elif current_q and line.strip():
                    current_a.append(line.strip())

            # Save last pair
            if current_q:
                pairs.append({
                    "question": current_q,
                    "answer": '\n'.join(current_a).strip()
                })

            return pairs

        except Exception as e:
            return [{"question": "Generation failed", "answer": str(e)}]

    def _generate_talking_points(
        self,
        company: str,
        job_title: str,
        resume: str
    ) -> List[str]:
        """Generate key talking points."""

        prompt = f"""Create 5 key talking points for a phone screen.

COMPANY: {company}
JOB TITLE: {job_title}
YOUR BACKGROUND: {resume[:1000] if resume else 'Not provided'}

List 5 specific achievements or experiences to mention.
Focus on quantifiable impact.

Format as bullet points."""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=500,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )

            response = message.content[0].text.strip()

            # Extract bullet points
            talking_points = []
            for line in response.split('\n'):
                line = line.strip()
                if line.startswith('-') or line.startswith('•') or line.startswith('*'):
                    talking_points.append(line[1:].strip())

            return talking_points

        except Exception as e:
            return [f"Generation failed: {e}"]

    def _generate_questions_to_ask(
        self,
        company: str,
        job_title: str
    ) -> List[str]:
        """Generate questions to ask recruiter."""

        questions = [
            "Can you describe the team structure?",
            "What does success look like in this role in the first 90 days?",
            "What are the biggest challenges facing the team?",
            "How does this role contribute to company goals?",
            "What's the timeline for next steps?",
            f"What do you enjoy most about working at {company}?",
            "Is this a new role or backfill?",
            "What's the on-call/work-life balance like?",
        ]

        return questions

    def _generate_salary_talking_points(
        self,
        salary_min: int,
        salary_max: int
    ) -> str:
        """Generate salary discussion talking points."""

        return f"""SALARY DISCUSSION STRATEGY:

1. DEFER IF POSSIBLE
   "I'd like to learn more about the role and its scope before discussing compensation."

2. IF PRESSED, GIVE RANGE
   "Based on my research and experience, I'm targeting ${salary_min:,} to ${salary_max:,}
   depending on the full compensation package."

3. FOCUS ON TOTAL COMP
   "I'm looking at total compensation including base, bonus, equity, and benefits."

4. DEFLECT CURRENT SALARY
   "I'd prefer to focus on the value I'll bring to this role rather than my current compensation."

5. KNOW YOUR WALK-AWAY
   Minimum acceptable: ${salary_min:,}
   Target: ${salary_max:,}

REMEMBER: First to mention a number often loses. Let them make the first offer if possible."""

    def run_mock_interview(self, prep: PhoneScreenPrep) -> str:
        """Run mock phone screen interview."""

        if not self.client:
            return "AI mock interview requires ANTHROPIC_API_KEY"

        print(f"\n🎤 MOCK PHONE SCREEN - {prep.company}")
        print("="*60)
        print("Type your answers. Type 'next' to move to next question.\n")

        conversation_history = []

        system_prompt = f"""You are a recruiter at {prep.company} conducting a phone screen
for a {prep.job_title} position. Ask common phone screen questions one at a time.
After each answer, provide brief feedback (1-2 sentences), then ask the next question.

Be professional but conversational. After 5 questions, provide overall feedback."""

        question_count = 0
        max_questions = 5

        while question_count < max_questions:
            # Get next question from AI
            conversation_history.append({
                "role": "user",
                "content": "Ask the next phone screen question." if question_count > 0 else "Start the phone screen."
            })

            try:
                message = self.client.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=500,
                    temperature=0.8,
                    system=system_prompt,
                    messages=conversation_history
                )

                recruiter_message = message.content[0].text.strip()
                print(f"\n💼 Recruiter: {recruiter_message}\n")

                conversation_history.append({
                    "role": "assistant",
                    "content": recruiter_message
                })

                # Get user answer
                answer = input("You: ").strip()

                if answer.lower() == 'next':
                    conversation_history.append({
                        "role": "user",
                        "content": "I'd like to move to the next question."
                    })
                else:
                    conversation_history.append({
                        "role": "user",
                        "content": answer
                    })

                question_count += 1

            except Exception as e:
                return f"Mock interview failed: {e}"

        # Get final feedback
        conversation_history.append({
            "role": "user",
            "content": "Please provide overall feedback on my phone screen performance."
        })

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=800,
                temperature=0.7,
                system=system_prompt,
                messages=conversation_history
            )

            feedback = message.content[0].text.strip()
            print(f"\n📊 OVERALL FEEDBACK:\n{feedback}\n")

            prep.mock_interview_completed = True
            prep.mock_interview_feedback = feedback
            self._save_prep(prep)

            return feedback

        except Exception as e:
            return f"Feedback generation failed: {e}"

    def print_prep_sheet(self, prep: PhoneScreenPrep):
        """Print preparation sheet."""

        print("\n" + "="*80)
        print(f"📞 PHONE SCREEN PREPARATION - {prep.company}")
        print("="*80 + "\n")

        print(f"Role: {prep.job_title}")
        print(f"Recruiter: {prep.recruiter_name}")
        print(f"Scheduled: {prep.scheduled_date}")
        print()

        # Company summary
        if prep.company_summary:
            print("🏢 COMPANY SUMMARY:\n")
            print(f"{prep.company_summary}\n")

        # Role summary
        if prep.role_summary:
            print("💼 ROLE SUMMARY:\n")
            print(f"{prep.role_summary}\n")

        # Talking points
        if prep.talking_points:
            print("🎯 KEY TALKING POINTS:\n")
            for i, point in enumerate(prep.talking_points, 1):
                print(f"{i}. {point}")
            print()

        # Q&A
        if prep.qa_pairs:
            print("❓ COMMON QUESTIONS & ANSWERS:\n")
            for qa in prep.qa_pairs:
                print(f"Q: {qa['question']}")
                print(f"A: {qa['answer']}\n")

        # Salary
        if prep.salary_talking_points:
            print("💰 SALARY DISCUSSION:\n")
            print(prep.salary_talking_points)
            print()

        # Questions to ask
        if prep.questions_to_ask:
            print("🤔 QUESTIONS TO ASK:\n")
            for i, question in enumerate(prep.questions_to_ask, 1):
                print(f"{i}. {question}")
            print()

        print("="*80 + "\n")

    def _save_prep(self, prep: PhoneScreenPrep):
        """Save prep to file."""

        filename = f"{prep.company}_{prep.id}.json"
        filepath = self.data_dir / filename

        with open(filepath, 'w') as f:
            json.dump(asdict(prep), f, indent=2)


# CLI
def main():
    """CLI for phone screen prep."""

    import argparse

    parser = argparse.ArgumentParser(description="Phone Screen Preparation Tool")
    parser.add_argument("--company", required=True)
    parser.add_argument("--job-title", required=True)
    parser.add_argument("--recruiter", required=True)
    parser.add_argument("--date", required=True, help="Scheduled date (YYYY-MM-DD)")
    parser.add_argument("--salary-min", type=int, default=0)
    parser.add_argument("--salary-max", type=int, default=0)
    parser.add_argument("--resume", help="Path to resume file")
    parser.add_argument("--job-description", help="Path to job description file")
    parser.add_argument("--mock", action="store_true", help="Run mock interview")

    args = parser.parse_args()

    # Load resume
    resume = ""
    if args.resume:
        with open(args.resume, 'r') as f:
            resume = f.read()

    # Load JD
    job_description = ""
    if args.job_description:
        with open(args.job_description, 'r') as f:
            job_description = f.read()

    # Create prep
    tool = PhoneScreenPrepTool()
    prep = tool.create_prep(
        company=args.company,
        job_title=args.job_title,
        recruiter_name=args.recruiter,
        scheduled_date=args.date,
        salary_min=args.salary_min,
        salary_max=args.salary_max,
        resume=resume,
        job_description=job_description
    )

    # Print prep sheet
    tool.print_prep_sheet(prep)

    # Mock interview
    if args.mock:
        tool.run_mock_interview(prep)

    return 0


if __name__ == "__main__":
    exit(main())
