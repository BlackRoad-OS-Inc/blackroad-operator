#!/usr/bin/env python3
"""
BlackRoad Education Skill Tracker
Track, assess, and visualize student skill development across categories.
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

DB_PATH = Path.home() / ".blackroad" / "education" / "skills.db"

# ─────────────────────────────────────────────────────────────────────────────
# Dataclasses
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class Skill:
    id: str
    name: str
    category: str
    description: str = ""
    level_thresholds: dict = field(default_factory=lambda: {
        "novice": 0, "beginner": 3, "intermediate": 8, "advanced": 15, "expert": 25
    })
    prerequisites: list = field(default_factory=list)
    created_at: str = field(default_factory=lambda: _now())


@dataclass
class Evidence:
    id: str
    skill_id: str
    student_id: str
    type: str  # project | quiz | assessment | peer_review | self_report | course_completion
    title: str
    description: str = ""
    score: Optional[float] = None  # 0-100 if scored
    source_id: Optional[str] = None  # course_id, quiz_id, etc.
    verified: bool = False
    recorded_at: str = field(default_factory=lambda: _now())


@dataclass
class SkillAssessment:
    id: str
    student_id: str
    skill_id: str
    level: str  # novice | beginner | intermediate | advanced | expert
    score: float  # computed score
    evidence_count: int
    recent_evidence_count: int  # last 30 days
    last_practiced: Optional[str]
    trend: str  # improving | stable | declining
    assessed_at: str = field(default_factory=lambda: _now())


@dataclass
class SkillGoal:
    id: str
    student_id: str
    skill_id: str
    target_level: str
    target_date: Optional[str]
    notes: str = ""
    status: str = "active"  # active | achieved | abandoned
    created_at: str = field(default_factory=lambda: _now())


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

LEVELS = ["novice", "beginner", "intermediate", "advanced", "expert"]

EVIDENCE_WEIGHTS = {
    "project": 3.0,
    "quiz": 1.5,
    "assessment": 2.0,
    "peer_review": 2.5,
    "course_completion": 2.0,
    "self_report": 0.5,
}

# Goal → skill categories to focus on
GOAL_SKILLS_MAP = {
    "ml": ["machine-learning", "data-science", "python", "math"],
    "web": ["frontend", "javascript", "css", "react"],
    "devops": ["infrastructure", "linux", "docker", "ci-cd"],
    "security": ["security", "networking", "cryptography"],
    "data": ["data-science", "sql", "python", "analytics"],
    "ai": ["machine-learning", "llm", "python", "math"],
    "backend": ["python", "api", "database", "backend"],
    "mobile": ["ios", "android", "react-native", "flutter"],
}


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


def _days_ago(n: int) -> str:
    from datetime import timedelta
    return (datetime.now(timezone.utc) - timedelta(days=n)).isoformat()


# ─────────────────────────────────────────────────────────────────────────────
# Database init
# ─────────────────────────────────────────────────────────────────────────────

def init_db() -> None:
    with _conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS skills (
                id                TEXT PRIMARY KEY,
                name              TEXT NOT NULL,
                category          TEXT NOT NULL,
                description       TEXT DEFAULT '',
                level_thresholds  TEXT DEFAULT '{}',
                prerequisites     TEXT DEFAULT '[]',
                created_at        TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS evidence (
                id          TEXT PRIMARY KEY,
                skill_id    TEXT NOT NULL REFERENCES skills(id),
                student_id  TEXT NOT NULL,
                type        TEXT NOT NULL,
                title       TEXT NOT NULL,
                description TEXT DEFAULT '',
                score       REAL,
                source_id   TEXT,
                verified    INTEGER DEFAULT 0,
                recorded_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS skill_assessments (
                id                   TEXT PRIMARY KEY,
                student_id           TEXT NOT NULL,
                skill_id             TEXT NOT NULL REFERENCES skills(id),
                level                TEXT NOT NULL,
                score                REAL NOT NULL,
                evidence_count       INTEGER DEFAULT 0,
                recent_evidence_count INTEGER DEFAULT 0,
                last_practiced       TEXT,
                trend                TEXT DEFAULT 'stable',
                assessed_at          TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS skill_goals (
                id           TEXT PRIMARY KEY,
                student_id   TEXT NOT NULL,
                skill_id     TEXT NOT NULL REFERENCES skills(id),
                target_level TEXT NOT NULL,
                target_date  TEXT,
                notes        TEXT DEFAULT '',
                status       TEXT DEFAULT 'active',
                created_at   TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_evidence_student ON evidence(student_id);
            CREATE INDEX IF NOT EXISTS idx_evidence_skill ON evidence(skill_id);
            CREATE INDEX IF NOT EXISTS idx_assessments_student ON skill_assessments(student_id);
            CREATE INDEX IF NOT EXISTS idx_goals_student ON skill_goals(student_id);
        """)


