# 🎓 Education Pack Architecture

## System Overview

The Education Pack is a **content definition layer** for BlackRoad OS. It provides:
- **Schemas** - What learning content looks like
- **Flows** - How learning journeys work
- **Templates** - Starting points for content creators
- **Agents** - AI support configurations
- **Tests** - Validation and safety checks

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Content Layer                        │
│  (Courses, Lessons, Activities created by educators)    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Education Pack (THIS REPO)                 │
│  ┌─────────────┬──────────────┬─────────────────────┐  │
│  │  Schemas    │   Flows      │   Agent Configs     │  │
│  │  (What)     │   (How)      │   (Who helps)       │  │
│  └─────────────┴──────────────┴─────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              blackroad-os-core                          │
│  • Flow execution engine                                │
│  • State management & persistence                       │
│  • Agent runtime & coordination                         │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│ blackroad-os-web │    │  Integrations    │
│  • UI rendering  │    │  • Prism Console │
│  • Interactions  │    │  • Archive       │
│  • Progress viz  │    │  • Other Packs   │
└──────────────────┘    └──────────────────┘
```

## Component Architecture

### Schemas (Content Models)

**Purpose:** Define the structure and validation rules for all educational content.

**Dependencies:** None (pure JSON Schema)

**Used by:**
- Content creators (when building courses)
- Core (when validating content)
- Tests (when validating instances)

**Key schemas:**
- `course.schema.json` - Top-level course structure
- `lesson.schema.json` - Individual lesson format
- `activity.schema.json` - Interactive activities
- `assessment.schema.json` - Formal evaluations
- `rubric.schema.json` - Grading criteria
- `progress.schema.json` - Learner state tracking
- `tutor-agent.schema.json` - Agent configurations
- `flow.schema.json` - Flow definitions

### Flows (Journey Logic)

**Purpose:** Define the step-by-step logic for learning journeys.

**Dependencies:** Schemas (for data validation)

**Executed by:** `blackroad-os-core` flow engine

**Key flows:**
1. **start-course** - Enrollment and initialization
   - Check prerequisites
   - Initialize progress records
   - Notify integrations
   
2. **resume-learning** - Return to last position
   - Find last accessed item
   - Determine next step
   - Update timestamps
   
3. **review-and-revise** - Mastery preparation
   - Identify completed items
   - Filter by high scores
   - Present review options
   
4. **complete-assessment** - Grading and feedback
   - Validate submission
   - Auto-grade (for objective questions)
   - Trigger agent feedback
   - Handle retries
   
5. **archive-completion** - Compliance recording
   - Gather completion data
   - Create archive record
   - Issue certificates
   - Update metadata

### Templates (Starter Content)

**Purpose:** Provide high-quality starting points for content creation.

**Dependencies:** Must validate against schemas

**Used by:** Content creators when building courses

**Categories:**
- **Lessons** - Tutorial, lab formats
- **Activities** - Quiz, project, reflection
- **Rubrics** - Project, quiz, reflection, participation
- **Playbook** - Complete course creation guide

### Agents (AI Support)

**Purpose:** Configure AI tutors and coaches with proper boundaries.

**Dependencies:** `tutor-agent.schema.json`

**Managed by:** `blackroad-os-core` agent runtime

**Roles:**
1. **explainer-tutor** - Concept clarification
   - Provides clear explanations
   - Uses examples and analogies
   - Gives inline hints
   
2. **socratic-coach** - Critical thinking
   - Asks strategic questions
   - Never gives direct answers
   - Builds metacognition
   
3. **grader-assistant** - Evaluation support
   - Uses rubrics for grading
   - Provides structured feedback
   - Requires human approval

**Guardrails (enforced on all agents):**
- 🚫 No PII access
- 🧍‍♀️ Cannot pass learners without rubric
- 💬 Must provide next steps
- 📊 Only access progress/performance data

### Tests (Quality Assurance)

**Purpose:** Validate content, state logic, and agent configs.

**Dependencies:** AJV (JSON Schema validator)

**Three test suites:**

1. **Schema Validation (22 tests)**
   - All schemas are valid
   - All templates validate
   - All examples validate
   
2. **Progress States (15 tests)**
   - Valid transitions allowed
   - Invalid transitions blocked
   - Transition rules complete
   
3. **Agent Config (19 tests)**
   - All agents validate
   - Guardrails enforced
   - Safety requirements met

## Data Flow

### 1. Course Creation
```
Educator → Creates course.json
         → Validates against course.schema.json
         → Creates lessons, activities, rubrics
         → Validates all content
         → Publishes to Education Pack
