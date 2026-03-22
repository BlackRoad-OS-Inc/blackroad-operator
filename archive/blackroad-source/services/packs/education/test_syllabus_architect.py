import pytest

from agents.syllabus_architect import generate_syllabus, map_objectives_to_assessments


def test_generate_syllabus_links_modules_to_objectives():
    goals = {
        "course_id": "test-course",
        "title": "Test Course",
        "objectives": [
            {"id": "obj-1", "text": "Understand basics."},
            {"id": "obj-2", "text": "Apply concepts."},
        ],
    }

    syllabus = generate_syllabus(goals, {"max_modules": 2})
    assert syllabus["modules"], "Modules should not be empty"

    objective_ids = {obj["id"] for obj in syllabus["objectives"]}
    for module in syllabus["modules"]:
        assert set(module["objectives"]).issubset(objective_ids)


def test_map_objectives_to_assessments_aligns_ids():
    objectives = [
        {"id": "obj-1", "text": "Goal 1"},
        {"id": "obj-2", "text": "Goal 2"},
    ]

    assessments = map_objectives_to_assessments(objectives)
    assert assessments, "Assessments should be generated"
    for assessment in assessments:
        assert assessment["objective_id"] in {obj["id"] for obj in objectives}
        assert assessment["weight"] > 0