# ─────────────────────────────────────────────────────────────────────────────
# Skill CRUD
# ─────────────────────────────────────────────────────────────────────────────

def create_skill(name: str, category: str, description: str = "",
                 prerequisites: list | None = None) -> Skill:
    skill = Skill(id=_uid(), name=name, category=category,
                  description=description, prerequisites=prerequisites or [])
    with _conn() as conn:
        conn.execute(
            "INSERT INTO skills VALUES (?,?,?,?,?,?,?)",
            (skill.id, skill.name, skill.category, skill.description,
             json.dumps(skill.level_thresholds), json.dumps(skill.prerequisites),
             skill.created_at)
        )
    return skill


def get_skill(skill_id: str) -> Optional[Skill]:
    with _conn() as conn:
        row = conn.execute("SELECT * FROM skills WHERE id=?", (skill_id,)).fetchone()
        if not row:
            return None
        d = dict(row)
        d["level_thresholds"] = json.loads(d["level_thresholds"])
        d["prerequisites"] = json.loads(d["prerequisites"])
        return Skill(**d)


def list_skills(category: str | None = None) -> list[Skill]:
    with _conn() as conn:
        q = "SELECT * FROM skills"
        params = []
        if category:
            q += " WHERE category=?"
            params.append(category)
        q += " ORDER BY name"
        rows = conn.execute(q, params).fetchall()
        result = []
        for row in rows:
            d = dict(row)
            d["level_thresholds"] = json.loads(d["level_thresholds"])
            d["prerequisites"] = json.loads(d["prerequisites"])
            result.append(Skill(**d))
        return result


# ─────────────────────────────────────────────────────────────────────────────
# Evidence & skill tracking
# ─────────────────────────────────────────────────────────────────────────────

def track_skill(student_id: str, skill_id: str, evidence_type: str,
                title: str, description: str = "", score: Optional[float] = None,
                source_id: Optional[str] = None, verified: bool = False) -> Evidence:
    """Record evidence of skill practice or demonstration."""
    skill = get_skill(skill_id)
    if not skill:
        raise ValueError(f"Skill {skill_id} not found")
    ev = Evidence(
        id=_uid(), skill_id=skill_id, student_id=student_id,
        type=evidence_type, title=title, description=description,
        score=score, source_id=source_id, verified=verified
    )
    with _conn() as conn:
        conn.execute(
            "INSERT INTO evidence VALUES (?,?,?,?,?,?,?,?,?,?)",
            (ev.id, ev.skill_id, ev.student_id, ev.type, ev.title,
             ev.description, ev.score, ev.source_id, int(ev.verified), ev.recorded_at)
        )
    # Trigger reassessment
    assess_level(student_id, skill_id)
    return ev


