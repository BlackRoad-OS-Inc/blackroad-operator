#!/usr/bin/env python3
"""
BlackRoad Education LMS - Learning Management System
Full-featured LMS with courses, modules, lessons, enrollments, and certificates.
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

DB_PATH = Path.home() / ".blackroad" / "education" / "lms.db"

# ─────────────────────────────────────────────────────────────────────────────
# Dataclasses
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class Lesson:
    id: str
    module_id: str
    title: str
    content: str
    type: str  # video | text | quiz | lab
    duration_mins: int
    order: int = 0
    created_at: str = field(default_factory=lambda: _now())


@dataclass
class Module:
    id: str
    course_id: str
    title: str
    description: str
    order: int = 0
    lessons: list = field(default_factory=list)
    created_at: str = field(default_factory=lambda: _now())


@dataclass
class Course:
    id: str
    title: str
    description: str
    instructor: str
    difficulty: str  # beginner | intermediate | advanced
    tags: list = field(default_factory=list)
    modules: list = field(default_factory=list)
    duration_mins: int = 0
    published: bool = False
    created_at: str = field(default_factory=lambda: _now())


@dataclass
class Enrollment:
    id: str
    student_id: str
    course_id: str
    progress_pct: float = 0.0
    started_at: str = field(default_factory=lambda: _now())
    completed_at: Optional[str] = None
    certificate_id: Optional[str] = None


@dataclass
class LessonCompletion:
    id: str
    enrollment_id: str
    lesson_id: str
    completed_at: str = field(default_factory=lambda: _now())
    time_spent_mins: int = 0


@dataclass
class Certificate:
    id: str
    enrollment_id: str
    student_id: str
    course_id: str
    course_title: str
    instructor: str
    issued_at: str = field(default_factory=lambda: _now())
    verification_code: str = field(default_factory=lambda: uuid.uuid4().hex[:12].upper())


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
            CREATE TABLE IF NOT EXISTS courses (
                id          TEXT PRIMARY KEY,
                title       TEXT NOT NULL,
                description TEXT,
                instructor  TEXT NOT NULL,
                difficulty  TEXT NOT NULL CHECK(difficulty IN ('beginner','intermediate','advanced')),
                tags        TEXT DEFAULT '[]',
                duration_mins INTEGER DEFAULT 0,
                published   INTEGER DEFAULT 0,
                created_at  TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS modules (
                id          TEXT PRIMARY KEY,
                course_id   TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                title       TEXT NOT NULL,
                description TEXT,
                ord         INTEGER DEFAULT 0,
                created_at  TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS lessons (
                id            TEXT PRIMARY KEY,
                module_id     TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
                title         TEXT NOT NULL,
                content       TEXT,
                type          TEXT NOT NULL CHECK(type IN ('video','text','quiz','lab')),
                duration_mins INTEGER DEFAULT 0,
                ord           INTEGER DEFAULT 0,
                created_at    TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS enrollments (
                id            TEXT PRIMARY KEY,
                student_id    TEXT NOT NULL,
                course_id     TEXT NOT NULL REFERENCES courses(id),
                progress_pct  REAL DEFAULT 0.0,
                started_at    TEXT NOT NULL,
                completed_at  TEXT,
                certificate_id TEXT,
                UNIQUE(student_id, course_id)
            );

            CREATE TABLE IF NOT EXISTS lesson_completions (
                id              TEXT PRIMARY KEY,
                enrollment_id   TEXT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
                lesson_id       TEXT NOT NULL REFERENCES lessons(id),
                completed_at    TEXT NOT NULL,
                time_spent_mins INTEGER DEFAULT 0,
                UNIQUE(enrollment_id, lesson_id)
            );

            CREATE TABLE IF NOT EXISTS certificates (
                id                TEXT PRIMARY KEY,
                enrollment_id     TEXT NOT NULL UNIQUE,
                student_id        TEXT NOT NULL,
                course_id         TEXT NOT NULL,
                course_title      TEXT NOT NULL,
                instructor        TEXT NOT NULL,
                issued_at         TEXT NOT NULL,
                verification_code TEXT NOT NULL UNIQUE
            );

            CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
            CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
            CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
            CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
        """)


# ─────────────────────────────────────────────────────────────────────────────
# Course operations
# ─────────────────────────────────────────────────────────────────────────────

