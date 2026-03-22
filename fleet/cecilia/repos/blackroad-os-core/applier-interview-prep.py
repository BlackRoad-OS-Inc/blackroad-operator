#!/usr/bin/env python3
"""
AI Interview Prep System - Mock Interviews & Question Prediction

Features:
- Predicts interview questions from job description
- AI-powered mock interviews with Claude
- Company-specific preparation
- Behavioral question practice (STAR method)
- Technical interview prep
- Real-time feedback and coaching
- Performance tracking
"""

import os
import json
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from enum import Enum

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    print("⚠️  Install anthropic: pip install anthropic")


class QuestionType(Enum):
    """Interview question types."""
    BEHAVIORAL = "behavioral"
    TECHNICAL = "technical"
    SITUATIONAL = "situational"
    COMPANY_SPECIFIC = "company_specific"
    LEADERSHIP = "leadership"
    PROBLEM_SOLVING = "problem_solving"


@dataclass
class InterviewQuestion:
    """Interview question with metadata."""
    question: str
    type: QuestionType
    difficulty: str  # easy, medium, hard
    topic: str
    suggested_approach: str
    example_answer: Optional[str] = None


@dataclass
class MockInterviewSession:
    """Mock interview session."""
    company: str
    job_title: str
    questions: List[InterviewQuestion]
    user_answers: Dict[int, str]  # question_index -> answer
    feedback: Dict[int, str]  # question_index -> feedback
    score: Optional[float] = None
    duration_minutes: Optional[int] = None
    session_id: str = ""
    created_at: str = ""


