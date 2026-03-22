"""
Tests for BlackRoad Education LMS
"""
import json
import os
import sys
import tempfile
from pathlib import Path

import pytest

# Redirect DB to temp dir during tests
_tmp = tempfile.mkdtemp()
os.environ["HOME"] = _tmp

import lms

lms.DB_PATH = Path(_tmp) / "test_lms.db"


@pytest.fixture(autouse=True)
def fresh_db():
    """Re-init DB before each test."""
    if lms.DB_PATH.exists():
        lms.DB_PATH.unlink()
    lms.init_db()
    yield


# ─── Course tests ────────────────────────────────────────────────────────────

def test_create_course():
    c = lms.create_course("Python 101", "Intro", "Alice", "beginner", ["python"])
    assert c.id
    assert c.title == "Python 101"
    assert c.difficulty == "beginner"
    assert "python" in c.tags


def test_list_courses_empty():
    courses = lms.list_courses(published_only=True)
    assert courses == []


def test_publish_course():
    c = lms.create_course("Go Basics", "Go intro", "Bob", "intermediate")
    ok = lms.publish_course(c.id)
    assert ok is True
    courses = lms.list_courses(published_only=True)
    assert any(co["id"] == c.id for co in courses)


def test_add_module_and_lesson():
    c = lms.create_course("Rust Course", "Systems", "Carol", "advanced")
    m = lms.add_module(c.id, "Module 1", "First module")
    assert m.course_id == c.id
    l = lms.add_lesson(m.id, "Hello Rust", "fn main() {}", "text", 10)
    assert l.module_id == m.id
    assert l.duration_mins == 10


def test_get_course_structure():
    c = lms.create_course("JS Full", "JavaScript", "Dave", "beginner")
    m = lms.add_module(c.id, "Basics")
    lms.add_lesson(m.id, "Variables", "let x = 1;", "text", 5)
    lms.add_lesson(m.id, "Functions", "function f(){}", "text", 8)
    data = lms.get_course(c.id)
    assert data is not None
    assert len(data["modules"]) == 1
    assert len(data["modules"][0]["lessons"]) == 2


# ─── Enrollment tests ────────────────────────────────────────────────────────

def test_enroll_student():
    c = lms.create_course("Docker 101", "Containers", "Eve", "beginner")
    e = lms.enroll("student-1", c.id)
    assert e.student_id == "student-1"
    assert e.progress_pct == 0.0


def test_enroll_idempotent():
    c = lms.create_course("K8s Basics", "Kubernetes", "Frank", "intermediate")
    e1 = lms.enroll("student-2", c.id)
    e2 = lms.enroll("student-2", c.id)
    assert e1.id == e2.id


def test_complete_lesson_progress():
    c = lms.create_course("SQL Course", "Database", "Grace", "beginner")
    m = lms.add_module(c.id, "Intro")
    l1 = lms.add_lesson(m.id, "SELECT", "SELECT * FROM t", "text", 10)
    l2 = lms.add_lesson(m.id, "INSERT", "INSERT INTO t", "text", 10)
    e = lms.enroll("student-3", c.id)

    result = lms.complete_lesson(e.id, l1.id, time_spent_mins=10)
    assert result["progress_pct"] == 50.0

    result = lms.complete_lesson(e.id, l2.id, time_spent_mins=10)
    assert result["progress_pct"] == 100.0


def test_complete_lesson_idempotent():
    c = lms.create_course("CSS Basics", "Styling", "Hank", "beginner")
    m = lms.add_module(c.id, "Intro")
    l = lms.add_lesson(m.id, "Selectors", "h1 {}", "text", 5)
    e = lms.enroll("student-4", c.id)
    r1 = lms.complete_lesson(e.id, l.id)
    r2 = lms.complete_lesson(e.id, l.id)
    assert r1["progress_pct"] == r2["progress_pct"]