def create_course(title: str, description: str, instructor: str,
                  difficulty: str, tags: list | None = None) -> Course:
    course = Course(
        id=_uid(), title=title, description=description,
        instructor=instructor, difficulty=difficulty,
        tags=tags or []
    )
    with _conn() as conn:
        conn.execute(
            "INSERT INTO courses VALUES (?,?,?,?,?,?,?,?,?)",
            (course.id, course.title, course.description, course.instructor,
             course.difficulty, json.dumps(course.tags),
             course.duration_mins, int(course.published), course.created_at)
        )
    return course


def add_module(course_id: str, title: str, description: str = "",
               order: int = 0) -> Module:
    module = Module(id=_uid(), course_id=course_id, title=title,
                    description=description, order=order)
    with _conn() as conn:
        conn.execute(
            "INSERT INTO modules VALUES (?,?,?,?,?,?)",
            (module.id, module.course_id, module.title,
             module.description, module.order, module.created_at)
        )
    return module


def add_lesson(module_id: str, title: str, content: str,
               lesson_type: str, duration_mins: int, order: int = 0) -> Lesson:
    lesson = Lesson(id=_uid(), module_id=module_id, title=title,
                    content=content, type=lesson_type,
                    duration_mins=duration_mins, order=order)
    with _conn() as conn:
        conn.execute(
            "INSERT INTO lessons VALUES (?,?,?,?,?,?,?,?)",
            (lesson.id, lesson.module_id, lesson.title, lesson.content,
             lesson.type, lesson.duration_mins, lesson.order, lesson.created_at)
        )
        # Update course total duration
        conn.execute("""
            UPDATE courses SET duration_mins = (
                SELECT COALESCE(SUM(l.duration_mins), 0)
                FROM lessons l JOIN modules m ON l.module_id = m.id
                WHERE m.course_id = (SELECT course_id FROM modules WHERE id = ?)
            ) WHERE id = (SELECT course_id FROM modules WHERE id = ?)
        """, (module_id, module_id))
    return lesson


def get_course(course_id: str) -> Optional[dict]:
    with _conn() as conn:
        row = conn.execute("SELECT * FROM courses WHERE id=?", (course_id,)).fetchone()
        if not row:
            return None
        course = dict(row)
        course["tags"] = json.loads(course["tags"])
        modules = conn.execute(
            "SELECT * FROM modules WHERE course_id=? ORDER BY ord", (course_id,)
        ).fetchall()
        course["modules"] = []
        for mod in modules:
            m = dict(mod)
            m["lessons"] = [dict(l) for l in conn.execute(
                "SELECT * FROM lessons WHERE module_id=? ORDER BY ord", (m["id"],)
            ).fetchall()]
            course["modules"].append(m)
        return course


def list_courses(published_only: bool = False) -> list[dict]:
    with _conn() as conn:
        q = "SELECT * FROM courses"
        if published_only:
            q += " WHERE published=1"
        q += " ORDER BY created_at DESC"
        rows = conn.execute(q).fetchall()
        result = []
        for row in rows:
            c = dict(row)
            c["tags"] = json.loads(c["tags"])
            result.append(c)
        return result


def publish_course(course_id: str) -> bool:
    with _conn() as conn:
        c = conn.execute(
            "UPDATE courses SET published=1 WHERE id=? RETURNING id", (course_id,)
        ).fetchone()
        return c is not None


# ─────────────────────────────────────────────────────────────────────────────
# Enrollment operations
# ─────────────────────────────────────────────────────────────────────────────

def enroll(student_id: str, course_id: str) -> Enrollment:
    """Enroll a student in a course. Idempotent."""
    with _conn() as conn:
        existing = conn.execute(
            "SELECT * FROM enrollments WHERE student_id=? AND course_id=?",
            (student_id, course_id)
        ).fetchone()
        if existing:
            e = dict(existing)
            return Enrollment(**{k: e[k] for k in [
                'id', 'student_id', 'course_id', 'progress_pct',
                'started_at', 'completed_at', 'certificate_id'
            ]})
        enrollment = Enrollment(id=_uid(), student_id=student_id, course_id=course_id)
        conn.execute(
            "INSERT INTO enrollments VALUES (?,?,?,?,?,?,?)",
            (enrollment.id, enrollment.student_id, enrollment.course_id,
             enrollment.progress_pct, enrollment.started_at,
             enrollment.completed_at, enrollment.certificate_id)
        )
        return enrollment