class AIInterviewPrep:
    """AI-powered interview preparation."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize interview prep."""
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")

        if not ANTHROPIC_AVAILABLE:
            raise ImportError("anthropic package not installed")

        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.cache_dir = Path.home() / ".applier" / "interviews"
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def predict_questions(
        self,
        job_title: str,
        company: str,
        job_description: str,
        resume: str,
        num_questions: int = 10
    ) -> List[InterviewQuestion]:
        """
        Predict likely interview questions.

        Args:
            job_title: Job title
            company: Company name
            job_description: Full job description
            resume: Your resume
            num_questions: Number of questions to generate

        Returns:
            List of predicted interview questions
        """
        prompt = f"""You are an expert interviewer and career coach. Predict the most likely interview questions for this job.

JOB DETAILS:
Position: {job_title}
Company: {company}

JOB DESCRIPTION:
{job_description}

CANDIDATE'S RESUME:
{resume}

TASK:
Generate {num_questions} highly relevant interview questions that are likely to be asked. Include a mix of:
- Behavioral questions (STAR method)
- Technical questions specific to the role
- Company/culture fit questions
- Problem-solving scenarios

For each question, provide:
1. The question text
2. Type (behavioral, technical, situational, etc.)
3. Difficulty (easy, medium, hard)
4. Topic/focus area
5. Suggested approach to answering

Format as JSON array:
[
  {{
    "question": "Tell me about a time when...",
    "type": "behavioral",
    "difficulty": "medium",
    "topic": "teamwork",
    "suggested_approach": "Use STAR method: Situation, Task, Action, Result"
  }},
  ...
]

Return ONLY the JSON array, no other text."""

        response = self._call_claude(prompt)

        # Parse JSON
        try:
            questions_data = json.loads(response)
            questions = []

            for q in questions_data:
                question = InterviewQuestion(
                    question=q["question"],
                    type=QuestionType(q["type"]),
                    difficulty=q["difficulty"],
                    topic=q["topic"],
                    suggested_approach=q["suggested_approach"]
                )
                questions.append(question)

            return questions

        except json.JSONDecodeError:
            # Fallback: extract questions manually
            return self._extract_questions_from_text(response)

    def start_mock_interview(
        self,
        company: str,
        job_title: str,
        questions: List[InterviewQuestion]
    ) -> MockInterviewSession:
        """Start a mock interview session."""
        session = MockInterviewSession(
            company=company,
            job_title=job_title,
            questions=questions,
            user_answers={},
            feedback={},
            session_id=datetime.now().strftime("%Y%m%d_%H%M%S"),
            created_at=datetime.now().isoformat()
        )

        return session

    def get_question_feedback(
        self,
        question: InterviewQuestion,
        user_answer: str,
        job_context: str = ""
    ) -> Tuple[str, float]:
        """
        Get AI feedback on interview answer.

        Returns:
            Tuple of (feedback_text, score_0_to_10)
        """
        prompt = f"""You are an expert interview coach. Evaluate this interview answer.

QUESTION:
{question.question}

Question Type: {question.type.value}
Suggested Approach: {question.suggested_approach}

CANDIDATE'S ANSWER:
{user_answer}

{f"JOB CONTEXT: {job_context}" if job_context else ""}

TASK:
1. Evaluate the answer on a scale of 0-10
2. Provide constructive feedback covering:
   - What they did well
   - What could be improved
   - Specific suggestions for enhancement
   - Whether they followed best practices (e.g., STAR method for behavioral)

Format:
SCORE: [0-10]

FEEDBACK:
[Your detailed feedback]

Be encouraging but honest. Focus on actionable improvements."""

        response = self._call_claude(prompt)

        # Extract score
        score_match = re.search(r'SCORE:\s*(\d+(?:\.\d+)?)', response)
        score = float(score_match.group(1)) if score_match else 5.0

        # Extract feedback
        feedback_match = re.search(r'FEEDBACK:\s*(.+)', response, re.DOTALL)
        feedback = feedback_match.group(1).strip() if feedback_match else response

        return feedback, score

    def generate_star_answer(
        self,
        question: str,
        resume: str,
        topic_hint: str = ""
    ) -> str:
        """Generate a STAR-format answer example."""
        prompt = f"""You are a career coach helping someone prepare for interviews.

QUESTION:
{question}

CANDIDATE'S BACKGROUND:
{resume}

{f"TOPIC FOCUS: {topic_hint}" if topic_hint else ""}

TASK:
Generate an example answer using the STAR method:
- Situation: Set the context
- Task: Explain the challenge/goal
- Action: Describe what you did
- Result: Share the outcome with metrics if possible

Make it specific, concise (2-3 minutes spoken), and based on the candidate's actual experience from their resume.

Write the answer now:"""

        response = self._call_claude(prompt)
        return response.strip()

    def get_company_specific_prep(
        self,
        company: str,
        job_title: str,
        company_research: str = ""
    ) -> Dict[str, List[str]]:
        """Get company-specific interview prep."""
        prompt = f"""You are an interview coach specializing in {company}.

POSITION: {job_title}

{f"COMPANY RESEARCH:{chr(10)}{company_research}" if company_research else ""}

TASK:
Provide company-specific interview preparation covering:

1. Company values and culture - What does {company} value most?
2. Common interview formats - What to expect in the process
3. Key talking points - Topics likely to come up
4. Questions to ask them - Smart questions to show interest
5. Red flags to avoid - Things that hurt candidates

Format as JSON:
{{
  "values_culture": ["value 1", "value 2", ...],
  "interview_format": ["step 1", "step 2", ...],
  "key_topics": ["topic 1", "topic 2", ...],
  "questions_to_ask": ["question 1", "question 2", ...],
  "red_flags": ["flag 1", "flag 2", ...]
}}

Return ONLY the JSON."""

        response = self._call_claude(prompt)

        try:
            return json.loads(response)
        except:
            return {
                "values_culture": [],
                "interview_format": [],
                "key_topics": [],
                "questions_to_ask": [],
                "red_flags": []
            }

    def _call_claude(self, prompt: str, max_tokens: int = 3000) -> str:
        """Call Claude API."""
        message = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=max_tokens,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}]
        )

        return message.content[0].text.strip()

    def _extract_questions_from_text(self, text: str) -> List[InterviewQuestion]:
        """Fallback: extract questions from text."""
        questions = []

        # Look for numbered questions
        pattern = r'\d+\.\s*(.+?)(?=\n\d+\.|\Z)'
        matches = re.finditer(pattern, text, re.DOTALL)

        for match in matches:
            question_text = match.group(1).strip()

            # Determine type
            if "tell me about a time" in question_text.lower():
                qtype = QuestionType.BEHAVIORAL
            elif "how would you" in question_text.lower():
                qtype = QuestionType.SITUATIONAL
            elif any(word in question_text.lower() for word in ["implement", "design", "code", "algorithm"]):
                qtype = QuestionType.TECHNICAL
            else:
                qtype = QuestionType.COMPANY_SPECIFIC

            question = InterviewQuestion(
                question=question_text,
                type=qtype,
                difficulty="medium",
                topic="general",
                suggested_approach="Use clear examples and be specific"
            )

            questions.append(question)

        return questions[:10]

    def save_session(self, session: MockInterviewSession):
        """Save interview session."""
        filename = f"session_{session.session_id}.json"
        filepath = self.cache_dir / filename

        with open(filepath, 'w') as f:
            json.dump(asdict(session), f, indent=2, default=str)


