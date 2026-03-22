#!/usr/bin/env python3
"""
BlackRoad Education Assessment Engine - Quiz & Assessment System
Full-featured quiz system with auto-grading, analytics, and adaptive difficulty.
"""
from __future__ import annotations

import argparse
import json
import sqlite3
import sys
import uuid
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

DB_PATH = Path.home() / ".blackroad" / "education" / "assessment.db"

# ─────────────────────────────────────────────────────────────────────────────
# Dataclasses
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class Question:
    id: str
    text: str
    type: str  # multiple_choice | true_false | short_answer | multi_select
    options: list  # [{"id": "a", "text": "..."}] for MC; [] for short_answer
    correct_answer: str  # "a" for MC, "true"/"false", or answer text
    difficulty: str  # easy | medium | hard
    tags: list = field(default_factory=list)
    explanation: str = ""
    points: int = 1
    created_at: str = field(default_factory=lambda: _now())


@dataclass
class Quiz:
    id: str
    title: str
    description: str
    question_ids: list
    time_limit_mins: int
    passing_score: float  # 0-100
    shuffle_questions: bool = False
    shuffle_options: bool = False
    allow_review: bool = True
    max_attempts: int = 3
    created_at: str = field(default_factory=lambda: _now())


@dataclass
class Attempt:
    id: str
    quiz_id: str
    student_id: str
    answers: dict  # {question_id: answer}
    score: Optional[float]  # 0-100
    started_at: str = field(default_factory=lambda: _now())
    completed_at: Optional[str] = None
    time_taken_mins: Optional[float] = None
    passed: Optional[bool] = None


@dataclass
class QuestionResult:
    question_id: str
    student_answer: str
    correct_answer: str
    is_correct: bool
    points_earned: int
    points_possible: int
    explanation: str = ""


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uid() -> str:
    return str(uuid.uuid4())


def _conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


# ─────────────────────────────────────────────────────────────────────────────
# Database init
# ─────────────────────────────────────────────────────────────────────────────