def complete_lesson(enrollment_id: str, lesson_id: str,
                    time_spent_mins: int = 0) -> dict:
    """Mark a lesson as complete and recalculate progress."""
    completion = LessonCompletion(
        id=_uid(), enrollment_id=enrollment_id, lesson_id=lesson_id,
        time_spent_mins=time_spent_mins
    )
    with _conn() as conn:
        # Insert or ignore (idempotent)
        conn.execute("""
            INSERT OR IGNORE INTO lesson_completions VALUES (?,?,?,?,?)
        """, (completion.id, completion.enrollment_id, completion.lesson_id,
              completion.completed_at, completion.time_spent_mins))

        # Recalculate progress
        progress = _calculate_progress(conn, enrollment_id)
        conn.execute(
            "UPDATE enrollments SET progress_pct=? WHERE id=?",
            (progress, enrollment_id)
        )
        if progress >= 100.0:
            completed_at = conn.execute(
                "SELECT completed_at FROM enrollments WHERE id=?", (enrollment_id,)
            ).fetchone()[0]
            if not completed_at:
                conn.execute(
                    "UPDATE enrollments SET completed_at=? WHERE id=?",
                    (_now(), enrollment_id)
                )
        return {"enrollment_id": enrollment_id, "lesson_id": lesson_id, "progress_pct": progress}


def _calculate_progress(conn: sqlite3.Connection, enrollment_id: str) -> float:
    row = conn.execute(
        "SELECT course_id FROM enrollments WHERE id=?", (enrollment_id,)
    ).fetchone()
    if not row:
        return 0.0
    course_id = row[0]
    total = conn.execute("""
        SELECT COUNT(*) FROM lessons l
        JOIN modules m ON l.module_id = m.id
        WHERE m.course_id = ?
    """, (course_id,)).fetchone()[0]
    if total == 0:
        return 0.0
    completed = conn.execute("""
        SELECT COUNT(*) FROM lesson_completions lc
        JOIN lessons l ON lc.lesson_id = l.id
        JOIN modules m ON l.module_id = m.id
        WHERE lc.enrollment_id = ? AND m.course_id = ?
    """, (enrollment_id, course_id)).fetchone()[0]
    return round(completed / total * 100, 2)


def get_progress(enrollment_id: str) -> dict:
    """Get detailed progress for an enrollment."""
    with _conn() as conn:
        enr = conn.execute(
            "SELECT * FROM enrollments WHERE id=?", (enrollment_id,)
        ).fetchone()
        if not enr:
            return {"error": f"Enrollment {enrollment_id} not found"}
        enr = dict(enr)
        completed_lessons = [
            r[0] for r in conn.execute(
                "SELECT lesson_id FROM lesson_completions WHERE enrollment_id=?",
                (enrollment_id,)
            ).fetchall()
        ]
        course = get_course(enr["course_id"])
        module_progress = []
        for mod in (course or {}).get("modules", []):
            mod_lessons = [l["id"] for l in mod["lessons"]]
            done = sum(1 for lid in mod_lessons if lid in completed_lessons)
            module_progress.append({
                "module_id": mod["id"],
                "title": mod["title"],
                "total_lessons": len(mod_lessons),
                "completed_lessons": done,
                "pct": round(done / len(mod_lessons) * 100, 1) if mod_lessons else 0.0
            })
        return {
            "enrollment_id": enrollment_id,
            "student_id": enr["student_id"],
            "course_id": enr["course_id"],
            "progress_pct": enr["progress_pct"],
            "started_at": enr["started_at"],
            "completed_at": enr["completed_at"],
            "certificate_id": enr["certificate_id"],
            "completed_lessons": len(completed_lessons),
            "module_progress": module_progress
        }


# ─────────────────────────────────────────────────────────────────────────────
# Certificate
# ─────────────────────────────────────────────────────────────────────────────