def assess_level(student_id: str, skill_id: str) -> SkillAssessment:
    """Compute skill level from evidence count, recency, and quality."""
    with _conn() as conn:
        skill = get_skill(skill_id)
        if not skill:
            raise ValueError(f"Skill {skill_id} not found")

        all_evidence = conn.execute(
            "SELECT * FROM evidence WHERE student_id=? AND skill_id=? ORDER BY recorded_at DESC",
            (student_id, skill_id)
        ).fetchall()

        recent_cutoff = _days_ago(30)
        recent_ev = [e for e in all_evidence if e["recorded_at"] >= recent_cutoff]

        # Weighted score calculation
        weighted_score = 0.0
        for ev in all_evidence:
            weight = EVIDENCE_WEIGHTS.get(ev["type"], 1.0)
            # Verified evidence gets a bonus
            if ev["verified"]:
                weight *= 1.5
            # Score-based bonus (if 0-100 score provided, scale it)
            score_bonus = 0.0
            if ev["score"] is not None:
                score_bonus = (ev["score"] / 100) * 0.5
            weighted_score += weight + score_bonus

        # Determine level from thresholds
        thresholds = skill.level_thresholds
        level = "novice"
        for lvl in LEVELS:
            if weighted_score >= thresholds.get(lvl, 0):
                level = lvl

        # Trend: compare recent vs older evidence rate
        older_ev = [e for e in all_evidence if e["recorded_at"] < recent_cutoff]
        trend = "stable"
        if len(recent_ev) > len(older_ev) / max(1, (len(all_evidence) / max(len(recent_ev), 1))):
            trend = "improving"
        elif len(recent_ev) == 0 and len(all_evidence) > 0:
            trend = "declining"

        last_practiced = all_evidence[0]["recorded_at"] if all_evidence else None
        assessment = SkillAssessment(
            id=_uid(), student_id=student_id, skill_id=skill_id,
            level=level, score=round(weighted_score, 2),
            evidence_count=len(all_evidence),
            recent_evidence_count=len(recent_ev),
            last_practiced=last_practiced,
            trend=trend
        )
        conn.execute("""
            INSERT OR REPLACE INTO skill_assessments
            (id, student_id, skill_id, level, score, evidence_count,
             recent_evidence_count, last_practiced, trend, assessed_at)
            VALUES (?,?,?,?,?,?,?,?,?,?)
        """, (assessment.id, assessment.student_id, assessment.skill_id,
              assessment.level, assessment.score, assessment.evidence_count,
              assessment.recent_evidence_count, assessment.last_practiced,
              assessment.trend, assessment.assessed_at))
        return assessment


# ─────────────────────────────────────────────────────────────────────────────
# Skill map & portfolio
# ─────────────────────────────────────────────────────────────────────────────

def get_skill_map(student_id: str) -> dict:
    """Full skill map for a student, organized by category."""
    with _conn() as conn:
        assessments = conn.execute(
            "SELECT * FROM skill_assessments WHERE student_id=? ORDER BY score DESC",
            (student_id,)
        ).fetchall()

        by_category: dict[str, list] = {}
        for a in assessments:
            skill = get_skill(a["skill_id"])
            if not skill:
                continue
            cat = skill.category
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append({
                "skill_id": a["skill_id"],
                "skill_name": skill.name,
                "level": a["level"],
                "score": a["score"],
                "evidence_count": a["evidence_count"],
                "trend": a["trend"],
                "last_practiced": a["last_practiced"]
            })

        # Aggregate category-level summary
        category_summary = []
        for cat, skills in by_category.items():
            avg_level_idx = sum(
                LEVELS.index(s["level"]) for s in skills
            ) / len(skills) if skills else 0
            category_summary.append({
                "category": cat,
                "avg_level": LEVELS[round(avg_level_idx)],
                "num_skills": len(skills),
                "total_evidence": sum(s["evidence_count"] for s in skills)
            })

        return {
            "student_id": student_id,
            "total_skills_tracked": len(assessments),
            "categories": by_category,
            "category_summary": category_summary
        }


def export_portfolio(student_id: str, fmt: str = "json") -> str:
    """Export a student's skill portfolio."""
    skill_map = get_skill_map(student_id)
    with _conn() as conn:
        goals = conn.execute(
            "SELECT * FROM skill_goals WHERE student_id=? AND status='active'",
            (student_id,)
        ).fetchall()
        goal_list = []
        for g in goals:
            skill = get_skill(g["skill_id"])
            goal_list.append({
                "skill": skill.name if skill else g["skill_id"],
                "category": skill.category if skill else "",
                "target_level": g["target_level"],
                "target_date": g["target_date"],
                "status": g["status"]
            })

        all_evidence = conn.execute(
            "SELECT e.*, s.name as skill_name, s.category FROM evidence e "
            "JOIN skills s ON e.skill_id = s.id "
            "WHERE e.student_id=? ORDER BY e.recorded_at DESC",
            (student_id,)
        ).fetchall()

    portfolio = {
        "student_id": student_id,
        "generated_at": _now(),
        "summary": {
            "total_skills": skill_map["total_skills_tracked"],
            "category_summary": skill_map["category_summary"],
        },
        "skills_by_category": skill_map["categories"],
        "active_goals": goal_list,
        "recent_evidence": [dict(e) for e in all_evidence[:20]],
        "total_evidence_items": len(all_evidence)
    }

    if fmt == "json":
        return json.dumps(portfolio, indent=2)
    elif fmt == "text":
        lines = [
            f"╔══════════════════════════════════════╗",
            f"║  SKILL PORTFOLIO — {student_id[:20]:<20} ║",
            f"╚══════════════════════════════════════╝",
            f"Generated: {portfolio['generated_at'][:19]}",
            f"",
            f"SUMMARY",
            f"  Skills tracked: {portfolio['summary']['total_skills']}",
            f"",
        ]
        for cat_summary in portfolio["summary"]["category_summary"]:
            lines.append(
                f"  {cat_summary['category']:<20} "
                f"{cat_summary['avg_level']:<15} "
                f"({cat_summary['num_skills']} skills, "
                f"{cat_summary['total_evidence']} evidence items)"
            )
        lines.append("\nACTIVE GOALS")
        for g in goal_list:
            lines.append(f"  {g['skill']} → {g['target_level']} by {g.get('target_date', 'no date')}")
        return "\n".join(lines)
    else:
        return json.dumps(portfolio)