```

### 2. Learning Journey
```
Learner → Enrolls in course (start-course flow)
        → Core creates progress records
        → Learner accesses lessons (UI via Core)
        → Completes activities
        → Core updates progress state
        → Agents provide feedback
        → Progress shown in Prism Console
```

### 3. Completion & Compliance
```
Learner → Completes final assessment
        → complete-assessment flow runs
        → Grading happens (auto + agent assist)
        → If passing: state → completed
        → If compliance course: archive-completion flow
        → Archive creates immutable record
        → Certificate issued
        → Prism Console updated
```

## State Machine

### Progress States
```
┌─────────────┐
│ not-started │ ← Enrolled but haven't started
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ in-progress │ ← Actively learning
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  completed  │ ← Met basic requirements
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   mastered  │ ← Exceptional understanding
└─────────────┘
```

**Validation Rules:**
- No skipping states
- All transitions logged
- Mastery is permanent in history
- Retry allowed from completed → in-progress

## Integration Architecture

### Prism Console Integration
```
Education Pack → Events → Prism Console
               ↓
         course-started
         lesson-completed
         assessment-completed
         mastery-achieved
               ↓
         Prism Console → Dashboard UI
```

### Archive Integration
```
complete-assessment flow → Compliance check
                         ↓
                    archive-completion flow
                         ↓
                    Archive Service
                         ↓
                    Immutable record + certificate
                         ↓
                    Archive reference stored in progress
```

### Pack Integration
```
Finance Pack → Registers course with Education Pack
             ↓
        Course ID: "course:finance-101"
        Pack ID: "blackroad-os-pack-finance"
             ↓
        Progress webhooks to Finance Pack
        Finance tools accessible in course
```

## Security Architecture

### Agent Access Control
```
Agent Config → Guardrails
            ↓
    allowedPacks: [...]
    dataAccessRestrictions: {
      noPII: true,
      onlyProgressData: true
    }
            ↓
    Core enforces at runtime
```

### Data Privacy
- Learner IDs (not PII) in all records
- Progress data separate from personal data
- Archive uses references, not embedded PII
- Compliance records tagged for retention

### Audit Trail
```
State Change → Progress record
            ↓
      If compliance-tagged
            ↓
      Archive record
            ↓
      Immutable + timestamped
```

## Extensibility Points

### 1. New Content Types
Add to schemas:
```javascript
// Create new schema
schemas/new-type.schema.json

// Add to tests
tests/schema-validation.test.js

// Create template
templates/new-type.template.json
```

### 2. New Progress States
Update:
```javascript
// Add state to transition rules
flows/state-transitions.json

// Add tests
tests/progress-states.test.js
```

### 3. New Agent Roles
Create:
```javascript
// New agent config
agents/new-agent.json

// Must follow tutor-agent.schema.json
// Tests run automatically
```

### 4. New Flows
Add:
```javascript
// Flow definition
flows/new-flow.flow.json

// Validates against flow.schema.json
// Add test case
```

## Performance Considerations

### Schema Compilation
- Schemas cached in index.js
- Separate AJV instances to avoid $id conflicts
- Lazy loading for on-demand access

### Flow Execution
- Executed by Core, not Education Pack
- Education Pack only defines structure
- Core handles state persistence

### Test Execution
- Run in sequence (schema → state → agent)
- Each suite independent
- Exit on first failure for fast feedback

## Deployment Model

Education Pack is:
- **Configuration, not code** - Mostly JSON files
- **Version controlled** - Git tracks all changes
- **NPM packaged** - Can be imported as dependency
- **Schema-driven** - Self-validating content

## Future Architecture Considerations

### Potential Additions
- Content versioning system
- Internationalization (i18n) support
- Accessibility metadata
- Analytics schema
- Gamification elements

### Integration Expansion
- LTI (Learning Tools Interoperability) support
- SCORM package export
- xAPI (Tin Can) event tracking
- Badge/credential systems

### Scale Considerations
- Content CDN for media
- Progress data sharding
- Archive indexing strategies
- Agent load balancing

## Design Philosophy

**Education Pack is:**
- ✅ Declarative (what, not how)
- ✅ Schema-first (validation built-in)
- ✅ Modular (compose courses from reusable parts)
- ✅ Safe (guardrails and validation)
- ✅ Auditable (all changes tracked)

**Education Pack is NOT:**
- ❌ An execution engine (that's Core)
- ❌ A UI framework (that's Web)
- ❌ A database (that's Core + persistence)
- ❌ A complete LMS (it's a Pack for BlackRoad OS)

This architecture keeps Education Pack focused on its core responsibility: **defining what learning looks like in BlackRoad OS**.
