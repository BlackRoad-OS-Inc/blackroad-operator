"""
Tests for BlackRoad Education Assessment Engine
"""
import json
import os
import sys
import tempfile
from pathlib import Path

import pytest

_tmp = tempfile.mkdtemp()
os.environ["HOME"] = _tmp

import assessment

assessment.DB_PATH = Path(_tmp) / "test_assessment.db"


@pytest.fixture(autouse=True)
def fresh_db():
    if assessment.DB_PATH.exists():
        assessment.DB_PATH.unlink()
    assessment.init_db()
    yield


# ─── Question tests ──────────────────────────────────────────────────────────

def _make_mc_question(text="What is 2+2?", correct="b"):
    options = [{"id": "a", "text": "3"}, {"id": "b", "text": "4"}, {"id": "c", "text": "5"}]
    return assessment.create_question(
        text=text, q_type="multiple_choice", options=options,
        correct_answer=correct, difficulty="easy",
        tags=["math"], explanation="Basic arithmetic"
    )


def _make_tf_question(text="The sky is blue.", correct="true"):
    return assessment.create_question(
        text=text, q_type="true_false", options=[],
        correct_answer=correct, difficulty="easy", tags=["general"]
    )


def test_create_question():
    q = _make_mc_question()
    assert q.id
    assert q.type == "multiple_choice"
    assert q.correct_answer == "b"
    assert "math" in q.tags


def test_get_question():
    q = _make_mc_question("What is 3+3?", "c")
    fetched = assessment.get_question(q.id)
    assert fetched is not None
    assert fetched.id == q.id
    assert fetched.correct_answer == "c"


def test_list_questions_empty():
    qs = assessment.list_questions()
    assert qs == []


def test_list_questions_filter():
    _make_mc_question("Q1")
    _make_tf_question("Q2")
    qs = assessment.list_questions(tags=["math"])
    assert len(qs) == 1
    assert qs[0].type == "multiple_choice"


def test_list_questions_difficulty():
    _make_mc_question()
    assessment.create_question("Hard question", "short_answer", [],
                                "deep learning", "hard", tags=["ml"])
    easy = assessment.list_questions(difficulty="easy")
    hard = assessment.list_questions(difficulty="hard")
    assert len(easy) == 1
    assert len(hard) == 1


# ─── Quiz tests ──────────────────────────────────────────────────────────────

def _make_quiz(q1=None, q2=None):
    if not q1:
        q1 = _make_mc_question("Q1 what?", "a")
    if not q2:
        q2 = _make_tf_question("Q2 true?", "true")
    return assessment.create_quiz(
        title="Test Quiz", description="A test",
        question_ids=[q1.id, q2.id],
        time_limit_mins=30, passing_score=50.0
    ), q1, q2


def test_create_quiz():
    quiz, _, _ = _make_quiz()
    assert quiz.id
    assert quiz.title == "Test Quiz"
    assert len(quiz.question_ids) == 2


def test_get_quiz():
    quiz, _, _ = _make_quiz()
    fetched = assessment.get_quiz(quiz.id)
    assert fetched is not None
    assert fetched.passing_score == 50.0


def test_get_quiz_questions():
    quiz, q1, q2 = _make_quiz()
    qs = assessment.get_quiz_questions(quiz.id)
    assert len(qs) == 2
    ids = {q.id for q in qs}
    assert q1.id in ids and q2.id in ids


# ─── Attempt lifecycle ───────────────────────────────────────────────────────

def test_start_attempt():
    quiz, _, _ = _make_quiz()
    attempt = assessment.start_attempt(quiz.id, "student-1")
    assert hasattr(attempt, "id")
    assert attempt.quiz_id == quiz.id
    assert attempt.student_id == "student-1"
    assert attempt.completed_at is None


def test_max_attempts_enforced():
    quiz, _, _ = _make_quiz()
    quiz = assessment.get_quiz(quiz.id)
    # Use max_attempts=1 quiz
    quiz2 = assessment.create_quiz("1-attempt quiz", "", quiz.question_ids, 10, 50.0, max_attempts=1)
    assessment.start_attempt(quiz2.id, "student-x")
    result = assessment.start_attempt(quiz2.id, "student-x")
    assert "error" in result


def test_submit_answer():
    quiz, q1, q2 = _make_quiz()
    attempt = assessment.start_attempt(quiz.id, "student-2")
    result = assessment.submit_answer(attempt.id, q1.id, "a")
    assert result["saved"] is True


