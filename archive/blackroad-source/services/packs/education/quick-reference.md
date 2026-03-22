# 📚 Quick Reference Guide

## Common Tasks

### Create a New Course

1. **Copy course template structure:**
```bash
mkdir -p courses/my-course/{lessons,activities,rubrics}
```

2. **Create course definition:**
```bash
# Use examples/intro-to-blackroad-os/course.json as reference
# Schema: schemas/course.schema.json
```

3. **Define modules and outcomes:**
```json
{
  "id": "course:my-course",
  "title": "My Course Title",
  "version": "1.0.0",
  "prerequisites": [...],
  "outcomes": ["What learners will achieve"],
  "modules": [...]
}
```

4. **Validate:**
```bash
npm run test:schemas
```

### Create a Lesson

1. **Choose lesson type:** `lecture`, `tutorial`, `lab`, `project`, `reflection`, `discussion`

2. **Use template as starting point:**
```bash
cp templates/lesson-tutorial.template.json courses/my-course/lessons/my-lesson.json
```

3. **Fill in content:**
- Update `id`, `title`, `description`
- Write content in markdown or HTML
- Link to activities
- Define learning objectives

4. **Validate against schema:**
```bash
npm run test:schemas
```

### Create an Activity

1. **Choose activity type:** `quiz`, `exercise`, `project`, `reflection`, `discussion`, `lab`

2. **Use template:**
```bash
# For quiz:
cp templates/activity-quiz.template.json courses/my-course/activities/my-quiz.json

# For project:
cp templates/activity-project.template.json courses/my-course/activities/my-project.json

# For reflection:
cp templates/activity-reflection.template.json courses/my-course/activities/my-reflection.json
```

3. **Configure:**
- Set retry options (`allowRetry`, `maxAttempts`)
- Set passing score
- Link to appropriate rubric
- Define content specific to activity type

### Create a Rubric

1. **Choose rubric type:** `holistic`, `analytic`, `checklist`

2. **Use template:**
```bash
# For project (analytic):
cp templates/rubric-project.template.json courses/my-course/rubrics/my-rubric.json

# For quiz (holistic):
cp templates/rubric-quiz.template.json courses/my-course/rubrics/quiz-rubric.json

# For reflection (checklist):
cp templates/rubric-reflection.template.json courses/my-course/rubrics/reflection-rubric.json
```

3. **Define criteria:**
- Name each criterion
- Describe performance levels
- Set weights (for analytic rubrics)
- Mark if agent-automatable

4. **Configure guardrails:**
```json
{
  "agentAutomatable": true,  // Can agents grade with this?
  "requiresHumanReview": false  // Need human approval?
}
```

### Configure an Agent

1. **Choose agent role:** `explainer`, `socratic-coach`, `grader-assistant`, `mentor`, `facilitator`

2. **Use existing agent as template:**
```bash
cp agents/explainer-tutor.json agents/my-custom-agent.json
```

3. **Configure capabilities:**
```json
{
  "capabilities": {
    "canAutoFeedback": true,
    "canAutoGrade": false,
    "feedbackPatterns": ["inline-hints", "summary-feedback"],
    "supportedContentTypes": ["lesson", "activity"]
  }
}
```

4. **Set guardrails (MANDATORY):**
```json
{
  "guardrails": {
    "requiresHumanReview": false,
    "cannotPass": true,  // ALWAYS true
    "allowedPacks": ["blackroad-os-pack-education"],
    "dataAccessRestrictions": {
      "noPII": true,  // ALWAYS true
      "onlyProgressData": true
    },
    "mustProvideNextSteps": true  // ALWAYS true
  }
}
```

5. **Validate:**
```bash
npm run test:agents
```

## Schema Quick Reference

### Course Schema
```json
{
  "id": "course:unique-id",
  "title": "Course Title",
  "version": "1.0.0",
  "prerequisites": [...],
  "outcomes": [...],
  "modules": [...]
}
```

### Lesson Schema
```json
{
  "id": "lesson:unique-id",
  "title": "Lesson Title",
  "type": "tutorial|lecture|lab|project|reflection|discussion",
  "content": {
    "format": "markdown|html|interactive|video|mixed",
    "body": "Content here..."
  },
  "activities": ["activity:id1", "activity:id2"]
}
```

### Activity Schema
```json
{
  "id": "activity:unique-id",
  "title": "Activity Title",
  "type": "quiz|exercise|project|reflection|discussion|lab",
  "rubricId": "rubric:rubric-id",
  "allowRetry": true,
  "passingScore": 70,
  "content": {...}
}
```