# ─────────────────────────────────────────────────────────────────────────────
# Recommendations
# ─────────────────────────────────────────────────────────────────────────────

def recommend_next(student_id: str, goal: str) -> dict:
    """Recommend next skills to develop toward a goal."""
    with _conn() as conn:
        target_categories = GOAL_SKILLS_MAP.get(goal.lower(), [goal.lower()])

        # Current skill levels
        current = {
            r["skill_id"]: r["level"]
            for r in conn.execute(
                "SELECT skill_id, level FROM skill_assessments WHERE student_id=?",
                (student_id,)
            ).fetchall()
        }

        all_skills = list_skills()
        recommendations = []

        for skill in all_skills:
            if skill.category not in target_categories:
                continue
            current_level = current.get(skill.id, "novice")
            current_idx = LEVELS.index(current_level)
            # Recommend if not yet expert
            if current_idx < len(LEVELS) - 1:
                next_level = LEVELS[current_idx + 1]
                # Check prerequisites
                prereqs_met = all(pid in current for pid in skill.prerequisites)
                recommendations.append({
                    "skill_id": skill.id,
                    "skill_name": skill.name,
                    "category": skill.category,
                    "current_level": current_level,
                    "target_level": next_level,
                    "prerequisites_met": prereqs_met,
                    "priority": current_idx  # lower = more urgent (further from expert)
                })

        # Sort: unmet prerequisites last, then by urgency
        recommendations.sort(key=lambda r: (not r["prerequisites_met"], r["priority"]))

        # Highlight skills with declining or no recent practice
        declining = []
        for r in recommendations:
            row = conn.execute(
                "SELECT trend, last_practiced FROM skill_assessments WHERE student_id=? AND skill_id=?",
                (student_id, r["skill_id"])
            ).fetchone()
            if row and row["trend"] == "declining":
                declining.append(r["skill_id"])

        return {
            "student_id": student_id,
            "goal": goal,
            "target_categories": target_categories,
            "recommendations": recommendations[:10],
            "needs_practice": declining[:5],
            "total_skills_in_path": len(recommendations)
        }


# ─────────────────────────────────────────────────────────────────────────────
# Goals
# ─────────────────────────────────────────────────────────────────────────────

def set_goal(student_id: str, skill_id: str, target_level: str,
             target_date: Optional[str] = None, notes: str = "") -> SkillGoal:
    skill = get_skill(skill_id)
    if not skill:
        raise ValueError(f"Skill {skill_id} not found")
    if target_level not in LEVELS:
        raise ValueError(f"Invalid level: {target_level}. Choose from {LEVELS}")
    goal = SkillGoal(id=_uid(), student_id=student_id, skill_id=skill_id,
                     target_level=target_level, target_date=target_date, notes=notes)
    with _conn() as conn:
        conn.execute(
            "INSERT INTO skill_goals VALUES (?,?,?,?,?,?,?,?)",
            (goal.id, goal.student_id, goal.skill_id, goal.target_level,
             goal.target_date, goal.notes, goal.status, goal.created_at)
        )
    return goal


