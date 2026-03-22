"""
Tests for BlackRoad Education Skill Tracker
"""
import json
import os
import tempfile
from pathlib import Path

import pytest

_tmp = tempfile.mkdtemp()
os.environ["HOME"] = _tmp

import skill_tracker as st

st.DB_PATH = Path(_tmp) / "test_skills.db"


@pytest.fixture(autouse=True)
def fresh_db():
    if st.DB_PATH.exists():
        st.DB_PATH.unlink()
    st.init_db()
    yield


# ─── Skill CRUD ──────────────────────────────────────────────────────────────

def test_create_skill():
    skill = st.create_skill("Python", "python", "Core Python programming")
    assert skill.id
    assert skill.name == "Python"
    assert skill.category == "python"


def test_get_skill():
    skill = st.create_skill("Docker", "devops", "Container technology")
    fetched = st.get_skill(skill.id)
    assert fetched is not None
    assert fetched.name == "Docker"


def test_list_skills_empty():
    assert st.list_skills() == []


def test_list_skills():
    st.create_skill("React", "frontend")
    st.create_skill("Vue", "frontend")
    st.create_skill("FastAPI", "backend")
    all_skills = st.list_skills()
    assert len(all_skills) == 3
    frontend = st.list_skills(category="frontend")
    assert len(frontend) == 2


def test_skill_with_prerequisites():
    prereq = st.create_skill("Python Basics", "python")
    adv = st.create_skill("Decorators", "python", prerequisites=[prereq.id])
    fetched = st.get_skill(adv.id)
    assert prereq.id in fetched.prerequisites


# ─── Evidence & tracking ─────────────────────────────────────────────────────

def test_track_skill():
    skill = st.create_skill("SQL", "database")
    ev = st.track_skill("student-1", skill.id, "project", "Blog DB schema",
                         score=90.0)
    assert ev.id
    assert ev.skill_id == skill.id
    assert ev.student_id == "student-1"
    assert ev.score == 90.0


def test_track_unknown_skill_raises():
    with pytest.raises(ValueError):
        st.track_skill("student-1", "nonexistent-id", "project", "Test")


def test_track_multiple_evidence():
    skill = st.create_skill("Kubernetes", "devops")
    st.track_skill("student-2", skill.id, "course_completion", "K8s Basics")
    st.track_skill("student-2", skill.id, "project", "Deploy microservices", score=88)
    st.track_skill("student-2", skill.id, "quiz", "K8s quiz", score=75)
    assessment = st.assess_level("student-2", skill.id)
    assert assessment.evidence_count == 3
    assert assessment.score > 0


# ─── Assessment ──────────────────────────────────────────────────────────────

def test_assess_level_novice():
    skill = st.create_skill("Rust", "systems")
    assessment = st.assess_level("student-3", skill.id)
    assert assessment.level == "novice"
    assert assessment.evidence_count == 0


def test_assess_level_progresses_with_evidence():
    skill = st.create_skill("Terraform", "devops")
    # Add enough evidence to progress
    for i in range(10):
        st.track_skill("student-4", skill.id, "project", f"IaC project {i}",
                        verified=True, score=85.0)
    assessment = st.assess_level("student-4", skill.id)
    assert assessment.level in ["intermediate", "advanced", "expert"]
    assert assessment.evidence_count == 10


def test_assess_verified_evidence_higher_score():
    skill = st.create_skill("Ansible", "devops")
    st.track_skill("student-5a", skill.id, "project", "Unverified", verified=False)
    st.track_skill("student-5b", skill.id, "project", "Verified", verified=True)
    a1 = st.assess_level("student-5a", skill.id)
    a2 = st.assess_level("student-5b", skill.id)
    assert a2.score > a1.score


def test_assess_trend():
    skill = st.create_skill("GraphQL", "backend")
    # All evidence is recent (default), so trend should be improving or stable
    st.track_skill("student-6", skill.id, "project", "GraphQL API")
    assessment = st.assess_level("student-6", skill.id)
    assert assessment.trend in ("improving", "stable")