def generate_certificate(enrollment_id: str) -> Certificate | dict:
    """Generate a completion certificate. Requires 100% progress."""
    with _conn() as conn:
        enr = conn.execute(
            "SELECT * FROM enrollments WHERE id=?", (enrollment_id,)
        ).fetchone()
        if not enr:
            return {"error": "Enrollment not found"}
        enr = dict(enr)
        if enr["progress_pct"] < 100.0:
            return {"error": f"Course not complete ({enr['progress_pct']}%). Complete all lessons first."}
        if enr["certificate_id"]:
            cert = conn.execute(
                "SELECT * FROM certificates WHERE id=?", (enr["certificate_id"],)
            ).fetchone()
            return Certificate(**dict(cert))

        course = conn.execute(
            "SELECT title, instructor FROM courses WHERE id=?", (enr["course_id"],)
        ).fetchone()
        cert = Certificate(
            id=_uid(), enrollment_id=enrollment_id,
            student_id=enr["student_id"], course_id=enr["course_id"],
            course_title=course["title"], instructor=course["instructor"]
        )
        conn.execute(
            "INSERT INTO certificates VALUES (?,?,?,?,?,?,?,?)",
            (cert.id, cert.enrollment_id, cert.student_id, cert.course_id,
             cert.course_title, cert.instructor, cert.issued_at, cert.verification_code)
        )
        conn.execute(
            "UPDATE enrollments SET certificate_id=? WHERE id=?",
            (cert.id, enrollment_id)
        )
        return cert


# ─────────────────────────────────────────────────────────────────────────────
# Learning path recommendation
# ─────────────────────────────────────────────────────────────────────────────

GOAL_TAG_MAP = {
    "ml": ["machine-learning", "python", "data-science", "ai"],
    "web": ["javascript", "react", "html", "css", "frontend"],
    "devops": ["docker", "kubernetes", "ci-cd", "linux", "cloud"],
    "security": ["security", "cryptography", "networking", "linux"],
    "data": ["data-science", "sql", "python", "analytics"],
    "ai": ["ai", "machine-learning", "llm", "python"],
    "backend": ["python", "api", "database", "backend"],
}


def learning_path_suggest(student_id: str, goal: str) -> dict:
    """Suggest a learning path for a student based on goal."""
    with _conn() as conn:
        # Get already-enrolled courses
        enrolled = {
            r[0] for r in conn.execute(
                "SELECT course_id FROM enrollments WHERE student_id=?", (student_id,)
            ).fetchall()
        }
        # Get completed courses
        completed = {
            r[0] for r in conn.execute(
                "SELECT course_id FROM enrollments WHERE student_id=? AND completed_at IS NOT NULL",
                (student_id,)
            ).fetchall()
        }
        target_tags = GOAL_TAG_MAP.get(goal.lower(), [goal.lower()])
        courses = conn.execute(
            "SELECT * FROM courses WHERE published=1 ORDER BY created_at"
        ).fetchall()

        path = []
        by_difficulty = {"beginner": [], "intermediate": [], "advanced": []}
        for c in courses:
            if c["id"] in completed:
                continue
            tags = json.loads(c["tags"])
            if any(t in tags for t in target_tags):
                by_difficulty[c["difficulty"]].append({
                    "id": c["id"], "title": c["title"],
                    "difficulty": c["difficulty"],
                    "duration_mins": c["duration_mins"],
                    "enrolled": c["id"] in enrolled,
                    "instructor": c["instructor"]
                })

        for level in ["beginner", "intermediate", "advanced"]:
            path.extend(by_difficulty[level])

        return {
            "student_id": student_id,
            "goal": goal,
            "target_tags": target_tags,
            "suggested_courses": path[:10],
            "already_completed": len(completed),
        }


# ─────────────────────────────────────────────────────────────────────────────
# Student dashboard
# ─────────────────────────────────────────────────────────────────────────────