def check_goals(student_id: str) -> list[dict]:
    """Check progress toward all active goals and auto-complete achieved ones."""
    with _conn() as conn:
        goals = conn.execute(
            "SELECT * FROM skill_goals WHERE student_id=? AND status='active'",
            (student_id,)
        ).fetchall()
        results = []
        for g in goals:
            g = dict(g)
            assessment_row = conn.execute(
                "SELECT level, score FROM skill_assessments WHERE student_id=? AND skill_id=?",
                (student_id, g["skill_id"])
            ).fetchone()
            current_level = assessment_row["level"] if assessment_row else "novice"
            current_idx = LEVELS.index(current_level)
            target_idx = LEVELS.index(g["target_level"])
            achieved = current_idx >= target_idx
            if achieved:
                conn.execute(
                    "UPDATE skill_goals SET status='achieved' WHERE id=?", (g["id"],)
                )
                g["status"] = "achieved"
            skill = get_skill(g["skill_id"])
            results.append({
                "goal_id": g["id"],
                "skill": skill.name if skill else g["skill_id"],
                "target_level": g["target_level"],
                "current_level": current_level,
                "achieved": achieved,
                "progress_steps": max(0, target_idx - current_idx),
                "target_date": g["target_date"]
            })
        return results


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
        description="BlackRoad Education Skill Tracker",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  skill_tracker.py create-skill "Python" python "Core programming language"
  skill_tracker.py track student-1 <skill_id> project "Django App" --score 85
  skill_tracker.py assess student-1 <skill_id>
  skill_tracker.py skill-map student-1
  skill_tracker.py portfolio student-1 --format text
  skill_tracker.py recommend student-1 ml
  skill_tracker.py set-goal student-1 <skill_id> advanced --date 2026-06-01
  skill_tracker.py check-goals student-1
        """
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    # create-skill
    p = sub.add_parser("create-skill")
    p.add_argument("name")
    p.add_argument("category")
    p.add_argument("description", nargs="?", default="")
    p.add_argument("--prereqs", default="", help="Comma-separated skill IDs")

    # list-skills
    p = sub.add_parser("list-skills")
    p.add_argument("--category", default=None)

    # track
    p = sub.add_parser("track")
    p.add_argument("student_id")
    p.add_argument("skill_id")
    p.add_argument("type", choices=list(EVIDENCE_WEIGHTS.keys()))
    p.add_argument("title")
    p.add_argument("--description", default="")
    p.add_argument("--score", type=float, default=None)
    p.add_argument("--source-id", default=None)
    p.add_argument("--verified", action="store_true")

    # assess
    p = sub.add_parser("assess")
    p.add_argument("student_id")
    p.add_argument("skill_id")

    # skill-map
    p = sub.add_parser("skill-map")
    p.add_argument("student_id")

    # portfolio
    p = sub.add_parser("portfolio")
    p.add_argument("student_id")
    p.add_argument("--format", default="json", choices=["json", "text"])

    # recommend
    p = sub.add_parser("recommend")
    p.add_argument("student_id")
    p.add_argument("goal")

    # set-goal
    p = sub.add_parser("set-goal")
    p.add_argument("student_id")
    p.add_argument("skill_id")
    p.add_argument("target_level", choices=LEVELS)
    p.add_argument("--date", default=None, dest="target_date")
    p.add_argument("--notes", default="")

    # check-goals
    p = sub.add_parser("check-goals")
    p.add_argument("student_id")

    args = parser.parse_args()
    init_db()

    if args.cmd == "create-skill":
        prereqs = [p.strip() for p in args.prereqs.split(",") if p.strip()] if args.prereqs else []
        _print_json(create_skill(args.name, args.category, args.description, prereqs))
    elif args.cmd == "list-skills":
        _print_json([asdict(s) for s in list_skills(args.category)])
    elif args.cmd == "track":
        ev = track_skill(args.student_id, args.skill_id, args.type, args.title,
                         args.description, args.score, args.source_id, args.verified)
        _print_json(ev)
    elif args.cmd == "assess":
        _print_json(assess_level(args.student_id, args.skill_id))
    elif args.cmd == "skill-map":
        _print_json(get_skill_map(args.student_id))
    elif args.cmd == "portfolio":
        if args.format == "text":
            print(export_portfolio(args.student_id, "text"))
        else:
            print(export_portfolio(args.student_id, "json"))
    elif args.cmd == "recommend":
        _print_json(recommend_next(args.student_id, args.goal))
    elif args.cmd == "set-goal":
        _print_json(set_goal(args.student_id, args.skill_id, args.target_level,
                             args.target_date, args.notes))
    elif args.cmd == "check-goals":
        _print_json(check_goals(args.student_id))


if __name__ == "__main__":
    cli_main()