# Interactive CLI
def run_interactive_interview():
    """Run interactive mock interview."""
    print("\n" + "="*60)
    print("🎤 AI MOCK INTERVIEW SESSION")
    print("="*60 + "\n")

    # Load config
    config_path = Path.home() / ".applier" / "config.json"
    if not config_path.exists():
        print("❌ Run setup first: ./applier-real setup")
        return 1

    with open(config_path, 'r') as f:
        config = json.load(f)

    # Load resume
    resume_path = Path.home() / ".applier" / "resume.txt"
    if not resume_path.exists():
        print("❌ Resume not found")
        return 1

    with open(resume_path, 'r') as f:
        resume = f.read()

    # Get job details
    company = input("Company name: ").strip()
    job_title = input("Job title: ").strip()

    print("\nPaste job description (press Ctrl+D when done):")
    job_description_lines = []
    try:
        while True:
            line = input()
            job_description_lines.append(line)
    except EOFError:
        pass

    job_description = "\n".join(job_description_lines)

    # Initialize prep
    try:
        prep = AIInterviewPrep()
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

    # Predict questions
    print("\n🔮 Predicting interview questions...")
    questions = prep.predict_questions(
        job_title=job_title,
        company=company,
        job_description=job_description,
        resume=resume,
        num_questions=10
    )

    print(f"\n✅ Generated {len(questions)} questions\n")

    # Start session
    session = prep.start_mock_interview(company, job_title, questions)

    # Interview loop
    for i, question in enumerate(questions, 1):
        print("\n" + "─"*60)
        print(f"QUESTION {i}/{len(questions)}")
        print("─"*60)
        print(f"\n{question.question}\n")
        print(f"Type: {question.type.value} | Difficulty: {question.difficulty}")
        print(f"💡 Tip: {question.suggested_approach}\n")

        print("Your answer (type 'skip' to skip, 'quit' to end):")
        answer_lines = []
        try:
            while True:
                line = input()
                if line.strip().lower() == 'skip':
                    break
                if line.strip().lower() == 'quit':
                    print("\n👋 Interview ended early")
                    return 0
                if line.strip() == "":
                    break
                answer_lines.append(line)
        except EOFError:
            pass

        answer = "\n".join(answer_lines)

        if not answer or answer.lower() == 'skip':
            print("⏭️  Skipped")
            continue

        # Store answer
        session.user_answers[i-1] = answer

        # Get feedback
        print("\n⏳ Getting AI feedback...")
        feedback, score = prep.get_question_feedback(
            question=question,
            user_answer=answer,
            job_context=f"{job_title} at {company}"
        )

        session.feedback[i-1] = feedback

        print(f"\n📊 SCORE: {score}/10\n")
        print("FEEDBACK:")
        print(feedback)
        print("\n")

    # Calculate overall score
    scores = []
    for idx, feedback_text in session.feedback.items():
        match = re.search(r'(\d+(?:\.\d+)?)/10', feedback_text)
        if match:
            scores.append(float(match.group(1)))

    if scores:
        session.score = sum(scores) / len(scores)

    # Save session
    prep.save_session(session)

    # Summary
    print("\n" + "="*60)
    print("📊 INTERVIEW SUMMARY")
    print("="*60)
    print(f"Company: {company}")
    print(f"Position: {job_title}")
    print(f"Questions Answered: {len(session.user_answers)}/{len(questions)}")
    if session.score:
        print(f"Overall Score: {session.score:.1f}/10")
    print(f"\n💾 Session saved: {session.session_id}")
    print("="*60 + "\n")

    return 0


if __name__ == "__main__":
    exit(run_interactive_interview())
