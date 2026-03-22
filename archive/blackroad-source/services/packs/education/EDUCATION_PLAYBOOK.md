# Education Pack Playbook

## What the Education Pack is
The Education & Learning Pack provides baseline building blocks for curriculum
planning, assessment design, and learner success monitoring. It is designed to
slot into any BlackRoad OS deployment as a modular starter kit for education
experiences.

## When to use it
- Schools and universities launching or refreshing programs
- Bootcamps and accelerated upskilling initiatives
- Corporate L&D teams building internal academies

## Core agents and what they do
- **Syllabus Architect (edu-syllabus-architect-01):** Converts goals and
  constraints into course outlines and aligned modules.
- **Assessment Designer (edu-assessment-designer-01):** Generates question banks
  and rubrics tied to learning objectives.
- **Student Success Bot (edu-student-success-bot-01):** Monitors learner signals
  to flag risk and recommend timely interventions.

## How to integrate with the rest of BlackRoad OS
- **blackroad-os-api:** Use API endpoints to invoke pack agents for syllabus
  generation, assessment creation, and risk detection. The API layer can route
  workflow invocations (e.g., `course_launch`) and return structured payloads
  to LMS adapters or internal tools.
- **blackroad-os-prism-console:** Surface dashboards for learner journeys,
  risk alerts, and curriculum alignment. Wire Student Success Bot outputs into
  Prism to visualize retention and success KPIs.

## Example workflow usage
1. Send course goals and constraints to `course_launch` workflow to assemble a
   syllabus, assessments, and success monitoring plan.
2. Periodically run `continuous_improvement` with updated learner outcomes to
   iterate on objectives and assessments.