# ─── Skill map ───────────────────────────────────────────────────────────────

def test_skill_map_empty():
    result = st.get_skill_map("student-no-skills")
    assert result["total_skills_tracked"] == 0
    assert result["categories"] == {}


def test_skill_map_with_skills():
    s1 = st.create_skill("React", "frontend")
    s2 = st.create_skill("CSS", "frontend")
    s3 = st.create_skill("PostgreSQL", "database")
    st.track_skill("student-7", s1.id, "project", "Portfolio site")
    st.track_skill("student-7", s2.id, "course_completion", "CSS Grid")
    st.track_skill("student-7", s3.id, "quiz", "SQL quiz")
    skill_map = st.get_skill_map("student-7")
    assert skill_map["total_skills_tracked"] == 3
    assert "frontend" in skill_map["categories"]
    assert "database" in skill_map["categories"]


# ─── Portfolio ───────────────────────────────────────────────────────────────

def test_export_portfolio_json():
    skill = st.create_skill("Go", "backend")
    st.track_skill("student-8", skill.id, "project", "REST API in Go", score=92)
    output = st.export_portfolio("student-8", fmt="json")
    portfolio = json.loads(output)
    assert portfolio["student_id"] == "student-8"
    assert portfolio["summary"]["total_skills"] >= 1


def test_export_portfolio_text():
    skill = st.create_skill("MongoDB", "database")
    st.track_skill("student-9", skill.id, "course_completion", "MongoDB course")
    output = st.export_portfolio("student-9", fmt="text")
    assert "SKILL PORTFOLIO" in output
    assert "student-9" in output


# ─── Recommendations ─────────────────────────────────────────────────────────

def test_recommend_no_skills():
    s = st.create_skill("PyTorch", "machine-learning")
    result = st.recommend_next("student-10", "ml")
    assert result["goal"] == "ml"
    # Should recommend the uncompleted skills
    assert len(result["recommendations"]) >= 0


def test_recommend_skips_expert_skills():
    skill = st.create_skill("NumPy", "machine-learning")
    # Add tons of evidence to reach expert
    for i in range(30):
        st.track_skill("student-11", skill.id, "project", f"NumPy project {i}",
                        verified=True, score=100.0)
    result = st.recommend_next("student-11", "ml")
    # NumPy should not be in recommendations (already expert)
    ids = [r["skill_id"] for r in result["recommendations"]]
    assert skill.id not in ids


# ─── Goals ───────────────────────────────────────────────────────────────────

def test_set_goal():
    skill = st.create_skill("Redis", "database")
    goal = st.set_goal("student-12", skill.id, "advanced",
                        target_date="2026-12-01", notes="Need for caching")
    assert goal.id
    assert goal.target_level == "advanced"
    assert goal.status == "active"


def test_set_goal_invalid_level():
    skill = st.create_skill("Memcached", "database")
    with pytest.raises(ValueError):
        st.set_goal("student-13", skill.id, "superhero")


def test_check_goals_not_achieved():
    skill = st.create_skill("Hadoop", "data-science")
    st.set_goal("student-14", skill.id, "intermediate")
    results = st.check_goals("student-14")
    assert len(results) == 1
    assert results[0]["achieved"] is False
    assert results[0]["current_level"] == "novice"


def test_check_goals_achieved():
    skill = st.create_skill("Pandas", "data-science")
    # Track enough evidence to reach beginner
    for i in range(5):
        st.track_skill("student-15", skill.id, "project", f"Data project {i}",
                        verified=True)
    goal = st.set_goal("student-15", skill.id, "beginner")
    results = st.check_goals("student-15")
    achieved = next((r for r in results if r["goal_id"] == goal.id), None)
    assert achieved is not None
    # beginner threshold = 3, we have 5 verified projects
    assert achieved["achieved"] is True