### Progress Schema
```json
{
  "learnerId": "learner-id",
  "itemId": "course:course-id",
  "itemType": "course|module|lesson|activity|assessment",
  "state": "not-started|in-progress|completed|mastered",
  "currentScore": 85,
  "attemptCount": 2
}
```

## Progress State Rules

### Valid Transitions
- `not-started` → `in-progress` (start)
- `in-progress` → `completed` (complete)
- `completed` → `mastered` (achieve mastery)
- `completed` → `in-progress` (retry)
- `mastered` → `in-progress` (review)
- `in-progress` → `not-started` (reset)

### Invalid Transitions (Blocked)
- ❌ `not-started` → `completed` (no skipping)
- ❌ `not-started` → `mastered` (no skipping)
- ❌ `in-progress` → `mastered` (no skipping)
- ❌ `completed` → `not-started` (no un-completing)
- ❌ `mastered` → `not-started` (mastery is permanent)
- ❌ `mastered` → `completed` (no downgrade)

## Emoji Legend Quick Reference

| Emoji | Meaning |
|-------|---------|
| 💼 | pack / vertical |
| 🎓 | learning / courses |
| 📚 | curriculum / modules |
| 🧬 | schemas / progress states |
| 🤖 | tutor/coach agents |
| 📊 | dashboards / progress |
| 🧾 | certificates / records |
| ✅ | rubrics / evaluation |
| 🔁 | flows / state machines |
| 💬 | feedback patterns |
| 🧍‍♀️ | human review required |
| 🚫 | forbidden / restricted |

## File Naming Conventions

- **Schemas:** `{type}.schema.json` (e.g., `course.schema.json`)
- **Flows:** `{flow-name}.flow.json` (e.g., `start-course.flow.json`)
- **Templates:** `{type}-{variant}.template.json` (e.g., `lesson-tutorial.template.json`)
- **Agents:** `{agent-name}.json` (e.g., `explainer-tutor.json`)
- **Course content:** `{item-name}.{type}.json` (e.g., `philosophy-intro.lesson.json`)

## ID Patterns

- **Courses:** `course:kebab-case-name`
- **Modules:** `module:kebab-case-name`
- **Lessons:** `lesson:kebab-case-name`
- **Activities:** `activity:kebab-case-name`
- **Assessments:** `assessment:kebab-case-name`
- **Rubrics:** `rubric:kebab-case-name`
- **Agents:** `agent:kebab-case-name`
- **Flows:** `flow:education:kebab-case-name`

## Required Training Flows

For compliance-critical courses, add to course metadata:

```json
{
  "metadata": {
    "complianceCategory": "security-training",
    "archiveRequired": true
  }
}
```

And add comment in related code:
```javascript
// REQUIRED TRAINING FLOW – COMPLETION MUST BE AUDITABLE
```

## Integration Endpoints

### Prism Console
- Events: `course-started`, `lesson-completed`, `mastery-achieved`
- Dashboard data: Active courses, progress %, recent activity

### Archive
- Triggers: Course completion (if compliance-tagged), mastery achieved
- Data: Learner ID, item ID, timestamp, scores, certificate data

### Other Packs
- Course registration pattern
- Progress webhooks
- Data access configuration

## Common Validation Errors

### "must have required property"
Missing a required field in your content object. Check schema for required properties.

### "must match pattern"
ID doesn't match the expected pattern. Use format: `type:kebab-case-name`

### "must be equal to constant"
You're using a value that should be from a specific enum. Check schema for allowed values.

### "must be >= minimum"
Numeric value is too low. Check schema for minimum constraints.

## Best Practices

### Content Creation
- ✅ Start with templates
- ✅ Validate early and often
- ✅ Define clear learning outcomes
- ✅ Test state transitions
- ✅ Link activities to rubrics

### Agent Configuration
- ✅ ALWAYS set `cannotPass: true`
- ✅ ALWAYS set `noPII: true`
- ✅ ALWAYS set `mustProvideNextSteps: true`
- ✅ Be explicit about what agents can/cannot do
- ✅ Require human review for high-stakes decisions

### Testing
- ✅ Run tests before committing
- ✅ Validate all new content
- ✅ Test state transitions for new flows
- ✅ Verify agent guardrails

## Getting Help

- 📖 Read `/docs/` for detailed documentation
- 📚 Check `/examples/` for reference implementations
- 📓 Review `/templates/` for starting points
- 🧪 Run tests to validate your work
- 🤔 See `/docs/design-decisions.md` for rationale behind choices