def test_get_progress_detail():
    c = lms.create_course("React Course", "Frontend", "Iris", "intermediate")
    m = lms.add_module(c.id, "Hooks")
    l = lms.add_lesson(m.id, "useState", "const [x,s]=useState()", "text", 15)
    e = lms.enroll("student-5", c.id)
    lms.complete_lesson(e.id, l.id)
    prog = lms.get_progress(e.id)
    assert prog["progress_pct"] == 100.0
    assert prog["completed_lessons"] == 1
    assert len(prog["module_progress"]) == 1


# ─── Certificate tests ────────────────────────────────────────────────────────

def test_generate_certificate_requires_completion():
    c = lms.create_course("Vue Course", "Frontend", "Jack", "intermediate")
    m = lms.add_module(c.id, "Intro")
    lms.add_lesson(m.id, "Reactivity", "...", "text", 10)
    e = lms.enroll("student-6", c.id)
    result = lms.generate_certificate(e.id)
    assert "error" in result


def test_generate_certificate_success():
    c = lms.create_course("AWS Basics", "Cloud", "Karen", "intermediate")
    m = lms.add_module(c.id, "EC2")
    l = lms.add_lesson(m.id, "Launch Instance", "...", "lab", 30)
    e = lms.enroll("student-7", c.id)
    lms.complete_lesson(e.id, l.id)
    cert = lms.generate_certificate(e.id)
    assert hasattr(cert, "verification_code")
    assert cert.student_id == "student-7"
    assert cert.course_title == "AWS Basics"


def test_generate_certificate_idempotent():
    c = lms.create_course("GCP Basics", "Cloud", "Leo", "beginner")
    m = lms.add_module(c.id, "GCS")
    l = lms.add_lesson(m.id, "Buckets", "...", "text", 20)
    e = lms.enroll("student-8", c.id)
    lms.complete_lesson(e.id, l.id)
    cert1 = lms.generate_certificate(e.id)
    cert2 = lms.generate_certificate(e.id)
    assert cert1.id == cert2.id
    assert cert1.verification_code == cert2.verification_code


# ─── Learning path tests ────────────────────────────────────────────────────

def test_learning_path_suggest():
    c1 = lms.create_course("ML Intro", "Machine Learning", "Dr. ML", "beginner", ["machine-learning", "python"])
    c2 = lms.create_course("Deep Learning", "Neural nets", "Dr. DL", "advanced", ["machine-learning", "ai"])
    lms.publish_course(c1.id)
    lms.publish_course(c2.id)
    result = lms.learning_path_suggest("student-9", "ml")
    assert result["goal"] == "ml"
    assert len(result["suggested_courses"]) >= 2
    # Beginner first
    assert result["suggested_courses"][0]["difficulty"] == "beginner"


def test_learning_path_excludes_completed():
    c = lms.create_course("Python Pro", "Advanced Python", "Dr. P", "advanced", ["python"])
    lms.publish_course(c.id)
    m = lms.add_module(c.id, "Decorators")
    l = lms.add_lesson(m.id, "Decorators", "...", "text", 30)
    e = lms.enroll("student-10", c.id)
    lms.complete_lesson(e.id, l.id)
    result = lms.learning_path_suggest("student-10", "backend")
    completed_ids = {co["id"] for co in result["suggested_courses"]}
    assert c.id not in completed_ids


# ─── Dashboard tests ─────────────────────────────────────────────────────────

def test_student_dashboard():
    c = lms.create_course("Linux Basics", "Sysadmin", "Mia", "beginner")
    e = lms.enroll("student-11", c.id)
    dash = lms.student_dashboard("student-11")
    assert dash["total_enrollments"] == 1
    assert dash["completed_courses"] == 0
    assert dash["in_progress"] == 1


def test_course_not_found():
    result = lms.get_course("nonexistent-id")
    assert result is None


def test_progress_not_found():
    result = lms.get_progress("nonexistent-enrollment")
    assert "error" in result