def test_complete_attempt_all_correct():
    quiz, q1, q2 = _make_quiz()
    attempt = assessment.start_attempt(quiz.id, "student-3")
    assessment.submit_answer(attempt.id, q1.id, "a")   # correct
    assessment.submit_answer(attempt.id, q2.id, "true")  # correct
    result = assessment.complete_attempt(attempt.id)
    assert result["score"] == 100.0
    assert result["passed"] is True
    assert result["correct"] == 2


def test_complete_attempt_all_wrong():
    quiz, q1, q2 = _make_quiz()
    attempt = assessment.start_attempt(quiz.id, "student-4")
    assessment.submit_answer(attempt.id, q1.id, "c")    # wrong
    assessment.submit_answer(attempt.id, q2.id, "false") # wrong
    result = assessment.complete_attempt(attempt.id)
    assert result["score"] == 0.0
    assert result["passed"] is False


def test_complete_attempt_partial():
    quiz, q1, q2 = _make_quiz()
    attempt = assessment.start_attempt(quiz.id, "student-5")
    assessment.submit_answer(attempt.id, q1.id, "a")    # correct
    assessment.submit_answer(attempt.id, q2.id, "false") # wrong
    result = assessment.complete_attempt(attempt.id)
    assert result["score"] == 50.0


def test_cannot_submit_after_complete():
    quiz, q1, q2 = _make_quiz()
    attempt = assessment.start_attempt(quiz.id, "student-6")
    assessment.complete_attempt(attempt.id)
    result = assessment.submit_answer(attempt.id, q1.id, "a")
    assert "error" in result


def test_complete_twice_error():
    quiz, q1, q2 = _make_quiz()
    attempt = assessment.start_attempt(quiz.id, "student-7")
    assessment.complete_attempt(attempt.id)
    result = assessment.complete_attempt(attempt.id)
    assert "error" in result


# ─── Grading ────────────────────────────────────────────────────────────────

def test_true_false_grading():
    q = assessment.create_question("True or False", "true_false", [],
                                    "false", "easy", tags=["logic"])
    quiz = assessment.create_quiz("TF Quiz", "", [q.id], 5, 60.0)
    attempt = assessment.start_attempt(quiz.id, "student-8")
    assessment.submit_answer(attempt.id, q.id, "false")
    result = assessment.complete_attempt(attempt.id)
    assert result["score"] == 100.0


def test_multi_select_grading():
    q = assessment.create_question(
        "Select all even numbers", "multi_select",
        [{"id": "a", "text": "2"}, {"id": "b", "text": "3"}, {"id": "c", "text": "4"}],
        "a,c", "medium", tags=["math"]
    )
    quiz = assessment.create_quiz("MS Quiz", "", [q.id], 5, 60.0)
    attempt = assessment.start_attempt(quiz.id, "student-9")
    assessment.submit_answer(attempt.id, q.id, "a,c")
    result = assessment.complete_attempt(attempt.id)
    assert result["score"] == 100.0


# ─── Analytics ──────────────────────────────────────────────────────────────

def test_analytics_no_attempts():
    quiz, _, _ = _make_quiz()
    result = assessment.get_analytics(quiz.id)
    assert result["total_attempts"] == 0


def test_analytics_with_attempts():
    quiz, q1, q2 = _make_quiz()
    for i, s_id in enumerate(["s-a", "s-b", "s-c"]):
        attempt = assessment.start_attempt(quiz.id, s_id)
        assessment.submit_answer(attempt.id, q1.id, "a")
        assessment.submit_answer(attempt.id, q2.id, "true" if i % 2 == 0 else "false")
        assessment.complete_attempt(attempt.id)
    result = assessment.get_analytics(quiz.id)
    assert result["total_attempts"] == 3
    assert result["unique_students"] == 3
    assert result["avg_score"] is not None
    assert result["pass_rate"] is not None


def test_student_analytics():
    quiz, q1, q2 = _make_quiz()
    attempt = assessment.start_attempt(quiz.id, "student-aa")
    assessment.submit_answer(attempt.id, q1.id, "a")
    assessment.submit_answer(attempt.id, q2.id, "true")
    assessment.complete_attempt(attempt.id)
    result = assessment.get_student_analytics("student-aa")
    assert result["total_attempts"] == 1
    assert result["avg_score"] == 100.0