def init_db() -> None:
    with _conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS questions (
                id             TEXT PRIMARY KEY,
                text           TEXT NOT NULL,
                type           TEXT NOT NULL CHECK(type IN (
                                   'multiple_choice','true_false','short_answer','multi_select')),
                options        TEXT DEFAULT '[]',
                correct_answer TEXT NOT NULL,
                difficulty     TEXT NOT NULL CHECK(difficulty IN ('easy','medium','hard')),
                tags           TEXT DEFAULT '[]',
                explanation    TEXT DEFAULT '',
                points         INTEGER DEFAULT 1,
                created_at     TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS quizzes (
                id                TEXT PRIMARY KEY,
                title             TEXT NOT NULL,
                description       TEXT,
                question_ids      TEXT DEFAULT '[]',
                time_limit_mins   INTEGER DEFAULT 0,
                passing_score     REAL DEFAULT 70.0,
                shuffle_questions INTEGER DEFAULT 0,
                shuffle_options   INTEGER DEFAULT 0,
                allow_review      INTEGER DEFAULT 1,
                max_attempts      INTEGER DEFAULT 3,
                created_at        TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS attempts (
                id              TEXT PRIMARY KEY,
                quiz_id         TEXT NOT NULL REFERENCES quizzes(id),
                student_id      TEXT NOT NULL,
                answers         TEXT DEFAULT '{}',
                score           REAL,
                started_at      TEXT NOT NULL,
                completed_at    TEXT,
                time_taken_mins REAL,
                passed          INTEGER
            );

            CREATE TABLE IF NOT EXISTS question_results (
                id              TEXT PRIMARY KEY,
                attempt_id      TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
                question_id     TEXT NOT NULL REFERENCES questions(id),
                student_answer  TEXT,
                is_correct      INTEGER DEFAULT 0,
                points_earned   INTEGER DEFAULT 0,
                points_possible INTEGER DEFAULT 1
            );

            CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON attempts(quiz_id);
            CREATE INDEX IF NOT EXISTS idx_attempts_student ON attempts(student_id);
            CREATE INDEX IF NOT EXISTS idx_qresults_attempt ON question_results(attempt_id);
        """)


# ─────────────────────────────────────────────────────────────────────────────
# Question operations
# ─────────────────────────────────────────────────────────────────────────────

def create_question(text: str, q_type: str, options: list,
                    correct_answer: str, difficulty: str,
                    tags: list | None = None, explanation: str = "",
                    points: int = 1) -> Question:
    q = Question(
        id=_uid(), text=text, type=q_type, options=options,
        correct_answer=correct_answer, difficulty=difficulty,
        tags=tags or [], explanation=explanation, points=points
    )
    with _conn() as conn:
        conn.execute(
            "INSERT INTO questions VALUES (?,?,?,?,?,?,?,?,?,?)",
            (q.id, q.text, q.type, json.dumps(q.options), q.correct_answer,
             q.difficulty, json.dumps(q.tags), q.explanation, q.points, q.created_at)
        )
    return q


def get_question(question_id: str) -> Optional[Question]:
    with _conn() as conn:
        row = conn.execute("SELECT * FROM questions WHERE id=?", (question_id,)).fetchone()
        if not row:
            return None
        d = dict(row)
        d["options"] = json.loads(d["options"])
        d["tags"] = json.loads(d["tags"])
        return Question(**d)


def list_questions(tags: list | None = None, difficulty: str | None = None) -> list[Question]:
    with _conn() as conn:
        q = "SELECT * FROM questions WHERE 1=1"
        params = []
        if difficulty:
            q += " AND difficulty=?"
            params.append(difficulty)
        rows = conn.execute(q, params).fetchall()
        questions = []
        for row in rows:
            d = dict(row)
            d["options"] = json.loads(d["options"])
            d["tags"] = json.loads(d["tags"])
            qobj = Question(**d)
            if tags:
                if any(t in qobj.tags for t in tags):
                    questions.append(qobj)
            else:
                questions.append(qobj)
        return questions


# ─────────────────────────────────────────────────────────────────────────────
# Quiz operations
# ─────────────────────────────────────────────────────────────────────────────

def create_quiz(title: str, description: str, question_ids: list,
                time_limit_mins: int, passing_score: float,
                shuffle_questions: bool = False, max_attempts: int = 3) -> Quiz:
    quiz = Quiz(
        id=_uid(), title=title, description=description,
        question_ids=question_ids, time_limit_mins=time_limit_mins,
        passing_score=passing_score, shuffle_questions=shuffle_questions,
        max_attempts=max_attempts
    )
    with _conn() as conn:
        conn.execute(
            "INSERT INTO quizzes VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            (quiz.id, quiz.title, quiz.description, json.dumps(quiz.question_ids),
             quiz.time_limit_mins, quiz.passing_score,
             int(quiz.shuffle_questions), int(quiz.shuffle_options),
             int(quiz.allow_review), quiz.max_attempts, quiz.created_at)
        )
    return quiz


def get_quiz(quiz_id: str) -> Optional[Quiz]:
    with _conn() as conn:
        row = conn.execute("SELECT * FROM quizzes WHERE id=?", (quiz_id,)).fetchone()
        if not row:
            return None
        d = dict(row)
        d["question_ids"] = json.loads(d["question_ids"])
        d["shuffle_questions"] = bool(d["shuffle_questions"])
        d["shuffle_options"] = bool(d["shuffle_options"])
        d["allow_review"] = bool(d["allow_review"])
        return Quiz(**d)


def get_quiz_questions(quiz_id: str) -> list[Question]:
    quiz = get_quiz(quiz_id)
    if not quiz:
        return []
    questions = []
    for qid in quiz.question_ids:
        q = get_question(qid)
        if q:
            questions.append(q)
    return questions


# ─────────────────────────────────────────────────────────────────────────────
# Attempt lifecycle
# ─────────────────────────────────────────────────────────────────────────────

def start_attempt(quiz_id: str, student_id: str) -> Attempt | dict:
    """Start a new quiz attempt. Enforces max_attempts."""
    quiz = get_quiz(quiz_id)
    if not quiz:
        return {"error": f"Quiz {quiz_id} not found"}
    with _conn() as conn:
        prev_attempts = conn.execute(
            "SELECT COUNT(*) FROM attempts WHERE quiz_id=? AND student_id=?",
            (quiz_id, student_id)
        ).fetchone()[0]
        if prev_attempts >= quiz.max_attempts:
            return {"error": f"Max attempts ({quiz.max_attempts}) reached for this quiz"}
        attempt = Attempt(id=_uid(), quiz_id=quiz_id, student_id=student_id, answers={}, score=None)
        conn.execute(
            "INSERT INTO attempts VALUES (?,?,?,?,?,?,?,?,?)",
            (attempt.id, attempt.quiz_id, attempt.student_id,
             json.dumps(attempt.answers), attempt.score,
             attempt.started_at, attempt.completed_at,
             attempt.time_taken_mins, attempt.passed)
        )
    return attempt


def submit_answer(attempt_id: str, question_id: str, answer: str) -> dict:
    """Submit (or update) an answer for a question in an attempt."""
    with _conn() as conn:
        row = conn.execute(
            "SELECT completed_at, answers FROM attempts WHERE id=?", (attempt_id,)
        ).fetchone()
        if not row:
            return {"error": "Attempt not found"}
        if row["completed_at"]:
            return {"error": "Attempt already completed"}
        answers = json.loads(row["answers"])
        answers[question_id] = answer
        conn.execute(
            "UPDATE attempts SET answers=? WHERE id=?",
            (json.dumps(answers), attempt_id)
        )
    return {"attempt_id": attempt_id, "question_id": question_id, "answer": answer, "saved": True}


def complete_attempt(attempt_id: str) -> dict:
    """Complete an attempt and auto-grade it."""
    with _conn() as conn:
        row = conn.execute("SELECT * FROM attempts WHERE id=?", (attempt_id,)).fetchone()
        if not row:
            return {"error": "Attempt not found"}
        if row["completed_at"]:
            return {"error": "Attempt already completed"}
        attempt_data = dict(row)
        attempt_data["answers"] = json.loads(attempt_data["answers"])

        started = datetime.fromisoformat(attempt_data["started_at"])
        now_dt = datetime.now(timezone.utc)
        time_taken = (now_dt - started).total_seconds() / 60

        # Grade
        grade_result = grade_attempt_dict(attempt_data)
        score = grade_result["score"]
        quiz = get_quiz(attempt_data["quiz_id"])
        passed = score >= quiz.passing_score if quiz else False

        completed_at = _now()
        conn.execute("""
            UPDATE attempts SET completed_at=?, score=?, time_taken_mins=?, passed=?
            WHERE id=?
        """, (completed_at, score, round(time_taken, 2), int(passed), attempt_id))

        # Store per-question results
        for qr in grade_result["results"]:
            conn.execute(
                "INSERT OR REPLACE INTO question_results VALUES (?,?,?,?,?,?,?)",
                (_uid(), attempt_id, qr["question_id"], qr["student_answer"],
                 int(qr["is_correct"]), qr["points_earned"], qr["points_possible"])
            )

        return {
            "attempt_id": attempt_id,
            "score": score,
            "passed": passed,
            "time_taken_mins": round(time_taken, 2),
            "correct": grade_result["correct"],
            "total": grade_result["total"],
            "results": grade_result["results"]
        }


def grade_attempt_dict(attempt_data: dict) -> dict:
    """Auto-grade multiple choice and true/false questions."""
    answers = attempt_data["answers"]
    quiz_id = attempt_data["quiz_id"]
    questions = get_quiz_questions(quiz_id)

    total_points = 0
    earned_points = 0
    correct_count = 0
    results = []

    for q in questions:
        student_answer = answers.get(q.id, "").strip().lower()
        correct = q.correct_answer.strip().lower()
        is_correct = False

        if q.type in ("multiple_choice", "true_false"):
            is_correct = student_answer == correct
        elif q.type == "multi_select":
            # Compare sorted lists
            student_set = set(a.strip() for a in student_answer.split(",") if a.strip())
            correct_set = set(a.strip() for a in correct.split(",") if a.strip())
            is_correct = student_set == correct_set
        elif q.type == "short_answer":
            # Fuzzy: contains the key answer
            is_correct = correct in student_answer or student_answer == correct

        pts = q.points if is_correct else 0
        total_points += q.points
        earned_points += pts
        if is_correct:
            correct_count += 1

        results.append({
            "question_id": q.id,
            "question_text": q.text[:60],
            "student_answer": student_answer,
            "correct_answer": q.correct_answer,
            "is_correct": is_correct,
            "points_earned": pts,
            "points_possible": q.points,
            "explanation": q.explanation
        })

    score = round(earned_points / total_points * 100, 2) if total_points > 0 else 0.0
    return {
        "score": score,
        "correct": correct_count,
        "total": len(questions),
        "earned_points": earned_points,
        "total_points": total_points,
        "results": results
    }


def get_attempt(attempt_id: str) -> Optional[dict]:
    with _conn() as conn:
        row = conn.execute("SELECT * FROM attempts WHERE id=?", (attempt_id,)).fetchone()
        if not row:
            return None
        d = dict(row)
        d["answers"] = json.loads(d["answers"])
        d["passed"] = bool(d["passed"]) if d["passed"] is not None else None
        return d


# ─────────────────────────────────────────────────────────────────────────────
# Analytics
# ─────────────────────────────────────────────────────────────────────────────

def get_analytics(quiz_id: str) -> dict:
    """Get comprehensive analytics for a quiz."""
    with _conn() as conn:
        quiz = get_quiz(quiz_id)
        if not quiz:
            return {"error": f"Quiz {quiz_id} not found"}

        attempts = conn.execute(
            "SELECT * FROM attempts WHERE quiz_id=? AND completed_at IS NOT NULL",
            (quiz_id,)
        ).fetchall()

        if not attempts:
            return {
                "quiz_id": quiz_id,
                "title": quiz.title,
                "total_attempts": 0,
                "unique_students": 0,
                "avg_score": None,
                "pass_rate": None,
                "question_stats": []
            }

        scores = [a["score"] for a in attempts if a["score"] is not None]
        passed = [a for a in attempts if a["passed"]]
        unique_students = len({a["student_id"] for a in attempts})

        # Per-question stats
        question_stats = []
        for qid in quiz.question_ids:
            q = get_question(qid)
            if not q:
                continue
            q_results = conn.execute("""
                SELECT is_correct, COUNT(*) as cnt
                FROM question_results
                WHERE question_id=?
                  AND attempt_id IN (SELECT id FROM attempts WHERE quiz_id=? AND completed_at IS NOT NULL)
                GROUP BY is_correct
            """, (qid, quiz_id)).fetchall()
            correct_n = next((r["cnt"] for r in q_results if r["is_correct"]), 0)
            total_n = sum(r["cnt"] for r in q_results)
            question_stats.append({
                "question_id": qid,
                "question_text": q.text[:80],
                "difficulty": q.difficulty,
                "correct_rate": round(correct_n / total_n * 100, 1) if total_n > 0 else None,
                "total_answers": total_n
            })

        # Sort by correct_rate ascending (hardest first)
        question_stats.sort(key=lambda x: (x["correct_rate"] or 100))

        avg_time = None
        times = [a["time_taken_mins"] for a in attempts if a["time_taken_mins"] is not None]
        if times:
            avg_time = round(sum(times) / len(times), 2)

        return {
            "quiz_id": quiz_id,
            "title": quiz.title,
            "total_attempts": len(attempts),
            "unique_students": unique_students,
            "avg_score": round(sum(scores) / len(scores), 2) if scores else None,
            "min_score": min(scores) if scores else None,
            "max_score": max(scores) if scores else None,
            "pass_rate": round(len(passed) / len(attempts) * 100, 1),
            "avg_time_mins": avg_time,
            "passing_score": quiz.passing_score,
            "hardest_questions": question_stats[:3],
            "easiest_questions": list(reversed(question_stats[-3:])),
            "question_stats": question_stats
        }


def get_student_analytics(student_id: str) -> dict:
    """Analytics for a specific student across all quizzes."""
    with _conn() as conn:
        attempts = conn.execute(
            "SELECT * FROM attempts WHERE student_id=? AND completed_at IS NOT NULL",
            (student_id,)
        ).fetchall()
        if not attempts:
            return {"student_id": student_id, "total_attempts": 0}

        scores = [a["score"] for a in attempts if a["score"] is not None]
        passed = sum(1 for a in attempts if a["passed"])
        quizzes_taken = {a["quiz_id"] for a in attempts}

        # Strength/weakness by question difficulty
        easy_correct = intermediate_correct = hard_correct = 0
        easy_total = intermediate_total = hard_total = 0
        for attempt in attempts:
            results = conn.execute(
                "SELECT qr.*, q.difficulty FROM question_results qr JOIN questions q ON qr.question_id=q.id WHERE qr.attempt_id=?",
                (attempt["id"],)
            ).fetchall()
            for r in results:
                d = r["difficulty"]
                if d == "easy":
                    easy_total += 1
                    easy_correct += r["is_correct"]
                elif d == "medium":
                    intermediate_total += 1
                    intermediate_correct += r["is_correct"]
                elif d == "hard":
                    hard_total += 1
                    hard_correct += r["is_correct"]

        def pct(c, t):
            return round(c / t * 100, 1) if t > 0 else None

        return {
            "student_id": student_id,
            "total_attempts": len(attempts),
            "unique_quizzes": len(quizzes_taken),
            "avg_score": round(sum(scores) / len(scores), 2) if scores else None,
            "pass_rate": round(passed / len(attempts) * 100, 1),
            "performance_by_difficulty": {
                "easy": {"correct_rate": pct(easy_correct, easy_total), "total": easy_total},
                "medium": {"correct_rate": pct(intermediate_correct, intermediate_total), "total": intermediate_total},
                "hard": {"correct_rate": pct(hard_correct, hard_total), "total": hard_total}
            }
        }


def build_adaptive_quiz(student_id: str, topic_tags: list,
                        target_difficulty: str = "medium",
                        num_questions: int = 10) -> Quiz | dict:
    """Build an adaptive quiz based on student weaknesses."""
    with _conn() as conn:
        # Find questions the student hasn't answered correctly
        answered_correctly = {
            r[0] for r in conn.execute("""
                SELECT DISTINCT qr.question_id FROM question_results qr
                JOIN attempts a ON qr.attempt_id = a.id
                WHERE a.student_id=? AND qr.is_correct=1
            """, (student_id,)).fetchall()
        }

        all_qs = list_questions(tags=topic_tags, difficulty=target_difficulty)
        candidates = [q for q in all_qs if q.id not in answered_correctly]

        # Fall back to any difficulty
        if len(candidates) < num_questions:
            all_qs_any = list_questions(tags=topic_tags)
            candidates = [q for q in all_qs_any if q.id not in answered_correctly]

        if not candidates:
            return {"error": "No questions available for adaptive quiz"}

        selected = candidates[:num_questions]
        quiz = create_quiz(
            title=f"Adaptive Quiz – {', '.join(topic_tags[:3])}",
            description=f"Auto-generated adaptive quiz for student {student_id}",
            question_ids=[q.id for q in selected],
            time_limit_mins=len(selected) * 3,
            passing_score=70.0
        )
        return quiz


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

def _print_json(obj) -> None:
    if hasattr(obj, "__dataclass_fields__"):
        print(json.dumps(asdict(obj), indent=2))
    else:
        print(json.dumps(obj, indent=2))


def cli_main() -> None:
    parser = argparse.ArgumentParser(
        description="BlackRoad Education Assessment Engine",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  assessment.py create-question "What is 2+2?" multiple_choice '{"a":"3","b":"4","c":"5"}' b easy --tags math
  assessment.py create-quiz "Math Test" "Basic math" <q1_id>,<q2_id> 30 70
  assessment.py start-attempt <quiz_id> student-123
  assessment.py submit-answer <attempt_id> <question_id> b
  assessment.py complete-attempt <attempt_id>
  assessment.py analytics <quiz_id>
  assessment.py student-analytics student-123
        """
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    # create-question
    p = sub.add_parser("create-question")
    p.add_argument("text")
    p.add_argument("type", choices=["multiple_choice", "true_false", "short_answer", "multi_select"])
    p.add_argument("options", help="JSON string of options list")
    p.add_argument("correct_answer")
    p.add_argument("difficulty", choices=["easy", "medium", "hard"])
    p.add_argument("--tags", default="")
    p.add_argument("--explanation", default="")
    p.add_argument("--points", type=int, default=1)

    # list-questions
    p = sub.add_parser("list-questions")
    p.add_argument("--difficulty", choices=["easy", "medium", "hard"])
    p.add_argument("--tags", default="")

    # create-quiz
    p = sub.add_parser("create-quiz")
    p.add_argument("title")
    p.add_argument("description")
    p.add_argument("question_ids", help="Comma-separated question IDs")
    p.add_argument("time_limit_mins", type=int)
    p.add_argument("passing_score", type=float)
    p.add_argument("--shuffle", action="store_true")
    p.add_argument("--max-attempts", type=int, default=3)

    # start-attempt
    p = sub.add_parser("start-attempt")
    p.add_argument("quiz_id")
    p.add_argument("student_id")

    # submit-answer
    p = sub.add_parser("submit-answer")
    p.add_argument("attempt_id")
    p.add_argument("question_id")
    p.add_argument("answer")

    # complete-attempt
    p = sub.add_parser("complete-attempt")
    p.add_argument("attempt_id")

    # get-attempt
    p = sub.add_parser("get-attempt")
    p.add_argument("attempt_id")

    # analytics
    p = sub.add_parser("analytics")
    p.add_argument("quiz_id")

    # student-analytics
    p = sub.add_parser("student-analytics")
    p.add_argument("student_id")

    # adaptive-quiz
    p = sub.add_parser("adaptive-quiz")
    p.add_argument("student_id")
    p.add_argument("tags", help="Comma-separated topic tags")
    p.add_argument("--difficulty", default="medium", choices=["easy", "medium", "hard"])
    p.add_argument("--num-questions", type=int, default=10)

    args = parser.parse_args()
    init_db()

    if args.cmd == "create-question":
        try:
            options = json.loads(args.options)
        except json.JSONDecodeError:
            options = []
        tags = [t.strip() for t in args.tags.split(",") if t.strip()]
        _print_json(create_question(args.text, args.type, options, args.correct_answer,
                                    args.difficulty, tags, args.explanation, args.points))
    elif args.cmd == "list-questions":
        tags = [t.strip() for t in args.tags.split(",") if t.strip()] if args.tags else None
        qs = list_questions(tags=tags, difficulty=args.difficulty)
        _print_json([asdict(q) for q in qs])
    elif args.cmd == "create-quiz":
        qids = [q.strip() for q in args.question_ids.split(",") if q.strip()]
        _print_json(create_quiz(args.title, args.description, qids,
                                args.time_limit_mins, args.passing_score,
                                args.shuffle, args.max_attempts))
    elif args.cmd == "start-attempt":
        _print_json(start_attempt(args.quiz_id, args.student_id))
    elif args.cmd == "submit-answer":
        _print_json(submit_answer(args.attempt_id, args.question_id, args.answer))
    elif args.cmd == "complete-attempt":
        _print_json(complete_attempt(args.attempt_id))
    elif args.cmd == "get-attempt":
        result = get_attempt(args.attempt_id)
        _print_json(result or {"error": "Attempt not found"})
    elif args.cmd == "analytics":
        _print_json(get_analytics(args.quiz_id))
    elif args.cmd == "student-analytics":
        _print_json(get_student_analytics(args.student_id))
    elif args.cmd == "adaptive-quiz":
        tags = [t.strip() for t in args.tags.split(",") if t.strip()]
        _print_json(build_adaptive_quiz(args.student_id, tags, args.difficulty, args.num_questions))


if __name__ == "__main__":
    cli_main()
