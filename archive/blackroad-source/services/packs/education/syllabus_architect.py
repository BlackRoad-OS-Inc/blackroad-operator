"""Syllabus Architect agent implementation.

This module provides simple utilities to generate a syllabus outline and map
learning objectives to assessments. The output structures are intentionally
lightweight so they can be adapted by upstream systems.
"""
from __future__ import annotations

from typing import Dict, List


def _normalize_objectives(goals: Dict) -> List[Dict]:
    """Create a consistent list of objectives from provided goals.

    Args:
        goals: A dictionary that may include an "objectives" key or a set of
            learning goals represented as strings.

    Returns:
        A list of objective dictionaries, each with an id and text field.
    """

    objective_entries = goals.get("objectives") or goals.get("learning_goals")
    normalized: List[Dict] = []

    if isinstance(objective_entries, list):
        for index, objective in enumerate(objective_entries, start=1):
            if isinstance(objective, dict):
                objective_id = objective.get("id") or f"obj-{index}"
                normalized.append({"id": objective_id, "text": objective.get("text", "")})
            else:
                normalized.append({"id": f"obj-{index}", "text": str(objective)})

    if not normalized:
        normalized.append({
            "id": "obj-1",
            "text": goals.get("primary_outcome", "Define clear learning objectives."),
        })

    return normalized


def generate_syllabus(goals: Dict, constraints: Dict | None = None) -> Dict:
    """Generate a lightweight syllabus outline.

    Args:
        goals: Goal definitions including objectives or learning goals.
        constraints: Optional constraints such as maximum modules.

    Returns:
        A syllabus dictionary containing objectives and modules.
    """

    constraints = constraints or {}
    objectives = _normalize_objectives(goals)
    max_modules = constraints.get("max_modules") or len(objectives)

    modules = []
    for index, objective in enumerate(objectives[:max_modules], start=1):
        modules.append({
            "id": f"module-{index}",
            "title": objective.get("text", "Learning Module"),
            "objectives": [objective["id"]],
        })

    return {
        "id": goals.get("course_id", "course-draft"),
        "title": goals.get("title", "Draft Course"),
        "objectives": objectives,
        "modules": modules,
        "constraints": constraints,
    }


def map_objectives_to_assessments(objectives: List[Dict]) -> List[Dict]:
    """Create assessment blueprints aligned to objectives.

    Args:
        objectives: A list of objective dictionaries with ids.

    Returns:
        A list of assessments mapping back to the provided objectives.
    """

    assessments: List[Dict] = []
    for index, objective in enumerate(objectives, start=1):
        objective_id = objective.get("id", f"obj-{index}")
        assessments.append({
            "id": f"assessment-{index}",
            "objective_id": objective_id,
            "type": "quiz" if index % 2 else "project",
            "weight": round(1 / max(len(objectives), 1), 2),
        })
    return assessments


__all__ = ["generate_syllabus", "map_objectives_to_assessments"]
