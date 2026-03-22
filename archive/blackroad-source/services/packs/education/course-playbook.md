# 📘 Course Playbook Template

## Purpose
This playbook helps you convert existing educational content (books, docs, tutorials) into structured BlackRoad OS courses.

## Step 1: Content Analysis

### Source Material
- **Title:** [Original title]
- **Type:** [Book / Documentation / Tutorial Series / Video Course]
- **URL/Reference:** [Link or citation]
- **Target Audience:** [Who is this for?]
- **Estimated Hours:** [How long does it take?]

### Learning Goals
What should learners be able to DO after completing this?
1. [Outcome 1]
2. [Outcome 2]
3. [Outcome 3]

## Step 2: Course Structure

### Prerequisites
What do learners need to know before starting?
- [ ] Prerequisite 1
- [ ] Prerequisite 2

### Module Breakdown
Divide content into logical modules (major topics/chapters):

#### Module 1: [Title]
- **Lessons:**
  - Lesson 1.1: [Topic]
  - Lesson 1.2: [Topic]
  - Lesson 1.3: [Topic]
- **Activities:**
  - Quiz on fundamentals
  - Practice exercise
- **Assessment:** Module exam or project

#### Module 2: [Title]
- **Lessons:** [...]
- **Activities:** [...]
- **Assessment:** [...]

## Step 3: Activity Design

For each module, design activities:

### Quiz Activities
- **When:** After conceptual lessons
- **Format:** Multiple choice + short answer
- **Purpose:** Check understanding of key concepts

### Project Activities
- **When:** End of module or course
- **Format:** Build something real
- **Purpose:** Apply concepts to realistic scenarios

### Reflection Activities
- **When:** After major milestones
- **Format:** Written reflection
- **Purpose:** Build metacognition and self-awareness

### Lab Activities
- **When:** For hands-on skills
- **Format:** Step-by-step guided practice
- **Purpose:** Build muscle memory and confidence

## Step 4: Assessment Strategy

### Formative Assessment
How will you check understanding during learning?
- Embedded quizzes
- Practice exercises with feedback
- Self-checks

### Summative Assessment
How will you evaluate final mastery?
- Module assessments
- Final project
- Comprehensive exam
- Portfolio

## Step 5: Agent Integration

### Which agents should support this course?
- [ ] Explainer Tutor (for concept clarification)
- [ ] Socratic Coach (for deeper thinking)
- [ ] Grader Assistant (for project feedback)

### Agent Boundaries
What can agents do vs. what needs human review?
- **Agent auto-feedback:** [List scenarios]
- **Human review required:** [List scenarios]

## Step 6: Rubric Development

### Create rubrics for:
- [ ] Quiz scoring (automated)
- [ ] Project evaluation (analytic rubric)
- [ ] Participation/reflection (checklist)

Use templates in `/templates/rubric-*.template.json`

## Step 7: Implementation

### 1. Create Course JSON
File: `courses/[course-id].course.json`
- Use schema: `schemas/course.schema.json`
- Define modules, outcomes, prerequisites

### 2. Create Lesson JSONs
Files: `courses/lessons/[lesson-id].lesson.json`
- Use schema: `schemas/lesson.schema.json`
- Write content in markdown or reference external resources

### 3. Create Activity JSONs
Files: `courses/activities/[activity-id].activity.json`
- Use templates from `/templates/`
- Link to appropriate rubrics

### 4. Create Rubrics
Files: `courses/rubrics/[rubric-id].rubric.json`
- Use schema: `schemas/rubric.schema.json`
- Mark agent-automatable where appropriate

### 5. Test the Course
Run validation tests:
```bash
npm test -- --course [course-id]
```

## Step 8: Metadata & Compliance

### Is this a required/compliance course?
If yes, add to course metadata:
```json
{
  "metadata": {
    "complianceCategory": "security-training",
    "archiveRequired": true,
    "certificateRequired": true
  }
}
```

Mark in code:
```javascript
// REQUIRED TRAINING FLOW – COMPLETION MUST BE AUDITABLE
```

### Archive Integration
Ensure completion triggers archive flow for audit trail.

## Step 9: Launch Checklist

Before publishing:
- [ ] All schemas validate
- [ ] Progress state transitions tested
- [ ] Agent configs validated
- [ ] Integration points configured
- [ ] Example learner journey tested end-to-end
- [ ] Compliance requirements met (if applicable)
- [ ] Documentation updated
- [ ] Stakeholders reviewed

## Example Courses

See `/examples/` for reference implementations:
- `example-intro-to-coding/` - Beginner programming course
- `example-compliance-training/` - Required training with audit trail
- `example-advanced-topics/` - Expert-level course with projects