def student_dashboard(student_id: str) -> dict:
    """Full dashboard for a student."""
    with _conn() as conn:
        enrollments = conn.execute(
            "SELECT * FROM enrollments WHERE student_id=? ORDER BY started_at DESC",
            (student_id,)
        ).fetchall()
        total = len(enrollments)
        completed = sum(1 for e in enrollments if e["completed_at"])
        in_progress = total - completed
        total_time = conn.execute("""
            SELECT COALESCE(SUM(lc.time_spent_mins), 0)
            FROM lesson_completions lc
            JOIN enrollments e ON lc.enrollment_id = e.id
            WHERE e.student_id = ?
        """, (student_id,)).fetchone()[0]
        certs = conn.execute(
            "SELECT COUNT(*) FROM certificates WHERE student_id=?", (student_id,)
        ).fetchone()[0]
        return {
            "student_id": student_id,
            "total_enrollments": total,
            "completed_courses": completed,
            "in_progress": in_progress,
            "certificates_earned": certs,
            "total_learning_mins": total_time,
            "enrollments": [dict(e) for e in enrollments]
        }


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
        description="BlackRoad Education LMS",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  lms.py create-course "Python Basics" "Intro to Python" "Dr. Smith" beginner --tags python,beginner
  lms.py add-module <course_id> "Getting Started"
  lms.py add-lesson <module_id> "Hello World" "print('Hello')" text 15
  lms.py enroll student-123 <course_id>
  lms.py complete-lesson <enrollment_id> <lesson_id> --time 20
  lms.py progress <enrollment_id>
  lms.py certificate <enrollment_id>
  lms.py suggest student-123 ml
  lms.py dashboard student-123
  lms.py list-courses
        """
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    # create-course
    p = sub.add_parser("create-course")
    p.add_argument("title")
    p.add_argument("description")
    p.add_argument("instructor")
    p.add_argument("difficulty", choices=["beginner", "intermediate", "advanced"])
    p.add_argument("--tags", default="")

    # add-module
    p = sub.add_parser("add-module")
    p.add_argument("course_id")
    p.add_argument("title")
    p.add_argument("--description", default="")
    p.add_argument("--order", type=int, default=0)

    # add-lesson
    p = sub.add_parser("add-lesson")
    p.add_argument("module_id")
    p.add_argument("title")
    p.add_argument("content")
    p.add_argument("type", choices=["video", "text", "quiz", "lab"])
    p.add_argument("duration_mins", type=int)
    p.add_argument("--order", type=int, default=0)

    # enroll
    p = sub.add_parser("enroll")
    p.add_argument("student_id")
    p.add_argument("course_id")

    # complete-lesson
    p = sub.add_parser("complete-lesson")
    p.add_argument("enrollment_id")
    p.add_argument("lesson_id")
    p.add_argument("--time", type=int, default=0, dest="time_spent")

    # progress
    p = sub.add_parser("progress")
    p.add_argument("enrollment_id")

    # certificate
    p = sub.add_parser("certificate")
    p.add_argument("enrollment_id")

    # suggest
    p = sub.add_parser("suggest")
    p.add_argument("student_id")
    p.add_argument("goal")

    # dashboard
    p = sub.add_parser("dashboard")
    p.add_argument("student_id")

    # list-courses
    p = sub.add_parser("list-courses")
    p.add_argument("--all", action="store_true")

    # get-course
    p = sub.add_parser("get-course")
    p.add_argument("course_id")

    # publish
    p = sub.add_parser("publish")
    p.add_argument("course_id")

    args = parser.parse_args()
    init_db()

    if args.cmd == "create-course":
        tags = [t.strip() for t in args.tags.split(",") if t.strip()] if args.tags else []
        _print_json(create_course(args.title, args.description, args.instructor, args.difficulty, tags))
    elif args.cmd == "add-module":
        _print_json(add_module(args.course_id, args.title, args.description, args.order))
    elif args.cmd == "add-lesson":
        _print_json(add_lesson(args.module_id, args.title, args.content, args.type, args.duration_mins, args.order))
    elif args.cmd == "enroll":
        _print_json(enroll(args.student_id, args.course_id))
    elif args.cmd == "complete-lesson":
        _print_json(complete_lesson(args.enrollment_id, args.lesson_id, args.time_spent))
    elif args.cmd == "progress":
        _print_json(get_progress(args.enrollment_id))
    elif args.cmd == "certificate":
        _print_json(generate_certificate(args.enrollment_id))
    elif args.cmd == "suggest":
        _print_json(learning_path_suggest(args.student_id, args.goal))
    elif args.cmd == "dashboard":
        _print_json(student_dashboard(args.student_id))
    elif args.cmd == "list-courses":
        _print_json(list_courses(published_only=not args.all))
    elif args.cmd == "get-course":
        result = get_course(args.course_id)
        _print_json(result or {"error": "Course not found"})
    elif args.cmd == "publish":
        ok = publish_course(args.course_id)
        _print_json({"published": ok, "course_id": args.course_id})


if __name__ == "__main__":
    cli_main()
